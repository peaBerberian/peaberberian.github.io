// TODO: When closing a window in the preview, if it was the one focused, we
// lose focus until another one is focus. This is mainly annoying for
// Escape/directional keys management
// TODO: Escape might not work in general when the focus temporarily moved away.
// I think it's a more general issue where a proper abstraction distributing
// keyboard events to the right context (e.g. a desktop-global stack) would be
// useful.
// TODO:When closing a window in this WindowOverview, I see a brief flash at its
// place first. Like maybe a full background for a sub 100ms time on e.g.
// Chrome. Not sure what it is yet.

import setUpContextMenu from "../components/context-menu.mjs";

const OVERVIEW_ANIMATION_DURATION = 240;
const OVERVIEW_PADDING_MIN = 12;
const OVERVIEW_PADDING_MAX = 40;
const OVERVIEW_GAP_MIN = 10;
const OVERVIEW_GAP_MAX = 28;
const OVERVIEW_LABEL_HEIGHT = 34;
const OVERVIEW_WINDOW_Z_INDEX = 610;
const TOUCH_DRAG_START_DISTANCE = 8;
const TOUCH_DISMISS_DISTANCE_MIN = 72;
const TOUCH_DISMISS_DISTANCE_MAX = 160;

/**
 * Arranges application windows into a temporary, selectable overview.
 */
export default class WindowOverview {
  /**
   * @param {HTMLElement} desktopElt
   * @param {Function} getWindows - Returns the current AppWindow instances.
   * @param {Function} closeWindow - Closes an AppWindow through the manager.
   */
  constructor(desktopElt, getWindows, closeWindow) {
    this._desktopElt = desktopElt;
    this._getWindows = getWindows;
    this._closeWindow = closeWindow;

    /**
     * @type {Array.<{
     *   appWindow: Object,
     *   element: HTMLElement,
     *   wasMinimized: boolean,
     *   returnTo: {transform: string, opacity: string},
     *   rect: DOMRect,
     *   stackingOrder: number,
     *   restoreAccessibility: Function,
     *   resumeInteraction: Function,
     *   label: HTMLElement,
     *   contextMenuAbortCtrl: AbortController,
     *   target: {transform: string, center: {x: number, y: number}}|null
     * }>}
     */
    this._entries = [];
    /** @type {"closed"|"opened"|"closing"|"opening"} */
    this._state = "closed";
    this._reopenAfterHide = false;

    this._animationFrame = null;
    this._cleanupTimer = null;
    this._hidePromise = null;
    this._finishHide = null;
    this._touchGesture = null;
    this._suppressNextClick = false;

    desktopElt.style.setProperty(
      "--window-overview-duration",
      `${OVERVIEW_ANIMATION_DURATION}ms`,
    );

    desktopElt.addEventListener("pointerover", (event) => {
      if (this._state === "opening" || this._state === "opened") {
        const windowElement = event.target.closest?.(".window-overview-window");
        windowElement?.focus({ preventScroll: true });
      }
    });
    desktopElt.addEventListener(
      "click",
      (event) => this._onDesktopClick(event),
      true,
    );
    desktopElt.addEventListener(
      "auxclick",
      (event) => this._onAuxClick(event),
      true,
    );
    desktopElt.addEventListener(
      "pointerdown",
      (event) => this._onTouchPointerDown(event),
      true,
    );
    desktopElt.addEventListener(
      "pointermove",
      (event) => this._onTouchPointerMove(event),
      true,
    );
    desktopElt.addEventListener(
      "pointerup",
      (event) => this._onTouchPointerUp(event),
      true,
    );
    desktopElt.addEventListener(
      "pointercancel",
      (event) => this._onTouchPointerCancel(event),
      true,
    );
    desktopElt.addEventListener("keydown", (event) => this._onKeyDown(event));

    let desktopWidth = desktopElt.clientWidth;
    let desktopHeight = desktopElt.clientHeight;
    // The overview layout is a snapshot of the desktop's available space.
    // Observe that space directly so every layout source (taskbar, viewport,
    // or a future desktop component) invalidates the snapshot consistently.
    this._desktopResizeObserver = new ResizeObserver(() => {
      const newDesktopWidth = desktopElt.clientWidth;
      const newDesktopHeight = desktopElt.clientHeight;
      if (
        newDesktopWidth === desktopWidth &&
        newDesktopHeight === desktopHeight
      ) {
        return;
      }
      desktopWidth = newDesktopWidth;
      desktopHeight = newDesktopHeight;
      if (!this.isClosed()) {
        this.hide({ animate: false });
      }
    });
    this._desktopResizeObserver.observe(desktopElt);
  }

  /**
   * @returns {boolean} - `true` if the overview is fully closed.
   * `false` if the overview is currently, even partially (e.g. between
   * transitions) showing.
   */
  isClosed() {
    return this._state === "closed";
  }

  /**
   * Show all currently-open windows.
   * @returns {boolean} `true` if an overview was opened.
   */
  show() {
    if (this._state === "opening" || this._state === "opened") {
      return true;
    }
    if (this._state === "closing") {
      this._reopenAfterHide = true;
      return true;
    }

    const appWindows = this._getWindows().filter(
      (window) => !window.isClosed(),
    );
    if (appWindows.length === 0) {
      return false;
    }

    this._state = "opening";
    this._desktopElt.classList.remove("window-overview-closing");
    this._desktopElt.classList.add("window-overview-active");

    const backdrop = document.createElement("div");
    backdrop.className = "window-overview-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    this._desktopElt.appendChild(backdrop);
    this._backdrop = backdrop;

    this._entries = appWindows.map((appWindow) => {
      const element = appWindow.element;
      const title = appWindow.getTitle() || "Untitled window";
      const icon = appWindow.getIcon();
      const wasMinimized = appWindow.isMinimizedOrMinimizing();
      const returnTo = {
        transform: element.style.transform || "none",
        opacity: element.style.opacity || "1",
      };
      const stackingOrder = parseInt(element.style.zIndex, 10) || 0;

      element.style.setProperty(
        "--window-overview-transform",
        returnTo.transform,
      );
      element.style.setProperty(
        "--window-overview-opacity",
        wasMinimized ? "0" : returnTo.opacity,
      );

      element.classList.add("window-overview-window");
      const restoreAccessibility = temporarilySetAttributes(element, {
        tabindex: "0",
        role: "button",
        "aria-label": `Open ${title}`,
      });
      const resumeInteraction = appWindow.suspendInteraction();

      const label = document.createElement("div");
      label.className = "window-overview-label";
      label.textContent = `${icon ? icon + " " : ""}${title}`;
      this._desktopElt.appendChild(label);

      return {
        appWindow,
        element,
        wasMinimized,
        returnTo,
        stackingOrder,
        restoreAccessibility,
        resumeInteraction,
        label,
        contextMenuAbortCtrl: new AbortController(),
        target: null,
      };
    });
    this._setUpBackdropContextMenu();
    for (const entry of this._entries) {
      this._setUpWindowContextMenu(entry);
    }
    this._applyOverviewStacking();

    for (const entry of this._entries) {
      entry.rect = entry.element.getBoundingClientRect();
    }
    this._layoutEntries();
    const openingEntries = this._entries;
    this._animationFrame = requestAnimationFrame(() => {
      this._animationFrame = null;
      if (this._state !== "opening" || openingEntries !== this._entries) {
        return;
      }
      this._state = "opened";
      this._desktopElt.classList.add("window-overview-opened");
      for (const entry of this._entries) {
        entry.element.style.setProperty(
          "--window-overview-transform",
          entry.target.transform,
        );
        entry.element.style.setProperty("--window-overview-opacity", "1");
        // Labels fade in with their previews instead of flashing at the final
        // position before the window movement begins.
        entry.label.classList.add("visible");
      }

      const activeEntry =
        this._entries.find(({ appWindow }) => appWindow.isActivated()) ??
        this._entries[0];
      activeEntry?.element.focus({ preventScroll: true });
    });
    return true;
  }

  /** Remove a closing window while keeping the remaining previews open. */
  removeWindow(appWindow) {
    if (this._state !== "opening" && this._state !== "opened") {
      this.hide({ animate: false });
      return;
    }
    const index = this._entries.findIndex(
      (entry) => entry.appWindow === appWindow,
    );
    if (index === -1) {
      return;
    }
    const [entry] = this._entries.splice(index, 1);
    if (this._touchGesture?.entry === entry) {
      this._resetTouchGesture();
    }
    const hadFocus = entry.element.contains(document.activeElement);
    restoreEntry(entry);
    if (this._entries.length === 0) {
      this.hide({ animate: false });
      return;
    }
    this._applyOverviewStacking();
    this._layoutEntries();
    if (this._state === "opened") {
      for (const remaining of this._entries) {
        remaining.element.style.setProperty(
          "--window-overview-transform",
          remaining.target.transform,
        );
      }
    }
    if (hadFocus) {
      const nextEntry =
        this._entries[Math.min(index, this._entries.length - 1)];
      nextEntry.element.focus({ preventScroll: true });
    }
  }

  /**
   * Toggle the overview without changing the selected window.
   * @returns {boolean} `true` if the overview was opened.
   */
  toggle() {
    if (this._state === "closing") {
      this._reopenAfterHide = !this._reopenAfterHide;
      return this._reopenAfterHide;
    }
    if (this.isClosed()) {
      return this.show();
    }
    this.hide();
    return false;
  }

  /**
   * Close the overview and restore every window's presentation.
   * @param {Object} [options]
   * @param {boolean} [options.animate=true]
   * @returns {Promise<void>}
   */
  hide({ animate = true } = {}) {
    this._resetTouchGesture();
    this._backdropMenuAbortCtrl?.abort();
    for (const entry of this._entries) {
      entry.contextMenuAbortCtrl.abort();
    }
    if (this._state === "closed") {
      return Promise.resolve();
    }
    if (this._state === "closing") {
      const hidePromise = this._hidePromise;
      if (!animate) {
        this._reopenAfterHide = false;
        this._finishHide?.();
      }
      return hidePromise;
    }

    this._state = "closing";
    this._reopenAfterHide = false;
    this._desktopElt.classList.add("window-overview-closing");
    if (animate) {
      this._backdrop?.classList.add("closing");
    }
    if (this._animationFrame !== null) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
    if (this._cleanupTimer !== null) {
      clearTimeout(this._cleanupTimer);
    }

    for (const entry of this._entries) {
      entry.label.classList.remove("visible");
      entry.element.style.setProperty(
        "--window-overview-transform",
        entry.returnTo.transform,
      );
      // Windows that remain minimized fade away before `display: none` takes
      // effect again. A selected minimized window changes this flag on restore.
      entry.element.style.setProperty(
        "--window-overview-opacity",
        entry.wasMinimized ? "0" : entry.returnTo.opacity,
      );
    }

    let resolveHide;
    const hidePromise = new Promise((resolve) => {
      resolveHide = resolve;
    });
    this._hidePromise = hidePromise;
    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) {
        return;
      }
      cleanedUp = true;
      if (this._cleanupTimer !== null) {
        clearTimeout(this._cleanupTimer);
        this._cleanupTimer = null;
      }
      this._finishHide = null;
      for (const entry of this._entries) {
        restoreEntry(entry);
      }
      this._entries = [];
      this._backdrop?.remove();
      this._backdrop = null;
      this._desktopElt.classList.remove(
        "window-overview-active",
        "window-overview-closing",
        "window-overview-opened",
      );
      this._state = "closed";
      this._hidePromise = null;
      const reopen = this._reopenAfterHide;
      this._reopenAfterHide = false;
      resolveHide();
      if (reopen) {
        this.show();
      }
    };
    this._finishHide = cleanup;

    if (animate) {
      this._cleanupTimer = setTimeout(cleanup, OVERVIEW_ANIMATION_DURATION);
    } else {
      cleanup();
    }
    return hidePromise;
  }

  _layoutEntries() {
    const desktopRect = this._desktopElt.getBoundingClientRect();
    const windowRects = this._entries.map((entry) => entry.rect);
    const layout = calculateOverviewLayout(
      windowRects,
      desktopRect.width,
      desktopRect.height,
    );

    this._entries.forEach((entry, index) => {
      const rect = entry.rect;
      const target = layout[index];
      const translateX = desktopRect.left + target.left - rect.left;
      const translateY = desktopRect.top + target.top - rect.top;
      entry.target = {
        transform: `translate(${translateX}px, ${translateY}px) scale(${target.scale})`,
        center: {
          x: target.left + target.width / 2,
          y: target.top + target.height / 2,
        },
      };
      entry.label.style.left = `${entry.target.center.x}px`;
      entry.label.style.top = `${target.top + target.height + 7}px`;
      entry.label.style.maxWidth = `${target.width}px`;
    });
  }

  _setUpWindowContextMenu(entry) {
    this._setUpContextMenu(
      entry.element,
      [
        {
          name: "activate",
          title: "Switch to window",
          height: "1.4rem",
          svg: `<svg aria-hidden="true" viewBox="0 -0.5 21 21" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M0 0h21v20H0V0Zm2.1 2v3h16.8V2H2.1Zm0 5v11h16.8V7H2.1Z"/>
        </svg>`,
          onClick: () => this._select(entry),
        },
        {
          name: "close",
          title: "Close window",
          onClick: () => this._closeWindow(entry.appWindow),
        },
      ],
      entry.contextMenuAbortCtrl.signal,
    );
  }

  _setUpBackdropContextMenu() {
    this._backdropMenuAbortCtrl = new AbortController();
    this._setUpContextMenu(
      this._backdrop,
      [
        {
          name: "close",
          title: "Close all windows",
          onClick: () => {
            for (const { appWindow } of this._entries.slice()) {
              this._closeWindow(appWindow);
            }
          },
        },
      ],
      this._backdropMenuAbortCtrl.signal,
    );
  }

  _setUpContextMenu(element, actions, abortSignal) {
    setUpContextMenu({
      element,
      abortSignal,
      filter: (event) => {
        event.preventDefault();
        return this._state === "opening" || this._state === "opened";
      },
      actions: [
        ...actions,
        { name: "separator" },
        {
          name: "exit-overview",
          title: "Exit overview",
          height: "1.4rem",
          svg: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4H3v16h7M8 12h13m-5-5 5 5-5 5"/>
          </svg>`,
          onClick: () => this.hide(),
        },
      ],
    });
  }

  _applyOverviewStacking() {
    this._entries
      .map((entry, index) => ({
        entry,
        index,
        zIndex: entry.stackingOrder,
      }))
      .sort((a, b) => a.zIndex - b.zIndex || a.index - b.index)
      .forEach(({ entry }, index) => {
        entry.element.style.setProperty(
          "--window-overview-z-index",
          String(OVERVIEW_WINDOW_Z_INDEX + index),
        );
      });
  }

  _onDesktopClick(event) {
    if (this._suppressNextClick) {
      this._suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this._state !== "opening" && this._state !== "opened") {
      return;
    }
    if (event.button !== 0) {
      event.preventDefault();
      return;
    }

    const windowElement = event.target.closest?.(".window-overview-window");
    if (windowElement) {
      event.preventDefault();
      const entry = this._entries.find(
        ({ element }) => element === windowElement,
      );
      if (entry) {
        this._select(entry);
      }
    } else if (event.target === this._backdrop) {
      event.preventDefault();
      this.hide();
    }
  }

  _onKeyDown(event) {
    if (this._state !== "opening" && this._state !== "opened") {
      return;
    }
    if (event.defaultPrevented) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      return;
    }
    const focusedEntry = this._entries.find(
      ({ element }) => element === document.activeElement,
    );
    if (!focusedEntry) {
      return;
    }
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      event.stopPropagation();
      const currentEntry = focusedEntry;
      const nextEntry = findDirectionalEntry(
        this._entries,
        currentEntry,
        event.key,
      );
      nextEntry?.element.focus({ preventScroll: true });
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const entry = this._entries.find(
      ({ element }) => element === document.activeElement,
    );
    if (entry) {
      event.preventDefault();
      event.stopPropagation();
      this._select(entry);
    }
  }

  _select(entry) {
    if (this._state === "closing") {
      return;
    }
    if (entry.wasMinimized) {
      prepareMinimizedEntryForSelection(entry);
    }
    // Let the app's activation callback focus its preferred control. Cleanup
    // may safely call this idempotent release function again.
    entry.resumeInteraction();
    entry.appWindow.activate();

    // Activation establishes the final stack before the return animation.
    // Keep the overview layer visually stable until its backdrop is removed.
    this._entries.forEach((currentEntry) => {
      currentEntry.stackingOrder =
        parseInt(currentEntry.element.style.zIndex, 10) || 0;
    });
    this._applyOverviewStacking();

    this.hide();
  }

  _onAuxClick(event) {
    if (this._state !== "opening" && this._state !== "opened") {
      return;
    }
    event.preventDefault();
    if (event.button !== 1) {
      return;
    }
    const element = event.target.closest?.(".window-overview-window");
    const entry = this._entries.find((entry) => entry.element === element);
    if (entry) {
      this._closeWindow(entry.appWindow);
    }
  }

  _onTouchPointerDown(event) {
    if (
      this._state !== "opened" ||
      event.pointerType !== "touch" ||
      !event.isPrimary ||
      this._touchGesture !== null
    ) {
      return;
    }
    const element = event.target.closest?.(".window-overview-window");
    const entry = this._entries.find((entry) => entry.element === element);
    if (!entry) {
      return;
    }

    this._touchGesture = {
      pointerId: event.pointerId,
      entry,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      deltaY: 0,
      moved: false,
    };
    entry.element.classList.add("window-overview-dragging");
    entry.element.setPointerCapture?.(event.pointerId);
  }

  _onTouchPointerMove(event) {
    const gesture = this._touchGesture;
    if (event.pointerId !== gesture?.pointerId) {
      return;
    }
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const distance = Math.hypot(deltaX, deltaY);
    if (!gesture.moved && distance < TOUCH_DRAG_START_DISTANCE) {
      return;
    }

    event.preventDefault();
    gesture.moved = true;
    gesture.deltaX = deltaX;
    gesture.deltaY = deltaY;
    const dismissDistance = this._getTouchDismissDistance();
    const opacity = Math.max(0.25, 1 - (distance / dismissDistance) * 0.75);
    gesture.entry.element.style.setProperty(
      "--window-overview-transform",
      `translate(${deltaX}px, ${deltaY}px) ${gesture.entry.target.transform}`,
    );
    gesture.entry.element.style.setProperty(
      "--window-overview-opacity",
      String(opacity),
    );
    gesture.entry.label.style.setProperty(
      "--window-overview-drag-x",
      `${deltaX}px`,
    );
    gesture.entry.label.style.setProperty(
      "--window-overview-drag-y",
      `${deltaY}px`,
    );
  }

  _onTouchPointerUp(event) {
    const gesture = this._touchGesture;
    if (event.pointerId !== gesture?.pointerId) {
      return;
    }
    const shouldDismiss =
      gesture.moved &&
      Math.hypot(gesture.deltaX, gesture.deltaY) >=
        this._getTouchDismissDistance();
    this._resetTouchGesture();
    if (!gesture.moved) {
      return;
    }

    event.preventDefault();
    this._suppressNextClick = true;
    setTimeout(() => {
      this._suppressNextClick = false;
    });
    if (shouldDismiss && this._entries.includes(gesture.entry)) {
      this._closeWindow(gesture.entry.appWindow);
    }
  }

  _onTouchPointerCancel(event) {
    if (event.pointerId === this._touchGesture?.pointerId) {
      this._resetTouchGesture();
    }
  }

  _getTouchDismissDistance() {
    const rect = this._desktopElt.getBoundingClientRect();
    return Math.max(
      TOUCH_DISMISS_DISTANCE_MIN,
      Math.min(
        TOUCH_DISMISS_DISTANCE_MAX,
        Math.min(rect.width, rect.height) * 0.2,
      ),
    );
  }

  _resetTouchGesture() {
    const gesture = this._touchGesture;
    if (!gesture) {
      return;
    }
    this._touchGesture = null;
    gesture.entry.element.classList.remove("window-overview-dragging");
    gesture.entry.element.style.setProperty(
      "--window-overview-transform",
      gesture.entry.target.transform,
    );
    gesture.entry.element.style.setProperty("--window-overview-opacity", "1");
    gesture.entry.label.style.removeProperty("--window-overview-drag-x");
    gesture.entry.label.style.removeProperty("--window-overview-drag-y");
    if (gesture.entry.element.hasPointerCapture?.(gesture.pointerId)) {
      gesture.entry.element.releasePointerCapture(gesture.pointerId);
    }
  }
}

function findDirectionalEntry(entries, currentEntry, key) {
  if (!currentEntry?.target) {
    return null;
  }

  const horizontal = key === "ArrowLeft" || key === "ArrowRight";
  const direction = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
  const current = currentEntry.target.center;
  let bestEntry = null;
  let bestScore = Infinity;

  for (const entry of entries) {
    if (entry === currentEntry || !entry.target) {
      continue;
    }
    const primaryDelta = horizontal
      ? entry.target.center.x - current.x
      : entry.target.center.y - current.y;
    if (Math.sign(primaryDelta) !== direction) {
      continue;
    }
    const secondaryDelta = horizontal
      ? entry.target.center.y - current.y
      : entry.target.center.x - current.x;
    const score = Math.abs(primaryDelta) + Math.abs(secondaryDelta) * 2;
    if (score < bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }
  return bestEntry;
}

function restoreEntry(entry) {
  entry.contextMenuAbortCtrl.abort();
  const { element, restoreAccessibility, resumeInteraction } = entry;
  element.classList.remove(
    "window-overview-window",
    "window-overview-dragging",
  );
  element.style.removeProperty("--window-overview-transform");
  element.style.removeProperty("--window-overview-opacity");
  element.style.removeProperty("--window-overview-z-index");
  restoreAccessibility();
  resumeInteraction();
  entry.label.style.removeProperty("--window-overview-drag-x");
  entry.label.style.removeProperty("--window-overview-drag-y");
  entry.label.remove();
}

function prepareMinimizedEntryForSelection(entry) {
  entry.appWindow.deminimize({ animate: false });
  entry.wasMinimized = false;
}

function temporarilySetAttributes(element, attributes) {
  const previousValues = Object.fromEntries(
    Object.keys(attributes).map((name) => [name, element.getAttribute(name)]),
  );
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return () => {
    for (const [name, value] of Object.entries(previousValues)) {
      if (value === null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    }
  };
}

function calculateOverviewLayout(rects, availableWidth, availableHeight) {
  const shortestSide = Math.min(availableWidth, availableHeight);
  const padding = Math.max(
    OVERVIEW_PADDING_MIN,
    Math.min(OVERVIEW_PADDING_MAX, shortestSide * 0.04),
  );
  const gap = Math.max(
    OVERVIEW_GAP_MIN,
    Math.min(OVERVIEW_GAP_MAX, shortestSide * 0.025),
  );
  let bestGrid = null;

  for (let columns = 1; columns <= rects.length; columns++) {
    const rows = Math.ceil(rects.length / columns);
    const cellWidth =
      (availableWidth - padding * 2 - gap * (columns - 1)) / columns;
    const cellHeight =
      (availableHeight - padding * 2 - gap * (rows - 1)) / rows;
    const previewHeight = cellHeight - OVERVIEW_LABEL_HEIGHT;
    if (cellWidth <= 0 || previewHeight <= 0) {
      continue;
    }

    const scales = rects.map((rect) =>
      Math.min(cellWidth / rect.width, previewHeight / rect.height),
    );
    const minimumScale = Math.min(...scales);
    const averageScale =
      scales.reduce((total, scale) => total + scale, 0) / scales.length;
    const emptyCells = columns * rows - rects.length;
    const score = minimumScale * 0.75 + averageScale * 0.25 - emptyCells * 0.01;

    if (!bestGrid || score > bestGrid.score) {
      bestGrid = { columns, rows, cellWidth, cellHeight, score };
    }
  }

  const { columns, cellWidth, cellHeight } = bestGrid;
  return rects.map((rect, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rowStartIndex = row * columns;
    const itemsInRow = Math.min(columns, rects.length - rowStartIndex);
    const rowWidth = itemsInRow * cellWidth + (itemsInRow - 1) * gap;
    const rowLeft = (availableWidth - rowWidth) / 2;
    const previewHeight = cellHeight - OVERVIEW_LABEL_HEIGHT;
    const scale = Math.min(
      1,
      cellWidth / rect.width,
      previewHeight / rect.height,
    );
    const width = rect.width * scale;
    const height = rect.height * scale;
    return {
      scale,
      width,
      height,
      left: rowLeft + column * (cellWidth + gap) + (cellWidth - width) / 2,
      top:
        padding +
        row * (cellHeight + gap) +
        Math.max(0, (previewHeight - height) / 2),
    };
  });
}
