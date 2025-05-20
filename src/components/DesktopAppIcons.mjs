import {
  ICON_WIDTH_BASE,
  ICON_HEIGHT_BASE,
  ICON_X_BASE,
  ICON_X_OFFSET_FROM_WIDTH,
  ICON_Y_BASE,
  ICON_Y_OFFSET_FROM_HEIGHT,
  ICON_MARGIN,
} from "../constants.mjs";
import {
  addAbortableEventListener,
  applyStyle,
  blockElementsFromTakingPointerEvents,
  getMaxDesktopDimensions,
  unblockElementsFromTakingPointerEvents,
} from "../utils.mjs";
import { SETTINGS } from "../settings.mjs";

/**
 * Create Icon HMTLElement corresponding to the given apps and returns an
 * HTMLElement containing all of them.
 * @param {Array.<Object>} apps - List of applications for which you want to
 * generate an icon, in order from the first displayed to the last displayed.
 * If the current icon area does not allow for all applications to be shown.
 * only the first objects of that array will be displayed.
 * Each of those objects should have at least three properties:
 *   - `run` (`string`): The path to the application to run.
 *   - `icon` (`string`): The icon representing that application.
 *   - `title` (`string`): The title for that application.
 * @param {Function} onOpen - Callback that will be called when/if an app is
 * launched through its icon, with the corresponding application path.
 * @param {AbortSignal} [parentAbortSignal] - AbortSignal allowing to free
 * all resources taken by this component.
 * @returns {HTMLElement} - The list of icons displayed. It is assumed to fill
 * the whole screen beside the taskbar element (and is automatically updated
 * on page resize).
 */
export default function DesktopAppIcons(apps, onOpen, parentAbortSignal) {
  let abortController;
  const iconWrapperElt = document.createElement("div");

  // initialize to no icon
  let lastGrid = [0, 0];
  SETTINGS.fontSize.onUpdate(recheckUpdate, {
    clearSignal: parentAbortSignal,
  });
  window.addEventListener("resize", recheckUpdate);
  SETTINGS.taskbarSize.onUpdate(recheckUpdate, {
    clearSignal: parentAbortSignal,
  });
  SETTINGS.taskbarLocation.onUpdate(recheckUpdate, {
    clearSignal: parentAbortSignal,
  });
  if (parentAbortSignal) {
    parentAbortSignal.addEventListener("abort", () => {
      window.removeEventListener("resize", recheckUpdate);
    });
  }
  recheckUpdate();
  return iconWrapperElt;

  function refreshIcons(gridSize, iconHeight) {
    /**
     * The next x, y position at which a desktop icon will be added.
     */
    let nextIconPosition = {
      x: ICON_X_BASE,
      y: ICON_Y_BASE,
    };

    iconWrapperElt.innerHTML = "";

    abortController?.abort();
    abortController = new AbortController();
    if (parentAbortSignal) {
      const onParentAbort = () => abortController.abort();
      parentAbortSignal.addEventListener("abort", onParentAbort);
      abortController.signal.addEventListener("abort", () => {
        parentAbortSignal.removeEventListener("abort", onParentAbort);
      });
    }

    const iconElts = [];
    let currentRow = 0;
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const icon = document.createElement("div");
      icon.tabIndex = "0";
      icon.className = "icon";

      if (currentRow >= gridSize[0]) {
        currentRow = 0;
        nextIconPosition.y = ICON_Y_BASE;
        nextIconPosition.x += ICON_WIDTH_BASE + ICON_X_OFFSET_FROM_WIDTH;
      }

      if (i >= gridSize[0] * gridSize[1]) {
        break;
      }

      const basePositionTop = nextIconPosition.y;
      const basePositionLeft = nextIconPosition.x;
      applyStyle(icon, {
        height: String(iconHeight) + "px",
        width: String(ICON_WIDTH_BASE) + "px",
        left: `${basePositionLeft}px`,
        top: `${basePositionTop}px`,
      });
      nextIconPosition.y += iconHeight + ICON_MARGIN;

      icon.innerHTML = `
<div class="icon-img">${app.icon}</div>
<div class="icon-text">${app.title}</div>
`;

      let clickCount = 0;
      let lastClickTs = -Infinity;
      icon.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter") {
          onOpen(app.run, app.args);
          icon.blur();
        }
      });
      icon.addEventListener("blur", () => {
        icon.classList.remove("selected");
      });
      icon.addEventListener("click", (evt) => {
        if (evt.pointerType === "mouse") {
          selectIcon(icon);

          // Double click to open app
          if (clickCount && performance.now() - lastClickTs < 300) {
            clickCount = 0;
            onOpen(app.run, app.args);
            icon.blur();
          } else {
            clickCount = 1;
            lastClickTs = performance.now();
          }
        } else {
          clickCount = 0;
          onOpen(app.run, app.args);
          icon.blur();
        }
      });

      const onDocumentClick = (evt) => {
        if (evt.target !== icon && !icon.contains(evt.target)) {
          icon.classList.remove("selected");
        }
      };
      document.addEventListener("click", onDocumentClick);
      abortController.signal.addEventListener("abort", () => {
        document.removeEventListener("click", onDocumentClick);
      });

      addMovingAroundListeners(
        icon,
        { baseLeft: basePositionLeft, baseTop: basePositionTop },
        abortController.signal,
      );
      iconElts.push(icon);
      currentRow++;
    }
    for (const iconElt of iconElts) {
      if (iconElt) {
        iconWrapperElt.appendChild(iconElt);
      }
    }
  }
  function recheckUpdate() {
    requestAnimationFrame(() => {
      // Do a complex check first to see if icons need to be re-rendered.
      // There was a performance ""issue"" (not that much in thruth, but still
      // surprising) repainting the icons on resize before.

      const newDimensions = getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue(),
      );
      const newMaxWidth = newDimensions.maxWidth;
      const newMaxHeight = newDimensions.maxHeight;
      const newIconHeight =
        ICON_HEIGHT_BASE +
        SETTINGS.fontSize.getValue() * 2 +
        ICON_Y_OFFSET_FROM_HEIGHT;
      const newGrid = [
        // nb of icons on height / column
        Math.floor(
          (newMaxHeight - ICON_Y_BASE) / (newIconHeight + ICON_MARGIN),
        ),
        // nb of icons on width / row
        Math.floor(
          (newMaxWidth - ICON_X_BASE) /
            (ICON_WIDTH_BASE + ICON_X_OFFSET_FROM_WIDTH),
        ),
      ];
      if (newGrid[0] < lastGrid[0]) {
        if (newGrid[0] >= apps.length) {
          // There's less apps than the first column anyway
          return;
        } else {
          refreshIcons(newGrid, newIconHeight);
          lastGrid = newGrid;
        }
      } else if (newGrid[0] === lastGrid[0]) {
        // check columns
        if (newGrid[1] < lastGrid[1]) {
          // less columns check that the new still can contain all apps
          if (newGrid[0] * newGrid[1] < apps.length) {
            refreshIcons(newGrid, newIconHeight);
            lastGrid = newGrid;
          }
        } else if (newGrid[1] > lastGrid[1]) {
          // more columns, check that the previous could contain all apps
          if (lastGrid[0] * lastGrid[1] < apps.length) {
            refreshIcons(newGrid, newIconHeight);
            lastGrid = newGrid;
          }
        }
      } else {
        // newGrid[0] > lastGrid[0]

        if (lastGrid[0] >= apps.length) {
          // There was apps than the first column anyway
          return;
        } else {
          refreshIcons(newGrid, newIconHeight);
          lastGrid = newGrid;
        }
      }
    });
  }
}

/**
 * @param {HTMLElement} icon
 */
function selectIcon(icon) {
  for (const i of document.getElementsByClassName("icon")) {
    i.classList.remove("selected");
  }
  icon.classList.add("selected");
}

function getMaxIconPosition(iconElt) {
  const maxDesktopDimensions = getMaxDesktopDimensions(
    SETTINGS.taskbarLocation.getValue(),
    SETTINGS.taskbarSize.getValue(),
  );
  const maxX = maxDesktopDimensions.maxWidth - iconElt.clientWidth;
  const maxY = maxDesktopDimensions.maxHeight - iconElt.clientHeight;
  return { maxX, maxY };
}

function addMovingAroundListeners(icon, { baseLeft, baseTop }, abortSignal) {
  let isDragging = false;
  let offsetX, offsetY;
  abortSignal.addEventListener("abort", () => {
    unblockElementsFromTakingPointerEvents();
  });

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    blockElementsFromTakingPointerEvents();
    const topOffset =
      SETTINGS.taskbarLocation.getValue() === "top"
        ? SETTINGS.taskbarSize.getValue()
        : 0;
    const leftOffset =
      SETTINGS.taskbarLocation.getValue() === "left"
        ? SETTINGS.taskbarSize.getValue()
        : 0;
    const rect = icon.getBoundingClientRect();
    icon.style.transition = "";
    offsetX = touch.clientX - rect.left + leftOffset;
    offsetY = touch.clientY - rect.top + topOffset;
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - offsetX;
      const newY = touch.clientY - offsetY;
      const { maxX, maxY } = getMaxIconPosition(icon);
      icon.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
      icon.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    }
  };
  const onMouseDown = (e) => {
    if (e.button !== 0) {
      // not left click
      return;
    }
    isDragging = true;
    blockElementsFromTakingPointerEvents();
    const topOffset =
      SETTINGS.taskbarLocation.getValue() === "top"
        ? SETTINGS.taskbarSize.getValue()
        : 0;
    const leftOffset =
      SETTINGS.taskbarLocation.getValue() === "left"
        ? SETTINGS.taskbarSize.getValue()
        : 0;
    icon.style.zIndex = "9999999";
    icon.style.transition = "";
    const rect = icon.getBoundingClientRect();
    offsetX = e.clientX - rect.left + leftOffset;
    offsetY = e.clientY - rect.top + topOffset;
  };
  const onDocumentMouseMove = (e) => {
    if (!isDragging) {
      return;
    }
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;
    const { maxX, maxY } = getMaxIconPosition(icon);
    icon.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
    icon.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
  };
  const onMouseUp = () => {
    isDragging = false;
    resetIconPosition();
    unblockElementsFromTakingPointerEvents();
  };
  const resetIconPosition = () => {
    icon.style.transition = "background-color 0.2s, top 0.2s, left 0.2s";
    icon.style.zIndex = "";
    icon.style.left = `${baseLeft}px`;
    icon.style.top = `${baseTop}px`;
  };
  addAbortableEventListener(icon, "touchstart", abortSignal, onTouchStart, {
    passive: true,
  });
  addAbortableEventListener(icon, "touchend", abortSignal, onMouseUp);
  addAbortableEventListener(icon, "touchmove", abortSignal, onTouchMove, {
    passive: true,
  });

  // Safari just selects all over the place like some maniac without this
  addAbortableEventListener(icon, "selectstart", abortSignal, (e) => {
    e.preventDefault();
  });
  addAbortableEventListener(icon, "mousedown", abortSignal, onMouseDown);
  addAbortableEventListener(
    document.documentElement,
    "mouseleave",
    abortSignal,
    () => {
      isDragging = false;
      resetIconPosition();
    },
  );
  addAbortableEventListener(
    document.documentElement,
    "mouseenter",
    abortSignal,
    () => {
      isDragging = false;
      resetIconPosition();
    },
  );
  addAbortableEventListener(
    document.documentElement,
    "click",
    abortSignal,
    () => {
      isDragging = false;
      resetIconPosition();
    },
  );
  addAbortableEventListener(
    document,
    "mousemove",
    abortSignal,
    onDocumentMouseMove,
  );
  addAbortableEventListener(document, "mouseup", abortSignal, onMouseUp);
}
