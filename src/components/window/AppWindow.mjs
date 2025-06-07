import {
  EventEmitter,
  addAbortableEventListener,
  getMaxDesktopDimensions,
} from "../../utils.mjs";
import * as CONSTANTS from "../../constants.mjs";
import { SETTINGS } from "../../settings.mjs";
import {
  enterFullFullScreen,
  exitAllFullScreens,
  isFullscreenFull,
  isFullscreen,
} from "./fullscreen.mjs";
import {
  calculateOutOfBounds,
  getLeftPositioning,
  getTopPositioning,
  getWindowHeight,
  getWindowWidth,
  isPercentLeftPositioned,
  isPercentTopPositioned,
  setLeftPositioning,
  setTopPositioning,
  setWindowHeight,
  setWindowWidth,
} from "./position_utils.mjs";
import { handleResizeAndMove } from "./resize_and_move.mjs";
import { keepWindowActiveInCurrentEventLoopIteration } from "./utils.mjs";
import setUpContextMenu from "../context-menu.mjs";

const {
  WINDOW_MIN_WIDTH,
  WINDOW_MIN_HEIGHT,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  EXIT_FULLSCREEN_ANIM_TIMER,
  OPEN_APP_ANIM_TIMER,
  CLOSE_APP_ANIM_TIMER,
  MINIMIZE_APP_ANIM_TIMER,
  DEMINIMIZE_APP_ANIM_TIMER,
  WINDOW_OOB_SECURITY_PIX,
} = CONSTANTS;

const contextMenuWrapperElt = document.getElementById("context-menu-wrapper");

export default class AppWindow extends EventEmitter {
  /**
   * @param {Object} appObj - Object describing this application (result of
   * reading the corresponding app as an object in the filesystem).
   * @param {HTMLElement} initialContent - The application's initial content.
   * As it may be replaced at any time, the reference of that element will not
   * be stored.
   * @param {Object} options - Various options to configure how that new
   * application window will behave
   * @param {boolean} [options.skipAnim] - If set to `true`, we will not show the
   * open animation for this new window.
   * @param {boolean} [options.centered] - If set to `true`, the application
   * window will be centered relative to the desktop in which it can be moved.
   */
  constructor(appObj, initialContent, { skipAnim, centered } = {}) {
    super();

    /**
     * Identifier for this application.
     * TODO: A window shouldn't care about the app's id I guess
     * @type {string}
     */
    this.appId = appObj.id;
    /**
     * The default height the window should have, in pixels.
     * Can be defined as a function for when the application wants to define
     * it in function of the minimum height, minimum width, maximum height and
     * maximum width currently available.
     * @type {number|Function}
     */
    this.defaultHeight = appObj.data.defaultHeight ?? DEFAULT_WINDOW_HEIGHT;
    /**
     * The default width the window should have, in pixels.
     * Can be defined as a function for when the application wants to define
     * it in function of the minimum height, minimum width, maximum height and
     * maximum width currently available.
     * @type {number|Function}
     */
    this.defaultWidth = appObj.data.defaultWidth ?? DEFAULT_WINDOW_WIDTH;
    /**
     * Will allow to free resources linked to that window.
     * @private
     * @type {AbortController}
     */
    this._abortController = new AbortController();
    /**
     * The `HTMLElement` representing the whole window.
     * Including title bar, content and borders.
     * @type {HTMLElement}
     */
    const appContainer = constructVisibleWindowScaffolding(
      (appObj.icon ?? "") + " " + (appObj.title ?? ""),
    );
    appContainer.appendChild(initialContent);
    this.element = document.createElement("div");
    this.element.appendChild(appContainer);

    /**
     * Stores coordinates and dimensions for later retrieval.
     * Used e.g. when exiting fullscreen mode.
     * @type {Object|null}
     */
    this._savedCoordinates = null;

    /**
     * Under some complex rules and configs, the window may go out of the
     * its parent container.
     * When that's the case, we just want to keep the same amount out of the
     * container on resize (both of the page and the window) etc.
     * No more no less;
     * @type {Object}
     */
    this._oobDistances = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };

    this.element.className = "window";
    this._setPositionAndSize({
      isInitialization: true,
      centerOnDesktop: centered,
    });
    this._saveCurrentCoordinates();
    this._setupWindowEvents();
    if (!skipAnim) {
      this._performWindowTransition("open");
    }
  }

  setFullscreen() {
    enterFullFullScreen(this.element);
  }

  /**
   * Run animation for the closing window and removes it from the DOM.
   * Might activate the next visible window as a side-effect.
   */
  close() {
    this._performWindowTransition("close");
    this._abortController.abort();
    this.trigger("closing");
    this.removeEventListener();
  }

  isClosed() {
    return this._abortController.signal.aborted;
  }

  isActivated() {
    return this.element.classList.contains("active");
  }

  updateTitle(newIcon, newTitle) {
    const titleElt = this.element.getElementsByClassName("w-title")[0];
    if (titleElt) {
      titleElt.textContent = (newIcon ?? "") + " " + (newTitle ?? "");
    }
  }

  /**
   * Function to toggle the activation of the current window (e.g. when clicking
   * on it in the taskbar).
   */
  toggleActivation() {
    if (this.isMinimizedOrMinimizing()) {
      // If minimized, deminimize and activate it
      if (!this._performWindowTransition("deminimize")) {
        return;
      }
      this.activate();
    } else if (this.isActivated()) {
      // If active, minimize it
      this.minimize();
    } else {
      // If not active nor minimized, activate it
      this.activate();
    }
  }

  minimize() {
    this.element.classList.remove("active");
    if (!this._performWindowTransition("minimize")) {
      return;
    }

    this.trigger("minimizing");
  }

  deminimize() {
    if (this.isMinimizedOrMinimizing()) {
      this._performWindowTransition("deminimize");
    }
  }

  /**
   * @returns {boolean}
   */
  isMinimizedOrMinimizing() {
    return (
      this.element.classList.contains("minimized") ||
      this.element.dataset.state === "minimize"
    );
  }

  /**
   * Bring this window to the front.
   */
  activate() {
    if (this.isActivated()) {
      return;
    }
    if (this.element.dataset.state === "close") {
      return;
    }
    keepWindowActiveInCurrentEventLoopIteration(this.element);
    this.element.classList.add("active");
    this.trigger("activated");
  }

  /**
   * Bring window to back.
   */
  deActivate() {
    if (!this.element.classList.contains("active")) {
      return;
    }
    this.element.classList.remove("active");
    this.trigger("deactivated");
    if (this.element.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  /**
   * Move/resize current window `HTMLElement`.
   * @param {Object} position
   * @param {number|undefined} [position.left] - The absolute position from the
   * left of its container, in pixels.
   * Wont' change it this parameter is omitted.
   * @param {number|undefined} [position.top] - The absolution position from the
   * top of its container, in pixels.
   * Wont' change it this parameter is omitted.
   * @param {number|undefined} [position.height] - The new window height, in
   * pixels.
   * Wont' change it this parameter is omitted.
   * @param {number|undefined} [position.width] - The new window width, in
   * pixels.
   * Wont' change it this parameter is omitted.
   * @param {Object|undefined} [position.desktopDimensions] - Communicate the
   * maximum width and height of the parent container in pixels as two number
   * properties called `maxWidth` and `maxHeight` respectively.
   * Will be re-computed if this parameter is omitted.
   */
  move({ left, top, height, width, desktopDimensions }) {
    let newHeight;
    let newWidth;

    const maxDesktopDimensions =
      desktopDimensions ??
      getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue(),
      );

    if (height !== undefined) {
      setWindowHeight(this.element, height);
      newHeight = height;
    } else {
      newHeight = getWindowHeight(this.element);
    }

    if (width !== undefined) {
      setWindowWidth(this.element, width);
      newWidth = width;
    } else {
      newWidth = getWindowWidth(this.element);
    }

    if (left !== undefined) {
      setLeftPositioning(this.element, left);
    } else {
      left = getLeftPositioning(this.element);
    }
    if (top !== undefined) {
      setTopPositioning(this.element, top);
    } else {
      top = getTopPositioning(this.element);
    }

    const minBounds = { minXBound: 0, minYBound: 0 };
    const maxBounds = {
      maxXBound: maxDesktopDimensions.maxWidth - newWidth,
      maxYBound: maxDesktopDimensions.maxHeight - newHeight,
    };
    this._oobDistances = calculateOutOfBounds(minBounds, maxBounds, left, top);
  }

  getPlacement() {
    return {
      top: getTopPositioning(this.element),
      left: getLeftPositioning(this.element),
      height: getWindowHeight(this.element),
      width: getWindowWidth(this.element),
    };
  }

  _onMaximizeButton() {
    if (!isFullscreenFull(this.element)) {
      enterFullFullScreen(this.element);
    } else {
      this._performWindowTransition("exit-fullscreen");
    }

    const maximizeBtn = this.element.getElementsByClassName("w-maximize")[0];
    if (!maximizeBtn) {
      return;
    }
    if (isFullscreenFull(this.element)) {
      maximizeBtn.title = "Restore";
    } else {
      maximizeBtn.title = "Maximize";
    }
  }

  /**
   * @private
   * @param {string} stateUpdate
   * @returns {boolean}
   */
  _performWindowTransition(stateUpdate) {
    if (this.element.dataset.state === "close") {
      if (this.element.parentElement) {
        this.element.parentElement.removeChild(this.element);
      }
      return false;
    }

    const prevState = this.element.dataset.state;
    switch (prevState) {
      case "":
        break;
      case "close":
        return false;
      case "open":
        this.element.style.animation = "";
        break;
      case "minimize":
        this.element.classList.add("minimized");
        this.element.style.animation = "";
        break;
      case "deminimize":
        this.element.classList.remove("deminimize-animation");
        this.element.style.animation = "";
        this.trigger("deminimized");
        break;
      case "exit-fullscreen":
        this.element.style.transition = "";
        break;
    }

    this.element.dataset.state = stateUpdate;
    switch (stateUpdate) {
      case "":
        return true;

      case "open":
        this.element.style.animation =
          "openAppAnim " +
          (OPEN_APP_ANIM_TIMER / 1000).toFixed(2) +
          "s ease-out";
        this.element.onanimationend = () => {
          this._performWindowTransition("");
        };

        return true;

      case "minimize":
        this.element.style.animation =
          "minimizeAnim " +
          (MINIMIZE_APP_ANIM_TIMER / 1000).toFixed(2) +
          "s ease-out forwards";
        this.element.onanimationend = () => {
          this._performWindowTransition("");
          if (this.isMinimizedOrMinimizing()) {
            this.trigger("minimized");
          }
        };
        return true;

      case "deminimize":
        this.element.style.animation =
          "deminimizeAnim " +
          (DEMINIMIZE_APP_ANIM_TIMER / 1000).toFixed(2) +
          "s ease-out";
        this.element.classList.remove("minimized");
        this.element.onanimationend = () => {
          this._performWindowTransition("");
        };
        return true;

      case "close":
        this.element.style.animation =
          "closeAppAnim " +
          (CLOSE_APP_ANIM_TIMER / 1000).toFixed(2) +
          "s ease-out";
        this.element.onanimationend = () => {
          this._performWindowTransition("");
        };
        return true;

      case "exit-fullscreen":
        this.element.style.transition = ["height", "width", "top", "left"]
          .map(
            (direction) =>
              direction +
              " " +
              (EXIT_FULLSCREEN_ANIM_TIMER / 1000).toFixed(2) +
              "s ease-in",
          )
          .join(",");
        exitAllFullScreens(this.element, this._savedCoordinates);
        this._setPositionAndSize({
          isInitialization: false,
          centerOnDesktop: false,
        });
        setTimeout(() => {
          this._performWindowTransition("");
        }, EXIT_FULLSCREEN_ANIM_TIMER);
        return true;
    }
    return true;
  }

  _setPositionAndSize({ isInitialization, centerOnDesktop }) {
    const minWindowWidth = WINDOW_MIN_WIDTH;
    const minWindowHeight = WINDOW_MIN_HEIGHT;

    const maxDesktopDimensions = getMaxDesktopDimensions(
      SETTINGS.taskbarLocation.getValue(),
      SETTINGS.taskbarSize.getValue(),
    );

    const maxAbsoluteWidth =
      maxDesktopDimensions.maxWidth +
      (SETTINGS.oobWindows.getValue()
        ? this._oobDistances.left + this._oobDistances.right
        : 0);
    const maxWindowWidth = Math.max(minWindowWidth, maxAbsoluteWidth);

    const maxAbsoluteHeight =
      maxDesktopDimensions.maxHeight +
      (SETTINGS.oobWindows.getValue()
        ? this._oobDistances.top + this._oobDistances.bottom
        : 0);
    const maxWindowHeight = Math.max(minWindowHeight, maxAbsoluteHeight);

    let left;
    let top;

    let wantedWHeight;
    let wantedWWidth;

    if (isInitialization) {
      wantedWHeight =
        this.defaultHeight +
        SETTINGS.windowHeaderHeight.getValue() +
        SETTINGS.windowBorderSize.getValue();
      wantedWWidth =
        this.defaultWidth + SETTINGS.windowBorderSize.getValue() * 2;

      if (wantedWWidth > maxWindowWidth) {
        wantedWWidth = maxWindowWidth;
      }
      if (wantedWHeight > maxWindowHeight) {
        wantedWHeight = maxWindowHeight;
      }
      wantedWHeight = Math.ceil(Math.max(minWindowHeight, wantedWHeight));
      wantedWWidth = Math.ceil(Math.max(minWindowWidth, wantedWWidth));

      if (centerOnDesktop || (wantedWWidth + 200) * 2 >= maxWindowWidth) {
        left = Math.ceil(Math.max((maxWindowWidth - wantedWWidth) / 2, 0));
      } else {
        left = 200;
      }
      if (centerOnDesktop || (wantedWHeight + 100) * 2 >= maxWindowHeight) {
        top = Math.ceil(Math.max((maxWindowHeight - wantedWHeight) / 2, 0));
      } else {
        top = 100;
      }
    } else {
      if (isFullscreen(this.element)) {
        return;
      }
      // This is just an update (e.g. after a resize), not the initial setup.
      // Check that everything is right according to the config

      const prevHeight = getWindowHeight(this.element);
      wantedWHeight = Math.max(
        Math.min(prevHeight, maxWindowHeight),
        minWindowHeight,
      );

      const prevWidth = getWindowWidth(this.element);
      wantedWWidth = Math.max(
        Math.min(prevWidth, maxWindowWidth),
        minWindowWidth,
      );

      // =========== Compute `left`

      const currLeft = getLeftPositioning(this.element);
      if (SETTINGS.absoluteWindowPositioning.getValue()) {
        if (currLeft < 0 && !SETTINGS.oobWindows.getValue()) {
          left = 0; // initialize left to `0` to be sure.
        }
        const rightSidePx = currLeft + wantedWWidth;
        if (rightSidePx > maxWindowWidth) {
          // this window goes further than what's on screen + previous oob to the right
          // In this case, just move a little to the left to re-enter that limit

          if (maxWindowWidth - rightSidePx > currLeft) {
            // We would out of bounds on the left side. Reset to `0`.
            left = 0;
          } else {
            left = currLeft - (rightSidePx - maxWindowWidth);
          }
        } else if (isPercentLeftPositioned(this.element)) {
          // Ensure we set the right unit of positioning
          setLeftPositioning(this.element, currLeft);
        }
      } else {
        // relative positioning

        if (!isPercentLeftPositioned(this.element)) {
          // Ensure we set the right unit of positioning
          setLeftPositioning(this.element, currLeft);
        }
        const rightSidePx = currLeft + wantedWWidth;
        if (rightSidePx > maxWindowWidth) {
          if (maxWindowWidth - currLeft < minWindowWidth) {
            wantedWWidth = minWindowWidth;
            left = maxWindowWidth - minWindowWidth;
          } else {
            wantedWWidth = maxWindowWidth - currLeft;
          }
        }
      }

      if (
        (left ?? currLeft) < 0 &&
        (left ?? currLeft) + wantedWWidth < WINDOW_OOB_SECURITY_PIX
      ) {
        left = WINDOW_OOB_SECURITY_PIX - wantedWWidth;
      } else if (
        maxAbsoluteWidth - (left ?? currLeft) <
        WINDOW_OOB_SECURITY_PIX
      ) {
        left = maxAbsoluteWidth - WINDOW_OOB_SECURITY_PIX;
      }

      // =========== Compute `top`

      const currTop = getTopPositioning(this.element);
      if (SETTINGS.absoluteWindowPositioning.getValue()) {
        const currTop = getTopPositioning(this.element);
        if (currTop < 0 && !SETTINGS.oobWindows.getValue()) {
          top = 0; // initialize top to `0` to be sure.
        }
        const bottomSidePx = currTop + wantedWHeight;
        if (bottomSidePx > maxWindowHeight) {
          // this window goes further than what's on screen + previous oob to the bottom
          // In this case, just move a little to the top to re-enter that limit

          if (maxWindowHeight - bottomSidePx > currTop) {
            // We would out of bounds on the top side. Reset to the min.
            top = 0;
          } else {
            top = currTop - (bottomSidePx - maxWindowHeight);
          }
        } else if (isPercentTopPositioned(this.element)) {
          // Ensure we set the right unit of positioning
          setTopPositioning(this.element, currTop);
        }
      } else {
        // relative positioning
        if (!isPercentTopPositioned(this.element)) {
          // Ensure we set the right unit of positioning
          setTopPositioning(this.element, currTop);
        }
        const bottomSidePx = currTop + wantedWHeight;
        if (bottomSidePx > maxWindowHeight) {
          if (maxWindowHeight - currTop < minWindowHeight) {
            wantedWHeight = minWindowHeight;
            top = maxWindowHeight - minWindowHeight;
          } else {
            wantedWHeight = maxWindowHeight - currTop;
          }
        }
      }

      const oobsafetyTop = Math.max(
        SETTINGS.windowHeaderHeight.getValue() - 15,
        0,
      );
      if (
        (top ?? currTop) < 0 &&
        (top ?? currTop) + wantedWHeight < oobsafetyTop
      ) {
        top = oobsafetyTop - wantedWHeight;
      } else if (
        maxAbsoluteHeight - (top ?? currTop) <
        WINDOW_OOB_SECURITY_PIX
      ) {
        left = maxAbsoluteHeight - WINDOW_OOB_SECURITY_PIX;
      }
    }
    this.move({
      left,
      top,
      height: wantedWHeight,
      width: wantedWWidth,
      desktopDimensions: maxDesktopDimensions,
    });
  }

  /**
   * Register all DOM events linked to this window: to close deactivate,
   * resize etc.
   */
  _setupWindowEvents() {
    const abortSignal = this._abortController.signal;
    const windowElt = this.element;
    const header = windowElt.getElementsByClassName("w-header")[0];
    const closeBtn = header.getElementsByClassName("w-close")[0];
    const minimizeBtn = header.getElementsByClassName("w-minimize")[0];
    const maximizeBtn = header.getElementsByClassName("w-maximize")[0];

    setUpContextMenu({
      element: header,
      filter: (e) => header.contains(e.target),
      abortSignal,
      actions: [
        {
          name: "minimize",
          title: "Minimize window",
          onClick: () => this.minimize(),
        },
        {
          name: "fullscreen",
          title: "Toggle window maximization",
          onClick: () => {
            if (isFullscreen(windowElt)) {
              this._performWindowTransition("exit-fullscreen");
              this.activate();
            } else {
              enterFullFullScreen(windowElt);
              this.activate();
            }
          },
        },
        {
          name: "close",
          title: "Close window",
          onClick: () => this.close(),
        },
        {
          name: "deactivate",
          title: "Make window inactive",
          onClick: () => this.deActivate(),
        },
      ],
    });

    addAbortableEventListener(windowElt, "mousedown", abortSignal, () => {
      this.activate();
    });

    handleResizeAndMove(
      windowElt,
      { minHeight: WINDOW_MIN_HEIGHT, minWidth: WINDOW_MIN_WIDTH },
      {
        activateWindow: () => this.activate(),
        getOobDistances: () => this._oobDistances,
        updateOobDistances: (update) =>
          (this._oobDistances = { ...this._oobDistances, ...update }),
        exitFullScreen: (soft) => {
          this._performWindowTransition(""); // Remove previous transition if one
          exitAllFullScreens(windowElt, soft ? null : this._savedCoordinates);
          this._setPositionAndSize({
            isInitialization: false,
            centerOnDesktop: false,
          });
        },
        saveCurrentCoordinates: () => this._saveCurrentCoordinates(),
      },
      abortSignal,
    );

    addAbortableEventListener(header, "dblclick", abortSignal, () => {
      if (!SETTINGS.dblClickHeaderFullScreen.getValue()) {
        return;
      }
      if (isFullscreen(windowElt)) {
        this._performWindowTransition("exit-fullscreen");
      } else {
        enterFullFullScreen(windowElt);
      }
    });
    addAbortableEventListener(windowElt, "mousedown", abortSignal, () => {
      this.activate();
    });
    if (minimizeBtn) {
      addAbortableEventListener(minimizeBtn, "click", abortSignal, () => {
        this.minimize();
      });
      addAbortableEventListener(minimizeBtn, "keydown", abortSignal, (e) => {
        if (e.key === "Enter") {
          this.minimize();
        }
      });
    }
    if (maximizeBtn) {
      addAbortableEventListener(maximizeBtn, "click", abortSignal, () => {
        this._onMaximizeButton(windowElt);
      });
      addAbortableEventListener(maximizeBtn, "keydown", abortSignal, (e) => {
        if (e.key === "Enter") {
          this._onMaximizeButton();
        }
      });
    }
    if (closeBtn) {
      addAbortableEventListener(closeBtn, "click", abortSignal, () => {
        this.close();
      });
      addAbortableEventListener(closeBtn, "keydown", abortSignal, (e) => {
        if (e.key === "Enter") {
          this.close();
        }
      });
    }

    // Block clicks clearly on buttons from allowing to move or resize windows.
    [minimizeBtn, maximizeBtn, closeBtn].forEach((btn) => {
      if (btn) {
        addAbortableEventListener(
          btn,
          "touchstart",
          abortSignal,
          (e) => {
            e.stopPropagation();
          },
          { passive: true },
        );
        addAbortableEventListener(btn, "mousedown", abortSignal, (e) => {
          if (e.button !== 0) {
            // not left click
            return;
          }
          e.stopPropagation();
        });
      }
    });

    addAbortableEventListener(document, "focusin", abortSignal, (evt) => {
      if (contextMenuWrapperElt.contains(evt.target)) {
        // Very ugly exception for context menus
        return;
      }
      if (windowElt.contains(evt.target)) {
        this.activate(windowElt);
      } else {
        this.deActivate(windowElt);
      }
    });

    const reCheckPlacement = () => {
      requestAnimationFrame(() => {
        this._setPositionAndSize({
          isInitialization: false,
          centerOnDesktop: false,
        });
      });
    };

    // Re-draw window placement if the window is resized
    addAbortableEventListener(
      window,
      "resize",
      this._abortController.signal,
      reCheckPlacement,
    );
    SETTINGS.taskbarLocation.onUpdate(reCheckPlacement, {
      clearSignal: this._abortController.signal,
    });
    SETTINGS.taskbarSize.onUpdate(reCheckPlacement, {
      clearSignal: this._abortController.signal,
    });
    SETTINGS.oobWindows.onUpdate(reCheckPlacement, {
      clearSignal: this._abortController.signal,
    });
  }

  _saveCurrentCoordinates() {
    this._savedCoordinates = {
      width: getWindowWidth(this.element),
      height: getWindowHeight(this.element),
      left: getLeftPositioning(this.element),
      top: getTopPositioning(this.element),
    };
  }
}

function constructVisibleWindowScaffolding(title) {
  const visibleElt = document.createElement("div");
  visibleElt.className = "w-visible";
  visibleElt.innerHTML = `<div class="w-header">
  <div class="w-title">${title}</div>
  <div class="w-controls">
    <div class="w-button w-minimize" aria-label="Minimize window" title="Minimize" tabindex="0"><span class="w-button-icon"></span></div>
    <div class="w-button w-maximize" aria-label="Maximize window" title="Maximize" tabindex="0"><span class="w-button-icon"></span></div>
    <div class="w-button w-close" aria-label="close window" title="Close" tabindex="0"><span class="w-button-icon"></span></div>
  </div>
</div>`;
  return visibleElt;
}
