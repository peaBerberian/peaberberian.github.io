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
    this._taskbarItemMap = new WeakMap();
  }

  /**
   * Add an item to the taskbar's tasks.
   * @param {Object} windowHandle - Handle for the corresponding opened window.
   * Give the same reference anytime you wish to update an aspect of it.
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
  addWindow(windowHandle, { icon, title }, { toggleAppActivation, closeApp }) {
    const itemElt = document.createElement("div");
    itemElt.className = "taskbar-item";
    itemElt.tabIndex = "0";
    itemElt.addEventListener("mousedown", (evt) => {
      if (evt && evt.button == 1) {
        // middle click
        closeApp();
      }
    });
    itemElt.addEventListener("click", (evt) => {
      if (evt && evt.button == 1) {
        // middle click
        return;
      }
      toggleAppActivation();
    });
    itemElt.addEventListener("keydown", (evt) => {
      if (evt.key === " " || evt.key === "Enter") {
        toggleAppActivation();
      }
    });
    const iconElt = document.createElement("span");
    iconElt.className = "taskbar-item-text taskbar-item-icon";
    iconElt.textContent = icon;
    const titleElt = document.createElement("span");
    titleElt.className = "taskbar-item-text taskbar-item-title";
    titleElt.textContent = title;
    itemElt.appendChild(iconElt);
    itemElt.appendChild(titleElt);
    this._taskbarItemMap.set(windowHandle, itemElt);
    this._taskbarItemsElt.appendChild(itemElt);
  }

  /**
   * Update the title and icon of a specific window in the taskbar.
   * @param {string} windowHandle - The `windowHandle` (@see `addWindow`) of the
   * window whose title should be updated.
   * @param {string} icon - The icon, as a single character (generally an
   * emoji).
   * @param {string} title - The title of the application.
   */
  updateTitle(windowHandle, icon, title) {
    const itemElt = this._taskbarItemMap.get(windowHandle);
    if (!itemElt) {
      return;
    }

    const iconElt = itemElt.getElementsByClassName("taskbar-item-icon");
    if (iconElt.length) {
      iconElt[0].textContent = icon;
    }
    const titleElt = itemElt.getElementsByClassName("taskbar-item-title");
    if (titleElt.length) {
      titleElt[0].textContent = title;
    }
  }

  /**
   * Change the active window or deactivate all windows.
   * @param {string|null} windowHandle - The `windowHandle` for the window you
   * wish to activate, or `null` if no window should be activated.
   */
  setActiveWindow(windowHandle) {
    const itemElt = this._taskbarItemMap.get(windowHandle);
    for (const currItemElt of this._taskbarItemsElt.getElementsByClassName(
      "taskbar-item",
    )) {
      if (currItemElt === itemElt) {
        currItemElt.classList.add("active");
      } else {
        currItemElt.classList.remove("active");
      }
    }
  }

  /**
   * "Deactivate" visually a specific window in the taskbar.
   * @param {string} windowHandle - The `windowHandle` (@see `addWindow`) of
   * the window which should be deactivated.
   */
  deActiveWindow(windowHandle) {
    const itemElt = this._taskbarItemMap.get(windowHandle);
    if (itemElt) {
      itemElt.classList.remove("active");
    }
  }

  /**
   * @param {string} windowHandle
   * @returns {DOMRect|null}
   */
  getTaskBoundingClientRect(windowHandle) {
    const itemElt = this._taskbarItemMap.get(windowHandle);
    if (itemElt) {
      return itemElt.getBoundingClientRect();
    }
    return null;
  }

  /**
   * Remove a window from the taskbar.
   * @param {string} windowHandle - The `windowHandle` (@see `addWindow`) of the
   * window that should be removed.
   */
  remove(windowHandle) {
    const itemElt = this._taskbarItemMap.get(windowHandle);
    if (itemElt) {
      itemElt.remove();
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
    taskbarElt.style.cursor = "";
  };

  // Reset some state on abort, just to be sure we're not left in an unwanted state
  abortSignal.addEventListener("abort", stopDragging);

  addAbortableEventListener(
    taskbarElt,
    "touchstart",
    abortSignal,
    () => {
      startDraggingTaskbar();
    },
    { passive: true },
  );
  addAbortableEventListener(taskbarElt, "touchend", abortSignal, stopDragging);
  addAbortableEventListener(
    taskbarElt,
    "touchcancel",
    abortSignal,
    stopDragging,
  );
  addAbortableEventListener(
    taskbarElt,
    "touchmove",
    abortSignal,
    (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        moveDraggedTaskbar(touch.clientX, touch.clientY);
      }
    },
    { passive: true },
  );

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
    taskbarElt.style.cursor = "move";
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
