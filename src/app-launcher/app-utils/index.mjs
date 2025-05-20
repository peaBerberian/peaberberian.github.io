import { codeImgSvg, demoImgSvg, docImgSvg } from "../../constants.mjs";
import {
  applyStyle,
  constructSidebarElt,
  createAppIframe,
} from "../../utils.mjs";
import strHtml from "../../str-html.mjs";
import { constructAppHeaderLine } from "./header-line.mjs";
import setUpContextMenu from "../../components/context-menu.mjs";

// ==== Utils for lazy-loaded applications ====

export default {
  // Often needed utils:
  applyStyle: applyStyle,
  strHtml: strHtml,
  constructAppHeaderLine: constructAppHeaderLine,
  setUpContextMenu,

  // In rare situations:
  constructSidebarElt: constructSidebarElt,
  createAppIframe: createAppIframe,
  createAppTitle: createAppTitle,
  createFullscreenButton: createFullscreenButton,
};

// ========

/**
 * Title `h2` element found in many mostly-textual app.
 * @param {string} title - Title that will be rendered
 * @param {Object|undefined} [ql] - Quicklinks object for quicklinks that will
 * be shown aside the title.
 * @returns {HTMLElement}
 */
function createAppTitle(title, ql) {
  return strHtml`<h2 class="app-title">${title} ${constructQuicklinks(ql ?? {})}</h2>`;
}

/**
 * Construct quicklinks part of an app's title.
 * @param {Object} ql
 * @returns {HTMLElement}
 */
function constructQuicklinks(ql) {
  const links = [];
  if (ql.demo) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = demoImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its demo page";
    imgWrapper.alt = "Link to demo page";
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.demo}" target="_blank">${imgWrapper}</a>`,
    );
  }
  if (ql.github) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = codeImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its code repository";
    imgWrapper.alt = "Link to its code repository";
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.github}" target="_blank">${imgWrapper}</a>`,
    );
  }
  if (ql.doc) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = docImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its API documentation";
    imgWrapper.alt = "Link to its API documentation";
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.doc}" target="_blank">${imgWrapper}</a>`,
    );
  }
  return strHtml`<span class="quickLinks">${links}</span>`;
}

/**
 * Create automatically-updating fullscreen enter/exit button.
 * @param {AbortSignal} abortSignal - This button adds event listener on the
 * page, which means it reserves some resource. To free up that resource, it
 * will listen to this signal.
 * @returns {HTMLElement}
 */
function createFullscreenButton(abortSignal) {
  const fullscreenButton = strHtml`<input class="btn" type="button" value="">`;
  function updateFullScreenText() {
    const fullscreenText =
      document.fullscreenElement === null
        ? "Go fullscreen!"
        : "Exit fullcreen mode";
    fullscreenButton.value = fullscreenText;
  }
  updateFullScreenText();
  document.body.addEventListener("fullscreenchange", updateFullScreenText);
  abortSignal.addEventListener("aborted", () => {
    document.body.removeEventListener("fullscreenchange", updateFullScreenText);
  });
  fullscreenButton.onclick = function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  };
  return fullscreenButton;
}
