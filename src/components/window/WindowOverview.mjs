const OVERVIEW_ANIMATION_DURATION = 240;
const OVERVIEW_PADDING_MIN = 12;
const OVERVIEW_PADDING_MAX = 40;
const OVERVIEW_GAP_MIN = 10;
const OVERVIEW_GAP_MAX = 28;
const OVERVIEW_LABEL_HEIGHT = 34;
const OVERVIEW_WINDOW_Z_INDEX = 610;

/**
 * Arranges application windows into a temporary, selectable overview.
 */
export default class WindowOverview {
  /**
   * @param {HTMLElement} desktopElt
   * @param {Function} getWindows - Returns the current AppWindow instances.
   */
  constructor(desktopElt, getWindows) {
    this._desktopElt = desktopElt;
    this._getWindows = getWindows;
    this._entries = [];
    this._state = "closed";
    this._animationFrame = null;
    this._cleanupTimer = null;
    this._hidePromise = null;
    this._finishHide = null;
    this._reopenAfterHide = false;

    desktopElt.addEventListener(
      "mousedown",
      (event) => this._blockWindowInteraction(event),
      true,
    );
    desktopElt.addEventListener(
      "mouseup",
      (event) => this._blockWindowInteraction(event),
      true,
    );
    desktopElt.addEventListener(
      "touchstart",
      (event) => this._blockWindowInteraction(event),
      { capture: true, passive: true },
    );
    desktopElt.addEventListener(
      "click",
      (event) => this._onDesktopClick(event),
      true,
    );
    desktopElt.addEventListener(
      "auxclick",
      (event) => this._blockNonPrimaryClick(event),
      true,
    );
    desktopElt.addEventListener(
      "contextmenu",
      (event) => this._blockNonPrimaryClick(event),
      true,
    );
    document.addEventListener("keydown", (event) => this._onKeyDown(event), true);
    window.addEventListener("resize", () => {
      if (this.isOpen()) {
        this.hide({ animate: false });
      }
    });
  }

  isOpen() {
    return this._state !== "closed";
  }

  /**
   * Show all currently-open windows.
   * @returns {boolean} `true` if an overview was opened.
   */
  show() {
    if (this.isOpen()) {
      return true;
    }

    const appWindows = this._getWindows().filter((window) => !window.isClosed());
    if (appWindows.length === 0) {
      return false;
    }

    this._state = "opening";
    this._desktopElt.classList.add("window-overview-active");

    const backdrop = document.createElement("div");
    backdrop.className = "window-overview-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    this._desktopElt.appendChild(backdrop);
    this._backdrop = backdrop;

    const desktopRect = this._desktopElt.getBoundingClientRect();
    this._entries = appWindows.map((appWindow) => {
      const element = appWindow.element;
      const visibleElement = element.getElementsByClassName("w-visible")[0];
      const title =
        element.getElementsByClassName("w-title-title")[0]?.textContent ||
        "Untitled window";
      const icon =
        element.getElementsByClassName("w-title-icon")[0]?.textContent || "";
      const minimized = appWindow.isMinimizedOrMinimizing();
      const saved = {
        transform: element.style.transform,
        transformOrigin: element.style.transformOrigin,
        transition: element.style.transition,
        opacity: element.style.opacity,
        zIndex: element.style.zIndex,
        overviewZIndex: element.style.getPropertyValue(
          "--window-overview-z-index",
        ),
        overviewZIndexPriority: element.style.getPropertyPriority(
          "--window-overview-z-index",
        ),
        tabIndex: element.getAttribute("tabindex"),
        role: element.getAttribute("role"),
        ariaLabel: element.getAttribute("aria-label"),
        visibleInert: visibleElement?.inert ?? false,
      };

      element.classList.add("window-overview-window");
      element.style.transformOrigin = "top left";
      element.style.transition = "none";
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute(
        "aria-label",
        `Open ${title}${minimized ? ", minimized" : ""}`,
      );
      if (visibleElement) {
        visibleElement.inert = true;
      }
      if (minimized) {
        element.style.opacity = "0";
      }

      const label = document.createElement("div");
      label.className = "window-overview-label";
      label.textContent = `${icon ? icon + " " : ""}${title}${
        minimized ? " · minimized" : ""
      }`;
      this._desktopElt.appendChild(label);

      return {
        appWindow,
        element,
        visibleElement,
        title,
        minimized,
        saved,
        label,
      };
    });
    this._applyOverviewStacking();

    // The overview class makes minimized windows measurable again.
    this._desktopElt.getBoundingClientRect();
    const windowRects = this._entries.map((entry) =>
      entry.element.getBoundingClientRect(),
    );
    const layout = calculateOverviewLayout(
      windowRects,
      desktopRect.width,
      desktopRect.height,
    );

    this._entries.forEach((entry, index) => {
      const rect = windowRects[index];
      const target = layout[index];
      const translateX = desktopRect.left + target.left - rect.left;
      const translateY = desktopRect.top + target.top - rect.top;
      entry.targetTransform = `translate(${translateX}px, ${translateY}px) scale(${target.scale})`;
      entry.targetCenter = {
        x: target.left + target.width / 2,
        y: target.top + target.height / 2,
      };
      entry.label.style.left = `${entry.targetCenter.x}px`;
      entry.label.style.top = `${target.top + target.height + 7}px`;
      entry.label.style.maxWidth = `${target.width}px`;
    });

    const openingEntries = this._entries;
    this._animationFrame = requestAnimationFrame(() => {
      this._animationFrame = null;
      if (this._state !== "opening" || openingEntries !== this._entries) {
        return;
      }
      this._state = "opened";
      for (const entry of this._entries) {
        entry.element.style.transition =
          `transform ${OVERVIEW_ANIMATION_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1), ` +
          `opacity ${OVERVIEW_ANIMATION_DURATION}ms ease`;
        entry.element.style.transform = entry.targetTransform;
        entry.element.style.opacity = "1";
        entry.label.classList.add("visible");
      }

      const activeEntry =
        this._entries.find(({ appWindow }) => appWindow.isActivated()) ??
        this._entries[0];
      activeEntry?.element.focus({ preventScroll: true });
    });
    return true;
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
    if (this.isOpen()) {
      this.hide();
      return false;
    }
    return this.show();
  }

  /**
   * Close the overview and restore every window's presentation.
   * @param {Object} [options]
   * @param {boolean} [options.animate=true]
   * @returns {Promise<void>}
   */
  hide({ animate = true } = {}) {
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
      if (animate) {
        entry.element.style.transition =
          `transform ${OVERVIEW_ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), ` +
          `opacity ${OVERVIEW_ANIMATION_DURATION}ms ease`;
      } else {
        entry.element.style.transition = "none";
      }
      entry.element.style.transform = entry.saved.transform;
      entry.element.style.opacity = entry.minimized ? "0" : entry.saved.opacity;
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
      this._desktopElt.classList.remove("window-overview-active");
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

  _blockWindowInteraction(event) {
    if (!this.isOpen()) {
      return;
    }
    if ("button" in event && event.button !== 0) {
      this._blockNonPrimaryClick(event);
      return;
    }
    const windowElement = event.target.closest?.(".window-overview-window");
    if (windowElement) {
      event.stopPropagation();
    }
  }

  _applyOverviewStacking() {
    this._entries
      .map((entry, index) => ({
        entry,
        index,
        zIndex: parseInt(entry.saved.zIndex, 10) || 0,
      }))
      .sort((a, b) => a.zIndex - b.zIndex || a.index - b.index)
      .forEach(({ entry }, index) => {
        entry.element.style.setProperty(
          "--window-overview-z-index",
          String(OVERVIEW_WINDOW_Z_INDEX + index),
        );
      });
  }

  _blockNonPrimaryClick(event) {
    if (!this.isOpen()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  _onDesktopClick(event) {
    if (!this.isOpen()) {
      return;
    }
    if (event.button !== 0) {
      this._blockNonPrimaryClick(event);
      return;
    }

    const windowElement = event.target.closest?.(".window-overview-window");
    if (windowElement) {
      event.preventDefault();
      event.stopPropagation();
      const entry = this._entries.find(({ element }) => element === windowElement);
      if (entry) {
        this._select(entry);
      }
    } else if (event.target === this._backdrop) {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
    }
  }

  _onKeyDown(event) {
    if (!this.isOpen()) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
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
      const currentEntry =
        this._entries.find(
          ({ element }) => element === document.activeElement,
        ) ?? this._entries[0];
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
    const wasMinimized = entry.appWindow.isMinimizedOrMinimizing();
    if (wasMinimized) {
      entry.appWindow.deminimize({ animate: false });
      entry.minimized = false;
      entry.saved.transformOrigin = entry.element.style.transformOrigin;
      entry.element.style.transformOrigin = "top left";
    }
    entry.appWindow.activate();

    // Activation establishes the final stack before the return animation.
    // Keep the overview layer visually stable until its backdrop is removed.
    this._entries.forEach((currentEntry) => {
      currentEntry.saved.zIndex = currentEntry.element.style.zIndex;
    });
    this._applyOverviewStacking();

    this.hide();
  }
}

function findDirectionalEntry(entries, currentEntry, key) {
  if (!currentEntry?.targetCenter) {
    return null;
  }

  const horizontal = key === "ArrowLeft" || key === "ArrowRight";
  const direction = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
  const current = currentEntry.targetCenter;
  let bestEntry = null;
  let bestScore = Infinity;

  for (const entry of entries) {
    if (entry === currentEntry || !entry.targetCenter) {
      continue;
    }
    const primaryDelta = horizontal
      ? entry.targetCenter.x - current.x
      : entry.targetCenter.y - current.y;
    if (Math.sign(primaryDelta) !== direction) {
      continue;
    }
    const secondaryDelta = horizontal
      ? entry.targetCenter.y - current.y
      : entry.targetCenter.x - current.x;
    const score = Math.abs(primaryDelta) + Math.abs(secondaryDelta) * 2;
    if (score < bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }
  return bestEntry;
}

function restoreEntry(entry) {
  const { element, visibleElement, saved } = entry;
  element.classList.remove("window-overview-window");
  element.style.transform = saved.transform;
  element.style.transformOrigin = saved.transformOrigin;
  element.style.transition = saved.transition;
  element.style.opacity = saved.opacity;
  element.style.zIndex = saved.zIndex;
  element.style.setProperty(
    "--window-overview-z-index",
    saved.overviewZIndex,
    saved.overviewZIndexPriority,
  );
  restoreAttribute(element, "tabindex", saved.tabIndex);
  restoreAttribute(element, "role", saved.role);
  restoreAttribute(element, "aria-label", saved.ariaLabel);
  if (visibleElement) {
    visibleElement.inert = saved.visibleInert;
  }
  entry.label.remove();
}

function restoreAttribute(element, name, value) {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
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
