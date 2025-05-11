import * as CONSTANTS from "../constants.mjs";
import { SETTINGS } from "../settings.mjs";
import filesystem, { getName } from "../filesystem/filesystem.mjs";
import AppWindow from "../components/window/AppWindow.mjs";
import {
  applyStyle,
  constructSidebarElt,
  createAppIframe,
  createLinkedAbortController,
  getMaxDesktopDimensions,
} from "../utils.mjs";
import appUtils from "./app-utils/index.mjs";
import WindowedApplicationStack from "./windowed_application_stack.mjs";
import strHtml from "../str-html.mjs";

const { BASE_WINDOW_Z_INDEX, IMAGE_ROOT_PATH, __VERSION__ } = CONSTANTS;

/**
 * Class simplifying the task of Launching applications:
 *
 * - set-up windows
 *
 * - dynamically import applications and handle their lifecycle
 *
 * - communicates with the taskbar to tell when an application is activated /
 *   deactivated, and how to close it.
 *
 * - Provide then the right arguments.and dependencies to application.
 *
 * A single AppsLauncher should be created per desktop.
 * @class AppsLauncher
 */
export default class AppsLauncher {
  /**
   * Creates a new `AppsLauncher` for the desktop.
   * @param {HTMLElement} dekstopElt - `HTMLElement` where new windows may be
   * added and removed from.
   * @param {Object} taskbarManager - Abstraction allowing to show the current
   * opened application windows. The `AppsLauncher` will add and remove tasks to
   * that `TaskbarManager` for the corresponding windows.
   */
  constructor(desktopElt, taskbarManager) {
    /**
     * `HTMLElement` where new windows may be added and removed from.
     * @type {HTMLElement}
     * @private
     */
    this._desktopElt = desktopElt;
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
    this._nextWindowId = 0;

    /**
     * Allows to add and remove tasks to the taskbar.
     * @type {Object}
     * @private
     */
    this._taskbarManager = taskbarManager;
  }

  /**
   * Open the given application, and optionally open a window for it.
   * @param {string} appPath - FileSystem path to the application to run (e.g.
   * `/apps/about.run`).
   * @param {Array.<string>} appArgs - The application's arguments.
   * @param {Object} options - Various options to configure how that new
   * application will behave.
   * @param {boolean} [options.fullscreen] - If set to `true`, the application's
   * window will be started full screen.
   * @param {boolean} [options.skipAnim] - If set to `true`, we will not show the
   * open animation for the optional new window linked to that application.
   * @param {boolean} [options.centered] - If set to `true`, the application
   * window will be centered relative to the desktop in which it can be moved.
   * @returns {Promise.<boolean>} - `true` if a window has been created, `false`
   * if not.
   */
  async openApp(appPath, appArgs, options = {}) {
    // we're given a path, from which we can get the app's executable format:
    // an object with all its metadata, including the script to import to run it.
    const app =
      typeof appPath === "string"
        ? await filesystem.readFile(appPath, "object")
        : appPath;

    if (app.onlyOne) {
      // If only instance of the app can be created, check if this window already
      // exists. If so, activate it.
      const createdWindowForApp = this._getNextWindowForApp(app.id);
      if (createdWindowForApp !== null) {
        createdWindowForApp.deminimizeAndActivate();
        return false;
      }
    }

    /** `AbortController` linked to the life of this application. */
    const applicationAbortCtrl = new AbortController();

    /**
     * Object defining metadata on the application currently visible and
     * interactive in the window.
     * We begin by placing the spinner app in it, just in case the application
     * takes time to load.
     */
    const appStack = new WindowedApplicationStack(getSpinnerApp(), true);

    /** Window containing the application. */
    const appWindow = new AppWindow(app, appStack.element, options);

    // TODO: here instead?
    // The `AppWindow` doesn't really need to know about the app metadata
    // appWindow.updateTitle(app.icon, app.title);
    // this._windows.push({ appId: app.id, appWindow });

    this._windows.push(appWindow);

    // Move a little perfectly-overlapping windows
    this._checkRelativeWindowPlacement(appWindow);

    /** Identifier unique to this window. */
    const windowId = "w-" + this._nextWindowId++;
    this._taskbarManager.addWindow(windowId, app, {
      toggleAppActivation: () => appWindow.toggleActivation(),
      closeApp: () => appWindow.close(),
    });

    appWindow.addEventListener("closing", () => {
      applicationAbortCtrl.abort();
      const windowIndex = this._windows.indexOf(appWindow);
      if (windowIndex !== -1) {
        // Remove from array and activate next window
        this._windows.splice(windowIndex, 1);
        this.activateMostVisibleWindow();
      }
      this._taskbarManager.remove(windowId);
      appStack.onClose();
    });

    appWindow.addEventListener("minimizing", () => {
      this.activateMostVisibleWindow();

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
      // TODO: I may do this too often? I don't know how much this has an
      // effect, yet normalization could be a rare-ish event.
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

      appStack.onActivate();
    });

    appWindow.addEventListener("deactivated", () => {
      this._taskbarManager.deActiveWindow(windowId);
      appStack.onDeactivate();
    });

    appWindow.activate();
    this._taskbarManager.setActiveWindow(windowId);

    if (options.fullscreen) {
      appWindow.setFullscreen();
    }

    /**
     * Construct `env` object that is given to application as their link to the
     * desktop element.
     */
    const env = {
      appUtils,
      getImageRootPath: () => IMAGE_ROOT_PATH,
      getVersion: () => __VERSION__,
      // TODO: With imediately-updating titles, it can look quite jumpy to first
      // update it to its initial title and then potentially update it once the
      // app is loaded... Find a solution.
      updateTitle: (newIcon, newTitle) => {
        appWindow.updateTitle(newIcon, newTitle);
        this._taskbarManager.updateTitle(windowId, newIcon, newTitle);
      },
      CONSTANTS,
    };

    if (Array.isArray(app.dependencies)) {
      if (app.dependencies.includes("settings")) {
        env.settings = SETTINGS;
      }
      if (app.dependencies.includes("filesystem")) {
        env.filesystem = filesystem;
      }
      if (app.dependencies.includes("open")) {
        env.open = (path) => {
          if (Array.isArray(path)) {
            // TODO: multiple open in same app
            path.forEach((p) => this.open(p));
          } else {
            this.open(path);
          }
        };
      }
      if (app.dependencies.includes("filePickerOpen")) {
        env.filePickerOpen = (config) =>
          this._createFilePickerOpen(
            appStack,
            appWindow,
            { type: "options", ...config },
            applicationAbortCtrl.signal,
          );
      }
    }

    // Actually launch the application
    this._launchAppFromAppData(
      "create",
      app.data,
      appArgs,
      env,
      applicationAbortCtrl.signal,
    ).then(
      (appObj) => {
        if (applicationAbortCtrl.signal.aborted) {
          appStack.onClose();
          return;
        }
        // /!\ Note that we replace here, the element communicated to the
        // `AppWindow` is stale now. Hopefully, it shouldn't care.
        appStack.replaceAll(appObj, appWindow.isActivated());
      },
      (err) => {
        appStack.replaceAll(getErrorApp(err), appWindow.isActivated());
      },
    );

    this._desktopElt.appendChild(appWindow.element);
    return true;
  }

  /**
   * General open function for when the type of data to open is unknown.
   * @param {string|Object} data - Either path to the file to open or executable
   * object directly.
   * @returns {Promise}
   */
  async open(data) {
    if (typeof data === "string") {
      if (data.endsWith(".run")) {
        return this.openApp(data, []);
      }

      const lastIdxOfDot = data.lastIndexOf(".");
      if (lastIdxOfDot < 0) {
        // No extension found
        // TODO: notification? Try executing it?
        return;
      }
      const extension = data.substring(lastIdxOfDot + 1);
      if (!extension || extension.includes("/")) {
        // Empty extension or not a path
        // TODO: notification?
        return;
      }
      const defaultApps = await filesystem.readFile(
        "/system/default_apps.config.json",
        "object",
      );
      if (!defaultApps[extension]) {
        // No default app for this extension
        // TODO: notification?
        return;
      }

      // TODO: what if fails? Also should we stat for max size before?
      const openedFile = await filesystem.readFile(data, "arraybuffer");

      // TODO: also maintain a handle to allow save?
      return this.openApp(defaultApps[extension], [
        {
          type: "file",
          filename: getName(data),
          data: openedFile,
        },
      ]);
    }

    // If not a string but an object, some duck-typing time.
    if (typeof data === "object" && data !== null) {
      if (typeof data.id === "string" && typeof data.data === "object") {
        // May be an executable
        return this.openApp(data, []);
      }
    }
  }

  /**
   * Activate the window the most forward and non-minimized.
   */
  activateMostVisibleWindow() {
    if (this._windows.length === 0) {
      return;
    }

    let currentWindowWithMaxZIndex;
    let maxZindex = -Infinity;
    for (const w of this._windows) {
      if (!w.isMinimizedOrMinimizing()) {
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
   * Launch an application from its executable's `data` property and get its
   * return values (element and various lifecycle functions).
   * @param {string} method - Either "create" for the default app launch, or the
   * method name of the various other features they may provide (e.g. a
   * file-picker may provide other entry points for opening and saving files).
   * @param {Object} appData - The `data` property from an executable, which
   * describes how to actually launch the application.
   * @param {Array.<string>} appArgs - The arguments that should be communicated
   * to the application when launching it.
   * @param {Object} env - The `env` object providing some desktop context and
   * API to applications.
   * @param {AbortSignal} abortSignal - `AbortSignal` which triggers when the
   * application is closed.
   * @returns {Promise.<Object>} - Promise which resolves when and if it
   * succeded to launch the application, with the payload obtained from
   * launching it.
   */
  async _launchAppFromAppData(method, appData, appArgs, env, abortSignal) {
    if (appData.website) {
      if (method !== "create") {
        console.warn('Not calling "create" on an i-frame application.');
      }
      const iframeContainer = createAppIframe(appData.website);
      const element = iframeContainer;
      const onActivate = iframeContainer.focus.bind(iframeContainer);
      return { element, onActivate };
    } else if (appData.lazyLoad) {
      return await this._launchAppFromScript(
        appData.lazyLoad,
        method,
        appArgs,
        env,
        abortSignal,
      );
    } else {
      throw new Error("Unknown application data format.");
    }
  }

  /**
   * Launch an application from its external script's URL and get its return
   * values (element and various lifecycle functions).
   * @param {string} scriptUrl
   * @param {string} method - Either "create" for the default app launch, or the
   * method name of the various other features they may provide (e.g. a
   * file-picker may provide other entry points for opening and saving files).
   * @param {Array.<string>} appArgs - The arguments that should be communicated
   * to the application when launching it.
   * @param {Object} env - The `env` object providing some desktop context and
   * API to applications.
   * @param {AbortSignal} abortSignal - `AbortSignal` which triggers when the
   * application is closed.
   * @returns {Promise.<Object>} - Promise which resolves when and if it
   * succeded to launch the application, with the payload obtained from
   * launching it.
   */
  async _launchAppFromScript(scriptUrl, method, appArgs, env, abortSignal) {
    const appVal = await import(scriptUrl);
    if (typeof appVal?.[method] !== "function") {
      throw new Error(
        "Empty application JS file. " +
          `Please export a function called "${method}" in it.`,
      );
    }

    const appRet = await appVal[method](appArgs, env, abortSignal);

    let element;
    let onActivate;
    let onDeactivate;
    let onClose;
    if (appRet?.element == null) {
      if (Array.isArray(appRet?.sidebar) && appRet.sidebar.length > 0) {
        const sidebarInfo = constructAppWithSidebar(
          appRet.sidebar,
          abortSignal,
        );
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

  _createFilePickerOpen(appStack, appWindow, config, appAbortSignal) {
    return new Promise(async (resolveFilePicker, rejectFilePicker) => {
      let filePickerElt;
      const fileOpenerAbortCtrl = createLinkedAbortController(appAbortSignal);
      try {
        const providers = await filesystem.readFile(
          "/system/providers.config.json",
          "object",
        );
        if (
          !providers.filePickerOpen ||
          providers.filePickerOpen.length === 0
        ) {
          rejectFilePicker(
            new Error("No file picker provider found in this system."),
          );
          return;
        }
        const filePickerApp = await filesystem.readFile(
          providers.filePickerOpen[0],
          "object",
        );
        const appObj = await this._launchAppFromAppData(
          "createFileOpener",
          filePickerApp.data,
          [config],
          // TODO: More centralized and normalized env construction?
          {
            appUtils,
            getImageRootPath: () => IMAGE_ROOT_PATH,
            getVersion: () => __VERSION__,
            CONSTANTS,
            open: onFilesOpened,
            filesystem,
          },
          fileOpenerAbortCtrl.signal,
        );
        filePickerElt = appObj.element;
        appStack.push(appObj, appWindow.isActivated());
      } catch (err) {
        rejectFilePicker(err);
      }

      function onFilesOpened(files) {
        fileOpenerAbortCtrl.abort();
        appStack.popElement(filePickerElt, appWindow.isActivated());
        const proms = files.map(async (filePath) => {
          const data = await filesystem.readFile(filePath, "arraybuffer");
          return {
            filename: getName(filePath),
            data,
          };
        });
        Promise.all(proms).then(resolveFilePicker, rejectFilePicker);
      }
    });
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
 * @returns {SpinnerPlaceholderApp}
 */
function getSpinnerApp() {
  const placeholderElt = document.createElement("div");
  applyStyle(placeholderElt, {
    height: "100%",
    width: "100%",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "var(--window-content-bg)",
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

function getErrorApp(err) {
  const errorElt = document.createElement("div");
  applyStyle(errorElt, {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "var(--window-content-bg)",
    padding: "10px",
    overflow: "auto",
  });
  errorElt.appendChild(strHtml`<div>
<h2>Oh no! This application crashed... 😿</h2>
<p>Failed to load this application due to the following error:</p>
<p style="font-family:monospace">${err.toString()}</p>
</div>
`);
  return { element: errorElt };
}

/**
 * Construct the content part of an app with a sidebar corresponding to the
 * given `sections` object.
 *
 * @param {Array.<Object>} sections - Array of objects, each of which describes
 * a single sidebar section.
 * Each object have the following properties:
 * -  `icon` (`string|undefined`): Optional icon describing the section.
 * -  `text` (`string`): Title describing the section.
 * -  `centered` (`boolean|undefined`): If `true`, the section should be
 *    centered on screen and have large paddings. Adapted for text-only
 *    sections.
 * -  `noPadding` (`boolean|undefined`): If `true`, we will ensure that there's
 *    no padding in the content. Adapted for i-frame. SHOULD NOT be combined
 *    with the `centered` option.
 * - `render` (Function): Function taking in argument an `AbortSignal` (so the
 *   section can know when to free resources) and returning the `HTMLElement`
 *   that will be the content of this section.
 * @param {AbortSignal} abortSignal - `AbortSignal` that will be provided to the
 * application so it can free the resources it reserved.
 * @returns {Object} - Object describing the application:
 * -  `element` (`HTMLElement`): The application's content, with a sidebar.
 * -  `focus` (`function`): Allows to focus the content of the application.
 */
export function constructAppWithSidebar(sections, abortSignal) {
  /**
   * Inner AbortController, used to free resources when navigating to the
   * different sections.
   * @type {AbortController}
   */
  let childAbortController = new AbortController();
  abortSignal.addEventListener("abort", () => {
    childAbortController.abort();
  });

  // const sidebarTitle = strHtml`<div class="sidebar-title">...</div>`;
  const container = document.createElement("div");
  container.className = "w-container";
  const content = document.createElement("div");
  content.className = "w-content";
  content.tabIndex = "0";
  const formattedSections = sections.slice().map((s, i) => {
    return { ...s, section: i };
  });
  formattedSections[0].active = true;
  const displaySection = (section) => {
    childAbortController.abort();
    childAbortController = new AbortController();
    content.innerHTML = "";
    if (formattedSections[section].noPadding) {
      content.style.padding = "0";
    } else {
      content.style.padding = "";
    }
    const wantedSection = formattedSections[section];
    const innerContentElt = wantedSection.render(childAbortController.signal);
    if (wantedSection.centered) {
      innerContentElt.classList.add("w-content-centered");
    }
    content.appendChild(innerContentElt);
    content.focus({ preventScroll: true });
  };
  const sidebar = constructSidebarElt(formattedSections, (section) => {
    displaySection(section);
    content.scrollTo(0, 0);
  });
  container.appendChild(sidebar);
  container.appendChild(content);
  displaySection(0);
  return {
    element: container,
    focus: () => content.focus({ preventScroll: true }),
  };
}
