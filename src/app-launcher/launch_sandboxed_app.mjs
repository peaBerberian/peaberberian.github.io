import { APP_STYLE } from "../constants.mjs";
import { APP_STYLE_SETTINGS, SETTINGS } from "../settings.mjs";
import notificationEmitter from "../components/notification_emitter.mjs";
import {
  addAbortableEventListener,
  applyStyle,
  getErrorApp,
  getSpinnerApp,
  parseAppDefaultBackground,
} from "../utils.mjs";

let appBaseUrl;
let appDomain;
// Some hack to check if a potentially-undefined global is defined.
if (typeof __APP_BASE_URL__ === "string") {
  appBaseUrl = __APP_BASE_URL__;
  appDomain = new URL(appBaseUrl).origin;
} else {
  // Fun hacky part. My desktop is best when there's actual site isolation
  // between the desktop and apps. Due to how the web world works. The most
  // sure way to do that without losing some key other features is just to
  // have apps and desktops on different domains!!
  //
  // So when it's github pages, I use netlify and vice-versa. Yes that's dumb!
  //
  // Doing that cross-domain thing then unlocks parallelization between apps
  // and desktop, ensure apps cannot access what the desktop is doing (which
  // is a feature in my case), and ensure that an app won't hang the whole
  // desktop.
  //
  // Yes that's why I set up two hosts. Yes that's very hacky.
  // Even limiting ourselves to two origins is still not perfect.
  //
  // I guess in a perfect world, the best thing would be to have uuid-based
  // first level domain e.g. `https://3dbc07c7.desktop.com`.
  // But the free solutions don't do that for now.
  if (location.href.startsWith("https://peaberberian.github.io")) {
    appBaseUrl = "https://paulswebdesktop.netlify.app";
    appDomain = appBaseUrl;
  } else if (location.href.startsWith("https://paulswebdesktop.netlify.app")) {
    appBaseUrl = "https://peaberberian.github.io";
    appDomain = appBaseUrl;
  } else {
    appBaseUrl = ".";
    appDomain = window.location.origin;
  }
}

/**
 * Launch an application from its external script's URL inside a "sandboxed"
 * iframe, which will preferably be (depending on capacity in the current
 * environment) in another domain.
 * @param {Object} appData
 * @param {string} [appData.defaultBackground] - If set, this is the property
 * of `APP_STYLE` that correspond to the color that should be set while the
 * application is loading.
 * @param {string} appData.lazyLoad - URL to the script implementing this
 * application. It will be loaded in an iframe.
 * @param {Array.<Object>} appArgs - The arguments that should be communicated
 * to the application when launching it.
 * @param {Object} env - The `env` object providing some desktop context and
 * API to applications.
 * @param {AbortSignal} abortSignal - `AbortSignal` which triggers when the
 * application is closed.
 * @returns {Object} - Application object.
 */
export function launchSandboxedApp(appData, appArgs, env, abortSignal) {
  let isIframeLoaded = false;
  let isActivated = true;
  const backgroundColor = parseAppDefaultBackground(appData.defaultBackground);
  const wrapperElt = document.createElement("div");
  applyStyle(wrapperElt, {
    position: "relative",
    height: "100%",
    width: "100%",
  });
  const spinnerElt = getSpinnerApp(backgroundColor);
  wrapperElt.appendChild(spinnerElt.element);

  const iframe = document.createElement("iframe");

  iframe.tabIndex = "0";
  iframe.style.height = "100%";
  iframe.style.width = "100%";
  iframe.style.backgroundColor = backgroundColor;
  iframe.style.border = "0";
  iframe.style.padding = "0";
  iframe.style.margin = "0";
  iframe.style.overflow = "hidden";
  iframe.style.display = "none";
  iframe.src = appBaseUrl + "/sandbox.html";

  wrapperElt.appendChild(iframe);

  // TODO: when it loads multiple times
  iframe.addEventListener("load", () => {
    sendSettingsToIframe(iframe, abortSignal);
    processEventsFromIframe(
      iframe,
      env,
      () => {
        iframe.style.display = "block";
        spinnerElt.onClose();
        try {
          wrapperElt.removeChild(spinnerElt.element);
        } catch (err) {}
        if (isActivated) {
          iframe.contentWindow?.postMessage(
            {
              type: "__pwd__activate",
              data: null,
            },
            appDomain,
          );
        }
      },
      (err) => {
        try {
          iframe.remove();
          spinnerElt.onClose();
          wrapperElt.removeChild(spinnerElt.element);
        } catch (err) {}
        wrapperElt.appendChild(getErrorApp(err));
      },
      abortSignal,
    );
    iframe.contentWindow.postMessage(
      {
        type: "__pwd__run-app",
        data: {
          scriptUrl: appData.lazyLoad,
          args: appArgs,
          desktopOrigin: window.location.origin,
          dependencies: appData.dependencies,
        },
      },
      appDomain,
    );
    isIframeLoaded = true;
  });
  redirectKeyDownEvents();

  // NOTE: removing the iframe should be unneeded on close and it just creates
  // a weird visual effect where the iframe disappear before the window close
  // animation finishes
  // abortSignal.addEventListener("abort", () => {
  //   iframe.remove();
  // });

  return {
    element: wrapperElt,
    onActivate: () => {
      isActivated = true;
      if (!isIframeLoaded) {
        return;
      }
      if (!iframe.contains(document.activeElement)) {
        iframe.focus();
      }
      iframe.contentWindow?.postMessage(
        {
          type: "__pwd__activate",
          data: null,
        },
        appDomain,
      );
    },

    onDeactivate: () => {
      isActivated = false;
      if (!isIframeLoaded) {
        return;
      }
      if (iframe.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      iframe.contentWindow.postMessage(
        {
          type: "__pwd__deactivate",
          data: null,
        },
        appDomain,
      );
    },

    onClose: () => {
      if (!isIframeLoaded) {
        return;
      }
      if (iframe.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      iframe.contentWindow?.postMessage(
        {
          type: "__pwd__close",
          data: null,
        },
        appDomain,
      );
    },
  };

  function redirectKeyDownEvents() {
    ["keydown", "keyup"].forEach((eventName) => {
      addAbortableEventListener(
        document,
        eventName,
        abortSignal,
        function (event) {
          if (!isActivated || !iframe.contentWindow) {
            return;
          }
          iframe.contentWindow.postMessage(
            {
              type: "__pwd__" + eventName,
              key: event.key,
              code: event.code,
              keyCode: event.keyCode,
              ctrlKey: event.ctrlKey,
              shiftKey: event.shiftKey,
              altKey: event.altKey,
              metaKey: event.metaKey,
            },
            appDomain,
          );
        },
      );
    });
  }
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

function sendSettingsToIframe(iframe, abortSignal) {
  if (abortSignal.aborted) {
    return;
  }

  // TODO: more efficient for initial?
  Object.keys(APP_STYLE_SETTINGS).forEach((key) => {
    APP_STYLE_SETTINGS[key].onUpdate(
      (newVal) => {
        iframe.contentWindow.postMessage(
          {
            type: "__pwd__update-style",
            data: {
              vars: [
                {
                  name: key,
                  cssName: APP_STYLE[key].cssName,
                  value: newVal,
                },
              ],
            },
          },
          appDomain,
        );
      },
      { clearSignal: abortSignal, emitCurrentValue: true },
    );
  });
  SETTINGS.sidebarFormat.onUpdate(
    (format) => {
      iframe.contentWindow.postMessage(
        {
          type: "__pwd__sidebar-format-update",
          data: format,
        },
        appDomain,
      );
    },
    { clearSignal: abortSignal, emitCurrentValue: true },
  );
  SETTINGS.showIframeBlockerHelp.onUpdate(
    (shouldShow) => {
      iframe.src = appBaseUrl + "/sandbox.html";
      iframe.contentWindow.postMessage(
        {
          type: "__pwd__show-iframe-blocker",
          data: shouldShow,
        },
        appDomain,
      );
    },
    { clearSignal: abortSignal, emitCurrentValue: true },
  );
}

function processEventsFromIframe(iframe, cbs, resolve, reject, abortSignal) {
  if (abortSignal.aborted) {
    return;
  }
  addAbortableEventListener(window, "message", abortSignal, (e) => {
    if (e.source !== iframe.contentWindow) {
      return;
    }
    switch (e.data.type) {
      case "__pwd__forwarded-event":
        // TODO: check correctness of forwarded event?
        handleForwardedEvent(iframe, e.data);
        break;

      case "__pwd__update-title":
        checkUpdateTitleMessageData(e.data);
        cbs.updateTitle(e.data.icon, e.data.title);
        break;

      case "__pwd__close-app":
        cbs.closeApp();
        break;

      case "__pwd__filePickerOpen":
        if (typeof e.data.requestId !== "string") {
          throw new Error("No requestId for a filePickerOpen");
        }
        checkFilePickerOpenMessageData(e.data.data);
        handleAsyncResponse(
          cbs.filePickerOpen({
            title: e.data.data.title,
            baseDirectory: e.data.data.baseDirectory,
            allowMultipleSelections: e.data.data.allowMultipleSelections,
            confirmValue: e.data.data.confirmValue,
          }),
          e.data.type,
          e.data.requestId,
        );
        break;

      case "__pwd__filePickerSave":
        if (typeof e.data.requestId !== "string") {
          throw new Error("No requestId for a filePickerSave");
        }
        checkFilePickerSaveMessageData(e.data.data);
        handleAsyncResponse(
          cbs.filePickerSave({
            title: e.data.data.title,
            baseDirectory: e.data.data.baseDirectory,
            savedFileName: e.data.data.savedFileName,
            savedFileData: e.data.data.savedFileData,
            confirmValue: e.data.data.confirmValue,
          }),
          e.data.type,
          e.data.requestId,
        );
        break;

      case "__pwd__quickSave":
        if (typeof e.data.requestId !== "string") {
          throw new Error("No requestId for a quickSave");
        }
        checkQuickSaveMessageData(e.data.data);
        handleAsyncResponse(
          cbs.quickSave(e.data.data.handle, e.data.data.data),
          e.data.type,
          e.data.requestId,
        );
        break;

      case "__pwd__notification": {
        const data = e.data.data;
        checkNotificationMessageData(data);
        notificationEmitter[data.type](data.title, data.message, data.duration);
        break;
      }

      case "__pwd__loaded":
        resolve();
        break;

      case "__pwd__error": {
        const data = e.data.data;
        checkErrorMessageData(data);
        const error = new Error(data.message);
        if (data.name !== undefined) {
          error.name = data.name;
        }
        reject(error);
        break;
      }
    }
  });

  function handleAsyncResponse(operationProm, type, requestId) {
    operationProm
      .then((val) => {
        iframe.contentWindow?.postMessage(
          {
            type,
            requestId,
            success: true,
            data: val,
          },
          appDomain,
        );
      })
      .catch((err) => {
        iframe.contentWindow?.postMessage(
          {
            type,
            requestId,
            success: false,
            data: {
              name: err.name,
              message: err.message,
            },
          },
          appDomain,
        );
      });
  }
}

function checkErrorMessageData(data) {
  if (
    typeof data !== "object" ||
    data === null ||
    (typeof data.name !== "string" && data.name !== undefined) ||
    typeof data.message !== "string"
  ) {
    throw new Error("Cannot update title: wrong data format");
  }
}

function checkUpdateTitleMessageData(data) {
  if (
    typeof data !== "object" ||
    data === null ||
    (typeof data.icon !== "string" && data.icon !== undefined) ||
    typeof data.title !== "string"
  ) {
    throw new Error("Cannot update title: wrong data format");
  }
}

function checkFilePickerOpenMessageData(data) {
  if (
    typeof data !== "object" ||
    data === null ||
    (typeof data.title !== "string" && data.title !== undefined) ||
    (typeof data.baseDirectory !== "string" &&
      data.baseDirectory !== undefined) ||
    (typeof data.allowMultipleSelections !== "boolean" &&
      data.allowMultipleSelections !== undefined) ||
    (typeof data.confirmValue !== "string" && data.confirmValue !== undefined)
  ) {
    throw new Error("Cannot spawn filePickerOpen: wrong data format");
  }
}

function checkFilePickerSaveMessageData(data) {
  if (
    typeof data !== "object" ||
    data === null ||
    (typeof data.title !== "string" && data.title !== undefined) ||
    (typeof data.baseDirectory !== "string" &&
      data.baseDirectory !== undefined) ||
    (typeof data.savedFileName !== "string" &&
      data.savedFileName !== undefined) ||
    (typeof data.confirmValue !== "string" && data.confirmValue !== undefined)
  ) {
    throw new Error("Cannot spawn filePickerSave: wrong data format");
  }
  if (
    typeof data.savedFileData !== "string" &&
    !(data.savedFileData instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(data.savedFileData)
  ) {
    throw new Error(
      "Cannot spawn filePickerSave: saved file data is in the wrong type",
    );
  }
}

function checkQuickSaveMessageData(data) {
  if (
    typeof data !== "object" ||
    data === null ||
    typeof data.handle !== "string"
  ) {
    throw new Error("Cannot spawn filePickerSave: wrong data format");
  }
  if (
    typeof data.data !== "string" &&
    !(data.data instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(value)
  ) {
    throw new Error(
      "Cannot spawn filePickerSave: saved file data is in the wrong type",
    );
  }
}

function checkNotificationMessageData(data) {
  if (
    typeof data !== "object" ||
    data === null ||
    !["success", "error", "warning", "info"].includes(data.type)(
      typeof data.baseDirectory !== "string" &&
        data.baseDirectory !== undefined,
    ) ||
    typeof data.title !== "string" ||
    typeof data.message !== "string" ||
    (typeof data.duration !== "number" && data.duration !== undefined)
  ) {
    throw new Error("Cannot add notification: wrong data format");
  }
}
