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
 * @param {HTMLElement} windowElt - The whole window that can be resized and
 * moved.
 * @param {Object} dimensions
 * @param {number} dimensions.minHeight - The minimum height in pixels the
 * window can be resized to.
 * @param {number} dimensions.minWidth - The minimum width in pixels the
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
  { minHeight, minWidth },
  {
    activateWindow,
    getOobDistances,
    updateOobDistances,
    exitFullScreen,
    saveCurrentCoordinates,
  },
  abortSignal,
) {
  const header = windowElt.getElementsByClassName("w-header")[0];

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

  abortSignal.addEventListener("abort", () => {
    isDragging = false;
    disableSnappingZones();
    unblockElementsFromTakingPointerEvents();
  });

  addResizeHandles();

  if (header) {
    const onTouchStart = (e) => {
      isDragging = true;
      if (!isFullscreen(windowElt)) {
        saveCurrentCoordinates();
      }
      const touch = e.touches[0];
      blockElementsFromTakingPointerEvents();
      const topOffset =
        SETTINGS.taskbarLocation.getValue() === "top"
          ? SETTINGS.taskbarSize.getValue()
          : 0;
      const leftOffset =
        SETTINGS.taskbarLocation.getValue() === "left"
          ? SETTINGS.taskbarSize.getValue()
          : 0;
      const rect = header.getBoundingClientRect();
      offsetX = touch.clientX - rect.left + leftOffset;
      offsetY = touch.clientY - rect.top + topOffset;
      initialXPercent = offsetX / rect.width;
      initialX = touch.clientX;
      initialY = touch.clientY;
      const maxDimensions = getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue(),
      );
      containerWidth = maxDimensions.maxWidth;
      containerHeight = maxDimensions.maxHeight;
      activateWindow();
    };
    const onMouseDown = (e) => {
      if (e.button !== 0) {
        // not left click
        return;
      }
      isDragging = true;
      if (!isFullscreen(windowElt)) {
        saveCurrentCoordinates();
      }
      blockElementsFromTakingPointerEvents();
      const topOffset =
        SETTINGS.taskbarLocation.getValue() === "top"
          ? SETTINGS.taskbarSize.getValue()
          : 0;
      const leftOffset =
        SETTINGS.taskbarLocation.getValue() === "left"
          ? SETTINGS.taskbarSize.getValue()
          : 0;
      const rect = windowElt.getBoundingClientRect();
      offsetX = e.clientX - rect.left + leftOffset;
      offsetY = e.clientY - rect.top + topOffset;
      initialXPercent = offsetX / rect.width;
      initialX = e.clientX;
      initialY = e.clientY;
      const maxDimensions = getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue(),
      );
      containerWidth = maxDimensions.maxWidth;
      containerHeight = maxDimensions.maxHeight;
      activateWindow();
    };
    const moveWindowOnNewMouseCoordinates = (clientX, clientY) => {
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

        checkSnapping(windowElt, {
          clientY,
          clientX,
          minWidth,
          containerWidth,
          containerHeight,
          newTop,
          newLeft,
        });

        setLeftPositioning(windowElt, Math.max(minX, Math.min(newX, maxX)));
        setTopPositioning(windowElt, Math.max(minY, Math.min(newY, maxY)));
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
        moveWindowOnNewMouseCoordinates(clientX, clientY);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        moveWindowOnNewMouseCoordinates(touch.clientX, touch.clientY);
      }
    };
    const onDocumentMouseMove = (e) => {
      if (!isDragging) {
        return;
      }
      moveWindowOnNewMouseCoordinates(e.clientX, e.clientY);
    };
    const validate = () => {
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
    const stopDragging = () => {
      isDragging = false;
      if (!isFullscreen(windowElt)) {
        saveCurrentCoordinates();
      }
      disableSnappingZones();
      unblockElementsFromTakingPointerEvents();
    };
    addEventListener(header, "touchstart", abortSignal, onTouchStart);
    addEventListener(header, "touchend", abortSignal, validate);
    addEventListener(header, "touchcancel", abortSignal, stopDragging);
    addEventListener(header, "touchmove", abortSignal, onTouchMove);
    addEventListener(header, "mousedown", abortSignal, onMouseDown);
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
      validate,
    );
    addEventListener(document.documentElement, "click", abortSignal, validate);
    addEventListener(document, "mousemove", abortSignal, onDocumentMouseMove);
    addEventListener(windowElt, "mouseup", abortSignal, validate);
    addEventListener(document, "resize", abortSignal, stopDragging);
  }

  addEventListener(windowElt, "mousedown", abortSignal, () => {
    activateWindow();
  });

  function addResizeHandles() {
    const directions = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];
    directions.forEach((dir) => {
      const handle = document.createElement("div");
      handle.className = `w-res-bord res-${dir}`;
      windowElt.appendChild(handle);
      setupResizeEvent(handle, dir);
    });
  }

  function setupResizeEvent(handle, direction) {
    let startX, startY, startWidth, startHeight, startLeft, startTop;

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
      document.addEventListener("mouseup", stopResize);
      document.addEventListener("click", stopResize);
      document.addEventListener("resize", stopResize);
    });

    const stopResize = () => {
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
      document.removeEventListener("mouseup", stopResize);
      document.removeEventListener("click", stopResize);
      document.removeEventListener("resize", stopResize);
    };

    // Resize function based on direction
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

function checkSnapping(
  windowElt,
  {
    clientX,
    clientY,
    minWidth,
    containerWidth,
    containerHeight,
    newLeft,
    newTop,
  },
) {
  if (
    SETTINGS.topWindowSnapping.getValue() &&
    (getWindowWidth(windowElt) < containerWidth ||
      getWindowHeight(windowElt) < containerHeight)
  ) {
    const snapPosLimitTop = SETTINGS.oobWindows.getValue()
      ? clientY -
        15 -
        (SETTINGS.taskbarLocation.getValue() === "top"
          ? SETTINGS.taskbarSize.getValue()
          : 0)
      : newTop;
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
    getWindowWidth(windowElt) < containerWidth
  ) {
    const snapPosLimitLeft = SETTINGS.oobWindows.getValue()
      ? clientX -
        15 -
        (SETTINGS.taskbarLocation.getValue() === "left"
          ? SETTINGS.taskbarSize.getValue()
          : 0)
      : newLeft;
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
      : newLeft + getWindowWidth(windowElt);
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
