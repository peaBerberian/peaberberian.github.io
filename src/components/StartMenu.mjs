import {
  START_ITEM_HEIGHT,
  START_MENU_OPEN_ANIM_TIMER,
  CLOSE_MENU_OPEN_ANIM_TIMER,
} from "../constants.mjs";
import fs from "../filesystem/filesystem.mjs";
import { SETTINGS } from "../settings.mjs";

const PREDEFINED_SUBLISTS = {
  Games: "🎮",
  ["My Other Projects"]: "👨‍💻",
  ["External Apps"]: "📡",
  ["Misc"]: "⏰",
};

/**
 * Description of a single application that will be displayed in the start menu.
 * @typedef {Object} StartMenuAppObject
 * @property {string} type - Set to `"application"` to indicate this is an
 * application.
 * @property {string} run - The path to the application to run.
 * @property {Array.<string>} args - The arguments with which this app should be
 * run.
 * @property {string} icon` - The icon representing that application.
 * @property {string} title - The title for that application.
 */

/**
 * Description of a sublist in the start menu.
 * @typedef {Object} Sublist Object
 * @property {string} type - Set to `"sublist"` to indicate this is a sublist.
 * @property {string} name - The name of this sublist
 * @property {Array.<StartMenuAppObject>} list - List of applications inside
 */

/**
 * The current start menu state we're in:
 *   - `"closed"`: The start menu is closed.
 *   - `"opened"`: The start menu is opened.
 *   - `"opening"`: The start menu is opening.
 *   - `"closing"`: The start menu is closing.
 * @type {string}
 */
let currentStartState = "closed";

/** The button element to open the start menu */
const startButtonElt = document.getElementById("start-button");
/** The picture inside the start button element. */
const startPicElt = document.getElementById("start-pic");
/** The `HTMLElement for the start menu itself */
const startMenuElt = document.getElementById("start-menu");

/**
 * @param {Function} onOpen - Callback that will be called when/if an app is
 * launched through its start menu entry, with the corresponding application
 * path.
 * @param {AbortSignal} [abortSignal] - AbortSignal allowing to free
 * all resources taken by this component.
 */
export default async function StartMenu(openApp, abortSignal) {
  const startMenuApps = await fs.readFile(
    "/system32/start_menu.config.json",
    "object",
  );

  /**
   * List of applications for which you want to generate an icon, in order from
   * the first displayed to the last displayed.
   * @type {Array.<StartMenuAppObject>}
   */
  const apps = startMenuApps.list;

  refreshStartMenu(startMenuElt, apps, openApp, {
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,
  });

  const onDocumentClick = (evt) => {
    if (
      evt.target === startMenuElt ||
      startMenuElt.contains(evt.target) ||
      evt.target === startButtonElt ||
      startButtonElt.contains(evt.target)
    ) {
      return;
    }
    closeStartMenu(startMenuElt);
  };
  const onStartButtonClick = () => {
    switch (currentStartState) {
      case "opening":
      case "opened":
        closeStartMenu(startMenuElt);
        break;
      default:
        startPicElt.style.animation = "SPEEN 0.3s ease-in-out";
        startPicElt.onanimationend = () => {
          startPicElt.style.animation = "";
        };
        openStartMenu(startMenuElt);
        break;
    }
  };

  const scheduleRefresh = () => {
    requestAnimationFrame(() => {
      refreshStartMenu(startMenuElt, apps, openApp, {
        clientHeight: document.documentElement.clientHeight,
        clientWidth: document.documentElement.clientWidth,
      });
    });
  };

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeyDown);
  startButtonElt.addEventListener("click", onStartButtonClick);
  startButtonElt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onStartButtonClick();
    }
  });
  window.addEventListener("resize", scheduleRefresh);
  startMenuElt.addEventListener("mousedown", onMouseDown);
  SETTINGS.enableStartMenuSublists.onUpdate(scheduleRefresh, {
    clearSignal: abortSignal,
  });
  SETTINGS.taskbarSize.onUpdate(scheduleRefresh, {
    clearSignal: abortSignal,
  });
  SETTINGS.taskbarLocation.onUpdate(scheduleRefresh, {
    clearSignal: abortSignal,
  });

  if (abortSignal) {
    abortSignal.addEventListener("abort", () => {
      startMenuElt.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
      startButtonElt.removeEventListener("click", onStartButtonClick);
      window.removeEventListener("resize", scheduleRefresh);
    });
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      closeStartMenu(startMenuElt);
    }
  }

  function onMouseDown(e) {
    if (e.button) {
      // not left click
      return;
    }
    e.preventDefault();
  }
}

function openStartMenu(startMenuElt) {
  if (currentStartState === "opening" || currentStartState === "opened") {
    return;
  }
  currentStartState = "opening";
  startMenuElt.style.display = "flex";
  switch (SETTINGS.taskbarLocation.getValue()) {
    case "bottom":
      startMenuElt.style.animation =
        "openStartAnim " +
        String(START_MENU_OPEN_ANIM_TIMER / 1000) +
        "s ease-out";
      break;
    default:
      startMenuElt.style.animation =
        "openStartFromTopAnim " +
        String(START_MENU_OPEN_ANIM_TIMER / 1000) +
        "s ease-out";
      break;
  }
  startMenuElt.onanimationend = () => {
    if (currentStartState !== "opening") {
      return;
    }
    currentStartState = "opened";
    if (startMenuElt.style.display === "flex") {
      startMenuElt.classList.add("active");
    }
  };
}

function closeStartMenu(startMenuElt) {
  if (currentStartState === "closing" || currentStartState === "closed") {
    return;
  }
  currentStartState = "closing";
  startMenuElt.classList.remove("active");
  const sublists = startMenuElt.getElementsByClassName("s-list");
  const animation =
    SETTINGS.taskbarLocation.getValue() === "bottom"
      ? "closeStartAnim " +
        String(CLOSE_MENU_OPEN_ANIM_TIMER / 1000) +
        "s ease-out"
      : "closeStartFromTopAnim " +
        String(CLOSE_MENU_OPEN_ANIM_TIMER / 1000) +
        "s ease-out";

  startMenuElt.style.animation = animation;
  startMenuElt.onanimationend = () => {
    const mainItems = startMenuElt.getElementsByClassName("start-menu-items");
    for (const mainItem of mainItems) {
      mainItem.style.display = "block";
    }
    for (const list of sublists) {
      list.classList.remove("active");
    }
    if (currentStartState !== "closing") {
      return;
    }
    currentStartState = "closed";
    if (!startMenuElt.classList.contains("active")) {
      startMenuElt.style.display = "none";
    }
  };
}

/**
 * Set HTML for the `startMenuElt`, according to the given apps and client's
 * dimensions.
 * You can safely re-call this function if any of its parameters changed, in
 * which case the start menu will be re-computed.
 * @param {HTMLElement} startMenuElt - `HTMLElement` where the start menu will
 * be inserted. Note that this `HTMLELement` will be emptied.
 * @param {Array.<StartMenuAppObject>} apps - Description of every applications
 * that should be inserted in the start menu.
 * @param {Function} openApp - Callback allowing to open an app on which the
 * user would have clicked through the start menu.
 * @param {Object} params
 * @param {number} params.clientHeight - Total available height in pixels.
 * @param {number} params.clientWidth - Total available width in pixels.
 * @param {boolean} params.dependentSubLists
 */
function refreshStartMenu(
  startMenuElt,
  apps,
  openApp,
  { clientHeight, clientWidth, dependentSubLists },
) {
  startMenuElt.innerHTML = "";

  const startMenuHeaderElt = document.createElement("div");
  startMenuHeaderElt.className = "start-header";
  startMenuHeaderElt.textContent = "Paul's Web Desktop";
  startMenuHeaderElt.style.height = String(START_ITEM_HEIGHT) + "px";
  startMenuHeaderElt.style.display = "flex";
  startMenuHeaderElt.style.alignItems = "center";

  const startMenuItemsElt = document.createElement("div");
  startMenuItemsElt.className = "start-menu-items";
  startMenuItemsElt.style.overflow = "auto";

  const doesTaskbarInfluencesMaxHeight = ["top", "bottom"].includes(
    SETTINGS.taskbarLocation.getValue(),
  );

  const separatedSublists =
    !dependentSubLists &&
    clientWidth -
      (doesTaskbarInfluencesMaxHeight ? 0 : SETTINGS.taskbarSize.getValue()) >=
      10 /* start menu left */ +
        250 /* start menu width */ +
        200; /* s-list width */

  const itemsWrapperElt = document.createElement("div");
  itemsWrapperElt.appendChild(startMenuItemsElt);
  itemsWrapperElt.style.overflow = "auto";
  if (SETTINGS.taskbarLocation.getValue() !== "top") {
    startMenuElt.appendChild(startMenuHeaderElt);
  }
  startMenuElt.appendChild(itemsWrapperElt);

  for (let currentIdx = 0; currentIdx < apps.length; currentIdx++) {
    const appObj = apps[currentIdx];
    if (appObj.type === "application") {
      startMenuItemsElt.appendChild(constructAppItem(appObj));
    } else if (appObj.type === "sublist") {
      if (!SETTINGS.enableStartMenuSublists.getValue()) {
        for (const subAppObj of appObj.list) {
          startMenuItemsElt.appendChild(constructAppItem(subAppObj));
        }
      } else {
        const listIconElt = document.createElement("div");
        listIconElt.className = "start-icon";
        listIconElt.textContent = PREDEFINED_SUBLISTS[appObj.name] ?? "🗃️";

        const listTitleElt = document.createElement("div");
        listTitleElt.style.display = "flex";
        listTitleElt.style.alignItems = "center";
        listTitleElt.className = "start-title";
        listTitleElt.textContent = appObj.name;

        const startItemListElt = document.createElement("div");
        startItemListElt.className = "start-item start-item-list";
        startItemListElt.style.height = String(START_ITEM_HEIGHT) + "px";

        startItemListElt.appendChild(listIconElt);
        startItemListElt.appendChild(listTitleElt);
        startMenuItemsElt.appendChild(startItemListElt);

        const list = document.createElement("div");
        list.className = "s-list";

        let baseYOffset = 0;

        const listItemsWrapper = document.createElement("div");
        listItemsWrapper.className = "s-list-wrapper";

        list.appendChild(listItemsWrapper);
        startMenuElt.appendChild(list);

        for (const subAppObj of appObj.list) {
          listItemsWrapper.appendChild(constructAppItem(subAppObj));
        }

        if (separatedSublists) {
          listItemsWrapper.style.maxHeight =
            String(clientHeight - baseYOffset) + "px";
          if (SETTINGS.taskbarLocation.getValue() === "bottom") {
            list.style.bottom =
              String((apps.length - 1 - currentIdx) * START_ITEM_HEIGHT) + "px";
          } else {
            // There might be the start menu header first
            const offset =
              SETTINGS.taskbarLocation.getValue() === "top"
                ? 0
                : START_ITEM_HEIGHT;
            list.style.top =
              String(offset + currentIdx * START_ITEM_HEIGHT) + "px";
          }
          startItemListElt.onmouseenter = () => {
            if (!startMenuElt.classList.contains("active")) {
              // Allows to ignore when the start menu is still opening
              return;
            }
            list.classList.add("active");
          };
          list.onmouseleave = (e) => {
            if (!list.contains(e.relatedTarget)) {
              list.classList.remove("active");
            }
          };
          startItemListElt.onmouseleave = (e) => {
            if (!list.contains(e.relatedTarget)) {
              list.classList.remove("active");
            }
          };

          const listHeight = Math.min(
            baseYOffset + START_ITEM_HEIGHT * appObj.list.length,
            clientHeight,
          );
          if (SETTINGS.taskbarLocation.getValue() === "bottom") {
            const totalTop =
              (doesTaskbarInfluencesMaxHeight
                ? SETTINGS.taskbarSize.getValue()
                : 0) +
              (apps.length - 1 - currentIdx) * START_ITEM_HEIGHT +
              listHeight;
            if (clientHeight < totalTop) {
              listItemsWrapper.style.marginBottom =
                "-" + String(totalTop - clientHeight) + "px";
            }
          } else {
            const totalBottom =
              (doesTaskbarInfluencesMaxHeight
                ? SETTINGS.taskbarSize.getValue()
                : 0) +
              (apps.length - 1 - currentIdx) * START_ITEM_HEIGHT +
              listHeight;
            if (clientHeight < totalBottom) {
              listItemsWrapper.style.marginTop =
                "-" + String(totalBottom - clientHeight) + "px";
            }
          }
        } else {
          listItemsWrapper.style.width = "100%";
          list.classList.add("dependent");
          const backToMenuElt = document.createElement("div");
          backToMenuElt.className = "start-item start-item-back";
          backToMenuElt.tabIndex = "0";
          backToMenuElt.style.height = String(START_ITEM_HEIGHT) + "px";
          backToMenuElt.textContent = "Back to menu";
          listItemsWrapper.prepend(backToMenuElt);

          backToMenuElt.onclick = () => {
            startMenuItemsElt.style.display = "block";
            list.classList.remove("active");
          };

          startItemListElt.onclick = () => {
            startMenuItemsElt.style.display = "none";
            list.classList.add("active");
          };
        }
      }
    }
  }

  if (
    separatedSublists &&
    (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) +
      apps.length * START_ITEM_HEIGHT >
      clientHeight
  ) {
    return refreshStartMenu(startMenuElt, apps, openApp, {
      clientHeight,
      clientWidth,
      dependentSubLists: true,
    });
  }
  if (SETTINGS.taskbarLocation.getValue() === "top") {
    startMenuElt.appendChild(startMenuHeaderElt);
  }

  function constructAppItem(appObj) {
    const startItemElt = document.createElement("div");
    startItemElt.className = "start-item";
    startItemElt.tabIndex = "0";
    startItemElt.style.height = String(START_ITEM_HEIGHT) + "px";

    const startIconElt = document.createElement("div");
    startIconElt.className = "start-icon";
    startIconElt.textContent = appObj.icon;
    const startTitleElt = document.createElement("div");
    startTitleElt.className = "start-title";
    startTitleElt.textContent = appObj.title;

    startItemElt.appendChild(startIconElt);
    startItemElt.appendChild(startTitleElt);

    startItemElt.addEventListener("click", () => {
      closeStartMenu(startMenuElt);
      openApp(appObj.run, appObj.args);
    });
    startItemElt.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        closeStartMenu(startMenuElt);
        openApp(appObj.run, appObj.args);
      }
    });
    return startItemElt;
  }
}
