import { APP_STYLE, SETTINGS } from "../settings.mjs";
import {
  addAbortableEventListener,
  applyStyle,
  getErrorApp,
  getSpinnerApp,
} from "../utils.mjs";

let appBaseUrl;
// Some hack to check if a potentially-undefined global is defined.
if (typeof __APP_BASE_URL__ === "string") {
  appBaseUrl = __APP_BASE_URL__;
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
  } else if (location.href.startsWith("https://paulswebdesktop.netlify.app")) {
    appBaseUrl = "https://peaberberian.github.io";
  } else {
    appBaseUrl = ".";
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
  let isActivated = true;
  const backgroundColor = appData.defaultBackground
    ? (APP_STYLE[appData.defaultBackground]?.cssProp ??
      APP_STYLE.bgColor.cssProp)
    : APP_STYLE.bgColor.cssProp;
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
  iframe.src = appBaseUrl + "/app.html";
  iframe.style.display = "none";

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
        wrapperElt.removeChild(spinnerElt.element);
        if (isActivated) {
          iframe.contentWindow?.postMessage(
            {
              type: "__pwd__activate",
              data: null,
            },
            "*",
          );
        }
      },
      (err) => {
        iframe.remove();
        spinnerElt.onClose();
        wrapperElt.removeChild(spinnerElt.element);
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
        },
      },
      "*",
    );
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
      if (!iframe.contentWindow) {
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
        "*",
      );
    },

    onDeactivate: () => {
      isActivated = false;
      if (!iframe.contentWindow) {
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
        "*",
      );
    },

    onClose: () => {
      if (iframe.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      iframe.contentWindow?.postMessage(
        {
          type: "__pwd__close",
          data: null,
        },
        "*",
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
            "*",
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
  Object.keys(APP_STYLE).forEach((key) => {
    APP_STYLE[key].ref.onUpdate(
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
          "*",
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
        "*",
      );
    },
    { clearSignal: abortSignal, emitCurrentValue: true },
  );
  SETTINGS.showIframeBlockerHelp.onUpdate(
    (shouldShow) => {
      iframe.contentWindow.postMessage(
        {
          type: "__pwd__show-iframe-blocker",
          data: shouldShow,
        },
        "*",
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
        handleForwardedEvent(iframe, e.data);
        break;

      case "__pwd__update-title":
        cbs.updateTitle(e.data.data.icon, e.data.data.title);
        break;

      case "__pwd__close-app":
        cbs.closeApp();
        break;

      case "__pwd__loaded":
        resolve();
        break;

      case "__pwd__error": {
        const error = new Error(e.data.data.message);
        error.name = e.data.data.name;
        reject(error);
        break;
      }
    }
  });
}
