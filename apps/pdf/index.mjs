// NOTE: This one is in a serie of 3 apps (docx, pdf, xlsx) which have been
// quickly developed just to have some interesting things when opening common
// (and recognized) formats in the explorer.
// I did not spend any time making them useful nor factorizing code yet for
// those: only good ol' copy-paste of what seemed to work for one of those (as
// all programming should be ;))

// For now this is just a very incomplete, unusable thing
// TODO: navigate between page and stuff!
// TODO: zoom

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
  containerElt.style.backgroundColor = env.STYLE.bgColor;

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
        fileInputElt.accept = "application/pdf";
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
          env.updateTitle(
            null /* keep same icon */,
            file.name + " - PDF Reader (pdf.js) 🚧 In construction",
          );
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
            title: "Open a doc(x) from files stored on this Web Desktop",
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
  // TODO: It doesn't work without `allow-same-origin` sadly.
  // We may want to store it in a different domain, as putting both
  // `allow-scripts allow-same-origin` is not functional as it lets
  // the content escape its sandbox where the whole point is to restrict some
  // very specific same-origin features (localStorage access, IndexedDB etc.)
  // iframe.sandbox = "allow-scripts";
  iframe.style.height = "100%";
  iframe.style.width = "100%";
  iframe.style.backgroundColor = "grey";
  iframe.style.border = "0";
  iframe.style.padding = "0";
  iframe.style.margin = "auto";
  containerElt.appendChild(iframe);

  // It's a well-documented fact that syntax highlighting is for losers only
  iframe.srcdoc = `<body style="margin: 0; padding: 7px; display: flex; justify-content: center">
<script type="module">
import * as pdfjsLib from "https://mozilla.github.io/pdf.js/build/pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.mjs";

onmessage = (e) => {
  if (e.data.type === "open-file") {
    document.body.innerHTML = "";
    const statusElt = document.createElement("p");
    statusElt.style.color = "white";
    statusElt.style.padding = "7px";
    statusElt.textContent = "Loading file...";
    document.body.appendChild(statusElt);
    const loadingTask = pdfjsLib.getDocument({ data: e.data.data });
    loadingTask.promise
      .then((result) => {
        result.getPage(1).then(function(page) {
          const canvas = document.createElement("canvas")
          canvas.style.border = "1px solid black";
          canvas.style.boxShadow = "0 -2px 10px rgba(0, 0, 0, 0.3)";
          const context = canvas.getContext('2d');
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          const renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            document.body.innerHTML = "";
            document.body.appendChild(canvas);
            return page.getTextContent();
          })
          .then(function(textContent) {
            const textLayerElt = document.createElement("div");
            textLayerElt.style.position = "absolute";
            textLayerElt.style.left = canvas.offsetLeft + 'px';
            textLayerElt.style.top = canvas.offsetTop + 'px';
            textLayerElt.style.height = canvas.offsetHeight + 'px';
            textLayerElt.style.width = canvas.offsetWidth + 'px';
            document.body.appendChild(textLayerElt);

            // // Worst API documentation of all time
            // // The text is not well-placed, why PDF.js, why?
            // const textLayer = new pdfjsLib.TextLayer({
            //   textContentSource: textContent,
            //   container: textLayerElt,
            //   viewport: viewport
            // });
            // textLayer.render();
          });
        });
        // TODO: communicate back number of pages and shit
      })
      .catch((err) => {
        statusElt.textContent = err.toString();
      });
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
  parent.postMessage(eventData, ${JSON.stringify(window.location.origin)});
}
</script>
</body>`;
  iframe.addEventListener("load", () => {
    iframeInfo.isLoaded = true;
    if (iframeInfo.pendingFile) {
      iframe.contentWindow.postMessage(
        {
          type: "open-file",
          data: iframeInfo.pendingFile,
        },
        window.location.origin,
      );
      iframeInfo.pendingFile = null;
    }
  });
  for (const arg of args) {
    if (arg.type === "file") {
      openFile(arg.filename, arg.data);
      break;
    }
  }
  window.addEventListener("message", (e) => {
    if (e.source !== iframe.contentWindow) {
      return;
    }
    if (e.data.type === "forwarded-event") {
      handleForwardedEvent(iframe, e.data);
    }
  });

  return { element: containerElt };

  function openFile(name, data) {
    env.updateTitle(
      null /* keep same icon */,
      name + " - PDF Reader (pdf.js) 🚧 In construction",
    );
    iframeInfo.pendingFile = data;
    if (iframeInfo.isLoaded) {
      iframeInfo.pendingFile = null;
      iframe.contentWindow.postMessage(
        {
          type: "open-file",
          data,
        },
        window.location.origin,
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
