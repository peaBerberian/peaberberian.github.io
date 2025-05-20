import { BUTTONS_BY_NAME, BUTTONS_LIST } from "../constants.mjs";
import { applyStyle } from "../utils.mjs";

export function constructAppHeaderLine(buttonConfigs) {
  const headerElt = document.createElement("div");
  headerElt.className = "w-tools";

  const buttonElts = {};

  const addButton = (config, buttonName) => {
    const defaultButtonConfig = BUTTONS_BY_NAME[buttonName] ?? [];
    const buttonElt = createButtonElt(
      config.svg ?? defaultButtonConfig.svg ?? "",
      config.title ?? defaultButtonConfig.defaultTitle ?? "",
      config.height ?? defaultButtonConfig.height,
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

function createButtonElt(svg, title, height = "1.7rem", onClick) {
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
      width: "1.7rem",
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
