// NOTE: I took again the buttons from the paint app.
// We may want to add them in the base js instead?
export const undoSvg = `<svg fill="var(--window-active-header)" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`;
export const redoSvg = `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" fill="var(--window-active-header)"><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`;
export const saveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke-width="3" stroke="var(--window-active-header)" fill="none"><path d="M51,53.48H10.52V13A2.48,2.48,0,0,1,13,10.52H46.07l7.41,6.4V51A2.48,2.48,0,0,1,51,53.48Z" stroke-linecap="round"/><rect x="21.5" y="10.52" width="21.01" height="15.5" stroke-linecap="round"/><rect x="17.86" y="36.46" width="28.28" height="17.02" stroke-linecap="round"/></svg>`;
export const clearSvg = `<svg fill="var(--window-active-header)" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6 2.5c0-.27614.22386-.5.5-.5h2c.27614 0 .5.22386.5.5v.5h1.5c.8284 0 1.5.67157 1.5 1.5v1c0 .27614-.2239.5-.5.5h-.5v6.5c0 .2761-.2239.5-.5.5h-6c-.27614 0-.5-.2239-.5-.5v-6.5h-.5c-.27614 0-.5-.22386-.5-.5v-1c0-.82843.67157-1.5 1.5-1.5h1.5zm-1 3.5v6h5v-6zm6-1v-.5c0-.27614-.2239-.5-.5-.5h-6c-.27614 0-.5.22386-.5.5v.5z" fill-rule="evenodd"/></svg>`;

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
    padding: "5px",
    gap: "5px",
    flexShrink: "0",
  });

  let history = [];
  let historyIndex = -1;
  let lastSavedContent = null;

  const undoButton = createButtonElt(undoSvg, (e) => {
    e.preventDefault();
    undo();
  });
  disableButton(undoButton);

  const redoButton = createButtonElt(redoSvg, (e) => {
    e.preventDefault();
    redo();
  });
  disableButton(redoButton);

  const clearButton = createButtonElt(clearSvg, () => {
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

  const saveButton = createButtonElt(saveSvg, () => {
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
  textArea.addEventListener("input", () => {
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
  });
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

function createButtonElt(svg, onClick) {
  const buttonElt = getSvg(svg);
  applyStyle(buttonElt, {
    width: "35px",
    height: "35px",
    cursor: "pointer",
  });
  buttonElt.onclick = onClick;
  buttonElt.onmousedown = (e) => e.preventDefault();
  return buttonElt;
}

function getSvg(svg) {
  const svgWrapperElt = strHtml`<div />`;
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}

function enableButton(buttonElt) {
  if (buttonElt.style.cursor !== "pointer") {
    buttonElt.style.cursor = "pointer";
    buttonElt.setAttribute("fill", "var(--window-active-header)");
  }
}

function disableButton(buttonElt) {
  if (buttonElt.style.cursor === "pointer") {
    buttonElt.style.cursor = "auto";
    buttonElt.setAttribute("fill", "var(--window-inactive-header)");
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
