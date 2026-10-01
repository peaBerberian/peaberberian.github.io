import { BUTTONS_BY_NAME, BUTTONS_LIST } from "../constants.mjs";
import { applyStyle } from "../utils.mjs";

const toolbarIcon = (contents) => `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>${contents}</svg>`;

const TOOLBAR_ICONS = {
  newFile: toolbarIcon(`
    <path d="M6 2.5h8l4 4V21.5H6Z" />
    <path d="M14 2.5v4h4" />
    <path d="M12 10v7M8.5 13.5h7" />
  `),
  previous: toolbarIcon(`
    <path d="m15 5-7 7 7 7" />
  `),
  next: toolbarIcon(`
    <path d="m9 5 7 7-7 7" />
  `),
  undo: toolbarIcon(`
    <path d="m9 7-4 4 4 4" />
    <path d="M5 11h8a6 6 0 0 1 6 6v1" />
  `),
  redo: toolbarIcon(`
    <path d="m15 7 4 4-4 4" />
    <path d="M19 11h-8a6 6 0 0 0-6 6v1" />
  `),
  clear: toolbarIcon(`
    <path d="M4 7h16M9 3h6l1 4H8l1-4Z" />
    <path d="m6.5 7 1 14h9l1-14M10 11v6M14 11v6" />
  `),
  upload: toolbarIcon(`
    <path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5" />
    <path d="M5 14v7h14v-7" />
  `),
  open: toolbarIcon(`
    <path d="M3 6.5h7l2 2h9l-2.5 11H4.5Z" />
    <path d="M3 6.5v13h1.5" />
  `),
  download: toolbarIcon(`
    <path d="M12 3v13m0 0 4.5-4.5M12 16l-4.5-4.5" />
    <path d="M5 14v7h14v-7" />
  `),
  "quick-save": toolbarIcon(`
    <path d="m13.5 2-8 12h6l-1 8 8-12h-6Z" />
  `),
  save: toolbarIcon(`
    <path d="M4 3h13l3 3v15H4Z" />
    <path d="M8 3v6h8V3M8 21v-7h8v7" />
  `),
  fullscreen: toolbarIcon(`
    <path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5" />
  `),
  code: toolbarIcon(`
    <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
  `),
  minimize: toolbarIcon(`
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M8 16h8" />
  `),
  close: toolbarIcon(`
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="m8 8 8 8M16 8l-8 8" />
  `),
  deactivate: toolbarIcon(`
    <rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="3 3" />
  `),
  retry: toolbarIcon(`
    <path d="M20 7v5h-5" />
    <path d="M19 12a7 7 0 1 0-1.5 5" />
  `),
};

export function constructAppHeaderLine(buttonConfigs) {
  const headerElt = document.createElement("div");
  headerElt.className = "w-tools";

  const buttonElts = {};

  const addButton = (config, buttonName) => {
    const defaultButtonConfig = BUTTONS_BY_NAME[buttonName] ?? [];
    const buttonElt = createButtonElt(
      config.svg ?? TOOLBAR_ICONS[buttonName] ?? defaultButtonConfig.svg ?? "",
      config.title ?? defaultButtonConfig.defaultTitle ?? "",
      config.height,
      (e) => {
        e.preventDefault();
        config.onClick();
      },
    );
    buttonElts[buttonName] = buttonElt;
    buttonElt.className = "w-tool-btn";

    // prevent random selection on click
    buttonElt.onmousedown = (e) => e.preventDefault();
    buttonElt.onselect = (e) => e.preventDefault();

    headerElt.appendChild(buttonElt);
  };

  if (Array.isArray(buttonConfigs)) {
    for (const config of buttonConfigs) {
      if (config.name === "separator") {
        const separatorElt = document.createElement("span");
        applyStyle(separatorElt, {
          width: "1px",
          borderRight: "1px solid var(--sidebar-hover-bg)",
        });
        headerElt.appendChild(separatorElt);
      } else {
        addButton(config, config.name);
      }
    }
  } else {
    BUTTONS_LIST.forEach(({ name }) => {
      if (buttonConfigs[name]) {
        addButton(buttonConfigs[name], name);
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

/**
 * @param {HTMLElement} buttonElt
 */
function enableButton(buttonElt) {
  buttonElt.setAttribute("tabindex", "0");
  buttonElt.classList.remove("disabled");
}

function disableButton(buttonElt) {
  buttonElt.removeAttribute("tabindex");
  buttonElt.classList.add("disabled");
}

function createButtonElt(svg, title, height = "1.5rem", onClick) {
  const buttonWrapperElt = document.createElement("span");
  applyStyle(buttonWrapperElt, {
    display: "flex",
    height: "100%",
    alignItems: "center",
  });
  const svgWrapperElt = document.createElement("span");
  applyStyle(svgWrapperElt, {
    height: height,
  });
  const buttonSvgElt = getSvg(svg);
  if (buttonSvgElt) {
    applyStyle(buttonSvgElt, {
      width: "1.5rem",
      height: "100%",
      // flex: "0 0 auto",
    });
    svgWrapperElt.appendChild(buttonSvgElt);
  }
  buttonWrapperElt.appendChild(svgWrapperElt);
  svgWrapperElt.className = "w-tool-icon";
  buttonWrapperElt.onclick = (e) => {
    if (buttonWrapperElt.classList.contains("disabled")) {
      return;
    }
    return onClick(e);
  };
  buttonWrapperElt.onkeydown = (e) => {
    if (buttonWrapperElt.classList.contains("disabled")) {
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      return onClick(e);
    }
  };
  buttonWrapperElt.title = title;
  const titleElt = document.createElement("span");
  titleElt.textContent = title;
  buttonWrapperElt.appendChild(titleElt);
  titleElt.className = "w-tool-title";
  buttonWrapperElt.setAttribute("tabindex", "0");
  return buttonWrapperElt;
}

function getSvg(svg) {
  const svgWrapperElt = document.createElement("div");
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}
