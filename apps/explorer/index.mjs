// TODO: Pathbar transforms into input element when clicked
// TODO: image thumbnails
// TODO: Drag and drop in directory and other apps
// TODO: Better touch handling
// TODO: escape when there's a mask
// TODO: Download multiple files as zip through Compress API?
// TODO: context menu could make sense to begin here

import renderDirectory from "./render_directory.mjs";
import {
  applyStyle,
  disableButton,
  enableHighlightedButton,
  formatSize,
  showError,
  pathJoin,
  homeDirSvg,
  newDirectorySvg,
  linkAbortControllerToSignal,
  showAppMessage,
  renameSvg,
  cutSvg,
  pasteSvg,
} from "./utils.mjs";
import {
  askUserForUpload,
  askForUserInput,
  spawnConfirmDialog,
} from "./dialogs.mjs";

export function create(args = [], env, abortSignal) {
  return createExplorer("explorer", args, env, abortSignal);
}

export function createFileOpener(args = {}, env, abortSignal) {
  return createExplorer("opener", args, env, abortSignal);
}

export function createFileSaver(args = {}, env, abortSignal) {
  return createExplorer("saver", args, env, abortSignal);
}

/**
 * @param {string} explorerType - Either "explorer", "opener" or "saver".
 * @param {Array.<Object>} args
 * @param {Object} env
 * @param {AbortSignal} abortSignal
 * @returns {Object}
 */
function createExplorer(explorerType, args, env, abortSignal) {
  const { appUtils, filesystem } = env;
  let options = {};
  for (const opt of args) {
    if (opt.type === "options") {
      options = opt;
    }
  }

  const {
    title,
    baseDirectory = "/userdata/",

    // NOTE: only used for explorerType === "saver"
    savedFileName = "new_file.txt",
    savedFileData,

    // NOTE: only pertinent for explorerType === "opener"
    allowMultipleSelections = true,

    // NOTE: both for explorerType `"saver"` and `"opener"`
    confirmValue = explorerType === "opener" ? "Open" : "Save",
  } = options;

  /**
   * HTML Wrapper for the whole explorer
   * @type {HTMLElement}
   */
  const explorerContainer = document.createElement("div");
  applyStyle(explorerContainer, {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "var(--window-content-bg)",
  });

  /** `AbortController` linked to the currently-displayed directory. */
  let currentDirectoryAbortController = new AbortController();
  linkAbortControllerToSignal(currentDirectoryAbortController, abortSignal);

  /**
   * Currently displayed path.
   * @type {string}
   */
  let currentPath = baseDirectory.endsWith("/")
    ? baseDirectory
    : baseDirectory + "/";

  /**
   * Flex container of the various components of the file explorer.
   * @type {HTMLElement}
   */
  const explorerElt = createFileExplorerElement();

  if (title) {
    explorerElt.appendChild(constructTitleElement(title));
  }

  /**
   * Display the current path and allow navigation by giving on the various
   * sub-parts of the path.
   * @type {HTMLElement}
   */
  let pathBarElt = constructPathBarElement(currentPath, navigateToPath);
  explorerElt.appendChild(pathBarElt);

  /**
   * The "clipboard", basically, allowing to move around files.
   */
  let cuttedSelection = [];

  /**
   * The currently visually-selected items in the directory part.
   */
  let selectedItems = [];

  /**
   * If `true` the application is currently the active one.
   * If `false`, it does not have the focus.
   *
   * Useful to determine if we should be catching keys.
   */
  let isAppActivated = false;

  /**
   * The directory rendering itself is done by another function. This is the
   * component object of the active directory render function.
   */
  let currentDirectoryComponent;

  // Create the toolbar now

  const {
    element: toolsElt,
    enableButton: enableToolButton,
    disableButton: disableToolButton,
  } = appUtils.constructAppHeaderLine([
    ...(explorerType !== "explorer"
      ? [
          {
            name: "undo",
            title: "Exit picker",
            onClick: () => {
              if (explorerType === "saver") {
                env.onSaved(null);
              } else {
                env.onOpen([]);
              }
            },
          },
          { name: "separator" },
        ]
      : []),
    {
      name: "previous",
      height: "1em",
      title: "Parent Directory",
      onClick: () => navigateToParent(),
    },
    {
      name: "home",
      height: "1em",
      title: "Home Directory",
      svg: homeDirSvg,
      onClick: () => navigateToPath("/userdata/"),
    },
    { name: "separator" },
    {
      name: "upload",
      title: "Load Files",
      onClick: onUploadClick,
    },
    {
      name: "download",
      title: "Download file",
      onClick: onDownloadClick,
    },
    { name: "separator" },
    {
      name: "newDir",
      height: "1em",
      title: "New Directory",
      svg: newDirectorySvg,
      onClick: onNewDirClick,
    },
    {
      name: "clear",
      height: "1em",
      title: "Delete item(s)",
      onClick: () => deleteItems(selectedItems),
    },
    {
      name: "rename",
      height: "1em",
      title: "Rename item",
      svg: renameSvg,
      onClick: onRenameClick,
    },
    { name: "separator" },
    {
      name: "cut",
      height: "1em",
      title: "Cut (selection)",
      svg: cutSvg,
      onClick: () => cutItems(selectedItems),
    },
    {
      name: "paste",
      height: "1em",
      title: "Paste",
      svg: pasteSvg,
      onClick: pasteItems,
    },
  ]);
  disableToolButton("paste");
  explorerElt.appendChild(toolsElt);

  /**
   * Central element where the various files and directories will be displayed
   * and messages shown.
   * @type {HTMLElement}
   */
  const directoryZoneElt = document.createElement("div");
  applyStyle(directoryZoneElt, {
    position: "relative",
    flex: "1",
    minHeight: "150px",
    backgroundColor: "var(--window-content-bg)",
    border: "1px solid var(--window-line-color)",
  });

  /**
   * Actual view containing just the directory listing.
   * @type {HTMLElement}
   */
  const currentDirectoryElt = document.createElement("div");
  applyStyle(currentDirectoryElt, {
    overflow: "auto",
    height: "100%",
  });
  directoryZoneElt.appendChild(currentDirectoryElt);
  explorerElt.appendChild(directoryZoneElt);

  /**
   * Optional warning element that shows in yellow below the directory space.
   * @type {HTMLElement}
   */
  const warningElt = document.createElement("div");
  applyStyle(warningElt, {
    padding: "5px",
    backgroundColor: "#efef00",
    marginTop: "-5px",
    color: "#000",
    display: "none",
  });
  warningElt.textContent =
    "This directory is read-only, you cannot add nor remove files from it.";
  explorerElt.appendChild(warningElt);

  /**
   * Element below directories that gives information on what is selected and
   * show buttons.
   * @type {HTMLElement}
   */
  const explorerStatusBarElt = document.createElement("div");
  applyStyle(explorerStatusBarElt, {
    display: "flex",
    gap: "5px",
    justifyContent: "space-between",
    alignItems: "center",
  });

  let statusLeftElt;
  if (explorerType === "saver") {
    statusLeftElt = document.createElement("input");
    statusLeftElt.type = "text";
    statusLeftElt.value = savedFileName;
    statusLeftElt.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        validateButton.click();
      }
    };
    applyStyle(statusLeftElt, {
      flex: "1",
      padding: "5px 8px",
      border: "1px solid var(--window-line-color)",
      fontWeight: "bold",
      fontSize: "1.1em",
      color: "var(--app-primary-color)",
    });
  } else {
    statusLeftElt = document.createElement("div");
  }
  explorerStatusBarElt.appendChild(statusLeftElt);

  /**
   * Button used in file-pickers to validate the action.
   * `undefined` for a "regular" explorer.
   * @type {HTMLElement|null}
   */
  let validateButton = null;
  if (explorerType === "opener" || explorerType === "saver") {
    const buttonContainerElt = document.createElement("div");
    applyStyle(buttonContainerElt, {
      display: "flex",
      gap: "5px",
      flexWrap: "wrap",
      justifyContent: "flex-end",
    });
    const cancelButton = document.createElement("button");
    cancelButton.className = "btn";
    cancelButton.textContent = "Cancel";
    applyStyle(cancelButton, {
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    cancelButton.onclick = () => {
      if (explorerType === "saver") {
        env.onSaved(null);
      } else {
        env.onOpen([]);
      }
    };
    validateButton = document.createElement("button");
    validateButton.className = "btn";
    validateButton.textContent = confirmValue;
    validateButton.onclick = async () => {
      if (explorerType === "opener") {
        env.onOpen(selectedItems.map((x) => x.path));
      } else if (!statusLeftElt.value) {
        showError(directoryZoneElt, "No file name entered.");
      } else {
        currentDirectoryComponent?.onDeactivate();
        const maskContainer = addBlockingMask(explorerElt);
        try {
          const wantedPath = pathJoin(currentPath, statusLeftElt.value);
          try {
            await filesystem.stat(wantedPath);
            const doIt = await spawnConfirmDialog(
              maskContainer,
              "Are you sure?",
              `You're going to overwrite "${wantedPath}"`,
            );

            if (!doIt) {
              removeBlockingMask(maskContainer, explorerElt);
              currentDirectoryComponent.onActivate();
              return;
            }
          } catch (err) {
            // TODO: check if we're in a no entry error?
          }
          await filesystem.writeFile(wantedPath, savedFileData);
          currentDirectoryComponent?.onActivate();
          removeBlockingMask(maskContainer, explorerElt);
          env.onSaved({ path: wantedPath });
        } catch (err) {
          currentDirectoryComponent?.onActivate();
          removeBlockingMask(maskContainer, explorerElt);
          showError(directoryZoneElt, err.toString());
        }
      }
    };
    applyStyle(validateButton, {
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    disableButton(validateButton);
    buttonContainerElt.appendChild(cancelButton);
    buttonContainerElt.appendChild(validateButton);
    explorerStatusBarElt.appendChild(buttonContainerElt);
  }
  explorerElt.appendChild(explorerStatusBarElt);
  explorerContainer.appendChild(explorerElt);

  navigateToPath(currentPath);

  return {
    element: explorerContainer,
    onActivate: () => {
      isAppActivated = true;
      currentDirectoryComponent?.onActivate();
    },
    onDeactivate: () => {
      isAppActivated = false;
      currentDirectoryComponent?.onDeactivate();
    },
  };

  async function navigateToPath(path, keepScroll) {
    try {
      const normalizedPath = path.endsWith("/") ? path : path + "/";
      const entries = await filesystem.readDir(normalizedPath);
      if (currentDirectoryAbortController.signal.aborted) {
        return;
      }

      currentDirectoryComponent?.onDeactivate();
      currentDirectoryAbortController.abort();
      currentDirectoryAbortController = new AbortController();
      linkAbortControllerToSignal(currentDirectoryAbortController, abortSignal);

      if (isUserDirectory(normalizedPath)) {
        warningElt.style.display = "none";
      } else {
        warningElt.style.display = "block";
      }

      currentPath = normalizedPath;
      selectedItems = [];
      const newPathBarElt = constructPathBarElement(
        normalizedPath,
        navigateToPath,
      );
      pathBarElt.replaceWith(newPathBarElt);
      pathBarElt = newPathBarElt;

      updateButtons(currentPath, selectedItems);

      currentDirectoryComponent = renderDirectory({
        entries,
        path: normalizedPath,
        contextMenuBase: constructContextMenu(),
        callbacks: {
          setUpContextMenu: appUtils.setUpContextMenu,
          navigateTo: navigateToPath,
          escape: onDirectoryEscape,
          deleteItems,
          cutItems,
          pasteItems,
          onSelectionChange: (items) => {
            selectedItems = items;
            updateStatusElement(explorerType, statusLeftElt, items);
            updateButtons(currentPath, selectedItems);
          },
          openFiles: onDirectoryFilesOpen,
        },
        abortSignal: currentDirectoryAbortController.signal,
      });
      if (cuttedSelection.length > 0) {
        currentDirectoryComponent.signalCutAction(cuttedSelection);
      }
      currentDirectoryElt.innerHTML = "";
      currentDirectoryElt.appendChild(currentDirectoryComponent.element);
      if (!keepScroll) {
        currentDirectoryElt.scrollTo(0, 0);
      }
      if (isAppActivated) {
        currentDirectoryComponent.onActivate();
      } else {
        currentDirectoryComponent.onDeactivate();
      }

      filesystem.watch(
        normalizedPath,
        async () => {
          // Refresh
          const toSelect = selectedItems;
          await navigateToPath(currentPath, true);
          currentDirectoryComponent?.selectItems(toSelect);
        },
        currentDirectoryAbortController.signal,
      );
    } catch (err) {
      showError(directoryZoneElt, `Error loading directory: ${err.message}`);
    }
    updateStatusElement(explorerType, statusLeftElt, []);
  }

  function navigateToParent() {
    if (currentPath === "/") {
      return;
    }
    if (currentPath[currentPath.length - 1] === "/") {
      currentPath = currentPath.substring(0, currentPath.length - 1);
    }
    navigateToPath(currentPath.substring(0, currentPath.lastIndexOf("/") + 1));
  }

  async function deleteItems(items) {
    if (items.length === 0) {
      return;
    }
    currentDirectoryComponent?.onDeactivate();
    await performItemsDeletion(
      filesystem,
      items,
      explorerElt,
      directoryZoneElt,
    );
    currentDirectoryComponent?.onActivate();
  }

  function onUploadClick() {
    currentDirectoryComponent?.onDeactivate();
    const maskContainer = addBlockingMask(explorerElt);
    askUserForUpload(filesystem, currentPath).then(
      (items) => {
        currentDirectoryComponent?.onActivate();
        removeBlockingMask(maskContainer, explorerElt);
        if (items.length > 0) {
          if (items.length === 1) {
            showAppMessage(directoryZoneElt, `File uploaded successfully`);
          } else {
            showAppMessage(
              directoryZoneElt,
              `${items.length} files uploaded successfully`,
            );
          }
        }
      },
      (err) => {
        currentDirectoryComponent?.onActivate();
        removeBlockingMask(maskContainer, explorerElt);
        showError(directoryZoneElt, err.message);
      },
    );
  }

  function onDownloadClick() {
    if (selectedItems.length === 0) {
      return;
    }
    currentDirectoryComponent?.onDeactivate();
    const maskContainer = addBlockingMask(explorerElt);
    const { name, path } = selectedItems[0];
    return filesystem.readFile(path, "arraybuffer").then(
      (fileData) => {
        const blob = new Blob([fileData], {
          type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.style.display = "none";
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        currentDirectoryComponent?.onActivate();
        removeBlockingMask(maskContainer, explorerElt);
      },
      (err) => {
        showError(
          directoryZoneElt,
          `Failed to create download: ${err.message}`,
        );
      },
    );
  }

  async function onNewDirClick() {
    currentDirectoryComponent?.onDeactivate();
    await createNewDirectory(
      filesystem,
      currentPath,
      explorerElt,
      directoryZoneElt,
    );
    currentDirectoryComponent?.onActivate();
  }

  async function onRenameClick() {
    if (selectedItems.length === 0) {
      return;
    }
    currentDirectoryComponent?.onDeactivate();
    await renameItem(
      filesystem,
      currentPath,
      selectedItems[0].name,
      selectedItems[0].isDirectory,
      explorerElt,
      directoryZoneElt,
    );
    currentDirectoryComponent?.onActivate();
  }

  function cutItems(cuttedItems) {
    cuttedSelection = [...cuttedItems];
    enableToolButton("paste");
    currentDirectoryComponent?.signalCutAction(cuttedSelection);
  }

  function pasteItems() {
    disableToolButton("paste");
    currentDirectoryComponent?.onDeactivate();
    performMoveOperation(
      filesystem,
      cuttedSelection,
      currentPath,
      directoryZoneElt,
    ).then(
      () => {
        cuttedSelection = [];
        currentDirectoryComponent?.signalCutAction(cuttedSelection);
        currentDirectoryComponent?.onActivate();
      },
      (err) => {
        currentDirectoryComponent?.onActivate();
        if (cuttedSelection.length > 0) {
          enableToolButton("paste");
        }
        showError(directoryZoneElt, `Failed to create paste: ${err.message}`);
      },
    );
  }

  function updateButtons(currentPath, selectedItems) {
    if (explorerType === "saver") {
      if (isUserDirectory(currentPath)) {
        enableHighlightedButton(validateButton);
      } else {
        disableButton(validateButton);
      }
    }
    if (selectedItems.length === 0) {
      disableToolButton("cut");
      disableToolButton("clear");
      disableToolButton("rename");
      disableToolButton("download");
    } else if (selectedItems.length === 1) {
      if (isUserDirectory(currentPath)) {
        enableToolButton("cut");
        enableToolButton("rename");
        enableToolButton("clear");
      } else {
        disableToolButton("cut");
        disableToolButton("rename");
        disableToolButton("clear");
      }
      if (!selectedItems[0].isDirectory) {
        enableToolButton("download");
      } else {
        disableToolButton("download");
      }
    } else {
      if (isUserDirectory(currentPath)) {
        enableToolButton("cut");
        enableToolButton("clear");
      } else {
        disableToolButton("cut");
        disableToolButton("clear");
      }
      disableToolButton("rename");
      disableToolButton("download");
    }

    if (currentPath === "/") {
      disableToolButton("previous");
    } else {
      enableToolButton("previous");
    }

    if (isUserDirectory(currentPath)) {
      if (currentPath === "/userdata/") {
        disableToolButton("home");
      } else {
        enableToolButton("home");
      }
      enableToolButton("newDir");
      enableToolButton("newFile");
      enableToolButton("upload");
    } else {
      enableToolButton("home");
      disableToolButton("newDir");
      disableToolButton("newFile");
      disableToolButton("upload");
    }

    if (explorerType === "opener" && validateButton) {
      if (
        selectedItems.length === 0 ||
        selectedItems.some((x) => x.isDirectory)
      ) {
        disableButton(validateButton);
      } else {
        if (!allowMultipleSelections && selectedItems.length > 1) {
          disableButton(validateButton);
        } else {
          enableHighlightedButton(validateButton);
        }
      }
    }
  }

  function onDirectoryEscape() {
    if (explorerType === "opener") {
      env.onOpen([]);
    } else if (explorerType === "saver") {
      env.onSaved(null);
    } else {
      // refresh
      navigateToPath(currentPath);
    }
  }

  async function onDirectoryFilesOpen(items) {
    switch (explorerType) {
      case "saver": {
        if (items.length > 1) {
          showError(directoryZoneElt, `Choose only one file to replace.`);
          return;
        }
        currentDirectoryComponent?.onDeactivate();
        const maskContainer = addBlockingMask(explorerElt);
        try {
          const doIt = await spawnConfirmDialog(
            maskContainer,
            "Are you sure?",
            `You're going to overwrite "${items[0].name}"`,
          );

          if (!doIt) {
            removeBlockingMask(maskContainer, explorerElt);
            currentDirectoryComponent.onActivate();
            return;
          }
          await filesystem.writeFile(items[0].path, savedFileData);
          currentDirectoryComponent?.onActivate();
          removeBlockingMask(maskContainer, explorerElt);
          env.onSaved({ path: items[0].path });
        } catch (err) {
          currentDirectoryComponent?.onActivate();
          removeBlockingMask(maskContainer, explorerElt);
          showError(directoryZoneElt, err.toString());
        }
        break;
      }

      case "opener": {
        if (
          explorerType === "opener" &&
          !allowMultipleSelections &&
          items.length > 1
        ) {
          showError(directoryZoneElt, `Choose only one file to open.`);
        }
        env.onOpen(items.map((x) => x.path));
        break;
      }

      default: {
        env.open(items.map((x) => x.path));
        break;
      }
    }
  }

  function constructContextMenu() {
    return [
      {
        name: "upload",
        title: "Load Files",
        filter: () => isUserDirectory(currentPath),
        onClick: onUploadClick,
      },
      {
        name: "newDir",
        height: "1.4em",
        title: "New Directory",
        svg: newDirectorySvg,
        filter: () => isUserDirectory(currentPath),
        onClick: onNewDirClick,
      },
      { name: "separator", filter: () => isUserDirectory(currentPath) },
      {
        name: "rename",
        height: "1em",
        title: "Rename selection",
        svg: renameSvg,
        filter: () => selectedItems.length === 1,
        onClick: onRenameClick,
      },
      {
        name: "download",
        title: "Download selection",
        filter: () =>
          selectedItems.length === 1 && !selectedItems[0].isDirectory,
        onClick: onDownloadClick,
      },
      {
        name: "clear",
        title: "Delete current selection",
        filter: () => selectedItems.length > 0,
        onClick: () => {
          deleteItems(selectedItems);
        },
      },
      {
        name: "cut",
        svg: cutSvg,
        height: "1.4em",
        title: "Cut current selection",
        filter: () => selectedItems.length > 0,
        onClick: () => {
          cutItems(selectedItems);
        },
      },
      { name: "separator", filter: () => selectedItems.length > 0 },
      {
        name: "paste",
        svg: pasteSvg,
        title: "Paste cut items",
        height: "1em",
        filter: () => cuttedSelection.length > 0,
        onClick: () => {
          pasteItems();
        },
      },
      {
        name: "retry",
        title: "Refresh directory",
        onClick: async () => {
          const toSelect = selectedItems;
          await navigateToPath(currentPath, true);
          currentDirectoryComponent?.selectItems(toSelect);
        },
      },
      {
        name: "previous",
        title: "Go to previous directory",
        filter: () => currentPath !== "/",
        onClick: () => {
          navigateToParent();
        },
      },
    ];
  }
}

function updateStatusElement(explorerType, statusLeftElt, selectedItems) {
  if (explorerType === "saver") {
    if (selectedItems.length === 1 && !selectedItems[0].isDirectory) {
      statusLeftElt.value = selectedItems[0].name;
    }
    return;
  }
  if (selectedItems.length === 0) {
    statusLeftElt.innerHTML = "0 item selected";
    return;
  }
  let status;
  const size = selectedItems.reduce((acc, i) => acc + i.size, 0);
  if (selectedItems.length === 1) {
    status = "1 item selected";
  } else {
    status = `${selectedItems.length} items selected`;
  }
  statusLeftElt.innerHTML =
    status + (size > 0 ? ` <i>(${formatSize(size)})</i>` : "");
}

async function createNewDirectory(fs, path, containerElt, msgContainerElt) {
  const maskContainer = addBlockingMask(containerElt);
  try {
    const dirName = await askForUserInput(
      maskContainer,
      "New Directory",
      "Enter new directory name:",
    );
    if (!dirName) {
      removeBlockingMask(maskContainer, containerElt);
      return;
    }

    const newDirPath = pathJoin(path, dirName);
    await fs.mkdir(newDirPath.endsWith("/") ? newDirPath : newDirPath + "/");
    removeBlockingMask(maskContainer, containerElt);
    showAppMessage(
      msgContainerElt,
      `Directory "${dirName}" created successfully`,
    );
  } catch (error) {
    removeBlockingMask(maskContainer, containerElt);
    showError(msgContainerElt, `Failed to create directory: ${error.message}`);
  }
}

async function renameItem(
  fs,
  dir,
  filename,
  isDirectory,
  containerElt,
  msgContainerElt,
) {
  const maskContainer = addBlockingMask(containerElt);
  try {
    const newName = await askForUserInput(
      maskContainer,
      "Renaming " + (isDirectory ? "directory" : "file"),
      "Enter the new name wanted:",
      filename,
    );

    if (!newName) {
      removeBlockingMask(maskContainer, containerElt);
      return;
    }

    await fs.mv(
      pathJoin(dir, filename) + (isDirectory ? "/" : ""),
      pathJoin(dir, newName) + (isDirectory ? "/" : ""),
    );
    removeBlockingMask(maskContainer, containerElt);
    if (isDirectory) {
      showAppMessage(msgContainerElt, `Directory renamed successfully`);
    } else {
      showAppMessage(msgContainerElt, `File renamed successfully`);
    }
  } catch (error) {
    removeBlockingMask(maskContainer, containerElt);
    if (isDirectory) {
      showError(
        msgContainerElt,
        `Failed to rename directory: ${error.message}`,
      );
    } else {
      showError(msgContainerElt, `Failed to rename file: ${error.message}`);
    }
  }
}

async function performMoveOperation(fs, items, destDir, msgContainerElt) {
  const normalizedDest = destDir.endsWith("/") ? destDir : destDir + "/";
  try {
    for (const item of items) {
      if (item.isDirectory) {
        const normalizedPath = !item.path.endsWith("/")
          ? item.path + "/"
          : item.path;
        await fs.mv(normalizedPath, normalizedDest + item.name);
      } else {
        await fs.mv(item.path, normalizedDest);
      }
    }
    showAppMessage(msgContainerElt, `Files moved successfully`);
  } catch (error) {
    showError(msgContainerElt, `Failed to move files: ${error.message}`);
  }
}

async function performItemsDeletion(fs, items, containerElt, msgContainerElt) {
  const maskContainer = addBlockingMask(containerElt);
  try {
    let message = "You will delete ";
    if (items.length === 1) {
      message += `"${items[0].name}"`;
    } else {
      message += `${items.length} items from this directory.`;
    }

    const doIt = await spawnConfirmDialog(
      maskContainer,
      "Are you sure?",
      message,
    );

    if (!doIt) {
      removeBlockingMask(maskContainer, containerElt);
      return;
    }

    for (const item of items) {
      if (item.isDirectory) {
        if (item.path === "/system32/" || item.path === "/system32") {
          showError(
            msgContainerElt,
            "I'm sorry, Dave. I'm afraid I can't do that 🦾",
          );
        } else {
          await fs.rmDir(item.path);
        }
      } else {
        await fs.rmFile(item.path);
      }
    }
    removeBlockingMask(maskContainer, containerElt);
  } catch (error) {
    removeBlockingMask(maskContainer, containerElt);
    showError(msgContainerElt, `Failed to delete: ${error.message}`);
  }
}

function constructPathBarElement(currentPath, navigateTo) {
  const pathBarElt = document.createElement("div");
  applyStyle(pathBarElt, {
    flex: "0 0 auto",
    // marginRight: "15px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--window-content-bg)",
    borderRadius: "4px",
    padding: "5px 10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflowX: "auto",
    whiteSpace: "nowrap",
    border: "1px solid var(--window-line-color)",
  });

  let path = currentPath || "/";
  //
  // if (path[path.length - 1] !== "/") {
  //   path += "/";
  // }
  const pathParts = path.split("/").filter((p) => p);

  const rootDirElt = document.createElement("span");
  rootDirElt.textContent = "/";
  rootDirElt.onclick = () => {
    navigateTo("/");
  };

  applyStyle(rootDirElt, {
    cursor: "pointer",
    padding: "0 3px",
    color: "var(--app-primary-color)",
  });
  pathBarElt.appendChild(rootDirElt);

  let iterPath = "";
  pathParts.forEach((part, index) => {
    iterPath += "/" + part;

    // const separatorElt = document.createElement("span");
    // separatorElt.textContent = ">";
    // applyStyle(separatorElt, {
    //   padding: "0 3px",
    // });
    // pathBarElt.appendChild(separatorElt);

    const currPath = iterPath;
    const linkElt = document.createElement("span");
    linkElt.textContent = part;
    linkElt.onclick = () => {
      navigateTo(currPath);
    };
    applyStyle(linkElt, {
      cursor: "pointer",
      padding: "0 3px",
      color: "var(--app-primary-color)",
    });

    pathBarElt.appendChild(linkElt);

    // Last part is the current directory
    if (index === pathParts.length - 1) {
      linkElt.style.fontWeight = "bold";
    } else {
      const slashElt = document.createElement("span");
      slashElt.textContent = "/";
      pathBarElt.appendChild(slashElt);
    }
  });
  return pathBarElt;
}

function createFileExplorerElement() {
  const explorerElt = document.createElement("div");
  applyStyle(explorerElt, {
    position: "absolute",
    display: "flex",
    gap: "5px",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    padding: "10px",
    backgroundColor: "var(--window-sidebar-bg)",
    zIndex: "101",
    overflow: "auto",
  });
  return explorerElt;
}

function constructTitleElement(title) {
  const labelElt = document.createElement("div");
  labelElt.textContent = title;
  applyStyle(labelElt, {
    flex: "0 0 auto",
    fontWeight: "bold",
    fontStyle: "italic",
    marginBottom: "5px",
    // padding: "7px",
    // border: "1px solid var(--window-line-color)",
    // backgroundColor: "var(--window-sidebar-bg)",
  });
  return labelElt;
}

/**
 * Add an overlay to `blockedElt` so that all child currently inside it become
 * "inert" until `removeBlockingMask` is called.
 *
 * This is useful when you want to block interaction until some input is
 * performed.
 * @param {HTMLElement} blockedElt
 * @returns {HTMLElement} - The blocking mask itself
 */
function addBlockingMask(blockedElt) {
  const maskContainer = document.createElement("div");
  applyStyle(maskContainer, {
    position: "absolute",
    top: "0",
    left: "0",
    height: "100%",
    width: "100%",
  });
  for (const child of blockedElt.children) {
    child.setAttribute("inert", true);
  }
  blockedElt.appendChild(maskContainer);
  return maskContainer;
}

/**
 * Remove an overlay added through `addBlockingMask` and remove the "inert"
 * attribute from all of `blockedElt`'s children.
 * @param {HTMLElement} maskContainer
 * @param {HTMLElement} blockedElt
 */
function removeBlockingMask(maskContainer, blockedElt) {
  maskContainer.remove();
  for (const child of blockedElt.children) {
    child.removeAttribute("inert");
  }
}

function isUserDirectory(path) {
  return path.startsWith("/userdata/") || path.startsWith("/userconfig/");
}
