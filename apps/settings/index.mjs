import createTaskbarSection from "./Taskbar.mjs";
import createWallpaperSection from "./Wallpaper.mjs";
import createSystemSection from "./System.mjs";
import createThemeSection from "./Theming.mjs";
import createWindowSection from "./Window.mjs";
import createDesktopIconsSection from "./DesktopIcons.mjs";

const { constructSidebarElt, strHtml } = AppUtils;

/**
 * Generate content of the "System Settings" application.
 * @returns {Object}
 */
export function create(settings, abortSignal) {
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
    { icon: "🤹", text: "Desktop Icons", section: "icons", active: false },
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
  contentElt.appendChild(createWallpaperSection(settings, abortSignal));

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
  return { element: containerElt };

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
          createWallpaperSection(settings, childAbortController.signal),
        );
        break;
      case "theme":
        contentElt.appendChild(
          createThemeSection(settings, childAbortController.signal),
        );
        break;
      case "taskbar":
        contentElt.appendChild(
          createTaskbarSection(settings, childAbortController.signal),
        );
        break;
      case "system":
        contentElt.appendChild(
          createSystemSection(settings, childAbortController.signal),
        );
        break;
      case "window":
        contentElt.appendChild(
          createWindowSection(settings, childAbortController.signal),
        );
        break;
      case "icons":
        contentElt.appendChild(
          createDesktopIconsSection(settings, childAbortController.signal),
        );
        break;
    }
    contentElt.scrollTo(0, 0);
  }
  function updateSectionsIcons() {
    for (const item of sidebarItems) {
      if (item.section === "taskbar") {
        item.icon = settings.startMenuPic.getValue();
      }
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
  // const sidebarTitle = strHtml`<div class="sidebar-title">System Settings</div>`;
  const container = strHtml`<div class="w-container" />`;
  const content = strHtml`<div class="w-content"></div>`;
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
