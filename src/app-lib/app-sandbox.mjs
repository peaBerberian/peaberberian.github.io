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
import { applyStyle } from "../utils.mjs";
import { getAppUtils } from "./app-utils.mjs";
import { constructAppWithSidebar } from "./sidebar.mjs";

/**
 * CSS variables as they will be communicated to the app under the `STYLE`
 * environment variable.
 * Received from the parent.
 */
const STYLE = {};

/**
 * HTMLElement that will contain the application
 * @type {HTMLDivElement}
 */
const appWrapperElt = document.createElement("div");
appWrapperElt.className = "sandbox";
applyStyle(appWrapperElt, {
  // outline: "none",
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  overflow: "hidden",
});
document.body.appendChild(appWrapperElt);

/**
 * Origin indicated by the desktop when asking to run an app.
 * All subsequent messages should all come from this origin and all messages
 * should be sent to it.
 */
let desktopOrigin;

const applicationEnvironment = {
  appUtils: getAppUtils(),
  getImageRootPath: () => IMAGE_ROOT_PATH,
  getVersion: () => __VERSION__,
  updateTitle: (icon, title) =>
    parent.postMessage({
      type: "_pwd_update-title",
      data: { icon, title },
    }),
  closeApp: () =>
    parent.postMessage({
      type: "_pwd_close-app",
      data: null,
    }),
  STYLE,
};

let isActivated = false;
let onActivate;
let onDeactivate;
let onClose;

const abortCtrlr = new AbortController();

onmessage = (e) => {
  if (desktopOrigin && e.origin !== desktopOrigin) {
    return;
  }
  switch (e.data.type) {
    case "__pwd__sidebar-format-update": {
      if (e.data.data === "top") {
        document.body.classList.add("w-sidebar-top");
      } else {
        document.body.classList.remove("w-sidebar-top");
      }
      break;
    }

    case "__pwd__update-style": {
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
      if (e.data.data) {
        document.body.classList.remove("transparent-i-frame-top");
      } else {
        document.body.classList.add("transparent-i-frame-top");
      }
      break;
    }

    case "__pwd__run-app":
      e.stopImmediatePropagation();
      isActivated = e.data.data.activate;
      if (isActivated) {
        appWrapperElt.classList.add("active");
      } else {
        appWrapperElt.classList.remove("active");
      }
      desktopOrigin = e.data.data.desktopOrigin;
      launchAppFromScript(
        e.data.data.scriptUrl,
        e.data.data.args,
        applicationEnvironment,
        abortCtrlr.signal,
      )
        .then((appInfo) => {
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
      break;

    case "__pwd__activate":
      e.stopImmediatePropagation();
      if (isActivated) {
        return;
      }
      isActivated = true;
      appWrapperElt.classList.add("active");
      onActivate?.();
      break;

    case "__pwd__deactivate":
      e.stopImmediatePropagation();
      if (!isActivated) {
        return;
      }
      isActivated = false;
      appWrapperElt.classList.remove("active");
      onDeactivate?.();
      break;

    case "__pwd__close":
      e.stopImmediatePropagation();
      isActivated = false;
      appWrapperElt.classList.remove("active");
      onClose?.();
      break;

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
};

async function launchAppFromScript(scriptUrl, appArgs, env, abortSignal) {
  const appVal = await import(scriptUrl);
  if (typeof appVal?.create !== "function") {
    throw new Error(
      "Empty application JS file. " +
        `Please export a function called "create" in it.`,
    );
  }

  const appRet = await appVal.create(appArgs, env, abortSignal);

  let element;
  let onActivate;
  let onDeactivate;
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
