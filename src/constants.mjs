/**
 * Version of this fake desktop application.
 * To update manually for now.
 */
export const __VERSION__ = "0.1.0";

/** URL where the current code repository can be seen. */
export const PROJECT_REPO =
  "https://github.com/peaBerberian/peaberberian.github.io";

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

/** SVG for the "doc" link set on some applications */
export const docImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 0C3.34315 0 2 1.34315 2 3V13C2 14.6569 3.34315 16 5 16H14V14H4V12H14V0H5Z"/></svg>`;

/** SVG for the "demo" link set on some applications */
export const demoImgSvg = `<svg version="1.1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 512 512" xml:space="preserve"><g><path class="st0" d="M485.234,116.625H261.906l69.719-69.719c1.75-1.75,1.75-4.563,0-6.313l-17.422-17.438   c-1.734-1.75-4.563-1.75-6.297,0l-89.688,89.688l-89.656-89.688c-1.75-1.75-4.563-1.75-6.313,0l-17.438,17.438   c-1.75,1.75-1.75,4.563,0,6.313l69.75,69.719H26.766c-14.781,0-26.766,12-26.766,26.781v319.969   c0,14.781,11.984,26.781,26.766,26.781h458.469c14.781,0,26.766-12,26.766-26.781V143.406   C512,128.625,500.016,116.625,485.234,116.625z M383.594,421.188c0,8.531-6.906,15.438-15.422,15.438H66.844   c-8.531,0-15.438-6.906-15.438-15.438V191.875c0-8.531,6.906-15.438,15.438-15.438h301.328c8.516,0,15.422,6.906,15.422,15.438   V421.188z M473.188,333.813h-45.125v-45.125h45.125V333.813z M449.047,234.156c-13.906,0-25.172-11.281-25.172-25.188   s11.266-25.188,25.172-25.188s25.172,11.281,25.172,25.188S462.953,234.156,449.047,234.156z"/>
</g></svg>`;

/** SVG for the "repository" link set on some applications. */
export const codeImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16"  fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 1H1V15H15V1ZM6 5L7.41421 6.41421L5.82843 8L7.41421 9.58579L6 11L3 8L6 5ZM10 5L8.58579 6.41421L10.1716 8L8.58579 9.58579L10 11L13 8L10 5Z"/></svg>`;

export const resetSvg = `<svg width="800px" height="800px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 1 1 0 2.5 2.5)"><path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"/><circle cx="8" cy="8" fill="currentColor" r="2"/><path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"/></g></svg>`;

export const clearSvg = `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-179.000000, -360.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z"></path></g></g></g></svg>`;

export const settingsSvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 5.28988H13C13 5.7323 13.2907 6.12213 13.7148 6.24833L14 5.28988ZM15.3302 5.84137L14.8538 6.72058C15.2429 6.93144 15.7243 6.86143 16.0373 6.54847L15.3302 5.84137ZM16.2426 4.92891L15.5355 4.2218V4.2218L16.2426 4.92891ZM17.6569 4.92891L16.9498 5.63601L16.9498 5.63602L17.6569 4.92891ZM19.0711 6.34312L19.7782 5.63602V5.63602L19.0711 6.34312ZM19.0711 7.75734L18.364 7.05023L19.0711 7.75734ZM18.1586 8.66978L17.4515 7.96268C17.1386 8.27563 17.0686 8.75709 17.2794 9.14621L18.1586 8.66978ZM18.7101 10L17.7517 10.2853C17.8779 10.7093 18.2677 11 18.7101 11V10ZM18.7101 14V13C18.2677 13 17.8779 13.2907 17.7517 13.7148L18.7101 14ZM18.1586 15.3302L17.2794 14.8538C17.0686 15.2429 17.1386 15.7244 17.4515 16.0373L18.1586 15.3302ZM19.0711 16.2427L19.7782 15.5356V15.5356L19.0711 16.2427ZM19.0711 17.6569L18.364 16.9498L18.364 16.9498L19.0711 17.6569ZM17.6569 19.0711L18.364 19.7782V19.7782L17.6569 19.0711ZM15.3302 18.1586L16.0373 17.4515C15.7243 17.1386 15.2429 17.0686 14.8538 17.2794L15.3302 18.1586ZM14 18.7101L13.7148 17.7517C13.2907 17.8779 13 18.2677 13 18.7101H14ZM10 18.7101H11C11 18.2677 10.7093 17.8779 10.2853 17.7517L10 18.7101ZM8.6698 18.1586L9.14623 17.2794C8.7571 17.0685 8.27565 17.1385 7.96269 17.4515L8.6698 18.1586ZM7.75736 19.071L7.05026 18.3639L7.05026 18.3639L7.75736 19.071ZM6.34315 19.071L5.63604 19.7782H5.63604L6.34315 19.071ZM4.92894 17.6568L4.22183 18.3639H4.22183L4.92894 17.6568ZM4.92894 16.2426L4.22183 15.5355H4.22183L4.92894 16.2426ZM5.84138 15.3302L6.54849 16.0373C6.86144 15.7243 6.93146 15.2429 6.7206 14.8537L5.84138 15.3302ZM5.28989 14L6.24835 13.7147C6.12215 13.2907 5.73231 13 5.28989 13V14ZM5.28989 10V11C5.73231 11 6.12215 10.7093 6.24835 10.2852L5.28989 10ZM5.84138 8.66982L6.7206 9.14625C6.93146 8.75712 6.86145 8.27567 6.54849 7.96272L5.84138 8.66982ZM4.92894 7.75738L4.22183 8.46449H4.22183L4.92894 7.75738ZM4.92894 6.34317L5.63605 7.05027H5.63605L4.92894 6.34317ZM6.34315 4.92895L7.05026 5.63606L7.05026 5.63606L6.34315 4.92895ZM7.75737 4.92895L8.46447 4.22185V4.22185L7.75737 4.92895ZM8.6698 5.84139L7.9627 6.54849C8.27565 6.86145 8.7571 6.93146 9.14623 6.7206L8.6698 5.84139ZM10 5.28988L10.2853 6.24833C10.7093 6.12213 11 5.7323 11 5.28988H10ZM11 2C9.89545 2 9.00002 2.89543 9.00002 4H11V4V2ZM13 2H11V4H13V2ZM15 4C15 2.89543 14.1046 2 13 2V4H15ZM15 5.28988V4H13V5.28988H15ZM15.8066 4.96215C15.3271 4.70233 14.8179 4.48994 14.2853 4.33143L13.7148 6.24833C14.1132 6.36691 14.4944 6.52587 14.8538 6.72058L15.8066 4.96215ZM15.5355 4.2218L14.6231 5.13426L16.0373 6.54847L16.9498 5.63602L15.5355 4.2218ZM18.364 4.2218C17.5829 3.44075 16.3166 3.44075 15.5355 4.2218L16.9498 5.63602V5.63601L18.364 4.2218ZM19.7782 5.63602L18.364 4.2218L16.9498 5.63602L18.364 7.05023L19.7782 5.63602ZM19.7782 8.46444C20.5592 7.68339 20.5592 6.41706 19.7782 5.63602L18.364 7.05023L18.364 7.05023L19.7782 8.46444ZM18.8657 9.37689L19.7782 8.46444L18.364 7.05023L17.4515 7.96268L18.8657 9.37689ZM19.6686 9.71475C19.5101 9.18211 19.2977 8.67285 19.0378 8.19335L17.2794 9.14621C17.4741 9.50555 17.6331 9.8868 17.7517 10.2853L19.6686 9.71475ZM18.7101 11H20V9H18.7101V11ZM20 11H22C22 9.89543 21.1046 9 20 9V11ZM20 11V13H22V11H20ZM20 13V15C21.1046 15 22 14.1046 22 13H20ZM20 13H18.7101V15H20V13ZM19.0378 15.8066C19.2977 15.3271 19.5101 14.8179 19.6686 14.2852L17.7517 13.7148C17.6331 14.1132 17.4741 14.4944 17.2794 14.8538L19.0378 15.8066ZM19.7782 15.5356L18.8657 14.6231L17.4515 16.0373L18.364 16.9498L19.7782 15.5356ZM19.7782 18.364C20.5592 17.5829 20.5592 16.3166 19.7782 15.5356L18.364 16.9498H18.364L19.7782 18.364ZM18.364 19.7782L19.7782 18.364L18.364 16.9498L16.9498 18.364L18.364 19.7782ZM15.5355 19.7782C16.3166 20.5592 17.5829 20.5592 18.364 19.7782L16.9498 18.364L15.5355 19.7782ZM14.6231 18.8657L15.5355 19.7782L16.9498 18.364L16.0373 17.4515L14.6231 18.8657ZM14.2853 19.6686C14.8179 19.5101 15.3271 19.2977 15.8066 19.0378L14.8538 17.2794C14.4944 17.4741 14.1132 17.6331 13.7148 17.7517L14.2853 19.6686ZM15 20V18.7101H13V20H15ZM13 22C14.1046 22 15 21.1046 15 20H13V22ZM11 22H13V20H11V22ZM9.00002 20C9.00002 21.1046 9.89545 22 11 22V20H9.00002ZM9.00002 18.7101V20H11V18.7101H9.00002ZM8.19337 19.0378C8.67287 19.2977 9.18213 19.5101 9.71477 19.6686L10.2853 17.7517C9.88681 17.6331 9.50557 17.4741 9.14623 17.2794L8.19337 19.0378ZM8.46447 19.7782L9.3769 18.8657L7.96269 17.4515L7.05026 18.3639L8.46447 19.7782ZM5.63604 19.7782C6.41709 20.5592 7.68342 20.5592 8.46447 19.7781L7.05026 18.3639L5.63604 19.7782ZM4.22183 18.3639L5.63604 19.7782L7.05026 18.3639L5.63604 16.9497L4.22183 18.3639ZM4.22183 15.5355C3.44078 16.3166 3.44078 17.5829 4.22183 18.3639L5.63604 16.9497V16.9497L4.22183 15.5355ZM5.13427 14.6231L4.22183 15.5355L5.63604 16.9497L6.54849 16.0373L5.13427 14.6231ZM4.33144 14.2852C4.48996 14.8179 4.70234 15.3271 4.96217 15.8066L6.7206 14.8537C6.52589 14.4944 6.36693 14.1132 6.24835 13.7147L4.33144 14.2852ZM5.28989 13H4V15H5.28989V13ZM4 13H4H2C2 14.1046 2.89543 15 4 15V13ZM4 13V11H2V13H4ZM4 11V9C2.89543 9 2 9.89543 2 11H4ZM4 11H5.28989V9H4V11ZM4.96217 8.1934C4.70235 8.67288 4.48996 9.18213 4.33144 9.71475L6.24835 10.2852C6.36693 9.88681 6.52589 9.50558 6.7206 9.14625L4.96217 8.1934ZM4.22183 8.46449L5.13428 9.37693L6.54849 7.96272L5.63605 7.05027L4.22183 8.46449ZM4.22183 5.63606C3.44078 6.41711 3.44079 7.68344 4.22183 8.46449L5.63605 7.05027L5.63605 7.05027L4.22183 5.63606ZM5.63605 4.22185L4.22183 5.63606L5.63605 7.05027L7.05026 5.63606L5.63605 4.22185ZM8.46447 4.22185C7.68343 3.4408 6.4171 3.4408 5.63605 4.22185L7.05026 5.63606V5.63606L8.46447 4.22185ZM9.37691 5.13428L8.46447 4.22185L7.05026 5.63606L7.9627 6.54849L9.37691 5.13428ZM9.71477 4.33143C9.18213 4.48995 8.67287 4.70234 8.19337 4.96218L9.14623 6.7206C9.50557 6.52588 9.88681 6.36692 10.2853 6.24833L9.71477 4.33143ZM9.00002 4V5.28988H11V4H9.00002Z" fill="currentColor"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const openSvg = `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-60.000000, -1879.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M13.978,1730.401 L12.596,1729.007 L6,1735.656 L6,1733 L4,1733 L4,1739 L10.071,1739 L10.101,1737 L7.344,1737 L13.978,1730.401 Z M24,1725.08 L24,1739 L12,1739 L12,1737 L22,1737 L22,1727 L16,1727 L16,1721 L6,1721 L6,1731 L4,1731 L4,1719 L18,1719 L24,1725.08 Z"></path></g></g></g></svg>`;

export const BUTTONS_LIST = [
  // All SVG are with a CC0 or PD license, most found on svgrepo
  {
    name: "newFile",
    defaultTitle: "Create a new file",
    height: "1.3rem",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-420.000000, -8079.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M382,7937 L366,7937 L366,7925.837 L370.837,7921 L382,7921 L382,7937 Z M383.969,7919 L370,7919 L370,7919.009 L364.009,7925 L364,7925 L364,7939 L384,7939 L384,7919 L383.969,7919 Z"></path></g></g></g></svg>`,
  },
  {
    name: "previous",
    defaultTitle: "Previous",
    height: "1.4em",
    svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-385.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M338.61,6539 L340,6537.594 L331.739,6528.987 L332.62,6528.069 L332.615,6528.074 L339.955,6520.427 L338.586,6519 C336.557,6521.113 330.893,6527.014 329,6528.987 C330.406,6530.453 329.035,6529.024 338.61,6539"></path></g></g></g></svg>`,
  },
  {
    name: "next",
    defaultTitle: "Next",
    height: "1.4em",
    svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-425.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M370.39,6519 L369,6520.406 L377.261,6529.013 L376.38,6529.931 L376.385,6529.926 L369.045,6537.573 L370.414,6539 C372.443,6536.887 378.107,6530.986 380,6529.013 C378.594,6527.547 379.965,6528.976 370.39,6519"></path </g></g></g></svg>`,
  },
  {
    name: "undo",
    defaultTitle: "Undo",
    height: "1.8rem",
    svg: `<svg fill="currentColor" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`,
  },
  {
    name: "redo",
    defaultTitle: "Redo",
    height: "1.8rem",
    svg: `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`,
  },
  {
    name: "clear",
    defaultTitle: "Clear",
    height: "1.5em",
    svg: clearSvg,
  },
  {
    name: "upload",
    defaultTitle: "Load",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-300.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M254.006515,3325.00497 L250.302249,3328.71065 L251.715206,3330.12415 L253.007252,3328.83161 L253.007252,3339 L255.005777,3339 L255.005777,3328.83161 L256.297824,3330.12415 L257.710781,3328.71065 L254.006515,3325.00497 Z M262.281407,3331.70459 C260.525703,3333.21505 258.787985,3333.00213 257.004302,3333.00213 L257.004302,3331.00284 C258.859932,3331.00284 259.724294,3331.13879 260.728553,3330.45203 C263.14477,3328.79962 261.8847,3324.908 258.902901,3325.01496 C257.570884,3318.41131 247.183551,3320.64551 249.247028,3327.4451 C246.618968,3325.35484 243.535244,3331.00284 249.116125,3331.00284 L251.008728,3331.00284 L251.008728,3333.00213 L248.211792,3333.00213 C244.878253,3333.00213 242.823769,3329.44339 244.73236,3326.72236 C245.644687,3325.42282 247.075631,3325.10193 247.075631,3325.10193 C247.735144,3319.99075 253.568838,3317.29171 257.889649,3320.18468 C259.74428,3321.42724 260.44776,3323.24259 260.44776,3323.24259 C264.159021,3324.37019 265.278195,3329.1265 262.281407,3331.70459 L262.281407,3331.70459 Z"></path></g></g></g></svg>`,
  },
  {
    name: "open",
    defaultTitle: "Open",
    height: "1.2rem",
    svg: openSvg,
  },
  {
    name: "download",
    defaultTitle: "Download",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-340.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M297.995199,3334.46886 C297.995199,3334.07649 296.972565,3334.08051 296.583086,3334.47187 L295.852063,3335.20843 C295.537483,3335.52452 294.999203,3335.30275 294.999203,3334.8552 L294.999203,3326.03153 C294.999203,3325.48162 294.600735,3325.03708 294.055464,3325.03005 C293.508195,3325.03708 293.001872,3325.48162 293.001872,3326.03153 L293.001872,3334.8552 C293.001872,3335.30275 292.463591,3335.52653 292.149011,3335.21043 L291.417988,3334.26715 C291.028509,3333.87579 290.40634,3334.05943 290.016861,3334.05943 L290.010869,3334.05943 C289.621389,3335.06292 289.618393,3335.29473 290.008871,3335.68609 L292.589423,3338.38547 C293.36938,3339.16919 294.633691,3339.22137 295.413649,3338.43765 L297.995199,3335.86872 C298.385677,3335.47636 297.995199,3334.85419 297.995199,3334.46283 L297.995199,3334.46886 Z M294.044478,3325.02805 C294.048473,3325.02805 294.051469,3325.03005 294.055464,3325.03005 C294.059458,3325.03005 294.062454,3325.02805 294.066449,3325.02805 L294.044478,3325.02805 Z M297.995199,3333.05595 C297.443936,3333.05595 296.996533,3332.60638 296.996533,3332.05246 C296.996533,3331.49853 297.443936,3331.04897 297.995199,3331.04897 L298.888006,3331.04897 C303.142321,3331.04897 302.833733,3324.89559 298.893998,3325.03808 C297.547797,3318.33479 287.212608,3320.75419 289.243893,3327.47756 C287.168667,3325.8198 284.677995,3329.02795 286.79916,3330.61145 C288.298157,3331.73134 291.004541,3330.19902 291.004541,3332.05246 C291.004541,3333.31484 289.578446,3333.05595 288.209276,3333.05595 C284.877728,3333.05595 282.824472,3329.48353 284.731923,3326.75204 C285.643704,3325.4475 287.073793,3325.12539 287.073793,3325.12539 C287.732913,3319.99456 293.563122,3317.28514 297.881351,3320.18923 C299.734874,3321.43657 300.437935,3323.2589 300.437935,3323.2589 C301.527479,3323.59206 302.46223,3324.28246 303.098379,3325.19663 C305.240517,3328.27332 303.575742,3333.05595 297.995199,3333.05595 L297.995199,3333.05595 Z"></path></g></g></g></svg>`,
  },
  {
    name: "quick-save",
    defaultTitle: "Quick Save",
    height: "1.4em",
    svg: `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3H7.99998L5 12H9.99998L7.99998 22L21 8H14.5L16 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: "save",
    defaultTitle: "Save As",
    height: "1.3em",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-99.000000, -680.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M50.21875,525 L52.31875,525 L52.31875,523 L50.21875,523 L50.21875,525 Z M61.9,538 L59.8,538 L59.8,532 L58.88125,532 L57.7,532 L49.3,532 L47.5276,532 L47.2,532 L47.2,538 L45.1,538 L45.1,526.837 L47.2,524.837 L47.2,528 L48.11875,528 L49.3,528 L57.7,528 L59.47135,528 L59.8,528 L59.8,522 L61.9,522 L61.9,538 Z M49.3,538 L57.7,538 L57.7,534 L49.3,534 L49.3,538 Z M49.3,522.837 L50.17885,522 L57.7,522 L57.7,526 L49.3,526 L49.3,522.837 Z M63.9664,520 L61.8664,520 L49.3,520 L49.3,520.008 L47.2084,522 L47.2,522 L47.2,522.008 L43.0084,526 L43,526 L43,538 L43,540 L45.1,540 L61.8664,540 L63.9664,540 L64,540 L64,538 L64,522 L64,520 L63.9664,520 Z"></path></g></g></g></svg>`,
  },
  {
    name: "fullscreen",
    defaultTitle: "Toggle fullscreen",
    height: "1.3em",
    svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-300.000000, -4199.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M262.4445,4039 L256.0005,4039 L256.0005,4041 L262.0005,4041 L262.0005,4047 L264.0005,4047 L264.0005,4039.955 L264.0005,4039 L262.4445,4039 Z M262.0005,4057 L256.0005,4057 L256.0005,4059 L262.4445,4059 L264.0005,4059 L264.0005,4055.955 L264.0005,4051 L262.0005,4051 L262.0005,4057 Z M246.0005,4051 L244.0005,4051 L244.0005,4055.955 L244.0005,4059 L246.4445,4059 L252.0005,4059 L252.0005,4057 L246.0005,4057 L246.0005,4051 Z M246.0005,4047 L244.0005,4047 L244.0005,4039.955 L244.0005,4039 L246.4445,4039 L252.0005,4039 L252.0005,4041 L246.0005,4041 L246.0005,4047 Z"></path></g></g></g></svg>`,
  },
  {
    name: "code",
    height: "1.3em",
    svg: codeImgSvg,
  },
  {
    name: "minimize",
    defaultTitle: "Minimize",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 -2.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-259.000000, -242.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M205.1,96 L221.9,96 L221.9,84 L205.1,84 L205.1,96 Z M203,98 L224,98 L224,82 L203,82 L203,98 Z M208.25,91 L218.75,91 L218.75,89 L208.25,89 L208.25,91 Z"></path></g></g></g></svg>`,
  },
  {
    name: "close",
    defaultTitle: "Close",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-139.000000, -160.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M85.1,18 L101.9,18 L101.9,2 L85.1,2 L85.1,18 Z M83,20 L104,20 L104,0 L83,0 L83,20 Z M89.7872,11.856 L92.01425,9.735 L89.7872,7.613 L91.2719,6.199 L93.5,8.321 L95.72705,6.199 L97.21175,7.613 L94.9847,9.735 L97.21175,11.856 L95.72705,13.27 L93.5,11.149 L91.2719,13.27 L89.7872,11.856 Z"></path></g></g></g></svg>`,
  },
  {
    name: "deactivate",
    defaultTitle: "Deactivate",
    height: "1.4rem",
    svg: `<svg fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 389 389" xml:space="preserve"><g><g><g><path d="M379,326.035h-18.852c-5.522,0-10,4.477-10,10v14.111h-14.113c-5.522,0-10,4.477-10,10V379c0,5.523,4.478,10,10,10H379     c5.522,0,10-4.477,10-10v-42.965C389,330.512,384.522,326.035,379,326.035z"/><path d="M166.927,350.146h-58.813c-5.522,0-10,4.477-10,10V379c0,5.523,4.478,10,10,10h58.813c5.522,0,10-4.477,10-10v-18.854     C176.927,354.623,172.449,350.146,166.927,350.146z"/><path d="M280.887,350.146h-58.812c-5.523,0-10,4.477-10,10V379c0,5.523,4.477,10,10,10h58.812c5.522,0,10-4.477,10-10v-18.854     C290.887,354.623,286.409,350.146,280.887,350.146z"/><path d="M52.965,350.146H38.852v-14.111c0-5.523-4.478-10-10-10H10c-5.522,0-10,4.477-10,10V379c0,5.523,4.478,10,10,10h42.965     c5.521,0,10-4.477,10-10v-18.854C62.965,354.623,58.486,350.146,52.965,350.146z"/><path d="M10,290.886h18.852c5.522,0,10-4.477,10-10v-58.812c0-5.523-4.478-10-10-10H10c-5.522,0-10,4.477-10,10v58.812     C0,286.409,4.478,290.886,10,290.886z"/><path d="M10,176.926h18.852c5.522,0,10-4.477,10-10v-58.812c0-5.523-4.478-10-10-10H10c-5.522,0-10,4.477-10,10v58.812     C0,172.449,4.478,176.926,10,176.926z"/><path d="M52.965,0H10C4.478,0,0,4.477,0,10v42.967c0,5.523,4.478,10,10,10h18.852c5.522,0,10-4.477,10-10V38.854h14.113     c5.521,0,10-4.477,10-10V10C62.965,4.478,58.486,0,52.965,0z"/><path d="M280.887,0h-58.812c-5.522,0-10,4.477-10,10v18.854c0,5.523,4.478,10,10,10h58.812c5.522,0,10-4.477,10-10V10     C290.887,4.478,286.409,0,280.887,0z"/><path d="M108.113,38.854h58.813c5.522,0,10-4.477,10-10V10c0-5.523-4.478-10-10-10h-58.813c-5.522,0-10,4.477-10,10v18.854     C98.113,34.377,102.591,38.854,108.113,38.854z"/><path d="M379,0h-42.965c-5.522,0-10,4.477-10,10v18.854c0,5.523,4.478,10,10,10h14.113v14.113c0,5.523,4.478,10,10,10H379     c5.522,0,10-4.477,10-10V10C389,4.478,384.522,0,379,0z"/><path d="M379,212.074h-18.852c-5.522,0-10,4.477-10,10v58.812c0,5.522,4.478,10,10,10H379c5.522,0,10-4.478,10-10v-58.812     C389,216.551,384.522,212.074,379,212.074z"/><path d="M379,98.114h-18.852c-5.522,0-10,4.477-10,10v58.812c0,5.523,4.478,10,10,10H379c5.522,0,10-4.477,10-10v-58.812     C389,102.591,384.522,98.114,379,98.114z"/></g></g></g></svg>`,
  },
  {
    name: "retry",
    defaultTitle: "Retry",
    height: "1.4rem",
    svg: `<svg width="800px" height="800px" viewBox="-1 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-342.000000, -7080.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M300.002921,6930.85894 C299.524118,6934.16792 296.32507,6936.61291 292.744585,6935.86392 C290.471022,6935.38792 288.623062,6933.55693 288.145263,6931.29294 C287.32919,6927.42196 290.007276,6923.99998 294.022397,6923.99998 L294.022397,6925.99997 L299.041299,6922.99998 L294.022397,6920 L294.022397,6921.99999 C289.003495,6921.99999 285.16002,6926.48297 286.158782,6931.60494 C286.767072,6934.72392 289.294592,6937.23791 292.425383,6937.8439 C297.170253,6938.7619 301.37007,6935.51592 301.990406,6931.12594 C302.074724,6930.52994 301.591905,6929.99995 300.988633,6929.99995 L300.989637,6929.99995 C300.490758,6929.99995 300.074189,6930.36694 300.002921,6930.85894"></path></g></g></g></svg>`,
  },
];

export const BUTTONS_BY_NAME = BUTTONS_LIST.reduce((acc, val) => {
  acc[val.name] = val;
  return acc;
}, {});

/**
 * Object regrouping information about specifically style settings that will be
 * communicated to apps so they can style themselves.
 */
export const APP_STYLE = {
  fontSize: {
    cssProp: "var(--font-size)",
    cssName: "--font-size",
  },
  windowActiveHeader: {
    cssProp: "var(--window-active-header)",
    cssName: "--window-active-header",
  },
  windowActiveHeaderText: {
    cssProp: "var(--window-active-header-text)",
    cssName: "--window-active-header-text",
  },
  windowInactiveHeader: {
    cssProp: "var(--window-inactive-header)",
    cssName: "--window-inactive-header",
  },
  windowInactiveHeaderText: {
    cssProp: "var(--window-inactive-header-text)",
    cssName: "--window-inactive-header-text",
  },
  textColor: {
    cssProp: "var(--window-text-color)",
    cssName: "--window-text-color",
  },
  bgColor: {
    cssProp: "var(--window-content-bg)",
    cssName: "--window-content-bg",
  },
  lineColor: {
    cssProp: "var(--window-line-color)",
    cssName: "--window-line-color",
  },
  primaryColor: {
    cssProp: "var(--app-primary-color)",
    cssName: "--app-primary-color",
  },
  disabledColor: {
    cssProp: "var(--app-primary-bg)",
    cssName: "--app-primary-bg",
  },
  barBg: {
    cssProp: "var(--window-sidebar-bg)",
    cssName: "--window-sidebar-bg",
  },
  barHoverBg: {
    cssProp: "var(--sidebar-hover-bg)",
    cssName: "--sidebar-hover-bg",
  },
  barSelectedBg: {
    cssProp: "var(--sidebar-selected-bg-color)",
    cssName: "--sidebar-selected-bg-color",
  },
  barSelectedText: {
    cssProp: "var(--sidebar-selected-text-color)",
    cssName: "--sidebar-selected-text-color",
  },
};
