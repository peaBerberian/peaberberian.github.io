import handleResizeOnCanvas from "./resize.mjs";
import {
  eraserSvg,
  brushSvg,
  lineSvg,
  squareSvg,
  circleSvg,
  filledSquareSvg,
  filledCircleSvg,
  cursorSvg,
  crosshairCursor,
  bucketSvg,
} from "./svgs.mjs";
import { applyStyle } from "./utils.mjs";

const DEFAULT_CANVAS_HEIGHT = 800;
const DEFAULT_CANVAS_WIDTH = 800;

// TODO: clean-up code!
// TODO: bucket (or all operations really) in a Worker with a canvas delocalized to it?

export function create(_args, env, abortSignal) {
  const { constructAppHeaderLine } = env.appUtils;

  // TODO:  factorize all this. As this was one of the first app, I just wrote
  // it too fast without thinking about organization yet.

  let lastX = 0;
  let lastY = 0;
  let startX = 0;
  let startY = 0;
  let isDrawing = false;
  let currentTool = "Brush";
  let currentColor = "#000000";
  let currentSize = 15;
  let hasSomethingDrawnOnCanvas = false;
  let hasUpdatesToSave = true;
  let currentFile = null;
  let resizingState = null;
  let isResizing = false;

  const history = [];
  let historyIndex = 0;

  const wrapperElt = document.createElement("div");
  applyStyle(wrapperElt, {
    height: "100%",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  });
  const spinnerContainerElt = createSpinnerElt();
  wrapperElt.appendChild(spinnerContainerElt);
  const {
    element: headerElt,
    enableButton,
    disableButton,
  } = constructAppHeaderLine([
    { name: "upload", onClick: onUploadClick },
    // To still work as expected just in case the app is "installed" without the
    // `filePickerOpen` dependency enabled, just remove the button when it's not
    // possible.
    ...(env.filePickerOpen ? [{ name: "open", onClick: onOpenClick }] : []),
    { name: "separator" },
    { name: "undo", onClick: undo },
    { name: "redo", onClick: redo },
    {
      name: "clear",
      onClick: () => {
        const hadSomethingDrawn = hasSomethingDrawnOnCanvas;
        clearCanvas();
        if (hadSomethingDrawn) {
          hasUpdatesToSave = true;
          saveCurrentState();
        }
      },
    },
    { name: "separator" },
    { name: "download", onClick: downloadImage },
    ...(env.quickSave ? [{ name: "quick-save", onClick: quickSave }] : []),
    ...(env.filePickerSave ? [{ name: "save", onClick: saveFile }] : []),
  ]);
  disableButton("undo");
  disableButton("redo");
  disableButton("clear");
  disableButton("quick-save");
  wrapperElt.appendChild(headerElt);
  const contentElt = document.createElement("div");
  applyStyle(contentElt, {
    height: "100%",
    width: "100%",
    overflow: "hidden",
    display: "flex",
  });
  wrapperElt.appendChild(contentElt);

  const toolbarElt = document.createElement("div");
  applyStyle(toolbarElt, {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: env.STYLE.barBg,
    borderRight: env.STYLE.lineColor,
    alignItems: "center",
    overflow: "auto",
    flexShrink: "0",
  });
  contentElt.appendChild(toolbarElt);
  const restOfAppElt = document.createElement("div");
  applyStyle(restOfAppElt, {
    position: "relative",
    backgroundColor: env.STYLE.disabledColor,
    height: "100%",
    width: "100%",
    overflow: "auto",
  });
  const canvasAreaElt = document.createElement("div");
  applyStyle(canvasAreaElt, {
    width: String(DEFAULT_CANVAS_WIDTH + 30) + "px",
    height: String(DEFAULT_CANVAS_HEIGHT + 30) + "px",
    position: "relative",
  });
  const canvasContainerElt = document.createElement("div");
  canvasContainerElt.style.display = "inline-block";
  canvasContainerElt.style.position = "relative";
  const canvas = document.createElement("canvas");
  applyStyle(canvas, {
    border: env.STYLE.lineColor,
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
  });
  canvasContainerElt.appendChild(canvas);
  canvasAreaElt.appendChild(canvasContainerElt);
  handleResizeOnCanvas(
    canvasContainerElt,
    { minHeight: 100, minWidth: 100 },
    {
      onStart: () => {
        resizingState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        isResizing = true;
      },
      onResize: ({ newHeight, newWidth }) => {
        window.requestAnimationFrame(() => {
          if (newHeight !== undefined) {
            canvasAreaElt.style.height = String(newHeight + 30) + "px";
            canvas.height = newHeight;
          }
          if (newWidth !== undefined) {
            canvasAreaElt.style.width = String(newWidth + 30) + "px";
            canvas.width = newWidth;
          }
          clearCanvas();
          if (resizingState) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(resizingState, 0, 0);
          }
          if (currentFile?.handle) {
            enableButton("quick-save");
          }
        });
      },
      onEnd: () => {
        isResizing = false;
      },
    },
    abortSignal,
  );

  restOfAppElt.appendChild(canvasAreaElt);
  contentElt.appendChild(restOfAppElt);
  canvas.width = String(DEFAULT_CANVAS_WIDTH);
  canvas.height = String(DEFAULT_CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const toolElements = [];

  function activateTool(elt, name) {
    for (const tool of toolElements) {
      if (tool === elt) {
        tool.children[0].setAttribute("fill", env.STYLE.primaryColor);
      } else {
        tool.children[0].setAttribute("fill", env.STYLE.textColor);
      }
    }
    currentTool = name;
    if (currentTool === "Cursor (no tool)") {
      canvas.style.cursor = "auto";
    } else {
      canvas.style.cursor = `url("data:image/svg+xml;utf8,${encodeURIComponent(crosshairCursor)}") 10 10, crosshair`;
    }
  }

  const sizeSelectorElt = createSizeSelector(
    [5, 8, 10, 15, 20, 25, 35],
    currentSize,
    (size) => {
      currentSize = size;
    },
  );

  for (const [toolSvg, toolName, config] of [
    [brushSvg, "Brush", { heightScale: 1, enableSizeSelection: true }],
    [lineSvg, "Line", { heightScale: 1, enableSizeSelection: true }],
    [
      squareSvg,
      "Rectangle Outline",
      { heightScale: 0.8, enableSizeSelection: true },
    ],
    [
      circleSvg,
      "Circle Outline",
      { heightScale: 0.8, enableSizeSelection: true },
    ],
    [
      filledSquareSvg,
      "Rectangle",
      { heightScale: 0.6, enableSizeSelection: false },
    ],
    [filledCircleSvg, "Circle", { heightScale: 1, enableSizeSelection: false }],
    [bucketSvg, "Bucket", { heightScale: 1, enableSizeSelection: false }],
    [eraserSvg, "Eraser", { heightScale: 1, enableSizeSelection: true }],
    [
      cursorSvg,
      "Cursor (no tool)",
      { heightScale: 1, enableSizeSelection: false },
    ],
  ]) {
    const toolElt = createToolElt(toolSvg, toolName, config.heightScale, () => {
      activateTool(toolElt, toolName);
      if (config.enableSizeSelection) {
        sizeSelectorElt.style.display = "block";
      } else {
        sizeSelectorElt.style.display = "none";
      }
    });
    toolElements.push(toolElt);
    toolbarElt.appendChild(toolElt);
  }
  activateTool(toolElements[0], "Brush");

  const colorInputElt = document.createElement("input");
  colorInputElt.type = "color";
  colorInputElt.value = "#000000";
  applyStyle(colorInputElt, {
    width: "40px",
    height: "30px",
    minHeight: "30px",
    margin: "8px",
  });
  // colorInputElt.ontouchend = () => colorInputElt.click();
  colorInputElt.addEventListener("change", (e) => {
    currentColor = e.target.value;
  });
  toolbarElt.appendChild(colorInputElt);
  toolbarElt.appendChild(sizeSelectorElt);

  saveCurrentState();

  wrapperElt.addEventListener("mousedown", (e) => {
    if (e.button !== 0) {
      return;
    }
    if (currentTool === "Cursor (no tool)") {
      return;
    }
    e.preventDefault();
    startDrawing(e);
    draw(e);
  });
  wrapperElt.addEventListener(
    "touchstart",
    (e) => {
      if (currentTool === "Cursor (no tool)") {
        return;
      }
      const touch = e.touches[0];
      startDrawing(touch);
      draw(touch);
    },
    { passive: true },
  );
  wrapperElt.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1) {
        if (currentTool === "Cursor (no tool)") {
          return;
        }
        const touch = e.touches[0];
        draw(touch);
      }
    },
    { passive: false },
  );

  // Prevent the canvas from scrolling around on touch
  canvasContainerElt.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1) {
        if (currentTool !== "Cursor (no tool)") {
          e.preventDefault();
        }
      }
    },
    { passive: false },
  );
  // Safari just selects all over the place like some maniac without this
  wrapperElt.onselectstart = (e) => {
    e.preventDefault();
  };
  wrapperElt.onmousemove = draw;
  document.addEventListener("mouseup", stopDrawing);
  document.addEventListener("click", stopDrawing);
  document.addEventListener("touchend", stopDrawing);
  document.addEventListener("touchcancel", stopDrawing);
  abortSignal.addEventListener("abort", () => {
    document.removeEventListener("mouseup", stopDrawing);
    document.removeEventListener("click", stopDrawing);
    document.removeEventListener("touchend", stopDrawing);
    document.removeEventListener("touchcancel", stopDrawing);
  });

  return {
    element: wrapperElt,
    onActivate() {
      document.addEventListener("keydown", onKeyDown);
    },
    onDeactivate() {
      document.removeEventListener("keydown", onKeyDown);
    },
  };

  function onNewImageLoaded({ img, handle, name, type }) {
    resizingState = null;
    isResizing = false;
    currentFile = {
      handle: handle ?? null,
      name: name ?? null,
      type: type ?? "image/png",
    };
    lastX = 0;
    lastY = 0;
    startX = 0;
    startY = 0;
    isDrawing = false;
    hasSomethingDrawnOnCanvas = false;
    hasUpdatesToSave = true;
    history.length = 0;
    historyIndex = 0;
    disableButton("undo");
    disableButton("redo");
    disableButton("clear");
    disableButton("quick-save");
    if (name) {
      env.updateTitle(null, name + " - Image Viewer");
    } else {
      env.updateTitle(null, "Image Viewer");
    }
    applyStyle(canvasAreaElt, {
      width: String(img.width + 30) + "px",
      height: String(img.height + 30) + "px",
    });
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // First fill everything white because those damn transparent image
    // break everything
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0);
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyDown(e) {
    switch (e.key) {
      case "S":
      case "s":
        if (e.ctrlKey) {
          e.preventDefault();
          if (currentFile?.handle) {
            quickSave();
          } else if (env.filePickerSave) {
            saveFile();
          }
        }
        break;

      case "Z":
      case "z":
        if (e.ctrlKey) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;

      case "Y":
      case "y":
        if (e.ctrlKey) {
          e.preventDefault();
          redo();
        }
        break;
    }
  }

  function startDrawing(objectPos) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(canvas, objectPos);
    [startX, startY] = [lastX, lastY];
  }

  function draw(e) {
    if (!isDrawing || isResizing) {
      return;
    }

    const [currentX, currentY] = getMousePos(canvas, e);
    const isInCanvas =
      currentX > 0 &&
      currentX <= canvas.width &&
      currentY > 0 &&
      currentY <= canvas.height &&
      !toolbarElt.contains(e.target) &&
      !headerElt.contains(e.target);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = currentSize;

    switch (currentTool) {
      case "Brush":
        {
          ctx.strokeStyle = currentColor;
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
          if (isInCanvas) {
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
            enableButton("clear");
            enableButton("undo");
            if (currentFile?.handle) {
              enableButton("quick-save");
            }
          }
        }
        break;
      case "Bucket":
        {
          if (isInCanvas && applyBucket(currentX, currentY, currentColor)) {
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
            enableButton("clear");
            enableButton("undo");
            if (currentFile?.handle) {
              enableButton("quick-save");
            }
          }
        }
        break;
      case "Eraser":
        {
          ctx.strokeStyle = "white";
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();

          // TODO: actually check that something has been erased
          if (isInCanvas && hasSomethingDrawnOnCanvas) {
            hasUpdatesToSave = true;
          }
        }
        break;
      case "Line":
        {
          restoreState();
          ctx.strokeStyle = currentColor;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
          if (isInCanvas) {
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
            enableButton("clear");
            enableButton("undo");
            if (currentFile?.handle) {
              enableButton("quick-save");
            }
          }
        }
        break;
      case "Rectangle":
        {
          restoreState();
          ctx.fillStyle = currentColor;
          ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
          if (
            (startX !== currentX || startY !== currentY) &&
            (startX >= 0 || currentX >= 0) &&
            (startY >= 0 || currentY >= 0) &&
            (startX <= canvas.width || currentX <= canvas.width) &&
            (startY <= canvas.height || currentX <= canvas.height)
          ) {
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
            enableButton("clear");
            enableButton("undo");
            if (currentFile?.handle) {
              enableButton("quick-save");
            }
          }
        }
        break;
      case "Circle":
        {
          // TODO: allow but instead check that drawing impacted canvas
          if (
            (startX !== currentX || startY !== currentY) &&
            (startX >= 0 || currentX >= 0) &&
            (startY >= 0 || currentY >= 0) &&
            (startX <= canvas.width || currentX <= canvas.width) &&
            (startY <= canvas.height || currentX <= canvas.height)
          ) {
            restoreState();
            ctx.fillStyle = currentColor;
            const radius = Math.sqrt(
              Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2),
            );
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.fill();
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
            enableButton("clear");
            enableButton("undo");
            if (currentFile?.handle) {
              enableButton("quick-save");
            }
          }
        }
        break;
      case "Rectangle Outline":
        {
          restoreState();
          ctx.strokeStyle = currentColor;
          ctx.beginPath();
          ctx.rect(startX, startY, currentX - startX, currentY - startY);
          ctx.stroke();
          if (
            (startX !== currentX || startY !== currentY) &&
            (startX >= 0 || currentX >= 0) &&
            (startY >= 0 || currentY >= 0) &&
            (startX <= canvas.width || currentX <= canvas.width) &&
            (startY <= canvas.height || currentX <= canvas.height)
          ) {
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
            enableButton("clear");
            enableButton("undo");
            if (currentFile?.handle) {
              enableButton("quick-save");
            }
          }
        }
        break;
      case "Circle Outline":
        {
          // TODO: allow but instead check that drawing impacted canvas
          if (
            (startX !== currentX || startY !== currentY) &&
            (startX >= 0 || currentX >= 0) &&
            (startY >= 0 || currentY >= 0) &&
            (startX <= canvas.width || currentX <= canvas.width) &&
            (startY <= canvas.height || currentX <= canvas.height)
          ) {
            restoreState();
            const radius = Math.sqrt(
              Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2),
            );
            ctx.strokeStyle = currentColor;
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
            enableButton("clear");
            enableButton("undo");
            if (currentFile?.handle) {
              enableButton("quick-save");
            }
          }
        }
        break;
    }

    if (currentTool === "Brush" || currentTool === "Eraser") {
      [lastX, lastY] = [currentX, currentY];
    }
  }

  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      saveCurrentState();
    }
  }

  function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasSomethingDrawnOnCanvas = false;
    disableButton("clear");
  }

  /**
   * OK I hope you're ready for the real monster here.
   * After aprox. 52000 attempts..., asking sometimes my friends the LLMs why
   * the f* there were issues everywhere, I finished with some clever solutions,
   * which though not perfect theoretically, do the job without I guess people
   * seeing the diff.
   *
   * @param {number} initialX - The X position the mouse is in comparatively to
   * the canvas' left.
   * @param {number} initialY - The Y position the mouse is in comparatively to
   * the canvas' top.
   * @param {string} fillColor - The color you want to fill, as a 6-digit hex
   * color.
   */
  function applyBucket(initialX, initialY, fillColor) {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const roundexInitX = Math.min(Math.round(initialX), canvas.width - 1);
    const roundexInitY = Math.min(Math.round(initialY), canvas.height - 1);
    const targetColor = getPixelColor(
      imageData,
      width,
      roundexInitX,
      roundexInitY,
    );
    const wantedRgb = hexToRgb(fillColor);

    // If the currently selected pixel is already of the wanted color, there's
    // no point of continuing.
    if (areColorsEqual(targetColor, wantedRgb)) {
      return false;
    }

    // OK, we begin simple: we just fill the pixel and its neighnours, in a
    // queue, so far so good.

    /**
     * We maintain a shorter `Uint8Array` where in fact everything's either a `1`
     * for `true` or a `0` for `false` just to keep track of which pixel has
     * been visited.
     * After comparing with an array of bools, it seems to be in the same
     * ballpark performance-wise, so we optimize memory-wise.
     */
    const visited = new Uint8Array(width * height);

    /**
     * OK so a little foreshadowing here, we're going to track every damn pixel
     * we filled in this initial phase, so we can do the complex work in the
     * second phase.
     */
    const filledPixels = [];

    /**
     * Build a queue of pixels to check and increase an offset, we could use a
     * popped stack but it was not performant at all.
     */
    const queue = [[roundexInitX, roundexInitY]];
    let queueIndex = 0;
    while (queueIndex < queue.length) {
      const [x, y] = queue[queueIndex++];
      const pixelPos = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height) {
        // We're too far here, that's not an actual canvas pixel
        continue;
      }
      if (visited[pixelPos]) {
        // We've already seen that one
        continue;
      }

      const currentColor = getPixelColor(imageData, width, x, y);
      if (!areColorsEqual(currentColor, targetColor)) {
        // Not the same color than the one clicked originally, we don't have
        // to fill that one.
        continue;
      }

      visited[pixelPos] = 1; // Like `true`, but in our `Uint8Array`
      filledPixels.push([x, y]); // Useful for later

      const currentPos = (y * width + x) * 4;
      data[currentPos] = wantedRgb.r;
      data[currentPos + 1] = wantedRgb.g;
      data[currentPos + 2] = wantedRgb.b;

      if (x + 1 < width) {
        // One pixel right
        queue.push([x + 1, y]);
      }
      if (x - 1 >= 0) {
        // One pixel left
        queue.push([x - 1, y]);
      }
      if (y + 1 < height) {
        // One pixel down
        queue.push([x, y + 1]);
      }
      if (y - 1 >= 0) {
        // One pixel up
        queue.push([x, y - 1]);
      }
    }

    // OK so here you thought we won, NO!
    //
    // At the edges of lines and such drawn in a canvas, there may be diagonal
    // lines.
    // WORSE, canvas sometimes do subpixel rendering for a smoother look and
    // this cannot be disabled. It breaks my bucket fill tool with a weirdly
    // visible edge, but browser implems seem to weidly not care about the
    // bucket in my personal website, prefering smoother graphics instead (this
    // is war).
    //
    // So their searched for it, our bucket fill does not just fill the actual
    // targeted pixel, it overflows a few pixels just so we believe it did its
    // job perfectly. Don't tell the cops.

    // NOTE: We browse each damn filled pixels, not just the ones at the border,
    // because just tracking the ones at the border did not fix the issue for
    // some reason I did not take yet time to resolve.
    // This is inneficient, but not that visible, and it just werks, so, again
    // just do not tell the pixel authorities about this.
    for (const [px, py] of filledPixels) {
      // One pixel around
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = px + dx;
          const ny = py + dy;

          // Skip if out of bounds
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
            continue;
          }

          const neighborPos = ny * width + nx;
          if (!visited[neighborPos]) {
            const overflowPos = (ny * width + nx) * 4;
            data[overflowPos] = wantedRgb.r;
            data[overflowPos + 1] = wantedRgb.g;
            data[overflowPos + 2] = wantedRgb.b;
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return true;
  }

  function downloadImage() {
    if (
      typeof window.showSaveFilePicker === "function" &&
      typeof canvas.toBlob === "function"
    ) {
      canvas.toBlob((img) => {
        downloadImageThroughLocalPicker(img);
      }, "image/png");
    } else {
      const link = document.createElement("a");
      link.download = "painting.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  }

  function saveFile() {
    blockUi();
    canvas.toBlob(async (blob) => {
      try {
        const savedFileData = await blob.arrayBuffer();
        const saveData = await env.filePickerSave({
          title: "Choose where to save your (magnificient 👌) painting",
          savedFileData,
          savedFileName: currentFile?.name ?? "painting.png",
        });
        if (!saveData) {
          unblockUi();
          return;
        }
        currentFile = {
          handle: saveData.handle ?? null,
          name: saveData.filename ?? null,
        };
        if (saveData.filename) {
          env.updateTitle(
            null /* keep same icon */,
            saveData.filename + " - Image Viewer",
          );
        } else {
          env.updateTitle(null /* keep same icon */, "Image Viewer");
        }
        disableButton("quick-save");
      } catch (err) {
        showMessage(wrapperElt, "❌ " + err.toString(), 10000);
      }
      unblockUi();
    }, currentFile?.type ?? "image/png");
  }

  function quickSave() {
    saveCurrentState();
    canvas.toBlob(async (blob) => {
      try {
        const savedFileData = await blob.arrayBuffer();
        if (!currentFile?.handle) {
          showMessage(
            wrapperElt,
            `❌ Cannot quick save: unknown file path.`,
            5000,
          );
          return;
        }
        await env.quickSave(currentFile.handle, savedFileData);
        if (hasUpdatesToSave) {
          enableButton("quick-save");
        } else {
          disableButton("quick-save");
        }
      } catch (err) {
        showMessage(wrapperElt, "❌ " + err.toString(), 10000);
      }
    });
  }

  function saveCurrentState() {
    if (!hasUpdatesToSave) {
      return;
    }
    if (currentFile?.handle) {
      enableButton("quick-save");
    }

    hasUpdatesToSave = false;
    const savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (historyIndex !== history.length) {
      history.splice(historyIndex);
      disableButton("redo");
    }
    history.push([savedState, hasSomethingDrawnOnCanvas]);
    historyIndex++;
    if (historyIndex > 1) {
      enableButton("undo");
    }
    while (history.length > 20) {
      history.shift();
      historyIndex--;
    }
  }

  function restoreState() {
    if (historyIndex > 0) {
      const [state, somethingIsDrawn] = history[historyIndex - 1];
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(state, 0, 0);
      hasSomethingDrawnOnCanvas = somethingIsDrawn;
      if (hasSomethingDrawnOnCanvas) {
        enableButton("clear");
      } else {
        disableButton("clear");
      }
      if (currentFile?.handle) {
        enableButton("quick-save");
      }
    }
  }
  function undo() {
    if (historyIndex > 1) {
      historyIndex--;
      restoreState();

      if (historyIndex <= 1) {
        disableButton("undo");
      }
      if (historyIndex < history.length) {
        enableButton("redo");
      }
    }
  }
  function redo() {
    if (historyIndex < history.length) {
      historyIndex++;
      restoreState();
      if (historyIndex > 1) {
        enableButton("undo");
      }
      if (historyIndex >= history.length) {
        disableButton("redo");
      }
    }
  }

  function createSizeSelector(sizes, defaultSize, onChange) {
    const sizeSelectorElt = document.createElement("div");
    sizeSelectorElt.className = "size-selector";
    applyStyle(sizeSelectorElt, {
      padding: "12px 5px",
      background: env.STYLE.bgColor,
      border: "5px solid " + env.STYLE.lineColor,
    });
    const sizeOptionsElt = document.createElement("div");
    sizeOptionsElt.className = "size-options";
    applyStyle(sizeOptionsElt, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
    });
    sizeSelectorElt.appendChild(sizeOptionsElt);
    const sizeOptions = [];
    for (const size of sizes) {
      const sizeOptionElt = document.createElement("button");
      sizeOptionElt.className = "size-option";
      sizeOptionElt.title = `${size}px`;
      sizeOptionsElt.appendChild(sizeOptionElt);
      applyStyle(sizeOptionElt, {
        width: size + "px",
        height: size + "px",
        borderRadius: "50%",
        border: "1px solid " + env.STYLE.lineColor,
        background:
          size === defaultSize ? env.STYLE.primaryColor : env.STYLE.textColor,
        cursor: "pointer",
        transition: "transform 0.1s",
      });
      sizeOptions.push(sizeOptionElt);
      const onClick = () => {
        for (const elt of sizeOptions) {
          if (elt === sizeOptionElt) {
            elt.style.background = env.STYLE.primaryColor;
          } else {
            elt.style.background = env.STYLE.textColor;
          }
        }
        onChange(size);
      };
      sizeOptionElt.onclick = onClick;
      // sizeOptionElt.ontouchend = onClick;
    }
    return sizeSelectorElt;
  }

  function createToolElt(toolSvg, title, heightScale, onClick) {
    const toolSvgElt = getSvg(toolSvg);
    applyStyle(toolSvgElt, {
      width: "2rem",
      height: `${heightScale * 2}rem`,
      minHeight: `${heightScale * 2}rem`,
      margin: "10px",
      overflow: "visible",
    });
    const toolWrapperElt = document.createElement("span");
    toolWrapperElt.style.margin = "0 auto";
    toolWrapperElt.style.cursor = "pointer";
    toolWrapperElt.appendChild(toolSvgElt);
    toolWrapperElt.onclick = onClick;
    // toolWrapperElt.ontouchend = onClick;
    toolWrapperElt.title = title;
    return toolWrapperElt;
  }

  async function downloadImageThroughLocalPicker(content) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "painting.png",
        types: [
          {
            description: "Image",
            accept: { "image/png": [".png"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return handle;
    } catch (err) {
      console.error(err);
    }
  }

  function getPixelColor(imageData, width, x, y) {
    const pos = (y * width + x) * 4;
    return {
      r: imageData.data[pos],
      g: imageData.data[pos + 1],
      b: imageData.data[pos + 2],
    };
  }

  function areColorsEqual(c1, c2, tolerance = 10) {
    return (
      Math.abs(c1.r - c2.r) <= tolerance &&
      Math.abs(c1.g - c2.g) <= tolerance &&
      Math.abs(c1.b - c2.b) <= tolerance
    );
  }

  function hexToRgb(hex) {
    hex = hex.replace("#", "");

    // Parse r, g, b values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  function blockUi() {
    spinnerContainerElt.style.display = "flex";
    wrapperElt.style.opacity = 0.5;
    wrapperElt.setAttribute("inert", true);
  }
  function unblockUi() {
    spinnerContainerElt.style.display = "none";
    wrapperElt.style.opacity = 1;
    wrapperElt.removeAttribute("inert");
  }

  function onUploadClick() {
    blockUi();
    // Trick to open the file picker
    const fileInputElt = document.createElement("input");
    fileInputElt.type = "file";
    fileInputElt.accept = "image/*";
    fileInputElt.multiple = false;
    fileInputElt.click();
    fileInputElt.addEventListener("error", () => {
      unblockUi();
      showMessage(restOfAppElt, "❌ Failed to open your file-picker", 5000);
    });
    fileInputElt.addEventListener("cancel", () => {
      unblockUi();
    });
    fileInputElt.addEventListener("change", (e) => {
      const files = e.target.files;
      if (!files[0]) {
        unblockUi();
        return;
      }
      createImgFromFileUpload(files[0])
        .then((img) => {
          onNewImageLoaded({
            img,
            name: files[0].name,
            type: files[0].type,
          });
          unblockUi();
        })
        .catch((e) => {
          unblockUi();
          showMessage(restOfAppElt, "❌ " + e.toString(), 5000);
        });
    });
  }

  function onOpenClick() {
    blockUi();
    env
      .filePickerOpen({
        title: "Open an image from files stored on this Web Desktop",
        allowMultipleSelections: false,
      })
      .then(
        (fileData) => {
          if (!fileData || !fileData[0]) {
            unblockUi();
            return;
          }
          createImgFromFileOpen(fileData[0])
            .then(({ img, mimeType }) => {
              onNewImageLoaded({
                img,
                handle: fileData[0].handle,
                name: fileData[0].filename,
                type: mimeType,
              });
              unblockUi();
            })
            .catch((e) => {
              unblockUi();
              showMessage(restOfAppElt, "❌ " + e.toString(), 5000);
            });
        },
        (err) => {
          unblockUi();
          showMessage(restOfAppElt, "❌ " + err.toString(), 10000);
        },
      );
  }
}

function getSvg(svg) {
  const svgWrapperElt = document.createElement("div");
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
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

function createImgFromFileUpload(file) {
  if (!file.type.match("image.*")) {
    showMessage(messageContainerElt, "❌ " + err.toString(), 10000);
    return Promise.reject(new Error("This is not a recognized image format."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error("Error loading this image. Try a different file."));
      };
      img.src = event.target.result;
    };

    reader.onerror = function () {
      reject(new Error("Error reading this file"));
    };

    reader.readAsDataURL(file);
  });
}

function createImgFromFileOpen(file) {
  return new Promise((resolve, reject) => {
    try {
      const { filename, data: arrayBuffer } = file;
      const img = new Image();
      const mimeType = guessMimeType(filename, arrayBuffer);
      const blob = new Blob([arrayBuffer], { type: mimeType });
      const imgUrl = URL.createObjectURL(blob);
      img.src = imgUrl;
      img.onload = function () {
        resolve({ img, mimeType });
      };
      img.onerror = () => {
        URL.revokeObjectURL(imgUrl);
        reject(
          new Error("Failed to load a file. Are you sure this is an image?"),
        );
      };
    } catch (err) {
      reject(err);
    }
  });
}

// NOTE: Could be factorized with the image-viewer's (even the explorer) might
// use this?
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
