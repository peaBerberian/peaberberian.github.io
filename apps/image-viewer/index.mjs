// TODO: Watch local image file and reload it automagically? Will need to add
// watch mechanism to args+filePickerOpen objects
// TODO: experience is shit on tactile devices: implement swipe+zoom with gestures?
// TODO: Zoom reset also centers (just renamed reset?)

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

const rotateLeftSvg = `<svg style="transform: scale(-1, 1)" width="800px" height="800px" viewBox="-1 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-342.000000, -7080.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M300.002921,6930.85894 C299.524118,6934.16792 296.32507,6936.61291 292.744585,6935.86392 C290.471022,6935.38792 288.623062,6933.55693 288.145263,6931.29294 C287.32919,6927.42196 290.007276,6923.99998 294.022397,6923.99998 L294.022397,6925.99997 L299.041299,6922.99998 L294.022397,6920 L294.022397,6921.99999 C289.003495,6921.99999 285.16002,6926.48297 286.158782,6931.60494 C286.767072,6934.72392 289.294592,6937.23791 292.425383,6937.8439 C297.170253,6938.7619 301.37007,6935.51592 301.990406,6931.12594 C302.074724,6930.52994 301.591905,6929.99995 300.988633,6929.99995 L300.989637,6929.99995 C300.490758,6929.99995 300.074189,6930.36694 300.002921,6930.85894"></path></g></g></g></svg>`;
const rotateRightSvg = `<svg style="transform: scale(1, 1)" width="800px" height="800px" viewBox="-1 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-342.000000, -7080.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M300.002921,6930.85894 C299.524118,6934.16792 296.32507,6936.61291 292.744585,6935.86392 C290.471022,6935.38792 288.623062,6933.55693 288.145263,6931.29294 C287.32919,6927.42196 290.007276,6923.99998 294.022397,6923.99998 L294.022397,6925.99997 L299.041299,6922.99998 L294.022397,6920 L294.022397,6921.99999 C289.003495,6921.99999 285.16002,6926.48297 286.158782,6931.60494 C286.767072,6934.72392 289.294592,6937.23791 292.425383,6937.8439 C297.170253,6938.7619 301.37007,6935.51592 301.990406,6931.12594 C302.074724,6930.52994 301.591905,6929.99995 300.988633,6929.99995 L300.989637,6929.99995 C300.490758,6929.99995 300.074189,6930.36694 300.002921,6930.85894"></path></g></g></g></svg>`;
const zoomInSvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11ZM11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C13.125 20 15.078 19.2635 16.6177 18.0319L20.2929 21.7071C20.6834 22.0976 21.3166 22.0976 21.7071 21.7071C22.0976 21.3166 22.0976 20.6834 21.7071 20.2929L18.0319 16.6177C19.2635 15.078 20 13.125 20 11C20 6.02944 15.9706 2 11 2Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 14C10 14.5523 10.4477 15 11 15C11.5523 15 12 14.5523 12 14V12H14C14.5523 12 15 11.5523 15 11C15 10.4477 14.5523 10 14 10H12V8C12 7.44772 11.5523 7 11 7C10.4477 7 10 7.44772 10 8V10H8C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12H10V14Z" fill="currentColor"/></svg>`;
const zoomOutSvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11ZM11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C13.125 20 15.078 19.2635 16.6177 18.0319L20.2929 21.7071C20.6834 22.0976 21.3166 22.0976 21.7071 21.7071C22.0976 21.3166 22.0976 20.6834 21.7071 20.2929L18.0319 16.6177C19.2635 15.078 20 13.125 20 11C20 6.02944 15.9706 2 11 2Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 11C7 10.4477 7.44772 10 8 10H14C14.5523 10 15 10.4477 15 11C15 11.5523 14.5523 12 14 12H8C7.44772 12 7 11.5523 7 11Z" fill="currentColor"/></svg>`;
const zoomResetSvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11ZM11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C13.125 20 15.078 19.2635 16.6177 18.0319L20.2929 21.7071C20.6834 22.0976 21.3166 22.0976 21.7071 21.7071C22.0976 21.3166 22.0976 20.6834 21.7071 20.2929L18.0319 16.6177C19.2635 15.078 20 13.125 20 11C20 6.02944 15.9706 2 11 2Z" fill="currentColor"/></svg>`;

export function create(args, env, parentAbortSignal) {
  const { constructAppHeaderLine } = env.appUtils;
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: env.STYLE.bgColor,
  });
  const spinnerContainerElt = createSpinnerElt();
  containerElt.appendChild(spinnerContainerElt);

  /**
   * @type {AbortController|null}
   */
  let currentImageAbortController = null;

  /**
   * @type {Array.<{filename: string, imgElt: HTMLImageElement }>}
   */
  let loadedImages = [];

  let currentImageIndex = -1;
  const imageTransformMap = new WeakMap();

  const {
    element: headerElt,
    enableButton,
    disableButton,
  } = constructAppHeaderLine([
    {
      name: "upload",
      onClick: () => {
        blockUi();
        // Trick to open the file picker
        const fileInputElt = document.createElement("input");
        fileInputElt.type = "file";
        fileInputElt.accept = "image/*";
        fileInputElt.multiple = true;
        fileInputElt.click();
        fileInputElt.addEventListener("cancel", async () => {
          try {
            await handleInputedFiles([]);
          } catch (err) {
            showMessage(appContentAreaElt, "❌ " + err.toString(), 5000);
          }
          unblockUi();
        });
        fileInputElt.addEventListener("error", async () => {
          unblockUi();
          showMessage(
            appContentAreaElt,
            "❌ Failed to open your file-picker",
            5000,
          );
        });
        fileInputElt.addEventListener("change", async (e) => {
          const files = e.target.files;
          try {
            await handleInputedFiles(files);
          } catch (err) {
            showMessage(appContentAreaElt, "❌ " + err.toString(), 5000);
          }
          unblockUi();
        });
      },
    },
    {
      name: "open",
      onClick: () => {
        blockUi();
        env
          .filePickerOpen({
            title: "Open an image from files stored on this Web Desktop",
            allowMultipleSelections: true,
          })
          .then((filesInfo) => openFiles(filesInfo))
          .then(() => unblockUi())
          .catch((err) => {
            showMessage(appContentAreaElt, "❌ " + err.toString(), 5000);
            unblockUi();
          });
      },
    },
    { name: "separator" },
    {
      name: "previous",
      height: "1.4rem",
      title: "Previous image",
      onClick: showPreviousImage,
    },
    {
      name: "next",
      height: "1.4rem",
      title: "Next image",
      onClick: showNextImage,
    },
    { name: "separator" },
    {
      name: "rotateLeft",
      svg: rotateLeftSvg,
      height: "1.4rem",
      title: "Rotate left",
      onClick: rotateLeft,
    },
    {
      name: "rotateRight",
      svg: rotateRightSvg,
      height: "1.4rem",
      title: "Rotate right",
      onClick: rotateRight,
    },
    { name: "separator" },
    {
      name: "zoomOut",
      svg: zoomOutSvg,
      height: "1.6rem",
      title: "Zoom out",
      onClick: zoomOut,
    },
    {
      name: "zoomReset",
      svg: zoomResetSvg,
      height: "1.6rem",
      title: "Reset zoom",
      onClick: resetZoom,
    },
    {
      name: "zoomIn",
      svg: zoomInSvg,
      height: "1.6rem",
      title: "Zoom in",
      onClick: zoomIn,
    },
  ]);
  containerElt.appendChild(headerElt);

  disableButton("previous");
  disableButton("next");
  disableButton("rotateLeft");
  disableButton("rotateRight");
  disableButton("zoomOut");
  disableButton("zoomReset");
  disableButton("zoomIn");

  const appContentAreaElt = document.createElement("div");
  applyStyle(appContentAreaElt, {
    flex: "1",
    position: "relative",
  });

  const imgContainerElt = document.createElement("div");
  applyStyle(imgContainerElt, {
    flex: "1",
    display: "flex",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    textAlign: "center",
    height: "100%",
    backgroundColor: env.STYLE.disabledColor,
  });

  // Drag and drop handling
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    imgContainerElt.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      false,
    );
  });
  ["dragenter", "dragover"].forEach((eventName) => {
    imgContainerElt.addEventListener(eventName, highlightDropZone);
  });
  ["dragleave", "drop"].forEach((eventName) => {
    imgContainerElt.addEventListener(eventName, unhighlightDropZone);
  });
  imgContainerElt.addEventListener("drop", async (e) => {
    blockUi();
    const dt = e.dataTransfer;
    const files = dt.files;
    try {
      await handleInputedFiles(files);
    } catch (err) {
      showMessage(appContentAreaElt, "❌ " + err.toString(), 5000);
    }
    unblockUi();
  });

  appContentAreaElt.appendChild(imgContainerElt);
  containerElt.appendChild(appContentAreaElt);

  const statusBarElt = document.createElement("div");
  applyStyle(statusBarElt, {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 8px",
    backgroundColor: env.STYLE.barBg,
    borderTop: env.STYLE.lineColor,
  });
  containerElt.appendChild(statusBarElt);

  updateStatusBar();

  // Handle interactions on image container

  // Zoom with wheel
  appContentAreaElt.addEventListener(
    "wheel",
    (e) => {
      const imageInfo = loadedImages[currentImageIndex];
      if (!imageInfo) {
        return;
      }
      const imgElt = imageInfo.imgElt;
      const imgState = imageTransformMap.get(imgElt);
      if (!imgState) {
        return;
      }
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      imgState.scale = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, imgState.scale + delta),
      );
      updateImageTransform(imgElt);
    },
    { passive: false },
  );

  // Double click to reset
  appContentAreaElt.addEventListener("dblclick", () => {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    resetTransforms(imageInfo.imgElt);
  });

  updateDisplayedImage();

  {
    const initialFiles = [];
    for (const opt of args) {
      if (opt.type === "file") {
        initialFiles.push(opt);
      }
    }
    if (initialFiles.length > 0) {
      openFiles(initialFiles);
    }
  }

  handleTouchInteractions();

  return {
    element: containerElt,
    onActivate: () => {
      document.addEventListener("keydown", onKeyDown);
    },
    onDeactivate: () => {
      document.removeEventListener("keydown", onKeyDown);
    },
  };

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyDown(e) {
    switch (e.key) {
      case "ArrowRight":
        showNextImage();
        break;
      case "ArrowLeft":
        showPreviousImage();
        break;
      case "+":
        zoomIn();
        break;
      case "-":
        zoomOut();
        break;
    }
  }

  function getCurrentImagePosition() {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    const imgState = imageTransformMap.get(imageInfo.imgElt);
    if (!imgState) {
      return { x: 0, y: 0 };
    }
    return {
      x: imgState.translateX,
      y: imgState.translateY,
    };
  }

  function setCurrentImagePosition(x, y) {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    const imgElt = imageInfo.imgElt;
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState || !imgElt) {
      return;
    }
    imgState.translateX = x;
    imgState.translateY = y;
    updateImageTransform(imgElt);
  }

  function clear() {
    imgContainerElt.innerHTML = "";
    loadedImages.length = 0;
    currentImageIndex = -1;
    disableButton("previous");
    disableButton("next");
    disableButton("rotateLeft");
    disableButton("rotateRight");
    disableButton("zoomOut");
    disableButton("zoomReset");
    disableButton("zoomIn");
  }

  function handleInputedFiles(files) {
    return new Promise((resolve, reject) => {
      if (files.length === 0) {
        resolve();
        return;
      }
      clear();

      let leftImgToProcess = files.length;
      let lastError = null;
      const onImageProcessed = () => {
        leftImgToProcess--;
        if (leftImgToProcess <= 0) {
          enableButton("upload");
          enableButton("open");
          if (lastError) {
            reject(lastError);
          } else {
            resolve();
          }
        }
      };
      for (const file of files) {
        disableButton("upload");
        disableButton("open");
        const imgElt = document.createElement("img");
        applyStyle(imgElt, {
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          userSelect: "none",
          position: "absolute",
        });
        imgElt.draggable = false;
        imageTransformMap.set(imgElt, {
          scale: 1,
          rotation: 0,
          translateX: 0,
          translateY: 0,
        });
        updateImageTransform(imgElt);
        const reader = new FileReader();

        reader.onerror = () => {
          reader.onload = null;
          reader.onabort = null;
          lastError = new Error("Failed to read a file's data.");
          onImageProcessed();
        };
        reader.onabort = () => {
          reader.onload = null;
          reader.onerror = null;
          onImageProcessed();
        };
        reader.onload = (event) => {
          reader.onerror = null;
          reader.onabort = null;
          imgElt.src = event.target.result;
          imgElt.onload = onImageProcessed;
          imgElt.onabort = onImageProcessed;
          imgElt.onerror = () => {
            imgElt.onload = null;
            imgElt.onabort = null;
            lastError = new Error(
              "Failed to load a file. Are you sure this is an image?",
            );
            onImageProcessed();

            imgElt.remove();
            for (let i = 0; i < loadedImages.length; i++) {
              if (loadedImages[i].imgElt === imgElt) {
                loadedImages.splice(i, 1);

                if (i !== currentImageIndex) {
                  updateStatusBar();
                } else {
                  if (currentImageIndex >= loadedImages.length) {
                    currentImageIndex = 0;
                  }
                  updateDisplayedImage();
                  updateStatusBar();
                }
              }
            }
          };
          imgContainerElt.appendChild(imgElt);
          loadedImages.push({ imgElt, filename: file.name });
          if (currentImageIndex === -1) {
            currentImageIndex = 0;
            enableButton("rotateLeft");
            enableButton("rotateRight");
          } else {
            enableButton("previous");
            enableButton("next");
          }
          updateDisplayedImage();
          updateStatusBar();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function zoomOut() {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    const imgElt = imageInfo.imgElt;
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState) {
      return;
    }
    imgState.scale = Math.max(MIN_ZOOM, imgState.scale - 0.1);
    updateImageTransform(imgElt);
  }

  function zoomIn() {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    const imgElt = imageInfo.imgElt;
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState) {
      return;
    }
    imgState.scale = Math.min(MAX_ZOOM, imgState.scale + 0.1);
    updateImageTransform(imgElt);
  }

  function resetZoom() {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    const imgElt = imageInfo.imgElt;
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState) {
      return;
    }
    imgState.scale = 1;
    updateImageTransform(imgElt);
  }

  function updateStatusBar() {
    const imageCounterElt = document.createElement("div");
    statusBarElt.innerHTML = "";
    if (loadedImages.length === 0) {
      imageCounterElt.textContent = "No image loaded";
      statusBarElt.appendChild(imageCounterElt);
    } else {
      imageCounterElt.textContent = `Image ${currentImageIndex + 1} / ${loadedImages.length}`;
      const imageNameElt = document.createElement("div");
      const filename = loadedImages[currentImageIndex]?.filename ?? "Untitled";
      imageNameElt.textContent = filename;
      env.updateTitle(null /* keep same icon */, filename + " - Image Viewer");
      statusBarElt.appendChild(imageCounterElt);
      statusBarElt.appendChild(imageNameElt);
    }
  }

  function rotateLeft() {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    const imgElt = imageInfo.imgElt;
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState) {
      return;
    }
    imgState.rotation = (imgState.rotation - 90) % 360;
    updateImageTransform(imgElt);
  }
  function rotateRight() {
    const imageInfo = loadedImages[currentImageIndex];
    if (!imageInfo) {
      return;
    }
    const imgElt = imageInfo.imgElt;
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState) {
      return;
    }
    imgState.rotation = (imgState.rotation + 90) % 360;
    updateImageTransform(imgElt);
  }

  function updateImageTransform(imgElt) {
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState) {
      return;
    }
    imgElt.style.transform =
      `translate(${imgState.translateX}px, ${imgState.translateY}px) ` +
      `scale(${imgState.scale}) ` +
      `rotate(${imgState.rotation}deg)`;
    if (imgState.scale === 1) {
      disableButton("zoomReset");
    } else {
      enableButton("zoomReset");
    }
    if (imgState.scale <= MIN_ZOOM) {
      disableButton("zoomOut");
    } else {
      enableButton("zoomOut");
    }
    if (imgState.scale >= MAX_ZOOM) {
      disableButton("zoomIn");
    } else {
      enableButton("zoomIn");
    }
  }

  function resetTransforms(imgElt) {
    const imgState = imageTransformMap.get(imgElt);
    if (!imgState) {
      return;
    }
    imgState.scale = 1;
    imgState.rotation = 0;
    imgState.translateX = 0;
    imgState.translateY = 0;
    updateImageTransform(imgElt);
  }

  function showPreviousImage() {
    if (loadedImages.length <= 1) {
      return;
    }
    currentImageIndex =
      (currentImageIndex - 1 + loadedImages.length) % loadedImages.length;
    updateDisplayedImage();
  }

  function updateDisplayedImage() {
    currentImageAbortController?.abort();
    currentImageAbortController = null;
    if (loadedImages.length === 0) {
      imgContainerElt.innerHTML = "";
      currentImageIndex = -1;
      const noImgTextElt = document.createElement("div");
      noImgTextElt.innerHTML =
        "No image loaded<br>Load one (or multiple) image(s) first.";
      applyStyle(noImgTextElt, {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        color: env.STYLE.textColor,
        fontStyle: "italic",
        // fontSize: "1.5rem",
      });
      disableButton("previous");
      disableButton("next");
      disableButton("rotateLeft");
      disableButton("rotateRight");
      disableButton("zoomOut");
      disableButton("zoomReset");
      disableButton("zoomIn");
      imgContainerElt.appendChild(noImgTextElt);
    } else {
      for (let i = 0; i < loadedImages.length; i++) {
        if (i === currentImageIndex) {
          resetTransforms(loadedImages[i].imgElt);

          currentImageAbortController = new AbortController();
          const imgElt = loadedImages[i].imgElt;
          imgElt.style.display = "block";
          linkAbortControllerToSignal(
            currentImageAbortController,
            parentAbortSignal,
          );
          handleImageDragging(
            imgElt,
            {
              getImagePosition: getCurrentImagePosition,
              setImagePosition: setCurrentImagePosition,
            },
            currentImageAbortController.signal,
          );
        } else {
          loadedImages[i].imgElt.style.display = "none";
        }
      }
    }
    updateStatusBar();
  }

  function showNextImage() {
    if (loadedImages.length <= 1) {
      return;
    }
    currentImageIndex = (currentImageIndex + 1) % loadedImages.length;
    updateDisplayedImage();
  }
  function highlightDropZone() {
    imgContainerElt.style.backgroundColor = env.STYLE.primaryColor;
  }
  function unhighlightDropZone() {
    imgContainerElt.style.backgroundColor = env.STYLE.disabledColor;
  }

  function openFiles(files) {
    return new Promise((resolve, reject) => {
      if (files.length === 0) {
        updateDisplayedImage();
        updateStatusBar();
        resolve();
        return;
      }
      clear();

      let leftImgToProcess = files.length;
      let lastError = null;
      const onImageProcessed = () => {
        leftImgToProcess--;
        if (leftImgToProcess <= 0) {
          if (lastError) {
            reject(lastError);
          } else {
            resolve();
          }
        }
      };
      for (const file of files) {
        const imgElt = document.createElement("img");
        applyStyle(imgElt, {
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          userSelect: "none",
          position: "absolute",
        });
        imgElt.draggable = false;
        imageTransformMap.set(imgElt, {
          scale: 1,
          rotation: 0,
          translateX: 0,
          translateY: 0,
        });

        const { filename, data: arrayBuffer } = file;
        const mimeType = guessMimeType(filename, arrayBuffer);
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const imgUrl = URL.createObjectURL(blob);
        updateImageTransform(imgElt);
        imgElt.src = imgUrl;
        imgElt.onload = onImageProcessed;
        imgElt.onabort = onImageProcessed;
        imgElt.onerror = () => {
          lastError = new Error(
            "Failed to load a file. Are you sure this is an image?",
          );
          URL.revokeObjectURL(imgUrl);
          onImageProcessed();
          imgElt.remove();
          for (let i = 0; i < loadedImages.length; i++) {
            if (loadedImages[i].imgElt === imgElt) {
              loadedImages.splice(i, 1);

              if (i !== currentImageIndex) {
                updateStatusBar();
              } else {
                if (currentImageIndex >= loadedImages.length) {
                  currentImageIndex = 0;
                }
                updateDisplayedImage();
                updateStatusBar();
              }
            }
          }
        };
        imgContainerElt.appendChild(imgElt);
        loadedImages.push({ imgElt, filename });
        if (currentImageIndex === -1) {
          currentImageIndex = 0;
          enableButton("rotateLeft");
          enableButton("rotateRight");
        } else {
          enableButton("previous");
          enableButton("next");
        }
        updateDisplayedImage();
        updateStatusBar();
      }
    });
  }

  function blockUi() {
    spinnerContainerElt.style.display = "flex";
    containerElt.style.opacity = 0.5;
    containerElt.setAttribute("inert", true);
  }
  function unblockUi() {
    spinnerContainerElt.style.display = "none";
    containerElt.style.opacity = 1;
    containerElt.removeAttribute("inert");
  }

  // TODO: externalize function
  function handleTouchInteractions() {
    // Touch interactions
    let touchState = {
      swipeStartX: 0,
      swipeStartY: 0,
      swipeStartTime: 0,
      isSwipeGesture: false,
      lastTouchDistance: 0,
      lastTouchCenterX: 0,
      lastTouchCenterY: 0,
      isPinching: false,
      isPanning: false,
      panStartX: 0,
      panStartY: 0,
      panInitialImgX: 0,
      panInitialImgY: 0,
      initialPinchScale: 1,
      initialPinchX: 0,
      initialPinchY: 0,
    };

    appContentAreaElt.addEventListener(
      "touchstart",
      (e) => {
        const imageInfo = loadedImages[currentImageIndex];
        if (!imageInfo) {
          return;
        }

        if (e.touches.length === 1) {
          // Single touch - could be swipe or pan
          const touch = e.touches[0];
          touchState.swipeStartX = touch.clientX;
          touchState.swipeStartY = touch.clientY;
          touchState.swipeStartTime = Date.now();
          touchState.isSwipeGesture = true;
          touchState.isPinching = false;
          touchState.isPanning = false;

          // Prepare for potential panning
          touchState.panStartX = touch.clientX;
          touchState.panStartY = touch.clientY;
          const imgPosition = getCurrentImagePosition();
          if (imgPosition) {
            touchState.panInitialImgX = imgPosition.x;
            touchState.panInitialImgY = imgPosition.y;
          }
        } else if (e.touches.length === 2) {
          // Two touches - pinch to zoom
          e.preventDefault();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];

          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2),
          );

          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;

          touchState.lastTouchDistance = distance;
          touchState.lastTouchCenterX = centerX;
          touchState.lastTouchCenterY = centerY;
          touchState.isPinching = true;
          touchState.isSwipeGesture = false;
          touchState.isPanning = false;

          const imgState = imageTransformMap.get(imageInfo.imgElt);
          if (imgState) {
            touchState.initialPinchScale = imgState.scale;
            touchState.initialPinchX = imgState.translateX;
            touchState.initialPinchY = imgState.translateY;
          }
        }
      },
      { passive: false },
    );

    appContentAreaElt.addEventListener(
      "touchmove",
      (e) => {
        const imageInfo = loadedImages[currentImageIndex];
        if (!imageInfo) {
          return;
        }

        if (e.touches.length === 2 && touchState.isPinching) {
          e.preventDefault();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];

          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2),
          );

          const scale = distance / touchState.lastTouchDistance;
          const imgState = imageTransformMap.get(imageInfo.imgElt);

          if (imgState) {
            const newScale = Math.max(
              MIN_ZOOM,
              Math.min(MAX_ZOOM, touchState.initialPinchScale * scale),
            );
            imgState.scale = newScale;
            updateImageTransform(imageInfo.imgElt);
          }
        } else if (e.touches.length === 1) {
          const touch = e.touches[0];
          const deltaX = touch.clientX - touchState.swipeStartX;
          const deltaY = touch.clientY - touchState.swipeStartY;
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          const imgState = imageTransformMap.get(imageInfo.imgElt);
          const isZoomed = imgState && imgState.scale > 1.1;

          // Determine gesture type based on movement and zoom level
          if (!touchState.isPanning && touchState.isSwipeGesture) {
            if (isZoomed && absY > 10) {
              // If zoomed and vertical movement, switch to panning
              touchState.isSwipeGesture = false;
              touchState.isPanning = true;
            } else if (!isZoomed && absX > 20 && absX > absY) {
              // If not zoomed and horizontal movement, keep as swipe
              // Do nothing, let it continue as swipe
            } else if (absX > 10 || absY > 10) {
              // Some movement detected, decide based on zoom and direction
              if (isZoomed || absY > absX) {
                touchState.isSwipeGesture = false;
                touchState.isPanning = true;
              }
            }
          }

          if (touchState.isPanning) {
            e.preventDefault();
            setCurrentImagePosition(
              touchState.panInitialImgX + touch.clientX - touchState.panStartX,
              touchState.panInitialImgY + touch.clientY - touchState.panStartY,
            );
          } else if (touchState.isSwipeGesture && absY > absX && absY > 30) {
            // If movement is too vertical for swipe, disable it
            touchState.isSwipeGesture = false;
          }
        }
      },
      { passive: false },
    );

    appContentAreaElt.addEventListener(
      "touchend",
      (e) => {
        const imageInfo = loadedImages[currentImageIndex];
        if (!imageInfo) {
          return;
        }

        if (touchState.isSwipeGesture && e.changedTouches.length === 1) {
          const touch = e.changedTouches[0];
          const deltaX = touch.clientX - touchState.swipeStartX;
          const deltaY = touch.clientY - touchState.swipeStartY;
          const deltaTime = Date.now() - touchState.swipeStartTime;

          // Check if it's a valid swipe (horizontal movement, reasonable speed)
          const minSwipeDistance = 50;
          const maxSwipeTime = 500;
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (
            absX > minSwipeDistance &&
            absX > absY &&
            deltaTime < maxSwipeTime
          ) {
            if (deltaX > 0) {
              // Swipe right - previous image
              showPreviousImage();
            } else {
              // Swipe left - next image
              showNextImage();
            }
          }
        }

        touchState.isPinching = false;
        touchState.isSwipeGesture = false;
        touchState.isPanning = false;
      },
      { passive: false },
    );
  }
}

function handleImageDragging(
  imageElement,
  { getImagePosition, setImagePosition },
  abortSignal,
) {
  let startX = 0;
  let startY = 0;
  let initialImgX = 0;
  let initialImgY = 0;
  let isDraggingImag = false;

  imageElement.style.cursor = "grab";

  // Mouse events only - touch events are handled by main touch handlers
  const onMouseDown = (e) => {
    if (e.button !== 0) {
      // not left click
      return;
    }
    e.preventDefault();
    isDraggingImag = true;
    startX = e.clientX;
    startY = e.clientY;

    const { x, y } = getImagePosition();
    initialImgX = x;
    initialImgY = y;
    imageElement.style.cursor = "grabbing";
  };

  const onMouseMove = (e) => {
    if (!isDraggingImag) {
      return;
    }
    setImagePosition(
      initialImgX + e.clientX - startX,
      initialImgY + e.clientY - startY,
    );
  };

  const onMouseUp = () => {
    if (!isDraggingImag) {
      return;
    }
    isDraggingImag = false;
    imageElement.style.cursor = "grab";
  };

  const onSelectStart = (e) => e.preventDefault();

  // Add mouse event listeners
  imageElement.addEventListener("mousedown", onMouseDown);

  // Safari just selects all over the place like some maniac without this
  imageElement.addEventListener("selectstart", onSelectStart);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  abortSignal.addEventListener("abort", () => {
    imageElement.removeEventListener("mousedown", onMouseDown);
    imageElement.removeEventListener("selectstart", onSelectStart);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  });
}

function showMessage(containerElt, message, duration = 5000) {
  const messageElt = document.createElement("div");
  messageElt.textContent = message;
  applyStyle(messageElt, {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "4px",
    zIndex: "1000",
    transition: "opacity 0.3s",
    textAlign: "center",
  });

  containerElt.appendChild(messageElt);

  setTimeout(() => {
    messageElt.style.opacity = "0";
    // After animation, remove
    setTimeout(() => {
      messageElt.remove();
    }, 350);
  }, duration);
}

function linkAbortControllerToSignal(abortController, parentAbortSignal) {
  const onParentAbort = () => abortController.abort();
  parentAbortSignal.addEventListener("abort", onParentAbort);
  abortController.signal.addEventListener("abort", () => {
    parentAbortSignal.removeEventListener("abort", onParentAbort);
  });
}

function guessMimeType(filename, arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4)); // Check first 4 bytes
  const signature = Array.from(uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  switch (signature) {
    case "89504E47":
      return "image/png";
    case "FFD8FFDB":
    case "FFD8FFE0":
    case "FFD8FFE1":
      return "image/jpeg";
    case "47494638":
      return "image/gif";
    case "52494646":
      return "image/webp";
    case "49492A00":
    case "4D4D002A":
      return "image/tiff";
    default: {
      const extension = getFileExtension(filename);
      if (extension) {
        if (extension === "svg") {
          return "image/svg+xml";
        }
        if (extension === "ico") {
          return "image/x-icon";
        }
        return `image/${extension}`;
      }
      return "application/octet-stream"; // Fallback
    }
  }
}
function getFileExtension(filename) {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex === -1 ? "" : filename.slice(dotIndex + 1).toLowerCase();
}

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}

function createSpinnerElt() {
  const spinnerContainerElt = document.createElement("div");
  applyStyle(spinnerContainerElt, {
    display: "none",
    position: "absolute",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
  });
  const spinnerElt = document.createElement("div");
  spinnerElt.className = "spinner";
  spinnerContainerElt.appendChild(spinnerElt);
  return spinnerContainerElt;
}
