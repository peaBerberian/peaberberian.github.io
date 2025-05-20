// TODO: Rename icon?

import fs from "../filesystem/filesystem.mjs";
import {
  ICON_WIDTH_BASE,
  ICON_HEIGHT_BASE,
  ICON_X_BASE,
  ICON_X_OFFSET_FROM_WIDTH,
  ICON_Y_BASE,
  ICON_Y_OFFSET_FROM_HEIGHT,
  ICON_MARGIN,
  settingsSvg,
  resetSvg,
  PROJECT_REPO,
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
import notificationEmitter from "./notification_emitter.mjs";
import setUpContextMenu from "./context-menu.mjs";

const USER_DESKTOP_CONFIG = "/userconfig/desktop.config.json";

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

  addContainerContextMenu(containerElt, onOpen, parentAbortSignal);
  fs.watch(
    USER_DESKTOP_CONFIG,
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
      const userConfig = await fs.readFile(USER_DESKTOP_CONFIG);
      if (lastAppListMemory === userConfig) {
        return [false, JSON.parse(userConfig).list];
      }
      lastAppListMemory = userConfig;
      let tmpList;
      try {
        tmpList = JSON.parse(userConfig).list;
      } catch (err) {
        notificationEmitter.warning(
          "Invalid Desktop Config",
          `"${USER_DESKTOP_CONFIG}" is not a valid JSON file.\nResetting it to its default value...`,
        );
        throw new Error("Malformed config file");
      }
      for (const app of tmpList) {
        if (
          typeof app.title !== "string" ||
          typeof app.icon !== "string" ||
          typeof app.run !== "string" ||
          (app.args != null && !Array.isArray(app.args))
        ) {
          notificationEmitter.warning(
            "Invalid Desktop Config",
            `"${USER_DESKTOP_CONFIG}" contains invalid data.\nResetting it to its default value...`,
          );
          throw new Error("Malformed config file");
        }
      }
      return [true, tmpList];
    } catch (err) {
      if (err.code === "NoEntryError") {
        console.info(`No "${USER_DESKTOP_CONFIG}" yet. Initializing one...`);
      }
      const systemConfig = await fs.readFile(
        "/system32/default-desktop.json",
        "object",
      );
      lastAppListMemory = JSON.stringify(systemConfig, null, 2);
      try {
        await fs.writeFile(USER_DESKTOP_CONFIG, lastAppListMemory);
      } catch (err) {
        console.info(
          "The desktop icons won't be persisted, cannot save file to IndexedDB storage:",
          err.toString(),
        );
      }
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

    function recheckUpdate(force) {
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

            if (force) {
              doRefresh();
            }
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
      addIconEltContextMenu(iconElt, appList, app, abortSignal);
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
            fs.writeFile(USER_DESKTOP_CONFIG, lastAppListMemory);
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
        e.preventDefault();
        const index = appList.indexOf(app);
        if (index >= 0) {
          appList.splice(index, 1);
          const newAppList = JSON.stringify({ list: appList }, null, 2);
          // NOTE: We do not update `lastAppListMemory` because we DO want to
          // refresh here
          fs.writeFile(USER_DESKTOP_CONFIG, newAppList);
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

  function addIconEltContextMenu(iconElt, appList, app, abortSignal) {
    setUpContextMenu({
      element: iconElt,
      filter: (e) => iconElt.contains(e.target),
      abortSignal,
      actions: [
        {
          name: "open",
          title: "Open icon",
          height: "1.3em",
          svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-139.000000, -560.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M98.75,413 L101.9,413 L101.9,407 L98.75,407 L98.75,413 Z M90.35,405 L96.65,405 L96.65,402 L90.35,402 L90.35,405 Z M90.35,413 L96.65,413 L96.65,407 L90.35,407 L90.35,413 Z M90.35,418 L96.65,418 L96.65,415 L90.35,415 L90.35,418 Z M85.1,413 L88.25,413 L88.25,407 L85.1,407 L85.1,413 Z M98.75,405 L98.75,400 L88.25,400 L88.25,405 L83,405 L83,415 L88.25,415 L88.25,420 L98.75,420 L98.75,415 L104,415 L104,405 L98.75,405 Z"></path></g></g></g></svg>`,
          onClick: () => {
            onOpen(app.run, app.args ?? []);
            iconElt.blur();
          },
        },
        {
          name: "clear",
          title: "Delete icon",
          onClick: () => {
            const index = appList.indexOf(app);
            if (index >= 0) {
              appList.splice(index, 1);
              const newAppList = JSON.stringify({ list: appList }, null, 2);
              // NOTE: We do not update `lastAppListMemory` because we DO want to
              // refresh here
              fs.writeFile(USER_DESKTOP_CONFIG, newAppList);
            }
          },
        },
        { name: "separator" },
        ...getBasicContextMenuActions(),
      ],
    });
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

function addContainerContextMenu(containerElt, onOpen, abortSignal) {
  setUpContextMenu({
    element: containerElt,
    filter: (e) => e.target === containerElt,
    abortSignal,
    actions: getBasicContextMenuActions(onOpen),
  });
}

function getBasicContextMenuActions(onOpen) {
  return [
    {
      name: "reset",
      title: "Reset desktop icons to default",
      svg: resetSvg,
      onClick: async () => {
        try {
          await fs.rmFile(USER_DESKTOP_CONFIG);
        } catch (err) {
          notificationEmitter.error(
            "Desktop icons reset",
            "Failed to reset desktop icons: " + err.toString(),
          );
        }
      },
    },
    {
      name: "add",
      title: "Add desktop icons",
      svg: `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      onClick: () => {
        onOpen("/apps/add-desktop-icon.run", []);
      },
    },
    {
      name: "clear",
      title: "Clear all icons",
      onClick: async () => {
        try {
          await fs.writeFile(
            USER_DESKTOP_CONFIG,
            JSON.stringify({ list: [] }, null, 2),
          );
        } catch (err) {
          notificationEmitter.error(
            "Desktop icons clear",
            "Failed to clear desktop icons: " + err.toString(),
          );
        }
      },
    },
    { name: "separator" },
    {
      name: "settings",
      title: "Open settings",
      svg: settingsSvg,
      onClick: () => {
        onOpen("/apps/settings.run", []);
      },
    },
    {
      name: "fullscreen",
      title: "Toggle fullscreen",
      onClick: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.body.requestFullscreen();
        }
      },
    },
    {
      name: "code",
      title: "Go to the project's code repository",
      onClick: () => window.open(PROJECT_REPO, "_blank"),
    },
  ];
}
