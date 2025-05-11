/**
 * A window can contain a stack of application. For example:
 *
 *   - There might be a placeholder application before the app is actually
 *     loaded, like a spinner.
 *
 *   - The main application itself.
 *
 *   - The main application may then open sub-applications, e.g. a file-picker
 *     that is its own app, which themselves may open other applications etc.
 *
 *     Those sub-applications today display in the exact same window, with the
 *     guarantee of no direct communications between them.
 *
 * The `WindowedApplicationStack` is here to facilitate its management, by
 * regrouping both this stack and the lifecycle methods (`onClose`,
 * `onActivate` etc.) in one place.
 * @class WindowedApplicationStack
 *
 */
export default class WindowedApplicationStack {
  /**
   * @param {Object} initialElementObject
   * @param {boolean} isActivated - If `true`, the window is currently
   * activated. If `false`, it is deactivated.
   */
  constructor(initialElementObject, isActivated) {
    this._appStack = [];
    this.element = initialElementObject.element;
    /**
     * Callback that should be called when the application window is "activated".
     * @type {Function|null}
     */
    this.onActivateCallback = initialElementObject.onActivate ?? null;
    /**
     * Callback that should be called when the application window is
     * "deactivated" or closed.
     * @type {Function|null}
     */
    this.onDeactivateCallback = initialElementObject.onDeactivate ?? null;
    /**
     * Callback that should be called when the application window is
     * closed.
     * @type {Function|null}
     */
    this.onCloseCallback = initialElementObject.onClose ?? null;

    if (isActivated) {
      this.onActivateCallback?.();
    } else {
      this.onDeactivateCallback?.();
    }
  }

  /**
   * Method to call when the window is activated.
   */
  onActivate() {
    this.onActivateCallback?.();
  }

  /**
   * Method to call when the window is deactivated.
   */
  onDeactivate() {
    this.onDeactivateCallback?.();
  }

  /**
   * Method to call when the window is closed.
   */
  onClose() {
    this.onDeactivateCallback?.();
    this.onCloseCallback?.();
    while (true) {
      const lastWindow = this._appStack.pop();
      if (!lastWindow) {
        this.onActivateCallback = null;
        this.onDeactivateCallback = null;
        this.onCloseCallback = null;
        return;
      }
      lastWindow.onDeactivateCallback?.();
      lastWindow.onCloseCallback?.();
    }
  }

  /**
   * Remove the currently-displayed application and show the next one in the
   * stack, if one.
   * @param {boolean} isActivated - If `true`, the window is currently
   * activated. If `false`, it is deactivated.
   * @returns {boolean} - If `true`, there is still an element displayed.
   * If `false`, there's no more element in the stack.
   */
  pop(isActivated) {
    this.onDeactivateCallback?.();
    this.onCloseCallback?.();
    const lastWindow = this._appStack.pop();
    if (lastWindow) {
      this.element.replaceWith(lastWindow.element);
      this._setCurrentAppFromStack(lastWindow, isActivated);
      return true;
    }
    this.onActivateCallback = null;
    this.onDeactivateCallback = null;
    this.onCloseCallback = null;
    return false;
  }

  /**
   * Pop until a specific element included.
   * @param {HTMLElement} element - The `HTMLElement` you wish to pop.
   * @param {boolean} isActivated - If `true`, the window is currently
   * activated. If `false`, it is deactivated.
   * @returns {boolean} - If `true`, there is still an element displayed.
   * If `false`, there's no more element in the stack.
   */
  popElement(element, isActivated) {
    if (this.element === element) {
      return this.pop(isActivated); // It is the current element, equivalent to a `pop`
    }

    const index = this._appStack.findIndex((a) => a.element === element);
    if (index === -1) {
      return this._appStack.length > 0; // Not found
    }

    // Pop and close all applications until that one included
    while (this._appStack.length > index) {
      const popped = this._appStack.pop();
      popped.onDeactivateCallback?.();
      popped.onCloseCallback?.();
    }

    const newElt = this._appStack.pop();
    if (!newElt) {
      return false;
    }

    this._setCurrentAppFromStack(newElt, isActivated);
    return true;
  }

  /**
   * Set a new current application and move the precedent one to the top of the
   * stack.
   * @param {Object} newAppObject
   * @param {boolean} isActivated - If `true`, the window is currently
   * activated. If `false`, it is deactivated.
   */
  push(newAppObject, isActivated) {
    this._appStack.push({
      element: this.element,
      onActivateCallback: this.onActivateCallback,
      onDeactivateCallback: this.onDeactivateCallback,
      onCloseCallback: this.onCloseCallback,
    });
    this.onDeactivateCallback?.();
    this.element.replaceWith(newAppObject.element);
    this._setCurrentAppFromAppObject(newAppObject, isActivated);
  }

  /**
   * Replace all mounted elements until then by this one new app.
   * Will close all already-pushed applications.
   * @param {Object} newAppObject
   * @param {boolean} isActivated - If `true`, the window is currently
   * activated. If `false`, it is deactivated.
   */
  replaceAll(newAppObject, isActivated) {
    this.onDeactivateCallback?.();
    this.onCloseCallback?.();
    while (this._appStack.length > 0) {
      const currentApp = this._appStack.pop();
      currentApp.onDeactivateCallback?.();
      currentApp.onCloseCallback?.();
    }
    this.element.replaceWith(newAppObject.element);
    this._setCurrentAppFromAppObject(newAppObject, isActivated);
  }

  _setCurrentAppFromAppObject(newAppObject, isActivated) {
    this.element = newAppObject.element;
    this.onActivateCallback = newAppObject.onActivate;
    this.onDeactivateCallback = newAppObject.onDeactivate;
    this.onCloseCallback = newAppObject.onClose;
    if (isActivated) {
      this.onActivateCallback?.();
    } else {
      this.onDeactivateCallback?.();
    }
  }

  _setCurrentAppFromStack(stackObj, isActivated) {
    this.element = stackObj.element;
    this.onActivateCallback = stackObj.onActivateCallback;
    this.onDeactivateCallback = stackObj.onDeactivateCallback;
    this.onCloseCallback = stackObj.onCloseCallback;
    if (isActivated) {
      this.onActivateCallback?.();
    } else {
      this.onDeactivateCallback?.();
    }
  }
}
