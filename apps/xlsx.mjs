// NOTE: This one is in a serie of 3 apps (docx, pdf, xlsx) which have been
// quickly developed just to have some interesting things when opening common
// (and recognized) formats in the explorer.
// I did not spend any time making them useful nor factorizing code yet for
// those: only good ol' copy-paste of what seemed to work for one of those (as
// all programming should be ;))

export function create(args, env) {
  const { constructAppHeaderLine } = env.appUtils;

  const iframeInfo = {
    isLoaded: false,
    pendingFile: null,
  };

  const containerElt = document.createElement("div");
  containerElt.style.position = "relative";
  containerElt.style.display = "flex";
  containerElt.style.flexDirection = "column";
  containerElt.style.height = "100%";
  containerElt.style.width = "100%";
  containerElt.style.backgroundColor = "var(--window-content-bg)";

  const spinnerContainerElt = document.createElement("div");
  applyStyle(spinnerContainerElt, {
    display: "none",
    position: "absolute",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  });
  const spinnerElt = document.createElement("div");
  spinnerElt.className = "spinner";
  spinnerContainerElt.appendChild(spinnerElt);
  containerElt.appendChild(spinnerContainerElt);

  const { element: headerElt } = constructAppHeaderLine([
    {
      name: "upload",
      onClick: () => {
        containerElt.setAttribute("inert", true);
        spinnerContainerElt.style.display = "flex";

        // Trick to open the file picker
        const fileInputElt = document.createElement("input");
        fileInputElt.type = "file";
        fileInputElt.accept =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileInputElt.multiple = false;
        fileInputElt.click();
        fileInputElt.addEventListener("cancel", () => {
          containerElt.removeAttribute("inert");
          spinnerContainerElt.style.display = "none";
        });
        fileInputElt.addEventListener("change", (e) => {
          const files = e.target.files;
          if (files.length === 0) {
            containerElt.removeAttribute("inert");
            spinnerContainerElt.style.display = "none";
            return;
          }

          // TODO: blocking spinner in the meantime?

          const reader = new FileReader();
          const file = files[0];
          env.updateTitle("📘", file.name + " - PDF Reader (pdf.js)");
          reader.onload = (event) => {
            openFile(file.name, event.target.result);
            containerElt.removeAttribute("inert");
            spinnerContainerElt.style.display = "none";
          };
          reader.readAsArrayBuffer(file);
        });
      },
    },
    {
      name: "open",
      onClick: () => {
        containerElt.setAttribute("inert", true);
        spinnerContainerElt.style.display = "flex";

        // File-picker will reset the i-frame
        // TODO: this doesn't seem natural... Find a better solution?
        iframeInfo.isLoaded = false;
        env
          .filePickerOpen({
            title: "Open a PDF from files stored on this Web Desktop",
            allowMultipleSelections: false,
          })
          .then((files) => {
            if (files.length === 0) {
              containerElt.removeAttribute("inert");
              spinnerContainerElt.style.display = "none";
              return;
            }
            const file = files[0];
            openFile(file.filename, file.data);
            containerElt.removeAttribute("inert");
            spinnerContainerElt.style.display = "none";
          })
          .catch((err) => {
            showMessage(containerElt, "❌ " + err.toString(), 10000);
            containerElt.removeAttribute("inert");
            spinnerContainerElt.style.display = "none";
          });
      },
    },
  ]);
  containerElt.appendChild(headerElt);
  const iframe = document.createElement("iframe");
  iframe.tabIndex = "0";
  iframe.sandbox = "allow-scripts";
  iframe.style.height = "100%";
  iframe.style.width = "100%";
  iframe.style.backgroundColor = "gray";
  iframe.style.border = "0";
  iframe.style.padding = "0";
  iframe.style.margin = "0";
  containerElt.appendChild(iframe);

  iframe.srcdoc = `<html><head>
<style>
table {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: white;
  border-collapse: collapse;
}
td, th {
  border: 1px solid #000;
}
</style>
</head>
<body style="margin: 0; display: flex; justify-content: center">
<script src="https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js"></script>
<script type="module">
onmessage = (e) => {
  if (e.data.type === "open-file") {
    document.body.innerHTML = "";
    const statusElt = document.createElement("p");
    statusElt.style.color = "white";
    statusElt.textContent = "Loading file...";
    document.body.appendChild(statusElt);

    const workbook = XLSX.read(e.data.data, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const html = XLSX.utils.sheet_to_html(worksheet);
    document.body.innerHTML = html;
  }
};

["mousedown", "mouseup", "click", "touchstart", "touchend"].forEach(eventType => {
  document.addEventListener(eventType, function(e) {
    forwardEvent(eventType, e);
  }, true);
});
[].forEach(eventType => {
  document.addEventListener(eventType, function(e) {
    forwardEvent(eventType, e);
  }, true);
});

// Forward mouse and touch events to parent
function forwardEvent(eventType, originalEvent) {
  const eventData = {
    type: "forwarded-event",
    eventType: eventType,
    clientX: originalEvent.clientX,
    clientY: originalEvent.clientY,
    pageX: originalEvent.pageX,
    pageY: originalEvent.pageY,
    button: originalEvent.button,
    buttons: originalEvent.buttons,
    ctrlKey: originalEvent.ctrlKey,
    shiftKey: originalEvent.shiftKey,
    altKey: originalEvent.altKey,
    metaKey: originalEvent.metaKey,
    timestamp: Date.now()
  };

  if (originalEvent.touches) {
    eventData.touches = Array.from(originalEvent.touches).map(touch => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      pageX: touch.pageX,
      pageY: touch.pageY,
      identifier: touch.identifier
    }));
  }
  parent.postMessage(eventData, "*");
}
</script>
</body></html>`;
  iframe.addEventListener("load", () => {
    iframeInfo.isLoaded = true;
    if (iframeInfo.pendingFile) {
      iframe.contentWindow.postMessage(
        {
          type: "open-file",
          data: iframeInfo.pendingFile,
        },
        "*",
      );
      iframeInfo.pendingFile = null;
    }
  });
  window.addEventListener("message", (e) => {
    if (e.source !== iframe.contentWindow) {
      return;
    }
    if (e.data.type === "forwarded-event") {
      handleForwardedEvent(iframe, e.data);
    }
  });
  for (const arg of args) {
    if (arg.type === "file") {
      openFile(arg.filename, arg.data);
      break;
    }
  }
  return { element: containerElt };

  function openFile(name, data) {
    env.updateTitle("📘", name + " - Docx Reader (docx.js)");
    iframeInfo.pendingFile = data;
    if (iframeInfo.isLoaded) {
      // Remnant of older logic:
      // if (iframeInfo.pendingFile !== data) {
      //   return;
      // }
      iframeInfo.pendingFile = null;
      iframe.contentWindow.postMessage(
        {
          type: "open-file",
          data,
        },
        "*",
      );
    }
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
function handleForwardedEvent(iframe, eventData) {
  if (eventData.eventType.startsWith("touch")) {
    iframe.dispatchEvent(
      new TouchEvent(eventData.eventType, {
        bubbles: true,
        cancelable: true,
        touches: eventData.touches || [],
        ctrlKey: eventData.ctrlKey,
        shiftKey: eventData.shiftKey,
        altKey: eventData.altKey,
        metaKey: eventData.metaKey,
      }),
    );
  } else {
    iframe.dispatchEvent(
      new MouseEvent(eventData.eventType, {
        bubbles: true,
        cancelable: true,
        clientX: eventData.clientX,
        clientY: eventData.clientY,
        button: eventData.button,
        buttons: eventData.buttons,
        ctrlKey: eventData.ctrlKey,
        shiftKey: eventData.shiftKey,
        altKey: eventData.altKey,
        metaKey: eventData.metaKey,
      }),
    );
  }
}
