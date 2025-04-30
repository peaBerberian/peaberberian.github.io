import {
  START_ITEM_HEIGHT,
  START_MENU_OPEN_ANIM_TIMER,
  CLOSE_MENU_OPEN_ANIM_TIMER,
} from "../constants.mjs";
import { SETTINGS } from "../settings.mjs";

/**
 * The current start menu state we're in:
 *   - `"closed"`: The start menu is closed.
 *   - `"opened"`: The start menu is opened.
 *   - `"opening"`: The start menu is opening.
 *   - `"closing"`: The start menu is closing.
 */
let currentStartState = "closed";
const startButtonElt = document.getElementById("start-button");
const startMenuElt = document.getElementById("start-menu");

/**
 * @param {Object} apps
 * @param {function} openApp
 * @param {AbortSignal} [abortSignal]
 * @returns {HTMLElement}
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
  startMenuElt.style.display = "block";
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
    if (startMenuElt.style.display === "block") {
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
 * @param {Array.<Object>} apps - Description of every applications that should
 * be inserted in the start menu.
 * @param {Function} openApp - Callback allowing to open an app on which the
 * user would have clicked through the start menu.
 * @param {Object} dimensions
 * @param {number} param3.clientHeight - Total available height in pixels.
 * @param {number} param3.clientWidth - Total available width in pixels.
 */
function refreshStartMenu(
  startMenuElt,
  apps,
  openApp,
  { clientHeight, clientWidth, disableLists },
) {
  startMenuElt.innerHTML = "";

  // TODO: constants?
  const doLists =
    !disableLists &&
    SETTINGS.enableStartMenuSublists.getValue() &&
    clientWidth >= 10 + 250 + 200;
  if (doLists) {
    // TODO: still do for the y axis only, but I don't know how to do that
    // without breaking everything for now
    startMenuElt.style.overflow = "";
  } else {
    startMenuElt.style.overflow = "auto";
  }

  let nbOfItems = 0;

  /**
   * Map each "list" created to an object with the following keys keys:
   *   - {HTMLElement} `element`: The `HTMLElement` where the list's item should
   *     be appended.
   *   - {number} `height`: The current height in pixels for this list
   *   	 (including that list's title element) if shown on screen.
   *   - {number} `itemIdx`: The "index" where the list is inserted
   *   	 top-to-bottom in the main start menu.
   */
  const listMap = new Map();

  for (const appObj of apps) {
    const startItemElt = document.createElement("div");
    startItemElt.className = "start-item";
    startItemElt.style.height = String(START_ITEM_HEIGHT) + "px";

    const startIconElt = document.createElement("div");
    startIconElt.className = "start-icon";
    startIconElt.textContent = appObj.value.icon;

    const startTitleElt = document.createElement("div");
    startTitleElt.className = "start-title";
    startTitleElt.textContent = appObj.value.title;

    startItemElt.appendChild(startIconElt);
    startItemElt.appendChild(startTitleElt);

    if (doLists && appObj.inStartList) {
      const currentList = listMap.get(appObj.inStartList);
      if (currentList) {
        currentList.element.appendChild(startItemElt);
        currentList.height += START_ITEM_HEIGHT;
        currentList.height = Math.min(currentList.height, clientHeight);
      } else {
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
        listTitleElt.textContent = appObj.inStartList;

        startItemListElt.appendChild(listIconElt);
        startItemListElt.appendChild(listTitleElt);
        startMenuElt.appendChild(startItemListElt);

        const list = document.createElement("div");
        list.className = "s-list";

        let baseYOffset = 0;

        const listItemsWrapper = document.createElement("div");
        listItemsWrapper.className = "s-list-wrapper";
        listItemsWrapper.appendChild(startItemElt);

        const listHeight = Math.min(
          baseYOffset + START_ITEM_HEIGHT,
          clientHeight,
        );
        listMap.set(appObj.inStartList, {
          element: listItemsWrapper,
          height: listHeight,
          itemIdx: nbOfItems,
        });
        listItemsWrapper.style.maxHeight =
          String(clientHeight - baseYOffset) + "px";

        list.appendChild(listItemsWrapper);
        startItemListElt.appendChild(list);

        nbOfItems++;
      }
    } else {
      startMenuElt.appendChild(startItemElt);
      nbOfItems++;
    }

    startItemElt.addEventListener("click", () => {
      closeStartMenu(startMenuElt);
      openApp(appObj);
    });
  }

  const doesTaskbarInfluencesMaxHeight = ["top", "bottom"].includes(
    SETTINGS.taskbarLocation.getValue(),
  );
  if (
    doLists &&
    (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) +
      nbOfItems * START_ITEM_HEIGHT >
      clientHeight
  ) {
    return refreshStartMenu(startMenuElt, apps, openApp, {
      clientHeight,
      clientWidth,
      disableLists: true,
    });
  }

  for (const { element, height, itemIdx } of listMap.values()) {
    if (SETTINGS.taskbarLocation.getValue() === "bottom") {
      const totalTop =
        (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) +
        (nbOfItems - 1 - itemIdx) * START_ITEM_HEIGHT +
        height;
      if (clientHeight < totalTop) {
        element.style.marginBottom =
          "-" + String(totalTop - clientHeight) + "px";
      }
    } else {
      const totalBottom =
        (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) +
        (nbOfItems - 1 - itemIdx) * START_ITEM_HEIGHT +
        height;
      if (clientHeight < totalBottom) {
        element.style.marginTop =
          "-" + String(totalBottom - clientHeight) + "px";
      }
    }
  }
}
