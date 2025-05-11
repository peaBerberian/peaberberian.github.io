import fs from "../filesystem/filesystem.mjs";
import { constructAppHeaderLine } from "./header-line.mjs";

export function createFileOpener(
  containerElt,
  title,
  { multiple, dir: baseDir = "/userdata/" } = {},
) {
  return new Promise((resolve) => {
    const filePickerContainer = document.createElement("div");
    const filePickerElt = createFilePickerElement();

    filePickerElt.appendChild(constructTitleElement(title));

    let pathBarElt = constructPathBarElement(baseDir, navigateToPath);
    filePickerElt.appendChild(pathBarElt);

    const {
      element: filePickerHeaderElt,
      // XXX TODO:
      enableButton,
      disableButton,
    } = constructAppHeaderLine([
      {
        name: "undo",
        height: "1.6em",
        title: "Return to last navigation",
        onClick: () => {
          /* TODO: */
        },
      },
      {
        name: "redo",
        height: "1.6em",
        title: "Redo navigation",
        onClick: () => {
          /* TODO: */
        },
      },
      {
        name: "previous",
        height: "1em",
        title: "Parent directory",
        onClick: () => {
          /* TODO: */
        },
      },
    ]);
    disableButton("undo");
    disableButton("redo");
    if (baseDir === "/") {
      disableButton("previous");
    }

    filePickerElt.appendChild(filePickerHeaderElt);

    const directoryContainer = document.createElement("div");
    applyStyle(directoryContainer, {
      flex: "1",
      minHeight: "0", // CSS's weird
      overflow: "auto",
      backgroundColor: "var(--window-content-bg)",
      border: "1px solid var(--window-line-color)",
    });
    filePickerElt.appendChild(directoryContainer);

    loadDirectory(directoryContainer, fs, baseDir, multiple, {
      navigateTo: navigateToPath,
      openFiles: (files) => resolve(files),
      cancel: () => resolve([]),
    });

    const filePickerStatusBarElt = document.createElement("div");
    applyStyle(filePickerStatusBarElt, {
      display: "flex",
      gap: "5px",
      justifyContent: "space-between",
      alignItems: "center",
    });
    const statusElt = document.createElement("div");
    applyStyle(statusElt, {
      // flex: "1",
    });
    if (multiple) {
      statusElt.innerHTML =
        "0 item selected <i>(ctrl+click to select multiple files)</i>";
    } else {
      statusElt.innerHTML = "No item selected";
    }
    const buttonContainerElt = document.createElement("div");
    applyStyle(buttonContainerElt, {
      // flex: "0 1 auto",
      // flex: "0 0 auto"
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
      fontSize: "1em",
    });
    cancelButton.onclick = () => {
      resolve([]);
    };
    const okButton = document.createElement("button");
    okButton.className = "btn";
    okButton.textContent = "Open";
    applyStyle(okButton, {
      padding: "4px 15px",
      fontSize: "1em",
    });
    buttonContainerElt.appendChild(cancelButton);
    buttonContainerElt.appendChild(okButton);
    filePickerStatusBarElt.appendChild(statusElt);
    filePickerStatusBarElt.appendChild(buttonContainerElt);
    filePickerElt.appendChild(filePickerStatusBarElt);

    filePickerContainer.appendChild(filePickerElt);
    containerElt.appendChild(filePickerContainer);

    function navigateToPath(path) {
      const newPathBarElt = constructPathBarElement(path, navigateToPath);
      pathBarElt.replaceWith(newPathBarElt);
      pathBarElt = newPathBarElt;
      loadDirectory(directoryContainer, fs, path, multiple, {
        navigateTo: navigateToPath,
        openFiles: (files) => resolve(files),
        // TODO: reject instead?
        cancel: () => resolve([]),
      });
    }
  });
}

function showAppMessage(containerElt, message, duration = 5000) {
  const messageElt = document.createElement("div");
  messageElt.textContent = message;
  messageElt.style.position = "absolute";
  messageElt.style.top = "10px";
  messageElt.style.left = "50%";
  messageElt.style.transform = "translateX(-50%)";
  messageElt.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  messageElt.style.color = "white";
  messageElt.style.padding = "10px 20px";
  messageElt.style.borderRadius = "4px";
  messageElt.style.zIndex = "1000";
  messageElt.style.transition = "opacity 0.3s";

  containerElt.appendChild(messageElt);

  setTimeout(() => {
    messageElt.style.opacity = "0";
    // After animation, remove
    setTimeout(() => {
      messageElt.remove();
    }, 350);
  }, duration);
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

  const pathParts = currentPath.split("/").filter((p) => p);

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

    // Last part is the current directory
    if (index === pathParts.length - 1) {
      linkElt.style.fontWeight = "bold";
    }
    pathBarElt.appendChild(linkElt);
  });
  return pathBarElt;
}
async function loadDirectory(
  containerElt,
  fs,
  path,
  multiple,
  { navigateTo, openFiles, cancel },
) {
  try {
    // TODO: spinner

    containerElt.innerHTML = "";
    const dirContents = await fs.readDir(path);
    const items = dirContents.map((item) => {
      const filePath = pathJoin(path, item.name);
      return {
        name: item.name,
        icon: item.icon,
        path: filePath,
        isDirectory: item.type === "directory",
        // TODO:
        size: 0,
        mtime: item.modified && new Date(item.modified),
        extension: getFileExtension(item.name),
      };
    });

    // TODO: sort

    const selectedElts = {
      paths: new Set(),
      elements: new Set(),
    };
    let lastClickInfo = {
      element: null,
      timeStamp: 0,
    };
    if (items.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.style.padding = "30px";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.color = "var(--window-text-color)";
      if (path === "/userdata/" || path === "/userdata") {
        emptyMessage.innerHTML =
          "You do not have anything stored in your user directory yet.<br><br><i>Start by uploading or saving some files first!</i>";
      } else {
        emptyMessage.textContent = "There's nothing in this directory (yet!)";
      }
      containerElt.appendChild(emptyMessage);
      return;
    }

    const directoryContainerElt = document.createElement("div");
    applyStyle(directoryContainerElt, {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, 100px)",
      gap: "5px",
      overflowX: "hidden",
      justifyContent: "space-evenly",
    });
    containerElt.appendChild(directoryContainerElt);
    for (const item of items) {
      const itemElt = document.createElement("div");
      itemElt.className = "file-item";
      itemElt.dataset.path = item.path;
      itemElt.dataset.name = item.name;
      itemElt.dataset.type = item.isDirectory ? "directory" : "file";

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

      // TODO: load image
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
        textOverflow: "ellipsis",
        whiteSpace: "normal",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      });

      itemElt.appendChild(icon);
      itemElt.appendChild(labelElt);

      // TODO: handle click

      itemElt.onmousedown = (e) => {
        e.preventDefault();
      };
      itemElt.onselectstart = (e) => {
        e.preventDefault();
      };
      itemElt.tabIndex = "0";
      itemElt.onkeydown = (e) => {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            if (selectedElts.paths.has(item.path)) {
              openFiles(Array.from(selectedElts.paths));
            } else {
              openFiles([item.path]);
            }
            break;

          case " ":
            e.preventDefault();
            onItemClick(itemElt, item, true);
            break;

          case "ArrowLeft":
            {
              e.preventDefault();
              const prevElement = itemElt.previousElementSibling;
              if (prevElement) {
                prevElement.focus();
              }
            }
            break;

          case "ArrowRight":
            {
              e.preventDefault();
              const nextElement = itemElt.nextElementSibling;
              if (nextElement) {
                nextElement.focus();
              }
            }
            break;
        }
      };
      itemElt.onclick = (e) => {
        itemElt.focus();
        onItemClick(itemElt, item, e.ctrlKey && !item.isDirectory);
      };
      directoryContainerElt.appendChild(itemElt);
    }

    // TODO: updateStatusBar(items);
    // TODO: Hide spinner here

    function onItemClick(itemElt, item, keepPreviousSelection) {
      if (multiple && keepPreviousSelection) {
        if (selectedElts.paths.has(item.path)) {
          selectedElts.paths.delete(item.path);
          selectedElts.elements.delete(itemElt);

          itemElt.style.backgroundColor = "";
          itemElt.style.color = "";
        } else {
          selectedElts.paths.add(item.path);
          selectedElts.elements.add(itemElt);

          itemElt.style.backgroundColor = "var(--sidebar-selected-bg-color)";
          itemElt.style.color = "var(--sidebar-selected-text-color)";
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
          openFiles([item.path]);
        }
      } else {
        for (const selectedElt of selectedElts.elements) {
          selectedElt.style.backgroundColor = "";
          selectedElt.style.color = "";
        }
        selectedElts.elements.clear();
        selectedElts.paths.clear();
        lastClickInfo.element = itemElt;
        lastClickInfo.timeStamp = performance.now();
        selectedElts.elements.add(itemElt);
        selectedElts.paths.add(item.path);
        itemElt.style.backgroundColor = "var(--sidebar-selected-bg-color)";
        itemElt.style.color = "var(--sidebar-selected-text-color)";
      }
    }
  } catch (err) {
    // TODO: Hide spinner here
    showError(containerElt, `Error loading directory: ${err.message}`);
  }
}
function showError(containerElt, message) {
  showAppMessage(containerElt, "❌ " + message, 5000);
}
function pathJoin(base, name) {
  if (base.endsWith("/")) {
    return base + name;
  }
  return base + "/" + name;
}
function getFileExtension(filename) {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex === -1 ? "" : filename.slice(dotIndex + 1).toLowerCase();
}

// function showAppMessage(containerElt, message, duration = 5000) {
//   const messageElt = document.createElement("div");
//   messageElt.textContent = message;
//   messageElt.style.position = "absolute";
//   messageElt.style.top = "10px";
//   messageElt.style.left = "50%";
//   messageElt.style.transform = "translateX(-50%)";
//   messageElt.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
//   messageElt.style.color = "white";
//   messageElt.style.padding = "10px 20px";
//   messageElt.style.borderRadius = "4px";
//   messageElt.style.zIndex = "1000";
//   messageElt.style.transition = "opacity 0.3s";
//
//   containerElt.appendChild(messageElt);
//
//   setTimeout(() => {
//     messageElt.style.opacity = "0";
//     // After animation, remove
//     setTimeout(() => {
//       messageElt.remove();
//     }, 350);
//   }, duration);
// }
// async function createConfirmationDialog(fs, containerElt) {
//   return new Promise((resolve) => {
//     containerElt.innerHTML = "";
//
//     const overlay = document.createElement("div");
//     applyStyle(overlay, {
//       position: "absolute",
//       top: "0",
//       left: "0",
//       right: "0",
//       bottom: "0",
//       backgroundColor: "var(--window-content-bg)",
//       opacity: "0.8",
//       zIndex: "2",
//     });
//     containerElt.appendChild(overlay);
//     const cancelButton = strHtml`<button style="margin-right: 10px;" class="btn">Cancel</button>`;
//     const confirmButton = strHtml`<button class="btn">OK</button>`;
//     const promptElt = strHtml`
//         <div>
//           <p >${message}</p>
//           <div style="display: flex; justify-content: center;">
// 						${cancelButton}
// 						${confirmButton}
//           </div>
//         </div>
//       `;
//     applyStyle(promptElt, {
//       backgroundColor: "var(--window-content-bg)",
//       padding: "15px",
//       borderRadius: "10px",
//       border: "1px solid var(--window-line-color)",
//       zIndex: "3",
//       // boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
//     });
//     containerElt.appendChild(promptElt);
//
//     confirmButton.addEventListener("click", () => {
//       try {
//         promptElt.remove();
//       } catch (_) {}
//       containerElt.innerHTML = "";
//       resolve(true);
//     });
//     cancelButton.addEventListener("click", () => {
//       try {
//         promptElt.remove();
//       } catch (_) {}
//       containerElt.innerHTML = "";
//       resolve(false);
//     });
//     overlay.addEventListener("click", () => {
//       containerElt.innerHTML = "";
//       resolve(false);
//     });
//   });
// }

function getFileIcon({ extension, icon }) {
  if (icon) {
    return icon;
  }
  const iconMap = {
    txt: "📄",
    md: "📝",
    html: "🌐",
    css: "🎨",
    js: "📜",
    json: "📋",
    pdf: "📑",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    svg: "🖼️",
    mp3: "🎵",
    mp4: "🎬",
    zip: "📦",
    tar: "📦",
    gz: "📦",
    doc: "📘",
    docx: "📘",
    xls: "📊",
    xlsx: "📊",
    ppt: "📊",
    pptx: "📊",
  };
  return iconMap[extension] || "📄";
}

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
export function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}

function createFilePickerElement() {
  const filePickerElt = document.createElement("div");
  applyStyle(filePickerElt, {
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
  });
  return filePickerElt;
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
