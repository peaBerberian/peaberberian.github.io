import {
  applyStyle,
  getFileIcon,
  pathJoin,
  getFileExtension,
  cutSvg,
} from "./utils.mjs";

export default function renderDirectory({
  entries: dirEntries,
  path,
  contextMenuBase,
  callbacks: {
    setUpContextMenu,
    navigateTo,
    openFiles,
    onSelectionChange,
    escape,
    deleteItems,
    cutItems,
    pasteItems,
  },
  abortSignal,
}) {
  /** The whole zone where the directory elements can be displayed. */
  const directoryWrapperElt = document.createElement("div");
  applyStyle(directoryWrapperElt, {
    top: "0px",
    left: "0px",
    minHeight: "100%",
    minWidth: "100%",
  });

  /**
   * Link each created icon to its item object.
   * @type {Map.<HTMLElement, Object>}
   */
  const itemsMap = new Map();

  /** Metadata on the current selection: */
  const selectedElts = {
    /**
     * The item objects selected, which is what is communicated to the
     * outside.
     * @type {Array.<Object>}
     */
    items: [],
    /**
     * The set of corresponding `HTMLElement` selected.
     * @type {Set.<HTMLElement>}
     */
    elements: new Set(),
  };
  /** Maintain metadata on the last icon clicked */
  let lastClickInfo = {
    /**
     * If `null`, no item `HTMLElement` is currently clicked.
     * If set to an `HTMLElement` this is the (last) currently-clicked entry
     * @type {HTMLElement|null}
     */
    element: null,
    /**
     * Value of `performance.now()` at the time the click was performed.
     * @type {number}
     */
    timeStamp: -Infinity,
  };

  /**
   * We will only enable to focus elements on some conditions, such as when the
   * directory is the current view.
   */
  let canFocusElements = false;

  /** Object controlling the logic specific to mouse selections. */
  let mouseSelectInteractivity = null;

  /**
   * Contains Elements representing the various entries and nothing else.
   * @type {HTMLElement}
   */
  const itemsParentElt = document.createElement("div");
  applyStyle(itemsParentElt, {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 100px)",
    gap: "5px",
    overflowX: "hidden",
    justifyContent: "space-evenly",
  });
  directoryWrapperElt.appendChild(itemsParentElt);

  setUpContextMenu({
    element: directoryWrapperElt,
    filter: (e) => {
      return directoryWrapperElt === e.target || itemsParentElt === e.target;
    },
    abortSignal,
    actions: contextMenuBase,
  });

  const items = formatDirectoryEntries(dirEntries, path);
  if (items.length === 0) {
    const emptyMessage = createEmptyDirMessage(path);
    directoryWrapperElt.appendChild(emptyMessage);
    return {
      element: directoryWrapperElt,
      onActivate,
      onDeactivate,
      signalCutAction,
      selectItems: () => {
        /* noop */
      },
    };
  }

  for (const item of items) {
    const itemElt = document.createElement("div");
    itemElt.tabIndex = "0";
    itemElt.onfocus = () => {
      if (!isItemEltSelected(itemElt) || getSelectedItems().size > 1) {
        itemElt.className = "emphasis-focus";
      } else {
        itemElt.className = "";
      }
      if (itemElt.dataset.ignoreNextFocusEvent) {
        delete itemElt.dataset.ignoreNextFocusEvent;
        return;
      }
      // TODO: Too hard in the end I abandoned that shit.
      // Sorry people with disabilities, you're going to have to type space
      // to toggle. I tried so hard (but in the end...)
      // It may be simpler in the future when I clean other things up?
      // selectItemElts([itemElt], { clearPrevious: true });
    };

    itemElt.style.outlineColor = "var(--sidebar-selected-bg-color)";
    applyStyle(itemElt, {
      display: "flex",
      gap: "5px",
      flexDirection: "column",
      alignItems: "center",
      padding: "5px",
      margin: "5px",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s, color 0.2s",
    });
    setUpContextMenu({
      element: itemElt,
      filter: (e) => itemElt.contains(e.target),
      abortSignal,
      actions: [
        {
          name: "open",
          title: "Open this " + (item.isDirectory ? "directory" : "file"),
          onClick: () => {
            if (item.isDirectory) {
              navigateTo(item.path);
            } else {
              openFiles([item]);
            }
          },
        },
        {
          name: "clear",
          title: "Delete this " + (item.isDirectory ? "directory" : "file"),
          height: "1.4em",
          onClick: () => {
            deleteItems([item]);
          },
        },
        {
          name: "cut",
          height: "1.4em",
          svg: cutSvg,
          title: "Cut " + (item.isDirectory ? "directory" : "file"),
          onClick: () => {
            cutItems([item]);
          },
        },
        { name: "separator" },
        ...contextMenuBase,
      ],
    });

    // TODO: For images, read and load preview?
    const icon = document.createElement("div");
    icon.innerHTML = item.isDirectory ? "📁" : getFileIcon(item);
    applyStyle(icon, {
      fontSize: "3em",
      marginBottom: "5px",
    });

    const labelElt = document.createElement("div");

    // We put ZWS before any "dot" as a smart trick to hint to the
    // browser that it is a good place where breaking a name that is too long.
    // It nicely map with a line break just for an extension.
    labelElt.textContent = item.name.replace(/\./g, "\u200b.");
    applyStyle(labelElt, {
      textAlign: "center",
      width: "100%",
      flexGrow: "1",
      overflow: "hidden",
      whiteSpace: "normal",
      wordBreak: "break-word",
      display: "flex",
      justifyContent: "center",
      // display: "-webkit-box",
      // alignItems: "center",
      // textOverflow: "ellipsis",
      // WebkitLineClamp: "2",
      // WebkitBoxOrient: "vertical",
      // overflowWrap: "break-word",
    });

    itemElt.appendChild(icon);
    itemElt.appendChild(labelElt);

    // TODO: drag and drop
    itemElt.onmousedown = (e) => {
      e.preventDefault();
      // e.stopPropagation();
    };

    itemElt.ontouchstart = () => {
      onClick({
        toggle: true,
        keepPrevious: true,
        includePath: false,
      });
    };

    itemElt.onclick = (e) => {
      onClick({
        toggle: e.ctrlKey,
        keepPrevious: e.pointerType === "touch" ? false : e.ctrlKey,
        clickBehavior: e.pointerType === "touch" ? "double" : "single",
        includePath: e.shiftKey,
      });
    };

    // Prevent Safari from selecting everything on earth
    itemElt.onselectstart = (e) => e.preventDefault();
    itemsMap.set(itemElt, item);

    itemsParentElt.appendChild(itemElt);

    function onClick({ includePath, toggle, keepPrevious, clickBehavior }) {
      if (includePath) {
        const lastSelected = [...selectedElts.elements].pop();
        if (lastSelected && lastSelected !== itemElt) {
          let currentItemIdx = -1;
          let lastSelectedIdx = -1;
          const children = itemsParentElt.children;
          for (let i = 0; i < children.length; i++) {
            if (children[i] === lastSelected) {
              lastSelectedIdx = i;
            } else if (children[i] === itemElt) {
              currentItemIdx = i;
            }
          }
          if (currentItemIdx >= 0 && lastSelectedIdx >= 0) {
            const toSelect =
              currentItemIdx > lastSelectedIdx
                ? [...itemsParentElt.children].slice(
                    lastSelectedIdx,
                    currentItemIdx + 1,
                  )
                : [...itemsParentElt.children].slice(
                    currentItemIdx,
                    lastSelectedIdx + 1,
                  );
            selectItemElts(toSelect, {
              clearPrevious: false,
            });
            return;
          }
        }
      }
      onItemClick(itemElt, item, {
        toggle,
        keepPrevious,
        clickBehavior,
      });
    }
  }

  mouseSelectInteractivity =
    itemsMap.size > 0
      ? addMouseSelectInteractivity(directoryWrapperElt, itemsMap, {
          getSelectedItems: () => [...getSelectedItems()],
          selectItemElts,
          clearItemElts,
          isItemEltSelected,
        })
      : null;

  return {
    element: directoryWrapperElt,
    onActivate: () => {
      canFocusElements = true;
      // TODO: actually focus last selected
      onActivate();
    },
    onDeactivate: () => {
      canFocusElements = false;
      onDeactivate();
    },
    signalCutAction,
    selectItems: (items) => {
      // NOTE: could be more performant. Here I didn't care much at this scale
      const toSelect = itemsMap.entries().reduce((acc, [elt, item]) => {
        if (items.some((c) => c.path === item.path)) {
          acc.push(elt);
        }
        return acc;
      }, []);
      selectItemElts(toSelect, {});
    },
  };

  function onItemClick(itemElt, item, { toggle, keepPrevious, clickBehavior }) {
    if (clickBehavior === "double" || clickBehavior === "single") {
      if (
        clickBehavior === "double" ||
        (lastClickInfo.element === itemElt &&
          performance.now() - lastClickInfo.timeStamp <= 500)
      ) {
        if (item.isDirectory) {
          navigateTo(item.path);
        } else {
          openFiles([item]);
        }
        return;
      }
      lastClickInfo.element = itemElt;
      lastClickInfo.timeStamp = performance.now();
    }

    if (toggle) {
      if (isItemEltSelected(itemElt)) {
        clearItemElts([itemElt]);
      } else {
        selectItemElts([itemElt], {
          clearPrevious: !keepPrevious,
        });
      }
    } else {
      selectItemElts([itemElt], {
        clearPrevious: !keepPrevious,
      });
      onSelectionChange(selectedElts.items);
    }
  }

  function signalCutAction(cuttedItems) {
    // NOTE: could be more performant. Here I didn't care much at this scale
    itemsMap.entries().forEach(([key, value]) => {
      if (cuttedItems.some((c) => c.path === value.path)) {
        key.style.opacity = "0.6";
      } else {
        key.style.opacity = "";
      }
    }, {});
  }

  function selectItemElts(itemElts, { clearPrevious, preventScroll }) {
    if (clearPrevious) {
      for (const selectedElt of selectedElts.elements) {
        selectedElt.style.backgroundColor = "";
        selectedElt.style.color = "";
      }
      selectedElts.elements.clear();
      selectedElts.items.length = 0;
    }
    for (const itemElt of itemElts) {
      const item = itemsMap.get(itemElt);
      if (item && !isItemEltSelected(itemElt)) {
        selectedElts.elements.add(itemElt);
        selectedElts.items.push(item);
        itemElt.style.backgroundColor = "var(--sidebar-selected-bg-color)";
        itemElt.style.color = "var(--sidebar-selected-text-color)";
      }
    }
    const lastSelectedElement = itemElts[itemElts.length - 1];
    if (
      canFocusElements &&
      lastSelectedElement &&
      document.activeElement !== lastSelectedElement
    ) {
      lastSelectedElement.dataset.ignoreNextFocusEvent = true;
      lastSelectedElement.focus({ preventScroll });
    }
    onSelectionChange(selectedElts.items);
  }

  function isItemEltSelected(itemElt) {
    return selectedElts.elements.has(itemElt);
  }

  function onActivate() {
    mouseSelectInteractivity?.onActivate();
    document.addEventListener("keydown", onKeyDown);
  }

  function onDeactivate() {
    mouseSelectInteractivity?.onDeactivate();
    document.removeEventListener("keydown", onKeyDown);
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyDown(e) {
    switch (e.key) {
      case "Escape": {
        e.preventDefault();
        escape();
        break;
      }
      case "Delete": {
        e.preventDefault();
        deleteItems(selectedElts.items);
        break;
      }
      case "Backspace": {
        e.preventDefault();
        navigateToParent();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();

        if (selectedElts.items.length === 0) {
          const itemElt = itemsParentElt.children[0];
          if (itemElt) {
            selectItemElts([itemElt], {
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
          }
          return;
        }

        const currentElementConsidered = itemsMap.has(document.activeElement)
          ? document.activeElement
          : [...selectedElts.elements].pop();
        if (!currentElementConsidered) {
          break;
        }
        const prevSibling = currentElementConsidered.previousElementSibling;
        if (prevSibling) {
          selectItemElts([prevSibling], {
            clearPrevious: !e.ctrlKey && !e.shiftKey,
          });
        } else {
          selectItemElts([currentElementConsidered], {
            clearPrevious: !e.ctrlKey && !e.shiftKey,
          });
        }
        break;
      }

      case "ArrowRight": {
        e.preventDefault();

        if (selectedElts.items.length === 0) {
          const itemElt = itemsParentElt.children[0];
          if (itemElt) {
            selectItemElts([itemElt], {
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
          }
          return;
        }

        const currentElementConsidered = itemsMap.has(document.activeElement)
          ? document.activeElement
          : [...selectedElts.elements].pop();
        if (!currentElementConsidered) {
          break;
        }
        const nextSibling = currentElementConsidered.nextElementSibling;
        if (nextSibling) {
          selectItemElts([nextSibling], {
            clearPrevious: !e.ctrlKey && !e.shiftKey,
          });
        } else {
          selectItemElts([currentElementConsidered], {
            clearPrevious: !e.ctrlKey && !e.shiftKey,
          });
        }
        break;
      }

      case "ArrowDown": {
        e.preventDefault();

        if (selectedElts.items.length === 0) {
          const itemElt = itemsParentElt.children[0];
          if (itemElt) {
            selectItemElts([itemElt], {
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
          }
          return;
        }

        const currentElementConsidered = itemsMap.has(document.activeElement)
          ? document.activeElement
          : [...selectedElts.elements].pop();
        if (!currentElementConsidered) {
          break;
        }
        const currentClientRect =
          currentElementConsidered.getBoundingClientRect();

        let nextSibling = currentElementConsidered.nextElementSibling;
        while (nextSibling) {
          const clientRect = nextSibling.getBoundingClientRect();
          if (clientRect.left === currentClientRect.left) {
            selectItemElts([nextSibling], {
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
            break;
          }
          nextSibling = nextSibling.nextElementSibling;
        }
        break;
      }

      case "ArrowUp": {
        e.preventDefault();

        if (selectedElts.items.length === 0) {
          const itemElt = itemsParentElt.children[0];
          if (itemElt) {
            selectItemElts([itemElt], {
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
          }
          return;
        }

        const currentElementConsidered = itemsMap.has(document.activeElement)
          ? document.activeElement
          : [...selectedElts.elements].pop();
        if (!currentElementConsidered) {
          break;
        }
        const currentClientRect =
          currentElementConsidered.getBoundingClientRect();

        let previousSibling = currentElementConsidered.previousElementSibling;
        while (previousSibling) {
          const clientRect = previousSibling.getBoundingClientRect();
          if (clientRect.left === currentClientRect.left) {
            selectItemElts([previousSibling], {
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
            break;
          }
          previousSibling = previousSibling.previousElementSibling;
        }
        break;
      }

      case " ": {
        e.preventDefault();
        if (itemsMap.has(document.activeElement)) {
          const item = itemsMap.get(document.activeElement);
          onItemClick(document.activeElement, item, {
            toggle: true,
            keepPrevious: true,
          });
          break;
        }
      }

      case "Enter": {
        e.preventDefault();
        if (selectedElts.items.length === 0) {
          return;
        } else if (selectedElts.items.length === 1) {
          const item = selectedElts.items[0];
          if (item.isDirectory) {
            navigateTo(item.path);
          } else {
            openFiles([item]);
          }
        } else {
          const files = [];
          for (const item of selectedElts.items) {
            if (item.isDirectory) {
              return;
            }
            files.push(item);
          }
          openFiles(files);
        }
        break;
      }

      case "a":
        if (e.ctrlKey) {
          e.preventDefault();
          e.preventDefault();
          selectedElts.elements.clear();
          selectedElts.items.length = 0;
          lastClickInfo.element = null;
          lastClickInfo.timeStamp = -Infinity;
          selectItemElts(itemsParentElt.children, {
            clearPrevious: true,
          });
          onSelectionChange(selectedElts.items);
        }
        break;

      case "x":
        if (e.ctrlKey) {
          e.preventDefault();
          e.preventDefault();
          cutItems(selectedElts.items);
        }
        break;
      case "v":
        if (e.ctrlKey) {
          e.preventDefault();
          e.preventDefault();
          pasteItems();
        }
        break;
    }
  }

  function clearItemElts(itemElts) {
    for (const selectedElt of itemElts) {
      const item = itemsMap.get(selectedElt);
      if (item) {
        const indexOf = selectedElts.items.indexOf(item);
        if (indexOf >= 0) {
          selectedElts.items.splice(indexOf, 1);
        }
      }
      selectedElts.elements.delete(selectedElt);
      selectedElt.style.backgroundColor = "";
      selectedElt.style.color = "";
      if (document.activeElement === selectedElt) {
        selectedElt.blur();
        const lastSelectedElement = [...selectedElts.elements].pop();
        if (
          canFocusElements &&
          lastSelectedElement &&
          document.activeElement !== lastSelectedElement
        ) {
          lastSelectedElement.dataset.ignoreNextFocusEvent = true;
          lastSelectedElement.focus({ preventScroll: true });
        }
      }
    }
    onSelectionChange(selectedElts.items);
  }
  function getSelectedItems() {
    return selectedElts.elements;
  }
  function navigateToParent() {
    if (path === "/") {
      return;
    }
    if (path[path.length - 1] === "/") {
      path = path.substring(0, path.length - 1);
    }
    navigateTo(path.substring(0, path.lastIndexOf("/") + 1));
  }
}

function formatDirectoryEntries(dirEntries, path) {
  const items = dirEntries.map((item) => {
    const filePath = pathJoin(path, item.name);
    return {
      name: item.name,
      icon: item.type === "directory" ? "📁" : item.icon,
      path: filePath,
      isDirectory: item.type === "directory",
      size: item.size,
      mtime: item.modified && new Date(item.modified),
      extension: getFileExtension(item.name),
    };
  });

  items.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) {
      return -1;
    }
    if (!a.isDirectory && b.isDirectory) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
  return items;
}

function createEmptyDirMessage(path) {
  const emptyMessage = document.createElement("div");
  emptyMessage.style.padding = "30px";
  emptyMessage.style.textAlign = "center";
  emptyMessage.style.color = "var(--window-text-color)";
  if (path === "/userdata/" || path === "/userdata") {
    emptyMessage.innerHTML =
      "You do not have anything stored in your user directory yet.<br><br><i>Start by uploading or saving some files in it first!</i><br><br><br><b>Files uploaded and saved here still stay on your computer, they are not sent to a server.</b>";
  } else {
    emptyMessage.textContent = "There's nothing in this directory (yet!)";
  }
  return emptyMessage;
}

function addMouseSelectInteractivity(
  containerElt,
  itemsMap,
  { getSelectedItems, selectItemElts, clearItemElts, isItemEltSelected },
) {
  /** If `true`, the pointer was pressed on the container element, else, `false`. */
  let isPressing = false;

  /**
   * If `true`, we're currently in the process of having a "selection zone"
   * which actually selects all items it moves over.
   * If `false`, we're not selecting yet, probably because the pointer did
   * not move enough.
   */
  let hasSelectionStarted = false;
  /**
   * The starting `x` coordinate at the time of press of the pointer on the
   * page.
   */
  let startX = 0;
  /**
   * The starting `y` coordinate at the time of press of the pointer on the
   * page.
   */
  let startY = 0;

  /** The list of selected items at the time of press (as an Array). */
  let baseSelected = [];

  /**
   * The selection zone element.that will visually indicate what is currently
   * the zone of selection.
   */
  const selectionBox = document.createElement("div");
  selectionBox.className = "selection-box";
  Object.assign(selectionBox.style, {
    position: "absolute",
    left: `${startX}px`,
    top: `${startY}px`,
    width: "0",
    height: "0",
    opacity: 0.5,
    backgroundColor: "var(--app-primary-color)",
    border: "",
    pointerEvents: "none",
    zIndex: "1000",
  });

  containerElt.addEventListener("mousedown", (e) => {
    if (e.button !== 0) {
      // not left mouse
      return;
    }
    e.preventDefault();

    isPressing = true;
    hasSelectionStarted = false;
    startX = e.clientX;
    startY = e.clientY;
    baseSelected = getSelectedItems();
    if (
      !e.shiftKey &&
      !e.ctrlKey &&
      !baseSelected.some((s) => s.contains(e.target))
    ) {
      clearItemElts(baseSelected);
    }
    document.body.appendChild(selectionBox);
  });

  containerElt.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });

  function onMouseMove(e) {
    if (!isPressing) {
      return;
    }

    const currentX = e.clientX;
    const currentY = e.clientY;

    // TODO: I guess we could make it more efficient here
    // FIXME: The container element is the one with the scroll, we should
    // bring that element under our responsability here.
    const containerRect = containerElt.parentElement.getBoundingClientRect();
    let offsetWidth = 0;
    let left = Math.min(startX, currentX);
    if (left < containerRect.left) {
      offsetWidth = left - containerRect.left;
      left = containerRect.left;
    }
    let offsetHeight = 0;
    let top = Math.min(startY, currentY);
    if (top < containerRect.top) {
      offsetHeight = top - containerRect.top;
      top = containerRect.top;
    }

    let width = Math.abs(currentX - startX) + offsetWidth;
    if (left + width > containerRect.right) {
      width = containerRect.right - left;
    }
    let height = Math.abs(currentY - startY) + offsetHeight;
    if (top + height > containerRect.bottom) {
      height = containerRect.bottom - top;
    }

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    if (!hasSelectionStarted) {
      if (
        Math.abs(startX - currentX) < 15 ||
        Math.abs(startY - currentY) < 15
      ) {
        return;
      }
      hasSelectionStarted = true;
      if (!e.ctrlKey && !e.shiftKey) {
        //IWe postpone clearing until the intent of selection is well communicated
        // to not surprise people which just try to drag and drop things (before
        // realizing it has no effect)
        clearItemElts(getSelectedItems());
      }
    }

    // Check overlap with selectable items
    // TODO: could be more efficient also here
    const selectionRect = selectionBox.getBoundingClientRect();
    const toSelect = [];
    const toClear = [];
    itemsMap.keys().forEach((itemElt) => {
      const item = itemsMap.get(itemElt);
      if (!item) {
        return;
      }
      const itemRect = itemElt.getBoundingClientRect();
      const isOverlapping = !(
        selectionRect.right < itemRect.left ||
        selectionRect.left > itemRect.right ||
        selectionRect.bottom < itemRect.top ||
        selectionRect.top > itemRect.bottom
      );

      if (e.ctrlKey && baseSelected.includes(itemElt)) {
        if (isOverlapping) {
          toClear.push(itemElt);
        } else {
          toSelect.push(itemElt);
        }
      } else if (isOverlapping) {
        if (isItemEltSelected(itemElt)) {
          return;
        }
        toSelect.push(itemElt);
      } else {
        toClear.push(itemElt);
      }
    });

    selectItemElts(toSelect, {
      clearPrevious: false,
      preventScroll: true,
    });
    clearItemElts(toClear);
  }
  function onMouseUp() {
    if (!isPressing) {
      return;
    }
    hasSelectionStarted = false;
    baseSelected = [];
    isPressing = false;
    selectionBox.style.left = "0";
    selectionBox.style.top = "0";
    selectionBox.style.width = "0";
    selectionBox.style.height = "0";
    try {
      document.body.removeChild(selectionBox);
    } catch (_) {}
  }

  return { onActivate, onDeactivate };
  function onActivate() {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseUp);
  }
  function onDeactivate() {
    onMouseUp();
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mouseleave", onMouseUp);
  }
}
