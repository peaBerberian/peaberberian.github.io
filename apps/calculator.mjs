/**
 * OK, here's the whole idea: doing a calculator in JS is supposed to be the
 * easy stuff you learn at kindergarden.
 *
 * But what those kindergarten teachers hide (is it hided? how does that verb
 * works?) from you is about how floats are represented in most languages
 * including JavaScript and the first smartass testing it will not restrained
 * himself/herself to do the infamous `0.1 + 0.2` calculation and declare your
 * application unusable.
 *
 * So the whole idea is to convert each inputed numbers into `Fraction` objects,
 * with separates numerator and denominator vaues which are both integers (which
 * are not victim of rounding issues).
 *
 * We do all operations on those fractions (which are actually fairly simple for
 * the big four at least) and only when we want to return the result do we
 * re-transform it back to a float "number" value.
 *
 * And I also used bigint because big numbers are the best numbers.
 * @param {BigInt} numerator
 * @param {BigInt} [denominator=1n]
 * @returns {Object}
 */
function Fraction(numerator, denominator = 1n) {
  if (denominator === 0n) {
    throw new Error("Error: Division by zero!");
  }

  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }

  const gcd = (a, b) => (b === 0n ? a : gcd(b, a % b));
  const g = gcd(numerator < 0n ? -numerator : numerator, denominator);

  return {
    numerator: numerator / g,
    denominator: denominator / g,

    toString() {
      if (this.denominator === 1n) {
        return this.numerator.toString();
      }
      return `${this.numerator}/${this.denominator}`;
    },

    toDecimal() {
      if (this.denominator === 1n) {
        return this.numerator.toString();
      }

      const sign = this.numerator < 0n ? "-" : "";
      const absNum = this.numerator < 0n ? -this.numerator : this.numerator;
      const integer = absNum / this.denominator;
      const remainder = absNum % this.denominator;

      if (remainder === 0n) {
        return sign + integer.toString();
      }

      let decimal = "";
      let rem = remainder;
      const seen = new Map();
      let pos = 0;

      while (rem !== 0n && pos < 10 && !seen.has(rem.toString())) {
        seen.set(rem.toString(), pos);
        rem *= 10n;
        decimal += (rem / this.denominator).toString();
        rem = rem % this.denominator;
        pos++;
      }
      return sign + integer.toString() + (decimal ? "." + decimal : "");
    },
  };
}

function add(a, b) {
  return Fraction(
    a.numerator * b.denominator + b.numerator * a.denominator,
    a.denominator * b.denominator,
  );
}

function subtract(a, b) {
  return Fraction(
    a.numerator * b.denominator - b.numerator * a.denominator,
    a.denominator * b.denominator,
  );
}

function multiply(a, b) {
  return Fraction(a.numerator * b.numerator, a.denominator * b.denominator);
}

function divide(a, b) {
  if (b.numerator === 0n) {
    // We got some really funny guy visiting the site today:
    throw new Error("Error: A division by zero, what a mad lad! \u200b🙀🙀");
  }
  return Fraction(a.numerator * b.denominator, a.denominator * b.numerator);
}

/**
 * Transfrom an inputed string, into our `Fraction` concept.
 * @param {string} str
 * @returns {Object}
 */
function strToFraction(str) {
  const normalizedNum = str.replace(/,/g, "");

  if (normalizedNum.includes(".")) {
    const parts = normalizedNum.split(".");
    const intPart = parts[0] || "0";
    const decPart = parts[1] || "0";
    const decPlaces = BigInt(decPart.length);
    const denominator = 10n ** decPlaces;
    const numerator = BigInt(intPart) * denominator + BigInt(decPart);
    return Fraction(numerator, denominator);
  }
  return Fraction(BigInt(normalizedNum));
}

export function create(_args, env) {
  let currentValue = "";
  let previousValue = null;
  let operation = null;
  let waitingForOperand = false;
  let fullExpression = "";

  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    backgroundColor: env.STYLE.barBg,
    border: "1px solid " + env.STYLE.lineColor,
    padding: "10px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    overflow: "auto",
  });

  const displayElt = document.createElement("div");
  applyStyle(displayElt, {
    backgroundColor: env.STYLE.bgColor,
    border: "2px solid " + env.STYLE.lineColor,
    color: env.STYLE.textColor,
    padding: "10px",
    textAlign: "right",
    fontSize: "1.5em",
    fontFamily: "monospace",
    minHeight: "30px",
    marginBottom: "10px",
    overflow: "hidden",
    wordBreak: "break-all",
    flex: "0 0 auto",
  });
  displayElt.textContent = "0";
  containerElt.appendChild(displayElt);

  const buttonGrid = document.createElement("div");
  applyStyle(buttonGrid, {
    flex: "1",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(5, 1fr)",
    gap: "5px",
  });
  containerElt.appendChild(buttonGrid);

  function updateDisplay() {
    if (fullExpression && waitingForOperand) {
      displayElt.textContent = fullExpression;
    } else if (
      fullExpression &&
      !waitingForOperand &&
      /*
       * Zero-Width-Space is a reserved char for easter eggs.
       * So basically, `fullExpression` is not to be composed with here.
       */
      fullExpression.indexOf("\u200b") === -1
    ) {
      displayElt.textContent = fullExpression + currentValue;
    } else {
      displayElt.textContent = currentValue || "0";
    }
  }

  function inputNumber(num) {
    if (waitingForOperand) {
      currentValue = num;
      waitingForOperand = false;
    } else {
      currentValue = currentValue === "0" ? num : currentValue + num;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (waitingForOperand) {
      currentValue = "0.";
      waitingForOperand = false;
    } else if (currentValue.indexOf(".") === -1) {
      currentValue += ".";
    }
    updateDisplay();
  }

  function clear() {
    currentValue = "0";
    previousValue = null;
    operation = null;
    waitingForOperand = false;
    fullExpression = "";
    updateDisplay();
  }

  function performOperation(nextOperation) {
    const inputValue = strToFraction(currentValue);

    if (previousValue === null) {
      previousValue = inputValue;
      if (nextOperation) {
        const operatorSymbol =
          nextOperation === "*"
            ? "×"
            : nextOperation === "/"
              ? "÷"
              : nextOperation;
        fullExpression = `${currentValue} ${operatorSymbol} `;
        waitingForOperand = true;
      }
    } else if (operation && !waitingForOperand) {
      // Complete the pending operation first
      try {
        let result;
        switch (operation) {
          case "+":
            result = add(previousValue, inputValue);
            break;
          case "-":
            result = subtract(previousValue, inputValue);
            break;
          case "*":
            result = multiply(previousValue, inputValue);
            break;
          case "/":
            result = divide(previousValue, inputValue);
            break;
          default:
            return;
        }

        const resultStr = result.toDecimal();
        currentValue = resultStr;
        previousValue = result;

        if (nextOperation) {
          const operatorSymbol =
            nextOperation === "*"
              ? "×"
              : nextOperation === "/"
                ? "÷"
                : nextOperation;
          fullExpression = `${resultStr} ${operatorSymbol} `;
          waitingForOperand = true;
        } else {
          fullExpression = "";
        }
      } catch (error) {
        currentValue = error.message;
        previousValue = null;
        operation = null;
        waitingForOperand = true;
        fullExpression = "";
        updateDisplay();
        return;
      }
    } else if (nextOperation) {
      // Just update the operator if we're waiting for operand
      const operatorSymbol =
        nextOperation === "*"
          ? "×"
          : nextOperation === "/"
            ? "÷"
            : nextOperation;
      fullExpression = `${previousValue.toDecimal()} ${operatorSymbol} `;
      waitingForOperand = true;
    }

    operation = nextOperation;
    updateDisplay();
  }

  function calculate() {
    if (operation && previousValue !== null) {
      const inputValue = strToFraction(currentValue);
      try {
        let result;
        switch (operation) {
          case "+":
            result = add(previousValue, inputValue);
            break;
          case "-":
            result = subtract(previousValue, inputValue);
            break;
          case "*":
            result = multiply(previousValue, inputValue);
            break;
          case "/":
            result = divide(previousValue, inputValue);
            break;
          default:
            return;
        }

        // Some (fun) isolation check
        if (window.HANG_FOREVER && isThatInfamousOperation(inputValue)) {
          while (true) {}
        }
        fullExpression = isThatInfamousOperation(inputValue)
          ? /*
             * Note: Zero Width Space (\u200b) is the "joke" character.
             * I added that as a quick hack to make easter eggs not break things:
             * If there's a ZWS in it, there's a joke in it (like my grandfather
             * always said).
             */
            result.toDecimal() + " \u200b(Look Ma, no rounding errors!)"
          : "";
        currentValue = result.toDecimal();
        previousValue = null;
        operation = null;
        waitingForOperand = true;
        updateDisplay();
      } catch (error) {
        currentValue = error.message;
        previousValue = null;
        operation = null;
        waitingForOperand = true;
        fullExpression = "";
        updateDisplay();
      }
    }
  }

  // That's also the first thing I try in a calculator hehe
  function isThatInfamousOperation(inputValue) {
    if (operation !== "+") {
      return false;
    }
    if (
      previousValue.numerator === 1n &&
      previousValue.denominator === 10n &&
      inputValue.numerator === 1n &&
      inputValue.denominator === 5n
    ) {
      return true;
    }
    if (
      inputValue.numerator === 1n &&
      inputValue.denominator === 10n &&
      previousValue.numerator === 1n &&
      previousValue.denominator === 5n
    ) {
      return true;
    }
    return false;
  }

  // Button definitions
  const buttons = [
    {
      text: "C",
      action: clear,
      style: {
        backgroundColor: env.STYLE.textColor,
        color: env.STYLE.bgColor,
      },
    },
    {
      text: "±",
      action: () => {
        if (currentValue !== "0" && !isValueError(currentValue)) {
          currentValue = currentValue.startsWith("-")
            ? currentValue.slice(1)
            : "-" + currentValue;
          updateDisplay();
        }
      },
    },
    {
      text: "%",
      action: () => {
        if (
          currentValue &&
          currentValue !== "0" &&
          !isValueError(currentValue)
        ) {
          const value = strToFraction(currentValue);
          const result = divide(value, Fraction(100n));
          currentValue = result.toDecimal();
          updateDisplay();
        }
      },
    },
    {
      text: "÷",
      action: () => performOperation("/"),
      style: {
        backgroundColor: env.STYLE.primaryColor,
        color: env.STYLE.bgColor,
      },
    },

    { text: "7", action: () => inputNumber("7") },
    { text: "8", action: () => inputNumber("8") },
    { text: "9", action: () => inputNumber("9") },
    {
      text: "×",
      action: () => performOperation("*"),
      style: {
        backgroundColor: env.STYLE.primaryColor,
        color: env.STYLE.bgColor,
      },
    },

    { text: "4", action: () => inputNumber("4") },
    { text: "5", action: () => inputNumber("5") },
    { text: "6", action: () => inputNumber("6") },
    {
      text: "-",
      action: () => performOperation("-"),
      style: {
        backgroundColor: env.STYLE.primaryColor,
        color: env.STYLE.bgColor,
      },
    },

    { text: "1", action: () => inputNumber("1") },
    { text: "2", action: () => inputNumber("2") },
    { text: "3", action: () => inputNumber("3") },
    {
      text: "+",
      action: () => performOperation("+"),
      style: {
        backgroundColor: env.STYLE.primaryColor,
        color: env.STYLE.bgColor,
      },
    },

    {
      text: "0",
      action: () => inputNumber("0"),
      style: { gridColumn: "span 2" },
    },
    { text: ".", action: inputDecimal },
    {
      text: "=",
      action: calculate,
      style: {
        fontWeight: "bold",
        color: env.STYLE.primaryColor,
        backgroundColor: env.STYLE.bgColor,
      },
    },
  ];

  // Create buttons
  buttons.forEach((button) => {
    const buttonElement = document.createElement("button");
    buttonElement.textContent = button.text;

    const baseStyle = {
      backgroundColor: env.STYLE.bgColor,
      color: env.STYLE.textColor,
      border: "1px solid " + env.STYLE.lineColor,
      borderRadius: "4px",
      fontSize: "1.5em",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...button.style,
    };

    applyStyle(buttonElement, baseStyle);

    buttonElement.addEventListener("mouseenter", () => {
      const currentBg = button.style?.backgroundColor || env.STYLE.bgColor;
      const hoverBg =
        currentBg === env.STYLE.bgColor ? env.STYLE.barHoverBg : currentBg;
      buttonElement.style.backgroundColor = hoverBg;
      buttonElement.style.filter = "brightness(0.9)";
    });

    buttonElement.addEventListener("mouseleave", () => {
      buttonElement.style.backgroundColor =
        button.style?.backgroundColor || env.STYLE.bgColor;
      buttonElement.style.filter = "none";
    });

    buttonElement.addEventListener("click", button.action);
    buttonGrid.appendChild(buttonElement);
  });

  function handleKeyDown(event) {
    const key = event.key;

    if (/[0-9]/.test(key)) {
      event.preventDefault();
      inputNumber(key);
    } else if (key === ".") {
      event.preventDefault();
      inputDecimal();
    } else if (key === "+") {
      event.preventDefault();
      performOperation("+");
    } else if (key === "-") {
      event.preventDefault();
      performOperation("-");
    } else if (key === "*") {
      event.preventDefault();
      performOperation("*");
    } else if (key === "/") {
      event.preventDefault();
      performOperation("/");
    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      calculate();
    } else if (key === "Escape" || key.toLowerCase() === "c") {
      event.preventDefault();
      clear();
    } else if (key === "Backspace") {
      event.preventDefault();
      if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
      } else {
        currentValue = "0";
      }
      updateDisplay();
    }
  }

  return {
    element: containerElt,

    onActivate() {
      document.addEventListener("keydown", handleKeyDown);
    },

    onDeactivate() {
      document.removeEventListener("keydown", handleKeyDown);
    },
  };
}
function isValueError(value) {
  return value.indexOf("Error") >= 0;
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
