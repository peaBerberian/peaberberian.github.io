import { BASE_WINDOW_Z_INDEX } from "../../constants.mjs";
import { isMinimizedOrMinimizing } from "./utils.mjs";

import AppWindow from "./AppWindow.mjs";
import { SETTINGS } from "../../settings.mjs";
import { getMaxDesktopDimensions } from "../../utils.mjs";

/**
 * Abstraction handling multiple windows in the same desktop.
 *
 * You may be able to create one `WindowsManager` per desktop in multi-desktop
 * scenarios.
 */
export default class WindowsManager {
  /**
   * Creates a new `WindowsManager` for the desktop.
   * @param {Object} taskbarManager - Abstraction allowing to show the current
   * opened windows. The `WindowsManager` will add and remove tasks to that
   * `TaskbarManager` for the corresponding windows.
   */
  constructor(taskbarManager) {
    /**
     * Metadata on all currently created windows.
     * @type {Array.<AppWindow>}
     * @private
     */
    this._windows = [];

    /**
     * Allows to quickly generate an identifier by just incrementing a number.
     * /!\ Careful of not overflowing `Number.MAX_SAFE_INTEGER`.
     * @type {number}
     * @private
     */
    this._nextId = 0;

    /**
     * Allows to add and remove tasks to the taskbar.
     * @type {Object}
     * @private
     */
    this._taskbarManager = taskbarManager;
  }

  /**
   * Create a "window" for the given "app" object.
   *
   * @param {Object} app
   * @param {Object} options - Various options to configure how that new
   * application window will behave
   * @param {boolean} [options.activate] - If set to `true`, the application
   * window will be directly activated.
   * @param {boolean} [options.fullscreen] - If set to `true`, the application
   * will be started full screen.
   * @param {boolean} [options.skipAnim] - If set to `true`, we will not show the
   * open animation for this new window.
   * @param {boolean} [options.centered] - If set to `true`, the application
   * window will be centered relative to the desktop in which it can be moved.
   * @returns {HTMLElement|null} - `HTMLElement` of the newly created window.
   * `null` if no window has been created.
   */
  openApp(app, options = {}) {
    if (app.onlyOne) {
      // If only instance of the app can be created, check if this window already
      // exists. If so, activate it.
      const createdWindowForApp = this._getNextWindowForApp(app.id);
      if (createdWindowForApp !== null) {
        if (options.activate) {
          createdWindowForApp.deminimizeAndActivate();
        }
        return null;
      }
    }

    const appWindow = new AppWindow(app, options);
    if (!appWindow) {
      return; // No window has been created
    }
    this._windows.push(appWindow);
    this._checkRelativeWindowPlacement(appWindow);

    const windowId = "w-" + this._nextId++;
    this._taskbarManager.addWindow(windowId, app, {
      toggleAppActivation: () => appWindow.toggleActivation(),
      closeApp: () => appWindow.close(),
    });

    appWindow.addEventListener("closing", () => {
      const windowIndex = this._windows.indexOf(appWindow);
      if (windowIndex !== -1) {
        // Remove from array
        this._windows.splice(windowIndex, 1);
        this.activateMoreVisibleWindow();
      }
      this._taskbarManager.remove(windowId);
    });

    appWindow.addEventListener("minimizing", () => {
      this.activateMoreVisibleWindow();

      // We uglily cheat a little by giving the current window a much more
      // proeminent z-index when minimizing, so that the next window is not
      // directly in front of the minimizing one, which would ruin the effect
      appWindow.element.style.zIndex = 500;

      this._taskbarManager.deActiveWindow(windowId);

      // Translation of the minimized window toward the taskbar
      const taskRect = this._taskbarManager.getTaskBoundingClientRect(windowId);
      if (taskRect) {
        // Calculate transform origin based on taskbar item position
        const windowRect = appWindow.element.getBoundingClientRect();
        const taskbarCenterX = taskRect.left + taskRect.width / 2;
        const taskbarCenterY = taskRect.top - taskRect.height / 2;
        appWindow.element.style.transformOrigin = `${taskbarCenterX - windowRect.left}px ${taskbarCenterY - windowRect.top}px`;
      }
    });

    appWindow.addEventListener("deminimized", () => {
      // Reset attribute only after restored
      appWindow.element.style.transformOrigin = "";
    });

    appWindow.addEventListener("activated", () => {
      const windowEltsWithZIndex = [];

      // Deactivate all other windows
      for (const w of this._windows) {
        if (w !== appWindow) {
          w.deActivate();
        }
        windowEltsWithZIndex.push({
          element: w.element,
          zIndex: parseInt(w.element.style.zIndex, 10) || BASE_WINDOW_Z_INDEX,
        });
      }

      // Normalize all windows so it starts at `BASE_WINDOW_Z_INDEX`
      // as a low value
      windowEltsWithZIndex.sort((a, b) => a.zIndex - b.zIndex);
      windowEltsWithZIndex.forEach((item, index) => {
        const newZIndex = String(BASE_WINDOW_Z_INDEX + index);
        if (newZIndex !== item.element.style.zIndex) {
          item.element.style.zIndex = newZIndex;
        }
      });
      appWindow.element.style.zIndex =
        BASE_WINDOW_Z_INDEX + windowEltsWithZIndex.length + 1;
      this._taskbarManager.setActiveWindow(windowId);
    });

    appWindow.addEventListener("deactivated", () => {
      this._taskbarManager.deActiveWindow(windowId);
    });

    if (options.activate) {
      appWindow.activate();
      this._taskbarManager.setActiveWindow(windowId);
    } else {
      appWindow.deActivate();
    }

    if (options.fullscreen) {
      appWindow.setFullscreen();
    }

    return appWindow.element;
  }

  /**
   * Activate the window the most forward and non-minimized.
   */
  activateMoreVisibleWindow() {
    if (this._windows.length === 0) {
      return;
    }

    let currentWindowWithMaxZIndex;
    let maxZindex = -Infinity;
    for (const w of this._windows) {
      if (!isMinimizedOrMinimizing(w.element)) {
        const wZindex = parseInt(w.element.style.zIndex, 10);
        if (!isNaN(wZindex) && wZindex >= maxZindex) {
          currentWindowWithMaxZIndex = w;
          maxZindex = wZindex;
        }
      }
    }

    if (currentWindowWithMaxZIndex) {
      currentWindowWithMaxZIndex.activate();
    }
  }

  /**
   * @private
   * @returns {AppWindow|null}
   */
  _getNextWindowForApp(appId) {
    for (const w of this._windows) {
      if (w.appId === appId) {
        return w;
      }
    }
    return null;
  }

  /**
   * @param {AppWindow} newAppWindow - The newly-created `AppWindow` for which
   * we want to check the relative positionning to other windows.
   * @private
   */
  _checkRelativeWindowPlacement(newAppWindow) {
    const {
      top: initialTop,
      left: initialLeft,
      height: initialHeight,
      width: initialWidth,
    } = newAppWindow.getPlacement();

    const maxDesktopDimensions = getMaxDesktopDimensions(
      SETTINGS.taskbarLocation.getValue(),
      SETTINGS.taskbarSize.getValue(),
    );

    let top = initialTop;
    let left = initialLeft;

    // Do not overlap previously-create window on the top left position
    for (let windowIdx = 0; windowIdx < this._windows.length; windowIdx++) {
      const appWindow = this._windows[windowIdx];
      if (appWindow === newAppWindow) {
        continue;
      }
      const windowPlacement = appWindow.getPlacement();

      let needRecheck = false;
      if (initialHeight && windowPlacement.top === top) {
        if (top + initialHeight + 25 <= maxDesktopDimensions.maxHeight) {
          top += 25;
          needRecheck = true;
        } else {
          top = maxDesktopDimensions.maxHeight - initialHeight;
        }
      }

      if (initialWidth && windowPlacement.left === left) {
        if (left + initialWidth + 25 <= maxDesktopDimensions.maxWidth) {
          left += 25;
          needRecheck = true;
        } else {
          left = maxDesktopDimensions.maxWidth - initialWidth;
        }
      }
      if (needRecheck) {
        windowIdx = -1;
      }
    }

    if (left !== undefined || top !== undefined) {
      newAppWindow.move({ left, top, desktopDimensions: maxDesktopDimensions });
    }
  }
}
