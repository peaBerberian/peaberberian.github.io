// ROADMAP
// =======
//
// This is not really a roadmap, just writing stuff I see to not forget them.
//
// high priority:
// - context menu in taskbar, taskbar items,  start menu, window header, and
//   explorer at least?
// - Storage settings
// - notes quick save could detect if file change since last save
//
// medium priority:
// - confirmation alert when closing window with unsaved file.
// - image viewer touch controls
// - Actually enforce permissions by adding iframe with sandbox="allow-scripts"
// - start menu should always do some kind of sublist when sublists are enabled
// - copy svg in passgen is broken on multiple devices
// - paint: resize do not re-activate quick save
// - drag and drop in explorer
//
// low priority:
// - filesystem: re-check that no error gives away the path
// - explorer: when going to parent directory, focus the previous one by default?
// - filesystem: Proxy local storage in `/system32/`?
// - filesystem: When indexedDB is not available, fallback on in-memory
// - double clicking while moving on the second click probably shouldn't put in
//   fullscreen? To check what others are doing (ironically enough, I don't even
//   use a floating WM day-to-day, forgot that stuff).
// - windows moving when moving taskbar to top/bottom. Could be cool to stay in
//   place if possible
// - disable text shadows on icons if opacity big enough?
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
// - End accessibility stuff (complete tab navigation, label for all interactive
//   elements)
// - when side-by-side window snapping we should be able to resize both at the same time
// - z-index normalization could be less frequent, I don't know much if this has
//   an impact
// - Do "fake" app store to actually add external apps? (without it, though they
//   do not really take space, it still could clutter if enough interesting
//   i-frame-capable websites are found.)
// - Remove app `id` inside the desktop and rely on `path` for `onlyOne`?
// - paint could change the file format

import fs from "./filesystem/filesystem.mjs";
import DesktopAppIcons from "./components/DesktopAppIcons.mjs";
import StartMenu from "./components/StartMenu.mjs";
import Taskbar from "./components/Taskbar.mjs";
import AppsLauncher from "./app-launcher/AppsLauncher.mjs";
import initializeClockApplet from "./clock_applet.mjs";
import { SETTINGS } from "./settings.mjs";
import { PROJECT_REPO } from "./constants.mjs";

/**
 * To bypass the initial app at start-up, this string can be set in the URL
 * fragment.
 *
 * It should not conflict with an actuall app's `id` (else, the only effect is
 * that it won't be loaded at start-up through that same fragment trick).
 */
const SPECIAL_NO_APP_STRING = "#";

console.log(
  "Welcome to my Web Desktop! This is an open-source project whose code can be found here:",
  PROJECT_REPO,
);

async function start() {
  const desktopElt = document.getElementById("desktop");

  // TODO: move to start menu
  const startMenuApps = await fs.readFile(
    "/system32/start_menu.config.json",
    "object",
  );

  /** Clock shown as a taskbar "applet". */
  const clockElt = initializeClockApplet();
  clockElt.onclick = function () {
    appsLauncher.openApp("/apps/clock.run", [], {
      centered: true,
    });
  };
  clockElt.tabIndex = "0";
  clockElt.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      clockElt.click();
    }
  };

  const taskbarManager = new Taskbar({ applets: [clockElt] });
  const appsLauncher = new AppsLauncher(desktopElt, taskbarManager);
  DesktopAppIcons(desktopElt, openPath);
  StartMenu(startMenuApps.list, openPath);

  // Open default app or asked one
  let wantedApp;
  {
    const fragmentIndex = window.location.href.indexOf("#");
    if (fragmentIndex > 0) {
      wantedApp = window.location.href.substring(fragmentIndex + 1);
    }
  }
  if (!wantedApp) {
    if (SETTINGS.aboutMeStart.getValue()) {
      appsLauncher.openApp("/apps/about.run", [], {
        skipAnim: true,
        centered: true,
      });
    }
  } else if (wantedApp !== SPECIAL_NO_APP_STRING) {
    appsLauncher.openApp(`/apps/${wantedApp}.run`, [], {
      skipAnim: true,
      centered: true,
    });
  }

  function openPath(appPath, appArgs) {
    if (appArgs && appArgs.length > 0) {
      appsLauncher.openApp(appPath, appArgs ?? []);
    } else {
      // If there's no argument, just use the more compatible open:
      // It also works for non-executables
      appsLauncher.open(appPath);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  start().catch(() => {
    /* noop for now */
  });
});
