import strHtml from "./str-html.mjs";

/**
 * Function adding an event listener also accepting an `AbortSignal` for
 * automatic removal of that event listener.
 * @param {EventTarget} target
 * @param {string} event
 * @param {AbortSignal} abortSignal
 * @param {Function} callback
 */
export function addEventListener(target, event, abortSignal, callback) {
  target.addEventListener(event, callback);
  abortSignal.addEventListener("abort", () => {
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
 * @returns {HTMLElement} - A "div" containing the i-frame asked.
 */
export function createAppIframe(url) {
  const container = document.createElement("div");
  applyStyle(container, {
    height: "100%",
    width: "100%",
    position: "relative",
    backgroundColor: "var(--window-content-bg)",
  });
  const spinner = document.createElement("div");
  spinner.className = "spinner spinner-iframe";
  const iframe = document.createElement("iframe");
  applyStyle(iframe, {
    height: "100%",
    width: "100%",
    border: "0",
    // TODO: find out what's adding that thing instead of hacking around!
    marginBottom: "-5px",
  });
  iframe.src = url;
  iframe.className = "loading";
  iframe.height = "100%";
  iframe.width = "100%";
  iframe.border = 0;
  iframe.allow =
    "clipboard-read; clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture";

  iframe.onload = function () {
    container.style.backgroundColor = "#ffffff";
    container.removeChild(spinner);
  };
  iframe.onerror = function () {
    container.removeChild(spinner);
  };
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
  const sidebarElt = strHtml`<div class="w-sidebar"/>`;

  const sidebarItemElements = sections.map((item) => {
    const itemIcon = item.icon
      ? strHtml`<span class="w-sidebar-icon">${item.icon}</span>`
      : null;
    const itemElement = strHtml`<div class="w-sidebar-item${item.active ? " active" : ""}">
${itemIcon}${item.text}
</div>`;
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

// NOTE: The following class is adapted from my version of the same util inside
// the `RxPlayer`'s code

/**
 * A value behind a shared reference, meaning that any update to its value from
 * anywhere can be retrieved from any other parts of the code in possession of
 * the same `SharedReference`.
 *
 * @example
 * ```ts
 * const myVal = 1;
 * const myRef : SharedReference<number> = new SharedReference(1);
 *
 * function setValTo2(num : number) {
 *   num = 2;
 * }
 *
 * function setRefTo2(num : SharedReference<number>) {
 *   num.setValue(2);
 * }
 *
 * setValTo2(myVal);
 * console.log(myVal); // output: 1
 *
 * myRef.onUpdate((val) => {
 *   console.log(val); // outputs first synchronously `1`, then `2`
 * }, { emitCurrentValue: true });
 *
 * setRefTo2(myRef);
 * console.log(myRef.getValue()); // output: 2
 *
 * myRef.listen((val) => {
 *   console.log(val); // outputs only `2`
 * }, { emitCurrentValue: true });
 * ```
 *
 * This type was added because we found that the usage of an explicit type for
 * those use cases makes the intent of the corresponding code clearer.
 */
export class SharedReference {
  /**
   * Create a `SharedReference` object encapsulating the mutable `initialValue`
   * value of type T.
   * @param {*} initialValue
   * @param {AbortSignal|undefined} [abortSignal] - If set, the created shared
   * reference will be automatically "finished" once that signal emits.
   * Finished references won't be able to update their value anymore, and will
   * also automatically have their listeners (callbacks linked to value change)
   * removed - as they cannot be triggered anymore, thus providing a security
   * against memory leaks.
   */
  constructor(initialValue, abortSignal) {
    /** Current value referenced by this `SharedReference`. */
    this._value = initialValue;
    /**
     * Attributes each linked to a single registered callbacks which listen to the
     * referenced value's updates.
     *
     * Contains the following properties:
     *   - `trigger`: Function which will be called with the new reference's value
     *     once it changes
     *   - `complete`: Allows to clean-up the listener, will be called once the
     *     reference is finished.
     *   - `hasBeenCleared`: becomes `true` when the reference is
     *     removed from the `cbs` array.
     *     Adding this property allows to detect when a previously-added
     *     listener has since been removed e.g. as a side-effect during a
     *     function call.
     *   - `complete`: Callback to call when the current Reference is "finished".
     */
    this._listeners = [];
    /**
     * Set to `true` when this `SharedReference` is finished in which case it
     * cannot be updated nor emit values anymore.
     */
    this._isFinished = false;
    /**
     * Callbacks triggered when the `SharedReference` is finished.
     */
    this._onFinishCbs = [];
    if (abortSignal !== undefined) {
      const onAbort = () => this.finish();
      abortSignal.addEventListener("abort", onAbort);
      /**
       * Store a reference to the callback allowing to finish the `SharedReference`
       * on some event. Allows to remove the logic when it's not needed anymore.
       */
      this._deregisterCancellation = () => {
        abortSignal.removeEventListener("abort", onAbort);
      };
    }
  }

  /**
   * Returns the current value of this shared reference.
   * @returns {*}
   */
  getValue() {
    return this._value;
  }

  /**
   * Update the value of this shared reference.
   * @param {*} newVal
   */
  setValue(newVal) {
    if (this._isFinished) {
      return;
    }
    this._value = newVal;

    if (this._listeners.length === 0) {
      return;
    }
    const clonedCbs = this._listeners.slice();
    for (const cbObj of clonedCbs) {
      try {
        if (!cbObj.hasBeenCleared) {
          cbObj.trigger(newVal, cbObj.complete);
        }
      } catch (_) {
        /* nothing */
      }
    }
  }

  /**
   * Update the value of this shared reference only if the value changed.
   *
   * Note that this function only performs a strict equality reference through
   * the "===" operator. Different objects that are structurally the same will
   * thus be considered different.
   * @param {*} newVal
   */
  setValueIfChanged(newVal) {
    if (newVal !== this._value) {
      this.setValue(newVal);
    }
  }

  /**
   * Allows to register a callback to be called each time the value inside the
   * reference is updated.
   * @param {Function} cb - Callback to be called each time the reference is
   * updated. Takes as first argument its new value and in second argument a
   * callback allowing to unregister the callback.
   * @param {Object} [params={}]
   * @param {AbortSignal} [params.clearSignal] - Allows to provide an AbortSignal
   * which will unregister the callback when it emits.
   * @param {boolean|undefined} [params.emitCurrentValue] - If `true`, the
   * callback will also be immediately called with the current value.
   */
  onUpdate(cb, params = {}) {
    const unlisten = () => {
      if (params.clearSignal !== undefined) {
        params.clearSignal.removeEventListener("abort", unlisten);
      }
      if (cbObj.hasBeenCleared) {
        return;
      }
      cbObj.hasBeenCleared = true;
      const indexOf = this._listeners.indexOf(cbObj);
      if (indexOf >= 0) {
        this._listeners.splice(indexOf, 1);
      }
    };

    const cbObj = { trigger: cb, complete: unlisten, hasBeenCleared: false };
    this._listeners.push(cbObj);

    if (params.emitCurrentValue === true) {
      cb(this._value, unlisten);
    }

    if (this._isFinished || cbObj.hasBeenCleared) {
      unlisten();
      return;
    }
    if (params.clearSignal !== undefined) {
      params.clearSignal.addEventListener("abort", unlisten);
    }
  }

  /**
   * Variant of `onUpdate` which will only call the callback once, once the
   * value inside the reference is different from `undefined`.
   * The callback is called synchronously if the value already isn't set to
   * `undefined`.
   *
   * This method can be used as a lighter weight alternative to `onUpdate` when
   * just waiting that the stored value becomes defined.
   * As such, it is an explicit equivalent to something like:
   * ```js
   * myReference.onUpdate((newVal, stopListening) => {
   *  if (newVal !== undefined) {
   *    stopListening();
   *
   *    // ... do the logic
   *  }
   * }, { emitCurrentValue: true });
   * ```
   * @param {Function} cb - Callback to be called each time the reference is
   * updated. Takes the new value in argument.
   * @param {Object} params
   * @param {AbortSignal} params.clearSignal - Allows to provide an AbortSignal
   * which will unregister the callback when it emits.
   */
  waitUntilDefined(cb, params) {
    this.onUpdate(
      (val, stopListening) => {
        if (val !== undefined) {
          stopListening();
          cb(this._value);
        }
      },
      { clearSignal: params.clearSignal, emitCurrentValue: true },
    );
  }

  /**
   * Allows to register a callback for when the Shared Reference is "finished".
   *
   * This function is mostly there for implementing operators on the shared
   * reference and isn't meant to be used by regular code, hence it being
   * prefixed by `_`.
   * @param {Function} cb - Callback to be called once the reference is
   * finished.
   * @param {AbortSignal} onFinishCancelSignal - Allows to provide an
   * AbortSignal * which will unregister the callback when it emits.
   */
  _onFinished(cb, onFinishCancelSignal) {
    if (onFinishCancelSignal.aborted) {
      return noop;
    }
    const cleanUp = () => {
      const indexOf = arrayFindIndex(
        this._onFinishCbs,
        (x) => x.trigger === trigger,
      );
      if (indexOf >= 0) {
        this._onFinishCbs[indexOf].hasBeenCleared = true;
        this._onFinishCbs.splice(indexOf, 1);
      }
    };
    const trigger = () => {
      cleanUp();
      cb();
    };
    onFinishCancelSignal.addEventListener("abort", cleanUp);
    const deregisterCancellation = () => {
      onFinishCancelSignal.removeEventListener("abort", cleanUp);
    };
    this._onFinishCbs.push({ trigger, hasBeenCleared: false });
    return deregisterCancellation;
  }

  /**
   * Indicate that no new values will be emitted.
   * Allows to automatically free all listeners linked to this reference.
   */
  finish() {
    if (this._deregisterCancellation !== undefined) {
      this._deregisterCancellation();
    }
    this._isFinished = true;
    const clonedCbs = this._listeners.slice();
    for (const cbObj of clonedCbs) {
      try {
        if (!cbObj.hasBeenCleared) {
          cbObj.complete();
          cbObj.hasBeenCleared = true;
        }
      } catch (_) {
        /* nothing */
      }
    }
    this._listeners.length = 0;
    if (this._onFinishCbs.length > 0) {
      const clonedFinishedCbs = this._onFinishCbs.slice();
      for (const cbObj of clonedFinishedCbs) {
        try {
          if (!cbObj.hasBeenCleared) {
            cbObj.trigger();
            cbObj.hasBeenCleared = true;
          }
        } catch (_) {
          /* nothing */
        }
      }
      this._onFinishCbs.length = 0;
    }
  }
}
