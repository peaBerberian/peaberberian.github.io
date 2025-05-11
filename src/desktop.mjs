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
// - Exception for app group where the icon / title is pre-filled?
// - when side-by-side window snapping we should be able to resize both at the same time
// - start menu should always do some kind of sublist when sublists are enabled
// - copy svg in passgen is broken on multiple devices
// - Sidebar should be able to break a word in worst cases I think.
// - What do if App creation errors or rejects?
// - PONG not focused move or not?
// - clock not centered on taskbar?
// - applications defaultHeight and defaultWidth exclude window decorations
// - some accessibility I guess
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
// - icon lose focus onmousedown, not onclick

import fs from "./filesystem.mjs";
import DesktopAppIcons from "./components/DesktopAppIcons.mjs";
import StartMenu from "./components/StartMenu.mjs";
import Taskbar from "./components/Taskbar.mjs";
import AppsLauncher from "./AppsLauncher.mjs";
import initializeClockApplet from "./clock_applet.mjs";

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

  /** Clock shown as a taskbar "applet". */
  const clockElt = initializeClockApplet();
  clockElt.onclick = function () {
    appsLauncher.openApp("/apps/clock.run", [], {
      centered: true,
    });
    return;
  };

  const taskbarManager = new Taskbar({ applets: [clockElt] });
  const appsLauncher = new AppsLauncher(desktopElt, taskbarManager);

  desktopElt.appendChild(DesktopAppIcons(desktopApps.list, openAppFromPath));
  StartMenu(startMenuApps.list, openAppFromPath);

  // Open about me default app
  appsLauncher.openApp("/apps/about.run", [], {
    skipAnim: true,
    centered: true,
  });
  console.timeEnd("START");

  function openAppFromPath(appPath, appArgs) {
    appsLauncher.openApp(appPath, appArgs ?? []);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  start().catch(() => {
    /* noop for now */
  });
});
