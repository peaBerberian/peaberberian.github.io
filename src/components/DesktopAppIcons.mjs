// TODO: Rename icon?
// TODO: context menu

import fs from "../filesystem/filesystem.mjs";
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
  createLinkedAbortController,
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
 *   - `args` (`Args`): The optional arguments for that application.
 * @param {Function} onOpen - Callback that will be called when/if an app is
 * launched through its icon, with the corresponding application path.
 * @param {AbortSignal} [parentAbortSignal] - AbortSignal allowing to free
 * all resources taken by this component.
 * @returns {HTMLElement} - The list of icons displayed. It is assumed to fill
 * the whole screen beside the taskbar element (and is automatically updated
 * on page resize).
 */
export default async function DesktopAppIcons(
  containerElt,
  onOpen,
  parentAbortSignal,
) {
  const iconWrapperElt = document.createElement("div");
  let lastAppListMemory;
  let currentAbortController = createLinkedAbortController(parentAbortSignal);

  fs.watch(
    "/userconfig/desktop.config.json",
    async () => {
      const abortSignal = currentAbortController.signal;
      const [hasChanged, newAppList] = await getAppList();
      if (abortSignal.aborted || !hasChanged) {
        return;
      }
      iconWrapperElt.innerHTML = "";
      currentAbortController.abort();
      currentAbortController = createLinkedAbortController(parentAbortSignal);

      await constructGrid(newAppList, currentAbortController.signal);
      if (abortSignal.aborted) {
        return;
      }
    },
    parentAbortSignal,
  );

  const abortSignal = currentAbortController.signal;
  const [_, appList] = await getAppList();
  if (abortSignal.aborted) {
    return;
  }
  constructGrid(appList, abortSignal);

  async function getAppList() {
    try {
      const userConfig = await fs.readFile("/userconfig/desktop.config.json");
      if (lastAppListMemory === userConfig) {
        return [false, JSON.parse(userConfig).list];
      }
      lastAppListMemory = userConfig;
      const tmpList = JSON.parse(userConfig).list;
      for (const app of tmpList) {
        if (
          typeof app.title !== "string" ||
          typeof app.icon !== "string" ||
          typeof app.run !== "string" ||
          (app.args != null && !Array.isArray(app.args))
        ) {
          throw new Error("Malformed config file");
        }
      }
      return [true, tmpList];
    } catch (err) {
      if (err.code !== "NoEntryError") {
        console.warn('Failure to read "/userconfig/desktop.config.json":', err);
        console.warn(`"/userconfig/desktop.config.json" will be reset`);
      } else {
        console.info(
          `No "/userconfig/desktop.config.json" yet. Initializing one...`,
        );
      }
      const systemConfig = await fs.readFile(
        "/system32/default-desktop.json",
        "object",
      );
      lastAppListMemory = JSON.stringify(systemConfig, null, 2);
      fs.writeFile("/userconfig/desktop.config.json", lastAppListMemory);
      return [true, systemConfig.list.slice()];
    }
  }

  function constructGrid(appList, abortSignal) {
    if (abortSignal.aborted) {
      return;
    }
    let currentGridAbortController = createLinkedAbortController(abortSignal);

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
    containerElt.appendChild(iconWrapperElt);
    return recheckUpdate();

    function recheckUpdate() {
      return new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
          try {
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

            const doRefresh = () => {
              currentGridAbortController?.abort();
              currentGridAbortController =
                createLinkedAbortController(abortSignal);
              refreshIcons(
                appList,
                newGrid,
                newIconHeight,
                currentGridAbortController.signal,
              );
              lastGrid = newGrid;
            };

            if (newGrid[0] < lastGrid[0]) {
              if (newGrid[0] >= appList.length) {
                // There's less apps than the first column anyway
                return;
              } else {
                doRefresh();
              }
            } else if (newGrid[0] === lastGrid[0]) {
              // check columns
              if (newGrid[1] < lastGrid[1]) {
                // less columns check that the new still can contain all apps
                if (newGrid[0] * newGrid[1] < appList.length) {
                  doRefresh();
                }
              } else if (newGrid[1] > lastGrid[1]) {
                // more columns, check that the previous could contain all apps
                if (lastGrid[0] * lastGrid[1] < appList.length) {
                  doRefresh();
                }
              }
            } else {
              // newGrid[0] > lastGrid[0]

              if (lastGrid[0] >= appList.length) {
                // There was apps than the first column anyway
                return;
              } else {
                doRefresh();
              }
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }

  function refreshIcons(appList, gridSize, iconHeight, abortSignal) {
    if (abortSignal.aborted) {
      return;
    }

    /**
     * The next x, y position at which a desktop icon will be added.
     */
    let nextIconPosition = {
      x: ICON_X_BASE,
      y: ICON_Y_BASE,
    };

    iconWrapperElt.innerHTML = "";

    const iconEltToAppMap = new Map();
    let currentRow = 0;
    for (let i = 0; i < appList.length; i++) {
      const app = appList[i];
      const iconElt = document.createElement("div");
      iconElt.tabIndex = "0";
      iconElt.className = `icon icon-app-${app.id}`;

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
      applyStyle(iconElt, {
        height: String(iconHeight) + "px",
        width: String(ICON_WIDTH_BASE) + "px",
        left: `${basePositionLeft}px`,
        top: `${basePositionTop}px`,
      });
      nextIconPosition.y += iconHeight + ICON_MARGIN;

      iconElt.innerHTML = `
<div class="icon-img">${app.icon}</div>
<div class="icon-text">${app.title}</div>
`;

      let clickCount = 0;
      let lastClickTs = -Infinity;
      iconElt.onkeydown = (e) => onKeyDown(appList, iconElt, app, e);
      iconElt.addEventListener("blur", () => {
        iconElt.classList.remove("selected");
      });
      iconElt.addEventListener("click", (evt) => {
        if (evt.pointerType === "mouse") {
          selectIcon(iconElt);

          // Double click to open app
          if (clickCount && performance.now() - lastClickTs < 300) {
            clickCount = 0;
            onOpen(app.run, app.args ?? []);
            iconElt.blur();
          } else {
            clickCount = 1;
            lastClickTs = performance.now();
          }
        } else {
          clickCount = 0;
          onOpen(app.run, app.args ?? []);
          iconElt.blur();
        }
      });

      const onDocumentClick = (evt) => {
        if (evt.target !== iconElt && !iconElt.contains(evt.target)) {
          iconElt.classList.remove("selected");
        }
      };
      document.addEventListener("click", onDocumentClick);
      abortSignal.addEventListener("abort", () => {
        document.removeEventListener("click", onDocumentClick);
      });
      iconEltToAppMap.set(iconElt, app);
      iconWrapperElt.appendChild(iconElt);
      currentRow++;
    }

    addMovingAroundListeners(
      iconWrapperElt.children,
      {
        height: iconHeight,
        width: ICON_WIDTH_BASE,
      },
      (elt1, elt2) => exchangeAppPlaces(appList, iconEltToAppMap, elt1, elt2),
      abortSignal,
    );
  }

  function exchangeAppPlaces(appList, iconEltToAppMap, iconElt1, iconElt2) {
    const app1 = iconEltToAppMap.get(iconElt1);
    const app2 = iconEltToAppMap.get(iconElt2);
    for (let i = 0; i < appList.length; i++) {
      if (appList[i] === app1) {
        for (let j = 0; j < appList.length; j++) {
          if (appList[j] === app2) {
            const tempApp1 = appList[i];
            appList[i] = appList[j];
            appList[j] = tempApp1;
            lastAppListMemory = JSON.stringify({ list: appList }, null, 2);
            fs.writeFile("/userconfig/desktop.config.json", lastAppListMemory);
            return;
          }
        }
        return;
      }
    }
  }

  /**
   * @param {Array.<Object>} appList
   * @param {HTMLElement} iconElt
   * @param {Object} app
   * @param {KeyboardEvent} e
   */
  function onKeyDown(appList, iconElt, app, e) {
    switch (e.key) {
      case "Escape": {
        e.preventDefault();
        iconElt.blur();
        iconElt.classList.remove("selected");
        break;
      }
      case "Delete": {
        if (!SETTINGS.canDeleteIcon.getValue()) {
          return;
        }
        e.preventDefault();
        const index = appList.indexOf(app);
        if (index >= 0) {
          appList.splice(index, 1);
          const newAppList = JSON.stringify({ list: appList }, null, 2);
          // NOTE: We do not update `lastAppListMemory` because we DO want to
          // refresh here
          fs.writeFile("/userconfig/desktop.config.json", newAppList);
        }
        break;
      }
      case "Backspace": {
        e.preventDefault();
        navigateToParent();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();

        const allElements = iconWrapperElt.getElementsByClassName("icon");
        if (allElements.length === 0) {
          return;
        }

        // NOTE: we could rely on the grid here and be much much more efficient.
        // But this would be at the cost of maintainability, for something
        // nobody will ever do.
        const currentClientRect = iconElt.getBoundingClientRect();

        let prevSibling = iconElt.previousElementSibling;
        while (prevSibling) {
          const clientRect = prevSibling.getBoundingClientRect();
          if (clientRect.top === currentClientRect.top) {
            prevSibling.focus();
            break;
          }
          prevSibling = prevSibling.previousElementSibling;
        }
        break;
      }

      case "ArrowRight": {
        e.preventDefault();

        const allElements = iconWrapperElt.getElementsByClassName("icon");
        if (allElements.length === 0) {
          return;
        }

        // NOTE: we could rely on the grid here and be much much more efficient.
        // But this would be at the cost of maintainability, for something
        // nobody will ever do.
        const currentClientRect = iconElt.getBoundingClientRect();

        let nextSibling = iconElt.nextElementSibling;
        while (nextSibling) {
          const clientRect = nextSibling.getBoundingClientRect();
          if (clientRect.top === currentClientRect.top) {
            nextSibling.focus();
            break;
          }
          nextSibling = nextSibling.nextElementSibling;
        }
        break;
      }

      case "ArrowDown": {
        e.preventDefault();

        const allElements = iconWrapperElt.getElementsByClassName("icon");
        if (allElements.length === 0) {
          return;
        }

        const currentClientRect = iconElt.getBoundingClientRect();
        const nextSibling = iconElt.nextElementSibling;
        if (nextSibling) {
          const clientRect = nextSibling.getBoundingClientRect();
          if (clientRect.left === currentClientRect.left) {
            nextSibling.focus();
          }
        }
        break;
      }

      case "ArrowUp": {
        e.preventDefault();

        const allElements = iconWrapperElt.getElementsByClassName("icon");
        if (allElements.length === 0) {
          return;
        }

        const currentClientRect = iconElt.getBoundingClientRect();
        const previousSibling = iconElt.previousElementSibling;
        if (previousSibling) {
          const clientRect = previousSibling.getBoundingClientRect();
          if (clientRect.left === currentClientRect.left) {
            previousSibling.focus();
          }
        }
        break;
      }

      case "Enter": {
        e.preventDefault();
        onOpen(app.run, app.args ?? []);
        iconElt.blur();
        break;
      }
    }
  }
}

/**
 * @param {HTMLElement} iconElt
 */
function selectIcon(iconElt) {
  for (const i of document.getElementsByClassName("icon")) {
    i.classList.remove("selected");
  }
  iconElt.classList.add("selected");
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

function addMovingAroundListeners(
  iconElts,
  { height, width },
  exchangeApps,
  abortSignal,
) {
  let isDragging = null;
  let offsetX, offsetY;
  let dragBaseLeft;
  let dragBaseTop;
  let updatedLeft;
  let updatedTop;
  let tempMovedElt = null;
  abortSignal.addEventListener("abort", () => {
    unblockElementsFromTakingPointerEvents();
  });

  for (const iconElt of iconElts) {
    const onMouseUp = () => {
      if (isDragging !== iconElt) {
        return;
      }
      if (tempMovedElt) {
        exchangeApps(tempMovedElt.element, iconElt);
      }
      tempMovedElt = null;
      isDragging = null;
      resetIconPosition(iconElt);
      unblockElementsFromTakingPointerEvents();
    };

    addAbortableEventListener(
      iconElt,
      "touchstart",
      abortSignal,
      (e) => {
        const touch = e.touches[0];
        onStart(iconElt, touch);
      },
      {
        passive: true,
      },
    );
    addAbortableEventListener(iconElt, "touchend", abortSignal, onMouseUp);
    addAbortableEventListener(
      iconElt,
      "touchmove",
      abortSignal,
      (e) => {
        if (e.touches.length !== 1) {
          return;
        }
        const touch = e.touches[0];
        onMove(iconElt, touch);
      },
      {
        passive: true,
      },
    );

    // Safari just selects all over the place like some maniac without this
    addAbortableEventListener(iconElt, "selectstart", abortSignal, (e) => {
      e.preventDefault();
    });
    addAbortableEventListener(iconElt, "mousedown", abortSignal, (e) => {
      if (e.button !== 0) {
        // not left click
        return;
      }
      onStart(iconElt, e);
    });
    addAbortableEventListener(document, "mousemove", abortSignal, (e) => {
      if (isDragging !== iconElt) {
        return;
      }
      onMove(iconElt, e);
    });
    addAbortableEventListener(document, "mouseup", abortSignal, onMouseUp);
    addAbortableEventListener(
      document.documentElement,
      "mouseleave",
      abortSignal,
      () => {
        if (isDragging !== iconElt) {
          return;
        }
        isDragging = null;
        resetIconPosition();
      },
    );
    addAbortableEventListener(
      document.documentElement,
      "mouseenter",
      abortSignal,
      () => {
        if (isDragging !== iconElt) {
          return;
        }
        isDragging = null;
        resetIconPosition();
      },
    );
    addAbortableEventListener(
      document.documentElement,
      "click",
      abortSignal,
      () => {
        if (isDragging !== iconElt) {
          return;
        }
        isDragging = null;
        resetIconPosition();
      },
    );
  }

  function onStart(iconElt, { clientX, clientY }) {
    if (!SETTINGS.moveAroundIcons.getValue()) {
      return;
    }
    isDragging = iconElt;
    blockElementsFromTakingPointerEvents();
    const topOffset =
      SETTINGS.taskbarLocation.getValue() === "top"
        ? SETTINGS.taskbarSize.getValue()
        : 0;
    const leftOffset =
      SETTINGS.taskbarLocation.getValue() === "left"
        ? SETTINGS.taskbarSize.getValue()
        : 0;
    // iconElt.style.zIndex = "9999999";
    iconElt.style.transition = "";
    dragBaseLeft = parseInt(iconElt.style.left);
    dragBaseTop = parseInt(iconElt.style.top);
    updatedLeft = dragBaseLeft;
    updatedTop = dragBaseTop;
    offsetX = clientX - dragBaseLeft + leftOffset;
    offsetY = clientY - dragBaseTop + topOffset;
  }

  function onMove(iconElt, { clientX, clientY }) {
    const newX = clientX - offsetX;
    const newY = clientY - offsetY;
    const { maxX, maxY } = getMaxIconPosition(iconElt);
    const newLeft = Math.max(0, Math.min(newX, maxX));
    const newTop = Math.max(0, Math.min(newY, maxY));
    iconElt.style.left = `${newLeft}px`;
    iconElt.style.top = `${newTop}px`;

    const newRight = newLeft + width;
    const newBottom = newTop + height;
    for (const child of iconElts) {
      if (child === iconElt) {
        continue;
      }
      const childLeft = parseInt(child.style.left);
      const childTop = parseInt(child.style.top);
      const isOverlapping = !(
        newRight < childLeft ||
        newLeft > childLeft + width ||
        newBottom < childTop ||
        newTop > childTop + height
      );
      if (isOverlapping) {
        if (
          Math.abs(childLeft - newLeft) < width / 2 &&
          Math.abs(childTop - newTop) < height / 2
        ) {
          let resettedChild;
          if (tempMovedElt) {
            tempMovedElt.element.style.left = tempMovedElt.from.left;
            tempMovedElt.element.style.top = tempMovedElt.from.top;
            if (tempMovedElt.element === child) {
              resettedChild = true;
            }
          }
          if (!resettedChild) {
            tempMovedElt = {
              element: child,
              from: {
                left: child.style.left,
                top: child.style.top,
              },
            };
            child.style.transition =
              "background-color 0.2s, top 0.2s, left 0.2s";
            child.style.left = `${dragBaseLeft}px`;
            child.style.top = `${dragBaseTop}px`;
          } else {
            tempMovedElt = null;
          }
          updatedLeft = childLeft;
          updatedTop = childTop;
        }
        break;
      }
    }
  }

  function resetIconPosition(iconElt) {
    iconElt.style.transition = "background-color 0.2s, top 0.2s, left 0.2s";
    iconElt.style.zIndex = "";
    iconElt.style.left = `${updatedLeft}px`;
    iconElt.style.top = `${updatedTop}px`;
    dragBaseLeft = updatedLeft;
    dragBaseTop = updatedTop;
  }
}
