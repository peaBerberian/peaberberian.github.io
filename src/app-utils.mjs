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

/** URL of the SVG for the "doc" link we set on some applications */
const docImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16" fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg"><path d="M5 0C3.34315 0 2 1.34315 2 3V13C2 14.6569 3.34315 16 5 16H14V14H4V12H14V0H5Z"/></svg>`;

/** URL of the SVG for the "demo" link we set on some applications */
const demoImgSvg = `<svg version="1.1" fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 512 512" xml:space="preserve"><g><path class="st0" d="M485.234,116.625H261.906l69.719-69.719c1.75-1.75,1.75-4.563,0-6.313l-17.422-17.438   c-1.734-1.75-4.563-1.75-6.297,0l-89.688,89.688l-89.656-89.688c-1.75-1.75-4.563-1.75-6.313,0l-17.438,17.438   c-1.75,1.75-1.75,4.563,0,6.313l69.75,69.719H26.766c-14.781,0-26.766,12-26.766,26.781v319.969   c0,14.781,11.984,26.781,26.766,26.781h458.469c14.781,0,26.766-12,26.766-26.781V143.406   C512,128.625,500.016,116.625,485.234,116.625z M383.594,421.188c0,8.531-6.906,15.438-15.422,15.438H66.844   c-8.531,0-15.438-6.906-15.438-15.438V191.875c0-8.531,6.906-15.438,15.438-15.438h301.328c8.516,0,15.422,6.906,15.422,15.438   V421.188z M473.188,333.813h-45.125v-45.125h45.125V333.813z M449.047,234.156c-13.906,0-25.172-11.281-25.172-25.188   s11.266-25.188,25.172-25.188s25.172,11.281,25.172,25.188S462.953,234.156,449.047,234.156z"/>
</g></svg>`;

const codeImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16"  fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 1H1V15H15V1ZM6 5L7.41421 6.41421L5.82843 8L7.41421 9.58579L6 11L3 8L6 5ZM10 5L8.58579 6.41421L10.1716 8L8.58579 9.58579L10 11L13 8L10 5Z"/></svg>`;

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
