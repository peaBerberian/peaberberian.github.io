import setUpContextMenu from "../components/context-menu.mjs";
import { codeImgSvg, demoImgSvg, docImgSvg } from "../constants.mjs";
import { constructSidebarElt, createExternalIframe } from "../utils.mjs";
import { constructAppHeaderLine } from "./header-line.mjs";

export function getAppUtils() {
  return {
    // Often needed utils:
    constructAppHeaderLine,
    setUpContextMenu,

    // In rare situations:
    constructSidebarElt,
    createExternalIframe,
    createAppTitle,
    createFullscreenButton,
  };
}

/**
 * Title `h2` element found in many mostly-textual app.
 * @param {string} title - Title that will be rendered
 * @param {Object|undefined} [ql] - Quicklinks object for quicklinks that will
 * be shown aside the title.
 * @returns {HTMLElement}
 */
function createAppTitle(title, ql) {
  const h2Elt = document.createElement("h2");
  h2Elt.className = "app-titl";
  h2Elt.appendChild(document.createTextNode(title));
  h2Elt.appendChild(constructQuicklinks(ql ?? {}));
  return h2Elt;
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
    const aElt = document.createElement("a");
    aElt.className = "quicklink-link";
    aElt.href = ql.demo;
    aElt.target = "_blank";
    aElt.appendChild(imgWrapper);
    links.push(aElt);
  }
  if (ql.github) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = codeImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its code repository";
    imgWrapper.alt = "Link to its code repository";
    const aElt = document.createElement("a");
    aElt.className = "quicklink-link";
    aElt.href = ql.github;
    aElt.target = "_blank";
    aElt.appendChild(imgWrapper);
    links.push(aElt);
  }
  if (ql.doc) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = docImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its API documentation";
    imgWrapper.alt = "Link to its API documentation";
    const aElt = document.createElement("a");
    aElt.className = "quicklink-link";
    aElt.href = ql.doc;
    aElt.target = "_blank";
    aElt.appendChild(imgWrapper);
    links.push(aElt);
  }
  const quickLinksElt = document.createElement("span");
  quickLinksElt.className = "quickLinks";
  for (const lnk of links) {
    quickLinksElt.appendChild(lnk);
  }
  return quickLinksElt;
}

/**
 * Create automatically-updating fullscreen enter/exit button.
 * @param {AbortSignal} abortSignal - This button adds event listener on the
 * page, which means it reserves some resource. To free up that resource, it
 * will listen to this signal.
 * @returns {HTMLElement}
 */
function createFullscreenButton(abortSignal) {
  const fullscreenButton = document.createElement("input");
  fullscreenButton.className = "btn";
  fullscreenButton.type = "button";
  fullscreenButton.value = "";
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
