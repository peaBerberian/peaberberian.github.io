/**
 * This script's intent is to provide the base script for applications
 * loaded in an iframe.
 *
 * It is bundled independently and integrated to all app iframe *before* the
 * actual app is dynamically loaded.
 *
 * It takes care of app management inside that iframe.
 */

import { IMAGE_ROOT_PATH, __VERSION__ } from "../constants.mjs";
import { applyStyle, idGenerator } from "../utils.mjs";
import { getAppUtils } from "./app-utils.mjs";
import { constructAppWithSidebar } from "./sidebar.mjs";

/**
 * CSS variables as they will be communicated to the app under the `STYLE`
 * environment variable.
 * Received from the parent.
 * @type {Object.<string, string>}
 */
const STYLE = {};

/**
 * Allows to generate unique string identifiers.
 * @type {function(): string}
 */
const generateNewId = idGenerator();

/**
 * Some operations require a round trip to the desktop.
 *
 * This object stores metadata about those pending operations.
 * @type {Map<string, PendingRequest>}
 */
const pendingRequests = new Map();

/**
 * HTMLElement that will contain the application
 * @type {HTMLDivElement}
 */
const appWrapperElt = document.createElement("div");
appWrapperElt.className = "sandbox";
applyStyle(appWrapperElt, {
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  overflow: "hidden",
});
document.body.appendChild(appWrapperElt);

/**
 * `AbortController` linked to the currently running app.
 * `null` if there's no app running at the moment.
 * @type {AbortController|null}
 */
let appAbortCtrl = null;

/**
 * Origin indicated by the desktop when asking to run an app.
 * All subsequent messages should all come from this origin and all messages
 * should be sent to it.
 * @type {string|undefined}
 */
let desktopOrigin;

/**
 * If `true`, the app is currently "activated".
 *
 * If `false`, it is not.
 * Used to track activation even when the app is not yet loaded.
 * @type {Boolean}
 */
let isAppInFocus = false;

/**
 * App callback to call when the application is activated/focused.
 * @type {Function|undefined}
 */
let onActivate;
/**
 * App callback to call when the application is deactivated/unfocused.
 * @type {Function|undefined}
 */
let onDeactivate;
/**
 * App callback to call when the application is closed.
 * @type {Function|undefined}
 */
let onClose;

const appEnv = {
  appUtils: getAppUtils(),
  getImageRootPath: () => IMAGE_ROOT_PATH,
  getVersion: () => __VERSION__,
  updateTitle: (icon, title) => {
    parent.postMessage(
      {
        type: "__pwd__update-title",
        data: { icon: icon ?? undefined, title },
      },
      desktopOrigin ?? "*",
    );
  },
  closeApp: () =>
    parent.postMessage(
      {
        type: "__pwd__close-app",
        data: null,
      },
      desktopOrigin ?? "*",
    ),
  STYLE,
};

// The script might do prototype pollution.
// Just in case store `stopImmediatePropagation` before the application had the
// chance to redefine it.
const originalStopImmediatePropagation =
  Event.prototype.stopImmediatePropagation;

window.addEventListener(
  "message",
  (e) => {
    if (desktopOrigin && e.origin !== desktopOrigin) {
      return;
    }
    switch (e.data.type) {
      case "__pwd__sidebar-format-update": {
        originalStopImmediatePropagation.call(e);
        if (e.data.data === "top") {
          document.body.classList.add("w-sidebar-top");
        } else {
          document.body.classList.remove("w-sidebar-top");
        }
        break;
      }

      case "__pwd__update-style": {
        originalStopImmediatePropagation.call(e);
        e.data.data.vars.forEach((v) => {
          STYLE[v.name] = "var(" + v.cssName + ")";
          document.documentElement.style.setProperty(
            v.cssName,
            v.value + (v.cssName.endsWith("-size") ? "px" : ""),
          );
        });
        break;
      }

      case "__pwd__show-iframe-blocker": {
        originalStopImmediatePropagation.call(e);
        if (e.data.data) {
          document.body.classList.remove("transparent-i-frame-top");
        } else {
          document.body.classList.add("transparent-i-frame-top");
        }
        break;
      }

      case "__pwd__run-app":
        originalStopImmediatePropagation.call(e);
        // TODO: Also have id communicated just in case desktop initialize
        // multiple times?
        startApp(e.data.data);
        break;

      case "__pwd__activate":
        originalStopImmediatePropagation.call(e);
        if (isAppInFocus) {
          return;
        }
        isAppInFocus = true;
        appWrapperElt.classList.add("active");
        onActivate?.();
        break;

      case "__pwd__deactivate":
        originalStopImmediatePropagation.call(e);
        if (!isAppInFocus) {
          return;
        }
        isAppInFocus = false;
        appWrapperElt.classList.remove("active");
        onDeactivate?.();
        break;

      case "__pwd__close":
        originalStopImmediatePropagation.call(e);
        isAppInFocus = false;
        appWrapperElt.classList.remove("active");
        onClose?.();
        break;

      case "__pwd__filePickerSave": {
        originalStopImmediatePropagation.call(e);
        const requestId = e.data.requestId;
        const requestObj = pendingRequests.get(requestId);
        pendingRequests.delete(requestId);
        if (!requestObj) {
          console.warn(
            "Received response for an unknown filePickerSave operation",
          );
          return;
        }
        if (requestObj.type !== "__pwd__filePickerSave") {
          console.error(
            "filePickerSave response for a non-filePickerSave operation.",
          );
          return;
        }
        if (e.data.success) {
          if (e.data.data) {
            requestObj.resolve({
              filename: e.data.data.filename,
              filePath: e.data.data.filePath ?? null,
              handle: e.data.data.handle,
            });
          } else {
            requestObj.resolve(null);
          }
        } else {
          const error = new Error(e.data.data.message);
          if (e.data.data.name !== undefined) {
            error.name = e.data.data.name;
          }
          requestObj.reject(error);
        }
        break;
      }

      case "__pwd__filePickerOpen": {
        originalStopImmediatePropagation.call(e);
        const requestId = e.data.requestId;
        const requestObj = pendingRequests.get(requestId);
        pendingRequests.delete(requestId);
        if (!requestObj) {
          console.warn(
            "Received response for an unknown filePickerOpen operation",
          );
          return;
        }
        if (requestObj.type !== "__pwd__filePickerOpen") {
          console.error(
            "filePickerOpen response for a non-filePickerOpen operation.",
          );
          return;
        }
        if (e.data.success) {
          requestObj.resolve(
            e.data.data.map((f) => {
              return {
                filename: f.filename,
                filePath: f.filePath ?? null,
                handle: f.handle,
                data: f.data,
              };
            }),
          );
        } else {
          const error = new Error(e.data.data.message);
          if (e.data.data.name !== undefined) {
            error.name = e.data.data.name;
          }
          requestObj.reject(error);
        }
        break;
      }

      case "__pwd__quickSave": {
        originalStopImmediatePropagation.call(e);
        const requestId = e.data.requestId;
        const requestObj = pendingRequests.get(requestId);
        pendingRequests.delete(requestId);
        if (!requestObj) {
          console.warn("Received response for an unknown quickSave operation");
          return;
        }
        if (requestObj.type !== "__pwd__quickSave") {
          console.error("quickSave response for a non-quickSave operation.");
          return;
        }
        if (e.data.success) {
          requestObj.resolve();
        } else {
          const error = new Error(e.data.data.message);
          if (e.data.data.name !== undefined) {
            error.name = e.data.data.name;
          }
          requestObj.reject(error);
        }
        break;
      }

      case "__pwd__keyup":
      case "__pwd__keydown": {
        const syntheticEvent = new KeyboardEvent(e.data.type.substring(7), {
          key: e.data.key,
          code: e.data.code,
          keyCode: e.data.keyCode,
          ctrlKey: e.data.ctrlKey,
          shiftKey: e.data.shiftKey,
          altKey: e.data.altKey,
          metaKey: e.data.metaKey,
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(syntheticEvent);
      }
    }
  },
  true,
);

function startApp(data) {
  appAbortCtrl?.abort(); // Abort previous app if one
  appAbortCtrl = new AbortController();

  isAppInFocus = data.activate;
  if (isAppInFocus) {
    appWrapperElt.classList.add("active");
  } else {
    appWrapperElt.classList.remove("active");
  }
  desktopOrigin = data.desktopOrigin;

  data.dependencies = data.dependencies ?? [];

  if (data.dependencies.includes("notificationEmitter")) {
    appEnv.notificationEmitter = ["success", "error", "warning", "info"].reduce(
      (acc, typ) => {
        acc[typ] = (title, message, duration) => {
          parent.postMessage(
            {
              type: "__pwd__notif",
              data: { title, message, duration, type: typ },
            },
            desktopOrigin ?? "*",
          );
        };
      },
      {},
    );
  } else {
    appEnv.notificationEmitter = null;
  }

  appEnv.filePickerSave = data.dependencies.includes("filePickerSave")
    ? (config) => {
        return new Promise((resolve, reject) => {
          const requestId = generateNewId();
          try {
            parent.postMessage(
              {
                type: "__pwd__filePickerSave",
                requestId,
                data: config,
              },
              desktopOrigin ?? "*",
            );
          } catch (err) {
            reject(err);
            return;
          }
          pendingRequests.set(requestId, {
            requestId,
            type: "__pwd__filePickerSave",
            resolve,
            reject,
          });
        });
      }
    : null;

  appEnv.filePickerOpen = data.dependencies.includes("filePickerOpen")
    ? (config) => {
        return new Promise((resolve, reject) => {
          const requestId = generateNewId();
          try {
            parent.postMessage(
              {
                type: "__pwd__filePickerOpen",
                requestId,
                data: config,
              },
              desktopOrigin ?? "*",
            );
          } catch (err) {
            reject(err);
            return;
          }
          pendingRequests.set(requestId, {
            requestId,
            type: "__pwd__filePickerOpen",
            resolve,
            reject,
          });
        });
      }
    : null;

  appEnv.quickSave = data.dependencies.includes("quickSave")
    ? (handle, data) => {
        return new Promise((resolve, reject) => {
          const requestId = generateNewId();
          try {
            parent.postMessage(
              {
                type: "__pwd__quickSave",
                requestId,
                data: { handle, data },
              },
              desktopOrigin ?? "*",
            );
          } catch (err) {
            reject(err);
            return;
          }
          pendingRequests.set(requestId, {
            requestId,
            type: "__pwd__quickSave",
            resolve,
            reject,
          });
        });
      }
    : null;

  launchAppFromScript(data.scriptUrl, data.args, appEnv, appAbortCtrl.signal)
    .then((appInfo) => {
      if (appAbortCtrl.signal.aborted) {
        return;
      }
      parent.postMessage(
        {
          type: "__pwd__loaded",
          data: null,
        },
        desktopOrigin ?? "*",
      );
      appWrapperElt.appendChild(appInfo.element);
      onActivate = appInfo.onActivate;
      onDeactivate = appInfo.onDeactivate;
      onClose = appInfo.onClose;
    })
    .catch((err) => {
      if (appAbortCtrl.signal.aborted) {
        return;
      }
      parent.postMessage(
        {
          type: "__pwd__error",
          data: {
            time: "run",
            name: err.name,
            message: err.message,
          },
        },
        desktopOrigin ?? "*",
      );
    });
}

/**
 * @param {string} scriptUrl
 * @param {Array.<Object>} appArgs
 * @param {Object} env
 * @param {AbortSignal} abortSignal
 */
async function launchAppFromScript(scriptUrl, appArgs, env, abortSignal) {
  const appVal = await import(scriptUrl);
  if (abortSignal.aborted) {
    return;
  }
  if (typeof appVal?.create !== "function") {
    throw new Error(
      "Empty application JS file. " +
        `Please export a function called "create" in it.`,
    );
  }

  const appRet = await appVal.create(appArgs, env, abortSignal);
  if (abortSignal.aborted) {
    return;
  }

  /**
   * @type {HTMLElement|undefined}
   */
  let element;
  /**
   * App callback to call when the application is activated/focused.
   * @type {Function|undefined}
   */
  let onActivate;
  /**
   * App callback to call when the application is deactivated/unfocused.
   * @type {Function|undefined}
   */
  let onDeactivate;
  /**
   * App callback to call when the application is closed.
   * @type {Function|undefined}
   */
  let onClose;
  if (appRet?.element == null) {
    if (Array.isArray(appRet?.sidebar) && appRet.sidebar.length > 0) {
      const sidebarInfo = constructAppWithSidebar(appRet.sidebar, abortSignal);
      element = sidebarInfo.element;
      onActivate = sidebarInfo.focus;
    } else {
      throw new Error("Application without a returned `element` property.");
    }
  } else {
    element = appRet.element;
  }

  if (!onActivate && typeof appRet.onActivate === "function") {
    onActivate = appRet.onActivate.bind(appRet);
  }
  if (!onDeactivate && typeof appRet.onDeactivate === "function") {
    onDeactivate = appRet.onDeactivate.bind(appRet);
  }
  if (!onClose && typeof appRet.onClose === "function") {
    onClose = appRet.onClose.bind(appRet);
  }
  return { element, onActivate, onDeactivate, onClose };
}

[
  "mousedown",
  "mouseup",
  "click",
  "touchstart",
  "touchend",
  "focus",
  "focusin",
  "blur",
].forEach((eventType) => {
  document.addEventListener(
    eventType,
    function (e) {
      forwardEvent(eventType, e);
    },
    true,
  );
});
[].forEach((eventType) => {
  document.addEventListener(
    eventType,
    function (e) {
      forwardEvent(eventType, e);
    },
    true,
  );
});

// Forward mouse and touch events to parent
function forwardEvent(eventType, originalEvent) {
  const eventData = {
    type: "__pwd__forwarded-event",
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
    timestamp: Date.now(),
  };

  if (originalEvent.touches) {
    eventData.touches = Array.from(originalEvent.touches).map((touch) => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      pageX: touch.pageX,
      pageY: touch.pageY,
      identifier: touch.identifier,
    }));
  }
  parent.postMessage(eventData, desktopOrigin ?? "*");
}

/**
 * Definition for the object keeping track of pending desktop requests.
 * @typedef {Object} PendingRequest
 * @property {string} requestId - The identifier uniquely identifying this
 * request.
 * @property {string} type - The name of the message that is awaited.
 * @property {Function} resolve - The corresponding application's Promise's
 * `resolve` function.
 * @property {Function} reject - The corresponding application's Promise's
 * `reject` function.
 */
