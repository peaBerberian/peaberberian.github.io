import { APP_STYLE, SETTINGS } from "../settings.mjs";
import { addAbortableEventListener } from "../utils.mjs";

/**
 * Some hack to check if a global is defined.
 */
const appBaseUrl =
  typeof __APP_BASE_URL__ === "string" ? __APP_BASE_URL__ : ".";

export function launchSandboxedApp(scriptUrl, appArgs, env, abortSignal) {
  let isInitiallyActivated = true;
  const iframe = document.createElement("iframe");
  iframe.tabIndex = "0";
  // iframe.sandbox = "allow-scripts";
  iframe.style.height = "100%";
  iframe.style.width = "100%";

  // TODO: loadingBackgroundColor appInfo?
  iframe.style.backgroundColor = env.STYLE.bgColor;
  iframe.style.border = "0";
  iframe.style.padding = "0";
  iframe.style.margin = "0";
  iframe.src = appBaseUrl + "/app.html";

  iframe.addEventListener("load", () => {
    sendSettingsToIframe(iframe, abortSignal);
    processEventsFromIframe(iframe, env, abortSignal);
    iframe.contentWindow.postMessage(
      {
        type: "__pwd__run-app",
        data: {
          scriptUrl,
          args: appArgs,
          activate: isInitiallyActivated,
        },
      },
      "*",
    );
  });

  // NOTE: removing the iframe should be unneeded on close and it just creates
  // a weird visual effect where the iframe disappear before the window close
  // animation finishes
  // abortSignal.addEventListener("abort", () => {
  //   iframe.remove();
  // });

  return {
    element: iframe,
    onActivate: () => {
      if (!iframe.contentWindow) {
        isInitiallyActivated = true;
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
      if (!iframe.contentWindow) {
        isInitiallyActivated = false;
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

function processEventsFromIframe(iframe, cbs, abortSignal) {
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
    }
  });
}
