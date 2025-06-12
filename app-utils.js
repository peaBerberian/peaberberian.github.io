// src/constants.mjs
var docImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16" fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg"><path d="M5 0C3.34315 0 2 1.34315 2 3V13C2 14.6569 3.34315 16 5 16H14V14H4V12H14V0H5Z"/></svg>`;
var demoImgSvg = `<svg version="1.1" fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 512 512" xml:space="preserve"><g><path class="st0" d="M485.234,116.625H261.906l69.719-69.719c1.75-1.75,1.75-4.563,0-6.313l-17.422-17.438   c-1.734-1.75-4.563-1.75-6.297,0l-89.688,89.688l-89.656-89.688c-1.75-1.75-4.563-1.75-6.313,0l-17.438,17.438   c-1.75,1.75-1.75,4.563,0,6.313l69.75,69.719H26.766c-14.781,0-26.766,12-26.766,26.781v319.969   c0,14.781,11.984,26.781,26.766,26.781h458.469c14.781,0,26.766-12,26.766-26.781V143.406   C512,128.625,500.016,116.625,485.234,116.625z M383.594,421.188c0,8.531-6.906,15.438-15.422,15.438H66.844   c-8.531,0-15.438-6.906-15.438-15.438V191.875c0-8.531,6.906-15.438,15.438-15.438h301.328c8.516,0,15.422,6.906,15.422,15.438   V421.188z M473.188,333.813h-45.125v-45.125h45.125V333.813z M449.047,234.156c-13.906,0-25.172-11.281-25.172-25.188   s11.266-25.188,25.172-25.188s25.172,11.281,25.172,25.188S462.953,234.156,449.047,234.156z"/>
</g></svg>`;
var codeImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16"  fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 1H1V15H15V1ZM6 5L7.41421 6.41421L5.82843 8L7.41421 9.58579L6 11L3 8L6 5ZM10 5L8.58579 6.41421L10.1716 8L8.58579 9.58579L10 11L13 8L10 5Z"/></svg>`;

// src/str-html.mjs
var VOID_ELEMENTS = [
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
  "wbr"
];
function strHtml(templateStrArr) {
  const remainingStrings = Array.prototype.slice.call(templateStrArr);
  const remainingExprs = Array.prototype.slice.call(arguments, 1);
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
        "str-html: Unexpected data after the parent element."
      );
    }
  }
  return nextElemInfo.element;
}
function parseNextElem(remainingStrings, baseOffset, remainingExprs) {
  let offset = baseOffset + 1;
  const endIdxTagName = skipToElementNameDeclarationEnd(
    remainingStrings[0],
    offset
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
  const postAttrInfo = parseAllAttributes(
    element,
    remainingStrings,
    offset,
    remainingExprs
  );
  offset = skipWhiteSpace(remainingStrings[0], postAttrInfo.offset);
  const selfClosingTagOffset = checkSelfClosingTagAtOffset(
    remainingStrings,
    offset
  );
  if (selfClosingTagOffset >= 0) {
    return { element, offset: selfClosingTagOffset };
  }
  if (remainingStrings.length === 0 || remainingStrings[0][offset] !== ">") {
    checkExprWrongPlace(remainingStrings, "in the tag's attribute names");
    throw new SyntaxError("str-html: Unexpected end of opening tag.");
  }
  offset++;
  if (VOID_ELEMENTS.includes(tagName)) {
    return { element, offset };
  }
  let initOffset = offset;
  while (true) {
    if (remainingStrings[0][offset] === void 0) {
      const remText = document.createTextNode(
        remainingStrings[0].substring(initOffset, offset)
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
          return { element, offset: 0 };
        }
      }
    } else if (remainingStrings[0][offset] === "<") {
      const remText = document.createTextNode(
        remainingStrings[0].substring(initOffset, offset)
      );
      element.appendChild(remText);
      if (remainingStrings[0][offset + 1] !== "/") {
        const nextElemInfo = parseNextElem(
          remainingStrings,
          offset,
          remainingExprs
        );
        offset = nextElemInfo.offset;
        element.appendChild(nextElemInfo.element);
        initOffset = offset;
        if (remainingStrings.length === 0) {
          throw new SyntaxError("str-html: Unexpected end of string.");
        }
        offset = skipWhiteSpace(remainingStrings[0], nextElemInfo.offset);
      } else {
        let isEndOfCurrentElement = true;
        const closingTagNameEndIdx = skipToElementNameDeclarationEnd(
          remainingStrings[0],
          offset + 2
        );
        const closingTagName = remainingStrings[0].substring(
          offset + 2,
          closingTagNameEndIdx
        );
        if (closingTagName !== tagName) {
          if (VOID_ELEMENTS.includes(closingTagName)) {
            isEndOfCurrentElement = false;
          } else {
            throw new SyntaxError(
              "str-html: Closing tag does not correspond to last opened tag."
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
function useExprForElementContent(element, expr) {
  if (expr !== void 0 && expr !== null) {
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
function parseAllAttributes(elem, remainingStrings, baseOffset, remainingExprs) {
  let offset = baseOffset;
  while (true) {
    offset = skipWhiteSpace(remainingStrings[0], offset);
    if (remainingStrings[0][offset] === void 0) {
      checkExprWrongPlace(remainingStrings, "set as an attribute name");
      throw new SyntaxError(
        "str-html: Reached end while parsing tag attributes."
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
      offset
    );
    offset = nextAttrInfo.offset;
    const [attrName, attrValue] = nextAttrInfo.attribute;
    try {
      elem.setAttribute(attrName, attrValue);
    } catch (err) {
      if (err instanceof DOMException && err.name === "InvalidCharacterError") {
        throw new SyntaxError(
          `str-html: Invalid attribute name: "${attrName}"`
        );
      }
      throw err;
    }
  }
}
function getUnquotedAttributeValue(remainingStrings, remainingExprs, baseOffset) {
  let initOffset = baseOffset;
  let offset = baseOffset;
  let value = "";
  let currStr = remainingStrings[0];
  while (true) {
    if (currStr[offset] !== ">" && currStr[offset] !== "/" && currStr[offset] !== " " && !isAsciiWhiteSpace(currStr[offset])) {
      if (currStr[offset] !== void 0) {
        offset++;
      } else {
        value += currStr.substring(initOffset);
        if (remainingExprs.length > 0) {
          value += exprToStringForAttributeValue(remainingExprs.shift());
        }
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
function isAsciiWhiteSpace(char) {
  return char === " " || char === "	" || char === "\f" || char === "\r" || char === "\n";
}
function exprToStringForAttributeValue(expr) {
  if (expr === null) {
    return "";
  } else if (expr === void 0) {
    return "";
  } else if (expr instanceof HTMLElement) {
    throw new SyntaxError(
      "str-html: Found HTMLElement set as attribute's value."
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
function getQuotedAttributeValue(remainingStrings, remainingExprs, baseOffset) {
  let initOffset = baseOffset;
  let offset = baseOffset;
  let value = "";
  let currStr = remainingStrings[0];
  while (true) {
    if (currStr[offset] !== '"') {
      if (currStr[offset] !== void 0) {
        offset++;
      } else {
        value += currStr.substring(initOffset);
        if (remainingExprs.length > 0) {
          value += exprToStringForAttributeValue(remainingExprs.shift());
        }
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
function readNextAttribute(remainingStrings, remainingExprs, baseOffset) {
  const attrNameBaseOffset = baseOffset;
  let offset = skipToAttributeNameDeclarationEnd(
    remainingStrings[0],
    baseOffset
  );
  const attrName = remainingStrings[0].substring(attrNameBaseOffset, offset);
  offset = skipWhiteSpace(remainingStrings[0], offset);
  if (remainingStrings[0][offset] !== "=") {
    return { offset, attribute: [attrName, ""] };
  }
  offset++;
  offset = skipWhiteSpace(remainingStrings[0], offset);
  const attrValueInfo = remainingStrings[0][offset] !== '"' ? getUnquotedAttributeValue(remainingStrings, remainingExprs, offset) : getQuotedAttributeValue(remainingStrings, remainingExprs, offset + 1);
  if (remainingStrings.length === 0) {
    throw new SyntaxError(
      `str-html: Unexpected end of HTML inside of value for attribute "${attrName}".`
    );
  }
  return {
    offset: attrValueInfo.offset,
    attribute: [attrName, attrValueInfo.value]
  };
}
function skipToAttributeNameDeclarationEnd(str, baseOffset) {
  for (let i = baseOffset; i < str.length; i++) {
    const char = str[i];
    if (char === " " || char === "=" || char === ">" || char === "\\" || char === "\r" || char === "\n" || char === "	" || char === "\f") {
      return i;
    }
  }
  return str.length;
}
function skipToElementNameDeclarationEnd(str, baseOffset) {
  for (let i = baseOffset; i < str.length; i++) {
    const char = str[i];
    if (char === ">" || char === "/" || isAsciiWhiteSpace(char)) {
      return i;
    }
  }
  return str.length;
}
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
function skipWhiteSpace(str, baseOffset) {
  let offset = baseOffset;
  let char;
  do {
    char = str[offset];
  } while (isAsciiWhiteSpace(char) && ++offset);
  return offset;
}
function checkExprWrongPlace(remainingStrings, place) {
  if (remainingStrings.length > 1) {
    throw new SyntaxError(
      "str-html: Expression must only be set for attribute values or an element's inner content." + (place !== void 0 ? ` Found one ${place}.` : "")
    );
  }
}

// src/utils.mjs
function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
function createExternalIframe(url) {
  const container = document.createElement("div");
  applyStyle(container, {
    height: "100%",
    width: "100%",
    position: "relative",
    backgroundColor: "var(--window-content-bg)"
  });
  const blockerDiv = document.createElement("div");
  blockerDiv.className = "iframe-top-layer";
  applyStyle(blockerDiv, {
    height: "100%",
    width: "100%",
    position: "absolute",
    backgroundColor: "#000000AA",
    justifyContent: "center",
    alignItems: "center"
  });
  const blockerText = document.createElement("div");
  applyStyle(blockerText, {
    color: "white",
    fontStyle: "italic",
    padding: "10px",
    backgroundColor: "#0000004d",
    borderRadius: "10px"
  });
  blockerText.textContent = "External i-frame blocked until the window's content is focused.";
  blockerDiv.appendChild(blockerText);
  const spinner = document.createElement("div");
  spinner.className = "spinner spinner-iframe";
  const iframe = document.createElement("iframe");
  applyStyle(iframe, {
    height: "100%",
    width: "100%",
    border: "0",
    // TODO: find out what's adding that thing instead of hacking around!
    marginBottom: "-5px"
  });
  iframe.src = url;
  iframe.className = "loading";
  iframe.height = "100%";
  iframe.width = "100%";
  iframe.border = 0;
  iframe.allow = "clipboard-read; clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture";
  iframe.onload = function() {
    container.style.backgroundColor = "#ffffff";
    container.removeChild(spinner);
  };
  iframe.onerror = function() {
    container.removeChild(spinner);
  };
  container.appendChild(blockerDiv);
  container.appendChild(iframe);
  container.appendChild(spinner);
  return container;
}
function constructSidebarElt(sections, onChangeSection) {
  const sidebarElt = strHtml`<div class="w-sidebar"/>`;
  const sidebarItemElements = sections.map((item) => {
    const itemIcon = item.icon ? strHtml`<span class="w-sidebar-icon">${item.icon}</span>` : null;
    const itemElement = strHtml`<div class="w-sidebar-item${item.active ? " active" : ""}" tabindex="0">
${itemIcon}${item.text}
</div>`;
    itemElement.onkeydown = (e) => {
      if (e.key === "Enter") {
        itemElement.click();
      }
    };
    itemElement.onclick = () => {
      if (itemElement.classList.contains("active")) {
        return;
      }
      sidebarItemElements.forEach((el) => {
        el.classList.remove("active");
      });
      itemElement.classList.add("active");
      onChangeSection(item.section);
    };
    return itemElement;
  });
  sidebarItemElements.forEach((item) => {
    sidebarElt.appendChild(item);
  });
  return sidebarElt;
}

// src/app-launcher/app-utils/header-line.mjs
var openSvg = `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-60.000000, -1879.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M13.978,1730.401 L12.596,1729.007 L6,1735.656 L6,1733 L4,1733 L4,1739 L10.071,1739 L10.101,1737 L7.344,1737 L13.978,1730.401 Z M24,1725.08 L24,1739 L12,1739 L12,1737 L22,1737 L22,1727 L16,1727 L16,1721 L6,1721 L6,1731 L4,1731 L4,1719 L18,1719 L24,1725.08 Z"></path></g></g></g></svg>`;
var BUTTONS_LIST = [
  // All SVG are with a CC0 or PD license, most found on svgrepo
  {
    name: "newFile",
    defaultTitle: "Create a new file",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-220.000000, -1599.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M182,1457.0005 L166,1457.0005 L166,1441.0005 L176,1441.0005 L176,1447.0005 L182,1447.0005 L182,1457.0005 Z M178,1439.0005 L164,1439.0005 L164,1459.0005 L184,1459.0005 L184,1445.2095 L178,1439.0005 Z"></path></g></g></g></svg>`,
    height: "1.3rem"
    // svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-420.000000, -8079.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M382,7937 L366,7937 L366,7925.837 L370.837,7921 L382,7921 L382,7937 Z M383.969,7919 L370,7919 L370,7919.009 L364.009,7925 L364,7925 L364,7939 L384,7939 L384,7919 L383.969,7919 Z"></path></g></g></g></svg>`,
  },
  {
    name: "previous",
    defaultTitle: "Previous",
    height: "1.4em",
    svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-385.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M338.61,6539 L340,6537.594 L331.739,6528.987 L332.62,6528.069 L332.615,6528.074 L339.955,6520.427 L338.586,6519 C336.557,6521.113 330.893,6527.014 329,6528.987 C330.406,6530.453 329.035,6529.024 338.61,6539"></path></g></g></g></svg>`
  },
  {
    name: "next",
    defaultTitle: "Next",
    height: "1.4em",
    svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-425.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M370.39,6519 L369,6520.406 L377.261,6529.013 L376.38,6529.931 L376.385,6529.926 L369.045,6537.573 L370.414,6539 C372.443,6536.887 378.107,6530.986 380,6529.013 C378.594,6527.547 379.965,6528.976 370.39,6519"></path </g></g></g></svg>`
  },
  {
    name: "undo",
    defaultTitle: "Undo",
    height: "1.8rem",
    svg: `<svg fill="currentColor" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`
  },
  {
    name: "redo",
    defaultTitle: "Redo",
    height: "1.8rem",
    svg: `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`
  },
  {
    name: "clear",
    defaultTitle: "Clear",
    height: "1.5em",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-179.000000, -360.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z"></path></g></g></g></svg>`
  },
  {
    name: "upload",
    defaultTitle: "Upload",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-300.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M254.006515,3325.00497 L250.302249,3328.71065 L251.715206,3330.12415 L253.007252,3328.83161 L253.007252,3339 L255.005777,3339 L255.005777,3328.83161 L256.297824,3330.12415 L257.710781,3328.71065 L254.006515,3325.00497 Z M262.281407,3331.70459 C260.525703,3333.21505 258.787985,3333.00213 257.004302,3333.00213 L257.004302,3331.00284 C258.859932,3331.00284 259.724294,3331.13879 260.728553,3330.45203 C263.14477,3328.79962 261.8847,3324.908 258.902901,3325.01496 C257.570884,3318.41131 247.183551,3320.64551 249.247028,3327.4451 C246.618968,3325.35484 243.535244,3331.00284 249.116125,3331.00284 L251.008728,3331.00284 L251.008728,3333.00213 L248.211792,3333.00213 C244.878253,3333.00213 242.823769,3329.44339 244.73236,3326.72236 C245.644687,3325.42282 247.075631,3325.10193 247.075631,3325.10193 C247.735144,3319.99075 253.568838,3317.29171 257.889649,3320.18468 C259.74428,3321.42724 260.44776,3323.24259 260.44776,3323.24259 C264.159021,3324.37019 265.278195,3329.1265 262.281407,3331.70459 L262.281407,3331.70459 Z"></path></g></g></g></svg>`
  },
  {
    name: "open",
    defaultTitle: "Open",
    height: "1.2rem",
    svg: openSvg
  },
  {
    name: "download",
    defaultTitle: "Download",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-340.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M297.995199,3334.46886 C297.995199,3334.07649 296.972565,3334.08051 296.583086,3334.47187 L295.852063,3335.20843 C295.537483,3335.52452 294.999203,3335.30275 294.999203,3334.8552 L294.999203,3326.03153 C294.999203,3325.48162 294.600735,3325.03708 294.055464,3325.03005 C293.508195,3325.03708 293.001872,3325.48162 293.001872,3326.03153 L293.001872,3334.8552 C293.001872,3335.30275 292.463591,3335.52653 292.149011,3335.21043 L291.417988,3334.26715 C291.028509,3333.87579 290.40634,3334.05943 290.016861,3334.05943 L290.010869,3334.05943 C289.621389,3335.06292 289.618393,3335.29473 290.008871,3335.68609 L292.589423,3338.38547 C293.36938,3339.16919 294.633691,3339.22137 295.413649,3338.43765 L297.995199,3335.86872 C298.385677,3335.47636 297.995199,3334.85419 297.995199,3334.46283 L297.995199,3334.46886 Z M294.044478,3325.02805 C294.048473,3325.02805 294.051469,3325.03005 294.055464,3325.03005 C294.059458,3325.03005 294.062454,3325.02805 294.066449,3325.02805 L294.044478,3325.02805 Z M297.995199,3333.05595 C297.443936,3333.05595 296.996533,3332.60638 296.996533,3332.05246 C296.996533,3331.49853 297.443936,3331.04897 297.995199,3331.04897 L298.888006,3331.04897 C303.142321,3331.04897 302.833733,3324.89559 298.893998,3325.03808 C297.547797,3318.33479 287.212608,3320.75419 289.243893,3327.47756 C287.168667,3325.8198 284.677995,3329.02795 286.79916,3330.61145 C288.298157,3331.73134 291.004541,3330.19902 291.004541,3332.05246 C291.004541,3333.31484 289.578446,3333.05595 288.209276,3333.05595 C284.877728,3333.05595 282.824472,3329.48353 284.731923,3326.75204 C285.643704,3325.4475 287.073793,3325.12539 287.073793,3325.12539 C287.732913,3319.99456 293.563122,3317.28514 297.881351,3320.18923 C299.734874,3321.43657 300.437935,3323.2589 300.437935,3323.2589 C301.527479,3323.59206 302.46223,3324.28246 303.098379,3325.19663 C305.240517,3328.27332 303.575742,3333.05595 297.995199,3333.05595 L297.995199,3333.05595 Z"></path></g></g></g></svg>`
  },
  // clear2: `<svg fill="var(--window-text-color)" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6 2.5c0-.27614.22386-.5.5-.5h2c.27614 0 .5.22386.5.5v.5h1.5c.8284 0 1.5.67157 1.5 1.5v1c0 .27614-.2239.5-.5.5h-.5v6.5c0 .2761-.2239.5-.5.5h-6c-.27614 0-.5-.2239-.5-.5v-6.5h-.5c-.27614 0-.5-.22386-.5-.5v-1c0-.82843.67157-1.5 1.5-1.5h1.5zm-1 3.5v6h5v-6zm6-1v-.5c0-.27614-.2239-.5-.5-.5h-6c-.27614 0-.5.22386-.5.5v.5z" fill-rule="evenodd"/></svg>`,
  {
    name: "save",
    defaultTitle: "Save",
    height: "1.44em",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-99.000000, -680.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M50.21875,525 L52.31875,525 L52.31875,523 L50.21875,523 L50.21875,525 Z M61.9,538 L59.8,538 L59.8,532 L58.88125,532 L57.7,532 L49.3,532 L47.5276,532 L47.2,532 L47.2,538 L45.1,538 L45.1,526.837 L47.2,524.837 L47.2,528 L48.11875,528 L49.3,528 L57.7,528 L59.47135,528 L59.8,528 L59.8,522 L61.9,522 L61.9,538 Z M49.3,538 L57.7,538 L57.7,534 L49.3,534 L49.3,538 Z M49.3,522.837 L50.17885,522 L57.7,522 L57.7,526 L49.3,526 L49.3,522.837 Z M63.9664,520 L61.8664,520 L49.3,520 L49.3,520.008 L47.2084,522 L47.2,522 L47.2,522.008 L43.0084,526 L43,526 L43,538 L43,540 L45.1,540 L61.8664,540 L63.9664,540 L64,540 L64,538 L64,522 L64,520 L63.9664,520 Z"></path></g></g></g></svg>`
  }
];
var BUTTONS_BY_NAME = BUTTONS_LIST.reduce((acc, val) => {
  acc[val.name] = val;
  return acc;
}, {});
function constructAppHeaderLine(buttonConfigs) {
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
    borderBottom: "1px solid var(--window-line-color)"
  });
  const buttonElts = {};
  const addButton = (config, buttonName) => {
    var _a, _b, _c, _d, _e, _f;
    const defaultButtonConfig = (_a = BUTTONS_BY_NAME[buttonName]) != null ? _a : [];
    const buttonElt = createButtonElt(
      (_c = (_b = config.svg) != null ? _b : defaultButtonConfig.svg) != null ? _c : "",
      (_e = (_d = config.title) != null ? _d : defaultButtonConfig.defaultTitle) != null ? _e : "",
      (_f = config.height) != null ? _f : defaultButtonConfig.height,
      (e) => {
        e.preventDefault();
        config.onClick();
      }
    );
    buttonElts[buttonName] = buttonElt;
    buttonElt.className = "w-tool-btn";
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
          borderRight: "1px solid var(--sidebar-hover-bg)"
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
    }
  };
}
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
    alignItems: "center"
  });
  const svgWrapperElt = document.createElement("span");
  applyStyle(svgWrapperElt, {
    // flex: "1 0 0",
    height
    // margin: "auto 0",
  });
  const buttonSvgElt = getSvg(svg);
  if (buttonSvgElt) {
    applyStyle(buttonSvgElt, {
      width: "1.7rem",
      height: "100%"
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
    overflow: "hidden"
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

// src/app-launcher/app-utils/index.mjs
var index_default = {
  // Often needed utils:
  applyStyle,
  strHtml,
  constructAppHeaderLine,
  // In rare situations:
  constructSidebarElt,
  createExternalIframe,
  createAppTitle,
  createFullscreenButton
};
function createAppTitle(title, ql) {
  return strHtml`<h2 class="app-title">${title} ${constructQuicklinks(ql != null ? ql : {})}</h2>`;
}
function constructQuicklinks(ql) {
  const links = [];
  if (ql.demo) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = demoImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its demo page";
    imgWrapper.alt = "Link to demo page";
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.demo}" target="_blank">${imgWrapper}</a>`
    );
  }
  if (ql.github) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = codeImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its code repository";
    imgWrapper.alt = "Link to its code repository";
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.github}" target="_blank">${imgWrapper}</a>`
    );
  }
  if (ql.doc) {
    const imgWrapper = document.createElement("span");
    imgWrapper.innerHTML = docImgSvg;
    imgWrapper.className = "quicklink-img";
    imgWrapper.title = "Link to its API documentation";
    imgWrapper.alt = "Link to its API documentation";
    links.push(
      strHtml`<a class="quicklink-link" href="${ql.doc}" target="_blank">${imgWrapper}</a>`
    );
  }
  return strHtml`<span class="quickLinks">${links}</span>`;
}
function createFullscreenButton(abortSignal) {
  const fullscreenButton = strHtml`<input class="btn" type="button" value="">`;
  function updateFullScreenText() {
    const fullscreenText = document.fullscreenElement === null ? "Go fullscreen!" : "Exit fullcreen mode";
    fullscreenButton.value = fullscreenText;
  }
  updateFullScreenText();
  document.body.addEventListener("fullscreenchange", updateFullScreenText);
  abortSignal.addEventListener("aborted", () => {
    document.body.removeEventListener("fullscreenchange", updateFullScreenText);
  });
  fullscreenButton.onclick = function() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  };
  return fullscreenButton;
}
export {
  index_default as default
};
