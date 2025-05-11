// ROADMAP
// =======
//
// filesystem:
// - Finish file explorer
// - Open in text editor, image viewer, and sheets at least
// - should probably do a video player but that's supposed to be my expertise so
//   I'm afraid
// - When indexedDB is not available, fallback on in-memory
// - Proxy local storage in `/system/`?
// - watch API?
// - Proxy most constants in `/system/`?
//
// high priority:
//
// medium priority:
// - when side-by-side window snapping we should be able to resize both at the same time
// - start menu should always do some kind of sublist when sublists are enabled
// - copy svg in passgen is broken on multiple devices
// - Sidebar should be able to break a word in worst cases I think.
//
// low priority:
// - windows moving when moving taskbar to top/bottom. Could be cool to stay in
//   place if possible
// - disable text shadows on icons if opacity big enough?
// - move around icons?
// - detect iframe URL change? Do something about github?
// - Allow to auto-hide taskbar. Should be relatively simple.
// - The clock icon's emoji reflect the current hour?
// - get localStorage wallpaper before HTML body + external JS?
// - Wallpaper: loading image from device
// - In relative window dimensions and positioning, once we go full height/width
//   due to a browser window resize, we lose the "wanted" percentage size and
//   position of that element
// - all images are their height and width defined to avoid repaint effects
// - taskbar hover opacity different?
// - Safari has this weird almost-double scroll sometimes. Though only sometimes
//   and when it shows it disappears forever after like 2 seconds.
// - block-iframe too much used sometimes?
// - Allow to disable the i-frame warning in settings?
// - z-index normalization could be less frequent, I don't know much if this has
//   an impact

import fs from "./filesystem.mjs";
import generateAppGroupApp from "./app_group.mjs";
import { is12HourClockFormat } from "./utils.mjs";
import AppIcons from "./components/AppIcons.mjs";
import StartMenu from "./components/StartMenu.mjs";
import Taskbar from "./components/Taskbar.mjs";
import WindowsManager from "./components/window/WindowsManager.mjs";

// Fragment is only used for in-app anchors for now.
// We can remove it when the desktop is restared to prevent weird behaviors
if (window.location.href.includes("#")) {
  window.location.replace("#");
}

async function start() {
  console.time("START");
  const desktopElt = document.getElementById("desktop");

  // Get list of apps from "filesystem" (they're actually all virtual paths for
  // now)
  const [desktopApps, startMenuApps] = await Promise.all([
    await fs.readFile("/system/desktop.config.json", "object"),
    await fs.readFile("/system/start_menu.config.json", "object"),
  ]);

  const appGroups = new Map();

  /** Clock shown as a taskbar "applet". */
  const clockElt = initializeClockElement();
  clockElt.onclick = function () {
    createApp("/apps/clock.run", [], {
      activate: true,
      fullscreen: false,
      skipAnim: false,
      centered: true,
    });
    return;
  };

  const taskbarManager = new Taskbar({ applets: [clockElt] });
  const windowsManager = new WindowsManager(taskbarManager);

  const openAppFromPath = (appPath, appArgs) => {
    createApp(appPath, appArgs ?? [], {
      activate: true,
      fullscreen: false,
      skipAnim: false,
      centered: false,
    });
  };
  desktopElt.appendChild(
    AppIcons(
      getDesktopIconsList(desktopApps.list, openAppFromPath),
      openAppFromPath,
    ),
  );
  StartMenu(startMenuApps.list, openAppFromPath);

  // Open about me default app
  createApp("/apps/about.run", [], {
    activate: true,
    fullscreen: false,
    skipAnim: true,
    centered: true,
  });

  console.timeEnd("START");
  return;

  /**
   * Launch the given application.
   * @param {string} appPath - FileSystem path to the application to run.
   * @param {Array} appArgs - The application's arguments.
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
  async function createApp(appPath, appArgs, options) {
    const inAppGroup = appGroups.get(appPath);
    const appObj = inAppGroup ?? (await fs.readFile(appPath, "object"));
    const windowElt = windowsManager.openApp(appObj, appArgs, options);
    if (windowElt !== null) {
      desktopElt.appendChild(windowElt);
    }
  }
  function getDesktopIconsList(apps, onOpen) {
    const appIcons = [];
    const appIconDirMap = new Map();
    for (const app of apps) {
      if (app.desktopDir !== undefined) {
        let list = appIconDirMap.get(app.desktopDir);
        if (list === undefined) {
          list = [];
          // TODO: that's kind of ugly, it's kind of a relic of an older archi
          // I should find a better solution in the future: random generic app
          // that takes the applications in arguments?
          const fakeGroupApp = generateAppGroupApp(
            app.desktopDir,
            list,
            onOpen,
          );
          const fakePath = "/desktop-fake-app/" + fakeGroupApp.id;
          appIconDirMap.set(app.desktopDir, list);
          appGroups.set(fakePath, fakeGroupApp);
          appIcons.push({
            run: fakePath,
            title: fakeGroupApp.title,
            icon: fakeGroupApp.icon,
          });
        }
        list.push(app);
      } else {
        appIcons.push(app);
      }
    }

    return appIcons;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  start().catch(() => {
    /* noop for now */
  });
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
