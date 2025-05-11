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
  undoSvg,
  redoSvg,
  saveSvg,
  clearSvg,
} from "./svgs.mjs";

const DEFAULT_CANVAS_HEIGHT = 800;
const DEFAULT_CANVAS_WIDTH = 800;

export function create(abortSignal) {
  let lastX = 0;
  let lastY = 0;
  let startX = 0;
  let startY = 0;
  let isDrawing = false;
  let currentTool = "brush";
  let currentColor = "#000000";
  let currentSize = 15;
  let hasSomethingDrawnOnCanvas = false;
  let hasUpdatesToSave = true;

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
  const headerElt = document.createElement("div");
  applyStyle(headerElt, {
    backgroundColor: "var(--window-sidebar-bg)",
    borderBottom: "1px solid var(--window-inactive-header)",
    width: "100%",
    overflow: "auto",
    display: "flex",
    padding: "5px",
    gap: "5px",
    flexShrink: "0",
  });
  wrapperElt.appendChild(headerElt);

  const undoButton = createButtonElt(undoSvg, undo);
  headerElt.appendChild(undoButton);
  disableUndoButton();

  const redoButton = createButtonElt(redoSvg, redo);
  headerElt.appendChild(redoButton);
  disableRedoButton();

  const clearButton = createButtonElt(clearSvg, () => {
    const hadSomethingDrawn = hasSomethingDrawnOnCanvas;
    clearCanvas();
    if (hadSomethingDrawn) {
      hasUpdatesToSave = true;
      saveCurrentState();
    }
  });
  headerElt.appendChild(clearButton);
  const saveButton = createButtonElt(saveSvg, saveImage);
  headerElt.appendChild(saveButton);

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
    backgroundColor: "var(--window-sidebar-bg)",
    borderRight: "var(--window-line-color)",
    alignItems: "center",
    overflow: "auto",
    flexShrink: "0",
  });
  contentElt.appendChild(toolbarElt);
  const restOfAppElt = document.createElement("div");
  applyStyle(restOfAppElt, {
    backgroundColor: "var(--app-primary-bg)",
    height: "100%",
    width: "100%",
    overflow: "auto",
  });
  const canvasAreaElt = document.createElement("div");
  applyStyle(canvasAreaElt, {
    width: String(DEFAULT_CANVAS_HEIGHT + 30) + "px",
    height: String(DEFAULT_CANVAS_WIDTH + 30) + "px",
    position: "relative",
  });
  const canvasContainerElt = document.createElement("div");
  canvasContainerElt.style.display = "inline-block";
  canvasContainerElt.style.position = "relative";
  const canvas = document.createElement("canvas");
  applyStyle(canvas, {
    border: "var(--window-line-color)",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
  });
  canvasContainerElt.appendChild(canvas);
  canvasAreaElt.appendChild(canvasContainerElt);
  handleResizeOnCanvas(
    canvasContainerElt,
    { minHeight: 100, minWidth: 100 },
    ({ newHeight, newWidth }) => {
      window.requestAnimationFrame(() => {
        const savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (newHeight !== undefined) {
          canvasAreaElt.style.height = String(newHeight + 30) + "px";
          canvas.height = newHeight;
        }
        if (newWidth !== undefined) {
          canvasAreaElt.style.width = String(newWidth + 30) + "px";
          canvas.width = newWidth;
        }
        clearCanvas();
        ctx.putImageData(savedState, 0, 0);
      });
    },
    abortSignal,
  );

  restOfAppElt.appendChild(canvasAreaElt);
  contentElt.appendChild(restOfAppElt);
  canvas.width = String(DEFAULT_CANVAS_HEIGHT);
  canvas.height = String(DEFAULT_CANVAS_WIDTH);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const toolElements = [];

  function activateTool(elt, name) {
    for (const tool of toolElements) {
      if (tool === elt) {
        tool.setAttribute("fill", "var(--app-primary-color)");
      } else {
        tool.setAttribute("fill", "var(--window-text-color)");
      }
    }
    currentTool = name;
    if (currentTool === "cursor") {
      canvas.style.cursor = "auto";
    } else {
      canvas.style.cursor = "crosshair";
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
    [brushSvg, "brush", { height: 25, enableSizeSelection: true }],
    [lineSvg, "line", { height: 25, enableSizeSelection: true }],
    [squareSvg, "outline-rectangle", { height: 20, enableSizeSelection: true }],
    [circleSvg, "outline-circle", { height: 20, enableSizeSelection: true }],
    [filledSquareSvg, "rectangle", { height: 15, enableSizeSelection: false }],
    [filledCircleSvg, "circle", { height: 25, enableSizeSelection: false }],
    [eraserSvg, "eraser", { height: 25, enableSizeSelection: true }],
    [cursorSvg, "cursor", { height: 25, enableSizeSelection: false }],
  ]) {
    const toolElt = createToolElt(toolSvg, config.height, () => {
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
  activateTool(toolElements[0], "brush");

  const colorInputElt = strHtml`<input type="color" id="color-input" value="#000000">`;
  applyStyle(colorInputElt, {
    width: "40px",
    height: "30px",
    minHeight: "30px",
    margin: "8px",
  });
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
    if (currentTool === "cursor") {
      return;
    }
    e.preventDefault();
    startDrawing(e);
    draw(e);
  });
  wrapperElt.addEventListener("touchstart", (e) => {
    if (currentTool === "cursor") {
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing(touch);
    draw(touch);
  });
  wrapperElt.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
      if (currentTool === "cursor") {
        return;
      }
      e.preventDefault();
      const touch = e.touches[0];
      draw(touch);
    }
  });
  wrapperElt.addEventListener("mousemove", draw);
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

  return wrapperElt;

  function startDrawing(objectPos) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(canvas, objectPos);
    [startX, startY] = [lastX, lastY];
  }

  function draw(e) {
    if (!isDrawing) {
      return;
    }

    const [currentX, currentY] = getMousePos(canvas, e);
    const isInCanvas =
      currentX > 0 &&
      currentX <= canvas.width &&
      currentY > 0 &&
      currentY <= canvas.height;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = currentSize;

    switch (currentTool) {
      case "brush":
        {
          ctx.strokeStyle = currentColor;
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
          if (isInCanvas) {
            hasUpdatesToSave = true;
            hasSomethingDrawnOnCanvas = true;
          }
        }
        break;
      case "eraser":
        {
          ctx.strokeStyle = "white";
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
          if (isInCanvas && hasSomethingDrawnOnCanvas) {
            hasUpdatesToSave = true;
          }
        }
        break;
      case "line":
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
          }
        }
        break;
      case "rectangle":
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
          }
        }
        break;
      case "circle":
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
          }
        }
        break;
      case "outline-rectangle":
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
          }
        }
        break;
      case "outline-circle":
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
          }
        }
        break;
    }

    if (currentTool === "brush" || currentTool === "eraser") {
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
  }

  function saveImage() {
    if (
      typeof window.showSaveFilePicker === "function" &&
      typeof canvas.toBlob === "function"
    ) {
      canvas.toBlob((img) => {
        saveFile(img);
      }, "image/png");
    } else {
      const link = document.createElement("a");
      link.download = "painting.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  }

  function saveCurrentState() {
    if (!hasUpdatesToSave) {
      return;
    }
    hasUpdatesToSave = false;
    const savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    debugger;
    if (historyIndex !== history.length) {
      history.splice(historyIndex);
      disableRedoButton();
    }
    history.push([savedState, hasSomethingDrawnOnCanvas]);
    historyIndex++;
    if (historyIndex > 1) {
      enableUndoButton();
    }
    if (history.length > 20) {
      history.shift();
      historyIndex--;
    }
  }

  function restoreState() {
    if (historyIndex > 0) {
      const [state, somethingIsDrawn] = history[historyIndex - 1];
      ctx.putImageData(state, 0, 0);
      hasSomethingDrawnOnCanvas = somethingIsDrawn;
    }
  }
  function undo() {
    if (historyIndex > 1) {
      historyIndex--;
      restoreState();

      if (historyIndex <= 1) {
        disableUndoButton();
      }
      if (historyIndex < history.length) {
        enableRedoButton();
      }
    }
  }
  function redo() {
    if (historyIndex < history.length) {
      historyIndex++;
      restoreState();
      if (historyIndex > 1) {
        enableUndoButton();
      }
      if (historyIndex >= history.length) {
        disableRedoButton();
      }
    }
  }

  function enableUndoButton() {
    if (undoButton.style.cursor !== "pointer") {
      undoButton.style.cursor = "pointer";
      undoButton.setAttribute("fill", "var(--window-active-header)");
    }
  }

  function disableUndoButton() {
    if (undoButton.style.cursor === "pointer") {
      undoButton.style.cursor = "auto";
      undoButton.setAttribute("fill", "var(--window-inactive-header)");
    }
  }

  function enableRedoButton() {
    if (redoButton.style.cursor !== "pointer") {
      redoButton.style.cursor = "pointer";
      redoButton.setAttribute("fill", "var(--window-active-header)");
    }
  }

  function disableRedoButton() {
    if (redoButton.style.cursor === "pointer") {
      redoButton.style.cursor = "auto";
      redoButton.setAttribute("fill", "var(--window-inactive-header)");
    }
  }
}

function getSvg(svg) {
  const svgWrapperElt = strHtml`<div />`;
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}

function createSizeSelector(sizes, defaultSize, onChange) {
  const sizeSelectorElt = strHtml`<div class="size-selector" />`;
  applyStyle(sizeSelectorElt, {
    padding: "12px 5px",
    background: "var(--window-content-bg)",
    border: "5px solid var(--window-line-color)",
  });
  const sizeOptionsElt = strHtml`<div class="size-options" />`;
  applyStyle(sizeOptionsElt, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  });
  sizeSelectorElt.appendChild(sizeOptionsElt);
  const sizeOptions = [];
  for (const size of sizes) {
    const sizeOptionElt = strHtml`<button class="size-option" data-size="${size}" title="${size}px"></button>`;
    sizeOptionsElt.appendChild(sizeOptionElt);
    applyStyle(sizeOptionElt, {
      width: size + "px",
      height: size + "px",
      borderRadius: "50%",
      border: "1px solid var(--window-line-color)",
      background:
        size === defaultSize
          ? "var(--app-primary-color)"
          : "var(--window-text-color)",
      cursor: "pointer",
      transition: "transform 0.1s",
    });
    sizeOptions.push(sizeOptionElt);
    sizeOptionElt.onclick = () => {
      for (const elt of sizeOptions) {
        if (elt === sizeOptionElt) {
          elt.style.background = "var(--app-primary-color)";
        } else {
          elt.style.background = "var(--window-text-color)";
        }
      }
      onChange(size);
    };
  }
  return sizeSelectorElt;
}

function createToolElt(toolSvg, height, onClick) {
  const toolElt = getSvg(toolSvg);
  applyStyle(toolElt, {
    width: "25px",
    height: `${height}px`,
    minHeight: `${height}px`,
    margin: "10px",
    cursor: "pointer",
  });
  toolElt.onclick = onClick;
  return toolElt;
}
function createButtonElt(svg, onClick) {
  const toolElt = getSvg(svg);
  applyStyle(toolElt, {
    width: "35px",
    height: "35px",
    cursor: "pointer",
  });
  toolElt.onclick = onClick;
  return toolElt;
}

async function saveFile(content) {
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
