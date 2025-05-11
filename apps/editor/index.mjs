export function create(_args, env) {
  const { applyStyle, constructAppHeaderLine } = env.appUtils;
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

  function createEditor() {
    const editorWrapperElt = document.createElement("div");
    applyStyle(editorWrapperElt, {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    });

    let history = [];
    let historyIndex = -1;
    let lastSavedContent = null;

    const {
      element: headerElt,
      enableButton,
      disableButton,
    } = constructAppHeaderLine({
      undo: { onClick: undo },
      redo: { onClick: redo },
      clear: {
        onClick: () => {
          const hadSomethingWritten = textArea.value;
          statusBar.textContent = "Cleared";
          textArea.value = "";
          disableButton("clear");
          if (hadSomethingWritten) {
            saveState(false);
          }
          updateLineNumbers();
        },
      },
      download: {
        onClick: () => {
          if (typeof window.showSaveFilePicker === "function") {
            saveFile(textArea.value);
          } else {
            const link = document.createElement("a");
            link.download = "notes.txt";
            link.href =
              "data:text/plain;charset=utf-8," +
              encodeURIComponent(textArea.value);
            link.click();
          }
        },
      },
    });
    disableButton("undo");
    disableButton("redo");
    disableButton("clear");

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

    editorWrapperElt.append(headerElt, editorContentElt, statusBar);
    saveState(false);

    let prevLineCount = 0;
    let debouncedTimeout;
    textArea.addEventListener("input", onTextInput);
    textArea.addEventListener("change", onTextInput);
    function onTextInput() {
      statusBar.textContent = "Writing...";
      if (textArea.value === "") {
        disableButton("clear");
      } else {
        enableButton("clear");
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

      disableButton("redo");
      if (historyIndex > 0) {
        enableButton("undo");
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
        enableButton("redo");
      }
      if (historyIndex <= 0) {
        disableButton("undo");
      }
      if (textArea.value === "") {
        disableButton("clear");
      } else {
        enableButton("clear");
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
        enableButton("undo");
      }
      if (historyIndex >= history.length - 1) {
        disableButton("redo");
      }
      if (textArea.value === "") {
        disableButton("clear");
      } else {
        enableButton("clear");
      }
      updateLineNumbers();
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
}
