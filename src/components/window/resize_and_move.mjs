import {
  addEventListener,
  blockElementsFromTakingPointerEvents,
  getMaxDesktopDimensions,
  unblockElementsFromTakingPointerEvents,
} from "../../utils.mjs";
import { WINDOW_OOB_SECURITY_PIX } from "../../constants.mjs";
import { SETTINGS } from "../../settings.mjs";
import {
  enterFullFullScreen,
  enterLeftFullScreen,
  enterRightFullScreen,
  isFullscreenFull,
  isFullscreen,
  isFullscreenLeft,
  isFullscreenRight,
} from "./fullscreen.mjs";
import {
  activateFullScreenSnapping,
  activateLeftScreenSnapping,
  activateRightScreenSnapping,
  disableSnappingZones,
  isFullScreenSnapping,
  isLeftScreenSnapping,
  isRightScreenSnapping,
} from "./snap_zone.mjs";
import {
  getLeftPositioning,
  getMaxWindowPositions,
  getMinWindowPositions,
  getTopPositioning,
  getWindowHeight,
  getWindowWidth,
  setLeftPositioning,
  setTopPositioning,
  setWindowHeight,
  setWindowWidth,
} from "./position_utils.mjs";
import { keepWindowActiveInCurrentEventLoopIteration } from "./utils.mjs";

/**
 * Setup the right events to ensure this window can be mored and resized when
 * interacting with it.
 * @param {HTMLElement} windowElt - The whole window that can be resized and
 * moved.
 * @param {Object} minDimensions
 * @param {number} minDimensions.minHeight - The minimum height in pixels the
 * window can be resized to.
 * @param {number} minDimensions.minWidth - The minimum width in pixels the
 * window can be resized to.
 * @param {Object} callbacks
 * @param {Function} callbacks.activateWindow - Callback to activate that
 * window on the desktop.
 * @param {Function} callbacks.getOobDistances - Callback to obtain the
 * currently-known "oob" (out-of-bounds) distances for this window element.
 * @param {Function} callbacks.updateOobDistances - Callback allowing to update
 * one or multiple properties from the object returned by
 * `callbacks.getOobDistances`.
 * @param {Function} callbacks.exitFullScreen - Callback to exit the current
 * full screen mode.
 * @param {Function} callbacks.saveCurrentCoordinates - Callback to save the
 * current window coordinates as the last one wanted (e.g. as a target whne
 * exiting fullscreen mode).
 * @param {AbortSignal} abortSignal - `AbortSignal` allowing to free all
 * resources and event listeners registered here when it emits.
 */
export function handleResizeAndMove(
  windowElt,
  minDimensions,
  callbacks,
  abortSignal,
) {
  handleMoveOnWindow(windowElt, minDimensions, callbacks, abortSignal);
  handleResizeOnWindow(windowElt, minDimensions, callbacks, abortSignal);
}

/**
 * Setup the right events to ensure this window can be moved.
 * @param {HTMLElement} windowElt - The whole window that can be resized and
 * moved.
 * @param {Object} minDimensions
 * @param {number} minDimensions.minWidth - The minimum width in pixels the
 * window can be resized to.
 * @param {Object} callbacks
 * @param {Function} callbacks.activateWindow - Callback to activate that
 * window on the desktop.
 * @param {Function} callbacks.updateOobDistances - Callback allowing to update
 * one or multiple properties from the object returned by
 * `callbacks.getOobDistances`.
 * @param {Function} callbacks.exitFullScreen - Callback to exit the current
 * full screen mode.
 * @param {Function} callbacks.saveCurrentCoordinates - Callback to save the
 * current window coordinates as the last one wanted (e.g. as a target whne
 * exiting fullscreen mode).
 * @param {AbortSignal} abortSignal - `AbortSignal` allowing to free all
 * resources and event listeners registered here when it emits.
 */
function handleMoveOnWindow(
  windowElt,
  { minWidth },
  {
    activateWindow,
    updateOobDistances,
    exitFullScreen,
    saveCurrentCoordinates,
  },
  abortSignal,
) {
  /**
   * If `true`, we're currently in the process of dragging the window.
   */
  let isDragging = false;
  /**
   * When a user began clicking: the delta between the mouse X coordinate on
   * click and the left of the header.
   */
  let offsetX;

  /**
   * When a user began clicking: the delta between the mouse Y coordinate on
   * click and the top of the header.
   */
  let offsetY;

  /**
   * When a user began clicking: the initial mouse X position at which the
   * click was started.
   */
  let initialX;
  /**
   * When a user began clicking: the initial mouse Y position at which the
   * click was started.
   */
  let initialY;
  /**
   * When a user began clicking: the initial height of the window when the click
   * was started.
   */
  let initialHeight;
  /**
   * When a user began clicking: the initial width of the window when the click
   * was started.
   */
  let initialWidth;
  /**
   * When a user began clicking: the original x coordinate percentage in the
   * context of the window's titlebar.
   */
  let initialXPercent;

  /**
   * Height of the container element. We assume that it cannot change while a
   * window resize or window move is happening.
   */
  let containerWidth;

  /**
   * Height of the container element. We assume that it cannot change while a
   * window resize or window move is happening.
   */
  let containerHeight;

  // Reset some state on abort, just to be sure we're not left in an unwanted state
  abortSignal.addEventListener("abort", () => {
    isDragging = false;
    disableSnappingZones();
    unblockElementsFromTakingPointerEvents();
  });

  const header = windowElt.getElementsByClassName("w-header")[0];
  if (header) {
    const stopDragging = () => {
      isDragging = false;
      if (!isFullscreen(windowElt)) {
        saveCurrentCoordinates();
      }
      disableSnappingZones();
      unblockElementsFromTakingPointerEvents();
    };
    const validateWindowMovement = () => {
      if (!isDragging) {
        return;
      }
      if (isFullScreenSnapping()) {
        enterFullFullScreen(windowElt);
        keepWindowActiveInCurrentEventLoopIteration(windowElt);
      } else if (isLeftScreenSnapping()) {
        enterLeftFullScreen(windowElt);
        keepWindowActiveInCurrentEventLoopIteration(windowElt);
      } else if (isRightScreenSnapping()) {
        enterRightFullScreen(windowElt);
        keepWindowActiveInCurrentEventLoopIteration(windowElt);
      }
      stopDragging();
    };
    addEventListener(header, "touchstart", abortSignal, (e) => {
      const touch = e.touches[0];
      startDraggingWindow(touch.clientX, touch.clientY);
    });
    addEventListener(header, "touchend", abortSignal, validateWindowMovement);
    addEventListener(header, "touchcancel", abortSignal, stopDragging);
    addEventListener(header, "touchmove", abortSignal, (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        moveDraggedWindow(touch.clientX, touch.clientY);
      }
    });

    // Safari just selects all over the place like some maniac without this
    addEventListener(header, "selectstart", abortSignal, (e) => {
      e.preventDefault();
    });

    addEventListener(header, "mousedown", abortSignal, (e) => {
      if (e.button !== 0) {
        // not left click
        return;
      }
      startDraggingWindow(e.clientX, e.clientY);
    });
    addEventListener(
      document.documentElement,
      "mouseleave",
      abortSignal,
      stopDragging,
    );
    addEventListener(
      document.documentElement,
      "mouseenter",
      abortSignal,
      validateWindowMovement,
    );
    addEventListener(
      document.documentElement,
      "click",
      abortSignal,
      validateWindowMovement,
    );
    addEventListener(document, "mousemove", abortSignal, (e) => {
      if (!isDragging) {
        return;
      }
      moveDraggedWindow(e.clientX, e.clientY);
    });
    addEventListener(windowElt, "mouseup", abortSignal, validateWindowMovement);
    addEventListener(window, "resize", abortSignal, stopDragging);
  }

  function startDraggingWindow(clientX, clientY) {
    isDragging = true;
    if (!isFullscreen(windowElt)) {
      saveCurrentCoordinates();
    }
    blockElementsFromTakingPointerEvents();
    const initialLeft = getLeftPositioning(windowElt);
    const initialTop = getTopPositioning(windowElt);
    initialHeight = getWindowHeight(windowElt);
    initialWidth = getWindowWidth(windowElt);
    offsetX = clientX - initialLeft;
    offsetY = clientY - initialTop;
    initialXPercent = offsetX / initialWidth;
    initialX = clientX;
    initialY = clientY;
    const maxDimensions = getMaxDesktopDimensions(
      SETTINGS.taskbarLocation.getValue(),
      SETTINGS.taskbarSize.getValue(),
    );
    containerWidth = maxDimensions.maxWidth;
    containerHeight = maxDimensions.maxHeight;
    activateWindow();
  }

  function moveDraggedWindow(clientX, clientY) {
    const newX = clientX - offsetX;
    const newY = clientY - offsetY;
    const { minX, minY, minXBound, minYBound } =
      getMinWindowPositions(windowElt);
    const { maxX, maxY, maxXBound, maxYBound } =
      getMaxWindowPositions(windowElt);
    if (!isFullscreen(windowElt)) {
      const newLeft = Math.max(minX, Math.min(newX, maxX));
      if (newLeft >= minXBound && newLeft <= maxXBound) {
        updateOobDistances({ left: 0, right: 0 });
      } else {
        if (newLeft < minXBound) {
          updateOobDistances({ left: minXBound - newLeft });
        }
        if (newLeft > maxXBound) {
          updateOobDistances({ right: newLeft - maxXBound });
        }
      }

      const newTop = Math.max(minY, Math.min(newY, maxY));
      if (newTop >= minYBound && newTop <= maxYBound) {
        updateOobDistances({ top: 0, bottom: 0 });
      } else {
        if (newTop < minYBound) {
          updateOobDistances({ top: minYBound - newTop });
        }
        if (newTop > maxYBound) {
          updateOobDistances({ bottom: newTop - maxYBound });
        }
      }

      const windowLeft = Math.max(minX, Math.min(newX, maxX));
      setLeftPositioning(windowElt, windowLeft);
      const windowTop = Math.max(minY, Math.min(newY, maxY));
      setTopPositioning(windowElt, windowTop);
      checkSnapping({
        clientY,
        clientX,
        windowTop,
        windowLeft,
      });
    }

    // Only exit full screen if the pointer moved enough
    else if (Math.abs(clientX - initialX) > 30 || clientY - initialY > 30) {
      exitFullScreen();
      const newWidth = getWindowWidth(windowElt);
      const maxWindowPos = getMaxWindowPositions(windowElt);
      const newX = Math.max(
        minX,
        Math.min(clientX - initialXPercent * newWidth, maxWindowPos.maxX),
      );
      offsetX = clientX - newX;
      initialX = clientX;
      moveDraggedWindow(clientX, clientY);
    }
  }

  /**
   * When a window is moved around, it might activates "snapping zones" which are
   * zones which indicate that the window will be set to fullscreen or
   * half-screen if the window is released at that point.
   *
   * This function just checks if a snapping window has to be activated with the
   * current window position, and activates the zone if that's the case.
   *
   * You can then check the class name of the snapping zone element to see if a
   * snap zone is active (through the appropriate util functions).
   * @param {Object} info
   * @param {number} info.clientX - Current x position of the pointer in the
   * screen, in pixels.
   * @param {number} info.clientY  - Current x position of the pointer in the
   * screen, in pixels.
   * @param {number} info.windowLeft - The last `left` position applied to
   * `windowElt`, in pixels.
   * @param {number} info.windowTop - The last `top` position applied to
   * `windowElt`, in pixels.
   */
  function checkSnapping({ clientX, clientY, windowLeft, windowTop }) {
    if (
      SETTINGS.topWindowSnapping.getValue() &&
      (initialWidth < containerWidth || initialHeight < containerHeight)
    ) {
      const snapPosLimitTop = SETTINGS.oobWindows.getValue()
        ? clientY -
          15 -
          (SETTINGS.taskbarLocation.getValue() === "top"
            ? SETTINGS.taskbarSize.getValue()
            : 0)
        : windowTop;
      if (snapPosLimitTop <= 0) {
        if (!isFullScreenSnapping()) {
          activateFullScreenSnapping(windowElt);
        }
        return;
      }
    }

    if (isFullScreenSnapping()) {
      disableSnappingZones();
    }

    if (
      SETTINGS.sideWindowSnapping.getValue() &&
      containerWidth / 2 >= minWidth &&
      initialWidth < containerWidth
    ) {
      const snapPosLimitLeft = SETTINGS.oobWindows.getValue()
        ? clientX -
          15 -
          (SETTINGS.taskbarLocation.getValue() === "left"
            ? SETTINGS.taskbarSize.getValue()
            : 0)
        : windowLeft;
      if (snapPosLimitLeft <= 0) {
        if (!isLeftScreenSnapping()) {
          activateLeftScreenSnapping(windowElt);
        }
        return;
      }

      if (isLeftScreenSnapping()) {
        disableSnappingZones();
      }

      const snapPosLimitRight = SETTINGS.oobWindows.getValue()
        ? clientX + 15
        : windowLeft + initialWidth;
      if (snapPosLimitRight >= containerWidth) {
        if (!isRightScreenSnapping()) {
          activateRightScreenSnapping(windowElt);
        }
        return;
      }
    }

    if (isRightScreenSnapping()) {
      disableSnappingZones();
    }
  }
}

/**
 * Setup the right events to ensure this window can be resized when interacting
 * with it.
 * @param {HTMLElement} windowElt - The whole window that can be resized and
 * moved.
 * @param {Object} minDimensions
 * @param {number} minDimensions.minHeight - The minimum height in pixels the
 * window can be resized to.
 * @param {number} minDimensions.minWidth - The minimum width in pixels the
 * window can be resized to.
 * @param {Object} callbacks
 * @param {Function} callbacks.activateWindow - Callback to activate that
 * window on the desktop.
 * @param {Function} callbacks.getOobDistances - Callback to obtain the
 * currently-known "oob" (out-of-bounds) distances for this window element.
 * @param {Function} callbacks.updateOobDistances - Callback allowing to update
 * one or multiple properties from the object returned by
 * `callbacks.getOobDistances`.
 * @param {Function} callbacks.exitFullScreen - Callback to exit the current
 * full screen mode.
 * @param {Function} callbacks.saveCurrentCoordinates - Callback to save the
 * current window coordinates as the last one wanted (e.g. as a target whne
 * exiting fullscreen mode).
 * @param {AbortSignal} abortSignal - `AbortSignal` allowing to free all
 * resources and event listeners registered here when it emits.
 */
function handleResizeOnWindow(
  windowElt,
  { minHeight, minWidth },
  { activateWindow, getOobDistances, exitFullScreen, saveCurrentCoordinates },
  abortSignal,
) {
  // Add resize handles
  for (const dir of ["n", "e", "s", "w", "ne", "nw", "se", "sw"]) {
    const handle = document.createElement("div");
    handle.className = `w-res-bord res-${dir}`;
    windowElt.appendChild(handle);
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
    /**
     * When a user began resizing: the initial leftest position of the window,
     * in pixels.
     */
    let startLeft;
    /**
     * When a user began resizing: the initial topest position of the window,
     * in pixels.
     */
    let startTop;
    /**
     * Height of the container element. We assume that it cannot change while a
     * window resize or window move is happening.
     */
    let containerWidth;

    /**
     * Height of the container element. We assume that it cannot change while a
     * window resize or window move is happening.
     */
    let containerHeight;

    abortSignal.addEventListener("abort", () => {
      unblockElementsFromTakingPointerEvents();
    });
    addEventListener(handle, "mousedown", abortSignal, (e) => {
      if (e.button) {
        // not left click
        return;
      }
      if (isFullscreenFull(windowElt)) {
        return;
      }
      windowElt.classList.add("resizing");
      e.stopPropagation();
      e.preventDefault();

      blockElementsFromTakingPointerEvents();

      // activateWindow window when resizing starts
      activateWindow();

      // Get initial dimensions
      startX = e.clientX;
      startY = e.clientY;
      const maxDimensions = getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue(),
      );
      containerWidth = maxDimensions.maxWidth;
      containerHeight = maxDimensions.maxHeight;

      startWidth = getWindowWidth(windowElt);
      startHeight = getWindowHeight(windowElt);
      startLeft = getLeftPositioning(windowElt);
      startTop = getTopPositioning(windowElt);

      // Add document-level event listeners
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", validateAndStopResize);
      document.addEventListener("click", validateAndStopResize);
      document.addEventListener("resize", validateAndStopResize);
    });

    const validateAndStopResize = () => {
      if (!isFullscreen(windowElt)) {
        saveCurrentCoordinates();
      } else if (isFullscreenLeft(windowElt)) {
        if (
          getWindowHeight(windowElt) < containerHeight ||
          getLeftPositioning(windowElt) > 0
        ) {
          exitFullScreen();
        }
        // Maybe when left side snapping we should check that top == 0 + height == 100%?
      } else if (isFullscreenRight(windowElt)) {
        const windowWidth = getWindowWidth(windowElt);
        if (
          getWindowHeight(windowElt) < containerHeight ||
          getLeftPositioning(windowElt) + windowWidth < containerWidth
        ) {
          exitFullScreen();
        }
      }
      unblockElementsFromTakingPointerEvents();
      windowElt.classList.remove("resizing");
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", validateAndStopResize);
      document.removeEventListener("click", validateAndStopResize);
      document.removeEventListener("resize", validateAndStopResize);
    };

    const resize = (e) => {
      requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let minPossibleWidth = minWidth;
        const oobDistances = getOobDistances();
        if (oobDistances.left > 0 || oobDistances.right > 0) {
          minPossibleWidth = Math.max(
            minPossibleWidth,
            WINDOW_OOB_SECURITY_PIX +
              Math.max(oobDistances.left, oobDistances.right),
          );
        }

        // Not the same rules for minHeight as it is the element with the
        // always-on screen title bar
        let minPossibleHeight = minHeight;
        if (oobDistances.bottom > 0) {
          minPossibleHeight = Math.max(
            minPossibleHeight,
            WINDOW_OOB_SECURITY_PIX + oobDistances.bottom,
          );
        }

        // Update dimensions based on direction
        if (direction.includes("e")) {
          const maxWidth = containerWidth - startLeft;
          const newWidth = Math.max(
            minPossibleWidth,
            Math.min(startWidth + deltaX, maxWidth),
          );
          setWindowWidth(windowElt, newWidth);
        }
        if (direction.includes("s")) {
          const maxHeight = containerHeight - startTop;
          const newHeight = Math.max(
            minPossibleHeight,
            Math.min(startHeight + deltaY, maxHeight),
          );
          setWindowHeight(windowElt, newHeight);
        }
        if (direction.includes("w")) {
          const newWidth = Math.max(
            minPossibleWidth,
            Math.min(startWidth - deltaX, startLeft + startWidth),
          );
          setWindowWidth(windowElt, newWidth);
          const deltaLeft =
            newWidth === minPossibleWidth &&
            startWidth - deltaX < minPossibleWidth
              ? startWidth - minPossibleWidth
              : deltaX;
          setLeftPositioning(windowElt, Math.max(startLeft + deltaLeft, 0));
        }
        if (direction.includes("n")) {
          const newHeight = Math.max(
            minPossibleHeight,
            Math.min(startHeight - deltaY, startTop + startHeight),
          );
          setWindowHeight(windowElt, newHeight);
          const deltaTop =
            newHeight === minPossibleHeight &&
            startHeight - deltaY < minPossibleHeight
              ? startHeight - minPossibleHeight
              : deltaY;
          setTopPositioning(windowElt, Math.max(startTop + deltaTop, 0));
        }
      });
    };
  }
}
