/**
 * Version of this fake desktop application.
 * To update manually for now.
 */
export const __VERSION__ = "0.1.0";

/**
 * Minimum size in pixels that may be configured for the taskbar part of the
 * screen when it is on the top or bottom sides.
 */
export const TASKBAR_MIN_HORIZONTAL_SIZE = 25;
/**
 * Maximum size in pixels that may be configured for the taskbar part of the
 * screen when it is on the top or bottom sides.
 */
export const TASKBAR_MAX_HORIZONTAL_SIZE = 70;

/**
 * Minimum size in pixels that may be configured for the taskbar part of the
 * screen when it is on the top or bottom sides.
 */
export const TASKBAR_MIN_VERTICAL_SIZE = 60;
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

/** URL of the SVG for the "doc" link set on some applications */
export const docImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16" fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg"><path d="M5 0C3.34315 0 2 1.34315 2 3V13C2 14.6569 3.34315 16 5 16H14V14H4V12H14V0H5Z"/></svg>`;

/** URL of the SVG for the "demo" link set on some applications */
export const demoImgSvg = `<svg version="1.1" fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 512 512" xml:space="preserve"><g><path class="st0" d="M485.234,116.625H261.906l69.719-69.719c1.75-1.75,1.75-4.563,0-6.313l-17.422-17.438   c-1.734-1.75-4.563-1.75-6.297,0l-89.688,89.688l-89.656-89.688c-1.75-1.75-4.563-1.75-6.313,0l-17.438,17.438   c-1.75,1.75-1.75,4.563,0,6.313l69.75,69.719H26.766c-14.781,0-26.766,12-26.766,26.781v319.969   c0,14.781,11.984,26.781,26.766,26.781h458.469c14.781,0,26.766-12,26.766-26.781V143.406   C512,128.625,500.016,116.625,485.234,116.625z M383.594,421.188c0,8.531-6.906,15.438-15.422,15.438H66.844   c-8.531,0-15.438-6.906-15.438-15.438V191.875c0-8.531,6.906-15.438,15.438-15.438h301.328c8.516,0,15.422,6.906,15.422,15.438   V421.188z M473.188,333.813h-45.125v-45.125h45.125V333.813z M449.047,234.156c-13.906,0-25.172-11.281-25.172-25.188   s11.266-25.188,25.172-25.188s25.172,11.281,25.172,25.188S462.953,234.156,449.047,234.156z"/>
</g></svg>`;

/** URL used for the "repository" link set on some applications. */
export const codeImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16"  fill="var(--window-text-color)" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 1H1V15H15V1ZM6 5L7.41421 6.41421L5.82843 8L7.41421 9.58579L6 11L3 8L6 5ZM10 5L8.58579 6.41421L10.1716 8L8.58579 9.58579L10 11L13 8L10 5Z"/></svg>`;
