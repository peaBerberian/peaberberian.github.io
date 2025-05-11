import { applyStyle } from "./utils.mjs";

/**
 * Setup the right events to ensure this canvas can be resized when interacting
 * with it.
 * @param {HTMLElement} canvasElt - The canvas that can be resized and moved.
 * @param {Object} minDimensions
 * @param {number} minDimensions.minHeight - The minimum height in pixels the
 * canvas can be resized to.
 * @param {number} minDimensions.minWidth - The minimum width in pixels the
 * canvas can be resized to.
 * @param {Object} callbacks
 * @param {Function} callbacks.onStart
 * @param {Function} callback.onResize
 * @param {Function} callback.onEnd
 * @param {AbortSignal} abortSignal - `AbortSignal` allowing to free all
 * resources and event listeners registered here when it emits.
 */
export default function handleResizeOnCanvas(
  canvasElt,
  { minHeight, minWidth },
  { onStart, onResize, onEnd },
  abortSignal,
) {
  // Add resize handles
  for (const dir of ["e", "s", "se"]) {
    const handle = document.createElement("div");
    applyStyle(handle, {
      position: "absolute",
      zIndex: "300",
    });
    if (dir === "e") {
      applyStyle(handle, {
        right: "-3px",
        bottom: "3px",
        width: "6px",
        height: "calc(100% - 5px)",
        cursor: "ew-resize",
      });
    } else if (dir === "s") {
      applyStyle(handle, {
        bottom: "-3px",
        right: "5px",
        height: "6px",
        width: "calc(100% - 5px)",
        cursor: "ns-resize",
      });
    } else if (dir === "se") {
      applyStyle(handle, {
        bottom: "-3px",
        right: "-3px",
        height: "10px",
        width: "10px",
        cursor: "nwse-resize",
      });
    }
    canvasElt.appendChild(handle);
    setupResizeEvent(handle, dir);
  }

  /**
   * Setup one of the resize handling for a given direction.
   * @param {HTMLElement} handle - Each resize interaction is handled on a
   * given "handle" element, which spans the corresponding side of a window.
   * Has to be well-placed with CSS first.
   * @param {string} direction - A string decribing the direction as a cardinal
   * direction's initial: "n", "s", "e", "w", "ne", "nw", "se" or "sw".
   */
  function setupResizeEvent(handle, direction) {
    /**
     * When a user began resizing: the initial mouse X position at which the
     * resize was started.
     */
    let startX;
    /**
     * When a user began resizing: the initial mouse Y position at which the
     * resize was started.
     */
    let startY;
    /** When a user began resizing: the initial width of the window, in pixels. */
    let startWidth;
    /** When a user began resizing: the initial height of the window, in pixels. */
    let startHeight;

    addEventListener(handle, "mousedown", abortSignal, (e) => {
      if (e.button) {
        // not left click
        return;
      }
      canvasElt.classList.add("resizing");
      onStart();
      e.stopPropagation();
      e.preventDefault();

      // Get initial dimensions
      startX = e.clientX;
      startY = e.clientY;

      const canvasRect = canvasElt.getBoundingClientRect();
      startWidth = canvasRect.width;
      startHeight = canvasRect.height;

      // Add document-level event listeners
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", validateAndStopResize);
      document.addEventListener("click", validateAndStopResize);
      document.addEventListener("resize", validateAndStopResize);
    });

    const validateAndStopResize = () => {
      onEnd();
      canvasElt.classList.remove("resizing");
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", validateAndStopResize);
      document.removeEventListener("click", validateAndStopResize);
      document.removeEventListener("resize", validateAndStopResize);
    };

    const resize = (e) => {
      requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newHeight;
        let newWidth;

        // Update dimensions based on direction
        if (direction.includes("e")) {
          newWidth = Math.max(minWidth, startWidth + deltaX);
        }
        if (direction.includes("s")) {
          newHeight = Math.max(minHeight, startHeight + deltaY);
        }
        onResize({ newHeight, newWidth });
      });
    };
  }
}

/**
 * Function adding an event listener also accepting an `AbortSignal` for
 * automatic removal of that event listener.
 * @param {EventTarget} target
 * @param {string} event
 * @param {AbortSignal} abortSignal
 * @param {Function} callback
 */
function addEventListener(target, event, abortSignal, callback) {
  target.addEventListener(event, callback);
  abortSignal.addEventListener("abort", () => {
    target.removeEventListener(event, callback);
  });
}
