import * as CONSTANTS from "../constants.mjs";
import { SETTINGS } from "../settings.mjs";
import filesystem, { getName } from "../filesystem/filesystem.mjs";
import AppWindow from "../components/window/AppWindow.mjs";
import notificationEmitter from "../components/notification_emitter.mjs";
import {
  getSpinnerApp,
  createExternalIframe,
  createLinkedAbortController,
  getErrorApp,
  getMaxDesktopDimensions,
  parseAppDefaultBackground,
  constructAppStyleObject,
} from "../utils.mjs";
import { getAppUtils } from "../app-lib/app-utils.mjs";
import { constructAppWithSidebar } from "../app-lib/sidebar.mjs";
import WindowedApplicationStack from "./windowed_application_stack.mjs";
import { launchSandboxedApp } from "./launch_sandboxed_app.mjs";
import PathTokenCreator from "./path_token_creator.mjs";

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
     * @type {Array.<{appWindow: AppWindow, appId: string}>}
     * @private
     */
    this._windows = [];

    /**
     * Allows to add and remove tasks to the taskbar.
     * @type {Object}
     * @private
     */
    this._taskbarManager = taskbarManager;

    /**
     * Encrypt and decrypt file system paths to tokens so the app is not aware
     * of the actual file system paths.
     */
    this._pathTokenCreator = new PathTokenCreator();

    // Now deactivate windows when the desktop is clicked on, as it seems to me
    // like it would be expected.
    //
    // With a key exception: If a click began inside a window do not deactivaate
    // that window (this also seems expected, especially when there are drag and
    // drop, selection zones, etc.).
    let mousedownTarget = null;
    this._desktopElt.addEventListener("mousedown", (e) => {
      mousedownTarget = e.target;
    });

    this._desktopElt.addEventListener("click", (e) => {
      if (e.target === this._desktopElt) {
        // deactivate all windows
        this._windows.forEach(({ appWindow }) => {
          if (mousedownTarget && appWindow.element.contains(mousedownTarget)) {
            return;
          }
          appWindow.deActivate();
        });
      }
      mousedownTarget = null;
    });
  }

  /**
   * Open the given application, and optionally open a window for it.
   * @param {string} appPath - FileSystem path to the application to run (e.g.
   * `/apps/about.run`).
   * @param {Array.<Object>} appArgs - The application's arguments.
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
    let app;
    try {
      app =
        typeof appPath === "string"
          ? await filesystem.readFile(appPath, "object")
          : appPath;
    } catch (err) {
      if (err.code === "NoEntryError") {
        notificationEmitter.error(
          "Invalid app",
          `"${appPath}" is not a valid app path`,
        );
      } else {
        notificationEmitter.error(
          "Invalid app",
          `"${appPath}" does not lead to a valid executable`,
        );
      }
      throw err;
    }

    // TODO: check app format here

    if (!app) {
      notificationEmitter.error(
        "Invalid app",
        `Cannot run wanted application: the app is not valid.`,
      );
      throw new Error("Invalid app");
    }

    if (app.onlyOne) {
      // If only instance of the app can be created, check if this window already
      // exists. If so, activate it.
      const createdWindowForApp = this._getNextWindowForApp(app.id);
      if (createdWindowForApp !== null) {
        createdWindowForApp.appWindow.deminimize();
        createdWindowForApp.appWindow.activate();
        return false;
      }
    }

    /** `AbortController` linked to the life of this application. */
    const applicationAbortCtrl = new AbortController();

    const defaultBackground = parseAppDefaultBackground(
      app.data.defaultBackground,
    );

    /**
     * Object defining metadata on the application currently visible and
     * interactive in the window.
     * We begin by placing the spinner app in it, just in case the application
     * takes time to load.
     */
    const appStack = new WindowedApplicationStack(
      getSpinnerApp(defaultBackground),
      true,
    );

    /** Window containing the application. */
    const appWindow = new AppWindow(appStack.getElement(), {
      ...options,
      defaultHeight: app.data.defaultHeight,
      defaultWidth: app.data.defaultWidth,
      defaultIcon: app.icon,
      defaultTitle: app.title,
    });

    this._windows.push({ appId: app.id, appWindow });

    // Move a little perfectly-overlapping windows
    this._checkRelativeWindowPlacement(appWindow);

    this._taskbarManager.addWindow(appWindow, app, {
      isWindowActivated: () => appWindow.isActivated(),
      isWindowMinimized: () => appWindow.isMinimizedOrMinimizing(),
      minimizeWindow: () => appWindow.minimize(),
      restoreWindow: () => appWindow.deminimize(),
      activateWindow: () => appWindow.activate(),
      closeWindow: () => appWindow.close(),
    });

    appWindow.addEventListener("closing", () => {
      applicationAbortCtrl.abort();
      const windowIndex = this._windows.findIndex(
        (elt) => elt.appWindow === appWindow,
      );
      if (windowIndex !== -1) {
        // Remove from array and activate next window
        this._windows.splice(windowIndex, 1);
        this.activateMostVisibleWindow();
      }
      this._taskbarManager.remove(appWindow);
      appStack.onClose();
    });

    appWindow.addEventListener("minimizing", () => {
      this.activateMostVisibleWindow();

      // We uglily cheat a little by giving the current window a much more
      // proeminent z-index when minimizing, so that the next window is not
      // directly in front of the minimizing one, which would ruin the effect
      appWindow.element.style.zIndex = 500;

      this._taskbarManager.deActiveWindow(appWindow);

      // Translation of the minimized window toward the taskbar
      const taskRect =
        this._taskbarManager.getTaskBoundingClientRect(appWindow);
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
        if (w.appWindow !== appWindow) {
          w.appWindow.deActivate();
        }
        windowEltsWithZIndex.push({
          element: w.appWindow.element,
          zIndex:
            parseInt(w.appWindow.element.style.zIndex, 10) ||
            BASE_WINDOW_Z_INDEX,
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
      this._taskbarManager.setActiveWindow(appWindow);

      appStack.onActivate();
    });

    appWindow.addEventListener("deactivated", () => {
      this._taskbarManager.deActiveWindow(appWindow);
      appStack.onDeactivate();
    });

    appWindow.activate();
    this._taskbarManager.setActiveWindow(appWindow);

    if (options.fullscreen) {
      appWindow.setFullscreen();
    }

    const env = this._constructEnvObject(
      app.data.dependencies,
      appStack,
      appWindow,
      applicationAbortCtrl.signal,
    );

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
        appStack.replaceAll(getErrorApp(err).element, appWindow.isActivated());
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
        notificationEmitter.error(
          "Unable to open file",
          `Cannot open file "${data}".\n\nUnknown extension`,
        );
        return;
      }
      const extension = data.substring(lastIdxOfDot + 1);
      if (!extension) {
        notificationEmitter.error(
          "Unable to open file",
          `Cannot open file "${data}".\n\nEmpty extension`,
        );
        return;
      }
      if (extension.includes("/")) {
        notificationEmitter.error(
          "Unable to open file",
          `Cannot open file "${data}".\n\nUnknown file extension`,
        );
        return;
      }
      const defaultApps = await filesystem.readFile(
        "/system32/default_apps.config.json",
        "object",
      );
      if (!defaultApps[extension]) {
        // No default app for this extension
        notificationEmitter.error(
          "Unable to open file",
          `Cannot open file "${data}".\n\nFound no default app for extension "${extension}".`,
        );
        return;
      }

      try {
        const openedFile = await filesystem.readFile(data, "arraybuffer");
        let token = null;
        try {
          token = await this._pathTokenCreator.encryptPath(data);
        } catch (err) {
          console.error("Cannot create path encrypted token:", err);
        }
        return this.openApp(defaultApps[extension], [
          {
            type: "file",
            filename: getName(data),
            data: openedFile,
            handle: token,
          },
        ]);
      } catch (err) {
        notificationEmitter.error(
          "Failed to run file",
          `Failed to run "${data}": ${err}`,
        );
        return;
      }
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
    for (const { appWindow } of this._windows) {
      if (!appWindow.isMinimizedOrMinimizing()) {
        const wZindex = parseInt(appWindow.element.style.zIndex, 10);
        if (!isNaN(wZindex) && wZindex >= maxZindex) {
          currentWindowWithMaxZIndex = appWindow;
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
   * @param {Array.<Object>} appArgs - The arguments that should be communicated
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
      const backgroundColor = parseAppDefaultBackground(
        appData.defaultBackground,
      );
      const iframeContainer = createExternalIframe(
        appData.website,
        backgroundColor,
      );
      const element = iframeContainer;
      const onActivate = iframeContainer.focus.bind(iframeContainer);
      return { element, onActivate };
    } else if (appData.lazyLoad) {
      if (appData.sandboxed && method === "create") {
        return launchSandboxedApp(appData, appArgs, env, abortSignal);
      }
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
   * @param {Array.<Object>} appArgs - The arguments that should be communicated
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

  _createFilePickerOpen(config, appStack, appWindow, appAbortSignal) {
    return new Promise(async (resolveFilePicker, rejectFilePicker) => {
      let filePickerElt;
      const fileOpenerAbortCtrl = createLinkedAbortController(appAbortSignal);
      try {
        const providers = await filesystem.readFile(
          "/system32/providers.config.json",
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

        const onFilesOpened = (files) => {
          fileOpenerAbortCtrl.abort();
          appStack.popElement(filePickerElt, appWindow.isActivated());
          resolveFilePicker(files);
        };

        const env = {
          ...this._constructEnvObject(
            filePickerApp.data.dependencies,
            appStack,
            appWindow,
            fileOpenerAbortCtrl.signal,
          ),
          onOpen: onFilesOpened,
        };
        const appObj = await this._launchAppFromAppData(
          "createFileOpener",
          filePickerApp.data,
          [config],
          env,
          fileOpenerAbortCtrl.signal,
        );
        filePickerElt = appObj.element;
        appStack.push(appObj, appWindow.isActivated());
      } catch (err) {
        rejectFilePicker(err);
      }
    });
  }

  _createFilePickerSave(config, appStack, appWindow, appAbortSignal) {
    return new Promise(async (resolveFilePicker, rejectFilePicker) => {
      let filePickerElt;
      const fileSaverAbortCtrl = createLinkedAbortController(appAbortSignal);
      try {
        const providers = await filesystem.readFile(
          "/system32/providers.config.json",
          "object",
        );
        if (
          !providers.filePickerSave ||
          providers.filePickerSave.length === 0
        ) {
          rejectFilePicker(
            new Error("No file picker provider found in this system."),
          );
          return;
        }
        const filePickerApp = await filesystem.readFile(
          providers.filePickerSave[0],
          "object",
        );

        const onFileSaved = (fileInfo) => {
          if (fileInfo === null) {
            fileSaverAbortCtrl.abort();
            appStack.popElement(filePickerElt, appWindow.isActivated());
            resolveFilePicker(null);
            return;
          }
          fileSaverAbortCtrl.abort();
          appStack.popElement(filePickerElt, appWindow.isActivated());
          resolveFilePicker(fileInfo);
        };
        const env = {
          ...this._constructEnvObject(
            filePickerApp.data.dependencies,
            appStack,
            appWindow,
            fileSaverAbortCtrl.signal,
          ),
          onSaved: onFileSaved,
        };
        const appObj = await this._launchAppFromAppData(
          "createFileSaver",
          filePickerApp.data,
          [config],
          env,
          fileSaverAbortCtrl.signal,
        );
        filePickerElt = appObj.element;
        appStack.push(appObj, appWindow.isActivated());
      } catch (err) {
        rejectFilePicker(err);
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
      const { appWindow } = this._windows[windowIdx];
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

  /**
   * Construct `env` object that is given to application as their link to the
   * desktop element.
   * @param {Array.<string>} dependencies - The application's listed
   * dependencies.
   * @param {WindowedApplicationStack} appStack
   * @param {AppWindow} appWindow
   * @param {AbortSignal} abortSignal
   */
  _constructEnvObject(dependencies, appStack, appWindow, abortSignal) {
    /**
     * Construct `env` object that is given to application as their link to the
     * desktop element.
     */
    const env = {
      appUtils: getAppUtils(),
      getImageRootPath: () => IMAGE_ROOT_PATH,
      getVersion: () => __VERSION__,
      // TODO: With imediately-updating titles, it can look quite jumpy to first
      // update it to its initial title and then potentially update it once the
      // app is loaded... Find a solution.
      updateTitle: (newIcon, newTitle) => {
        appWindow.updateTitle(newIcon, newTitle);
        this._taskbarManager.updateTitle(appWindow, newIcon, newTitle);
      },
      closeApp: () => appWindow.close(),
      STYLE: constructAppStyleObject(),
    };

    if (Array.isArray(dependencies)) {
      if (dependencies.includes("CONSTANTS")) {
        // TODO: remove need for that one
        env.CONSTANTS = CONSTANTS;
      }
      if (dependencies.includes("settings")) {
        env.settings = SETTINGS;
      }
      if (dependencies.includes("filesystem")) {
        env.filesystem = filesystem;
      }
      if (dependencies.includes("notificationEmitter")) {
        env.notificationEmitter = notificationEmitter;
      }
      if (dependencies.includes("quickSave")) {
        env.quickSave = async (handle, content) => {
          const filePath = await this._pathTokenCreator.decryptPath(handle);
          if (!filePath) {
            throw new Error("Unknown file handle.");
          }
          return filesystem.writeFile(filePath, content);
        };
      }
      if (dependencies.includes("open")) {
        env.open = (path) => {
          if (Array.isArray(path)) {
            // TODO: multiple open in same app should be possible? E.g. image-viewer
            path.forEach((p) => this.open(p));
          } else {
            this.open(path);
          }
        };
      }
      if (dependencies.includes("filePickerOpen")) {
        env.filePickerOpen = (config) =>
          this._createFilePickerOpen(
            { type: "options", ...config },
            appStack,
            appWindow,
            abortSignal,
          ).then((files) =>
            Promise.all(
              files.map(async (filePath) => {
                const data = await filesystem.readFile(filePath, "arraybuffer");
                let token = null;
                try {
                  token = await this._pathTokenCreator.encryptPath(filePath);
                } catch (err) {
                  console.error("Cannot create path encrypted token:", err);
                }
                return {
                  filename: getName(filePath),
                  handle: token,
                  filePath: dependencies.includes("filesystem")
                    ? filePath
                    : null,
                  data,
                };
              }),
            ),
          );
      }
      if (dependencies.includes("filePickerSave")) {
        env.filePickerSave = (config) =>
          this._createFilePickerSave(
            { type: "options", ...config },
            appStack,
            appWindow,
            abortSignal,
          ).then(async (fileInfo) => {
            if (!fileInfo) {
              return;
            }
            let token = null;
            try {
              token = await this._pathTokenCreator.encryptPath(fileInfo.path);
            } catch (err) {
              console.error("Cannot create path encrypted token:", err);
            }
            return {
              filename: getName(fileInfo.path),
              filePath: dependencies.includes("filesystem")
                ? fileInfo.path
                : null,
              handle: token,
            };
          });
      }
    }
    return env;
  }
}
