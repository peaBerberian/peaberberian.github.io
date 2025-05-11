// TODO: Move to its own, "explorer", application
//
// TODO: MAJ+click
// TODO: image thumbnails
// TODO: Drag and drop in directory?
// TODO: Cut (Move) button
// TODO: Paste (Move) button
// TODO: TOUCH
// TODO: check mv inside itself if it works
// TODO: escape when there's a mask

import { constructAppHeaderLine } from "../header-line.mjs";
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
} from "./utils.mjs";

export function createFileOpener(
  { title, allowMultipleSelections, baseDirectory = "/userdata/" } = {},
  { onFilesOpened, filesystem },
  abortSignal,
) {
  const containerElt = createContainerElement();
  /**
   * Global HTML container for the file picker.
   * @type {HTMLElement}
   */
  const explorerContainer = document.createElement("div");
  explorerContainer.onkeydown = (e) => {
    // TODO: We should have focus inside directly
    if (e.key === "Escape") {
      onFilesOpened([]);
    }
  };

  /** `AbortController` linked to the currently-displayed directory. */
  let currentDirectoryAbortController = new AbortController();
  linkAbortControllerToSignal(currentDirectoryAbortController, abortSignal);

  /**
   * Currently displayed path.
   * @type {string}
   */
  let currentPath = baseDirectory;

  /**
   * Flex container of the various components of the file picker.
   * @type {HTMLElement}
   */
  const explorerElt = createFilePickerElement();

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

  // Create the toolbar now

  let selectedItems = [];
  const {
    element: filePickerHeaderElt,
    enableButton: enableHeaderButton,
    disableButton: disableHeaderButton,
  } = constructAppHeaderLine([
    {
      name: "undo",
      title: "Exit picker",
      onClick: () => onFilesOpened([]),
    },
    { name: "separator" },
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
      title: "Upload Files",
      onClick: () => {
        currentDirElementInfo?.onDeactivate();
        const maskContainer = addBlockingMask(explorerElt);
        uploadFiles(filesystem, currentPath, allowMultipleSelections).then(
          (items) => {
            currentDirElementInfo?.onActivate();
            removeBlockingMask(maskContainer, explorerElt);
            if (items.length > 0) {
              if (items.length === 1) {
                showAppMessage(containerElt, `File uploaded successfully`);
              } else {
                showAppMessage(
                  containerElt,
                  `${items.length} files uploaded successfully`,
                );
              }
              navigateToPath(currentPath);
            }
          },
          (err) => {
            currentDirElementInfo?.onActivate();
            removeBlockingMask(maskContainer, explorerElt);
            showError(containerElt, err.message);
          },
        );
      },
    },
    {
      name: "download",
      title: "Download file",
      onClick: () => {
        if (selectedItems.length === 0) {
          return;
        }
        currentDirElementInfo?.onDeactivate();
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
            currentDirElementInfo?.onActivate();
            removeBlockingMask(maskContainer, explorerElt);
          },
          (err) => {
            showError(
              containerElt,
              `Failed to create download: ${err.message}`,
            );
          },
        );
      },
    },
    { name: "separator" },
    {
      name: "newDir",
      height: "1em",
      title: "New Directory",
      svg: newDirectorySvg,
      onClick: () => {
        currentDirElementInfo?.onDeactivate();
        createNewDirectory(filesystem, currentPath, explorerElt).then(
          (refresh) => {
            currentDirElementInfo?.onActivate();
            if (refresh) {
              navigateToPath(currentPath);
            }
          },
        );
      },
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
      onClick: () => {
        if (selectedItems.length === 0) {
          return;
        }
        currentDirElementInfo?.onDeactivate();
        renameItem(
          filesystem,
          currentPath,
          selectedItems[0].name,
          selectedItems[0].isDirectory,
          explorerElt,
        ).then((refresh) => {
          currentDirElementInfo?.onActivate();
          if (refresh) {
            navigateToPath(currentPath);
          }
        });
      },
    },
  ]);
  explorerElt.appendChild(filePickerHeaderElt);

  /**
   * Central element where the various files and directories will be displayed
   * (or a message indicating that there's nothing!).
   * @type {HTMLElement}
   */
  const directoryContainer = document.createElement("div");
  applyStyle(directoryContainer, {
    flex: "1",
    minHeight: "150px",
    overflow: "auto",
    backgroundColor: "var(--window-content-bg)",
    border: "1px solid var(--window-line-color)",
  });
  explorerElt.appendChild(directoryContainer);

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
  const filePickerStatusBarElt = document.createElement("div");
  applyStyle(filePickerStatusBarElt, {
    display: "flex",
    gap: "5px",
    justifyContent: "space-between",
    alignItems: "center",
  });
  const statusElt = document.createElement("div");
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
    onFilesOpened([]);
  };
  const openButton = document.createElement("button");
  openButton.className = "btn";
  openButton.textContent = "Open";
  applyStyle(openButton, {
    padding: "4px 15px",
    fontSize: "1.1em",
    fontWeight: "bold",
  });
  disableButton(openButton);
  buttonContainerElt.appendChild(cancelButton);
  buttonContainerElt.appendChild(openButton);
  filePickerStatusBarElt.appendChild(statusElt);
  filePickerStatusBarElt.appendChild(buttonContainerElt);
  explorerElt.appendChild(filePickerStatusBarElt);

  explorerContainer.appendChild(explorerElt);
  containerElt.appendChild(explorerContainer);

  let isAppActivated = false;
  let currentDirElementInfo;
  navigateToPath(currentPath);
  return {
    element: containerElt,
    onActivate: () => {
      isAppActivated = true;
      currentDirElementInfo?.onActivate();
    },
    onDeactivate: () => {
      isAppActivated = false;
      currentDirElementInfo?.onDeactivate();
    },
  };

  async function navigateToPath(path) {
    currentDirElementInfo?.onDeactivate();
    currentDirectoryAbortController.abort();
    currentDirectoryAbortController = new AbortController();
    linkAbortControllerToSignal(currentDirectoryAbortController, abortSignal);
    if (path === "/") {
      disableHeaderButton("previous");
    } else {
      enableHeaderButton("previous");
    }

    disableHeaderButton("rename");
    disableHeaderButton("download");
    disableHeaderButton("clear");
    if (path.startsWith("/userdata/") || path === "/userdata") {
      if (path === "/userdata/" || path === "/userdata") {
        disableHeaderButton("home");
      } else {
        enableHeaderButton("home");
      }
      enableHeaderButton("newDir");
      enableHeaderButton("newFile");
      enableHeaderButton("upload");
      warningElt.style.display = "none";
    } else {
      enableHeaderButton("home");
      disableHeaderButton("newDir");
      disableHeaderButton("newFile");
      disableHeaderButton("upload");
      warningElt.style.display = "block";
    }
    currentPath = path;
    const newPathBarElt = constructPathBarElement(path, navigateToPath);
    pathBarElt.replaceWith(newPathBarElt);
    pathBarElt = newPathBarElt;
    const entries = await filesystem.readDir(path);
    if (currentDirectoryAbortController.signal.aborted) {
      return;
    }

    try {
      currentDirElementInfo = renderDirectory({
        entries,
        path,
        allowMultipleSelections,
        callbacks: {
          navigateTo: navigateToPath,
          escape: () => onFilesOpened([]),
          deleteItems,
          onSelectionChange: (items) => {
            selectedItems = items;
            updateStatusElement(statusElt, allowMultipleSelections, items);
            if (
              (!currentPath.startsWith("/userdata/") &&
                currentPath !== "/userdata") ||
              selectedItems.length !== 1
            ) {
              disableHeaderButton("rename");
            } else {
              enableHeaderButton("rename");
            }
            if (selectedItems.length !== 1 || selectedItems[0].isDirectory) {
              disableHeaderButton("download");
            } else {
              enableHeaderButton("download");
            }

            if (
              (!currentPath.startsWith("/userdata/") &&
                currentPath !== "/userdata") ||
              items.length === 0
            ) {
              disableHeaderButton("clear");
            } else {
              enableHeaderButton("clear");
            }
            if (items.length === 0 || items.some((x) => x.isDirectory)) {
              disableButton(openButton);
              openButton.onclick = null;
            } else {
              enableHighlightedButton(openButton);
              openButton.onclick = () =>
                onFilesOpened(items.map((x) => x.path));
            }
          },
          openFiles: (items) => onFilesOpened(items.map((x) => x.path)),
        },
      });
      directoryContainer.innerHTML = "";
      directoryContainer.appendChild(currentDirElementInfo.element);
      if (isAppActivated) {
        currentDirElementInfo.onActivate();
      } else {
        currentDirElementInfo.onDeactivate();
      }
    } catch (err) {
      showError(selectionZoneElt, `Error loading directory: ${err.message}`);
    }
    updateStatusElement(statusElt, allowMultipleSelections, []);
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

  function deleteItems(items) {
    if (items.length === 0) {
      return;
    }
    currentDirElementInfo?.onDeactivate();
    performItemsDeletion(filesystem, items, explorerElt).then((refresh) => {
      currentDirElementInfo?.onActivate();
      if (refresh) {
        navigateToPath(currentPath);
      }
    });
  }
}

function updateStatusElement(
  statusElt,
  allowMultipleSelections,
  selectedItems,
) {
  if (selectedItems.length === 0) {
    if (allowMultipleSelections) {
      statusElt.innerHTML = "0 item selected";
    } else {
      statusElt.innerHTML = "No item selected";
    }
    return;
  }
  let status;
  const size = selectedItems.reduce((acc, i) => acc + i.size, 0);
  if (selectedItems.length === 1) {
    status = "1 item selected";
  } else {
    status = `${selectedItems.length} items selected`;
  }
  statusElt.innerHTML =
    status + (size > 0 ? ` <i>(${formatSize(size)})</i>` : "");
}

async function createNewDirectory(fs, path, containerElt) {
  const maskContainer = addBlockingMask(containerElt);
  const dirName = await askForUserInput(
    maskContainer,
    "New Directory",
    "Enter new directory name:",
  );

  try {
    if (!dirName) {
      removeBlockingMask(maskContainer, containerElt);
      return false;
    }

    const newDirPath = pathJoin(path, dirName);
    await fs.mkdir(newDirPath.endsWith("/") ? newDirPath : newDirPath + "/");
    removeBlockingMask(maskContainer, containerElt);
    showAppMessage(containerElt, `Directory "${dirName}" created successfully`);
  } catch (error) {
    removeBlockingMask(maskContainer, containerElt);
    showError(containerElt, `Failed to create directory: ${error.message}`);
  }
  return true;
}

async function renameItem(fs, dir, filename, isDirectory, containerElt) {
  const maskContainer = addBlockingMask(containerElt);
  const newName = await askForUserInput(
    maskContainer,
    "Renaming " + (isDirectory ? "directory" : "file"),
    "Enter the new name wanted:",
    filename,
  );

  try {
    if (!newName) {
      removeBlockingMask(maskContainer, containerElt);
      return false;
    }

    await fs.mv(
      pathJoin(dir, filename) + (isDirectory ? "/" : ""),
      pathJoin(dir, newName) + (isDirectory ? "/" : ""),
    );
    removeBlockingMask(maskContainer, containerElt);
    if (isDirectory) {
      showAppMessage(containerElt, `Directory renamed successfully`);
    } else {
      showAppMessage(containerElt, `File renamed successfully`);
    }
  } catch (error) {
    removeBlockingMask(maskContainer, containerElt);
    if (isDirectory) {
      showError(containerElt, `Failed to rename directory: ${error.message}`);
    } else {
      showError(containerElt, `Failed to rename file: ${error.message}`);
    }
  }
  return true;
}

// TODO:
// async function performMoveOperation(fs, items, destDir, containerElt) {
//   try {
//     for (const item of items) {
//       await fs.mv(item.path, destDir + "/");
//     }
//     showAppMessage(containerElt, `Directory renamed successfully`);
//   } catch (error) {
//     showError(containerElt, `Failed to rename directory: ${error.message}`);
//   }
// }

async function performItemsDeletion(fs, items, containerElt) {
  const maskContainer = addBlockingMask(containerElt);
  let message = "You will delete ";
  if (items.length === 1) {
    message += `"${items[0].name}"`;
  } else {
    message += `${items.length} items from this directory.`;
  }

  try {
    const doIt = await spawnConfirmDialog(
      maskContainer,
      "Are you sure?",
      message,
    );

    if (!doIt) {
      removeBlockingMask(maskContainer, containerElt);
      return false;
    }

    for (const item of items) {
      if (item.isDirectory) {
        await fs.rmDir(item.path);
      } else {
        await fs.rmFile(item.path);
      }
    }
    removeBlockingMask(maskContainer, containerElt);
  } catch (error) {
    removeBlockingMask(maskContainer, containerElt);
    showError(containerElt, `Failed to delete: ${error.message}`);
  }
  return true;
}

function uploadFiles(fs, currentPath, allowMultipleSelections) {
  return new Promise((resolve, reject) => {
    const fileInputElt = document.createElement("input");
    fileInputElt.style.display = "none";
    fileInputElt.type = "file";
    if (allowMultipleSelections) {
      fileInputElt.multiple = true;
    }
    fileInputElt.click();

    fileInputElt.addEventListener("cancel", async () => {
      resolve([]);
    });

    fileInputElt.addEventListener("error", async () => {
      reject(new Error(`Failed to get files from your computer.`));
    });

    fileInputElt.addEventListener("change", async (e) => {
      const files = e.target.files;
      if (files.length === 0) {
        resolve([]);
      }
      try {
        const names = [];
        for (const file of files) {
          names.push(file.name);
          const filePath = pathJoin(currentPath, file.name);
          const fileAB = await file.arrayBuffer();
          await fs.writeFile(filePath, fileAB);
        }
        resolve(names);
      } catch (error) {
        reject(new Error(`Failed to upload file: ${error.message}`));
      }
    });
  });
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

function createFilePickerElement() {
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

async function askForUserInput(
  containerElt,
  title,
  message,
  defaultValue = "",
) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    applyStyle(overlay, {
      position: "absolute",
      inset: "0px",
      backgroundColor: "var(--window-content-bg)",
      opacity: "0.5",
      zIndex: "2",
      height: "100%",
      width: "100%",
    });
    containerElt.appendChild(overlay);

    const promptInputElt = document.createElement("input");
    promptInputElt.type = "text";
    promptInputElt.value = defaultValue;
    applyStyle(promptInputElt, {
      width: "100%",
      padding: "8px",
      marginBottom: "15px",
    });
    const cancelButtonElt = document.createElement("button");
    cancelButtonElt.className = "btn";
    cancelButtonElt.textContent = "Cancel";
    applyStyle(cancelButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    const okButtonElt = document.createElement("button");
    okButtonElt.className = "btn";
    okButtonElt.textContent = "OK";
    applyStyle(okButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    disableButton(okButtonElt);

    const titleElt = document.createElement("h3");
    applyStyle(titleElt, {
      color: "var(--app-primary-color)",
      marginTop: "0",
      marginBottom: "15px",
    });
    titleElt.textContent = title;

    const messageElt = document.createElement("p");
    applyStyle(messageElt, {
      marginBottom: "15px",
    });
    messageElt.textContent = message;

    const innerElt = document.createElement("div");
    applyStyle(innerElt, {
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
      position: "relative",
      padding: "20px",
      border: "1px solid var(--window-line-color)",
      zIndex: "3",
      backgroundColor: "var(--window-content-bg)",
      top: "50%",
      transform: "translateY(-50%)",
      maxWidth: "90%",
      width: "35em",
      margin: "auto",
    });
    innerElt.appendChild(titleElt);
    innerElt.appendChild(messageElt);
    innerElt.appendChild(promptInputElt);
    const buttonsContainerElt = document.createElement("div");
    applyStyle(buttonsContainerElt, {
      display: "flex",
      justifyContent: "flex-end",
    });
    buttonsContainerElt.appendChild(cancelButtonElt);
    buttonsContainerElt.appendChild(okButtonElt);
    innerElt.appendChild(buttonsContainerElt);
    containerElt.appendChild(innerElt);

    promptInputElt.focus();
    promptInputElt.select();

    okButtonElt.addEventListener("click", onOk);
    cancelButtonElt.addEventListener("click", onCancel);

    promptInputElt.oninput = () => {
      if (promptInputElt.value) {
        enableHighlightedButton(okButtonElt);
      } else {
        disableButton(okButtonElt);
      }
    };

    promptInputElt.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        onOk();
      }
      if (e.key === "Escape") {
        onCancel();
      }
    });
    overlay.onclick = () => resolve(null);

    function onOk() {
      overlay.remove();
      innerElt.remove();
      resolve(promptInputElt.value);
    }

    function onCancel() {
      overlay.remove();
      innerElt.remove();
      resolve(null);
    }
  });
}

async function spawnConfirmDialog(containerElt, title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    applyStyle(overlay, {
      position: "absolute",
      inset: "0px",
      backgroundColor: "var(--window-content-bg)",
      opacity: "0.5",
      zIndex: "2",
      height: "100%",
      width: "100%",
    });
    containerElt.appendChild(overlay);

    const noButtonElt = document.createElement("button");
    noButtonElt.className = "btn";
    noButtonElt.textContent = "No";
    applyStyle(noButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    const yesButtonElt = document.createElement("button");
    yesButtonElt.className = "btn";
    yesButtonElt.textContent = "Yes";
    applyStyle(yesButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    enableHighlightedButton(yesButtonElt);

    const titleElt = document.createElement("h3");
    applyStyle(titleElt, {
      color: "var(--app-primary-color)",
      marginTop: "0",
      marginBottom: "15px",
    });
    titleElt.textContent = title;

    const messageElt = document.createElement("div");
    applyStyle(messageElt, {
      marginBottom: "10px",
    });
    messageElt.textContent = message;

    const innerElt = document.createElement("div");
    applyStyle(innerElt, {
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
      position: "relative",
      padding: "20px",
      border: "1px solid var(--window-line-color)",
      zIndex: "3",
      backgroundColor: "var(--window-content-bg)",
      top: "50%",
      transform: "translateY(-50%)",
      maxWidth: "90%",
      width: "35em",
      margin: "auto",
    });
    innerElt.appendChild(titleElt);
    innerElt.appendChild(messageElt);
    const buttonsContainerElt = document.createElement("div");
    applyStyle(buttonsContainerElt, {
      display: "flex",
      justifyContent: "center",
    });
    buttonsContainerElt.appendChild(noButtonElt);
    buttonsContainerElt.appendChild(yesButtonElt);
    innerElt.appendChild(buttonsContainerElt);
    containerElt.appendChild(innerElt);

    yesButtonElt.addEventListener("click", onYes);
    noButtonElt.addEventListener("click", onNo);
    overlay.onclick = () => resolve(null);

    function onYes() {
      overlay.remove();
      innerElt.remove();
      resolve(true);
    }

    function onNo() {
      overlay.remove();
      innerElt.remove();
      resolve(false);
    }
  });
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

function createContainerElement() {
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "var(--window-content-bg)",
  });
  return containerElt;
}
