import {
  START_ITEM_HEIGHT,
  START_MENU_OPEN_ANIM_TIMER,
  CLOSE_MENU_OPEN_ANIM_TIMER,
} from "../constants.mjs";
import { SETTINGS } from "../settings.mjs";

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
 * @param {Array.<StartMenuAppObject>} apps - List of applications for which you
 * want to generate an icon, in order from the first displayed to the last
 * displayed.
 * @param {Function} onOpen - Callback that will be called when/if an app is
 * launched through its start menu entry, with the corresponding application
 * path.
 * @param {AbortSignal} [abortSignal] - AbortSignal allowing to free
 * all resources taken by this component.
 */
export default function StartMenu(apps, openApp, abortSignal) {
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
  startButtonElt.addEventListener("click", onStartButtonClick);
  window.addEventListener("resize", scheduleRefresh);
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
      document.removeEventListener("click", onDocumentClick);
      startButtonElt.removeEventListener("click", onStartButtonClick);
      window.removeEventListener("resize", scheduleRefresh);
    });
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
  switch (SETTINGS.taskbarLocation.getValue()) {
    case "bottom":
      startMenuElt.style.animation =
        "closeStartAnim " +
        String(CLOSE_MENU_OPEN_ANIM_TIMER / 1000) +
        "s ease-out";
      break;
    default:
      startMenuElt.style.animation =
        "closeStartFromTopAnim " +
        String(CLOSE_MENU_OPEN_ANIM_TIMER / 1000) +
        "s ease-out";
      break;
  }
  startMenuElt.onanimationend = () => {
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
 * @param {boolean} params.disableLists - If `true`, "sub-lists" should be
 * disabled.
 */
function refreshStartMenu(
  startMenuElt,
  apps,
  openApp,
  { clientHeight, clientWidth, disableLists },
) {
  startMenuElt.innerHTML = "";

  const startMenuHeaderElt = document.createElement("div");
  startMenuHeaderElt.className = "start-header";
  startMenuHeaderElt.textContent = "Paul's Web Desktop";

  const startMenuItemsElt = document.createElement("div");
  startMenuItemsElt.className = "start-menu-items";

  // TODO: constants?
  const doLists =
    !disableLists &&
    SETTINGS.enableStartMenuSublists.getValue() &&
    clientWidth >= 10 + 250 + 200;
  if (doLists) {
    // TODO: still do for the y axis only, but I don't know how to do that
    // without breaking everything for now
    startMenuItemsElt.style.overflow = "";
  } else {
    startMenuItemsElt.style.overflow = "auto";
  }

  const doesTaskbarInfluencesMaxHeight = ["top", "bottom"].includes(
    SETTINGS.taskbarLocation.getValue(),
  );

  if (SETTINGS.taskbarLocation.getValue() === "top") {
    startMenuElt.appendChild(startMenuItemsElt);
    startMenuElt.appendChild(startMenuHeaderElt);
  } else {
    startMenuElt.appendChild(startMenuHeaderElt);
    startMenuElt.appendChild(startMenuItemsElt);
  }

  for (let currentIdx = 0; currentIdx < apps.length; currentIdx++) {
    const appObj = apps[currentIdx];
    if (appObj.type === "application") {
      startMenuItemsElt.appendChild(constructAppItem(appObj));
    } else if (appObj.type === "sublist") {
      if (!doLists) {
        for (const subAppObj of appObj.list) {
          startMenuItemsElt.appendChild(constructAppItem(subAppObj));
        }
      } else {
        const startItemElt = document.createElement("div");
        startItemElt.className = "start-item";
        startItemElt.style.height = String(START_ITEM_HEIGHT) + "px";

        // XXX TODO:
        // const currentList = listMap.get(appObj.name);
        // if (currentList) {
        //   currentList.height += START_ITEM_HEIGHT;
        //   currentList.height = Math.min(currentList.height, clientHeight);
        // }

        const startItemListElt = document.createElement("div");
        startItemListElt.className = "start-item start-item-list";
        startItemListElt.style.height = String(START_ITEM_HEIGHT) + "px";

        const listIconElt = document.createElement("div");
        listIconElt.className = "start-icon";
        listIconElt.textContent = "📂";

        const listTitleElt = document.createElement("div");
        listTitleElt.style.display = "flex";
        listTitleElt.style.alignItems = "center";
        listTitleElt.className = "start-title";
        listTitleElt.textContent = appObj.name;

        startItemListElt.appendChild(listIconElt);
        startItemListElt.appendChild(listTitleElt);
        startMenuItemsElt.appendChild(startItemListElt);

        const list = document.createElement("div");
        list.className = "s-list";

        let baseYOffset = 0;

        const listItemsWrapper = document.createElement("div");
        listItemsWrapper.className = "s-list-wrapper";
        listItemsWrapper.style.maxHeight =
          String(clientHeight - baseYOffset) + "px";

        list.appendChild(listItemsWrapper);
        startItemListElt.appendChild(list);

        for (const subAppObj of appObj.list) {
          listItemsWrapper.appendChild(constructAppItem(subAppObj));
        }
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
      }
    }
  }

  if (
    doLists &&
    (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) +
      apps.length * START_ITEM_HEIGHT >
      clientHeight
  ) {
    return refreshStartMenu(startMenuElt, apps, openApp, {
      clientHeight,
      clientWidth,
      disableLists: true,
    });
  }

  function constructAppItem(appObj) {
    const startItemElt = document.createElement("div");
    startItemElt.className = "start-item";
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
    return startItemElt;
  }
}
