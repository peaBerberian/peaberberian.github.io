import * as CONSTANTS from "./constants.mjs";
import { applyStyle, constructSidebarElt, createAppIframe } from "./utils.mjs";
import strHtml from "./str-html.mjs";

// ==== Globally export utils for lazy-loaded applications ====

window.AppUtils = {
  // Often needed:

  applyStyle: applyStyle,
  strHtml: strHtml,
  constructAppHeaderLine: constructAppHeaderLine,

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

const buttonsSvg = {
  // All SVG are with a CC0 or PD license, most found on svgrepo

  newFile: {
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-220.000000, -1599.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M182,1457.0005 L166,1457.0005 L166,1441.0005 L176,1441.0005 L176,1447.0005 L182,1447.0005 L182,1457.0005 Z M178,1439.0005 L164,1439.0005 L164,1459.0005 L184,1459.0005 L184,1445.2095 L178,1439.0005 Z"></path></g></g></g></svg>`,
    height: "1.3rem",
    // svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-420.000000, -8079.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M382,7937 L366,7937 L366,7925.837 L370.837,7921 L382,7921 L382,7937 Z M383.969,7919 L370,7919 L370,7919.009 L364.009,7925 L364,7925 L364,7939 L384,7939 L384,7919 L383.969,7919 Z"></path></g></g></g></svg>`,
  },
  undo: {
    height: "1.8rem",
    svg: `<svg fill="currentColor" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`,
  },
  redo: {
    height: "1.8rem",
    svg: `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`,
  },
  save: {
    height: "1.44em",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-99.000000, -680.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M50.21875,525 L52.31875,525 L52.31875,523 L50.21875,523 L50.21875,525 Z M61.9,538 L59.8,538 L59.8,532 L58.88125,532 L57.7,532 L49.3,532 L47.5276,532 L47.2,532 L47.2,538 L45.1,538 L45.1,526.837 L47.2,524.837 L47.2,528 L48.11875,528 L49.3,528 L57.7,528 L59.47135,528 L59.8,528 L59.8,522 L61.9,522 L61.9,538 Z M49.3,538 L57.7,538 L57.7,534 L49.3,534 L49.3,538 Z M49.3,522.837 L50.17885,522 L57.7,522 L57.7,526 L49.3,526 L49.3,522.837 Z M63.9664,520 L61.8664,520 L49.3,520 L49.3,520.008 L47.2084,522 L47.2,522 L47.2,522.008 L43.0084,526 L43,526 L43,538 L43,540 L45.1,540 L61.8664,540 L63.9664,540 L64,540 L64,538 L64,522 L64,520 L63.9664,520 Z" id="save_item-[#1409]"></path></g></g></g></svg>`,
  },
  save2: `<svg fill="currentColor" width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill-rule="evenodd"><g transform="translate(-419.000000, -640.000000)"><g transform="translate(56.000000, 160.000000)"><path d="M370.21875,484 C370.21875,483.448 370.68915,483 371.26875,483 C371.84835,483 372.31875,483.448 372.31875,484 C372.31875,484.552 371.84835,485 371.26875,485 C370.68915,485 370.21875,484.552 370.21875,484 L370.21875,484 Z M381.9,497 C381.9,497.552 381.4296,498 380.85,498 L379.8,498 L379.8,494 C379.8,492.895 378.86025,492 377.7,492 L369.3,492 C368.13975,492 367.2,492.895 367.2,494 L367.2,498 L366.15,498 C365.5704,498 365.1,497.552 365.1,497 L365.1,487.044 C365.1,486.911 365.15565,486.784 365.2533,486.691 L367.2,484.837 L367.2,486 C367.2,487.105 368.13975,488 369.3,488 L377.7,488 C378.86025,488 379.8,487.105 379.8,486 L379.8,482 L380.85,482 C381.4296,482 381.9,482.448 381.9,483 L381.9,497 Z M377.7,498 L369.3,498 L369.3,495 C369.3,494.448 369.7704,494 370.35,494 L376.65,494 C377.2296,494 377.7,494.448 377.7,495 L377.7,498 Z M369.3,482.837 L370.17885,482 L377.7,482 L377.7,485 C377.7,485.552 377.2296,486 376.65,486 L370.35,486 C369.7704,486 369.3,485.552 369.3,485 L369.3,482.837 Z M381.9,480 L369.7347,480 C369.45645,480 369.18975,480.105 368.99235,480.293 L363.30765,485.707 C363.11025,485.895 363,486.149 363,486.414 L363,498 C363,499.105 363.93975,500 365.1,500 L381.9,500 C383.06025,500 384,499.105 384,498 L384,482 C384,480.895 383.06025,480 381.9,480 L381.9,480 Z"></path></g></g></g></svg>`,
  clear: {
    height: "1.5em",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-179.000000, -360.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z"></path></g></g></g></svg>`,
  },
  clear2: `<svg fill="var(--window-text-color)" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6 2.5c0-.27614.22386-.5.5-.5h2c.27614 0 .5.22386.5.5v.5h1.5c.8284 0 1.5.67157 1.5 1.5v1c0 .27614-.2239.5-.5.5h-.5v6.5c0 .2761-.2239.5-.5.5h-6c-.27614 0-.5-.2239-.5-.5v-6.5h-.5c-.27614 0-.5-.22386-.5-.5v-1c0-.82843.67157-1.5 1.5-1.5h1.5zm-1 3.5v6h5v-6zm6-1v-.5c0-.27614-.2239-.5-.5-.5h-6c-.27614 0-.5.22386-.5.5v.5z" fill-rule="evenodd"/></svg>`,
};

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

function constructAppHeaderLine(buttonConfigs) {
  const headerElt = document.createElement("div");
  applyStyle(headerElt, {
    backgroundColor: "var(--window-sidebar-bg)",
    width: "100%",
    overflow: "auto",
    display: "flex",
    padding: "3px",
    gap: "5px",
    flexShrink: "0",
    borderBottom: "1px solid var(--window-line-color)",
  });

  const buttonsDefaultTitle = {
    newFile: "Create a new file",
    undo: "Undo",
    redo: "Redo",
    clear: "Clear",
    save: "Save (download)",
  };

  const buttonElts = {};

  const addButton = (config, buttonName) => {
    const buttonElt = createButtonElt(
      buttonsSvg[buttonName].svg,
      config.title ?? buttonsDefaultTitle[buttonName],
      buttonsSvg[buttonName].height,
      (e) => {
        e.preventDefault();
        config.onClick();
      },
    );
    buttonElts[buttonName] = buttonElt;
    // TODO: CSS hover
    buttonElt.onmouseover = () => {
      if (buttonElt.style.cursor === "pointer") {
        buttonElt.style.color = "var(--sidebar-selected-bg-color)";
      }
    };
    buttonElt.onmouseout = () => {
      if (buttonElt.style.cursor === "pointer") {
        buttonElt.style.color = "var(--window-text-color)";
      } else {
        buttonElt.style.color = "var(--sidebar-hover-bg)";
      }
    };
    headerElt.appendChild(buttonElt);
  };

  const knownButtons = ["newFile", "undo", "redo", "clear", "save"];
  if (Array.isArray(buttonConfigs)) {
    for (const config of buttonConfigs) {
      if (knownButtons.includes(config.name)) {
        {
        }
        addButton(config, config.name);
      }
    }
  } else {
    knownButtons.forEach((buttonName) => {
      if (buttonConfigs[buttonName]) {
        addButton(buttonConfigs[buttonName], buttonName);
      }
    });
  }
  return {
    element: headerElt,
    enableButton: (buttonName) => {
      const buttonElt = buttonElts[buttonName];
      if (buttonElt) {
        enableButton(buttonElt);
      }
    },
    disableButton: (buttonName) => {
      const buttonElt = buttonElts[buttonName];
      if (buttonElt) {
        disableButton(buttonElt);
      }
    },
  };
}

function enableButton(buttonElt) {
  if (buttonElt.style.cursor !== "pointer") {
    // TODO: CSS
    buttonElt.style.cursor = "pointer";
    buttonElt.style.color = "var(--window-text-color)";
    // "var(--sidebar-selected-bg-color)",
    // "var(--app-primary-color)",
  }
}

function disableButton(buttonElt) {
  if (buttonElt.style.cursor === "pointer") {
    // TODO: CSS
    buttonElt.style.cursor = "auto";
    buttonElt.style.color = "var(--sidebar-hover-bg)";
  }
}

function createButtonElt(svg, title, height, onClick) {
  const buttonSvgElt = getSvg(svg);
  applyStyle(buttonSvgElt, {
    width: "1.7rem",
    height: "100%",
  });
  const buttonWrapperElt = document.createElement("span");
  applyStyle(buttonWrapperElt, {
    height: height,
    margin: "auto 0",
    cursor: "pointer",
  });
  buttonWrapperElt.appendChild(buttonSvgElt);
  buttonWrapperElt.onclick = onClick;
  buttonWrapperElt.title = title;
  return buttonWrapperElt;
}

function getSvg(svg) {
  const svgWrapperElt = document.createElement("div");
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}
