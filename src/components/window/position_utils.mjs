import { WINDOW_OOB_SECURITY_PIX } from "../../constants.mjs";
import { SETTINGS } from "../../settings.mjs";

/**
 * Set the width of the given window.
 * @param {HTMLElement} windowElt - The window `HTMLElement` to place.
 * @param {number} leftPx - The wanted width in CSS pixels for that window.
 */
export function setWindowWidth(windowElt, widthPx) {
  if (SETTINGS.absoluteWindowSize.getValue()) {
    windowElt.style.width = String(widthPx) + "px";
  } else {
    windowElt.style.width =
      String((widthPx / getMaxDesktopWidth()) * 100) + "%";
  }
}

/**
 * @param {HTMLElement} windowElt - The window HTMLElement for which you want
 * to know if it is percent-width-sized.
 * @returns {Boolean} - If `true`, its width is expressed in percentage, which
 * means it is relative to its container element's width.
 * If `false`, it is absolute, expressed as CSS pixels.
 */
export function isPercentWidthSized(windowElt) {
  return windowElt.style.width && windowElt.style.width.endsWith("%");
}

/**
 * Get in (floating) pixels the width of the given window.
 * @param {HTMLElement} windowElt - The window for which you want the width.
 * @returns {number} - The x coordinate in pixels for the left of the window.
 */
export function getWindowWidth(windowElt) {
  if (isPercentWidthSized(windowElt)) {
    const initialWidth = parseFloat(windowElt.style.width, 10) / 100;
    return initialWidth * getMaxDesktopWidth();
  } else {
    return parseFloat(windowElt.style.width, 10);
  }
}

/**
 * Set the height of the given window.
 * @param {HTMLElement} windowElt - The window `HTMLElement` to place.
 * @param {number} leftPx - The wanted height in CSS pixels for that window.
 */
export function setWindowHeight(windowElt, heightPx) {
  if (SETTINGS.absoluteWindowSize.getValue()) {
    windowElt.style.height = String(heightPx) + "px";
  } else {
    windowElt.style.height =
      String((heightPx / getMaxDesktopHeight()) * 100) + "%";
  }
}

/**
 * @param {HTMLElement} windowElt - The window HTMLElement for which you want
 * to know if it is percent-height-sized.
 * @returns {Boolean} - If `true`, its height is expressed in percentage, which
 * means it is relative to its container element's height.
 * If `false`, it is absolute, expressed as CSS pixels.
 */
export function isPercentHeightSized(windowElt) {
  return windowElt.style.height && windowElt.style.height.endsWith("%");
}

/**
 * Get in (floating) pixels the height of the given window.
 * @param {HTMLElement} windowElt - The window for which you want the height.
 * @returns {number} - The x coordinate in pixels for the left of the window.
 */
export function getWindowHeight(windowElt) {
  if (isPercentHeightSized(windowElt)) {
    const initialHeight = parseFloat(windowElt.style.height, 10) / 100;
    return initialHeight * getMaxDesktopHeight();
  } else {
    return parseFloat(windowElt.style.height, 10);
  }
}

/**
 * Set the left position of the given window in its container element.
 * @param {HTMLElement} windowElt - The window `HTMLElement` to place.
 * @param {number} leftPx - The position of its leftest side in CSS pixels
 * relative to its parent container's width.
 */
export function setLeftPositioning(windowElt, leftPx) {
  // We'll assume that the width of the container is the total width for now.
  const maxWidth = document.documentElement.clientWidth;
  if (SETTINGS.absoluteWindowPositioning.getValue()) {
    windowElt.style.left = String(leftPx) + "px";
  } else {
    windowElt.style.left = String((leftPx / maxWidth) * 100) + "%";
  }
}

/**
 * @param {HTMLElement} windowElt - The window HTMLElement for which you want
 * to know if it is percent-left-positioned.
 * @returns {Boolean} - If `true`, its x coordinate is expressed in percents,
 * which means it is relative to its container element's width.
 * If `false`, it is absolute, expressed as pixels from the left of that
 * container.
 */
export function isPercentLeftPositioned(windowElt) {
  return windowElt.style.left && windowElt.style.left.endsWith("%");
}

/**
 * Get in (floating) pixels the x coordinate for the left of the given
 * window.
 * @param {HTMLElement} windowElt - The window for which you want the x
 * coordinate
 * @returns {number} - The x coordinate in pixels for the left of the window.
 */
export function getLeftPositioning(windowElt) {
  // We'll assume that the width of the container is the total width for now.
  const clientWidth = document.documentElement.clientWidth;
  if (isPercentLeftPositioned(windowElt)) {
    const initialLeft = parseFloat(windowElt.style.left, 10) / 100;
    return initialLeft * clientWidth;
  } else {
    return parseFloat(windowElt.style.left, 10);
  }
}

/**
 * @param {HTMLElement} windowElt - The window HTMLElement for which you want
 * to know if it is percent-top-positioned.
 * @returns {Boolean} - If `true`, its y coordinate is expressed in percents,
 * which means it is relative to its container element's height.
 * If `false`, it is absolute, expressed as pixels from the top of that
 * container.
 */
export function isPercentTopPositioned(windowElt) {
  return windowElt.style.top && windowElt.style.top.endsWith("%");
}

/**
 * Get in (floating) pixels the y coordinate for the top of the given
 * window.
 * @param {HTMLElement} windowElt - The window for which you want the y
 * coordinate
 * @returns {number} - The y coordinate in pixels for the top of the window.
 */
export function getTopPositioning(windowElt) {
  if (isPercentTopPositioned(windowElt)) {
    const initialTop = parseFloat(windowElt.style.top, 10) / 100;
    return initialTop * getMaxDesktopHeight();
  } else {
    return parseFloat(windowElt.style.top, 10);
  }
}

/**
 * Set the top position of the given window in its container element.
 * @param {HTMLElement} windowElt - The window `HTMLElement` to place.
 * @param {number} leftPx - The position of its toppest side in CSS pixels
 * relative to its parent container's height.
 */
export function setTopPositioning(windowElt, topPx) {
  if (SETTINGS.absoluteWindowPositioning.getValue()) {
    windowElt.style.top = String(topPx) + "px";
  } else {
    windowElt.style.top = String((topPx / getMaxDesktopHeight()) * 100) + "%";
  }
}

export function getMaxWindowPositions(windowElt) {
  const maxWidth = getMaxDesktopWidth();
  const maxHeight = getMaxDesktopHeight();
  const maxXBound = maxWidth - getWindowWidth(windowElt);
  const maxYBound = maxHeight - getWindowHeight(windowElt);
  if (SETTINGS.oobWindows.getValue()) {
    return {
      maxX: maxWidth - WINDOW_OOB_SECURITY_PIX,
      maxY:
        maxHeight -
        (SETTINGS.windowBorderSize.getValue() + WINDOW_OOB_SECURITY_PIX),
      maxXBound,
      maxYBound,
      maxHeight,
      maxWidth,
    };
  }
  return {
    maxX: maxXBound,
    maxY: maxYBound,
    maxXBound,
    maxYBound,
    maxHeight,
    maxWidth,
  };
}

export function getMinWindowPositions(windowElt) {
  if (!SETTINGS.oobWindows.getValue()) {
    return { minX: 0, minY: 0, minXBound: 0, minYBound: 0 };
  }
  return {
    minX: 0 - getWindowWidth(windowElt) + WINDOW_OOB_SECURITY_PIX,
    minY: 0 - Math.max(SETTINGS.windowHeaderHeight.getValue() - 15, 0),
    minXBound: 0,
    minYBound: 0,
  };
}

export function calculateOutOfBounds(
  { minXBound, minYBound },
  { maxXBound, maxYBound },
  newLeft,
  newTop,
) {
  const oobDistances = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  if (newLeft >= minXBound && newLeft <= maxXBound) {
    oobDistances.left = 0;
    oobDistances.right = 0;
  } else {
    if (newLeft < minXBound) {
      oobDistances.left = minXBound - newLeft;
    }
    if (newLeft > maxXBound) {
      oobDistances.right = newLeft - maxXBound;
    }
  }
  if (newTop >= minYBound && newTop <= maxYBound) {
    oobDistances.top = 0;
    oobDistances.bottom = 0;
  } else {
    if (newTop < minYBound) {
      oobDistances.top = minYBound - newTop;
    }
    if (newTop > maxYBound) {
      oobDistances.bottom = newTop - maxYBound;
    }
  }
  return oobDistances;
}

function getMaxDesktopHeight() {
  return ["top", "bottom"].includes(SETTINGS.taskbarLocation.getValue())
    ? document.documentElement.clientHeight - SETTINGS.taskbarSize.getValue()
    : document.documentElement.clientHeight;
}

function getMaxDesktopWidth() {
  return ["left", "right"].includes(SETTINGS.taskbarLocation.getValue())
    ? document.documentElement.clientWidth - SETTINGS.taskbarSize.getValue()
    : document.documentElement.clientWidth;
}
