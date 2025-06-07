// Directly copy-pasted from my own `str-html` project:
//https://github.com/peaBerberian/str-html

/**
 * I wasn't sure initially if I should handle void elements or just enforce
 * XHTML-like syntax for KISS-sake.
 * But people might expect things like just:
 * ```js
 * strHtml`<div>Before break<br>After break</div>`
 * // NOTE: if not handled, `br` would have to be self-closing, e.g. `<br/>`
 * ```
 * to work as expected (with a line break), so let's just be tolerant here.
 *
 * Even though, as we say in my country, this is the door open to all the
 * windows (opening a pandora's box).
 */
const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
];

/**
 * Construct an HTMLElement from a template litteral representing its HTML
 * format, where template literal expressions can be inserted in attribute
 * values and an element's content.
 * @param {Array.<string>} templateStrArr - List of strings generated for the
 * tagged template litteral.
 * @param {Array} ...expressions  - Array of expressions generated for the
 * tagged template litteral.
 * @returns {HTMLElement} - The constructed `HTMLElement` from the parsed
 * string.
 */
export default function strHtml(templateStrArr) {
  const remainingStrings = Array.prototype.slice.call(templateStrArr);
  const remainingExprs = Array.prototype.slice.call(arguments, 1);

  // Remove leading whitespaces and check first character
  let offset = skipWhiteSpace(remainingStrings[0], 0);
  if (remainingStrings[0][offset] !== "<") {
    checkExprWrongPlace(remainingStrings, "set at the start");
    throw new SyntaxError("str-html: No leading '<' character.");
  }

  const nextElemInfo = parseNextElem(remainingStrings, offset, remainingExprs);
  if (remainingStrings.length > 0) {
    offset = skipWhiteSpace(remainingStrings[0], nextElemInfo.offset);
    if (remainingStrings[0].length > offset) {
      throw new SyntaxError(
        "str-html: Unexpected data after the parent element.",
      );
    }
  }
  return nextElemInfo.element;
}

/**
 * Parse an HTML element starting by the "<" found as the first character of its
 * opening tag.
 *
 * May remove elements from both `remainingStrings` and `remainingExprs` arrays,
 * as it parses the value.
 * @param {Array.<string>} remainingStrings - Array of strings generated for the
 * tagged template litteral which have not yet been completely parsed.
 * `baseOffset` refers to the first element of that array
 * (`remainingStrings[0]`).
 * @param {number} baseOffset - Index in `remainingStrings[0]` where the initial
 * `<` character of its opening tag is found.
 * @param {Array} remainingExprs - Array of expressions generated for the
 * tagged template litteral which have not yet been considered.
 * @returns {Object} - Object with the following properties:
 *   - `offset` {number}: offset in `remainingStrings[0]` with the character
 *      coming immediately after that element (after the closing `>`). May be
 *      equal to `remainingStrings[0].length` - or remainingStrings may be
 *      empty - if everything has been parsed.
 *   - `element` {HTMLElement}: The parsed HTMLElement
 */
function parseNextElem(remainingStrings, baseOffset, remainingExprs) {
  // We'll start parsing the tag name
  let offset = baseOffset + 1;
  const endIdxTagName = skipToElementNameDeclarationEnd(
    remainingStrings[0],
    offset,
  );
  if (endIdxTagName === remainingStrings[0].length) {
    checkExprWrongPlace(remainingStrings, "in the tag's name");
    throw new SyntaxError("str-html: Tag ended unexpectedly early.");
  }
  if (endIdxTagName === offset) {
    checkExprWrongPlace(remainingStrings, "in the tag's name");
    throw new SyntaxError("str-html: A tag has an empty name.");
  }

  const tagName = remainingStrings[0].substring(offset, endIdxTagName);
  let element;
  try {
    element = document.createElement(tagName);
  } catch (err) {
    if (err instanceof DOMException && err.name === "InvalidCharacterError") {
      throw new SyntaxError(`str-html: Invalid tag name: "${tagName}"`);
    }
    throw err;
  }
  offset = endIdxTagName;

  // Parse attributes from there, if found
  const postAttrInfo = parseAllAttributes(
    element,
    remainingStrings,
    offset,
    remainingExprs,
  );
  offset = skipWhiteSpace(remainingStrings[0], postAttrInfo.offset);

  const selfClosingTagOffset = checkSelfClosingTagAtOffset(
    remainingStrings,
    offset,
  );
  if (selfClosingTagOffset >= 0) {
    // We encountered a self-closing tag, e.g. `<div/>`
    // We're done here, returns the index after the tag as the new offset.
    return { element, offset: selfClosingTagOffset };
  }

  // After attributes and whitespace, we should encounter the `>` of the start tag.
  if (remainingStrings.length === 0 || remainingStrings[0][offset] !== ">") {
    checkExprWrongPlace(remainingStrings, "in the tag's attribute names");
    throw new SyntaxError("str-html: Unexpected end of opening tag.");
  }
  offset++;

  if (VOID_ELEMENTS.includes(tagName)) {
    // This may be weird for some, yet try doing the same with the HTML API.
    // React's JSX seems to enforce tag closing though? I don't even know.
    return { element, offset };
  }

  // Browse content until closing tag
  // There's some complexity added because void elements are a thing.
  let initOffset = offset;
  while (true) {
    if (remainingStrings[0][offset] === undefined) {
      const remText = document.createTextNode(
        remainingStrings[0].substring(initOffset, offset),
      );
      element.appendChild(remText);
      while (offset >= remainingStrings[0].length) {
        initOffset = 0;
        offset = 0;
        remainingStrings.shift();

        if (remainingExprs.length > 0) {
          const nextExpr = remainingExprs.shift();
          useExprForElementContent(element, nextExpr);
        }
        if (remainingStrings.length === 0) {
          // My guy/girl forgot to close the parent element, what an idiot!
          // We all make mistake and I like that one. Surprise him/her by
          // actually doing the sensible thing for once by auto-closing
          // silently.
          return { element, offset: 0 };
        }
      }
    } else if (remainingStrings[0][offset] === "<") {
      // New element or closing tag?

      // First add all text that has been parsed until now
      const remText = document.createTextNode(
        remainingStrings[0].substring(initOffset, offset),
      );
      element.appendChild(remText);

      if (remainingStrings[0][offset + 1] !== "/") {
        // New element!
        const nextElemInfo = parseNextElem(
          remainingStrings,
          offset,
          remainingExprs,
        );
        offset = nextElemInfo.offset;
        element.appendChild(nextElemInfo.element);
        initOffset = offset;
        if (remainingStrings.length === 0) {
          // User forgot to close that last element.
          // Should we throw or be nice? I want to throw because that's probably a mistake
          throw new SyntaxError("str-html: Unexpected end of string.");
        }
        offset = skipWhiteSpace(remainingStrings[0], nextElemInfo.offset);
      } else {
        // Closing tag!

        // Check whether this closing tag has the same name
        let isEndOfCurrentElement = true;
        const closingTagNameEndIdx = skipToElementNameDeclarationEnd(
          remainingStrings[0],
          offset + 2,
        );
        const closingTagName = remainingStrings[0].substring(
          offset + 2,
          closingTagNameEndIdx,
        );
        if (closingTagName !== tagName) {
          // void elements have special treatments, as people may close them by
          // mistake... Just ignore them when they're closed.
          if (VOID_ELEMENTS.includes(closingTagName)) {
            // Ignore those like the browser probably would (WWBD?)
            isEndOfCurrentElement = false;
          } else {
            throw new SyntaxError(
              "str-html: Closing tag does not " +
                "correspond to last opened tag.",
            );
          }
        }
        offset = skipWhiteSpace(remainingStrings[0], closingTagNameEndIdx);
        if (remainingStrings[0][offset] !== ">") {
          checkExprWrongPlace(remainingStrings, "in an element's closing tag");
          throw new SyntaxError("str-html: Malformed closing tag.");
        }
        offset++;
        if (isEndOfCurrentElement) {
          return { element, offset };
        }
        initOffset = offset;
      }
    } else {
      offset++;
    }
  }
}

/**
 * Parse template literal expression found in an HTMLElement's inner content
 * and do the right action depending on its type (see API).
 * @param {Element} element
 * @param {*} expr
 */
function useExprForElementContent(element, expr) {
  if (expr !== undefined && expr !== null) {
    if (expr instanceof HTMLElement) {
      element.appendChild(expr);
    } else if (Array.isArray(expr)) {
      for (const item of expr) {
        useExprForElementContent(element, item);
      }
    } else {
      const textNode = document.createTextNode(expr.toString());
      element.appendChild(textNode);
    }
  }
}

/**
 * Parse an HTML element's attributes starting at the offset just after the
 * tag's name.
 *
 * Found attributes and their values will automatically be added to the given
 * `elem`.
 *
 * May remove elements from both `remainingStrings` and `remainingExprs` arrays,
 * as it parses the value.
 * @param {Element} elem - `HTMLElement` where found attributes will be
 * added.
 * @param {Array.<string>} remainingStrings - Array of strings generated for the
 * tagged template litteral which have not yet been completely parsed.
 * `baseOffset` refers to the first element of that array
 * (`remainingStrings[0]`).
 * @param {number} baseOffset - Index in `remainingStrings[0]` pointing to the
 * character coming immediately after the tag's name.
 * @param {Array} remainingExprs - Array of expressions generated for the
 * tagged template litteral which have not yet been considered.
 * @returns {Object} - Object with the following properties:
 *   - `offset` {number}: offset in `remainingStrings[0]` with the character
 *     coming immediately after that element's last attribute (after the
 *     optional closing `"`).
 */
function parseAllAttributes(
  elem,
  remainingStrings,
  baseOffset,
  remainingExprs,
) {
  let offset = baseOffset;
  while (true) {
    offset = skipWhiteSpace(remainingStrings[0], offset);
    if (remainingStrings[0][offset] === undefined) {
      checkExprWrongPlace(remainingStrings, "set as an attribute name");
      throw new SyntaxError(
        "str-html: Reached end while parsing tag attributes.",
      );
    }
    if (remainingStrings[0][offset] === ">") {
      return { offset };
    }
    const tagClosingIdx = checkSelfClosingTagAtOffset(remainingStrings, offset);
    if (tagClosingIdx !== -1) {
      return { offset };
    }

    const nextAttrInfo = readNextAttribute(
      remainingStrings,
      remainingExprs,
      offset,
    );
    offset = nextAttrInfo.offset;
    const [attrName, attrValue] = nextAttrInfo.attribute;
    try {
      elem.setAttribute(attrName, attrValue);
    } catch (err) {
      if (err instanceof DOMException && err.name === "InvalidCharacterError") {
        throw new SyntaxError(
          `str-html: Invalid attribute name: "${attrName}"`,
        );
      }
      throw err;
    }
  }
}

/**
 * Parse an unquoted attribute value starting at `baseOffset` in
 * `remainingStrings[0]`.
 *
 * May remove elements from both `remainingStrings` and `remainingExprs` arrays,
 * as it parses the value.
 * @param {Array.<string>} remainingStrings - Array of strings generated for the
 * tagged template litteral which have not yet been completely parsed.
 * `baseOffset` refers to the first element of that array (`remainingStrings[0]`).
 * @param {Array} remainingExprs - Array of expressions generated for the
 * tagged template litteral which have not yet been considered.
 * @param {number} baseOffset - Index in `remainingStrings[0]` pointing to the
 * first character defining the attribute's value.
 * @returns {Object} - Object with the following properties:
 *   - `offset` {number}: offset in `remainingStrings[0]` with the character
 *     coming immediately after the attribute's value
 *   - `value` {string}: the attribute value
 */
function getUnquotedAttributeValue(
  remainingStrings,
  remainingExprs,
  baseOffset,
) {
  let initOffset = baseOffset;
  let offset = baseOffset;
  let value = "";
  let currStr = remainingStrings[0];
  while (true) {
    if (
      currStr[offset] !== ">" &&
      currStr[offset] !== "/" &&
      currStr[offset] !== " " &&
      !isAsciiWhiteSpace(currStr[offset])
    ) {
      if (currStr[offset] !== undefined) {
        offset++;
      } else {
        // we've reached the end of `currStr`, the first `remainingStrings` element

        // First add all read until now as attribute value
        value += currStr.substring(initOffset);

        // Add to it the next `remainingExprs` if it exists
        if (remainingExprs.length > 0) {
          value += exprToStringForAttributeValue(remainingExprs.shift());
        }

        // And go to the next `remainingStrings` if it exists
        remainingStrings.shift();
        if (remainingStrings.length === 0) {
          return { offset, value };
        }
        currStr = remainingStrings[0];
        offset = 0;
        initOffset = 0;
      }
    } else {
      value += currStr.substring(initOffset, offset);
      return { offset, value };
    }
  }
}

/**
 * Returns `true` if the character given can be considered as an ASCII
 * whitespace according to the HTML spec.
 * @param {string} char
 * @returns {boolean}
 */
function isAsciiWhiteSpace(char) {
  return (
    char === " " ||
    char === "\t" ||
    char === "\f" ||
    char === "\r" ||
    char === "\n"
  );
}

/**
 * Transform a given expression into a string, as done for the attributes'
 * values.
 * @param {*} expr
 * @returns {string}
 */
function exprToStringForAttributeValue(expr) {
  if (expr === null) {
    return "";
  } else if (expr === undefined) {
    return "";
  } else if (expr instanceof HTMLElement) {
    throw new SyntaxError(
      "str-html: Found HTMLElement set as attribute's value.",
    );
  } else if (Array.isArray(expr)) {
    let str = "";
    for (const item of expr) {
      str += exprToStringForAttributeValue(item);
    }
    return str;
  } else {
    return expr.toString();
  }
}

/**
 * Parse an quoted attribute value starting at `baseOffset` in
 * `remainingStrings[0]`.
 *
 * May remove elements from both `remainingStrings` and `remainingExprs` arrays,
 * as it parses the value.
 * @param {Array.<string>} remainingStrings - Array of strings generated for the
 * tagged template litteral which have not yet been completely parsed.
 * `baseOffset` refers to the first element of that array (`remainingStrings[0]`).
 * @param {Array} remainingExprs - Array of expressions generated for the
 * tagged template litteral which have not yet been considered.
 * @param {number} baseOffset - Index in `remainingStrings[0]` pointing to the
 * first character after the opening `"`.
 * @returns {Object} - Object with the following properties:
 *   - `offset` {number}: offset in `remainingStrings[0]` with the character
 *     coming immediately after the attribute's value end quote
 *   - `value` {string}: the attribute value
 */
function getQuotedAttributeValue(remainingStrings, remainingExprs, baseOffset) {
  let initOffset = baseOffset;
  let offset = baseOffset;
  let value = "";
  let currStr = remainingStrings[0];
  while (true) {
    if (currStr[offset] !== '"') {
      if (currStr[offset] !== undefined) {
        offset++;
      } else {
        // we've reached the end of `currStr`, the first `remainingStrings` element

        // First add all read until now as attribute value
        value += currStr.substring(initOffset);

        // Add to it the next `remainingExprs` if it exists
        if (remainingExprs.length > 0) {
          value += exprToStringForAttributeValue(remainingExprs.shift());
        }

        // And go to the next `remainingStrings` if it exists
        remainingStrings.shift();
        if (remainingStrings.length === 0) {
          return { offset, value };
        }
        currStr = remainingStrings[0];
        offset = 0;
        initOffset = 0;
      }
    } else {
      value += currStr.substring(initOffset, offset);
      offset++;
      return { offset, value };
    }
  }
}

/**
 * @param {Array.<string>} remainingStrings - Array of strings generated for the
 * tagged template litteral which have not yet been completely parsed.
 * `baseOffset` refers to the first element of that array
 * (`remainingStrings[0]`).
 * @param {Array} remainingExprs - Array of expressions generated for the
 * tagged template litteral which have not yet been considered.
 * @param {number} baseOffset - Index in `remainingStrings[0]` pointing to the
 * first character of the next unparsed attribute name.
 * @returns {Object}
 */
function readNextAttribute(remainingStrings, remainingExprs, baseOffset) {
  const attrNameBaseOffset = baseOffset;
  let offset = skipToAttributeNameDeclarationEnd(
    remainingStrings[0],
    baseOffset,
  );
  const attrName = remainingStrings[0].substring(attrNameBaseOffset, offset);
  offset = skipWhiteSpace(remainingStrings[0], offset);
  if (remainingStrings[0][offset] !== "=") {
    // value-less atribute
    return { offset, attribute: [attrName, ""] };
  }
  offset++;
  offset = skipWhiteSpace(remainingStrings[0], offset);
  const attrValueInfo =
    remainingStrings[0][offset] !== '"'
      ? getUnquotedAttributeValue(remainingStrings, remainingExprs, offset)
      : getQuotedAttributeValue(remainingStrings, remainingExprs, offset + 1);
  if (remainingStrings.length === 0) {
    throw new SyntaxError(
      "str-html: Unexpected end of HTML inside of value for attribute " +
        `"${attrName}".`,
    );
  }
  return {
    offset: attrValueInfo.offset,
    attribute: [attrName, attrValueInfo.value],
  };
}

/**
 * Starts at the initial offset found to declare an attribute's name in `str`,
 * and find the offset coming just after the end of that attribute's name
 * declaration.
 * @param {string} str - String containing the attribute's name.
 * @param {number} baseOffset - Initial offset found to declare an
 * attribute's name in `str`.
 * @returns {number}
 */
function skipToAttributeNameDeclarationEnd(str, baseOffset) {
  for (let i = baseOffset; i < str.length; i++) {
    const char = str[i];
    if (
      char === " " ||
      char === "=" ||
      char === ">" ||
      char === "\\" ||
      char === "\r" ||
      char === "\n" ||
      char === "\t" ||
      char === "\f"
    ) {
      return i;
    }
  }
  return str.length;
}

/**
 * From the offset of where an element's name (in the opening or closing tag)
 * begins, return the offset coming directly after the name's last character.
 * @param {string} str - String where the element's name can be found.
 * @param {number} baseOffset - Index in `str` where the first character of
 * the name declaration is found.
 * @returns {number}
 */
function skipToElementNameDeclarationEnd(str, baseOffset) {
  for (let i = baseOffset; i < str.length; i++) {
    const char = str[i];
    if (char === ">" || char === "/" || isAsciiWhiteSpace(char)) {
      return i;
    }
  }
  return str.length;
}

/**
 * Check if we're encountering a self-closing tag by checking if `/>` is
 * currently pointed to beginning at `remainingStrings[0][offset]`.
 *
 * Returns:
 *   - `-1` if there's no character indicating a self-closing tag there.
 *   - in any other cases, the index just after the self-closing characters
 *    (`/>`) in `remainingStrings[0]`.
 * @param {Array.<string>} remainingStrings - Array of strings generated for the
 * tagged template litteral which have not yet been completely parsed.
 * `offset` refers to the first element of that array (`remainingStrings[0]`).
 * @param {number} offset - Index in `remainingStrings[0]` pointing to the
 * first character of the potential "/" character indicating a self-closing tag.
 * @returns {number}
 */
function checkSelfClosingTagAtOffset(remainingStrings, offset) {
  const str = remainingStrings[0];
  if (str[offset] !== "/") {
    return -1;
  }

  if (str[offset + 1] !== ">") {
    checkExprWrongPlace(remainingStrings, "at the end of a tag");
    throw new SyntaxError("str-html: Invalid tag end.");
  }
  return offset + 2;
}

/**
 * Skip ASCII whitespace from the given `baseOffset` in `str` and returns the
 * first index with no whitespace (may be the length of the string if whitespace
 * goes until the end).
 * @param {string} str - String where the first whitespace character we want to
 * skip might be found.
 * @param {number} baseOffset - Index in `str` where to search for the first
 * whitespace character.
 * @returns {number}
 */
function skipWhiteSpace(str, baseOffset) {
  let offset = baseOffset;
  let char;
  do {
    char = str[offset];
  } while (isAsciiWhiteSpace(char) && ++offset);
  return offset;
}

/**
 * Check that `remainingStrings` contains at most 1 element and throw otherwise
 * an error indicating that an expression has been badly placed.
 *
 * The idea is to call `checkExprWrongPlace` when you want to check if the
 * user wrongly put a template expression at that point in the template
 * litteral, in which case the error will indicate to the user that mistake.
 * @param {Array.<string>} remainingStrings - Array of strings generated for the
 * tagged template litteral which have not yet been completely parsed.
 * @param {string|undefined} [place] - Description of where an expression was
 * found. Will be used for the error message.
 */
function checkExprWrongPlace(remainingStrings, place) {
  if (remainingStrings.length > 1) {
    throw new SyntaxError(
      "str-html: Expression must only be set for attribute values " +
        "or an element's inner content." +
        (place !== undefined ? ` Found one ${place}.` : ""),
    );
  }
}
