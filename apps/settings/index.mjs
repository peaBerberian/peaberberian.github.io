import createTaskbarSection from "./Taskbar.mjs";
import createWallpaperSection from "./Wallpaper.mjs";
import createSystemSection from "./System.mjs";
import createThemeSection from "./Theming.mjs";
import createWindowSection from "./Window.mjs";
import createApplicationsSection from "./Applications.mjs";
import createDesktopIconsSection from "./DesktopIcons.mjs";
import createStorageSection from "./Storage.mjs";
import strHtml from "./str-html.mjs";

/**
 * Generate content of the "System Settings" application.
 * @param {Array} env
 * @param {Object} dependencies
 * @param {Object} dependencies.settings
 * @param {Object} dependencies.filesystem
 * @param {Object} dependencies.appUtils
 * @param {AbortSignal} abortSignal
 * @returns {Object}
 */
export function create(_args, env, abortSignal) {
  const taskbarDimensions = {
    minHorizontalSize: env.CONSTANTS.TASKBAR_MIN_HORIZONTAL_SIZE,
    maxHorizontalSize: env.CONSTANTS.TASKBAR_MAX_HORIZONTAL_SIZE,
    minVerticalSize: env.CONSTANTS.TASKBAR_MIN_VERTICAL_SIZE,
    maxVerticalSize: env.CONSTANTS.TASKBAR_MAX_VERTICAL_SIZE,
  };
  for (const key of Object.keys(taskbarDimensions)) {
    if (taskbarDimensions[key] === undefined) {
      console.error(
        `Settings app: Impossible to get the taskbar's ${key}. ` +
          "The constant names might have been updated.",
      );
    }
  }

  const { settings } = env;
  const { constructSidebarElt } = env.appUtils;
  const sidebarItems = [
    { icon: "🖼️", text: "Wallpaper", section: "wallpaper", active: true },
    { icon: "🎨", text: "Theming", section: "theme", active: false },
    { icon: "🪟", text: "Window", section: "window", active: false },
    {
      icon: settings.startMenuPic.getValue(),
      text: "Taskbar",
      section: "taskbar",
      active: false,
    },
    {
      icon: "🧩",
      text: "Applications",
      section: "applications",
      active: false,
    },
    { icon: "🤹", text: "Desktop Icons", section: "icons", active: false },
    { icon: "💾", text: "Storage", section: "storage", active: false },
    { icon: "💻", text: "System", section: "system", active: false },
  ];
  updateSectionsIcons();

  /**
   * Inner AbortController, used to free resources when navigating to the
   * different sections.
   * @type {AbortController}
   */
  let childAbortController = new AbortController();
  abortSignal.addEventListener("abort", () => {
    childAbortController.abort();
  });

  const {
    container: containerElt,
    content: contentElt,
    sidebar: sidebarElt,
  } = constructAppWithSidebar(sidebarItems, onSidebarSelectionChange);
  contentElt.appendChild(createWallpaperSection(env, abortSignal));
  contentElt.scrollTo(0, 0);

  let lastSidebarElemnt = sidebarElt;
  settings.startMenuPic.onUpdate(
    () => {
      updateSectionsIcons();
      containerElt.removeChild(lastSidebarElemnt);
      lastSidebarElemnt = constructSidebarElt(
        sidebarItems,
        onSidebarSelectionChange,
      );
      containerElt.insertBefore(lastSidebarElemnt, contentElt);
    },
    {
      clearSignal: abortSignal,
    },
  );
  return {
    element: containerElt,
    onActivate() {
      contentElt.focus({ preventScroll: true });
    },
  };

  function onSidebarSelectionChange(sectionName) {
    childAbortController.abort();
    childAbortController = new AbortController();
    contentElt.innerHTML = "";
    for (const item of sidebarItems) {
      item.active = item.section === sectionName;
    }
    switch (sectionName) {
      case "wallpaper":
        contentElt.appendChild(
          createWallpaperSection(env, childAbortController.signal),
        );
        break;
      case "theme":
        contentElt.appendChild(
          createThemeSection(env, childAbortController.signal),
        );
        break;
      case "taskbar":
        contentElt.appendChild(
          createTaskbarSection(
            env,
            taskbarDimensions,
            childAbortController.signal,
          ),
        );
        break;
      case "system":
        contentElt.appendChild(
          createSystemSection(env, childAbortController.signal),
        );
        break;
      case "window":
        contentElt.appendChild(
          createWindowSection(env, childAbortController.signal),
        );
        break;
      case "applications":
        contentElt.appendChild(
          createApplicationsSection(env, childAbortController.signal),
        );
        break;
      case "icons":
        contentElt.appendChild(
          createDesktopIconsSection(env, childAbortController.signal),
        );
        break;
      case "storage":
        contentElt.appendChild(
          createStorageSection(env, childAbortController.signal),
        );
        break;
    }
    contentElt.scrollTo(0, 0);
    contentElt.focus({ preventScroll: true });
  }
  function updateSectionsIcons() {
    for (const item of sidebarItems) {
      if (item.section === "taskbar") {
        item.icon = settings.startMenuPic.getValue();
      }
    }
  }

  // TODO: This is a previous implementation of the utils
  // We could merge with the new one, but it misses automatic section updates
  /**
   * Construct the content part of an app with a sidebar corresponding to the
   * given `sections` object.
   *
   * @param {Array.<Object>} sections - Array of objects, each of which describes
   * a single sidebar section.
   * Each object have the following properties:
   * -  `section` (`string`): identifier for the section, that will be
   *    communicated through `onChangeSection`.
   * -  `active` (`boolean`): If `true`, this is the active section.
   * -  `icon` (`string|undefined`): Optional icon describing the section.
   * -  `text` (`string`): Title describing the section.
   * @returns {HTMLElement} - The application's content, with a sidebar.
   */
  function constructAppWithSidebar(sections, onChangeSection) {
    const container = strHtml`<div class="w-container" />`;
    const content = strHtml`<div class="w-content"></div>`;
    content.tabIndex = "0";
    const sidebar = constructSidebarElt(sections, (section) => {
      onChangeSection(section);
    });
    container.appendChild(sidebar);
    container.appendChild(content);
    return {
      container,
      sidebar,
      content,
    };
  }
}
