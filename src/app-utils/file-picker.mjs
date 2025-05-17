import fs from "../filesystem/filesystem.mjs";
import strHtml from "../str-html.mjs";
import { constructAppHeaderLine } from "./header-line.mjs";
// TODO: add warning read-only directory
// TODO: Aria-hidden or something?

const homeDirSvg = `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-100.000000, -1759.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M62,1605.0005 L52,1605.0005 L52,1601.0005 L46,1601.0005 L46,1617.0005 L62,1617.0005 L62,1605.0005 Z M64,1603.0005 L64,1619.0005 L44,1619.0005 L44,1599.0005 L54,1599.0005 L54,1603.0005 L64,1603.0005 Z M50.473,1609.4915 L52.049,1609.2635 C52.295,1609.2275 52.508,1609.0725 52.618,1608.8495 L53.322,1607.4215 C53.461,1607.1405 53.73,1607.0005 54,1607.0005 C54.27,1607.0005 54.539,1607.1405 54.678,1607.4215 L55.382,1608.8495 C55.493,1609.0725 55.705,1609.2275 55.952,1609.2635 L57.527,1609.4915 C58.147,1609.5825 58.395,1610.3445 57.946,1610.7815 L56.806,1611.8925 C56.628,1612.0665 56.546,1612.3165 56.589,1612.5615 L56.858,1614.1305 C56.941,1614.6195 56.553,1615.0165 56.113,1615.0165 C55.997,1615.0165 55.877,1614.9885 55.761,1614.9275 L54.352,1614.1865 C54.242,1614.1285 54.121,1614.0995 54,1614.0995 C53.879,1614.0995 53.758,1614.1285 53.648,1614.1865 L52.239,1614.9275 C52.123,1614.9885 52.003,1615.0165 51.887,1615.0165 C51.447,1615.0165 51.059,1614.6195 51.142,1614.1305 L51.411,1612.5615 C51.454,1612.3165 51.372,1612.0665 51.194,1611.8925 L50.054,1610.7815 C49.605,1610.3445 49.853,1609.5825 50.473,1609.4915 L50.473,1609.4915 Z"></path></g></g></g></svg>`;
const newDirectorySvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-376.000000, -1639.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M329.0709,1497.0005 L325.9999,1497.0005 L325.9999,1494.0005 C325.9999,1493.4485 325.5519,1493.0005 324.9999,1493.0005 C324.4479,1493.0005 323.9999,1493.4485 323.9999,1494.0005 L323.9999,1497.0005 L320.9999,1497.0005 C320.4539,1497.0005 320.0079,1497.4395 319.9999,1497.9855 C319.9919,1498.5435 320.4419,1499.0005 320.9999,1499.0005 L323.9999,1499.0005 L323.9999,1502.0005 C323.9999,1502.5525 324.4479,1503.0005 324.9999,1503.0005 C325.5519,1503.0005 325.9999,1502.5525 325.9999,1502.0005 L325.9999,1499.0005 L329.0709,1499.0005 C329.6179,1499.0005 330.0629,1498.5615 330.0709,1498.0155 C330.0789,1497.4575 329.6289,1497.0005 329.0709,1497.0005 M343.9999,1485.0005 L343.9999,1497.2005 C343.9999,1498.1945 343.1789,1499.0005 342.1849,1499.0005 L332.9849,1499.0005 C332.4329,1499.0005 331.9849,1498.5525 331.9849,1498.0005 C331.9849,1497.4485 332.4329,1497.0005 332.9849,1497.0005 L341.1849,1497.0005 C341.6269,1497.0005 341.9999,1496.6425 341.9999,1496.2005 L341.9999,1486.0005 C341.9999,1485.4485 341.5379,1485.0005 340.9849,1485.0005 L333.9849,1485.0005 C332.8809,1485.0005 331.9999,1484.1045 331.9999,1483.0005 L331.9999,1481.8005 C331.9999,1481.3585 331.6269,1481.0005 331.1849,1481.0005 L326.9849,1481.0005 C326.4329,1481.0005 325.9999,1481.4485 325.9999,1482.0005 L325.9999,1490.0005 C325.9999,1490.5525 325.5519,1491.0005 324.9999,1491.0005 C324.4479,1491.0005 323.9999,1490.5525 323.9999,1490.0005 L323.9999,1481.2005 C323.9999,1479.9855 324.9699,1479.0005 326.1849,1479.0005 L331.9849,1479.0005 C333.0899,1479.0005 333.9999,1479.8955 333.9999,1481.0005 L333.9999,1481.8005 C333.9999,1482.4605 334.5249,1483.0005 335.1849,1483.0005 L341.9849,1483.0005 C343.0899,1483.0005 343.9999,1483.8955 343.9999,1485.0005"></path></g></g></g></svg>`;

export function createFileOpener(
  containerElt,
  title,
  { multiple, dir: baseDir = "/userdata/" } = {},
) {
  return new Promise((resolve) => {
    const filePickerContainer = document.createElement("div");
    filePickerContainer.onkeydown = (e) => {
      // TODO: We should have focus inside directly
      if (e.key === "Escape") {
        resolve([]);
      }
    };
    const filePickerElt = createFilePickerElement();

    filePickerElt.appendChild(constructTitleElement(title));

    let pathBarElt = constructPathBarElement(baseDir, navigateToPath);
    filePickerElt.appendChild(pathBarElt);
    let currentPath = baseDir;
    const {
      element: filePickerHeaderElt,
      // XXX TODO:
      enableButton,
      disableButton,
    } = constructAppHeaderLine([
      {
        name: "previous",
        height: "1em",
        title: "Parent directory",
        onClick: () => {
          navigateToParent();
        },
      },
      {
        name: "home",
        height: "1em",
        title: "Home Directory",
        svg: homeDirSvg,
        onClick: () => navigateToPath("/userdata/"),
      },
      {
        name: "upload",
        title: "Upload File",
        onClick: () =>
          uploadFiles(containerElt, filePickerElt, currentPath, navigateToPath),
      },
      {
        name: "newDir",
        height: "1em",
        title: "New Directory",
        svg: newDirectorySvg,
        onClick: async () => {
          const maskContainer = addMaskContainer(filePickerElt);
          const dirName = await askForUserInput(
            maskContainer,
            "New Directory",
            "Enter new directory name:",
          );

          try {
            if (!dirName) {
              removeMaskContainer(maskContainer, filePickerElt);
              return;
            }

            const newDirPath = pathJoin(currentPath, dirName);
            await fs.mkdir(newDirPath);
            navigateToPath(currentPath);
            removeMaskContainer(maskContainer, filePickerElt);
            showAppMessage(
              containerElt,
              `Directory "${dirName}" created successfully`,
            );
          } catch (error) {
            removeMaskContainer(maskContainer, filePickerElt);
            showError(
              containerElt,
              `Failed to create directory: ${error.message}`,
            );
          }
        },
      },
    ]);

    filePickerElt.appendChild(filePickerHeaderElt);

    const directoryContainer = document.createElement("div");
    applyStyle(directoryContainer, {
      flex: "1",
      minHeight: "150px",
      overflow: "auto",
      backgroundColor: "var(--window-content-bg)",
      border: "1px solid var(--window-line-color)",
    });
    filePickerElt.appendChild(directoryContainer);

    navigateToPath(currentPath);
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
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    cancelButton.onclick = () => {
      resolve([]);
    };
    const okButton = document.createElement("button");
    okButton.className = "btn";
    okButton.textContent = "Open";
    applyStyle(okButton, {
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
      backgroundColor: "var(--sidebar-selected-bg-color)",
      color: "var(--sidebar-selected-text-color)",
      border: "1px solid var(--sidebar-selected-bg-color)",
    });
    buttonContainerElt.appendChild(cancelButton);
    buttonContainerElt.appendChild(okButton);
    filePickerStatusBarElt.appendChild(statusElt);
    filePickerStatusBarElt.appendChild(buttonContainerElt);
    filePickerElt.appendChild(filePickerStatusBarElt);

    filePickerContainer.appendChild(filePickerElt);
    containerElt.appendChild(filePickerContainer);

    function navigateToPath(path) {
      if (path === "/") {
        disableButton("previous");
      } else {
        enableButton("previous");
      }

      if (path.startsWith("/userdata/") || path === "/userdata") {
        if (path === "/userdata/" || path === "/userdata") {
          disableButton("home");
        } else {
          enableButton("home");
        }
        enableButton("newDir");
        enableButton("newFile");
        enableButton("upload");
      } else {
        enableButton("home");
        disableButton("newDir");
        disableButton("newFile");
        disableButton("upload");
      }
      currentPath = path;
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
    function navigateToParent() {
      if (currentPath === "/") {
        return;
      }
      if (currentPath[currentPath.length - 1] === "/") {
        currentPath = currentPath.substring(0, currentPath.length - 1);
      }
      navigateToPath(
        currentPath.substring(0, currentPath.lastIndexOf("/") + 1),
      );
    }
  });
}

function uploadFiles(containerElt, filePickerElt, currentPath, navigateToPath) {
  const maskContainer = addMaskContainer(filePickerElt);
  const fileInputElt = document.createElement("input");
  fileInputElt.style.display = "none";
  containerElt.appendChild(fileInputElt);
  fileInputElt.type = "file";
  fileInputElt.accept = "image/*";
  fileInputElt.multiple = true;
  fileInputElt.click();
  fileInputElt.addEventListener("cancel", async () => {
    removeMaskContainer(maskContainer, filePickerElt);
    fileInputElt.remove();
  });
  fileInputElt.addEventListener("error", async () => {
    removeMaskContainer(maskContainer, filePickerElt);
    fileInputElt.remove();
    showError(containerElt, `Failed to get files from your computer`);
  });
  fileInputElt.addEventListener("change", async (e) => {
    const files = e.target.files;
    if (files.length === 0) {
      removeMaskContainer(maskContainer, filePickerElt);
      fileInputElt.remove();
      return;
    }
    try {
      for (const file of files) {
        const filePath = pathJoin(currentPath, file.name);
        const fileAB = await file.arrayBuffer();
        await fs.writeFile(filePath, fileAB);
      }
      navigateToPath(currentPath);
      removeMaskContainer(maskContainer, filePickerElt);
      fileInputElt.remove();
      showAppMessage(containerElt, `File(s) uploaded successfully`);
    } catch (error) {
      removeMaskContainer(maskContainer, filePickerElt);
      fileInputElt.remove();
      showError(containerElt, `Failed to upload file: ${error.message}`);
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

    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) {
        return -1;
      }
      if (!a.isDirectory && b.isDirectory) {
        return 1;
      }
      return a.name.localeCompare(b.name);
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
          "You do not have anything stored in your user directory yet.<br><br><i>Start by uploading or saving some files in it first!</i>";
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
            if (item.isDirectory) {
              navigateTo(item.path);
            } else if (selectedElts.paths.has(item.path)) {
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
                prevElement.focus({ preventScroll: true });
              }
            }
            break;

          case "ArrowRight":
            {
              // TODO: Also handle when focus is not on an element?
              // TODO: Also backspace?
              e.preventDefault();
              const nextElement = itemElt.nextElementSibling;
              if (nextElement) {
                nextElement.focus({ preventScroll: true });
              }
            }
            break;
        }
      };
      itemElt.onclick = (e) => {
        itemElt.focus({ preventScroll: true });
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
    overflow: "auto",
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

async function askForUserInput(
  containerElt,
  title,
  message,
  defaultValue = "",
) {
  return new Promise((resolve) => {
    // applyStyle(containerElt, {
    //   display: "flex",
    //   // padding: "20px",
    //   // border: "1px solid var(--window-line-color)",
    // });
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

    const promptInputElt = strHtml`<input type="text" value="${defaultValue}">`;
    applyStyle(promptInputElt, {
      width: "100%",
      padding: "8px",
      marginBottom: "15px",
    });
    const cancelButtonElt = strHtml`<button class="btn">Cancel</button>`;
    applyStyle(cancelButtonElt, {
      marginRight: "10px",
    });
    const okButtonElt = strHtml`<button class="btn">OK</button>`;
    {
    }
    const innerElt = strHtml`
			<div>
        <h3 style="color: var(--app-primary-color); margin-top: 0; margin-bottom: 15px;">${title}</h3>
				<p style="margin-bottom: 15px;">${message}</p>
				${promptInputElt}
				<div style="display: flex; justify-content: flex-end;">
					${cancelButtonElt}
					${okButtonElt}
				</div>
			</div>
		`;
    applyStyle(innerElt, {
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
    containerElt.appendChild(innerElt);

    promptInputElt.focus();
    promptInputElt.select();

    okButtonElt.addEventListener("click", onOk);
    cancelButtonElt.addEventListener("click", onCancel);

    promptInputElt.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        onOk();
      }
      if (e.key === "Escape") {
        onCancel();
      }
    });

    function onOk() {
      containerElt.style.display = "none";
      resolve(promptInputElt.value);
    }

    function onCancel() {
      containerElt.style.display = "none";
      resolve(null);
    }
  });
}

function addMaskContainer(filePickerElt) {
  const maskContainer = document.createElement("div");
  applyStyle(maskContainer, {
    position: "absolute",
    top: "0",
    left: "0",
    height: "100%",
    width: "100%",
  });
  for (const child of filePickerElt.children) {
    child.setAttribute("inert", true);
  }
  filePickerElt.appendChild(maskContainer);
  return maskContainer;
}
function removeMaskContainer(maskContainer, filePickerElt) {
  maskContainer.remove();
  for (const child of filePickerElt.children) {
    child.removeAttribute("inert");
  }
}
