import {
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
} from "../../constants.mjs";
import {
  setLeftPositioning,
  setTopPositioning,
  setWindowHeight,
  setWindowWidth,
} from "./position_utils.mjs";

/**
 * @param {HTMLElement} windowElt
 * @returns {boolean}
 */
export function isFullscreen(windowElt) {
  return windowElt.classList.contains("fullscreen");
}

/**
 * @param {HTMLElement} windowElt
 * @returns {boolean}
 */
export function isFullscreenFull(windowElt) {
  return windowElt.classList.contains("fs-full");
}

/**
 * @param {HTMLElement} windowElt
 * @returns {boolean}
 */
export function isFullscreenLeft(windowElt) {
  return windowElt.classList.contains("fs-left");
}

/**
 * @param {HTMLElement} windowElt
 * @returns {boolean}
 */
export function isFullscreenRight(windowElt) {
  return windowElt.classList.contains("fs-right");
}

/**
 * @param {HTMLElement} windowElt
 */
export function enterFullFullScreen(windowElt) {
  windowElt.style.left = "0";
  windowElt.style.top = "0";
  windowElt.style.width = "100%";
  windowElt.style.height = "100%";
  windowElt.classList.add("fullscreen");
  windowElt.classList.add("fs-full");
  windowElt.classList.remove("fs-left");
  windowElt.classList.remove("fs-right");
}

/**
 * @param {HTMLElement} windowElt
 */
export function enterLeftFullScreen(windowElt) {
  windowElt.style.left = "0";
  windowElt.style.top = "0";
  windowElt.style.width = "50%";
  windowElt.style.height = "100%";
  windowElt.classList.add("fullscreen");
  windowElt.classList.add("fs-left");
  windowElt.classList.remove("fs-right");
  windowElt.classList.remove("fs-full");
}

/**
 * @param {HTMLElement} windowElt
 */
export function enterRightFullScreen(windowElt) {
  windowElt.style.left = "50%";
  windowElt.style.top = "0";
  windowElt.style.width = "50%";
  windowElt.style.height = "100%";
  windowElt.classList.add("fullscreen");
  windowElt.classList.add("fs-right");
  windowElt.classList.remove("fs-left");
  windowElt.classList.remove("fs-full");
}

/**
 * @param {HTMLElement} windowElt
 */
export function exitAllFullScreens(windowElt, originalDimensions) {
  windowElt.classList.remove("fullscreen");
  windowElt.classList.remove("fs-full");
  windowElt.classList.remove("fs-left");
  windowElt.classList.remove("fs-right");
  if (originalDimensions) {
    setLeftPositioning(windowElt, originalDimensions.left);
    setTopPositioning(windowElt, originalDimensions.top);
    setWindowWidth(windowElt, originalDimensions.width);
    setWindowHeight(windowElt, originalDimensions.height);
  }
}
