import {
  applyStyle,
  getFileIcon,
  pathJoin,
  getFileExtension,
} from "./utils.mjs";

export default function renderDirectory({
  entries: dirEntries,
  path,
  allowMultipleSelections,
  callbacks: {
    navigateTo,
    openFiles,
    onSelectionChange,
    escape,
    deleteItems,
    // moveItems,
  },
}) {
  const selectionZoneElt = document.createElement("div");
  applyStyle(selectionZoneElt, {
    top: "0px",
    left: "0px",
    height: "100%",
    width: "100%",
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
  selectionZoneElt.appendChild(itemsParentElt);

  const items = formatDirectoryEntries(dirEntries, path);
  if (items.length === 0) {
    const emptyMessage = createEmptyDirMessage(path);
    selectionZoneElt.appendChild(emptyMessage);
    return {
      element: selectionZoneElt,
      onActivate,
      onDeactivate,
    };
  }

  for (const item of items) {
    const itemElt = document.createElement("div");
    // TODO: After some difficulties this is only done through left/right
    // navigation for now
    // itemElt.tabIndex = "0";
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

    // TODO: For images, read and load preview?
    const icon = document.createElement("div");
    icon.innerHTML = item.isDirectory ? "📁" : getFileIcon(item);
    applyStyle(icon, {
      fontSize: "3em",
      marginBottom: "5px",
    });

    const labelElt = document.createElement("div");
    labelElt.textContent = item.name;
    applyStyle(labelElt, {
      textAlign: "center",
      width: "100%",
      flexGrow: "1",
      overflow: "hidden",
      whiteSpace: "normal",
      // textOverflow: "ellipsis",
      // WebkitLineClamp: "2",
      // WebkitBoxOrient: "vertical",
      // overflowWrap: "break-word",
      wordBreak: "break-word",
      // display: "-webkit-box",
      display: "flex",
      justifyContent: "center",
      // alignItems: "center",
    });

    itemElt.appendChild(icon);
    itemElt.appendChild(labelElt);

    // TODO: drag and drop
    itemElt.onmousedown = (e) => {
      itemElt.focus({ preventScroll: true });
      onItemClick(itemElt, item, e.ctrlKey);
      e.stopPropagation();
    };

    // Prevent Safari from selecting everything on earth
    itemElt.onselectstart = (e) => e.preventDefault();
    itemsMap.set(itemElt, item);

    itemsParentElt.appendChild(itemElt);
  }

  function onItemClick(itemElt, item, keepPreviousSelection) {
    if (allowMultipleSelections && keepPreviousSelection) {
      if (selectedElts.elements.has(itemElt)) {
        clearItemElts([itemElt]);
      } else {
        selectItemElts([itemElt], {
          isClick: true,
          clearPrevious: !keepPreviousSelection,
        });
      }
      return;
    }
    if (
      lastClickInfo.element === itemElt &&
      performance.now() - lastClickInfo.timeStamp <= 500
    ) {
      if (item.isDirectory) {
        navigateTo(item.path);
      } else {
        openFiles([item]);
      }
    } else {
      selectItemElts([itemElt], { clearPrevious: true, isClick: true });
      onSelectionChange(selectedElts.items);
    }
  }

  mouseSelectInteractivity =
    itemsMap.size > 0
      ? addMouseSelectInteractivity(selectionZoneElt, itemsMap, selectedElts, {
          clearSelection,
          selectItemElts,
          clearItemElts,
        })
      : null;

  return { element: selectionZoneElt, onActivate, onDeactivate };

  function selectItemElts(itemElts, { isClick, clearPrevious }) {
    if (clearPrevious) {
      for (const selectedElt of selectedElts.elements) {
        selectedElt.style.backgroundColor = "";
        selectedElt.style.color = "";
      }
      selectedElts.elements.clear();
      selectedElts.items.length = 0;
    }
    if (isClick && itemElts.length > 0) {
      lastClickInfo.element = itemElts[0];
      lastClickInfo.timeStamp = performance.now();
    } else {
      lastClickInfo.element = null;
      lastClickInfo.timeStamp = -Infinity;
    }
    for (const itemElt of itemElts) {
      const item = itemsMap.get(itemElt);
      if (item && !selectedElts.elements.has(itemElt)) {
        selectedElts.elements.add(itemElt);
        selectedElts.items.push(item);
        itemElt.style.backgroundColor = "var(--sidebar-selected-bg-color)";
        itemElt.style.color = "var(--sidebar-selected-text-color)";
      }
    }
    const lastSelectedElement = itemElts[itemElts.length - 1];
    if (lastSelectedElement) {
      lastSelectedElement.focus();
    }
    onSelectionChange(selectedElts.items);
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

        // TODO: When you go the other way, it should unselect

        if (selectedElts.items.length === 0) {
          const itemElt = itemsParentElt.children[0];
          if (itemElt) {
            selectItemElts([itemElt], {
              isClick: false,
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
          }
          return;
        }

        /** @type {HTMLElement} */
        const lastSelectedElement = [...selectedElts.elements].pop();

        const prevSibling = lastSelectedElement.previousElementSibling;
        if (prevSibling) {
          selectItemElts([prevSibling], {
            isClick: false,
            clearPrevious: !e.ctrlKey && !e.shiftKey,
          });
        }
        break;
      }

      case "ArrowRight": {
        e.preventDefault();

        // TODO: When you go the other way, it should unselect

        if (selectedElts.items.length === 0) {
          const itemElt = itemsParentElt.children[0];
          if (itemElt) {
            selectItemElts([itemElt], {
              isClick: false,
              clearPrevious: !e.ctrlKey && !e.shiftKey,
            });
          }
          return;
        }

        /** @type {HTMLElement} */
        const lastSelectedElement = [...selectedElts.elements].pop();

        const nextSibling = lastSelectedElement.nextElementSibling;
        if (nextSibling) {
          selectItemElts([nextSibling], {
            isClick: false,
            clearPrevious: !e.ctrlKey && !e.shiftKey,
          });
        }
        break;
      }

      case "Enter": {
        if (selectedElts.items.length === 0) {
          return;
        } else if (selectedElts.items.length === 1) {
          e.preventDefault();
          const item = selectedElts.items[0];
          if (item.isDirectory) {
            navigateTo(item.path);
          } else {
            openFiles([item]);
          }
        } else {
          e.preventDefault();
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
          selectedElts.elements.clear();
          selectedElts.items.length = 0;
          lastClickInfo.element = null;
          lastClickInfo.timeStamp = -Infinity;
          selectItemElts(itemsParentElt.children, {
            isClick: false,
            clearPrevious: true,
          });
          onSelectionChange(selectedElts.items);
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
      selectedElt.blur();
    }
    onSelectionChange(selectedElts.items);
  }
  function clearSelection() {
    lastClickInfo.element = null;
    lastClickInfo.timeStamp = -Infinity;
    clearItemElts(selectedElts.elements);
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
      "You do not have anything stored in your user directory yet.<br><br><i>Start by uploading or saving some files in it first!</i>";
  } else {
    emptyMessage.textContent = "There's nothing in this directory (yet!)";
  }
  return emptyMessage;
}

function addMouseSelectInteractivity(
  containerElt,
  itemsMap,
  selectedElts,
  { clearSelection, selectItemElts, clearItemElts },
) {
  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  let selectionBox;

  containerElt.addEventListener("mousedown", (e) => {
    if (e.button !== 0) {
      // not left mouse
      return;
    }
    e.preventDefault();

    // TODO: Keep in memory the already-selected items
    // if (!e.ctrlKey) {
    clearSelection();
    // }

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    // Create selection box
    selectionBox = document.createElement("div");
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
    document.body.appendChild(selectionBox);
  });

  containerElt.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });

  function onMouseMove(e) {
    if (!isSelecting) {
      return;
    }

    const currentX = e.clientX;
    const currentY = e.clientY;

    // TODO: I guess we could make it more efficient here
    const selectionZoneLimits = containerElt.getBoundingClientRect();
    let offsetWidth = 0;
    let left = Math.min(startX, currentX);
    if (left < selectionZoneLimits.left) {
      offsetWidth = left - selectionZoneLimits.left;
      left = selectionZoneLimits.left;
    }
    let offsetHeight = 0;
    let top = Math.min(startY, currentY);
    if (top < selectionZoneLimits.top) {
      offsetHeight = top - selectionZoneLimits.top;
      top = selectionZoneLimits.top;
    }

    let width = Math.abs(currentX - startX) + offsetWidth;
    if (left + width > selectionZoneLimits.right) {
      width = selectionZoneLimits.right - left;
    }
    let height = Math.abs(currentY - startY) + offsetHeight;
    if (top + height > selectionZoneLimits.bottom) {
      height = selectionZoneLimits.bottom - top;
    }

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    // Check overlap with selectable items
    // TODO: could be more efficient also here
    const selectionRect = selectionBox.getBoundingClientRect();
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

      if (isOverlapping) {
        if (selectedElts.elements.has(itemElt)) {
          return;
        }
        selectItemElts([itemElt], { isClick: false, clearPrevious: false });
      } else {
        for (let i = selectedElts.items.length - 1; i >= 0; i--) {
          if (selectedElts.items[i].path === item.path) {
            selectedElts.items.splice(i, 1);
          }
        }
        clearItemElts([itemElt]);
      }
    });
  }
  function onMouseUp() {
    if (!isSelecting) {
      return;
    }

    isSelecting = false;
    if (selectionBox) {
      selectionBox.remove();
      selectionBox = null;
    }
  }

  return { onActivate, onDeactivate };
  function onActivate() {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
  function onDeactivate() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}
