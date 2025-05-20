const textDecoder = new TextDecoder();

// We might do more when put in a sandboxed i-frame?
const MAX_FILE_MB = 2;

export function create(args, env) {
  const { constructAppHeaderLine } = env.appUtils;
  const containerElt = document.createElement("div");

  let currentFileHandle = null;
  let currentFilename = null;
  let history = [];
  let historyIndex = -1;
  let lastSavedContent = null;

  applyStyle(containerElt, {
    position: "relative",
    height: "100%",
    overflow: "hidden",
    width: "100%",
  });

  const spinnerContainerElt = createSpinnerElt();
  containerElt.appendChild(spinnerContainerElt);

  const editorWrapperElt = document.createElement("div");
  applyStyle(editorWrapperElt, {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  });
  const {
    element: headerElt,
    enableButton,
    disableButton,
  } = constructAppHeaderLine([
    { name: "upload", onClick: onUploadClick },
    // To still work as expected just in case the app is "installed" without the
    // `filePickerOpen` dependency enabled, just remove the button when it's not
    // possible.
    ...(env.filePickerOpen ? [{ name: "open", onClick: onOpenClick }] : []),
    { name: "separator" },
    { name: "undo", onClick: undo },
    { name: "redo", onClick: redo },
    {
      name: "clear",
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
    { name: "separator" },
    {
      name: "download",
      onClick: () => {
        if (typeof window.showSaveFilePicker === "function") {
          downloadFile(textArea.value);
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
    ...(env.quickSave ? [{ name: "quick-save", onClick: quickSave }] : []),
    ...(env.filePickerSave ? [{ name: "save", onClick: saveFile }] : []),
  ]);
  disableButton("undo");
  disableButton("redo");
  disableButton("clear");
  disableButton("quick-save");

  const editorContentElt = document.createElement("div");
  editorContentElt.style.position = "relative";
  editorContentElt.style.display = "flex";
  editorContentElt.style.flex = "1";
  editorContentElt.style.overflow = "hidden";

  const linesElt = document.createElement("pre");
  applyStyle(linesElt, {
    backgroundColor: env.STYLE.bgColor,
    color: env.STYLE.textColor,
    minWidth: "40px",
    overflow: "hidden",
    textAlign: "right",
    padding: "8px 4px",
    fontFamily: "monospace",
    borderRight: "2px solid " + env.STYLE.lineColor,
    userSelect: "none",
  });

  const textArea = document.createElement("textarea");
  applyStyle(textArea, {
    flex: "1",
    backgroundColor: env.STYLE.bgColor,
    color: env.STYLE.textColor,
    border: "none",
    outline: "none",
    padding: "8px",
    resize: "none",
    fontFamily: "monospace",
    fontSize: env.STYLE.fontSize,
    whiteSpace: "pre",
    overflow: "auto",
  });
  editorContentElt.appendChild(linesElt);
  editorContentElt.appendChild(textArea);

  const statusBar = document.createElement("div");
  applyStyle(statusBar, {
    backgroundColor: env.STYLE.barBg,
    borderTop: "1px solid " + env.STYLE.lineColor,
    padding: "4px",
    bottom: "0",
    width: "100%",
    fontSize: env.STYLE.fontSize,
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

  for (const opt of args) {
    if (opt.type === "file") {
      loadFile(opt);
      break;
    }
  }

  containerElt.appendChild(editorWrapperElt);

  return {
    element: containerElt,
    onActivate: () => {
      document.addEventListener("keydown", onKeyDown);
      textArea.focus({ preventScroll: true });
    },
    onDeactivate: () => {
      document.removeEventListener("keydown", onKeyDown);
    },
  };

  function loadFile(file) {
    try {
      const data = textDecoder.decode(file.data);
      textArea.value = data;
    } catch (err) {
      showMessage(
        editorContentElt,
        "❌ Failed to load file:" + err.toString(),
        7000,
      );
      return;
    }
    textArea.scrollTo(0, 0);
    currentFileHandle = file.handle ?? null;
    history.length = 0;
    historyIndex = -1;
    lastSavedContent = null;
    updateFilename(file.filename);
    updateLineNumbers();
    saveState(false);
    disableButton("undo");
    disableButton("redo");
    disableButton("clear");
    disableButton("quick-save");
  }

  function clearAndRestart() {
    unblockUi();
    statusBar.textContent = "Ready";
    textArea.value = "";
    history.length = 0;
    historyIndex = -1;
    lastSavedContent = null;
    updateFilename(null);
    disableButton("undo");
    disableButton("redo");
    disableButton("clear");
    disableButton("quick-save");
    textArea.scrollTo(0, 0);
    updateLineNumbers();
    saveState(false);
  }

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
    if (currentFileHandle) {
      enableButton("quick-save");
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
    if (currentFileHandle) {
      enableButton("quick-save");
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
    if (currentFileHandle) {
      enableButton("quick-save");
    }
    updateLineNumbers();
  }

  async function downloadFile(content) {
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

  function updateFilename(name) {
    if (name == null) {
      currentFilename = null;
      env.updateTitle(null /* keep same icon */, "Notes");
    } else {
      currentFilename = name;
      env.updateTitle(
        null /* keep same icon */,
        String(name) + " - " + "Notes",
      );
    }
  }

  async function saveFile() {
    blockUi();
    statusBar.textContent = "Saving file...";
    try {
      const textEncoder = new TextEncoder();
      const savedFileData = textEncoder.encode(textArea.value).buffer;
      const saveData = await env.filePickerSave({
        title: "Choose where to save your (beautiful) note",
        savedFileData,
        savedFileName: currentFilename ?? "new_note.txt",
      });
      if (!saveData) {
        unblockUi();
        statusBar.textContent = "Ready";
        return;
      }
      currentFileHandle = saveData?.handle ?? null;
      unblockUi();
      statusBar.textContent = "Ready";
      if (!saveData) {
        disableButton("quick-save");
        return;
      }
      updateFilename(saveData.filename);
    } catch (err) {
      unblockUi();
      statusBar.textContent = "Ready";
      showMessage(editorContentElt, "❌ " + err.toString(), 7000);
    }
    disableButton("quick-save");
  }

  async function quickSave() {
    if (!currentFileHandle) {
      showMessage(
        editorContentElt,
        `❌ Cannot quick save: unknown file path.`,
        5000,
      );
      return;
    }
    statusBar.textContent = "Saving file...";
    try {
      const textEncoder = new TextEncoder();
      const savedFileData = textEncoder.encode(textArea.value).buffer;
      await env.quickSave(currentFileHandle, savedFileData);
      disableButton("quick-save");
      statusBar.textContent = "Ready";
    } catch (err) {
      statusBar.textContent = "Ready";
      showMessage(editorContentElt, "❌ " + err.toString(), 7000);
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyDown(e) {
    switch (e.key) {
      case "S":
      case "s":
        if (e.ctrlKey) {
          e.preventDefault();
          if (currentFileHandle) {
            quickSave();
          } else if (env.filePickerSave) {
            saveFile();
          }
        }
        break;

      case "Z":
      case "z":
        if (e.ctrlKey) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;

      case "Y":
      case "y":
        if (e.ctrlKey) {
          e.preventDefault();
          redo();
        }
        break;
    }
  }

  function blockUi() {
    spinnerContainerElt.style.display = "flex";
    containerElt.style.opacity = 0.5;
    containerElt.setAttribute("inert", true);
  }
  function unblockUi() {
    spinnerContainerElt.style.display = "none";
    containerElt.style.opacity = 1;
    containerElt.removeAttribute("inert");
  }

  function onUploadClick() {
    blockUi();
    statusBar.textContent = "Loading file...";

    // Trick to open the file picker
    const fileInputElt = document.createElement("input");
    fileInputElt.type = "file";
    fileInputElt.accept = "text/plain";
    fileInputElt.multiple = false;
    fileInputElt.click();
    fileInputElt.addEventListener("cancel", async () => {
      unblockUi();
      statusBar.textContent = "Ready";
    });
    fileInputElt.addEventListener("error", async () => {
      unblockUi();
      showMessage(editorContentElt, "❌ Failed to open your file-picker", 5000);
    });
    fileInputElt.addEventListener("change", async (e) => {
      const files = e.target.files;
      if (files.length === 0) {
        clearAndRestart();
        return;
      }
      try {
        if (files[0].size > MAX_FILE_MB * 1000000) {
          clearAndRestart();
          showMessage(
            editorContentElt,
            `❌ File too big, there's a limit for now to ${MAX_FILE_MB} MB maximum.`,
            7000,
          );
          return;
        }
        const data = await files[0].arrayBuffer();
        if (data.byteLength > MAX_FILE_MB * 1000000) {
          clearAndRestart();
          showMessage(
            editorContentElt,
            `❌ File too big, there's a limit for now to ${MAX_FILE_MB} MB maximum.`,
            7000,
          );
          return;
        }
        loadFile({ data, filename: files[0].name });
      } catch (err) {
        clearAndRestart();
        showMessage(editorContentElt, "❌ " + err.toString(), 7000);
      }
      unblockUi();
      statusBar.textContent = "Ready";
      lastSavedContent = null;
      saveState(false);
    });
  }
  function onOpenClick() {
    blockUi();
    statusBar.textContent = "Loading file...";
    env
      .filePickerOpen({
        title: "Open a text file stored on this Web Desktop",
        allowMultipleSelections: false,
      })
      .then(
        (files) => {
          if (files.length === 0) {
            clearAndRestart();
            return;
          }
          if (files[0].data.byteLength > MAX_FILE_MB * 1000000) {
            clearAndRestart();
            showMessage(
              editorContentElt,
              `❌ File too big, there's a limit for now to ${MAX_FILE_MB} MB maximum.`,
              7000,
            );
            return;
          }
          try {
            loadFile(files[0]);
          } catch (err) {
            clearAndRestart();
            showMessage(editorContentElt, "❌ " + err.toString(), 7000);
          }
          unblockUi();
          statusBar.textContent = "Ready";
          lastSavedContent = null;
          saveState(false);
        },
        (err) => {
          clearAndRestart();
          showMessage(editorContentElt, "❌ " + err.toString(), 7000);
        },
      );
  }
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

function showMessage(containerElt, message, duration = 5000) {
  const messageElt = document.createElement("div");
  messageElt.textContent = message;
  applyStyle(messageElt, {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "4px",
    zIndex: "1000",
    transition: "opacity 0.3s",
    textAlign: "center",
  });

  containerElt.appendChild(messageElt);

  setTimeout(() => {
    messageElt.style.opacity = "0";
    // After animation, remove
    setTimeout(() => {
      messageElt.remove();
    }, 350);
  }, duration);
}

function createSpinnerElt() {
  const spinnerContainerElt = document.createElement("div");
  applyStyle(spinnerContainerElt, {
    display: "none",
    position: "absolute",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
  });
  const spinnerElt = document.createElement("div");
  spinnerElt.className = "spinner";
  spinnerContainerElt.appendChild(spinnerElt);
  return spinnerContainerElt;
}
