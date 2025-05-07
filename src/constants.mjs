/**
 * Version of this fake desktop application.
 * To update manually for now.
 */
export const __VERSION__ = "0.1.0";

/**
 * Minimum size in pixels that may be configured for the taskbar part of the
 * screen when it is on the top or bottom sides.
 */
export const TASKBAR_MIN_HORIZONTAL_SIZE = 20;
/**
 * Maximum size in pixels that may be configured for the taskbar part of the
 * screen when it is on the top or bottom sides.
 */
export const TASKBAR_MAX_HORIZONTAL_SIZE = 70;

/**
 * Minimum size in pixels that may be configured for the taskbar part of the
 * screen when it is on the top or bottom sides.
 */
export const TASKBAR_MIN_VERTICAL_SIZE = 50;
/**
 * Maximum size in pixels that may be configured for the taskbar part of the
 * screen when it is on the top or bottom sides.
 */
export const TASKBAR_MAX_VERTICAL_SIZE = 150;

/** Minimum width in pixels that the window of an application can have. */
export const WINDOW_MIN_WIDTH = 230;
/** Minimum height in pixels that the window of an application can have. */
export const WINDOW_MIN_HEIGHT = 230;
/**
 * Default height a window should have if nothing is indicated by the app,
 * in pixels.
 */
export const DEFAULT_WINDOW_HEIGHT = 500;
/**
 * Default width a window should have if nothing is indicated by the app,
 * in pixels.
 */
export const DEFAULT_WINDOW_WIDTH = 700;

/**
 * `z-index` value for the window that will be the most behind. Further windows
 * will increment that value.
 */
export const BASE_WINDOW_Z_INDEX = 99;

/** Height each item of the start menu should have, in pixels. */
export const START_ITEM_HEIGHT = 50;

export const ICON_WIDTH_BASE = 90;
export const ICON_HEIGHT_BASE = 65;
export const ICON_Y_BASE = 10;
export const ICON_Y_OFFSET_FROM_HEIGHT = 3;
export const ICON_MARGIN = 3;
export const ICON_X_BASE = 10;
export const ICON_X_OFFSET_FROM_WIDTH = 10;

// Animations

/** Time of the animation to exit a fullscreen mode on a window, in milliseconds. */
export const EXIT_FULLSCREEN_ANIM_TIMER = 150;
/** Time of the animation to open a new application, in milliseconds. */
export const OPEN_APP_ANIM_TIMER = 150;
/** Time of the animation to close an application, in milliseconds. */
export const CLOSE_APP_ANIM_TIMER = 150;
/** Time of the animation to minimize an application, in milliseconds. */
export const MINIMIZE_APP_ANIM_TIMER = 200;
/** Time of the animation to de-minimize a minimized application, in milliseconds. */
export const DEMINIMIZE_APP_ANIM_TIMER = 200;
/** Time of the animation to open the start menu, in milliseconds. */
export const START_MENU_OPEN_ANIM_TIMER = 150;
/** Time of the animation to close the start menu, in milliseconds. */
export const CLOSE_MENU_OPEN_ANIM_TIMER = 300;

/**
 * When windows out-of-bounds are authorized, we don't want to go **TOO**
 * out-of-bounds because the user won't be able to access the title bar
 * anymore, which allows to move the window.
 * So this is a security in pixels for the left, bottom and right out-of-bounds
 * (top is different because the title bar is on the top).
 */
export const WINDOW_OOB_SECURITY_PIX = 60;

/** Path to reach the images stored locally, relative to the main HTML page. */
export const IMAGE_ROOT_PATH = "./assets/img/";

/**
 * Wallpapers provided by default in settings.
 *
 * The first value has the special status of being the default wallpaper.
 */
export const WALLPAPERS = [
  // From Kalen Emsley (@kalenemsley from unsplash)
  IMAGE_ROOT_PATH + "photo-1464822759023-fed622ff2c3b.jpg",

  // Jack B (@nervum on unsplash)
  IMAGE_ROOT_PATH + "beach1.avif",

  // Irina Iriser (@iriser on unsplash)
  IMAGE_ROOT_PATH + "forest1.avif",

  // Lucas Dalamarta (@lucasdalamartaphoto on unsplash)
  IMAGE_ROOT_PATH + "some_ducks.avif",

  // Tim Schmidbauer (@timschmidbauer on unsplash)
  IMAGE_ROOT_PATH + "photo-1745761412274-5303bc3f2e45.jpg",

  // Ashim D’Silva (@randomlies on unsplash)
  IMAGE_ROOT_PATH + "photo-1479030160180-b1860951d696.jpg",

  // Benjamin Voros (@vorosbenisop on unsplash)
  IMAGE_ROOT_PATH + "dark_mountain.avif",
];

/** URL of the SVG for the "doc" link we set on some applications */
export const docImgUrl = URL.createObjectURL(
  new Blob(
    [
      `<svg width="24px" stroke-width="1.5" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M4 19V5C4 3.89543 4.89543 3 6 3H19.4C19.7314 3 20 3.26863 20 3.6V16.7143" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path><path d="M6 17L20 17" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path><path d="M6 21L20 21" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path><path d="M6 21C4.89543 21 4 20.1046 4 19C4 17.8954 4.89543 17 6 17" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 7L15 7" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path></svg>`,
    ],
    { type: "image/svg+xml" },
  ),
);

/** URL of the SVG for the "demo" link we set on some applications */
export const demoImgUrl = URL.createObjectURL(
  new Blob(
    [
      `<svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M7 21L17 21" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 16.4V3.6C2 3.26863 2.26863 3 2.6 3H21.4C21.7314 3 22 3.26863 22 3.6V16.4C22 16.7314 21.7314 17 21.4 17H2.6C2.26863 17 2 16.7314 2 16.4Z" stroke="#000000" stroke-width="1.5"></path></svg>`,
    ],
    { type: "image/svg+xml" },
  ),
);
