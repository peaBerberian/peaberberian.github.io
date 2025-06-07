/**
 * settings.mjs
 * ============
 *
 * This file regroups global settings, most of whom may be updated through the
 * "Settings" app.
 *
 * They should then be relied on by the different components relying on the
 * different features.
 *
 * This concept makes heavy use of my homemade concept of "SharedReferences"
 * which are basically values which can be listened to for changes.
 */

import {
  APP_STYLE,
  IMAGE_ROOT_PATH,
  TASKBAR_MAX_HORIZONTAL_SIZE,
  TASKBAR_MAX_VERTICAL_SIZE,
  TASKBAR_MIN_HORIZONTAL_SIZE,
  TASKBAR_MIN_VERTICAL_SIZE,
} from "./constants.mjs";
import SharedReference from "./shared_reference.mjs";

// Values copied from CSS:
// TODO: read from CSS directly?

const DEFAULT_WALLPAPER =
  IMAGE_ROOT_PATH + "photo-1464822759023-fed622ff2c3b.jpg";
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_TASKBAR_OPACITY = 57;
const DEFAULT_ICON_IMAGE_OPACITY = 25;
const DEFAULT_ICON_HOVER_OPACITY = 25;
const DEFAULT_ICON_ACTIVE_OPACITY = 30;
const DEFAULT_TASK_BG_COLOR = "#1a2e4b";
const DEFAULT_TASK_TEXT_COLOR = "#ffffff";
const DEFAULT_TASK_HOVER_COLOR = "#2196f3";
const DEFAULT_TASK_ACTIVE_BG_COLOR = "#3498db";
const DEFAULT_TASK_INACTIVE_BG_COLOR = "#263b59";
const DEFAULT_START_MENU_TEXT = "#000000";
const DEFAULT_START_MENU_BG = "#f5f5f5";
const DEFAULT_START_MENU_ACTIVE_BG = "#e0e0e0";
const DEFAULT_START_ICON_BG = "#e0e0e0";
const DEFAULT_WINDOW_ACTIVE_HEADER = "#0F4774";
const DEFAULT_WINDOW_ACTIVE_HEADER_TEXT = "#FFFFFF";
const DEFAULT_WINDOW_INACTIVE_HEADER = "#737373";
const DEFAULT_WINDOW_INACTIVE_HEADER_TEXT = "#FFFFFF";
const DEFAULT_WINDOW_TEXT_COLOR = "#333333";
const DEFAULT_WINDOW_CONTENT_BG = "#FFFFFF";
const DEFAULT_WINDOW_LINE_COLOR = "#dddddd";
const DEFAULT_APP_PRIMARY_COLOR = "#3498db";
const DEFAULT_APP_PRIMARY_BG_COLOR = "#efefef";
const DEFAULT_WINDOW_SIDEBAR_BG = "#E0E0E0";
const DEFAULT_SIDEBAR_HOVER_BG = "#c8c8c8";
const DEFAULT_SIDEBAR_SELECTED_BG_COLOR = "#3498db";
const DEFAULT_SIDEBAR_SELECTED_TEXT_COLOR = "#ffffff";
const DEFAULT_ICON_ACTIVE_TEXT_COLOR = "#ffffff";
const DEFAULT_ICON_INACTIVE_TEXT_COLOR = "#ffffff";
const DEFAULT_ICON_BG_COLOR = "#ffffff";
const DEFAULT_ICON_HOVER_COLOR = "#ffffff";
const DEFAULT_ICON_ACTIVE_COLOR = "#ffffff";

const DEFAULT_WINDOW_BORDER_SIZE = 0;
const DEFAULT_SPACE_BETWEEN_TASKS = 5;
const DEFAULT_TASKBAR_SIZE = 35;
const DEFAULT_WINDOW_HEADER_HEIGHT = 35;
const DEFAULT_WINDOW_BUTTON_SIZE = 18;

/**
 * Link keys of the `APP_STYLE` object to the reference linked to it.
 * Constructed dynamically after this file evaluates.
 */
export const APP_STYLE_SETTINGS = {};

/**
 * Tuples of all references defined here, their default value
 * and the localStorage property where they are at.
 *
 * Used to be able to reset all the state to 0 when/if needed.
 */
const allRefsAndDefaults = [];

let taskbarSizeContext;

/**
 * Where the taskbar is relative to the page:
 * - `"top"`: on top of the page, `taskbarSize` is its height.
 * - `"bottom"`: on the bottom of the page, `taskbarSize` is its height.
 * - `"left"`: on the left of the page, `taskbarSize` is its width.
 * - `"right"`: on the right of the page, `taskbarSize` is its width.
 */
const taskbarLocation = createRefForState(
  null,
  "taskbar-location",
  "bottom",
  (val) => {
    requestAnimationFrame(() => {
      const sizeIsCurrentlyForHorizontal = ["top", "bottom"].includes(
        taskbarSizeContext,
      );
      const isCurrentlyHorizontal = ["top", "bottom"].includes(
        SETTINGS.taskbarLocation.getValue(),
      );

      if (sizeIsCurrentlyForHorizontal !== isCurrentlyHorizontal) {
        const currentTaskbarSize = SETTINGS.taskbarSize.getValue();
        let newSize;
        if (isCurrentlyHorizontal) {
          const percent =
            (currentTaskbarSize - TASKBAR_MIN_VERTICAL_SIZE) /
            (TASKBAR_MAX_VERTICAL_SIZE - TASKBAR_MIN_VERTICAL_SIZE);
          newSize =
            percent *
              (TASKBAR_MAX_HORIZONTAL_SIZE - TASKBAR_MIN_HORIZONTAL_SIZE) +
            TASKBAR_MIN_HORIZONTAL_SIZE;
        } else {
          const percent =
            (currentTaskbarSize - TASKBAR_MIN_HORIZONTAL_SIZE) /
            (TASKBAR_MAX_HORIZONTAL_SIZE - TASKBAR_MIN_HORIZONTAL_SIZE);
          newSize =
            percent * (TASKBAR_MAX_VERTICAL_SIZE - TASKBAR_MIN_VERTICAL_SIZE) +
            TASKBAR_MIN_VERTICAL_SIZE;
        }
        SETTINGS.taskbarSize.setValueIfChanged(Math.round(newSize));
      }

      switch (val) {
        case "top":
          document.body.classList.remove("left-taskbar");
          document.body.classList.remove("right-taskbar");
          document.body.classList.remove("bottom-taskbar");
          document.body.classList.add("top-taskbar");
          break;
        case "left":
          document.body.classList.add("left-taskbar");
          document.body.classList.remove("right-taskbar");
          document.body.classList.remove("bottom-taskbar");
          document.body.classList.remove("top-taskbar");
          break;
        case "right":
          document.body.classList.remove("left-taskbar");
          document.body.classList.add("right-taskbar");
          document.body.classList.remove("bottom-taskbar");
          document.body.classList.remove("top-taskbar");
          break;
        default:
          document.body.classList.remove("left-taskbar");
          document.body.classList.remove("right-taskbar");
          document.body.classList.add("bottom-taskbar");
          document.body.classList.remove("top-taskbar");
          break;
      }
    });
  },
);

/** Global settings defined for the application, changing many UI parameters. */
export const SETTINGS = {
  /** Display the "About me" App at start-up */
  aboutMeStart: createRefForState(null, "about-me-start", true),

  /** Persist any setting here in `localStorage` only if `true`. */
  persistSettings: createRefForState(null, null, true, (persistSettings) => {
    if (persistSettings) {
      setCurrentSettingsInStorage();
    } else {
      clearSettingsStorage();
    }
  }),

  /** If `false`, new entries cannot be added to the filesystem. */
  storeNewDataInIndexedDB: createRefForState(null, "store-new-data", true),

  /** If `true`, the IndexedDB filesystem will be checked at startup. */
  performFileSystemCheckAtStartup: createRefForState(
    null,
    "startup-fs-check",
    true,
  ),

  /** Update the base font size to the given size in px. */
  fontSize: createRefForState(
    "fontSize",
    "font-size",
    DEFAULT_FONT_SIZE,
    (size) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.fontSize.cssName,
          String(size) + "px",
        );
      });
    },
  ),

  /** The style the button on a header should have. */
  buttonStyle: createRefForState(null, "button-style", "Colorful", (style) => {
    for (const prevClass of document.body.classList) {
      if (prevClass.endsWith("-w-buttons")) {
        document.body.classList.remove(prevClass);
      }
    }
    if (style === "Sober") {
      document.body.classList.add("sober-w-buttons");
    } else {
      document.body.classList.add("color-w-buttons");
    }
  }),

  /** Whether buttons are at the left or right of headers. */
  buttonPosition: createRefForState(null, "button-position", "Right", (pos) => {
    for (const prevClass of document.body.classList) {
      if (prevClass.startsWith("w-btn-pos-")) {
        document.body.classList.remove(prevClass);
      }
    }
    if (pos === "Left") {
      document.body.classList.add("w-btn-pos-left");
    }
  }),

  /** Whether app titles are at the left, center or right of headers. */
  headerTitlePosition: createRefForState(
    null,
    "title-position",
    "Left",
    (pos) => {
      for (const prevClass of document.body.classList) {
        if (prevClass.startsWith("w-title-pos-")) {
          document.body.classList.remove(prevClass);
        }
      }
      if (pos === "Center") {
        document.body.classList.add("w-title-pos-center");
      } else if (pos === "Right") {
        document.body.classList.add("w-title-pos-right");
      }
    },
  ),

  /** If `true`, "snapping" a window to the top of the screen make if full-screen. */
  topWindowSnapping: createRefForState(null, "top-window-snapping", true),

  /** If `true`, "snapping" a window to a side of the screen make if half-full-screen. */
  sideWindowSnapping: createRefForState(null, "side-window-snapping", true),

  /** How to display "tools" in concerned applications. */
  toolbarFormat: createRefForState(null, "toolbar-format", "both", (format) => {
    if (format === "icon") {
      document.body.classList.add("no-tool-title");
    } else {
      document.body.classList.remove("no-tool-title");
    }
  }),

  /** How to display the "sidebar" in concerned applications. */
  sidebarFormat: createRefForState(null, "sidebar-format", "auto", (format) => {
    if (format === "top") {
      document.body.classList.add("w-sidebar-top");
    } else {
      document.body.classList.remove("w-sidebar-top");
    }
  }),

  showIframeBlockerHelp: createRefForState(
    null,
    "i-frame-blocker-msg",
    true,
    (displayHelp) => {
      if (displayHelp) {
        document.body.classList.remove("transparent-i-frame-top");
      } else {
        document.body.classList.add("transparent-i-frame-top");
      }
    },
  ),

  moveAroundIcons: createRefForState(null, "move-icons", true),

  dblClickHeaderFullScreen: createRefForState(
    null,
    "dbl-click-header-full-screen",
    true,
  ),

  /**
   * If `true`, launched applications listed in the taskbar have their icons and
   * title displayed.
   * If `false`, they have just their icon.
   */
  taskbarDisplayTitle: createRefForState(
    null,
    "taskbar-app-title",
    true,
    (val) => {
      const taskbarElt = document.getElementById("taskbar");
      if (val) {
        taskbarElt.classList.remove("no-title");
      } else {
        taskbarElt.classList.add("no-title");
      }
    },
  ),

  /**
   * If `true`, windows `left` and `top` position won't change on resize.
   * If `false`, they will be considered relative to the current page's
   * dimensions and as such update on resize.
   */
  absoluteWindowPositioning: createRefForState(
    null,
    "absolute-window-positioning",
    true,
  ),

  /**
   * If `true`, windows `height` and `width` won't change on resize.
   * If `false`, they will be considered relative to the current page's
   * dimensions and as such update on resize.
   */
  absoluteWindowSize: createRefForState(null, "absolute-window-size", true),

  /**
   * If `true`, windows can leave the viewport.
   * If `false`, they will always be contained in the viewport.
   */
  oobWindows: createRefForState(null, "oob-windows", true),

  /** If set to `true`, enable the "sub-list" concept in the start menu. */
  enableStartMenuSublists: createRefForState(null, "start-sub-lists", true),

  /** The character to show for the start menu. */
  startMenuPic: createRefForState(null, "start-menu-pic", "🚀", (pic) => {
    window.requestAnimationFrame(() => {
      document.getElementById("start-pic").textContent = pic;
    });
  }),

  /**
   * Define the desktop background.
   * Set as an object with two keys: `type` and `value`:
   * -  If `type` is set to `"image"`, then `value should be an URL to the image
   * -  If `type` is set to `"color"`, then `value should be an hex-encoded 24 bits color
   */
  desktopBackground: createRefForState(
    null,
    "desktop-bg",
    {
      // Can be "image" or "color"
      type: "image",
      // For now it is hardcoded, sadly, following a refacto.
      value: DEFAULT_WALLPAPER,
    },
    (bg) => {
      window.requestAnimationFrame(() => {
        if (bg.type === "image") {
          document.body.style.backgroundImage = `url(${encodeURI(bg.value)})`;
          document.body.style.backgroundSize = "cover";
        } else {
          document.body.style.backgroundImage = "";
          document.body.style.background = bg.value;
        }
      });
    },
  ),

  /** Defines the opacity of the taskbar, as a value from `0` to `1` */
  taskbarOpacity: createRefForState(
    null,
    "taskbar-opacity",
    DEFAULT_TASKBAR_OPACITY,
    (opacityPercent) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--taskbar-bg",
          SETTINGS.taskbarBgColor.getValue() + percentageToHex(opacityPercent),
        );
        // NOTE: should inactive app share the same bg opacity?
        document.documentElement.style.setProperty(
          "--taskbar-inactive-bg",
          SETTINGS.taskbarInactiveBgColor.getValue() +
            percentageToHex(opacityPercent),
        );
      });
    },
  ),

  taskbarActiveAppOpacity: createRefForState(
    null,
    "taskbar-active-opacity",
    DEFAULT_TASKBAR_OPACITY,
    (opacityPercent) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--taskbar-active-bg",
          SETTINGS.taskbarActiveBgColor.getValue() +
            percentageToHex(opacityPercent),
        );
      });
    },
  ),

  /** Defines the background-color of the taskbar, as an hex-encoded 24 bits color */
  taskbarBgColor: createRefForState(
    null,
    "taskbar-bg",
    DEFAULT_TASK_BG_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--taskbar-bg",
          color + percentageToHex(SETTINGS.taskbarOpacity.getValue()),
        );
      });
    },
  ),

  /** Defines the text color on the taskbar, as an hex-encoded 24 bits color */
  taskbarTextColor: createRefForState(
    null,
    "taskbar-text",
    DEFAULT_TASK_TEXT_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--taskbar-text", color);
      });
    },
  ),

  /**
   * Defines the background-color of the taskbar when hovering a task, as an
   * hex-encoded 24 bits color.
   */
  taskbarHoverColor: createRefForState(
    null,
    "taskbar-hover",
    DEFAULT_TASK_HOVER_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--taskbar-hover", color);
      });
    },
  ),

  /**
   * Defines the background-color of the taskbar for the active task, as an
   * hex-encoded 24 bits color.
   */
  taskbarActiveBgColor: createRefForState(
    null,
    "taskbar-active-bg",
    DEFAULT_TASK_ACTIVE_BG_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--taskbar-active-bg",
          color + percentageToHex(SETTINGS.taskbarActiveAppOpacity.getValue()),
        );
      });
    },
  ),

  /**
   * Defines the background-color of the taskbar for inactive tasks, as an
   * hex-encoded 24 bits color.
   */
  taskbarInactiveBgColor: createRefForState(
    null,
    "taskbar-inactive-bg",
    DEFAULT_TASK_INACTIVE_BG_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--taskbar-inactive-bg",
          color + percentageToHex(SETTINGS.taskbarOpacity.getValue()),
        );
      });
    },
  ),

  /**
   * Defines the background-color of an opened start menu, as an hex-encoded
   * 24 bits color.
   */
  startMenuBgColor: createRefForState(
    null,
    "start-menu-bg",
    DEFAULT_START_MENU_BG,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--start-menu-bg", color);
      });
    },
  ),

  /**
   * Defines the text color of an opened start menu, as an hex-encoded 24 bits
   * color.
   */
  startMenuTextColor: createRefForState(
    null,
    "start-menu-text",
    DEFAULT_START_MENU_TEXT,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--start-menu-text", color);
      });
    },
  ),

  /**
   * Defines the background-color in an opened start menu for an hovered
   * element, as an hex-encoded 24 bits color.
   */
  startMenuActiveBgColor: createRefForState(
    null,
    "start-menu-active-bg",
    DEFAULT_START_MENU_ACTIVE_BG,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--start-menu-active-bg",
          color,
        );
      });
    },
  ),

  /**
   * Defines the background-color behind icons in an opened start menu, as an
   * hex-encoded 24 bits color.
   */
  startMenuIconBgColor: createRefForState(
    null,
    "start-menu-icon-bg",
    DEFAULT_START_ICON_BG,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--start-icon-bg", color);
      });
    },
  ),

  allowManualTaskbarResize: createRefForState(
    null,
    "manual-taskbar-resize",
    true,
    (isEnabled) => {
      const taskbarElt = document.getElementById("taskbar");
      if (isEnabled) {
        taskbarElt.classList.add("resizable");
      } else {
        taskbarElt.classList.remove("resizable");
      }
    },
  ),

  allowManualTaskbarMove: createRefForState(null, "manual-taskbar-move", true),

  /** Space in-between tasks of the taskbar, in px. */
  taskbarTaskMargin: createRefForState(
    null,
    "taskbar-task-margin",
    DEFAULT_SPACE_BETWEEN_TASKS,
    (margin) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--taskbar-task-margin",
          String(margin) + "px",
        );
      });
    },
  ),

  /**
   * Where the taskbar is relative to the page:
   * - `"top"`: on top of the page, `taskbarSize` is its height.
   * - `"bottom"`: on the bottom of the page, `taskbarSize` is its height.
   * - `"left"`: on the left of the page, `taskbarSize` is its width.
   * - `"right"`: on the right of the page, `taskbarSize` is its width.
   */
  taskbarLocation,

  /** Size in pixels for the taskbar. */
  taskbarSize: createRefForState(
    null,
    "taskbar-size",
    DEFAULT_TASKBAR_SIZE,
    (height) => {
      taskbarSizeContext = taskbarLocation.getValue();
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--taskbar-size",
          String(height) + "px",
        );
      });
    },
  ),

  /** Height in pixel for a window's header element (containing text and buttons). */
  windowHeaderHeight: createRefForState(
    null,
    "window-header-height",
    DEFAULT_WINDOW_HEADER_HEIGHT,
    (height) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--window-header-height",
          String(height) + "px",
        );
      });
    },
  ),

  /** Height in pixel for a window header's buttons */
  windowButtonSize: createRefForState(
    null,
    "window-button-size",
    DEFAULT_WINDOW_BUTTON_SIZE,
    (height) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--window-button-size",
          String(height) + "px",
        );
      });
    },
  ),

  /**
   * Defines the background-color of a window's header when it corresponds to
   * the active window, as an hex-encoded 24 bits color.
   */
  windowActiveHeaderBgColor: createRefForState(
    "windowActiveHeader",
    "window-active-header-bg-color",
    DEFAULT_WINDOW_ACTIVE_HEADER,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.windowActiveHeader.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines the text color of a window's header when it corresponds to
   * the active window, as an hex-encoded 24 bits color.
   */
  windowActiveHeaderTextColor: createRefForState(
    "windowActiveHeaderText",
    "window-active-header-text-color",
    DEFAULT_WINDOW_ACTIVE_HEADER_TEXT,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.windowActiveHeaderText.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines the background-color of an inactive window's header, as an
   * hex-encoded 24 bits color.
   */
  windowInactiveHeaderBgColor: createRefForState(
    "windowInactiveHeader",
    "window-inactive-header-bg-color",
    DEFAULT_WINDOW_INACTIVE_HEADER,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.windowInactiveHeader.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines the text color of an inactive window's header, as an
   * hex-encoded 24 bits color.
   */
  windowIninactiveHeaderTextColor: createRefForState(
    "windowInactiveHeaderText",
    "window-inactive-header-text-color",
    DEFAULT_WINDOW_INACTIVE_HEADER_TEXT,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.windowInactiveHeaderText.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines the default text color inside windows, as an hex-encoded 24 bits
   * color.
   */
  windowTextColor: createRefForState(
    "textColor",
    "window-text-color",
    DEFAULT_WINDOW_TEXT_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.textColor.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines the default background color inside windows, as an hex-encoded 24
   * bits color.
   */
  windowContentBgColor: createRefForState(
    "bgColor",
    "window-content-bg-color",
    DEFAULT_WINDOW_CONTENT_BG,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.bgColor.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines a color used inside windows for very thin lines, such as below
   * the title or to the right of the sidebar, as an hex-encoded 24 bits
   * color.
   */
  windowLineColor: createRefForState(
    "lineColor",
    "window-line-color",
    DEFAULT_WINDOW_LINE_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.lineColor.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines a color used inside windows for elements we want to make evident,
   * as an hex-encoded 24-bits color.
   */
  appPrimaryColorBg: createRefForState(
    "primaryColor",
    "app-primary-color",
    DEFAULT_APP_PRIMARY_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.primaryColor.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Defines a color used inside windows for disabled elements and colors that
   * should be set as a background (e.g. in a button), as an hex-encoded 24 bits
   * color.
   * TODO: rename `disabledColor`?
   */
  appPrimaryBgColor: createRefForState(
    "disabledColor",
    "app-primary-bg",
    DEFAULT_APP_PRIMARY_BG_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.disabledColor.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Some windows contain a "sidebar", in which case this defines its background
   * color, as an hex-encoded 24 bits color.
   */
  windowSidebarBgColor: createRefForState(
    "barBg",
    "window-sidebar-bg-color",
    DEFAULT_WINDOW_SIDEBAR_BG,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.barBg.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Some windows contain a "sidebar", in which case this defines the background
   * color of hovered elements in it, as an hex-encoded 24 bits color.
   */
  windowSidebarHoverBgColor: createRefForState(
    "barHoverBg",
    "window-sidebar-hover-bg",
    DEFAULT_SIDEBAR_HOVER_BG,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.barHoverBg.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Some windows contain a "sidebar", in which case this defines the background
   * color of the currently-selected element, as an hex-encoded 24 bits color.
   */
  windowSidebarSelectedBgColor: createRefForState(
    "barSelectedBg",
    "window-sidebar-selected-bg-color",
    DEFAULT_SIDEBAR_SELECTED_BG_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.barSelectedBg.cssName,
          color,
        );
      });
    },
  ),

  /**
   * Some windows contain a "sidebar", in which case this defines the text color
   * inside it, as an hex-encoded 24 bits color.
   */
  windowSidebarSelectedTextColor: createRefForState(
    "barSelectedText",
    "window-sidebar-selected-text-color",
    DEFAULT_SIDEBAR_SELECTED_TEXT_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          APP_STYLE.barSelectedText.cssName,
          color,
        );
      });
    },
  ),

  /** Defines the height of borders around windows, in pixels. `0` to remove borders. */
  windowBorderSize: createRefForState(
    null,
    "window-border-size",
    DEFAULT_WINDOW_BORDER_SIZE,
    (size) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--window-border-size",
          String(size) + "px",
        );
      });
    },
  ),

  /**
   * Defines the opacity of the background of hovered icons, as a value from `0`
   * to `1`.
   */
  iconHoverOpacity: createRefForState(
    null,
    "icon-hover-opacity",
    DEFAULT_ICON_HOVER_OPACITY,
    (opacityPercent) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--icon-hover",
          SETTINGS.iconHoverBgColor.getValue() +
            percentageToHex(opacityPercent),
        );
      });
    },
  ),

  /**
   * Defines the opacity of the image background behind images, as a value
   * from `0` to `1`.
   */
  iconImageBgOpacity: createRefForState(
    null,
    "icon-image-bg-opacity",
    DEFAULT_ICON_IMAGE_OPACITY,
    (opacityPercent) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--icon-bg",
          SETTINGS.iconImageBgColor.getValue() +
            percentageToHex(opacityPercent),
        );
      });
    },
  ),

  /** Defines the opacity of selected icons, as a value from `0` to `1` */
  iconActiveOpacity: createRefForState(
    null,
    "icon-active-opacity",
    DEFAULT_ICON_ACTIVE_OPACITY,
    (opacityPercent) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--icon-active-bg",
          SETTINGS.iconActiveBgColor.getValue() +
            percentageToHex(opacityPercent),
        );
      });
    },
  ),

  /** Defines the text color for the selected icon, as an hex-encoded 24 bits color */
  iconActiveTextColor: createRefForState(
    null,
    "icon-active-text",
    DEFAULT_ICON_ACTIVE_TEXT_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--icon-active-text", color);
      });
    },
  ),

  /**
   * Defines the text color for the non-selected icons, as an hex-encoded 24
   * bits color.
   */
  iconInactiveTextColor: createRefForState(
    null,
    "icon-text",
    DEFAULT_ICON_INACTIVE_TEXT_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--icon-inactive-text",
          color,
        );
      });
    },
  ),

  /**
   * Defines the background-color for the selected icon, as an hex-encoded 24
   * bits color.
   */
  iconActiveBgColor: createRefForState(
    null,
    "icon-active-bg",
    DEFAULT_ICON_ACTIVE_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--icon-active-bg",
          color + percentageToHex(SETTINGS.iconActiveOpacity.getValue()),
        );
      });
    },
  ),

  /**
   * Defines the background-color for non-selected icons, as an hex-encoded 24
   * bits color.
   */
  iconImageBgColor: createRefForState(
    null,
    "icon-image-bg",
    DEFAULT_ICON_BG_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--icon-bg",
          color + percentageToHex(SETTINGS.iconImageBgOpacity.getValue()),
        );
      });
    },
  ),

  /**
   * Defines the background-color for hovered icons, as an hex-encoded 24
   * bits color.
   */
  iconHoverBgColor: createRefForState(
    null,
    "icon-hover-bg",
    DEFAULT_ICON_HOVER_COLOR,
    (color) => {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--icon-hover",
          color + percentageToHex(SETTINGS.iconHoverOpacity.getValue()),
        );
      });
    },
  ),
};

// function hexToPercentage(hex) {
//   const decimalValue = parseInt(hex, 16);
//   return Math.min(Math.round((decimalValue / 255) * 100), 100);
// }

/**
 * Translate a percentage value from `0` to `100` to the corresponding hex
 * value from `00` to `FF`.
 *
 * Might be used to include opacity in rgba hex values.
 *
 * @param {number} percent
 * @returns {string}
 */
function percentageToHex(percent) {
  const decimalValue = Math.round((percent / 100) * 255);
  const hex = decimalValue.toString(16).padStart(2, "0");

  return hex;
}

/**
 * Create a `SharedReference` object for some given state, that will be stored
 * in local storage and retrieved on page re-launch.
 * @param {string|null} appName
 * @param {string|null} localStorageName - The name of the state to put in
 * local-storage.
 * Has to be forward-compatible (keep its name between versions), so a
 * forward-thinking name should be chosen.
 *
 * If `null`, the setting is not stored in localStorage.
 * @param {*} defaultVal - Initial value for that state if none is stored yet.
 * @param {Function} onUpdate - Function to call when that value is updated.
 */
function createRefForState(appName, localStorageName, defaultVal, onUpdate) {
  let initialValue;
  if (localStorageName === null) {
    initialValue = defaultVal;
  } else {
    try {
      const storedValue = localStorage.getItem(localStorageName);
      if (storedValue) {
        initialValue = JSON.parse(storedValue);
      }
    } catch (_) {}
    if (initialValue === undefined) {
      initialValue = defaultVal;
    }
  }
  const ref = new SharedReference(initialValue);
  if (appName !== null) {
    if (!APP_STYLE[appName]) {
      console.error("Wrong settings creation: unknown `appName`", appName);
    } else {
      APP_STYLE_SETTINGS[appName] = ref;
    }
  }
  ref.onUpdate(
    (bg) => {
      try {
        if (onUpdate) {
          onUpdate(bg);
        }
        if (localStorageName !== null) {
          localStorage.setItem(localStorageName, JSON.stringify(bg));
        }
      } catch (_) {}
    },
    { emitCurrentValue: false },
  );
  if (onUpdate) {
    onUpdate(initialValue);
  }
  allRefsAndDefaults.push([ref, defaultVal, localStorageName]);
  return ref;
}

/**
 * Reset all "references" created through `createRefForState` to their initial
 * value, and remove all data from local storage.
 */
export function resetStateToDefault() {
  window.requestAnimationFrame(() => {
    allRefsAndDefaults.forEach(([ref, deflt]) => {
      ref.setValueIfChanged(deflt);
    });
    localStorage.clear();
  });
}

export function setCurrentSettingsInStorage() {
  allRefsAndDefaults.forEach(([ref, deflt, localStorageName]) => {
    try {
      if (!localStorageName) {
        return;
      }
      const currentVal = ref.getValue();
      const baseItem = localStorage.getItem(localStorageName);
      if (baseItem === null) {
        if (currentVal !== deflt) {
          localStorage.setItem(localStorageName, JSON.stringify(currentVal));
        }
      } else if (JSON.parse(baseItem) !== currentVal) {
        localStorage.setItem(localStorageName, JSON.stringify(currentVal));
      }
    } catch (_) {}
  });
}

export function clearSettingsStorage() {
  localStorage.clear();
}

SETTINGS.resetStateToDefault = resetStateToDefault;
