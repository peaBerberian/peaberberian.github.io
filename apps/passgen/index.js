// NOTE: Adapted from my own project:
// https://github.com/peaBerberian/passgen

const copyButtonSvg = `<svg width="22px" height="22px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" ><path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="#000" stroke-linecap="round" stroke-linejoin="round" /></svg>`;

/** All characters that may be added as "symbols". */
const SYMBOLS = "`~!@#$%^&*()_+[]{}|;':\",./<>?";

const LOWER_CASE_LETTERS = "qwertyuiopasdfghjklzxcvbnm";
const UPPER_CASE_LETTERS = "QWERTYUIOPASDFGHJKLZXCVBNM";

const LOWER_FACTOR = 3;
const UPPER_FACTOR = 3;
const NUM_FACTOR = 2;
const SYMBOLS_FACTOR = 1;

/** All characters that may be added as "numbers". */
const NUMBERS = "1234567890";

export function create(_args, env) {
  const wrapperElt = document.createElement("div");
  applyStyle(wrapperElt, {
    backgroundColor: env.STYLE.bgColor,
    color: env.STYLE.textColor,
    overflow: "hidden",
    textAlign: "center",
    height: "100%",
    width: "100%",
    position: "relative",
  });

  const outputAndCopyBtnElt = document.createElement("div");
  applyStyle(outputAndCopyBtnElt, {
    fontFamily: "monospace",
    borderBottom: "1px solid " + env.STYLE.lineColor,
    padding: "5px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "5px",
    backgroundColor: env.STYLE.barSelectedBg,
    color: env.STYLE.barSelectedText,
  });
  wrapperElt.appendChild(outputAndCopyBtnElt);
  const outputElt = document.createElement("div");
  outputElt.style.fontWeight = "bold";
  outputAndCopyBtnElt.appendChild(outputElt);

  const copyBtnElt = getSvg(copyButtonSvg);
  copyBtnElt.style.cursor = "pointer";
  copyBtnElt.style.height = "1.5em";
  copyBtnElt.style.width = "1.5em";
  copyBtnElt.tabindex = "0";
  copyBtnElt.onclick = function () {
    navigator.clipboard.writeText(outputElt.textContent).then(
      () => {
        copyBtnElt.style.fill = "#00ff00";
      },
      () => {
        copyBtnElt.style.fill = "#ff0000";
      },
    );
  };
  copyBtnElt.onkeydown = function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyBtnElt.click();
    }
  };
  outputAndCopyBtnElt.appendChild(copyBtnElt);

  const controlsElt = document.createElement("div");
  applyStyle(controlsElt, {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  });
  wrapperElt.appendChild(controlsElt);

  const generateButtonElt = document.createElement("button");
  generateButtonElt.textContent = "Generate password";
  generateButtonElt.onclick = generate;
  generateButtonElt.className = "btn";
  controlsElt.appendChild(generateButtonElt);
  const generateHiddenButtonElt = document.createElement("button");
  generateHiddenButtonElt.textContent = "Generate hidden one";
  generateHiddenButtonElt.onclick = generateHidden;
  generateHiddenButtonElt.className = "btn";

  const buttonsContainerElt = document.createElement("div");
  applyStyle(buttonsContainerElt, {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    margin: "10px",
  });
  buttonsContainerElt.appendChild(generateButtonElt);
  buttonsContainerElt.appendChild(generateHiddenButtonElt);
  controlsElt.appendChild(buttonsContainerElt);

  const tweaksElt = document.createElement("div");
  controlsElt.appendChild(tweaksElt);
  const lowerCaseCheckButton = createInputButton(
    tweaksElt,
    "Lower case characters",
    "checkbox",
    generate,
  );
  lowerCaseCheckButton.checked = true;

  const upperCaseCheckButton = createInputButton(
    tweaksElt,
    "Upper case characters",
    "checkbox",
    generate,
  );
  upperCaseCheckButton.checked = true;

  const numberCheckButton = createInputButton(
    tweaksElt,
    "Numbers",
    "checkbox",
    generate,
  );
  numberCheckButton.checked = true;

  const symbolsCheckButton = createInputButton(
    tweaksElt,
    "Symbols",
    "checkbox",
    generate,
  );
  symbolsCheckButton.checked = true;

  const lengthInput = createInputButton(
    tweaksElt,
    "Length:",
    "number",
    generate,
  );
  lengthInput.style.width = "10ch";
  lengthInput.value = "14";

  lowerCaseCheckButton.onchange = generate;
  upperCaseCheckButton.onchange = generate;
  numberCheckButton.onchange = generate;
  symbolsCheckButton.onchange = generate;
  lengthInput.onchange = generate;

  generate();
  return { element: wrapperElt };

  function generateHidden() {
    return generate(true);
  }

  function generate(hidden) {
    copyBtnElt.style.display = "none";
    copyBtnElt.style.fill = "#ffffff";
    outputElt.textContent = "";
    outputElt.style.backgroundColor = "transparent";

    const shouldHaveLowerCase = lowerCaseCheckButton.checked;
    const shouldHaveUpperCase = upperCaseCheckButton.checked;
    const shouldHaveNums = numberCheckButton.checked;
    const shouldHaveSymbols = symbolsCheckButton.checked;
    let len = +lengthInput.value;
    const minLen =
      +shouldHaveLowerCase +
      shouldHaveUpperCase +
      shouldHaveNums +
      shouldHaveSymbols;
    try {
      if (minLen === 0) {
        throw new Error("No allowed character.");
      }
      if (isNaN(len) || len === 0) {
        throw new Error("Invalid length value.");
      }
      if (len < minLen) {
        throw new Error("Password length too short.");
      }
      if (len > 1000) {
        throw new Error("Password length too high");
      }

      const pw = generatePassword();
      if (hidden === true) {
        outputElt.style.color = env.STYLE.barSelectedBg;
      } else {
        outputElt.style.color = env.STYLE.barSelectedText;
      }
      outputElt.textContent = pw;
      if (navigator.clipboard != null) {
        copyBtnElt.style.display = "inline";
      }
    } catch (err) {
      outputElt.textContent = "Error: " + err.message;
    }

    /**
     * Generate a password of the length given in argument.
     * @returns {string}
     */
    function generatePassword() {
      const lowerLastNb = shouldHaveLowerCase
        ? LOWER_CASE_LETTERS.length * LOWER_FACTOR
        : 0;
      const upperLastNb = shouldHaveUpperCase
        ? lowerLastNb + UPPER_CASE_LETTERS.length * UPPER_FACTOR
        : lowerLastNb;
      const numsLastNb = shouldHaveNums
        ? upperLastNb + NUMBERS.length * NUM_FACTOR
        : upperLastNb;
      const globalLen = shouldHaveSymbols
        ? numsLastNb + SYMBOLS.length * SYMBOLS_FACTOR
        : numsLastNb;
      let pw;
      let iteration = 0;
      while (true) {
        pw = "";
        const rands = new Uint32Array(len);
        crypto.getRandomValues(rands);
        for (let i = 0; i < len; i++) {
          // float between 0 and 1
          const randSub1 = rands[i] / (0xffffffff + 1);
          // Letters have three times more chances to appear
          const randomIdx = Math.floor(randSub1 * globalLen);
          if (randomIdx < lowerLastNb) {
            pw += LOWER_CASE_LETTERS[Math.floor(randomIdx / LOWER_FACTOR)];
          } else if (randomIdx < upperLastNb) {
            pw +=
              UPPER_CASE_LETTERS[
                Math.floor((randomIdx - lowerLastNb) / UPPER_FACTOR)
              ];
          } else if (randomIdx < numsLastNb) {
            pw += NUMBERS[Math.floor((randomIdx - upperLastNb) / NUM_FACTOR)];
          } else {
            pw +=
              SYMBOLS[Math.floor((randomIdx - numsLastNb) / SYMBOLS_FACTOR)];
          }
        }
        if (checkPassword(pw)) {
          return pw;
        }
        if (++iteration > 100) {
          throw new Error("Too many iterations.");
        }
      }
    }

    /**
     * Check that there's at least:
     *   - one lower case letter if `shouldHaveLowerCase` is `true`
     *   - one upper case letter if `shouldHaveUpperCase` is `true`
     *   - one number if `shouldHaveNums` is `true`
     *   - one symbol if `shouldHaveSymbols` is `true`
     *
     * And return `true` if that's the case.
     * Returns `false` otherwise.
     * @param {string} pw
     * @returns {boolean}
     */
    function checkPassword(pw) {
      let hasLowerCase = false;
      let hasUpperCase = false;
      let hasNumber = false;
      let hasSymbol = false;
      for (let i = 0; i < pw.length; i++) {
        const charCode = pw.charCodeAt(i);
        if (charCode >= 48 /* 0 */) {
          if (charCode <= 57 /* 9 */) {
            hasNumber = true;
          } else if (charCode >= 65 /* A */) {
            if (charCode <= 90 /* Z */) {
              hasUpperCase = true;
            } else if (charCode >= 97 /* a */ && charCode <= 122 /* z */) {
              hasLowerCase = true;
            } else {
              hasSymbol = true;
            }
          } else {
            hasSymbol = true;
          }
        } else {
          hasSymbol = true;
        }
      }
      if (!hasNumber && shouldHaveNums) {
        return false;
      }
      if (!hasSymbol && shouldHaveSymbols) {
        return false;
      }
      if (!hasLowerCase && shouldHaveLowerCase) {
        return false;
      }
      if (!hasUpperCase && shouldHaveUpperCase) {
        return false;
      }
      return true;
    }
  }
}

function getSvg(svg) {
  const svgWrapperElt = document.createElement("div");
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}

function createInputButton(parentElt, text, inputType, onClick) {
  const containerElt = document.createElement("div");
  const buttonElt = document.createElement("input");
  buttonElt.type = inputType;
  if (inputType === "checkbox") {
    buttonElt.checked = true;
  }
  const lowerCaseLabelElt = document.createElement("label");
  lowerCaseLabelElt.style.display = "flex";
  lowerCaseLabelElt.style.alignItems = "center";
  const textNodeLabel = document.createTextNode(text);
  if (inputType === "checkbox") {
    lowerCaseLabelElt.appendChild(buttonElt);
    lowerCaseLabelElt.appendChild(textNodeLabel);
    buttonElt.style.marginRight = "10px";
  } else {
    lowerCaseLabelElt.appendChild(textNodeLabel);
    lowerCaseLabelElt.appendChild(buttonElt);
    buttonElt.style.marginLeft = "10px";
  }
  containerElt.appendChild(lowerCaseLabelElt);
  buttonElt.onchange = onClick;
  containerElt.style.margin = "10px";
  parentElt.appendChild(containerElt);
  return buttonElt;
}

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
