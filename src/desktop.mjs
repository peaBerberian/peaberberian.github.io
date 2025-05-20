// ROADMAP
// =======
//
// This is not really a roadmap, just writing stuff I see to not forget them.
//
// filesystem:
// - Finish file explorer
// - Open in text editor, image viewer, and sheets at least
// - should probably do a video player but that's supposed to be my expertise so
//   I'm afraid
// - When indexedDB is not available, fallback on in-memory
// - Proxy local storage in `/system/`?
// - watch API?
//
// high priority:
//
// medium priority:
// - desktop.config.json not serializable anymore :/
// - image viewer touch controls
// - Sometimes the focus in on a desktop icon, not on the app
// - start menu should always do some kind of sublist when sublists are enabled
// - copy svg in passgen is broken on multiple devices
// - If not clicking on start button or taskbar, the cursor is move when taskbar
//   is not locked
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
// - End accessibility stuff (complete tab navigation, label for all interactive
//   elements)
// - when side-by-side window snapping we should be able to resize both at the same time
// - z-index normalization could be less frequent, I don't know much if this has
//   an impact
// - Do "fake" app store to actually add external apps? (without it, though they
//   do not really take space, it still could clutter if enough interesting
//   i-frame-capable websites are found.)

import fs from "./filesystem/filesystem.mjs";
import DesktopAppIcons from "./components/DesktopAppIcons.mjs";
import StartMenu from "./components/StartMenu.mjs";
import Taskbar from "./components/Taskbar.mjs";
import AppsLauncher from "./app-launcher/AppsLauncher.mjs";
import initializeClockApplet from "./clock_applet.mjs";

async function start() {
  const desktopElt = document.getElementById("desktop");

  // Get list of apps from "filesystem" (they're actually all virtual paths for
  // now)
  const [desktopApps, startMenuApps] = await Promise.all([
    await fs.readFile("/system/desktop.config.json", "object"),
    await fs.readFile("/system/start_menu.config.json", "object"),
  ]);

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

  desktopElt.appendChild(DesktopAppIcons(desktopApps.list, openAppFromPath));
  StartMenu(startMenuApps.list, openAppFromPath);

  // Open default app or asked one
  let wantedApp;
  {
    const fragmentIndex = window.location.href.indexOf("#");
    if (fragmentIndex > 0) {
      wantedApp = window.location.href.substring(fragmentIndex + 1);
    }
  }
  if (!wantedApp) {
    appsLauncher.openApp("/apps/about.run", [], {
      skipAnim: true,
      centered: true,
    });
  } else {
    appsLauncher.openApp(`/apps/${wantedApp}.run`, [], {
      skipAnim: true,
      centered: true,
    });
  }

  function openAppFromPath(appPath, appArgs) {
    appsLauncher.openApp(appPath, appArgs ?? []);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  start().catch(() => {
    /* noop for now */
  });
});
