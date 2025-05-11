import {
  TASKBAR_MIN_HORIZONTAL_SIZE,
  TASKBAR_MAX_HORIZONTAL_SIZE,
  TASKBAR_MIN_VERTICAL_SIZE,
  TASKBAR_MAX_VERTICAL_SIZE,
} from "../constants.mjs";
import { SETTINGS } from "../settings.mjs";
import { addAbortableEventListener } from "../utils.mjs";

/**
 * Class simplifying the handling of the "Taskbar", which is the bar containing
 * the start menu and open apps to the left, and applets to the right.
 */
export default class Taskbar {
  /**
   * @param {Object} [opts={}]
   * @param {Array.<HTMLElement>} [opts.applets] - HTMLElements which will be
   * inserted to the right of the taskbar
   */
  constructor(opts = {}) {
    this._abortController = new AbortController();
    const taskbarElt = document.getElementById("taskbar");
    if (opts.applets) {
      const taskbarLastElt = document.getElementById("taskbar-last");
      for (const applet of opts.applets) {
        taskbarLastElt.appendChild(applet);
      }
    }
    this._taskbarItemsElt =
      taskbarElt.getElementsByClassName("taskbar-items")[0];
    addResizeHandle(taskbarElt, this._abortController.signal);
    handleTaskbarMove(taskbarElt, this._abortController.signal);
  }

  /**
   * Add an item to the taskbar's tasks.
   * @param {string} windowId - Identifier for the corresponding opened window.
   * @param {Object} appText - Strings to write for the task.
   * @param {string} appText.icon - Icon of the application, as an unicode
   * emoji probably.
   * @param {string} appText.title - Title of the application.
   * @param {Object} callbacks - Callbacks to interact with the window from the
   * taskbar.
   * @param {Function} callbacks.toggleAppActivation - De-minimize (if it is
   * minimized) or minimize (if it wasn't) a window.
   * @param {Function} callbacks.closeApp - Close the corresponding window.
   */
  addWindow(windowId, { icon, title }, { toggleAppActivation, closeApp }) {
    const item = document.createElement("div");
    item.className = "taskbar-item";
    item.dataset.window = windowId;
    item.addEventListener("mousedown", (evt) => {
      if (evt && evt.button == 1) {
        // middle click
        closeApp();
      }
    });
    item.addEventListener("click", (evt) => {
      if (evt && evt.button == 1) {
        // middle click
        return;
      }
      toggleAppActivation();
    });
    const iconElt = document.createElement("span");
    iconElt.className = "taskbar-item-text taskbar-item-icon";
    iconElt.textContent = icon;
    const titleElt = document.createElement("span");
    titleElt.className = "taskbar-item-text taskbar-item-title";
    titleElt.textContent = title;
    item.appendChild(iconElt);
    item.appendChild(titleElt);
    this._taskbarItemsElt.appendChild(item);
  }

  /**
   * Change the active window or deactivate all windows.
   * @param {string|null} windowId - The `windowId` for the window you wish to
   * activate, or `null` if no window should be activated.
   */
  setActiveWindow(windowId) {
    for (const item of this._taskbarItemsElt.getElementsByClassName(
      "taskbar-item",
    )) {
      if (item.dataset.window === windowId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    }
  }

  deActiveWindow(windowId) {
    for (const item of this._taskbarItemsElt.getElementsByClassName(
      "taskbar-item",
    )) {
      if (item.dataset.window === windowId) {
        item.classList.remove("active");
      }
    }
  }

  /**
   * @param {string} windowId
   * @returns {DOMRect|null}
   */
  getTaskBoundingClientRect(windowId) {
    for (const item of this._taskbarItemsElt.getElementsByClassName(
      "taskbar-item",
    )) {
      if (item.dataset.window === windowId) {
        return item.getBoundingClientRect();
      }
    }
    return null;
  }

  remove(windowId) {
    for (const item of this._taskbarItemsElt.getElementsByClassName(
      "taskbar-item",
    )) {
      if (item.dataset.window === windowId) {
        item.remove();
      }
    }
  }

  /**
   * Free resources maintained by this Taskbar.
   */
  dispose() {
    this._abortController.abort();
    this._taskbarItemsElt.innerHTML = "";
    const taskbarLastElt = document.getElementById("taskbar-last");
    taskbarLastElt.innerHTML = "";
  }
}

function addResizeHandle(elt, abortSignal) {
  const handle = document.createElement("div");
  handle.className = "taskbar-resize-handle";
  elt.appendChild(handle);

  let taskbarLocation;
  let isTaskbarHorizontal;
  let shouldDecreaseDeltaToIncreaseSize;
  let startX;
  let startY;
  let startHeight;
  let startWidth;

  abortSignal.addEventListener("abort", stopResize);
  addAbortableEventListener(window, "resize", abortSignal, stopResize);
  SETTINGS.taskbarLocation.onUpdate(
    () => {
      taskbarLocation = SETTINGS.taskbarLocation.getValue();
      isTaskbarHorizontal = ["top", "bottom"].includes(taskbarLocation);
      shouldDecreaseDeltaToIncreaseSize = ["bottom", "right"].includes(
        taskbarLocation,
      );
    },
    { emitCurrentValue: true },
  );

  handle.addEventListener("mousedown", (e) => {
    if (e.button) {
      // not left click
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    // This is a work-around for the fact that "iframe" elements may hide
    // pointer events from us. Adding this class allows to put transparent
    // elements on top of every iframe, blocking interactions with them but
    // allowing us to track the resize operation even when the mouse temporarily
    // goes over them.
    document.body.classList.add("block-iframe");

    startX = e.clientX;
    startY = e.clientY;

    startHeight = isTaskbarHorizontal
      ? SETTINGS.taskbarSize.getValue()
      : document.documentElement.clientHeight;
    startWidth = !isTaskbarHorizontal
      ? SETTINGS.taskbarSize.getValue()
      : document.documentElement.clientWidth;

    // Add document-level event listeners
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  });

  // Resize function based on direction
  function resize(e) {
    requestAnimationFrame(() => {
      if (isTaskbarHorizontal) {
        const deltaY = e.clientY - startY;

        const minHeight = TASKBAR_MIN_HORIZONTAL_SIZE;
        const newHeight = Math.min(
          Math.max(
            minHeight,
            shouldDecreaseDeltaToIncreaseSize
              ? startHeight - deltaY
              : startHeight + deltaY,
          ),
          TASKBAR_MAX_HORIZONTAL_SIZE,
        );
        SETTINGS.taskbarSize.setValueIfChanged(Math.floor(newHeight));
      } else {
        const deltaX = e.clientX - startX;

        const minWidth = TASKBAR_MIN_VERTICAL_SIZE;
        const newWidth = Math.min(
          Math.max(
            minWidth,
            shouldDecreaseDeltaToIncreaseSize
              ? startWidth - deltaX
              : startWidth + deltaX,
          ),
          TASKBAR_MAX_VERTICAL_SIZE,
        );
        SETTINGS.taskbarSize.setValueIfChanged(Math.floor(newWidth));
      }
    });
  }

  function stopResize() {
    document.body.classList.remove("block-iframe");
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }
}

/**
 * Setup the right events to ensure this taskbar can be moved.
 * @param {HTMLElement} taskbarElt - The whole taskbar element that can be
 * moved.
 * @param {AbortSignal} abortSignal - `AbortSignal` allowing to free all
 * resources and event listeners registered here when it emits.
 */
function handleTaskbarMove(taskbarElt, abortSignal) {
  /**
   * If `true`, we're currently in the process of dragging the taskbar around.
   */
  let isDragging = false;
  /**
   * Height of the container element. We assume that it cannot change while a
   * taskbar move is happening.
   */
  let containerWidth;
  /**
   * Height of the container element. We assume that it cannot change while a
   * taskbar move is happening.
   */
  let containerHeight;

  const stopDragging = () => {
    isDragging = false;
  };

  // Reset some state on abort, just to be sure we're not left in an unwanted state
  abortSignal.addEventListener("abort", stopDragging);

  addAbortableEventListener(taskbarElt, "touchstart", abortSignal, () => {
    startDraggingTaskbar();
  });
  addAbortableEventListener(taskbarElt, "touchend", abortSignal, stopDragging);
  addAbortableEventListener(
    taskbarElt,
    "touchcancel",
    abortSignal,
    stopDragging,
  );
  addAbortableEventListener(taskbarElt, "touchmove", abortSignal, (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      e.preventDefault();
      moveDraggedTaskbar(touch.clientX, touch.clientY);
    }
  });

  // Safari just selects all over the place like some maniac without this
  addAbortableEventListener(taskbarElt, "selectstart", abortSignal, (e) => {
    e.preventDefault();
  });
  addAbortableEventListener(taskbarElt, "mousedown", abortSignal, (e) => {
    if (e.button !== 0) {
      // not left click
      return;
    }
    e.preventDefault();
    startDraggingTaskbar();
  });
  addAbortableEventListener(
    document.documentElement,
    "mouseleave",
    abortSignal,
    stopDragging,
  );
  addAbortableEventListener(
    document.documentElement,
    "mouseenter",
    abortSignal,
    stopDragging,
  );
  addAbortableEventListener(
    document.documentElement,
    "click",
    abortSignal,
    stopDragging,
  );
  addAbortableEventListener(document, "mousemove", abortSignal, (e) => {
    if (!isDragging) {
      return;
    }
    e.preventDefault();
    moveDraggedTaskbar(e.clientX, e.clientY);
  });
  addAbortableEventListener(taskbarElt, "mouseup", abortSignal, stopDragging);
  addAbortableEventListener(window, "resize", abortSignal, stopDragging);

  function startDraggingTaskbar() {
    if (!SETTINGS.allowManualTaskbarMove.getValue()) {
      return;
    }
    isDragging = true;
    containerWidth = document.documentElement.clientWidth;
    containerHeight = document.documentElement.clientHeight;
  }

  function moveDraggedTaskbar(clientX, clientY) {
    const taskbarSize = SETTINGS.taskbarSize.getValue();
    if (containerHeight - clientY <= taskbarSize) {
      SETTINGS.taskbarLocation.setValueIfChanged("bottom");
    } else if (clientY <= taskbarSize) {
      SETTINGS.taskbarLocation.setValueIfChanged("top");
    } else if (clientX <= taskbarSize) {
      SETTINGS.taskbarLocation.setValueIfChanged("left");
    } else if (containerWidth - clientX <= taskbarSize) {
      SETTINGS.taskbarLocation.setValueIfChanged("right");
    }
  }
}
