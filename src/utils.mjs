import { APP_STYLE } from "./constants.mjs";

/**
 * Function adding an event listener also accepting an `AbortSignal` for
 * automatic removal of that event listener.
 * @param {EventTarget} target
 * @param {string} event
 * @param {AbortSignal} abortSignal
 * @param {Function} callback
 */
export function addAbortableEventListener(
  target,
  event,
  abortSignal,
  callback,
  options,
) {
  target.addEventListener(event, callback, options);
  abortSignal?.addEventListener("abort", () => {
    target.removeEventListener(event, callback);
  });
}

/**
 * @returns {boolean} - If `true`, the current system seems to default to
 * 12-hours based time. If `false`, the hours can be based as the only
 * real sensible way: 24h time.
 */
export function is12HourClockFormat() {
  const locale = navigator.language;
  try {
    return (
      Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions()
        .hour12 === true
    );
  } catch (err) {
    return locale === "en-US";
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
export function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}

/**
 * Get the maximum dimensions of the "desktop" part of the application.
 * That is, everything but the taskbar.
 * @param {string} taskbarLocation - Either "top", "bottom", "left" or "right"
 * depending on the taskbar's location.
 * @param {number} taskbarLocation - The size of the taskbar, depending on its
 * orientation (`height` for `"top"` or `"bottom"`), else the width.
 * @returns {Object} - Maximum dimensions for the desktop.
 */
export function getMaxDesktopDimensions(taskbarLocation, taskbarSize) {
  const hasHorizontalTaskbar = ["top", "bottom"].includes(taskbarLocation);
  return {
    maxHeight:
      document.documentElement.clientHeight -
      (hasHorizontalTaskbar ? taskbarSize : 0),
    maxWidth:
      document.documentElement.clientWidth -
      (hasHorizontalTaskbar ? 0 : taskbarSize),
  };
}

/**
 * Creates an i-frame inside an application that follow this fake desktop's
 * rule.
 * @param {string} url - URL to set this i-frame to.
 * @param {string|undefined} [backgroundColor]
 * @returns {HTMLElement} - A "div" containing the i-frame asked.
 */
export function createExternalIframe(url, backgroundColor) {
  const container = document.createElement("div");
  applyStyle(container, {
    height: "100%",
    width: "100%",
    position: "relative",
    backgroundColor: backgroundColor ?? "var(--window-content-bg)",
  });

  // Blocker DIV to work-around pointer-event-blocking that makes the behavior
  // of the desktop OS weird if nothing is done about it.
  const blockerDiv = document.createElement("div");
  blockerDiv.className = "iframe-top-layer";
  const blockerText = document.createElement("div");
  blockerDiv.className = "iframe-top-layer";
  applyStyle(blockerText, {
    color: "white",
    fontStyle: "italic",
    padding: "10px",
    backgroundColor: "#0000004d",
    borderRadius: "10px",
  });
  blockerText.textContent =
    "External i-frame blocked until the window's content is focused.";
  blockerDiv.appendChild(blockerText);

  const spinner = document.createElement("div");
  spinner.className = "spinner spinner-iframe";
  const iframe = document.createElement("iframe");
  applyStyle(iframe, {
    height: "100%",
    width: "100%",
    border: "0",
    display: "block",
  });
  iframe.src = url;
  iframe.className = "loading";
  iframe.height = "100%";
  iframe.width = "100%";
  iframe.border = 0;

  iframe.onload = function () {
    container.style.backgroundColor = "#ffffff";
    container.removeChild(spinner);
  };
  iframe.onerror = function () {
    container.removeChild(spinner);
  };
  container.appendChild(blockerDiv);
  container.appendChild(iframe);
  container.appendChild(spinner);
  return container;
}

/**
 * Construct "just" a sidebar element.
 *
 * @param {Array.<Object>} sections - Array of objects, each of which describes
 * a single sidebar section.
 * Each object have the following properties:
 * -  `section` (`string`): identifier for the section, that will be
 *    communicated through `onChangeSection`.
 * -  `active` (`boolean`): If `true`, this is the active section.
 * -  `icon` (`string|undefined`): Optional icon describing the section.
 * -  `text` (`string`): Title describing the section.
 * @param {Function} onChangeSection - Callback that will be called once a
 * section is chosen in the sidebar with the corresponding `section` identifier
 * in argument.
 * @returns {HTMLElement} - The sidebar `HTMLElement`.
 */
export function constructSidebarElt(sections, onChangeSection) {
  const sidebarElt = document.createElement("div");
  sidebarElt.className = "w-sidebar";

  const sidebarItemElements = sections.map((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "w-sidebar-item" + (item.active ? " active" : "");
    itemElement.tabIndex = "0";

    if (item.icon) {
      const itemIcon = document.createElement("span");
      itemIcon.className = "w-sidebar-icon";
      itemIcon.textContent = item.icon;
      itemElement.appendChild(itemIcon);
    }

    const itemTitle = document.createElement("span");
    itemTitle.className = "w-sidebar-title";
    itemTitle.textContent = item.text;
    itemElement.appendChild(itemTitle);

    itemElement.onkeydown = (e) => {
      if (e.key === "Enter") {
        itemElement.click();
      }
    };
    itemElement.onclick = () => {
      if (itemElement.classList.contains("active")) {
        // Already the active one, exit
        return;
      }
      sidebarItemElements.forEach((el) => {
        el.classList.remove("active");
      });
      itemElement.classList.add("active");
      onChangeSection(item.section);
    };
    return itemElement;
  });

  sidebarItemElements.forEach((item) => {
    sidebarElt.appendChild(item);
  });
  return sidebarElt;
}

/**
 * Enable the `HTMLElement` blocking interactions with all i-frames.
 */
export function blockElementsFromTakingPointerEvents() {
  // This is a work-around for the fact that "iframe" elements may hide
  // pointer events from us. Adding this class allows to block pointer
  // inputs on every iframe, blocking interactions with them but allowing
  // us to track the resize operation even when the mouse temporarily
  // goes over them.
  document.body.classList.add("block-iframe");
}

/**
 * Disable the `HTMLElement` blocking interactions with all i-frames.
 */
export function unblockElementsFromTakingPointerEvents() {
  document.body.classList.remove("block-iframe");
}

/**
 * Simple Event Emitter abstraction, following the usual HTML way of doing it.
 * Classes that want EventTarget abilities should extend this class.
 *
 * @class EventEmitter.
 */
export class EventEmitter {
  constructor() {
    /**
     * @type {Object}
     * @private
     */
    this._listeners = {};
  }

  /**
   * Register a new callback for an event.
   *
   * @param {string} evt - The event to register a callback to
   * @param {Function} fn - The callback to call as that event is triggered.
   * The callback will take as argument the eventual payload of the event
   * (single argument).
   */
  addEventListener(evt, fn) {
    const listeners = this._listeners[evt];
    if (!Array.isArray(listeners)) {
      this._listeners[evt] = [fn];
    } else {
      listeners.push(fn);
    }
  }

  /**
   * Unregister callbacks linked to events.
   * @param {string} [evt] - The event for which the callback[s] should be
   * unregistered. Set it to null or undefined to remove all callbacks
   * currently registered (for any event).
   * @param {Function} [fn] - The callback to unregister. If set to null
   * or undefined while the evt argument is set, all callbacks linked to that
   * event will be unregistered.
   */
  removeEventListener(evt, fn) {
    if (evt == null) {
      this._listeners = {};
      return;
    }

    const listeners = this._listeners[evt];
    if (!Array.isArray(listeners)) {
      return;
    }
    if (fn == null) {
      delete this._listeners[evt];
      return;
    }

    const index = listeners.indexOf(fn);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      delete this._listeners[evt];
    }
  }

  /**
   * Trigger every registered callbacks for a given event
   * @param {string} evt - The event to trigger
   * @param {*} arg - The eventual payload for that event. All triggered
   * callbacks will recieve this payload as argument.
   */
  trigger(evt, arg) {
    const listeners = this._listeners[evt];
    if (!Array.isArray(listeners)) {
      return;
    }

    listeners.slice().forEach((listener) => {
      try {
        listener(arg);
      } catch (e) {}
    });
  }
}

export function createLinkedAbortController(parentAbortSignal) {
  const abortController = new AbortController();
  if (parentAbortSignal) {
    linkAbortControllerToSignal(abortController, parentAbortSignal);
  }
  return abortController;
}

export function linkAbortControllerToSignal(
  abortController,
  parentAbortSignal,
) {
  const onParentAbort = () => abortController.abort();
  parentAbortSignal.addEventListener("abort", onParentAbort);
  abortController.signal.addEventListener("abort", () => {
    parentAbortSignal.removeEventListener("abort", onParentAbort);
  });
}

export function createRootStyle(cssVarArray) {
  let newStyle = ":root {\n";
  cssVarArray.forEach((v) => {
    newStyle += "  " + v.cssName + ": " + v.value + ";\n";
  });
  newStyle += "}";
  return newStyle;
}

/**
 * @typedef {Object} SpinnerPlaceholderApp
 * @property {HTMLElement} element - The container element in which the
 * spinner is shown. Will be given as the initial element the window should
 * display, that may then be replaced by the real window content.
 * @param {Function} onClose - The spinner is only displayed after a timer, this
 * function clears this timer.
 */

/**
 * Information on spinner prepared just in case the application takes time
 * to create.
 * @param {string|undefined} [backgroundColor]
 * @returns {SpinnerPlaceholderApp}
 */
export function getSpinnerApp(backgroundColor) {
  const placeholderElt = document.createElement("div");
  applyStyle(placeholderElt, {
    height: "100%",
    width: "100%",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: backgroundColor ?? "var(--window-content-bg)",
  });
  const timeout = setTimeout(() => {
    const spinnerElt = document.createElement("div");
    spinnerElt.className = "spinner";
    placeholderElt.appendChild(spinnerElt);
  }, 200);
  return {
    element: placeholderElt,
    onClose: () => clearTimeout(timeout),
  };
}

export function getErrorApp(err) {
  const errorElt = document.createElement("div");
  applyStyle(errorElt, {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "var(--window-content-bg)",
    padding: "10px",
    overflow: "auto",
  });
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `<h2>Oh no! This application crashed... 😿</h2>
<p>Failed to load this application due to the following error:</p>`;
  const pErrorMsgElt = document.createElement("p");
  pErrorMsgElt.style.fontFamily = "monospace";
  pErrorMsgElt.textContent = err.toString();
  errorDiv.appendChild(pErrorMsgElt);
  errorElt.appendChild(errorDiv);
  return { element: errorElt };
}

export function parseAppDefaultBackground(defaultBackground) {
  if (defaultBackground?.startsWith("#")) {
    return defaultBackground;
  }
  return defaultBackground
    ? (APP_STYLE[defaultBackground]?.cssProp ?? APP_STYLE.bgColor.cssProp)
    : APP_STYLE.bgColor.cssProp;
}

export function constructAppStyleObject() {
  return Object.keys(APP_STYLE).reduce((acc, name) => {
    acc[name] = APP_STYLE[name].cssProp;
    return acc;
  }, {});
}

/**
 * Creates an ID generator which generates a number containing an incremented
 * number each time you call it.
 * @returns {Function}
 */
export function idGenerator() {
  let prefix = "";
  let currId = -1;
  return function generateNewId() {
    currId++;
    if (currId >= Number.MAX_SAFE_INTEGER) {
      prefix += "0";
      currId = 0;
    }
    return prefix + String(currId);
  };
}
