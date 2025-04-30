import { demoImgUrl, docImgUrl, IMAGE_ROOT_PATH } from "../constants.mjs";

import strHtml from "../str-html.mjs";
export function createAppTitle(title, ql) {
  return strHtml`<h2 class="app-title">${title} ${constructQuicklinks(ql)}</h2>`;
}
export function constructQuicklinks(ql) {
  const links = [];
  if (ql.demo) {
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.demo}" target="_blank"><img class="quicklink-img" title="Link to its demo page" alt="Link to demo page" src="${demoImgUrl}"/></a>`,
    );
  }
  if (ql.github) {
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.github}" target="_blank"><img class="quicklink-img" title="GitHub repository" alt="Link to GitHub repository" src="${IMAGE_ROOT_PATH + "github.png"}"/></a>`,
    );
  }
  if (ql.doc) {
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.doc}" target="_blank"><img class="quicklink-img" title="Link to its API documentation" alt="Link to its API documentation" src="${docImgUrl}"/></a>`,
    );
  }
  return strHtml`<span class="quickLinks">${links}</span>`;
}

export function createFullscreenButton(abortSignal) {
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
