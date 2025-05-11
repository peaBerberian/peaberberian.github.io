import * as CONSTANTS from "./constants.mjs";
import { applyStyle, constructSidebarElt, createAppIframe } from "./utils.mjs";
import strHtml from "./str-html.mjs";

// ==== Globally export utils for lazy-loaded applications ====

window.AppUtils = {
  // Often needed:

  applyStyle: applyStyle,
  strHtml: strHtml,

  // In rare situations:

  IMAGE_ROOT_PATH: CONSTANTS.IMAGE_ROOT_PATH,
  constructSidebarElt: constructSidebarElt,
  createAppIframe: createAppIframe,
  createAppTitle: createAppTitle,
  createFullscreenButton: createFullscreenButton,
  CONSTANTS,
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
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.demo}" target="_blank"><img class="quicklink-img" title="Link to its demo page" alt="Link to demo page" src="${CONSTANTS.demoImgUrl}"/></a>`,
    );
  }
  if (ql.github) {
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.github}" target="_blank"><img class="quicklink-img" title="GitHub repository" alt="Link to GitHub repository" src="${CONSTANTS.IMAGE_ROOT_PATH + "github.png"}"/></a>`,
    );
  }
  if (ql.doc) {
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.doc}" target="_blank"><img class="quicklink-img" title="Link to its API documentation" alt="Link to its API documentation" src="${CONSTANTS.docImgUrl}"/></a>`,
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
