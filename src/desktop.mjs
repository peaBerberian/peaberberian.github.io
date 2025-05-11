// ROADMAP
// =======
//
// high priority:
//
// medium priority:
// - check why not resizing when mouse on the borders, seems CSS-related
// - when side-by-side window snapping we should be able to resize both at the same time
// - if click out of the screen / mouseleave do not deactivate window?
// - sometimes app has focus (e.g. "notes" can be written on), but not the window
//
// low priority:
// - disable text shadows on icons if opacity big enough?
// - text editor
// - minesweeper game
// - all images are their height and width defined to avoid repaint effects
// - windows moving when moving taskbar to top/bottom. Could be cool to stay in
//   place if possible
// - Wallpaper image from device
// - move around icon + select multiple icons?
// - If window with iframe not active, block pointer events so that it can be
//   activated by clicking on it? This would disable interaction if not active,
//   which is also weird.
// - detect iframe URL change? Do something about github?
// - left css to do in setting
// - Allow to auto-hide taskbar. Should be relatively simple.
// - The clock icon's emoji should reflect the current hour
// - get localStorage wallpaper before HTML body + external JS?
// - In relative window dimensions and positioning, once we go full height/width
//   due to a window resize, we lose the "wanted" percentage size and position
//   of that element
// - prevent a click on a button from allowing to move the window?

import AboutMe from "./apps/about-me.mjs";
import BifInspectorApp from "./apps/BifInspector.mjs";
import ClockApp from "./apps/Clock.mjs";
import EMESpy from "./apps/EMESpy.mjs";
import GifRenderer from "./apps/GifRenderer.mjs";
import Inception from "./apps/Inception.mjs";
import IsobmffInspector from "./apps/isobmff-inspector.mjs";
import Keyboard9App from "./apps/keyboard9.mjs";
import MSESpy from "./apps/MSESpy.mjs";
import PassGenDemoApp from "./apps/passgen.mjs";
import ReadmeApp from "./apps/README.mjs";
import RxPaired from "./apps/RxPaired.mjs";
import RxPlayer from "./apps/rx-player.mjs";
import StrHtml from "./apps/str-html.mjs";
import SystemSettingsApp from "./apps/special/settings/App.mjs";
import ThisWebsite from "./apps/ThisWebsite.mjs";
import WaspHls from "./apps/WaspHls.mjs";
import paintApp from "./apps/paint.mjs";
import TextEditorApp from "./apps/editor.mjs";
import generateDirectoryApp from "./apps/special/directory.mjs";
import PongApp from "./apps/Pong.mjs";

import AppIcons from "./components/AppIcons.mjs";
import StartMenu from "./components/StartMenu.mjs";
import Taskbar from "./components/Taskbar.mjs";
import WindowsManager from "./components/window/WindowsManager.mjs";

import { is12HourClockFormat } from "./utils.mjs";

/**
 * List of available applications, in the same order they appear as icons and
 * in the start menu (after categorizing them).
 */
const apps = [
  {
    id: "about",
    value: AboutMe(),
  },
  {
    id: "settings",
    value: SystemSettingsApp(),
  },
  {
    id: "this-website",
    value: ThisWebsite(),
  },
  {
    id: "paint",
    value: paintApp(),
    inStartList: "Desktop Apps",
  },
  {
    id: "editor",
    value: TextEditorApp(),
    inStartList: "Desktop Apps",
  },
  {
    id: "pong",
    value: PongApp(),
    inStartList: "Desktop Apps",
  },
  {
    id: "rx-player",
    value: RxPlayer(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "wasp-hls-demo",
    value: WaspHls(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "rx-paired",
    value: RxPaired(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "eme-spy",
    value: EMESpy(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "mse-spy",
    value: MSESpy(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "isobmff-inspector",
    value: IsobmffInspector(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "gif-renderer",
    value: GifRenderer(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "str-html",
    value: StrHtml(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "readme",
    value: ReadmeApp(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "keyboard9",
    value: Keyboard9App(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "passgen",
    value: PassGenDemoApp(),
    inStartList: "Misc",
  },
  {
    id: "bif-inspector",
    value: BifInspectorApp(),
    inStartList: "Other Projects",
    startMenuDir: "Other Projects",
  },
  {
    id: "clock",
    value: ClockApp(),
    inStartList: "Misc",
  },
  {
    id: "inception",
    value: Inception(),
    inStartList: "Misc",
  },
];

// Fragment is only used for in-app anchors for now.
// We can remove it when the desktop is restared to prevent weird behaviors
if (window.location.href.includes("#")) {
  window.location.replace("#");
}

document.addEventListener("DOMContentLoaded", function () {
  const desktopElt = document.getElementById("desktop");

  /** Clock shown as a taskbar "applet". */
  const clockElt = initializeClockElement();
  clockElt.onclick = function () {
    for (const app of apps) {
      if (app.id === "clock") {
        createApp(app, {
          activate: true,
          fullscreen: false,
          skipAnim: false,
          centered: true,
        });
        return;
      }
    }
  };

  const taskbarManager = new Taskbar({ applets: [clockElt] });
  const windowsManager = new WindowsManager(taskbarManager);

  const openAppFromIconOrStartMenu = (app) => {
    createApp(app, {
      activate: true,
      fullscreen: false,
      skipAnim: false,
      centered: false,
    });
  };
  desktopElt.appendChild(
    AppIcons(
      getDesktopIconsList(openAppFromIconOrStartMenu),
      openAppFromIconOrStartMenu,
    ),
  );
  StartMenu(apps, openAppFromIconOrStartMenu);

  // Open about page by default
  createApp(apps[0], {
    activate: true,
    fullscreen: false,
    skipAnim: true,
    centered: true,
  });

  return;

  /**
   * Launch the given application.
   * @param {Object} app - Object describing the application that you want to
   * launch.
   * @param {Object} options - Various options to configure how that new
   * application window will behave
   * @param {boolean} [options.fullscreen] - If set to `true`, the application
   * will be started full screen.
   * @param {boolean} [options.skipAnim] - If set to `true`, we will not show the
   * open animation for this new window.
   * @param {boolean} [options.centered] - If set to `true`, the application
   * window will be centered relative to the desktop in which it can be moved.
   * @param {boolean} [options.activate] - If set to `true`, the application
   * window will be directly activated.
   * @returns {Object|null} - Object representing the newly created window.
   * `null` if no window has been created.
   */
  function createApp(app, options) {
    const windowElt = windowsManager.openApp(app, options);
    if (windowElt !== null) {
      desktopElt.appendChild(windowElt);
    }
  }
});

/**
 * Create a simple infinitely self-updating clock whose goal is to be shown
 * inside the taskbar.
 * NOTE: The interval started for this clock is never stopped. Call this
 * function only one time.
 *
 * @returns {HTMLElement} - The clock element itself, showing the digital
 * local hour.
 */
function initializeClockElement() {
  const clockElt = document.createElement("div");
  clockElt.className = "clock";
  const use12HourClockFormat = is12HourClockFormat();
  updateClock(use12HourClockFormat, clockElt);
  setInterval(() => updateClock(use12HourClockFormat, clockElt), 2000);
  return clockElt;
  function updateClock(use12HourClock, clockElt) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let ampm;
    if (use12HourClock) {
      ampm = hours >= 12 ? " PM" : " AM";
    } else {
      ampm = "";
    }
    const formattedHours = use12HourClock ? hours % 12 || 12 : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    // NOTE: \u200B == Zero-width space. Allows line breaks if needed.
    clockElt.textContent = `${formattedHours}\u200B:\u200B${formattedMinutes}${ampm}`;
  }
}

function getDesktopIconsList(onOpen) {
  const appIcons = [];
  const appIconDirMap = new Map();
  for (const app of apps) {
    if (app.startMenuDir !== undefined) {
      let list = appIconDirMap.get(app.startMenuDir);
      if (list === undefined) {
        list = [];
        appIconDirMap.set(app.startMenuDir, list);
        appIcons.push(generateDirectoryApp(app.startMenuDir, list, onOpen));
      }
      list.push(app);
    } else {
      appIcons.push(app);
    }
  }

  return appIcons;
}
