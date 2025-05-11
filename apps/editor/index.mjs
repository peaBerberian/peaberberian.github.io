const { applyStyle } = AppUtils;

// NOTE: I took again the buttons from the paint app.
// We may want to add them in the base js instead?
const undoSvg = `<svg fill="var(--window-text-color)" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`;
const redoSvg = `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" fill="var(--window-text-color)"><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`;
const saveSvg = `<svg fill="var(--window-text-color)" width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill-rule="evenodd"><g transform="translate(-419.000000, -640.000000)"><g transform="translate(56.000000, 160.000000)"><path d="M370.21875,484 C370.21875,483.448 370.68915,483 371.26875,483 C371.84835,483 372.31875,483.448 372.31875,484 C372.31875,484.552 371.84835,485 371.26875,485 C370.68915,485 370.21875,484.552 370.21875,484 L370.21875,484 Z M381.9,497 C381.9,497.552 381.4296,498 380.85,498 L379.8,498 L379.8,494 C379.8,492.895 378.86025,492 377.7,492 L369.3,492 C368.13975,492 367.2,492.895 367.2,494 L367.2,498 L366.15,498 C365.5704,498 365.1,497.552 365.1,497 L365.1,487.044 C365.1,486.911 365.15565,486.784 365.2533,486.691 L367.2,484.837 L367.2,486 C367.2,487.105 368.13975,488 369.3,488 L377.7,488 C378.86025,488 379.8,487.105 379.8,486 L379.8,482 L380.85,482 C381.4296,482 381.9,482.448 381.9,483 L381.9,497 Z M377.7,498 L369.3,498 L369.3,495 C369.3,494.448 369.7704,494 370.35,494 L376.65,494 C377.2296,494 377.7,494.448 377.7,495 L377.7,498 Z M369.3,482.837 L370.17885,482 L377.7,482 L377.7,485 C377.7,485.552 377.2296,486 376.65,486 L370.35,486 C369.7704,486 369.3,485.552 369.3,485 L369.3,482.837 Z M381.9,480 L369.7347,480 C369.45645,480 369.18975,480.105 368.99235,480.293 L363.30765,485.707 C363.11025,485.895 363,486.149 363,486.414 L363,498 C363,499.105 363.93975,500 365.1,500 L381.9,500 C383.06025,500 384,499.105 384,498 L384,482 C384,480.895 383.06025,480 381.9,480 L381.9,480 Z"></path></g></g></g></svg>`;
const clearSvg = `<svg fill="var(--window-text-color)" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6 2.5c0-.27614.22386-.5.5-.5h2c.27614 0 .5.22386.5.5v.5h1.5c.8284 0 1.5.67157 1.5 1.5v1c0 .27614-.2239.5-.5.5h-.5v6.5c0 .2761-.2239.5-.5.5h-6c-.27614 0-.5-.2239-.5-.5v-6.5h-.5c-.27614 0-.5-.22386-.5-.5v-1c0-.82843.67157-1.5 1.5-1.5h1.5zm-1 3.5v6h5v-6zm6-1v-.5c0-.27614-.2239-.5-.5-.5h-6c-.27614 0-.5.22386-.5.5v.5z" fill-rule="evenodd"/></svg>`;

export function create() {
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    position: "relative",
    height: "100%",
    overflow: "hidden",
    width: "100%",
  });
  const { element, focus } = createEditor();
  containerElt.appendChild(element);
  return {
    element: containerElt,
    focus,
  };
}

function createEditor() {
  const editorWrapperElt = document.createElement("div");
  applyStyle(editorWrapperElt, {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  });

  const headerElt = document.createElement("div");
  applyStyle(headerElt, {
    backgroundColor: "var(--window-sidebar-bg)",
    width: "100%",
    overflow: "auto",
    display: "flex",
    padding: "3px",
    gap: "5px",
    flexShrink: "0",
  });

  let history = [];
  let historyIndex = -1;
  let lastSavedContent = null;

  const undoButton = createButtonElt(undoSvg, "Undo", 1, (e) => {
    e.preventDefault();
    undo();
  });
  disableButton(undoButton);

  const redoButton = createButtonElt(redoSvg, "Redo", 1, (e) => {
    e.preventDefault();
    redo();
  });
  disableButton(redoButton);

  const clearButton = createButtonElt(clearSvg, "Clear", 1, () => {
    const hadSomethingWritten = textArea.value;
    statusBar.textContent = "Cleared";
    textArea.value = "";
    disableButton(clearButton);
    if (hadSomethingWritten) {
      saveState(false);
    }
    updateLineNumbers();
  });
  disableButton(clearButton);

  const saveButton = createButtonElt(saveSvg, "Save (download)", 0.75, () => {
    if (typeof window.showSaveFilePicker === "function") {
      saveFile(textArea.value);
    } else {
      const link = document.createElement("a");
      link.download = "notes.txt";
      link.href =
        "data:text/plain;charset=utf-8," + encodeURIComponent(textArea.value);
      link.click();
    }
  });

  const editorContentElt = document.createElement("div");
  editorContentElt.style.display = "flex";
  editorContentElt.style.flex = "1";
  editorContentElt.style.overflow = "hidden";

  const linesElt = document.createElement("pre");
  applyStyle(linesElt, {
    backgroundColor: "var(--window-content-bg)",
    color: "var(--window-text-color)",
    width: "40px",
    overflow: "hidden",
    textAlign: "right",
    padding: "8px 4px",
    fontFamily: "monospace",
    borderRight: "2px solid var(--window-line-color)",
    userSelect: "none",
  });

  const textArea = document.createElement("textarea");
  applyStyle(textArea, {
    flex: "1",
    backgroundColor: "var(--window-content-bg)",
    color: "var(--window-text-color)",
    border: "none",
    outline: "none",
    padding: "8px",
    resize: "none",
    fontFamily: "monospace",
    fontSize: "var(--font-size)",
    whiteSpace: "pre",
    overflow: "auto",
  });
  editorContentElt.appendChild(linesElt);
  editorContentElt.appendChild(textArea);

  const statusBar = document.createElement("div");
  applyStyle(statusBar, {
    backgroundColor: "var(--window-sidebar-bg)",
    padding: "4px",
    bottom: "0",
    width: "100%",
    fontSize: "var(--font-size)",
  });
  statusBar.textContent = "Ready";

  headerElt.appendChild(undoButton);
  headerElt.appendChild(redoButton);
  headerElt.appendChild(clearButton);
  headerElt.appendChild(saveButton);
  editorWrapperElt.append(headerElt, editorContentElt, statusBar);
  saveState(false);

  let prevLineCount = 0;
  let debouncedTimeout;
  textArea.addEventListener("input", onTextInput);
  textArea.addEventListener("change", onTextInput);
  function onTextInput() {
    statusBar.textContent = "Writing...";
    if (textArea.value === "") {
      disableButton(clearButton);
    } else {
      enableButton(clearButton);
    }
    if (debouncedTimeout !== undefined) {
      clearTimeout(debouncedTimeout);
      saveState(true);
    } else {
      saveState(false);
    }
    debouncedTimeout = setTimeout(() => {
      statusBar.textContent = "Ready";
      debouncedTimeout = undefined;
      saveState(true);
    }, 500);
    updateLineNumbers();
  }
  textArea.addEventListener("scroll", () => syncScroll());
  updateLineNumbers();

  return {
    element: editorWrapperElt,
    focus: () => textArea.focus(),
  };

  function updateLineNumbers() {
    const lines = textArea.value.split("\n");
    const lineCount = lines.length || 1; // At least 1 line

    if (lineCount !== prevLineCount) {
      prevLineCount = lineCount;
      let numbers = "";
      for (let i = 1; i <= lineCount; i++) {
        numbers += `${i}\n`;
      }

      linesElt.textContent = numbers;
    }
    syncScroll();
  }

  function syncScroll() {
    linesElt.scrollTop = textArea.scrollTop;
  }

  function saveState(shouldReplaceLastOne) {
    const content = textArea.value;
    if (content === lastSavedContent) {
      return;
    }

    if (!shouldReplaceLastOne || history.length === 0) {
      // Truncate history if we're not at the end
      if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
      }

      history.push(content);
      historyIndex = history.length - 1;
      lastSavedContent = content;

      while (history.length > 100) {
        history.shift();
        historyIndex--;
      }
    } else {
      history[history.length - 1] = content;
      lastSavedContent = content;
    }

    disableButton(redoButton);
    if (historyIndex > 0) {
      enableButton(undoButton);
    }
  }

  function undo() {
    if (historyIndex <= 0) {
      return;
    }

    historyIndex--;
    textArea.value = history[historyIndex];
    lastSavedContent = textArea.value;
    statusBar.textContent = "Undo";

    if (historyIndex < history.length - 1) {
      enableButton(redoButton);
    }
    if (historyIndex <= 0) {
      disableButton(undoButton);
    }
    if (textArea.value === "") {
      disableButton(clearButton);
    } else {
      enableButton(clearButton);
    }
    updateLineNumbers();
  }

  function redo() {
    if (historyIndex >= history.length - 1) {
      return;
    }

    historyIndex++;
    textArea.value = history[historyIndex];
    lastSavedContent = textArea.value;
    statusBar.textContent = "Redo";
    if (historyIndex > 0) {
      enableButton(undoButton);
    }
    if (historyIndex >= history.length - 1) {
      disableButton(redoButton);
    }
    if (textArea.value === "") {
      disableButton(clearButton);
    } else {
      enableButton(clearButton);
    }
    updateLineNumbers();
  }
}

function createButtonElt(svg, title, heightScale, onClick) {
  const buttonSvgElt = getSvg(svg);
  applyStyle(buttonSvgElt, {
    width: "2rem",
    height: `${heightScale * 2}rem`,
  });
  const buttonWrapperElt = document.createElement("span");
  buttonWrapperElt.style.margin = "auto 0";
  buttonWrapperElt.style.cursor = "pointer";
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

function enableButton(buttonElt) {
  if (buttonElt.style.cursor !== "pointer") {
    buttonElt.style.cursor = "pointer";
    buttonElt.children[0].setAttribute("fill", "var(--window-text-color)");
  }
}

function disableButton(buttonElt) {
  if (buttonElt.style.cursor === "pointer") {
    buttonElt.style.cursor = "auto";
    buttonElt.children[0].setAttribute("fill", "var(--window-inactive-header)");
  }
}

async function saveFile(content) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "notes.txt",
    });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return handle;
  } catch (err) {
    console.error(err);
  }
}
