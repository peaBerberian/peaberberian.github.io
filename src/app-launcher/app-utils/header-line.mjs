import { applyStyle } from "../../utils.mjs";

const openSvg = `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-60.000000, -1879.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M13.978,1730.401 L12.596,1729.007 L6,1735.656 L6,1733 L4,1733 L4,1739 L10.071,1739 L10.101,1737 L7.344,1737 L13.978,1730.401 Z M24,1725.08 L24,1739 L12,1739 L12,1737 L22,1737 L22,1727 L16,1727 L16,1721 L6,1721 L6,1731 L4,1731 L4,1719 L18,1719 L24,1725.08 Z"></path></g></g></g></svg>`;

const BUTTONS_LIST = [
  // All SVG are with a CC0 or PD license, most found on svgrepo
  {
    name: "newFile",
    defaultTitle: "Create a new file",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-220.000000, -1599.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M182,1457.0005 L166,1457.0005 L166,1441.0005 L176,1441.0005 L176,1447.0005 L182,1447.0005 L182,1457.0005 Z M178,1439.0005 L164,1439.0005 L164,1459.0005 L184,1459.0005 L184,1445.2095 L178,1439.0005 Z"></path></g></g></g></svg>`,
    height: "1.3rem",
    // svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-420.000000, -8079.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M382,7937 L366,7937 L366,7925.837 L370.837,7921 L382,7921 L382,7937 Z M383.969,7919 L370,7919 L370,7919.009 L364.009,7925 L364,7925 L364,7939 L384,7939 L384,7919 L383.969,7919 Z"></path></g></g></g></svg>`,
  },
  {
    name: "previous",
    defaultTitle: "Previous",
    height: "1.4em",
    svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-385.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M338.61,6539 L340,6537.594 L331.739,6528.987 L332.62,6528.069 L332.615,6528.074 L339.955,6520.427 L338.586,6519 C336.557,6521.113 330.893,6527.014 329,6528.987 C330.406,6530.453 329.035,6529.024 338.61,6539"></path></g></g></g></svg>`,
  },
  {
    name: "next",
    defaultTitle: "Next",
    height: "1.4em",
    svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-425.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M370.39,6519 L369,6520.406 L377.261,6529.013 L376.38,6529.931 L376.385,6529.926 L369.045,6537.573 L370.414,6539 C372.443,6536.887 378.107,6530.986 380,6529.013 C378.594,6527.547 379.965,6528.976 370.39,6519"></path </g></g></g></svg>`,
  },
  {
    name: "undo",
    defaultTitle: "Undo",
    height: "1.8rem",
    svg: `<svg fill="currentColor" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`,
  },
  {
    name: "redo",
    defaultTitle: "Redo",
    height: "1.8rem",
    svg: `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`,
  },
  {
    name: "clear",
    defaultTitle: "Clear",
    height: "1.5em",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-179.000000, -360.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z"></path></g></g></g></svg>`,
  },
  {
    name: "upload",
    defaultTitle: "Upload",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-300.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M254.006515,3325.00497 L250.302249,3328.71065 L251.715206,3330.12415 L253.007252,3328.83161 L253.007252,3339 L255.005777,3339 L255.005777,3328.83161 L256.297824,3330.12415 L257.710781,3328.71065 L254.006515,3325.00497 Z M262.281407,3331.70459 C260.525703,3333.21505 258.787985,3333.00213 257.004302,3333.00213 L257.004302,3331.00284 C258.859932,3331.00284 259.724294,3331.13879 260.728553,3330.45203 C263.14477,3328.79962 261.8847,3324.908 258.902901,3325.01496 C257.570884,3318.41131 247.183551,3320.64551 249.247028,3327.4451 C246.618968,3325.35484 243.535244,3331.00284 249.116125,3331.00284 L251.008728,3331.00284 L251.008728,3333.00213 L248.211792,3333.00213 C244.878253,3333.00213 242.823769,3329.44339 244.73236,3326.72236 C245.644687,3325.42282 247.075631,3325.10193 247.075631,3325.10193 C247.735144,3319.99075 253.568838,3317.29171 257.889649,3320.18468 C259.74428,3321.42724 260.44776,3323.24259 260.44776,3323.24259 C264.159021,3324.37019 265.278195,3329.1265 262.281407,3331.70459 L262.281407,3331.70459 Z"></path></g></g></g></svg>`,
  },
  {
    name: "open",
    defaultTitle: "Open",
    height: "1.2rem",
    svg: openSvg,
  },
  {
    name: "download",
    defaultTitle: "Download",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-340.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M297.995199,3334.46886 C297.995199,3334.07649 296.972565,3334.08051 296.583086,3334.47187 L295.852063,3335.20843 C295.537483,3335.52452 294.999203,3335.30275 294.999203,3334.8552 L294.999203,3326.03153 C294.999203,3325.48162 294.600735,3325.03708 294.055464,3325.03005 C293.508195,3325.03708 293.001872,3325.48162 293.001872,3326.03153 L293.001872,3334.8552 C293.001872,3335.30275 292.463591,3335.52653 292.149011,3335.21043 L291.417988,3334.26715 C291.028509,3333.87579 290.40634,3334.05943 290.016861,3334.05943 L290.010869,3334.05943 C289.621389,3335.06292 289.618393,3335.29473 290.008871,3335.68609 L292.589423,3338.38547 C293.36938,3339.16919 294.633691,3339.22137 295.413649,3338.43765 L297.995199,3335.86872 C298.385677,3335.47636 297.995199,3334.85419 297.995199,3334.46283 L297.995199,3334.46886 Z M294.044478,3325.02805 C294.048473,3325.02805 294.051469,3325.03005 294.055464,3325.03005 C294.059458,3325.03005 294.062454,3325.02805 294.066449,3325.02805 L294.044478,3325.02805 Z M297.995199,3333.05595 C297.443936,3333.05595 296.996533,3332.60638 296.996533,3332.05246 C296.996533,3331.49853 297.443936,3331.04897 297.995199,3331.04897 L298.888006,3331.04897 C303.142321,3331.04897 302.833733,3324.89559 298.893998,3325.03808 C297.547797,3318.33479 287.212608,3320.75419 289.243893,3327.47756 C287.168667,3325.8198 284.677995,3329.02795 286.79916,3330.61145 C288.298157,3331.73134 291.004541,3330.19902 291.004541,3332.05246 C291.004541,3333.31484 289.578446,3333.05595 288.209276,3333.05595 C284.877728,3333.05595 282.824472,3329.48353 284.731923,3326.75204 C285.643704,3325.4475 287.073793,3325.12539 287.073793,3325.12539 C287.732913,3319.99456 293.563122,3317.28514 297.881351,3320.18923 C299.734874,3321.43657 300.437935,3323.2589 300.437935,3323.2589 C301.527479,3323.59206 302.46223,3324.28246 303.098379,3325.19663 C305.240517,3328.27332 303.575742,3333.05595 297.995199,3333.05595 L297.995199,3333.05595 Z"></path></g></g></g></svg>`,
  },
  // clear2: `<svg fill="var(--window-text-color)" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6 2.5c0-.27614.22386-.5.5-.5h2c.27614 0 .5.22386.5.5v.5h1.5c.8284 0 1.5.67157 1.5 1.5v1c0 .27614-.2239.5-.5.5h-.5v6.5c0 .2761-.2239.5-.5.5h-6c-.27614 0-.5-.2239-.5-.5v-6.5h-.5c-.27614 0-.5-.22386-.5-.5v-1c0-.82843.67157-1.5 1.5-1.5h1.5zm-1 3.5v6h5v-6zm6-1v-.5c0-.27614-.2239-.5-.5-.5h-6c-.27614 0-.5.22386-.5.5v.5z" fill-rule="evenodd"/></svg>`,
  {
    name: "save",
    defaultTitle: "Save",
    height: "1.44em",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-99.000000, -680.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M50.21875,525 L52.31875,525 L52.31875,523 L50.21875,523 L50.21875,525 Z M61.9,538 L59.8,538 L59.8,532 L58.88125,532 L57.7,532 L49.3,532 L47.5276,532 L47.2,532 L47.2,538 L45.1,538 L45.1,526.837 L47.2,524.837 L47.2,528 L48.11875,528 L49.3,528 L57.7,528 L59.47135,528 L59.8,528 L59.8,522 L61.9,522 L61.9,538 Z M49.3,538 L57.7,538 L57.7,534 L49.3,534 L49.3,538 Z M49.3,522.837 L50.17885,522 L57.7,522 L57.7,526 L49.3,526 L49.3,522.837 Z M63.9664,520 L61.8664,520 L49.3,520 L49.3,520.008 L47.2084,522 L47.2,522 L47.2,522.008 L43.0084,526 L43,526 L43,538 L43,540 L45.1,540 L61.8664,540 L63.9664,540 L64,540 L64,538 L64,522 L64,520 L63.9664,520 Z"></path></g></g></g></svg>`,
  },
];
const BUTTONS_BY_NAME = BUTTONS_LIST.reduce((acc, val) => {
  acc[val.name] = val;
  return acc;
}, {});

export function constructAppHeaderLine(buttonConfigs) {
  const headerElt = document.createElement("div");
  headerElt.className = "w-tools";
  applyStyle(headerElt, {
    backgroundColor: "var(--window-sidebar-bg)",
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    display: "flex",
    padding: "5px",
    gap: "12px",
    flexShrink: "0",
    borderBottom: "1px solid var(--window-line-color)",
  });

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

    // TODO: CSS hover
    // buttonElt.onmouseover = () => {
    //   if (buttonElt.style.cursor === "pointer") {
    //     buttonElt.style.color = "var(--sidebar-selected-bg-color)";
    //   }
    // };
    // buttonElt.onmouseout = () => {
    //   if (buttonElt.style.cursor === "pointer") {
    //     buttonElt.style.color = "var(--window-text-color)";
    //   } else {
    //     buttonElt.style.color = "var(--sidebar-hover-bg)";
    //   }
    // };
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
    // flex: "1 0 0",
    height: height,
    // margin: "auto 0",
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
  applyStyle(titleElt, {
    fontSize: "0.9em",
    padding: "0 2px",
    // flex: "1 0 auto",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
    maxWidth: "6em",
    width: "min-content",
    overflow: "hidden",
  });
  titleElt.textContent = title;
  buttonWrapperElt.appendChild(titleElt);
  buttonWrapperElt.setAttribute("tabindex", "0");
  return buttonWrapperElt;
}

function getSvg(svg) {
  const svgWrapperElt = document.createElement("div");
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}
