/**
 * This is the code for the desktop itself, which is completely separated from
 * any application's code.
 *
 * It takes care of anything related to the desktop: window management,
 * launching apps, desktop icons rendering, taskbar management, notifications,
 * filesystem implementation and other general stuff.
 *
 * When running an application (or when choosing to preload it), the desktop
 * will load that application's script.
 */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/__generated_apps.mjs
  var version = 1;
  var generated_apps_default = [
    {
      id: "about",
      title: "About Me",
      icon: "\u{1F64B}\u{1F3FB}\u200D\u2642\uFE0F",
      startMenu: {
        display: true
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/about.js",
        dependencies: [],
        defaultHeight: 650,
        defaultWidth: 855
      }
    },
    {
      id: "settings",
      title: "Settings",
      icon: "\u2699\uFE0F",
      onlyOne: true,
      startMenu: {
        display: true
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/settings.js",
        dependencies: ["CONSTANTS", "settings", "filesystem", "notificationEmitter"],
        defaultHeight: 700,
        defaultWidth: 1e3
      }
    },
    {
      id: "app-group",
      title: "Apps",
      icon: "\u{1F4BD}",
      data: {
        lazyLoad: "./lazy/app-group.js",
        dependencies: ["open"],
        defaultHeight: 400,
        defaultWidth: 460
      }
    },
    {
      id: "explorer",
      title: "File Explorer",
      icon: "\u{1F40B}",
      startMenu: {
        display: true
      },
      desktop: {
        display: true
      },
      provider: ["filePickerOpen", "filePickerSave"],
      data: {
        lazyLoad: "./lazy/explorer.js",
        dependencies: ["filesystem", "open"],
        defaultHeight: 500,
        defaultWidth: 700
      }
    },
    {
      id: "paint",
      title: "Paint",
      icon: "\u{1F58C}\uFE0F",
      startMenu: {
        list: "Desktop Apps"
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/paint.js",
        sandboxed: true,
        dependencies: ["filePickerOpen", "filePickerSave", "quickSave"],
        defaultHeight: 950,
        defaultWidth: 1e3
      }
    },
    {
      id: "notes",
      title: "Notes",
      icon: "\u{1F4DD}",
      startMenu: {
        list: "Desktop Apps"
      },
      desktop: {
        display: true
      },
      defaultForExtensions: ["html", "css", "json", "mjs", "js", "jsx", "c", "cc", "cpp", "toml", "ts", "tsx", "go", "txt", "md", "s", "S", "asm", "rs"],
      data: {
        lazyLoad: "./lazy/notes.js",
        sandboxed: true,
        dependencies: ["filePickerOpen", "filePickerSave", "quickSave"],
        defaultHeight: 700,
        defaultWidth: 700
      }
    },
    {
      id: "table",
      title: "Sheets",
      icon: "\u{1F4CF}",
      startMenu: {
        list: "Desktop Apps"
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/table.js",
        sandboxed: true
      }
    },
    {
      id: "image-viewer",
      title: "Image Viewer",
      icon: "\u{1F3DE}\uFE0F",
      startMenu: {
        list: "Desktop Apps"
      },
      desktop: {
        display: true
      },
      defaultForExtensions: ["webp", "jpg", "avif", "heif", "jpeg", "png", "gif", "svg"],
      data: {
        lazyLoad: "./lazy/image-viewer.js",
        defaultBackground: "disabledColor",
        sandboxed: true,
        dependencies: ["filePickerOpen"],
        defaultHeight: 600,
        defaultWidth: 900
      }
    },
    {
      id: "calculator",
      title: "Calculator",
      icon: "\u{1F9EE}",
      startMenu: {
        list: "Desktop Apps"
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/calculator.js",
        defaultBackground: "barBg",
        sandboxed: true,
        dependencies: [],
        defaultHeight: 400,
        defaultWidth: 300
      }
    },
    {
      id: "invaders",
      title: "Invaders",
      icon: "\u{1F47E}",
      startMenu: {
        list: "Games"
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/invaders.js",
        defaultBackground: "#27272c",
        sandboxed: true,
        defaultHeight: 600,
        defaultWidth: 800
      }
    },
    {
      id: "bombsweeper",
      title: "BombSweeper!",
      icon: "\u{1F4A3}",
      startMenu: {
        list: "Games"
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/bombsweeper.js",
        defaultBackground: "barBg",
        sandboxed: true,
        defaultHeight: 700,
        defaultWidth: 600
      }
    },
    {
      id: "pong",
      title: "Pong",
      icon: "\u{1F3D3}",
      startMenu: {
        list: "Games"
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/pong.js",
        defaultBackground: "windowActiveHeader",
        sandboxed: true,
        defaultHeight: 400,
        defaultWidth: 600
      }
    },
    {
      id: "other_projects_rx-player",
      title: "RxPlayer",
      icon: "\u23EF\uFE0F",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_rx-player.js",
        sandboxed: true,
        defaultHeight: 720,
        defaultWidth: 950
      }
    },
    {
      id: "other_projects_wasp-hls",
      title: "WASP-HLS",
      icon: "\u{1F41D}",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_wasp-hls.js",
        sandboxed: true,
        defaultHeight: 720,
        defaultWidth: 950
      }
    },
    {
      id: "other_projects_rx-paired",
      title: "RxPaired",
      icon: "\u{1F4C8}",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_rx-paired.js",
        sandboxed: true,
        defaultHeight: 700,
        defaultWidth: 1e3
      }
    },
    {
      id: "other_projects_eme-spy",
      title: "EMESpy",
      icon: "\u{1F575}\uFE0F",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_eme-spy.js",
        sandboxed: true,
        defaultHeight: 500,
        defaultWidth: 800
      }
    },
    {
      id: "other_projects_mse-spy",
      title: "MSESpy",
      icon: "\u{1F453}",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_mse-spy.js",
        sandboxed: true,
        defaultHeight: 500,
        defaultWidth: 800
      }
    },
    {
      id: "other_projects_isobmff-inspector",
      title: "isobmff-inspector",
      icon: "\u{1F4F9}",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_isobmff-inspector.js",
        sandboxed: true
      }
    },
    {
      id: "other_projects_gif-renderer",
      title: "gif-renderer.rs",
      icon: "\u{1F3C7}",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_gif-renderer.js",
        sandboxed: true
      }
    },
    {
      id: "other_projects_str-html",
      title: "str-html",
      icon: "\u{1F4C4}",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_str-html.js",
        sandboxed: true
      }
    },
    {
      id: "other_projects_readme",
      title: "README",
      icon: "\u{1F4D6}",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_readme.js",
        sandboxed: true
      }
    },
    {
      id: "other_projects_keyboard9",
      title: "keyboard9",
      icon: "\u2328\uFE0F",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_keyboard9.js",
        sandboxed: true
      }
    },
    {
      id: "other_projects_bif-inspector",
      title: "bif-inspector",
      icon: "\u{1F5BC}\uFE0F",
      startMenu: {
        list: "My Other Projects"
      },
      data: {
        lazyLoad: "./lazy/other_projects_bif-inspector.js",
        sandboxed: true
      }
    },
    {
      id: "godbolt",
      title: "Compiler explorer",
      icon: "\u{1F916}",
      startMenu: {
        list: "External Apps"
      },
      data: {
        website: "https://godbolt.org/",
        defaultHeight: 720,
        defaultWidth: 1e3
      }
    },
    {
      id: "wikipedia",
      title: "Wikipedia",
      icon: "\u{1F4D6}",
      startMenu: {
        list: "External Apps"
      },
      data: {
        website: "https://www.wikipedia.org/",
        defaultHeight: 720,
        defaultWidth: 1e3
      }
    },
    {
      id: "osm",
      title: "OS Maps",
      icon: "\u{1F5FA}\uFE0F",
      startMenu: {
        list: "External Apps"
      },
      data: {
        website: "https://www.openstreetmap.org/export/embed.html",
        defaultHeight: 720,
        defaultWidth: 1e3
      }
    },
    {
      id: "noclip",
      title: "noclip.website",
      icon: "\u{1F579}\uFE0F",
      startMenu: {
        list: "External Apps"
      },
      data: {
        website: "https://noclip.website/",
        defaultHeight: 720,
        defaultWidth: 1280
      }
    },
    {
      id: "bbb",
      title: "That one testing video",
      icon: "\u{1F407}",
      startMenu: {
        list: "External Apps"
      },
      data: {
        website: "https://www.youtube.com/embed/aqz-KE-bpKQ",
        defaultHeight: 720,
        defaultWidth: 900
      }
    },
    {
      id: "passgen",
      title: "passgen",
      icon: "\u{1F511}",
      startMenu: {
        list: "Misc"
      },
      data: {
        lazyLoad: "./lazy/passgen.js",
        sandboxed: true,
        defaultHeight: 300,
        defaultWidth: 450
      }
    },
    {
      id: "clock",
      title: "Clock",
      icon: "\u{1F552}",
      startMenu: {
        list: "Misc"
      },
      data: {
        lazyLoad: "./lazy/clock.js",
        sandboxed: true,
        defaultHeight: 250,
        defaultWidth: 250
      }
    },
    {
      id: "inception",
      title: "Inception",
      icon: "\u{1F9E0}",
      startMenu: {
        list: "Misc"
      },
      data: {
        lazyLoad: "./lazy/inception.js",
        defaultHeight: 720,
        defaultWidth: 1280
      }
    },
    {
      id: "docx",
      title: "Docx Reader (docx.js)",
      icon: "\u{1F4D8}",
      startMenu: {
        list: "External Apps"
      },
      defaultForExtensions: ["docx", "doc"],
      data: {
        lazyLoad: "./lazy/docx.js",
        sandboxed: true,
        dependencies: ["filePickerOpen"],
        defaultHeight: 600,
        defaultWidth: 900
      }
    },
    {
      id: "xlsx",
      title: "Xlsx Reader (xlsx.js)",
      icon: "\u{1F4CA}",
      startMenu: {
        list: "External Apps"
      },
      defaultForExtensions: ["xls", "xlsx"],
      data: {
        lazyLoad: "./lazy/xlsx.js",
        sandboxed: true,
        dependencies: ["filePickerOpen"],
        defaultHeight: 600,
        defaultWidth: 900
      }
    },
    {
      id: "pdf",
      title: "PDF Viewer (pdf.js) \u{1F6A7} Not finished",
      icon: "\u{1F4D1}",
      startMenu: {
        list: "External Apps"
      },
      defaultForExtensions: ["pdf"],
      data: {
        lazyLoad: "./lazy/pdf.js",
        sandboxed: true,
        dependencies: ["filePickerOpen"],
        defaultHeight: 950,
        defaultWidth: 1e3
      }
    },
    {
      id: "this-website",
      title: "About This Website",
      icon: "\u{1F310}",
      startMenu: {
        list: "Misc"
      },
      desktop: {
        display: true
      },
      data: {
        lazyLoad: "./lazy/this-website.js",
        sandboxed: true,
        defaultHeight: 600,
        defaultWidth: 855
      }
    },
    {
      id: "add-desktop-icon",
      title: "Add Desktop Icon",
      icon: "\u{1F939}\u200D\u2642\uFE0F",
      data: {
        lazyLoad: "./lazy/add-desktop-icon.js",
        dependencies: ["filePickerOpen", "filesystem", "notificationEmitter"],
        defaultHeight: 700,
        defaultWidth: 700
      }
    }
  ];
  setTimeout(
    () => {
      const importPath = "./lazy/settings.js";
      import(importPath);
    },
    100
  );

  // src/constants.mjs
  var constants_exports = {};
  __export(constants_exports, {
    APP_STYLE: () => APP_STYLE,
    BASE_WINDOW_Z_INDEX: () => BASE_WINDOW_Z_INDEX,
    BUTTONS_BY_NAME: () => BUTTONS_BY_NAME,
    BUTTONS_LIST: () => BUTTONS_LIST,
    CLOSE_APP_ANIM_TIMER: () => CLOSE_APP_ANIM_TIMER,
    CLOSE_MENU_OPEN_ANIM_TIMER: () => CLOSE_MENU_OPEN_ANIM_TIMER,
    DEFAULT_WINDOW_HEIGHT: () => DEFAULT_WINDOW_HEIGHT,
    DEFAULT_WINDOW_WIDTH: () => DEFAULT_WINDOW_WIDTH,
    DEMINIMIZE_APP_ANIM_TIMER: () => DEMINIMIZE_APP_ANIM_TIMER,
    EXIT_FULLSCREEN_ANIM_TIMER: () => EXIT_FULLSCREEN_ANIM_TIMER,
    ICON_HEIGHT_BASE: () => ICON_HEIGHT_BASE,
    ICON_MARGIN: () => ICON_MARGIN,
    ICON_WIDTH_BASE: () => ICON_WIDTH_BASE,
    ICON_X_BASE: () => ICON_X_BASE,
    ICON_X_OFFSET_FROM_WIDTH: () => ICON_X_OFFSET_FROM_WIDTH,
    ICON_Y_BASE: () => ICON_Y_BASE,
    ICON_Y_OFFSET_FROM_HEIGHT: () => ICON_Y_OFFSET_FROM_HEIGHT,
    IMAGE_ROOT_PATH: () => IMAGE_ROOT_PATH,
    MINIMIZE_APP_ANIM_TIMER: () => MINIMIZE_APP_ANIM_TIMER,
    OPEN_APP_ANIM_TIMER: () => OPEN_APP_ANIM_TIMER,
    PROJECT_REPO: () => PROJECT_REPO,
    START_ITEM_HEIGHT: () => START_ITEM_HEIGHT,
    START_MENU_OPEN_ANIM_TIMER: () => START_MENU_OPEN_ANIM_TIMER,
    TASKBAR_MAX_HORIZONTAL_SIZE: () => TASKBAR_MAX_HORIZONTAL_SIZE,
    TASKBAR_MAX_VERTICAL_SIZE: () => TASKBAR_MAX_VERTICAL_SIZE,
    TASKBAR_MIN_HORIZONTAL_SIZE: () => TASKBAR_MIN_HORIZONTAL_SIZE,
    TASKBAR_MIN_VERTICAL_SIZE: () => TASKBAR_MIN_VERTICAL_SIZE,
    WINDOW_MIN_HEIGHT: () => WINDOW_MIN_HEIGHT,
    WINDOW_MIN_WIDTH: () => WINDOW_MIN_WIDTH,
    WINDOW_OOB_SECURITY_PIX: () => WINDOW_OOB_SECURITY_PIX,
    __VERSION__: () => __VERSION__,
    clearSvg: () => clearSvg,
    codeImgSvg: () => codeImgSvg,
    demoImgSvg: () => demoImgSvg,
    docImgSvg: () => docImgSvg,
    openSvg: () => openSvg,
    resetSvg: () => resetSvg,
    settingsSvg: () => settingsSvg
  });
  var __VERSION__ = "0.1.0";
  var PROJECT_REPO = "https://github.com/peaBerberian/peaberberian.github.io";
  var TASKBAR_MIN_HORIZONTAL_SIZE = 25;
  var TASKBAR_MAX_HORIZONTAL_SIZE = 70;
  var TASKBAR_MIN_VERTICAL_SIZE = 60;
  var TASKBAR_MAX_VERTICAL_SIZE = 150;
  var WINDOW_MIN_WIDTH = 230;
  var WINDOW_MIN_HEIGHT = 230;
  var DEFAULT_WINDOW_HEIGHT = 500;
  var DEFAULT_WINDOW_WIDTH = 700;
  var BASE_WINDOW_Z_INDEX = 99;
  var START_ITEM_HEIGHT = 50;
  var ICON_WIDTH_BASE = 90;
  var ICON_HEIGHT_BASE = 65;
  var ICON_Y_BASE = 10;
  var ICON_Y_OFFSET_FROM_HEIGHT = 3;
  var ICON_MARGIN = 3;
  var ICON_X_BASE = 10;
  var ICON_X_OFFSET_FROM_WIDTH = 10;
  var EXIT_FULLSCREEN_ANIM_TIMER = 150;
  var OPEN_APP_ANIM_TIMER = 150;
  var CLOSE_APP_ANIM_TIMER = 150;
  var MINIMIZE_APP_ANIM_TIMER = 200;
  var DEMINIMIZE_APP_ANIM_TIMER = 200;
  var START_MENU_OPEN_ANIM_TIMER = 150;
  var CLOSE_MENU_OPEN_ANIM_TIMER = 300;
  var WINDOW_OOB_SECURITY_PIX = 60;
  var IMAGE_ROOT_PATH = "./assets/img/";
  var docImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 0C3.34315 0 2 1.34315 2 3V13C2 14.6569 3.34315 16 5 16H14V14H4V12H14V0H5Z"/></svg>`;
  var demoImgSvg = `<svg version="1.1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 512 512" xml:space="preserve"><g><path class="st0" d="M485.234,116.625H261.906l69.719-69.719c1.75-1.75,1.75-4.563,0-6.313l-17.422-17.438   c-1.734-1.75-4.563-1.75-6.297,0l-89.688,89.688l-89.656-89.688c-1.75-1.75-4.563-1.75-6.313,0l-17.438,17.438   c-1.75,1.75-1.75,4.563,0,6.313l69.75,69.719H26.766c-14.781,0-26.766,12-26.766,26.781v319.969   c0,14.781,11.984,26.781,26.766,26.781h458.469c14.781,0,26.766-12,26.766-26.781V143.406   C512,128.625,500.016,116.625,485.234,116.625z M383.594,421.188c0,8.531-6.906,15.438-15.422,15.438H66.844   c-8.531,0-15.438-6.906-15.438-15.438V191.875c0-8.531,6.906-15.438,15.438-15.438h301.328c8.516,0,15.422,6.906,15.422,15.438   V421.188z M473.188,333.813h-45.125v-45.125h45.125V333.813z M449.047,234.156c-13.906,0-25.172-11.281-25.172-25.188   s11.266-25.188,25.172-25.188s25.172,11.281,25.172,25.188S462.953,234.156,449.047,234.156z"/>
</g></svg>`;
  var codeImgSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16"  fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 1H1V15H15V1ZM6 5L7.41421 6.41421L5.82843 8L7.41421 9.58579L6 11L3 8L6 5ZM10 5L8.58579 6.41421L10.1716 8L8.58579 9.58579L10 11L13 8L10 5Z"/></svg>`;
  var resetSvg = `<svg width="800px" height="800px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 1 1 0 2.5 2.5)"><path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"/><circle cx="8" cy="8" fill="currentColor" r="2"/><path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"/></g></svg>`;
  var clearSvg = `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-179.000000, -360.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z"></path></g></g></g></svg>`;
  var settingsSvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 5.28988H13C13 5.7323 13.2907 6.12213 13.7148 6.24833L14 5.28988ZM15.3302 5.84137L14.8538 6.72058C15.2429 6.93144 15.7243 6.86143 16.0373 6.54847L15.3302 5.84137ZM16.2426 4.92891L15.5355 4.2218V4.2218L16.2426 4.92891ZM17.6569 4.92891L16.9498 5.63601L16.9498 5.63602L17.6569 4.92891ZM19.0711 6.34312L19.7782 5.63602V5.63602L19.0711 6.34312ZM19.0711 7.75734L18.364 7.05023L19.0711 7.75734ZM18.1586 8.66978L17.4515 7.96268C17.1386 8.27563 17.0686 8.75709 17.2794 9.14621L18.1586 8.66978ZM18.7101 10L17.7517 10.2853C17.8779 10.7093 18.2677 11 18.7101 11V10ZM18.7101 14V13C18.2677 13 17.8779 13.2907 17.7517 13.7148L18.7101 14ZM18.1586 15.3302L17.2794 14.8538C17.0686 15.2429 17.1386 15.7244 17.4515 16.0373L18.1586 15.3302ZM19.0711 16.2427L19.7782 15.5356V15.5356L19.0711 16.2427ZM19.0711 17.6569L18.364 16.9498L18.364 16.9498L19.0711 17.6569ZM17.6569 19.0711L18.364 19.7782V19.7782L17.6569 19.0711ZM15.3302 18.1586L16.0373 17.4515C15.7243 17.1386 15.2429 17.0686 14.8538 17.2794L15.3302 18.1586ZM14 18.7101L13.7148 17.7517C13.2907 17.8779 13 18.2677 13 18.7101H14ZM10 18.7101H11C11 18.2677 10.7093 17.8779 10.2853 17.7517L10 18.7101ZM8.6698 18.1586L9.14623 17.2794C8.7571 17.0685 8.27565 17.1385 7.96269 17.4515L8.6698 18.1586ZM7.75736 19.071L7.05026 18.3639L7.05026 18.3639L7.75736 19.071ZM6.34315 19.071L5.63604 19.7782H5.63604L6.34315 19.071ZM4.92894 17.6568L4.22183 18.3639H4.22183L4.92894 17.6568ZM4.92894 16.2426L4.22183 15.5355H4.22183L4.92894 16.2426ZM5.84138 15.3302L6.54849 16.0373C6.86144 15.7243 6.93146 15.2429 6.7206 14.8537L5.84138 15.3302ZM5.28989 14L6.24835 13.7147C6.12215 13.2907 5.73231 13 5.28989 13V14ZM5.28989 10V11C5.73231 11 6.12215 10.7093 6.24835 10.2852L5.28989 10ZM5.84138 8.66982L6.7206 9.14625C6.93146 8.75712 6.86145 8.27567 6.54849 7.96272L5.84138 8.66982ZM4.92894 7.75738L4.22183 8.46449H4.22183L4.92894 7.75738ZM4.92894 6.34317L5.63605 7.05027H5.63605L4.92894 6.34317ZM6.34315 4.92895L7.05026 5.63606L7.05026 5.63606L6.34315 4.92895ZM7.75737 4.92895L8.46447 4.22185V4.22185L7.75737 4.92895ZM8.6698 5.84139L7.9627 6.54849C8.27565 6.86145 8.7571 6.93146 9.14623 6.7206L8.6698 5.84139ZM10 5.28988L10.2853 6.24833C10.7093 6.12213 11 5.7323 11 5.28988H10ZM11 2C9.89545 2 9.00002 2.89543 9.00002 4H11V4V2ZM13 2H11V4H13V2ZM15 4C15 2.89543 14.1046 2 13 2V4H15ZM15 5.28988V4H13V5.28988H15ZM15.8066 4.96215C15.3271 4.70233 14.8179 4.48994 14.2853 4.33143L13.7148 6.24833C14.1132 6.36691 14.4944 6.52587 14.8538 6.72058L15.8066 4.96215ZM15.5355 4.2218L14.6231 5.13426L16.0373 6.54847L16.9498 5.63602L15.5355 4.2218ZM18.364 4.2218C17.5829 3.44075 16.3166 3.44075 15.5355 4.2218L16.9498 5.63602V5.63601L18.364 4.2218ZM19.7782 5.63602L18.364 4.2218L16.9498 5.63602L18.364 7.05023L19.7782 5.63602ZM19.7782 8.46444C20.5592 7.68339 20.5592 6.41706 19.7782 5.63602L18.364 7.05023L18.364 7.05023L19.7782 8.46444ZM18.8657 9.37689L19.7782 8.46444L18.364 7.05023L17.4515 7.96268L18.8657 9.37689ZM19.6686 9.71475C19.5101 9.18211 19.2977 8.67285 19.0378 8.19335L17.2794 9.14621C17.4741 9.50555 17.6331 9.8868 17.7517 10.2853L19.6686 9.71475ZM18.7101 11H20V9H18.7101V11ZM20 11H22C22 9.89543 21.1046 9 20 9V11ZM20 11V13H22V11H20ZM20 13V15C21.1046 15 22 14.1046 22 13H20ZM20 13H18.7101V15H20V13ZM19.0378 15.8066C19.2977 15.3271 19.5101 14.8179 19.6686 14.2852L17.7517 13.7148C17.6331 14.1132 17.4741 14.4944 17.2794 14.8538L19.0378 15.8066ZM19.7782 15.5356L18.8657 14.6231L17.4515 16.0373L18.364 16.9498L19.7782 15.5356ZM19.7782 18.364C20.5592 17.5829 20.5592 16.3166 19.7782 15.5356L18.364 16.9498H18.364L19.7782 18.364ZM18.364 19.7782L19.7782 18.364L18.364 16.9498L16.9498 18.364L18.364 19.7782ZM15.5355 19.7782C16.3166 20.5592 17.5829 20.5592 18.364 19.7782L16.9498 18.364L15.5355 19.7782ZM14.6231 18.8657L15.5355 19.7782L16.9498 18.364L16.0373 17.4515L14.6231 18.8657ZM14.2853 19.6686C14.8179 19.5101 15.3271 19.2977 15.8066 19.0378L14.8538 17.2794C14.4944 17.4741 14.1132 17.6331 13.7148 17.7517L14.2853 19.6686ZM15 20V18.7101H13V20H15ZM13 22C14.1046 22 15 21.1046 15 20H13V22ZM11 22H13V20H11V22ZM9.00002 20C9.00002 21.1046 9.89545 22 11 22V20H9.00002ZM9.00002 18.7101V20H11V18.7101H9.00002ZM8.19337 19.0378C8.67287 19.2977 9.18213 19.5101 9.71477 19.6686L10.2853 17.7517C9.88681 17.6331 9.50557 17.4741 9.14623 17.2794L8.19337 19.0378ZM8.46447 19.7782L9.3769 18.8657L7.96269 17.4515L7.05026 18.3639L8.46447 19.7782ZM5.63604 19.7782C6.41709 20.5592 7.68342 20.5592 8.46447 19.7781L7.05026 18.3639L5.63604 19.7782ZM4.22183 18.3639L5.63604 19.7782L7.05026 18.3639L5.63604 16.9497L4.22183 18.3639ZM4.22183 15.5355C3.44078 16.3166 3.44078 17.5829 4.22183 18.3639L5.63604 16.9497V16.9497L4.22183 15.5355ZM5.13427 14.6231L4.22183 15.5355L5.63604 16.9497L6.54849 16.0373L5.13427 14.6231ZM4.33144 14.2852C4.48996 14.8179 4.70234 15.3271 4.96217 15.8066L6.7206 14.8537C6.52589 14.4944 6.36693 14.1132 6.24835 13.7147L4.33144 14.2852ZM5.28989 13H4V15H5.28989V13ZM4 13H4H2C2 14.1046 2.89543 15 4 15V13ZM4 13V11H2V13H4ZM4 11V9C2.89543 9 2 9.89543 2 11H4ZM4 11H5.28989V9H4V11ZM4.96217 8.1934C4.70235 8.67288 4.48996 9.18213 4.33144 9.71475L6.24835 10.2852C6.36693 9.88681 6.52589 9.50558 6.7206 9.14625L4.96217 8.1934ZM4.22183 8.46449L5.13428 9.37693L6.54849 7.96272L5.63605 7.05027L4.22183 8.46449ZM4.22183 5.63606C3.44078 6.41711 3.44079 7.68344 4.22183 8.46449L5.63605 7.05027L5.63605 7.05027L4.22183 5.63606ZM5.63605 4.22185L4.22183 5.63606L5.63605 7.05027L7.05026 5.63606L5.63605 4.22185ZM8.46447 4.22185C7.68343 3.4408 6.4171 3.4408 5.63605 4.22185L7.05026 5.63606V5.63606L8.46447 4.22185ZM9.37691 5.13428L8.46447 4.22185L7.05026 5.63606L7.9627 6.54849L9.37691 5.13428ZM9.71477 4.33143C9.18213 4.48995 8.67287 4.70234 8.19337 4.96218L9.14623 6.7206C9.50557 6.52588 9.88681 6.36692 10.2853 6.24833L9.71477 4.33143ZM9.00002 4V5.28988H11V4H9.00002Z" fill="currentColor"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  var openSvg = `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-60.000000, -1879.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M13.978,1730.401 L12.596,1729.007 L6,1735.656 L6,1733 L4,1733 L4,1739 L10.071,1739 L10.101,1737 L7.344,1737 L13.978,1730.401 Z M24,1725.08 L24,1739 L12,1739 L12,1737 L22,1737 L22,1727 L16,1727 L16,1721 L6,1721 L6,1731 L4,1731 L4,1719 L18,1719 L24,1725.08 Z"></path></g></g></g></svg>`;
  var BUTTONS_LIST = [
    // All SVG are with a CC0 or PD license, most found on svgrepo
    {
      name: "newFile",
      defaultTitle: "Create a new file",
      height: "1.3rem",
      svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-420.000000, -8079.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M382,7937 L366,7937 L366,7925.837 L370.837,7921 L382,7921 L382,7937 Z M383.969,7919 L370,7919 L370,7919.009 L364.009,7925 L364,7925 L364,7939 L384,7939 L384,7919 L383.969,7919 Z"></path></g></g></g></svg>`
    },
    {
      name: "previous",
      defaultTitle: "Previous",
      height: "1.4em",
      svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-385.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M338.61,6539 L340,6537.594 L331.739,6528.987 L332.62,6528.069 L332.615,6528.074 L339.955,6520.427 L338.586,6519 C336.557,6521.113 330.893,6527.014 329,6528.987 C330.406,6530.453 329.035,6529.024 338.61,6539"></path></g></g></g></svg>`
    },
    {
      name: "next",
      defaultTitle: "Next",
      height: "1.4em",
      svg: `<svg width="800px" height="800px" viewBox="-4.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-425.000000, -6679.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M370.39,6519 L369,6520.406 L377.261,6529.013 L376.38,6529.931 L376.385,6529.926 L369.045,6537.573 L370.414,6539 C372.443,6536.887 378.107,6530.986 380,6529.013 C378.594,6527.547 379.965,6528.976 370.39,6519"></path </g></g></g></svg>`
    },
    {
      name: "undo",
      defaultTitle: "Undo",
      height: "1.8rem",
      svg: `<svg fill="currentColor" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`
    },
    {
      name: "redo",
      defaultTitle: "Redo",
      height: "1.8rem",
      svg: `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`
    },
    {
      name: "clear",
      defaultTitle: "Clear",
      height: "1.5em",
      svg: clearSvg
    },
    {
      name: "upload",
      defaultTitle: "Load",
      height: "1.4rem",
      svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-300.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M254.006515,3325.00497 L250.302249,3328.71065 L251.715206,3330.12415 L253.007252,3328.83161 L253.007252,3339 L255.005777,3339 L255.005777,3328.83161 L256.297824,3330.12415 L257.710781,3328.71065 L254.006515,3325.00497 Z M262.281407,3331.70459 C260.525703,3333.21505 258.787985,3333.00213 257.004302,3333.00213 L257.004302,3331.00284 C258.859932,3331.00284 259.724294,3331.13879 260.728553,3330.45203 C263.14477,3328.79962 261.8847,3324.908 258.902901,3325.01496 C257.570884,3318.41131 247.183551,3320.64551 249.247028,3327.4451 C246.618968,3325.35484 243.535244,3331.00284 249.116125,3331.00284 L251.008728,3331.00284 L251.008728,3333.00213 L248.211792,3333.00213 C244.878253,3333.00213 242.823769,3329.44339 244.73236,3326.72236 C245.644687,3325.42282 247.075631,3325.10193 247.075631,3325.10193 C247.735144,3319.99075 253.568838,3317.29171 257.889649,3320.18468 C259.74428,3321.42724 260.44776,3323.24259 260.44776,3323.24259 C264.159021,3324.37019 265.278195,3329.1265 262.281407,3331.70459 L262.281407,3331.70459 Z"></path></g></g></g></svg>`
    },
    {
      name: "open",
      defaultTitle: "Open",
      height: "1.2rem",
      svg: openSvg
    },
    {
      name: "download",
      defaultTitle: "Download",
      height: "1.4rem",
      svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-340.000000, -3479.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M297.995199,3334.46886 C297.995199,3334.07649 296.972565,3334.08051 296.583086,3334.47187 L295.852063,3335.20843 C295.537483,3335.52452 294.999203,3335.30275 294.999203,3334.8552 L294.999203,3326.03153 C294.999203,3325.48162 294.600735,3325.03708 294.055464,3325.03005 C293.508195,3325.03708 293.001872,3325.48162 293.001872,3326.03153 L293.001872,3334.8552 C293.001872,3335.30275 292.463591,3335.52653 292.149011,3335.21043 L291.417988,3334.26715 C291.028509,3333.87579 290.40634,3334.05943 290.016861,3334.05943 L290.010869,3334.05943 C289.621389,3335.06292 289.618393,3335.29473 290.008871,3335.68609 L292.589423,3338.38547 C293.36938,3339.16919 294.633691,3339.22137 295.413649,3338.43765 L297.995199,3335.86872 C298.385677,3335.47636 297.995199,3334.85419 297.995199,3334.46283 L297.995199,3334.46886 Z M294.044478,3325.02805 C294.048473,3325.02805 294.051469,3325.03005 294.055464,3325.03005 C294.059458,3325.03005 294.062454,3325.02805 294.066449,3325.02805 L294.044478,3325.02805 Z M297.995199,3333.05595 C297.443936,3333.05595 296.996533,3332.60638 296.996533,3332.05246 C296.996533,3331.49853 297.443936,3331.04897 297.995199,3331.04897 L298.888006,3331.04897 C303.142321,3331.04897 302.833733,3324.89559 298.893998,3325.03808 C297.547797,3318.33479 287.212608,3320.75419 289.243893,3327.47756 C287.168667,3325.8198 284.677995,3329.02795 286.79916,3330.61145 C288.298157,3331.73134 291.004541,3330.19902 291.004541,3332.05246 C291.004541,3333.31484 289.578446,3333.05595 288.209276,3333.05595 C284.877728,3333.05595 282.824472,3329.48353 284.731923,3326.75204 C285.643704,3325.4475 287.073793,3325.12539 287.073793,3325.12539 C287.732913,3319.99456 293.563122,3317.28514 297.881351,3320.18923 C299.734874,3321.43657 300.437935,3323.2589 300.437935,3323.2589 C301.527479,3323.59206 302.46223,3324.28246 303.098379,3325.19663 C305.240517,3328.27332 303.575742,3333.05595 297.995199,3333.05595 L297.995199,3333.05595 Z"></path></g></g></g></svg>`
    },
    {
      name: "quick-save",
      defaultTitle: "Quick Save",
      height: "1.4em",
      svg: `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3H7.99998L5 12H9.99998L7.99998 22L21 8H14.5L16 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    {
      name: "save",
      defaultTitle: "Save As",
      height: "1.3em",
      svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-99.000000, -680.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M50.21875,525 L52.31875,525 L52.31875,523 L50.21875,523 L50.21875,525 Z M61.9,538 L59.8,538 L59.8,532 L58.88125,532 L57.7,532 L49.3,532 L47.5276,532 L47.2,532 L47.2,538 L45.1,538 L45.1,526.837 L47.2,524.837 L47.2,528 L48.11875,528 L49.3,528 L57.7,528 L59.47135,528 L59.8,528 L59.8,522 L61.9,522 L61.9,538 Z M49.3,538 L57.7,538 L57.7,534 L49.3,534 L49.3,538 Z M49.3,522.837 L50.17885,522 L57.7,522 L57.7,526 L49.3,526 L49.3,522.837 Z M63.9664,520 L61.8664,520 L49.3,520 L49.3,520.008 L47.2084,522 L47.2,522 L47.2,522.008 L43.0084,526 L43,526 L43,538 L43,540 L45.1,540 L61.8664,540 L63.9664,540 L64,540 L64,538 L64,522 L64,520 L63.9664,520 Z"></path></g></g></g></svg>`
    },
    {
      name: "fullscreen",
      defaultTitle: "Toggle fullscreen",
      height: "1.3em",
      svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-300.000000, -4199.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M262.4445,4039 L256.0005,4039 L256.0005,4041 L262.0005,4041 L262.0005,4047 L264.0005,4047 L264.0005,4039.955 L264.0005,4039 L262.4445,4039 Z M262.0005,4057 L256.0005,4057 L256.0005,4059 L262.4445,4059 L264.0005,4059 L264.0005,4055.955 L264.0005,4051 L262.0005,4051 L262.0005,4057 Z M246.0005,4051 L244.0005,4051 L244.0005,4055.955 L244.0005,4059 L246.4445,4059 L252.0005,4059 L252.0005,4057 L246.0005,4057 L246.0005,4051 Z M246.0005,4047 L244.0005,4047 L244.0005,4039.955 L244.0005,4039 L246.4445,4039 L252.0005,4039 L252.0005,4041 L246.0005,4041 L246.0005,4047 Z"></path></g></g></g></svg>`
    },
    {
      name: "code",
      height: "1.3em",
      svg: codeImgSvg
    },
    {
      name: "minimize",
      defaultTitle: "Minimize",
      height: "1.4rem",
      svg: `<svg width="800px" height="800px" viewBox="0 -2.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-259.000000, -242.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M205.1,96 L221.9,96 L221.9,84 L205.1,84 L205.1,96 Z M203,98 L224,98 L224,82 L203,82 L203,98 Z M208.25,91 L218.75,91 L218.75,89 L208.25,89 L208.25,91 Z"></path></g></g></g></svg>`
    },
    {
      name: "close",
      defaultTitle: "Close",
      height: "1.4rem",
      svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-139.000000, -160.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M85.1,18 L101.9,18 L101.9,2 L85.1,2 L85.1,18 Z M83,20 L104,20 L104,0 L83,0 L83,20 Z M89.7872,11.856 L92.01425,9.735 L89.7872,7.613 L91.2719,6.199 L93.5,8.321 L95.72705,6.199 L97.21175,7.613 L94.9847,9.735 L97.21175,11.856 L95.72705,13.27 L93.5,11.149 L91.2719,13.27 L89.7872,11.856 Z"></path></g></g></g></svg>`
    },
    {
      name: "deactivate",
      defaultTitle: "Deactivate",
      height: "1.4rem",
      svg: `<svg fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 389 389" xml:space="preserve"><g><g><g><path d="M379,326.035h-18.852c-5.522,0-10,4.477-10,10v14.111h-14.113c-5.522,0-10,4.477-10,10V379c0,5.523,4.478,10,10,10H379     c5.522,0,10-4.477,10-10v-42.965C389,330.512,384.522,326.035,379,326.035z"/><path d="M166.927,350.146h-58.813c-5.522,0-10,4.477-10,10V379c0,5.523,4.478,10,10,10h58.813c5.522,0,10-4.477,10-10v-18.854     C176.927,354.623,172.449,350.146,166.927,350.146z"/><path d="M280.887,350.146h-58.812c-5.523,0-10,4.477-10,10V379c0,5.523,4.477,10,10,10h58.812c5.522,0,10-4.477,10-10v-18.854     C290.887,354.623,286.409,350.146,280.887,350.146z"/><path d="M52.965,350.146H38.852v-14.111c0-5.523-4.478-10-10-10H10c-5.522,0-10,4.477-10,10V379c0,5.523,4.478,10,10,10h42.965     c5.521,0,10-4.477,10-10v-18.854C62.965,354.623,58.486,350.146,52.965,350.146z"/><path d="M10,290.886h18.852c5.522,0,10-4.477,10-10v-58.812c0-5.523-4.478-10-10-10H10c-5.522,0-10,4.477-10,10v58.812     C0,286.409,4.478,290.886,10,290.886z"/><path d="M10,176.926h18.852c5.522,0,10-4.477,10-10v-58.812c0-5.523-4.478-10-10-10H10c-5.522,0-10,4.477-10,10v58.812     C0,172.449,4.478,176.926,10,176.926z"/><path d="M52.965,0H10C4.478,0,0,4.477,0,10v42.967c0,5.523,4.478,10,10,10h18.852c5.522,0,10-4.477,10-10V38.854h14.113     c5.521,0,10-4.477,10-10V10C62.965,4.478,58.486,0,52.965,0z"/><path d="M280.887,0h-58.812c-5.522,0-10,4.477-10,10v18.854c0,5.523,4.478,10,10,10h58.812c5.522,0,10-4.477,10-10V10     C290.887,4.478,286.409,0,280.887,0z"/><path d="M108.113,38.854h58.813c5.522,0,10-4.477,10-10V10c0-5.523-4.478-10-10-10h-58.813c-5.522,0-10,4.477-10,10v18.854     C98.113,34.377,102.591,38.854,108.113,38.854z"/><path d="M379,0h-42.965c-5.522,0-10,4.477-10,10v18.854c0,5.523,4.478,10,10,10h14.113v14.113c0,5.523,4.478,10,10,10H379     c5.522,0,10-4.477,10-10V10C389,4.478,384.522,0,379,0z"/><path d="M379,212.074h-18.852c-5.522,0-10,4.477-10,10v58.812c0,5.522,4.478,10,10,10H379c5.522,0,10-4.478,10-10v-58.812     C389,216.551,384.522,212.074,379,212.074z"/><path d="M379,98.114h-18.852c-5.522,0-10,4.477-10,10v58.812c0,5.523,4.478,10,10,10H379c5.522,0,10-4.477,10-10v-58.812     C389,102.591,384.522,98.114,379,98.114z"/></g></g></g></svg>`
    },
    {
      name: "retry",
      defaultTitle: "Retry",
      height: "1.4rem",
      svg: `<svg width="800px" height="800px" viewBox="-1 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-342.000000, -7080.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M300.002921,6930.85894 C299.524118,6934.16792 296.32507,6936.61291 292.744585,6935.86392 C290.471022,6935.38792 288.623062,6933.55693 288.145263,6931.29294 C287.32919,6927.42196 290.007276,6923.99998 294.022397,6923.99998 L294.022397,6925.99997 L299.041299,6922.99998 L294.022397,6920 L294.022397,6921.99999 C289.003495,6921.99999 285.16002,6926.48297 286.158782,6931.60494 C286.767072,6934.72392 289.294592,6937.23791 292.425383,6937.8439 C297.170253,6938.7619 301.37007,6935.51592 301.990406,6931.12594 C302.074724,6930.52994 301.591905,6929.99995 300.988633,6929.99995 L300.989637,6929.99995 C300.490758,6929.99995 300.074189,6930.36694 300.002921,6930.85894"></path></g></g></g></svg>`
    }
  ];
  var BUTTONS_BY_NAME = BUTTONS_LIST.reduce((acc, val) => {
    acc[val.name] = val;
    return acc;
  }, {});
  var APP_STYLE = {
    fontSize: {
      cssProp: "var(--font-size)",
      cssName: "--font-size"
    },
    windowActiveHeader: {
      cssProp: "var(--window-active-header)",
      cssName: "--window-active-header"
    },
    windowActiveHeaderText: {
      cssProp: "var(--window-active-header-text)",
      cssName: "--window-active-header-text"
    },
    windowInactiveHeader: {
      cssProp: "var(--window-inactive-header)",
      cssName: "--window-inactive-header"
    },
    windowInactiveHeaderText: {
      cssProp: "var(--window-inactive-header-text)",
      cssName: "--window-inactive-header-text"
    },
    textColor: {
      cssProp: "var(--window-text-color)",
      cssName: "--window-text-color"
    },
    bgColor: {
      cssProp: "var(--window-content-bg)",
      cssName: "--window-content-bg"
    },
    lineColor: {
      cssProp: "var(--window-line-color)",
      cssName: "--window-line-color"
    },
    primaryColor: {
      cssProp: "var(--app-primary-color)",
      cssName: "--app-primary-color"
    },
    disabledColor: {
      cssProp: "var(--app-primary-bg)",
      cssName: "--app-primary-bg"
    },
    barBg: {
      cssProp: "var(--window-sidebar-bg)",
      cssName: "--window-sidebar-bg"
    },
    barHoverBg: {
      cssProp: "var(--sidebar-hover-bg)",
      cssName: "--sidebar-hover-bg"
    },
    barSelectedBg: {
      cssProp: "var(--sidebar-selected-bg-color)",
      cssName: "--sidebar-selected-bg-color"
    },
    barSelectedText: {
      cssProp: "var(--sidebar-selected-text-color)",
      cssName: "--sidebar-selected-text-color"
    }
  };

  // src/shared_reference.mjs
  var SharedReference = class {
    /**
     * Create a `SharedReference` object encapsulating the mutable `initialValue`
     * value of type T.
     * @param {*} initialValue
     * @param {AbortSignal|undefined} [abortSignal] - If set, the created shared
     * reference will be automatically "finished" once that signal emits.
     * Finished references won't be able to update their value anymore, and will
     * also automatically have their listeners (callbacks linked to value change)
     * removed - as they cannot be triggered anymore, thus providing a security
     * against memory leaks.
     */
    constructor(initialValue, abortSignal) {
      this._value = initialValue;
      this._listeners = [];
      this._isFinished = false;
      this._onFinishCbs = [];
      if (abortSignal !== void 0) {
        const onAbort = () => this.finish();
        abortSignal.addEventListener("abort", onAbort);
        this._deregisterCancellation = () => {
          abortSignal.removeEventListener("abort", onAbort);
        };
      }
    }
    /**
     * Returns the current value of this shared reference.
     * @returns {*}
     */
    getValue() {
      return this._value;
    }
    /**
     * Update the value of this shared reference.
     * @param {*} newVal
     */
    setValue(newVal) {
      if (this._isFinished) {
        return;
      }
      this._value = newVal;
      if (this._listeners.length === 0) {
        return;
      }
      const clonedCbs = this._listeners.slice();
      for (const cbObj of clonedCbs) {
        try {
          if (!cbObj.hasBeenCleared) {
            cbObj.trigger(newVal, cbObj.complete);
          }
        } catch (_) {
        }
      }
    }
    /**
     * Update the value of this shared reference only if the value changed.
     *
     * Note that this function only performs a strict equality reference through
     * the "===" operator. Different objects that are structurally the same will
     * thus be considered different.
     * @param {*} newVal
     */
    setValueIfChanged(newVal) {
      if (newVal !== this._value) {
        this.setValue(newVal);
      }
    }
    /**
     * Allows to register a callback to be called each time the value inside the
     * reference is updated.
     * @param {Function} cb - Callback to be called each time the reference is
     * updated. Takes as first argument its new value and in second argument a
     * callback allowing to unregister the callback.
     * @param {Object} [params={}]
     * @param {AbortSignal} [params.clearSignal] - Allows to provide an AbortSignal
     * which will unregister the callback when it emits.
     * @param {boolean|undefined} [params.emitCurrentValue] - If `true`, the
     * callback will also be immediately called with the current value.
     */
    onUpdate(cb, params = {}) {
      const unlisten = () => {
        if (params.clearSignal !== void 0) {
          params.clearSignal.removeEventListener("abort", unlisten);
        }
        if (cbObj.hasBeenCleared) {
          return;
        }
        cbObj.hasBeenCleared = true;
        const indexOf = this._listeners.indexOf(cbObj);
        if (indexOf >= 0) {
          this._listeners.splice(indexOf, 1);
        }
      };
      const cbObj = { trigger: cb, complete: unlisten, hasBeenCleared: false };
      this._listeners.push(cbObj);
      if (params.emitCurrentValue === true) {
        cb(this._value, unlisten);
      }
      if (this._isFinished || cbObj.hasBeenCleared) {
        unlisten();
        return;
      }
      if (params.clearSignal !== void 0) {
        params.clearSignal.addEventListener("abort", unlisten);
      }
    }
    /**
     * Variant of `onUpdate` which will only call the callback once, once the
     * value inside the reference is different from `undefined`.
     * The callback is called synchronously if the value already isn't set to
     * `undefined`.
     *
     * This method can be used as a lighter weight alternative to `onUpdate` when
     * just waiting that the stored value becomes defined.
     * As such, it is an explicit equivalent to something like:
     * ```js
     * myReference.onUpdate((newVal, stopListening) => {
     *  if (newVal !== undefined) {
     *    stopListening();
     *
     *    // ... do the logic
     *  }
     * }, { emitCurrentValue: true });
     * ```
     * @param {Function} cb - Callback to be called each time the reference is
     * updated. Takes the new value in argument.
     * @param {Object} params
     * @param {AbortSignal} params.clearSignal - Allows to provide an AbortSignal
     * which will unregister the callback when it emits.
     */
    waitUntilDefined(cb, params) {
      this.onUpdate(
        (val, stopListening) => {
          if (val !== void 0) {
            stopListening();
            cb(this._value);
          }
        },
        { clearSignal: params.clearSignal, emitCurrentValue: true }
      );
    }
    /**
     * Allows to register a callback for when the Shared Reference is "finished".
     *
     * This function is mostly there for implementing operators on the shared
     * reference and isn't meant to be used by regular code, hence it being
     * prefixed by `_`.
     * @param {Function} cb - Callback to be called once the reference is
     * finished.
     * @param {AbortSignal} onFinishCancelSignal - Allows to provide an
     * AbortSignal * which will unregister the callback when it emits.
     */
    _onFinished(cb, onFinishCancelSignal) {
      if (onFinishCancelSignal.aborted) {
        return noop;
      }
      const cleanUp = () => {
        const indexOf = arrayFindIndex(
          this._onFinishCbs,
          (x) => x.trigger === trigger
        );
        if (indexOf >= 0) {
          this._onFinishCbs[indexOf].hasBeenCleared = true;
          this._onFinishCbs.splice(indexOf, 1);
        }
      };
      const trigger = () => {
        cleanUp();
        cb();
      };
      onFinishCancelSignal.addEventListener("abort", cleanUp);
      const deregisterCancellation = () => {
        onFinishCancelSignal.removeEventListener("abort", cleanUp);
      };
      this._onFinishCbs.push({ trigger, hasBeenCleared: false });
      return deregisterCancellation;
    }
    /**
     * Indicate that no new values will be emitted.
     * Allows to automatically free all listeners linked to this reference.
     */
    finish() {
      if (this._deregisterCancellation !== void 0) {
        this._deregisterCancellation();
      }
      this._isFinished = true;
      const clonedCbs = this._listeners.slice();
      for (const cbObj of clonedCbs) {
        try {
          if (!cbObj.hasBeenCleared) {
            cbObj.complete();
            cbObj.hasBeenCleared = true;
          }
        } catch (_) {
        }
      }
      this._listeners.length = 0;
      if (this._onFinishCbs.length > 0) {
        const clonedFinishedCbs = this._onFinishCbs.slice();
        for (const cbObj of clonedFinishedCbs) {
          try {
            if (!cbObj.hasBeenCleared) {
              cbObj.trigger();
              cbObj.hasBeenCleared = true;
            }
          } catch (_) {
          }
        }
        this._onFinishCbs.length = 0;
      }
    }
  };

  // src/settings.mjs
  var DEFAULT_WALLPAPER = IMAGE_ROOT_PATH + "photo-1464822759023-fed622ff2c3b.jpg";
  var DEFAULT_FONT_SIZE = 14;
  var DEFAULT_TASKBAR_OPACITY = 57;
  var DEFAULT_ICON_IMAGE_OPACITY = 25;
  var DEFAULT_ICON_HOVER_OPACITY = 25;
  var DEFAULT_ICON_ACTIVE_OPACITY = 30;
  var DEFAULT_TASK_BG_COLOR = "#1a2e4b";
  var DEFAULT_TASK_TEXT_COLOR = "#ffffff";
  var DEFAULT_TASK_HOVER_COLOR = "#2196f3";
  var DEFAULT_TASK_ACTIVE_BG_COLOR = "#3498db";
  var DEFAULT_TASK_INACTIVE_BG_COLOR = "#263b59";
  var DEFAULT_START_MENU_TEXT = "#000000";
  var DEFAULT_START_MENU_BG = "#f5f5f5";
  var DEFAULT_START_MENU_ACTIVE_BG = "#e0e0e0";
  var DEFAULT_START_ICON_BG = "#e0e0e0";
  var DEFAULT_WINDOW_ACTIVE_HEADER = "#0F4774";
  var DEFAULT_WINDOW_ACTIVE_HEADER_TEXT = "#FFFFFF";
  var DEFAULT_WINDOW_INACTIVE_HEADER = "#737373";
  var DEFAULT_WINDOW_INACTIVE_HEADER_TEXT = "#FFFFFF";
  var DEFAULT_WINDOW_TEXT_COLOR = "#333333";
  var DEFAULT_WINDOW_CONTENT_BG = "#FFFFFF";
  var DEFAULT_WINDOW_LINE_COLOR = "#dddddd";
  var DEFAULT_APP_PRIMARY_COLOR = "#3498db";
  var DEFAULT_APP_PRIMARY_BG_COLOR = "#efefef";
  var DEFAULT_WINDOW_SIDEBAR_BG = "#E0E0E0";
  var DEFAULT_SIDEBAR_HOVER_BG = "#c8c8c8";
  var DEFAULT_SIDEBAR_SELECTED_BG_COLOR = "#3498db";
  var DEFAULT_SIDEBAR_SELECTED_TEXT_COLOR = "#ffffff";
  var DEFAULT_ICON_ACTIVE_TEXT_COLOR = "#ffffff";
  var DEFAULT_ICON_INACTIVE_TEXT_COLOR = "#ffffff";
  var DEFAULT_ICON_BG_COLOR = "#ffffff";
  var DEFAULT_ICON_HOVER_COLOR = "#ffffff";
  var DEFAULT_ICON_ACTIVE_COLOR = "#ffffff";
  var DEFAULT_WINDOW_BORDER_SIZE = 0;
  var DEFAULT_SPACE_BETWEEN_TASKS = 5;
  var DEFAULT_TASKBAR_SIZE = 35;
  var DEFAULT_WINDOW_HEADER_HEIGHT = 35;
  var DEFAULT_WINDOW_BUTTON_SIZE = 18;
  var APP_STYLE_SETTINGS = {};
  var allRefsAndDefaults = [];
  var taskbarSizeContext;
  var taskbarLocation = createRefForState(
    null,
    "taskbar-location",
    "bottom",
    (val) => {
      requestAnimationFrame(() => {
        const sizeIsCurrentlyForHorizontal = ["top", "bottom"].includes(
          taskbarSizeContext
        );
        const isCurrentlyHorizontal = ["top", "bottom"].includes(
          SETTINGS.taskbarLocation.getValue()
        );
        if (sizeIsCurrentlyForHorizontal !== isCurrentlyHorizontal) {
          const currentTaskbarSize = SETTINGS.taskbarSize.getValue();
          let newSize;
          if (isCurrentlyHorizontal) {
            const percent = (currentTaskbarSize - TASKBAR_MIN_VERTICAL_SIZE) / (TASKBAR_MAX_VERTICAL_SIZE - TASKBAR_MIN_VERTICAL_SIZE);
            newSize = percent * (TASKBAR_MAX_HORIZONTAL_SIZE - TASKBAR_MIN_HORIZONTAL_SIZE) + TASKBAR_MIN_HORIZONTAL_SIZE;
          } else {
            const percent = (currentTaskbarSize - TASKBAR_MIN_HORIZONTAL_SIZE) / (TASKBAR_MAX_HORIZONTAL_SIZE - TASKBAR_MIN_HORIZONTAL_SIZE);
            newSize = percent * (TASKBAR_MAX_VERTICAL_SIZE - TASKBAR_MIN_VERTICAL_SIZE) + TASKBAR_MIN_VERTICAL_SIZE;
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
    }
  );
  var SETTINGS = {
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
      true
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
            String(size) + "px"
          );
        });
      }
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
      }
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
      }
    ),
    moveAroundIcons: createRefForState(null, "move-icons", true),
    dblClickHeaderFullScreen: createRefForState(
      null,
      "dbl-click-header-full-screen",
      true
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
      }
    ),
    /**
     * If `true`, windows `left` and `top` position won't change on resize.
     * If `false`, they will be considered relative to the current page's
     * dimensions and as such update on resize.
     */
    absoluteWindowPositioning: createRefForState(
      null,
      "absolute-window-positioning",
      true
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
    startMenuPic: createRefForState(null, "start-menu-pic", "\u{1F680}", (pic) => {
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
        value: DEFAULT_WALLPAPER
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
      }
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
            SETTINGS.taskbarBgColor.getValue() + percentageToHex(opacityPercent)
          );
          document.documentElement.style.setProperty(
            "--taskbar-inactive-bg",
            SETTINGS.taskbarInactiveBgColor.getValue() + percentageToHex(opacityPercent)
          );
        });
      }
    ),
    taskbarActiveAppOpacity: createRefForState(
      null,
      "taskbar-active-opacity",
      DEFAULT_TASKBAR_OPACITY,
      (opacityPercent) => {
        window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty(
            "--taskbar-active-bg",
            SETTINGS.taskbarActiveBgColor.getValue() + percentageToHex(opacityPercent)
          );
        });
      }
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
            color + percentageToHex(SETTINGS.taskbarOpacity.getValue())
          );
        });
      }
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
      }
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
      }
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
            color + percentageToHex(SETTINGS.taskbarActiveAppOpacity.getValue())
          );
        });
      }
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
            color + percentageToHex(SETTINGS.taskbarOpacity.getValue())
          );
        });
      }
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
      }
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
      }
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
            color
          );
        });
      }
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
      }
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
      }
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
            String(margin) + "px"
          );
        });
      }
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
            String(height) + "px"
          );
        });
      }
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
            String(height) + "px"
          );
        });
      }
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
            String(height) + "px"
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            color
          );
        });
      }
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
            String(size) + "px"
          );
        });
      }
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
            SETTINGS.iconHoverBgColor.getValue() + percentageToHex(opacityPercent)
          );
        });
      }
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
            SETTINGS.iconImageBgColor.getValue() + percentageToHex(opacityPercent)
          );
        });
      }
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
            SETTINGS.iconActiveBgColor.getValue() + percentageToHex(opacityPercent)
          );
        });
      }
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
      }
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
            color
          );
        });
      }
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
            color + percentageToHex(SETTINGS.iconActiveOpacity.getValue())
          );
        });
      }
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
            color + percentageToHex(SETTINGS.iconImageBgOpacity.getValue())
          );
        });
      }
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
            color + percentageToHex(SETTINGS.iconHoverOpacity.getValue())
          );
        });
      }
    )
  };
  function percentageToHex(percent) {
    const decimalValue = Math.round(percent / 100 * 255);
    const hex = decimalValue.toString(16).padStart(2, "0");
    return hex;
  }
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
      } catch (_) {
      }
      if (initialValue === void 0) {
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
        } catch (_) {
        }
      },
      { emitCurrentValue: false }
    );
    if (onUpdate) {
      onUpdate(initialValue);
    }
    allRefsAndDefaults.push([ref, defaultVal, localStorageName]);
    return ref;
  }
  function resetStateToDefault() {
    window.requestAnimationFrame(() => {
      allRefsAndDefaults.forEach(([ref, deflt]) => {
        ref.setValueIfChanged(deflt);
      });
      localStorage.clear();
    });
  }
  function setCurrentSettingsInStorage() {
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
      } catch (_) {
      }
    });
  }
  function clearSettingsStorage() {
    localStorage.clear();
  }
  SETTINGS.resetStateToDefault = resetStateToDefault;

  // src/filesystem/error.mjs
  var FileSystemError = class _FileSystemError extends Error {
    /**
     * @param {string} code
     * @param {string} reason
     * @param {Object|undefined} [context]
     */
    constructor(code, reason) {
      super(`${code}: ${reason}`);
      Object.setPrototypeOf(this, _FileSystemError.prototype);
      this.name = "FileSystemError";
      this.code = code;
    }
  };

  // src/filesystem/utils.mjs
  var DB_NAME = "local_fs";
  var DB_VERSION = 1;
  var METADATA_STORE = "files";
  var CONTENT_STORE = "files_content";
  var APPS_DIR = "/apps/";
  var SYSTEM_DIR = "/system32/";
  var USER_DATA_DIR = "/userdata/";
  var USER_CONFIG_DIR = "/userconfig/";
  var DESKTOP_CONFIG = "default-desktop.json";
  var START_MENU_CONFIG = "start_menu.config.json";
  var PROVIDERS_CONFIG = "providers.config.json";
  var DEFAULT_APPS_CONFIG = "default_apps.config.json";
  var DIR_CONFIG_FILENAME = ".dir_config";
  var RESERVED_NAMES = [DIR_CONFIG_FILENAME, ".", ".."];
  var DEFAULT_MODIFIED_DATE = 1747073021004;
  var textDecoder = new TextDecoder();
  var textEncoder = new TextEncoder();
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db2 = event.target.result;
        const store = db2.createObjectStore(METADATA_STORE, { keyPath: "id" });
        store.createIndex("directory", "directory");
        store.createIndex("fullPath", "fullPath", { unique: true });
        db2.createObjectStore(CONTENT_STORE, { keyPath: "id" });
      };
      request.onsuccess = () => {
        const db2 = request.result;
        resolve(db2);
      };
      request.onerror = () => reject(request.error);
    });
  }
  function getDirPath(path) {
    return path.substring(0, path.lastIndexOf("/") + 1);
  }
  function getName(path) {
    const lastIndexOf = path.lastIndexOf("/");
    if (lastIndexOf === -1) {
      return "";
    }
    if (lastIndexOf === path.length - 1) {
      const substr = path.substring(0, path.length - 1);
      const newLastIndexOf = substr.lastIndexOf("/");
      if (newLastIndexOf === -1 || newLastIndexOf === substr.length - 1) {
        return "";
      }
      return path.substring(newLastIndexOf + 1, lastIndexOf);
    }
    return path.substring(lastIndexOf + 1);
  }
  function pathToId(path) {
    const utf8Bytes = new TextEncoder().encode(path);
    return btoa(String.fromCharCode(...utf8Bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function parseToWantedFormat(data, format) {
    if (format === "arraybuffer") {
      if (typeof data === "string") {
        return textEncoder.encode(data).buffer;
      } else if (data instanceof ArrayBuffer) {
        return data;
      } else if (data instanceof Uint8Array) {
        return data.buffer;
      } else if (typeof data === "object") {
        return textEncoder.encode(JSON.stringify(data, null, 2)).buffer;
      } else {
        throw new Error("Impossible to parse to ArrayBuffer the wanted file");
      }
    }
    if (format === "object") {
      if (typeof data === "string") {
        return JSON.parse(data);
      } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        const decoded = textDecoder.decode(data);
        return JSON.parse(decoded);
      } else if (typeof data === "object") {
        return data;
      } else {
        throw new Error("Impossible to parse to Object the wanted file");
      }
    }
    if (typeof data === "string") {
      return data;
    }
    if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      return textDecoder.decode(data);
    }
    return JSON.stringify(data, null, 2);
  }
  function generateDesktopConfig() {
    const groups = /* @__PURE__ */ new Map();
    return {
      list: generated_apps_default.reduce((acc, app) => {
        if (typeof app.desktop?.group === "string" && app.desktop.group !== "") {
          const existingGroupList = groups.get(app.desktop.group);
          const appArg = {
            path: `/apps/${app.id}.run`,
            title: app.title,
            icon: app.icon
          };
          if (existingGroupList) {
            existingGroupList.push(appArg);
          } else {
            const title = app.desktop.group;
            const icon = app.desktop.group === "External Apps" ? "\u{1F4E1}" : "\u{1F4BD}";
            const newList = [appArg];
            groups.set(app.desktop.group, newList);
            acc.push({
              run: "/apps/app-group.run",
              args: [{ type: "options", icon, title, apps: newList }],
              title,
              icon
            });
          }
        } else if (app.desktop?.display) {
          const path = `/apps/${app.id}.run`;
          acc.push({
            run: path,
            args: [],
            title: app.title,
            icon: app.icon
          });
        }
        return acc;
      }, []),
      version
    };
  }
  function generateStartMenuConfig() {
    const lists = /* @__PURE__ */ new Map();
    return {
      list: generated_apps_default.reduce((acc, app) => {
        const path = `/apps/${app.id}.run`;
        const appObject = {
          type: "application",
          run: path,
          args: [],
          title: app.title,
          icon: app.icon
        };
        if (typeof app.startMenu?.list === "string" && app.startMenu.list !== "") {
          const existinglistList = lists.get(app.startMenu.list);
          if (existinglistList) {
            existinglistList.push(appObject);
          } else {
            const newList = [appObject];
            lists.set(app.startMenu.list, newList);
            acc.push({
              type: "sublist",
              name: app.startMenu.list,
              list: newList
            });
          }
        } else if (app.startMenu?.display) {
          acc.push(appObject);
        }
        return acc;
      }, []),
      version
    };
  }
  function generateProvidersConfig() {
    return generated_apps_default.reduce((acc, app) => {
      if (!Array.isArray(app.provider)) {
        return acc;
      }
      const path = `/apps/${app.id}.run`;
      for (const feature of app.provider) {
        if (acc[feature] !== void 0) {
          acc[feature].push(path);
        } else {
          acc[feature] = [path];
        }
      }
      return acc;
    }, {});
  }
  function generateDefaultAppsConfig() {
    return generated_apps_default.reduce((acc, app) => {
      if (!Array.isArray(app.defaultForExtensions)) {
        return acc;
      }
      const path = `/apps/${app.id}.run`;
      for (const ext of app.defaultForExtensions) {
        if (acc[ext] === void 0) {
          acc[ext] = path;
        }
      }
      return acc;
    }, {});
  }
  function checkWrittenFilePath(path) {
    if (![USER_DATA_DIR, USER_CONFIG_DIR].some((dir) => path.startsWith(dir))) {
      throw new Error(
        "Permission denied: The destination directory is read-only."
      );
    }
    if (path.endsWith("/")) {
      throw new Error("Permission denied: Expected file, got directory.");
    }
    const name = getName(path);
    if (RESERVED_NAMES.includes(name)) {
      throw new Error("Permission denied: Reserved system file name");
    }
    if (/[\x00-\x1F\x7F/\\]/.test(name) || name === "") {
      throw new Error(
        "Unauthorized file name: Please do not use control characters, slash or anti-slash characters."
      );
    }
  }
  function formatWrittenFileContent(content) {
    if (typeof content === "string") {
      return textEncoder.encode(content).buffer;
    } else if (content instanceof ArrayBuffer) {
      return content;
    } else if (content instanceof Uint8Array) {
      return content.buffer;
    } else {
      throw new Error(
        "Invalid format: A file should be a string or an ArrayBuffer"
      );
    }
  }
  function pathJoin(...args) {
    if (args.length === 0) {
      return "";
    }
    let curr = args[0];
    for (let i = 1; i < args.length; i++) {
      const newPart = args[i];
      if (newPart.startsWith("/")) {
        curr = newPart;
      } else if (curr.endsWith("/")) {
        curr += newPart;
      } else {
        curr += "/" + newPart;
      }
    }
    return curr;
  }
  function getContainingDirectory(path) {
    if (path.endsWith("/")) {
      return getDirPath(path.substring(0, path.length - 1));
    }
    return getDirPath(path);
  }
  function isEntryPath(entry, path) {
    if (entry.type !== "directory") {
      return entry.fullPath === path;
    }
    if (!path.endsWith("/")) {
      return false;
    }
    return entry.fullPath + "/" === path;
  }

  // src/filesystem/filesystem_check.mjs
  async function checkAndRepairIntegrity(db2) {
    const beforeTime = performance.now();
    console.debug("IDB fscheck: start", beforeTime);
    const metadata = await getAllMetadata(db2);
    const contentIds = await getAllContentIds(db2);
    if (metadata.length === 0 && contentIds.length === 0) {
      console.debug("IDB fscheck: nothing stored yet");
      return;
    }
    const allItems = await checkReachability(db2, metadata);
    await checkContentIntegrity(db2, metadata, contentIds);
    await checkDirConfigEntries(db2, allItems);
    console.debug("IDB fscheck: done", performance.now() - beforeTime);
  }
  window.check = () => {
    checkAndRepairIntegrity(db);
  };
  async function getAllMetadata(db2) {
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction([METADATA_STORE], "readonly");
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function getAllContentIds(db2) {
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction([CONTENT_STORE], "readonly");
      const store = transaction.objectStore(CONTENT_STORE);
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function checkReachability(db2, metadata) {
    const reachablePaths = /* @__PURE__ */ new Set();
    const allPaths = /* @__PURE__ */ new Map();
    metadata.forEach((entry) => {
      allPaths.set(entry.fullPath, entry);
    });
    reachablePaths.add(USER_DATA_DIR.substring(0, USER_DATA_DIR.length - 1));
    reachablePaths.add(USER_CONFIG_DIR.substring(0, USER_CONFIG_DIR.length - 1));
    metadata.forEach((child) => {
      if (child.directory === USER_DATA_DIR || child.directory === USER_CONFIG_DIR) {
        markReachable(child.fullPath);
      }
    });
    const unreachableEntries = metadata.filter(
      (entry) => !reachablePaths.has(entry.fullPath)
    );
    for (const entry of unreachableEntries) {
      console.info(
        "IDB fscheck: Unreachable entry detected:",
        entry.fullPath,
        entry.directory
      );
      await repairUnreachableEntry(db2, entry, allPaths, reachablePaths);
    }
    return Array.from(allPaths.values());
    function markReachable(path) {
      if (reachablePaths.has(path)) {
        return;
      }
      reachablePaths.add(path);
      const entry = allPaths.get(path);
      if (entry && entry.type === "directory") {
        metadata.forEach((child) => {
          if (child.directory === path + "/") {
            markReachable(child.fullPath);
          }
        });
      }
    }
  }
  async function repairUnreachableEntry(db2, entry, allPaths, reachablePaths) {
    const parentPath = entry.directory;
    if (!allPaths.has(parentPath)) {
      const pathParts = parentPath.split("/").filter((part) => part);
      let currentPath = "";
      for (const part of pathParts) {
        currentPath += "/" + part;
        if (!allPaths.has(currentPath) && (currentPath.startsWith(USER_DATA_DIR) || currentPath.startsWith(USER_CONFIG_DIR))) {
          const newDir = await createMissingDirectory(db2, currentPath);
          allPaths.set(currentPath, newDir);
          reachablePaths.add(currentPath);
          console.info(
            "IDB fscheck: Added missing parent directory:",
            currentPath
          );
        }
      }
      if (allPaths.has(parentPath.substring(0, parentPath.length - 1))) {
        reachablePaths.add(entry.fullPath);
        console.info("IDB fscheck: Entry is now reachable:", entry.fullPath);
      }
    }
  }
  async function createMissingDirectory(db2, fullPath) {
    const dirEntry = {
      id: pathToId(fullPath),
      fullPath,
      directory: getDirPath(fullPath),
      name: getName(fullPath),
      size: 0,
      type: "directory",
      modified: Date.now()
    };
    await saveMetadata(db2, dirEntry);
    await createDirConfigEntry(db2, fullPath);
    return dirEntry;
  }
  async function createDirConfigEntry(db2, directoryPath) {
    const normalizedDir = directoryPath.endsWith("/") ? directoryPath : directoryPath + "/";
    const fullPath = normalizedDir + DIR_CONFIG_FILENAME;
    const id = pathToId(fullPath);
    const configEntry = {
      id,
      fullPath,
      directory: normalizedDir,
      name: DIR_CONFIG_FILENAME,
      size: 0,
      type: "system",
      modified: Date.now()
    };
    await saveMetadata(db2, configEntry);
    return configEntry;
  }
  async function checkContentIntegrity(db2, metadata, contentIdArr) {
    const metadataIds = new Set(metadata.map((m) => m.id));
    const contentIds = new Set(contentIdArr);
    const fileEntries = metadata.filter((m) => m.type === "file");
    const fileIds = new Set(fileEntries.map((f) => f.id));
    const orphanedContent = contentIdArr.filter((id) => !metadataIds.has(id));
    for (const orphan of orphanedContent) {
      console.info("IDB fscheck: Content entry with no metadata found:", orphan);
      await removeOrphanedContent(db2, orphan);
      console.info(
        "IDB fscheck: Removed content entry with no metadata found:",
        orphan
      );
    }
    const filesWithoutContent = fileEntries.filter((f) => !contentIds.has(f.id));
    for (const file of filesWithoutContent) {
      console.info("IDB fscheck: Found file metadata without content", file.id);
      await removeMetadata(db2, file.id);
      console.info(
        "IDB fscheck: Removed metadata entry with no content found:",
        file.id
      );
    }
    const nonFileContent = contentIdArr.filter(
      (cId) => metadataIds.has(cId) && !fileIds.has(cId)
    );
    for (const wrongContent of nonFileContent) {
      console.info("IDB fscheck: Content found for non-file type", wrongContent);
      await removeOrphanedContent(db2, wrongContent);
      console.info(
        "IDB fscheck: Removed Content found for non-file type",
        wrongContent
      );
    }
  }
  async function checkDirConfigEntries(db2, allItems) {
    const directories = allItems.filter((m) => m.type === "directory");
    const systemEntries = allItems.filter((m) => m.type === "system");
    for (const dir of directories) {
      const hasSystemFile = systemEntries.some(
        (s) => s.name === DIR_CONFIG_FILENAME && s.directory === dir.fullPath + "/"
      );
      if (!hasSystemFile) {
        console.info(
          "IDB fscheck: a directory misses its DIR_CONFIG entry",
          dir.fullPath
        );
        await createDirConfigEntry(db2, dir.fullPath);
        console.info(
          "IDB fscheck: created missing DIR_CONFIG entry",
          dir.fullPath
        );
      }
    }
    for (const sysEntry of systemEntries.filter(
      (s) => s.name === DIR_CONFIG_FILENAME
    )) {
      const hasDirectory = directories.some(
        (d) => d.fullPath + "/" === sysEntry.directory
      );
      if (!hasDirectory) {
        console.info(
          "IDB fscheck: DIR_CONFIG entry for no directory",
          sysEntry.fullPath
        );
        await removeMetadata(db2, sysEntry.id);
        console.info(
          "IDB fscheck: removed DIR_CONFIG entry for no directory",
          sysEntry.fullPath
        );
      }
    }
  }
  async function saveMetadata(db2, entry) {
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction([METADATA_STORE], "readwrite");
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  async function removeMetadata(db2, id) {
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction([METADATA_STORE], "readwrite");
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  async function removeOrphanedContent(db2, id) {
    return new Promise((resolve, reject) => {
      const transaction = db2.transaction([CONTENT_STORE], "readwrite");
      const store = transaction.objectStore(CONTENT_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // src/filesystem/filesystem.mjs
  var DesktopFileSystem = class {
    constructor() {
      this._apps = generated_apps_default;
      this._watchedPaths = /* @__PURE__ */ new Map();
      const setUpDb = () => {
        this._dbProm = openDB().then(async (db2) => {
          if (SETTINGS.performFileSystemCheckAtStartup.getValue()) {
            await checkAndRepairIntegrity(db2);
          }
          db2.addEventListener("close", () => {
            setTimeout(setUpDb, 2e3);
          });
          return db2;
        });
      };
      setUpDb();
      this._virtualRootDirs = [APPS_DIR, SYSTEM_DIR];
      this._queue = [];
    }
    repair() {
      return this._scheduleLockingOperation(async () => {
        const db2 = await this._dbProm;
        await checkAndRepairIntegrity(db2);
      });
    }
    /**
     * NOTE: If watching a directory, the callback will trigger only if its
     * content changes or if the directory itself is added/removed/overwritten.
     *
     * @param {string} path
     * @param {Function} cb
     * @param {AbortSignal} abortSignal
     */
    watch(path, cb, abortSignal) {
      if (abortSignal?.aborted) {
        return;
      }
      const cbList = this._watchedPaths.get(path);
      if (!cbList) {
        const cbList2 = [cb];
        this._watchedPaths.set(path, cbList2);
      } else {
        cbList.push(cb);
        this._watchedPaths.set(path, cbList);
      }
      abortSignal?.addEventListener("abort", () => {
        const cbList2 = this._watchedPaths.get(path);
        for (let i = cbList2.length - 1; i >= 0; i--) {
          if (cbList2[i] === cb) {
            cbList2.splice(i, 1);
          }
        }
      });
    }
    async writeFile(path, content) {
      if (!SETTINGS.storeNewDataInIndexedDB.getValue()) {
        throw new FileSystemError(
          "UserSettingsError",
          "User settings forbid creation of new files.\n\nAuthorize the creation of new files in the settings to allow this operation."
        );
      }
      checkWrittenFilePath(path);
      const contentAb = formatWrittenFileContent(content);
      return this._scheduleLockingOperation(
        () => this._writeFileUnchecked(path, contentAb).then(
          () => this._triggerWatchers([path])
        )
      );
    }
    async readDir(dirPath) {
      const normalizedDirPath = dirPath.endsWith("/") ? dirPath : dirPath + "/";
      return this._scheduleLockingOperation(async () => {
        const dirContent = await this._readDirEntries(normalizedDirPath);
        return dirContent.map((d) => {
          return {
            name: d.name,
            type: d.type,
            icon: d.icon,
            modified: d.modified,
            size: d.size
          };
        });
      });
    }
    async stat(filePath) {
      if (filePath.endsWith("/")) {
        throw new FileSystemError(
          "WrongTypeError",
          "Calling stat on a directory instead of a file"
        );
      }
      return this._scheduleLockingOperation(async () => {
        const directory = getDirPath(filePath);
        const dirContent = await this._readDirEntries(directory);
        const result = dirContent.find((x) => isEntryPath(x, filePath));
        if (!result) {
          throw new FileSystemError("NoEntryError", "File not found");
        }
        return {
          name: result.name,
          type: result.type,
          icon: result.icon,
          modified: result.modified,
          size: result.size
        };
      });
    }
    async rmFile(filePath) {
      checkWrittenFilePath(filePath);
      return this._scheduleLockingOperation(
        async () => this._rmFileUnchecked(filePath).then(() => {
          this._triggerWatchers([filePath]);
        })
      );
    }
    // NOTE: It looks complex because it is badly done, I don't know why I
    // particularly failed to do a simple thing on this one
    async mv(srcPath, baseDestPath) {
      if (!SETTINGS.storeNewDataInIndexedDB.getValue()) {
        throw new FileSystemError(
          "UserSettingsError",
          "User settings forbid creation of new files.\n\nAuthorize the creation of new files in the settings to allow this operation."
        );
      }
      let normalizedDest;
      if (!canPathBeUpdated(srcPath)) {
        throw new FileSystemError(
          "PermissionError",
          "The source directory is read-only"
        );
      }
      if (srcPath.endsWith("/")) {
        normalizedDest = baseDestPath.endsWith("/") ? baseDestPath : baseDestPath + "/";
        if (normalizedDest.startsWith(srcPath)) {
          if (normalizedDest === srcPath) {
            return;
          }
          throw new FileSystemError(
            "IllegalOperation",
            "Cannot move directory: moving inside itself"
          );
        }
        if (!canPathBeUpdated(normalizedDest)) {
          throw new FileSystemError(
            "PermissionError",
            "The destination directory is read-only"
          );
        }
      } else {
        normalizedDest = baseDestPath.endsWith("/") ? baseDestPath + getName(srcPath) : baseDestPath;
        if (!canPathBeWrittenIn(normalizedDest)) {
          throw new FileSystemError(
            "PermissionError",
            "The destination directory is read-only"
          );
        }
      }
      const segmentedSrcPath = srcPath.split("/");
      for (const segment of segmentedSrcPath) {
        if (RESERVED_NAMES.includes(segment)) {
          throw new FileSystemError(
            "PermissionError",
            "Tried to move a system file"
          );
        }
      }
      const segmentedDestPath = normalizedDest.split("/");
      for (let segmentI = 0; segmentI < segmentedDestPath.length; segmentI++) {
        const segment = segmentedDestPath[segmentI];
        if (segment === "") {
          if (segmentI === 0) {
            continue;
          } else if (segmentI === segmentedDestPath.length - 1) {
            continue;
          } else {
            throw new FileSystemError("InvalidOperation", "Invalid path");
          }
        }
        if (RESERVED_NAMES.includes(segment)) {
          throw new FileSystemError(
            "IllegalOperation",
            "Destination path contains a reserved name"
          );
        }
        if (/[\x00-\x1F\x7F/\\]/.test(segment)) {
          throw new FileSystemError(
            "InvalidOperation",
            "Unauthorized file name: Please do not use control characters, slash or anti-slash characters."
          );
        }
      }
      const updatedNormalizedPaths = [];
      return this._scheduleLockingOperation(async () => {
        let allEntries;
        if (srcPath.endsWith("/")) {
          const destEntries = await this._readDirEntries(
            getDirPath(normalizedDest.substring(0, normalizedDest.length - 1))
          );
          if (destEntries.some((entry) => isEntryPath(entry, normalizedDest))) {
            throw new FileSystemError(
              "IllegalOperation",
              "Cannot move directory: destination path already exists"
            );
          }
          allEntries = await this._readDirRecursive(srcPath);
        } else {
          const dirContent = await this._readDirEntries(
            getContainingDirectory(srcPath)
          );
          const result = dirContent.find((x) => isEntryPath(x, srcPath));
          if (!result) {
            throw new FileSystemError(
              "NoEntryError",
              "Cannot move file: file not found."
            );
          }
          allEntries = [result];
        }
        const db2 = await this._dbProm;
        await new Promise((resolve, reject) => {
          const tx = db2.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
          tx.onerror = () => reject(
            new FileSystemError(
              "TransactionError",
              tx?.error?.toString?.() ?? "Unknown transaction error"
            )
          );
          tx.oncomplete = () => resolve();
          const metadataStore = tx.objectStore(METADATA_STORE);
          const contentStore = tx.objectStore(CONTENT_STORE);
          if (allEntries.length === 0) {
            throw new FileSystemError(
              "NoEntryError",
              'Cannot move file: Source path: "' + String(srcPath) + '" not found'
            );
          }
          allEntries.forEach((entry) => {
            const originalId = entry.id;
            let newFullPath;
            if (isEntryPath(entry, srcPath)) {
              newFullPath = normalizedDest.endsWith("/") ? normalizedDest.substring(0, normalizedDest.length - 1) : normalizedDest;
            } else {
              newFullPath = pathJoin(
                normalizedDest,
                entry.fullPath.slice(srcPath.length)
              );
            }
            const normalizedNewPath = entry.type === "directory" ? newFullPath + "/" : newFullPath;
            if (isEntryPath(entry, normalizedNewPath)) {
              return;
            }
            const newDir = getContainingDirectory(newFullPath);
            const newId = pathToId(newFullPath);
            if (entry.type !== "system") {
              updatedNormalizedPaths.push(
                entry.type === "directory" ? entry.fullPath + "/" : entry.fullPath
              );
              updatedNormalizedPaths.push(normalizedNewPath);
            }
            metadataStore.put({
              ...entry,
              id: newId,
              fullPath: newFullPath,
              directory: newDir,
              name: getName(newFullPath)
            });
            metadataStore.delete(originalId);
            if (entry.type === "file") {
              const getRequest = contentStore.get(originalId);
              getRequest.onsuccess = () => {
                if (getRequest.result) {
                  contentStore.put({
                    id: newId,
                    content: getRequest.result.content
                  });
                  contentStore.delete(originalId);
                }
              };
            }
          });
        });
      }).then(() => {
        this._triggerWatchers(updatedNormalizedPaths);
      }).catch((err) => {
        this._triggerWatchers(updatedNormalizedPaths);
        throw err;
      });
    }
    async rmDir(path) {
      const normalizedPath = path.endsWith("/") ? path : path + "/";
      if (!canPathBeUpdated(normalizedPath)) {
        throw new FileSystemError(
          "PermissionError",
          "This directory is read-only"
        );
      }
      const updatedNormalizedPaths = [];
      return this._scheduleLockingOperation(async () => {
        const db2 = await this._dbProm;
        const allEntries = await this._readDirRecursive(normalizedPath);
        return new Promise((resolve, reject) => {
          const tx = db2.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
          tx.onerror = () => reject(
            new FileSystemError(
              "TransactionError",
              tx?.error?.toString?.() ?? "Unknown transaction error"
            )
          );
          tx.oncomplete = () => resolve();
          const metadataStore = tx.objectStore(METADATA_STORE);
          const contentStore = tx.objectStore(CONTENT_STORE);
          allEntries.forEach((entry) => {
            const originalId = pathToId(entry.fullPath);
            if (entry.type !== "system") {
              updatedNormalizedPaths.push(
                entry.type === "directory" ? entry.fullPath + "/" : entry.fullPath
              );
            }
            metadataStore.delete(originalId);
            if (entry.type !== "directory") {
              const getRequest = contentStore.get(originalId);
              getRequest.onsuccess = () => {
                if (getRequest.result) {
                  contentStore.delete(originalId);
                }
              };
            }
          });
        });
      }).then(() => {
        this._triggerWatchers(updatedNormalizedPaths);
      }).catch((err) => {
        this._triggerWatchers(updatedNormalizedPaths);
        throw err;
      });
    }
    /**
     * @param {string} path
     * @returns {Promise.<ArrayBuffer|string|Object>}
     */
    async readFile(path, format) {
      if (path.endsWith("/")) {
        throw new FileSystemError(
          "WrongTypeError",
          "Calling `readFile` to read a directory. Use `readDir` instead."
        );
      }
      if (path.startsWith(APPS_DIR)) {
        const wantedApp = path.substring(
          APPS_DIR.length,
          path.length - ".run".length
        );
        for (const app of this._apps) {
          if (app.id === wantedApp) {
            return parseToWantedFormat(app, format);
          }
        }
        throw new FileSystemError("NoEntryError", "File not found: " + path);
      }
      if (path.startsWith(SYSTEM_DIR)) {
        const wantedFile = path.substring(SYSTEM_DIR.length);
        try {
          if (wantedFile === DESKTOP_CONFIG) {
            const desktopConfig = generateDesktopConfig();
            return parseToWantedFormat(desktopConfig, format);
          }
          if (wantedFile === START_MENU_CONFIG) {
            const startMenuConfig = generateStartMenuConfig();
            return parseToWantedFormat(startMenuConfig, format);
          }
          if (wantedFile === PROVIDERS_CONFIG) {
            const providersConfig = generateProvidersConfig();
            return parseToWantedFormat(providersConfig, format);
          }
          if (wantedFile === DEFAULT_APPS_CONFIG) {
            const defaultAppsConfig = generateDefaultAppsConfig();
            return parseToWantedFormat(defaultAppsConfig, format);
          }
        } catch (err) {
          throw new FileSystemError(
            "ParsingError",
            "Impossible to read corrupted file: " + path
          );
        }
        throw new FileSystemError("NoEntryError", "File not found: " + path);
      }
      if (!canPathBeWrittenIn(path)) {
        throw new FileSystemError("NoEntryError", "File not found: " + path);
      }
      return this._scheduleLockingOperation(async () => {
        const db2 = await this._dbProm;
        const contentStore = db2.transaction(CONTENT_STORE, "readwrite").objectStore(CONTENT_STORE);
        return new Promise((resolve, reject) => {
          const request = contentStore.get(pathToId(path));
          request.onerror = () => reject(
            new FileSystemError(
              "TransactionError",
              request?.error?.toString?.() ?? "Unknown transaction error"
            )
          );
          request.onsuccess = () => {
            if (!request.result) {
              reject(new FileSystemError("NoEntryError", "File not found."));
              return;
            }
            const content = request.result.content;
            try {
              resolve(parseToWantedFormat(content, format));
            } catch (err) {
              const formattedErr = new FileSystemError(
                "ParsingError",
                "Impossible to read corrupted file: " + (err?.toString?.() ?? "Unknown Error")
              );
              reject(formattedErr);
            }
          };
        });
      });
    }
    async mkdir(path) {
      if (!SETTINGS.storeNewDataInIndexedDB.getValue()) {
        throw new FileSystemError(
          "UserSettingsError",
          "User settings forbid creation of new directories.\n\nAuthorize the creation of new files in the settings to allow this operation."
        );
      }
      const normalizedPath = path.endsWith("/") ? path : path + "/";
      if (!canPathBeWrittenIn(normalizedPath)) {
        throw new FileSystemError(
          "PermissionError",
          "This directory is read-only"
        );
      }
      const name = getName(normalizedPath);
      const parentDir = getContainingDirectory(normalizedPath);
      if (RESERVED_NAMES.includes(name)) {
        throw new FileSystemError(
          "IllegalOperation",
          "Using a reserved system name"
        );
      }
      if (/[\x00-\x1F\x7F/\\]/.test(name) || name === "") {
        throw new FileSystemError(
          "InvalidOperation",
          "Unauthorized directory name: Please do not use control characters, slash or anti-slash characters."
        );
      }
      return this._scheduleLockingOperation(async () => {
        const list = await this._readDirEntries(parentDir);
        for (const entry of list) {
          if (entry.name === name) {
            throw new FileSystemError(
              "IllegalOperation",
              "An item with that name already exists in this directory."
            );
          }
        }
        const db2 = await this._dbProm;
        const tx = db2.transaction(METADATA_STORE, "readwrite");
        const store = tx.objectStore(METADATA_STORE);
        return new Promise((resolve, reject) => {
          tx.onerror = () => reject(
            new FileSystemError(
              "TransactionError",
              tx?.error?.toString?.() ?? "Unknown transaction error"
            )
          );
          tx.oncomplete = () => resolve();
          const fullPath = normalizedPath.substring(0, normalizedPath.length - 1);
          const now = Date.now();
          store.put({
            id: pathToId(fullPath),
            fullPath,
            directory: parentDir,
            name,
            type: "directory",
            modified: now,
            size: 0
          });
          const systemFile = normalizedPath + DIR_CONFIG_FILENAME;
          store.put({
            id: pathToId(systemFile),
            fullPath: systemFile,
            directory: normalizedPath,
            name: DIR_CONFIG_FILENAME,
            type: "system",
            modified: now,
            size: 0
          });
        }).then(() => {
          this._triggerWatchers([normalizedPath]);
        });
      });
    }
    getUsageEstimate() {
      return this._scheduleLockingOperation(async () => {
        const db2 = await this._dbProm;
        const metadata = await new Promise((resolve, reject) => {
          const transaction = db2.transaction([METADATA_STORE], "readonly");
          const store = transaction.objectStore(METADATA_STORE);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        return metadata.reduce((acc, entry) => {
          return acc + (entry.size ?? 0);
        }, 0);
      });
    }
    format() {
      return this._scheduleLockingOperation(async () => {
        const paths = [];
        const entries = await this._readDirRecursive("/");
        try {
          for (const entry of entries) {
            await this._rmFileUnchecked(entry.fullPath);
            paths.push(entry.fullPath);
          }
        } catch (err) {
          this._triggerWatchers(paths);
          throw err;
        }
        this._triggerWatchers(paths);
      });
    }
    _scheduleLockingOperation(operationCb) {
      return new Promise((resolve, reject) => {
        const shouldRestartQueue = this._queue.length === 0;
        const queueItem = { resolve, reject, operationCb };
        this._queue.push(queueItem);
        if (shouldRestartQueue) {
          this._performNextOperation();
        }
      });
    }
    _performNextOperation() {
      const nextOp = this._queue[0];
      if (!nextOp) {
        return;
      }
      nextOp.operationCb().then(
        (res) => {
          if (this._queue[0] === nextOp) {
            this._queue.shift();
          }
          nextOp.resolve(res);
          this._performNextOperation();
        },
        (err) => {
          if (this._queue[0] === nextOp) {
            this._queue.shift();
          }
          const formattedErr = err instanceof FileSystemError ? err : new FileSystemError(
            "IDBError",
            err?.toString?.() ?? "Unknown Error"
          );
          nextOp.reject(formattedErr);
          this._performNextOperation();
        }
      );
    }
    async _readDirEntries(dirPath) {
      if (!dirPath.endsWith("/")) {
        throw new FileSystemError(
          "WrongTypeError",
          "Calling stat on a directory instead of a file"
        );
      }
      if (dirPath === "/") {
        const userDataFullPath = USER_DATA_DIR.substring(
          0,
          USER_DATA_DIR.length - 1
        );
        const userConfigFullPath = USER_CONFIG_DIR.substring(
          0,
          USER_CONFIG_DIR.length - 1
        );
        return this._virtualRootDirs.map((d) => {
          const fullPath = d.substring(0, d.length - 1);
          return {
            id: pathToId(fullPath),
            fullPath,
            directory: "/",
            name: getName(fullPath),
            type: "directory",
            modified: DEFAULT_MODIFIED_DATE,
            size: 0
          };
        }).concat(
          {
            id: pathToId(userDataFullPath),
            fullPath: userDataFullPath,
            directory: "/",
            name: getName(userDataFullPath),
            type: "directory",
            modified: DEFAULT_MODIFIED_DATE,
            size: 0
          },
          {
            id: pathToId(userConfigFullPath),
            fullPath: userConfigFullPath,
            directory: "/",
            name: getName(userConfigFullPath),
            type: "directory",
            modified: DEFAULT_MODIFIED_DATE,
            size: 0
          }
        );
      }
      if (this._virtualRootDirs.includes(dirPath)) {
        if (dirPath === APPS_DIR) {
          return this._apps.map((app) => {
            const name = `${app.id}.run`;
            const fullPath = APPS_DIR + name;
            return {
              id: pathToId(fullPath),
              fullPath,
              directory: APPS_DIR,
              name,
              type: "file",
              icon: app.icon,
              modified: DEFAULT_MODIFIED_DATE,
              size: 0
            };
          });
        }
        if (dirPath === SYSTEM_DIR) {
          return [
            DESKTOP_CONFIG,
            START_MENU_CONFIG,
            PROVIDERS_CONFIG,
            DEFAULT_APPS_CONFIG
          ].map((filename) => {
            const fullPath = SYSTEM_DIR + filename;
            return {
              id: pathToId(fullPath),
              fullPath,
              directory: SYSTEM_DIR,
              name: filename,
              type: "file",
              modified: DEFAULT_MODIFIED_DATE,
              size: 0
            };
          });
        }
        throw new FileSystemError(
          "NoEntryError",
          "Invalid directory: " + dirPath
        );
      }
      if (!canPathBeWrittenIn(dirPath)) {
        throw new FileSystemError(
          "NoEntryError",
          "Invalid directory: " + dirPath
        );
      }
      const db2 = await this._dbProm;
      const metadataStore = db2.transaction(METADATA_STORE, "readonly").objectStore(METADATA_STORE);
      const range = IDBKeyRange.only(dirPath);
      return new Promise((resolve, reject) => {
        const request = metadataStore.index("directory").getAll(range, 100);
        request.onerror = () => reject(
          new FileSystemError(
            "TransactionError",
            request?.error?.toString?.() ?? "Unknown transaction error"
          )
        );
        request.onsuccess = () => {
          if (request.result.length === 0) {
            if ([USER_DATA_DIR, USER_CONFIG_DIR].includes(dirPath)) {
              resolve([]);
            } else {
              reject(
                new FileSystemError(
                  "NoEntryError",
                  "Invalid directory: " + dirPath
                )
              );
            }
            return;
          }
          resolve(request.result.filter((r) => r.name !== DIR_CONFIG_FILENAME));
        };
      });
    }
    async _readDirRecursive(dirPath) {
      const db2 = await this._dbProm;
      const normalizedDirPath = dirPath.endsWith("/") ? dirPath : dirPath + "/";
      return new Promise((resolve, reject) => {
        const transaction = db2.transaction([METADATA_STORE], "readonly");
        const metadataStore = transaction.objectStore(METADATA_STORE);
        const allEntries = [];
        const request = metadataStore.openCursor();
        request.onerror = () => reject(
          new FileSystemError(
            "TransactionError",
            request?.error?.toString?.() ?? "Unknown transaction error"
          )
        );
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const entry = cursor.value;
            if (isEntryPath(entry, normalizedDirPath) || entry.fullPath.startsWith(normalizedDirPath)) {
              allEntries.push(entry);
            }
            cursor.continue();
          } else {
            resolve(allEntries);
          }
        };
      });
    }
    async _writeFileUnchecked(path, contentAb) {
      const name = getName(path);
      const directoryPath = getDirPath(path);
      const list = await this._readDirEntries(directoryPath);
      for (const entry of list) {
        if (entry.name === name) {
          await this._rmFileUnchecked(directoryPath + entry.name);
        }
      }
      const db2 = await this._dbProm;
      const tx = db2.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
      const metadataStore = tx.objectStore(METADATA_STORE);
      const contentStore = tx.objectStore(CONTENT_STORE);
      const now = Date.now();
      const id = pathToId(path);
      metadataStore.put({
        id,
        fullPath: path,
        directory: directoryPath,
        name,
        size: contentAb.byteLength,
        type: "file",
        modified: now
      });
      contentStore.put({ id, content: contentAb });
      return new Promise((resolve, reject) => {
        tx.onerror = () => reject(
          new FileSystemError(
            "TransactionError",
            tx?.error?.toString?.() ?? "Unknown transaction error"
          )
        );
        tx.oncomplete = () => resolve();
      });
    }
    async _rmFileUnchecked(filePath) {
      const db2 = await this._dbProm;
      const tx = db2.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
      return new Promise((resolve, reject) => {
        tx.onerror = () => reject(
          new FileSystemError(
            "TransactionError",
            tx?.error?.toString?.() ?? "Unknown transaction error"
          )
        );
        tx.oncomplete = () => resolve();
        const id = pathToId(filePath);
        const metadataStore = tx.objectStore(METADATA_STORE);
        const contentStore = tx.objectStore(CONTENT_STORE);
        metadataStore.delete(id);
        contentStore.delete(id);
      });
    }
    _triggerWatchers(updatedPaths) {
      const paths = /* @__PURE__ */ new Set();
      updatedPaths.forEach((p) => {
        paths.add(p);
        paths.add(getContainingDirectory(p));
      });
      for (const path of paths) {
        const watchers = this._watchedPaths.get(path);
        if (watchers) {
          watchers.slice().forEach((cb) => {
            try {
              cb({});
            } catch (_) {
            }
          });
        }
      }
    }
  };
  var fs = new DesktopFileSystem();
  var filesystem_default = fs;
  function canPathBeWrittenIn(path) {
    return [USER_DATA_DIR, USER_CONFIG_DIR].some((dir) => path.startsWith(dir));
  }
  function canPathBeUpdated(path) {
    return [USER_DATA_DIR, USER_CONFIG_DIR].some(
      (dir) => path.startsWith(dir) && path !== dir
    );
  }

  // src/utils.mjs
  function addAbortableEventListener(target, event, abortSignal, callback, options) {
    target.addEventListener(event, callback, options);
    abortSignal?.addEventListener("abort", () => {
      target.removeEventListener(event, callback);
    });
  }
  function is12HourClockFormat() {
    const locale = navigator.language;
    try {
      return Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12 === true;
    } catch (err) {
      return locale === "en-US";
    }
  }
  function applyStyle(element, style) {
    for (const key of Object.keys(style)) {
      element.style[key] = style[key];
    }
  }
  function getMaxDesktopDimensions(taskbarLocation2, taskbarSize) {
    const hasHorizontalTaskbar = ["top", "bottom"].includes(taskbarLocation2);
    return {
      maxHeight: document.documentElement.clientHeight - (hasHorizontalTaskbar ? taskbarSize : 0),
      maxWidth: document.documentElement.clientWidth - (hasHorizontalTaskbar ? 0 : taskbarSize)
    };
  }
  function createExternalIframe(url, backgroundColor) {
    const container = document.createElement("div");
    applyStyle(container, {
      height: "100%",
      width: "100%",
      position: "relative",
      backgroundColor: backgroundColor ?? "var(--window-content-bg)"
    });
    const blockerDiv = document.createElement("div");
    blockerDiv.className = "iframe-top-layer";
    const blockerText = document.createElement("div");
    blockerDiv.className = "iframe-top-layer";
    applyStyle(blockerText, {
      color: "white",
      fontStyle: "italic",
      padding: "10px",
      backgroundColor: "#0000004d",
      borderRadius: "10px"
    });
    blockerText.textContent = "External i-frame blocked until the window's content is focused.";
    blockerDiv.appendChild(blockerText);
    const spinner = document.createElement("div");
    spinner.className = "spinner spinner-iframe";
    const iframe = document.createElement("iframe");
    applyStyle(iframe, {
      height: "100%",
      width: "100%",
      border: "0",
      // TODO: find out what's adding that thing instead of hacking around!
      marginBottom: "-5px"
    });
    iframe.src = url;
    iframe.className = "loading";
    iframe.height = "100%";
    iframe.width = "100%";
    iframe.border = 0;
    iframe.allow = "clipboard-read; clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture";
    iframe.onload = function() {
      container.style.backgroundColor = "#ffffff";
      container.removeChild(spinner);
    };
    iframe.onerror = function() {
      container.removeChild(spinner);
    };
    container.appendChild(blockerDiv);
    container.appendChild(iframe);
    container.appendChild(spinner);
    return container;
  }
  function constructSidebarElt(sections, onChangeSection) {
    const sidebarElt = document.createElement("div");
    sidebarElt.className = "w-sidebar";
    const sidebarItemElements = sections.map((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "w-sidebar-item" + (item.active ? " active" : "");
      itemElement.tabIndex = "0";
      if (item.icon) {
        const itemIcon = document.createElement("span");
        itemIcon.className = "w-sidebar-icon";
        itemIcon.textContent = item.icon;
        itemElement.appendChild(itemIcon);
      }
      const itemTitle = document.createElement("span");
      itemTitle.className = "w-sidebar-title";
      itemTitle.textContent = item.text;
      itemElement.appendChild(itemTitle);
      itemElement.onkeydown = (e) => {
        if (e.key === "Enter") {
          itemElement.click();
        }
      };
      itemElement.onclick = () => {
        if (itemElement.classList.contains("active")) {
          return;
        }
        sidebarItemElements.forEach((el) => {
          el.classList.remove("active");
        });
        itemElement.classList.add("active");
        onChangeSection(item.section);
      };
      return itemElement;
    });
    sidebarItemElements.forEach((item) => {
      sidebarElt.appendChild(item);
    });
    return sidebarElt;
  }
  function blockElementsFromTakingPointerEvents() {
    document.body.classList.add("block-iframe");
  }
  function unblockElementsFromTakingPointerEvents() {
    document.body.classList.remove("block-iframe");
  }
  var EventEmitter = class {
    constructor() {
      this._listeners = {};
    }
    /**
     * Register a new callback for an event.
     *
     * @param {string} evt - The event to register a callback to
     * @param {Function} fn - The callback to call as that event is triggered.
     * The callback will take as argument the eventual payload of the event
     * (single argument).
     */
    addEventListener(evt, fn) {
      const listeners = this._listeners[evt];
      if (!Array.isArray(listeners)) {
        this._listeners[evt] = [fn];
      } else {
        listeners.push(fn);
      }
    }
    /**
     * Unregister callbacks linked to events.
     * @param {string} [evt] - The event for which the callback[s] should be
     * unregistered. Set it to null or undefined to remove all callbacks
     * currently registered (for any event).
     * @param {Function} [fn] - The callback to unregister. If set to null
     * or undefined while the evt argument is set, all callbacks linked to that
     * event will be unregistered.
     */
    removeEventListener(evt, fn) {
      if (evt == null) {
        this._listeners = {};
        return;
      }
      const listeners = this._listeners[evt];
      if (!Array.isArray(listeners)) {
        return;
      }
      if (fn == null) {
        delete this._listeners[evt];
        return;
      }
      const index = listeners.indexOf(fn);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      if (listeners.length === 0) {
        delete this._listeners[evt];
      }
    }
    /**
     * Trigger every registered callbacks for a given event
     * @param {string} evt - The event to trigger
     * @param {*} arg - The eventual payload for that event. All triggered
     * callbacks will recieve this payload as argument.
     */
    trigger(evt, arg) {
      const listeners = this._listeners[evt];
      if (!Array.isArray(listeners)) {
        return;
      }
      listeners.slice().forEach((listener) => {
        try {
          listener(arg);
        } catch (e) {
        }
      });
    }
  };
  function createLinkedAbortController(parentAbortSignal) {
    const abortController = new AbortController();
    if (parentAbortSignal) {
      linkAbortControllerToSignal(abortController, parentAbortSignal);
    }
    return abortController;
  }
  function linkAbortControllerToSignal(abortController, parentAbortSignal) {
    const onParentAbort = () => abortController.abort();
    parentAbortSignal.addEventListener("abort", onParentAbort);
    abortController.signal.addEventListener("abort", () => {
      parentAbortSignal.removeEventListener("abort", onParentAbort);
    });
  }
  function getSpinnerApp(backgroundColor) {
    const placeholderElt = document.createElement("div");
    applyStyle(placeholderElt, {
      height: "100%",
      width: "100%",
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: backgroundColor ?? "var(--window-content-bg)"
    });
    const timeout = setTimeout(() => {
      const spinnerElt = document.createElement("div");
      spinnerElt.className = "spinner";
      placeholderElt.appendChild(spinnerElt);
    }, 200);
    return {
      element: placeholderElt,
      onClose: () => clearTimeout(timeout)
    };
  }
  function getErrorApp(err) {
    const errorElt = document.createElement("div");
    applyStyle(errorElt, {
      position: "relative",
      width: "100%",
      height: "100%",
      backgroundColor: "var(--window-content-bg)",
      padding: "10px",
      overflow: "auto"
    });
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `<h2>Oh no! This application crashed... \u{1F63F}</h2>
<p>Failed to load this application due to the following error:</p>`;
    const pErrorMsgElt = document.createElement("p");
    pErrorMsgElt.style.fontFamily = "monospace";
    pErrorMsgElt.textContent = err.toString();
    errorDiv.appendChild(pErrorMsgElt);
    errorElt.appendChild(errorDiv);
    return { element: errorElt };
  }
  function parseAppDefaultBackground(defaultBackground) {
    if (defaultBackground?.startsWith("#")) {
      return defaultBackground;
    }
    return defaultBackground ? APP_STYLE[defaultBackground]?.cssProp ?? APP_STYLE.bgColor.cssProp : APP_STYLE.bgColor.cssProp;
  }
  function constructAppStyleObject() {
    return Object.keys(APP_STYLE).reduce((acc, name) => {
      acc[name] = APP_STYLE[name].cssProp;
      return acc;
    }, {});
  }
  function idGenerator() {
    let prefix = "";
    let currId = -1;
    return function generateNewId2() {
      currId++;
      if (currId >= Number.MAX_SAFE_INTEGER) {
        prefix += "0";
        currId = 0;
      }
      return prefix + String(currId);
    };
  }

  // src/components/notification_emitter.mjs
  var DEFAULT_NOTIF_DURATION = 8e3;
  var NOTIF_STYLE = {
    success: {
      icon: "\u2713",
      background: "linear-gradient(135deg, #10b981, #059669)",
      borderColor: "#047857"
    },
    error: {
      icon: "\u{1F63F}",
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      borderColor: "#b91c1c"
    },
    warning: {
      icon: "\u26A0",
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      borderColor: "#b45309"
    },
    info: {
      icon: "\u2139",
      background: "var(--app-primary-color)",
      color: "var(--window-content-bg)",
      borderColor: "#1d4ed8"
    }
  };
  var generateNewId = idGenerator();
  var NotificationEmitter = class {
    constructor() {
      this._notifs = [];
      this.container = document.createElement("div");
      applyStyle(this.container, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "10000",
        maxHeight: "100vh",
        overflow: "hidden",
        pointerEvents: "none"
      });
      document.body.appendChild(this.container);
    }
    clear() {
      this._notifs.forEach((notification) => {
        applyStyle(notification.element, {
          transform: "translateX(100%)",
          opacity: "0"
        });
      });
      setTimeout(() => {
        this._notifs.forEach((notification) => {
          if (notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
          }
        });
        this._notifs = [];
      }, 300);
    }
    success(title, message, duration) {
      return this._addNotif("success", title, message, duration);
    }
    error(title, message, duration) {
      return this._addNotif("error", title, message, duration);
    }
    warning(title, message, duration) {
      return this._addNotif("warning", title, message, duration);
    }
    info(title, message, duration) {
      return this._addNotif("info", title, message, duration);
    }
    destroy() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this._notifs = [];
    }
    _addNotif(type, title, message, duration = DEFAULT_NOTIF_DURATION) {
      const id = generateNewId();
      const config = NOTIF_STYLE[type] ?? NOTIF_STYLE.info;
      const notification = {
        id,
        type,
        title,
        message,
        timestamp: Date.now(),
        duration,
        element: this._createNewNotif(config, title, message, id)
      };
      this._notifs.push(notification);
      this.container.appendChild(notification.element);
      setTimeout(() => {
        applyStyle(notification.element, {
          transform: "translateX(0)",
          opacity: "1"
        });
      }, 10);
      if (duration > 0) {
        setTimeout(() => {
          this._removeNotif(id);
        }, duration);
      }
      return id;
    }
    _removeNotif(id) {
      const notification = this._notifs.find((n) => n.id === id);
      if (!notification) return;
      applyStyle(notification.element, {
        transform: "translateX(100%)",
        opacity: "0"
      });
      setTimeout(() => {
        if (notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
        this._notifs = this._notifs.filter((n) => n.id !== id);
      }, 300);
    }
    _createNewNotif(config, title, message, id) {
      const notifElt = document.createElement("div");
      applyStyle(notifElt, {
        background: config.background,
        // borderLeft: `4px solid ${config.borderColor}`,
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        padding: "16px",
        marginBottom: "12px",
        minWidth: "min(calc(90vw - 16px), 400px)",
        maxWidth: "320px",
        backdropFilter: "blur(10px)",
        color: config.color ?? "white",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transform: "translateX(100%)",
        opacity: "0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: "auto"
      });
      const headerElt = document.createElement("div");
      applyStyle(headerElt, {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "8px"
      });
      const iconTitleElt = document.createElement("div");
      applyStyle(iconTitleElt, {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flex: "1"
      });
      const iconElt = document.createElement("span");
      iconElt.textContent = config.icon;
      applyStyle(iconElt, {
        fontSize: "16px",
        fontWeight: "bold",
        flexShrink: "0"
      });
      const titleElt = document.createElement("h4");
      titleElt.textContent = title;
      applyStyle(titleElt, {
        fontSize: "14px",
        fontWeight: "600",
        margin: "0",
        wordBreak: "break-word"
      });
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "\xD7";
      applyStyle(closeBtn, {
        background: "rgba(255, 255, 255, 0.2)",
        border: "none",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        height: "24px",
        width: "24px",
        marginLeft: "8px",
        transition: "background 0.2s",
        flexShrink: "0"
      });
      closeBtn.addEventListener("mouseenter", () => {
        applyStyle(closeBtn, {
          background: "rgba(255, 255, 255, 0.3)"
        });
      });
      closeBtn.addEventListener("mouseleave", () => {
        applyStyle(closeBtn, {
          background: "rgba(255, 255, 255, 0.2)"
        });
      });
      closeBtn.addEventListener("click", () => {
        this._removeNotif(id);
      });
      const messageElt = document.createElement("p");
      const splittedMsg = message?.split("\n") ?? [];
      for (let i = 0; i < splittedMsg.length; i++) {
        if (i > 0) {
          messageElt.appendChild(document.createElement("br"));
        }
        messageElt.appendChild(document.createTextNode(splittedMsg[i]));
      }
      applyStyle(messageElt, {
        fontSize: "13px",
        margin: "0",
        opacity: "0.9",
        wordBreak: "break-word",
        lineHeight: "1.4"
      });
      const timestampElt = document.createElement("p");
      timestampElt.textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString();
      applyStyle(timestampElt, {
        fontSize: "11px",
        margin: "8px 0 0 0",
        opacity: "0.7"
      });
      iconTitleElt.appendChild(iconElt);
      iconTitleElt.appendChild(titleElt);
      headerElt.appendChild(iconTitleElt);
      headerElt.appendChild(closeBtn);
      notifElt.appendChild(headerElt);
      notifElt.appendChild(messageElt);
      notifElt.appendChild(timestampElt);
      return notifElt;
    }
  };
  var notification_emitter_default = new NotificationEmitter();

  // src/components/context-menu.mjs
  var contextMenuWrapper = document.getElementById("context-menu-wrapper");
  function setUpContextMenu({
    actions,
    element,
    filter,
    abortSignal
  }) {
    const contextMenuElt = document.createElement("div");
    contextMenuElt.className = "context-menu";
    const filterMap = /* @__PURE__ */ new WeakMap();
    function createButtonElt2(svg, title, height = "1.7rem", onClick) {
      const buttonWrapperElt = document.createElement("span");
      applyStyle(buttonWrapperElt, {
        display: "flex",
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "8px"
      });
      const svgWrapperElt = document.createElement("span");
      applyStyle(svgWrapperElt, {
        height
      });
      const buttonSvgElt = getSvg(svg);
      if (buttonSvgElt) {
        applyStyle(buttonSvgElt, {
          width: "1.7rem",
          height: "100%"
          // flex: "0 0 auto",
        });
        svgWrapperElt.appendChild(buttonSvgElt);
      }
      svgWrapperElt.className = "context-icon";
      buttonWrapperElt.appendChild(svgWrapperElt);
      buttonWrapperElt.onclick = (e) => {
        if (buttonWrapperElt.classList.contains("disabled")) {
          return;
        }
        return onClick(e);
      };
      buttonWrapperElt.onkeydown = (e) => {
        if (buttonWrapperElt.classList.contains("disabled")) {
          return;
        }
        if (e.key === " " || e.key === "Enter") {
          return onClick(e);
        }
      };
      const titleElt = document.createElement("span");
      titleElt.textContent = title;
      buttonWrapperElt.appendChild(titleElt);
      buttonWrapperElt.setAttribute("tabindex", "0");
      return buttonWrapperElt;
    }
    actions.forEach((actionData) => {
      if (actionData.name === "separator") {
        const separatorElt = document.createElement("span");
        applyStyle(separatorElt, {
          height: "1px",
          margin: "0px 10px",
          borderBottom: "1px dotted var(--sidebar-hover-bg)"
        });
        contextMenuElt.appendChild(separatorElt);
        if (actionData.filter) {
          filterMap.set(separatorElt, actionData.filter);
        }
      } else {
        const defaultButtonConfig = BUTTONS_BY_NAME[actionData.name] ?? [];
        const contextMenuItemElt = createButtonElt2(
          actionData.svg ?? defaultButtonConfig.svg ?? "",
          actionData.title ?? defaultButtonConfig.defaultTitle ?? "",
          actionData.height ?? defaultButtonConfig.height,
          (e) => {
            e.preventDefault();
            actionData.onClick();
            closeContextMenu();
          }
        );
        contextMenuItemElt.tabIndex = "0";
        contextMenuItemElt.className = "context-menu-item";
        if (actionData.filter) {
          filterMap.set(contextMenuItemElt, actionData.filter);
        }
        contextMenuElt.appendChild(contextMenuItemElt);
      }
    });
    element.addEventListener("contextmenu", (e) => {
      if (filter && !filter(e)) {
        return;
      }
      e.preventDefault();
      contextMenuWrapper.innerHTML = "";
      contextMenuWrapper.appendChild(contextMenuElt);
      contextMenuWrapper.style.display = "block";
      for (const child of contextMenuElt.children) {
        const filter2 = filterMap.get(child);
        if (!filter2 || filter2()) {
          child.style.display = "flex";
        } else {
          child.style.display = "none";
        }
      }
      if (e.pageX + 3 + contextMenuElt.offsetWidth > document.body.clientWidth) {
        if (e.pageX - 3 - contextMenuElt.offsetWidth >= 0) {
          contextMenuElt.style.left = e.pageX - 3 - contextMenuElt.offsetWidth + "px";
        } else {
          contextMenuElt.style.left = "0px";
        }
      } else {
        contextMenuElt.style.left = e.pageX + 3 + "px";
      }
      if (e.pageY + 3 + contextMenuElt.offsetHeight > document.body.clientHeight) {
        if (e.pageY - 3 - contextMenuElt.offsetHeight >= 0) {
          contextMenuElt.style.top = e.pageY - 3 - contextMenuElt.offsetHeight + "px";
        } else {
          contextMenuElt.style.top = "0px";
        }
      } else {
        contextMenuElt.style.top = e.pageY + 3 + "px";
      }
      requestAnimationFrame(() => {
        contextMenuElt.classList.add("show");
      });
    });
    contextMenuElt.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action) {
        handleAction(action);
        closeContextMenu();
      }
    });
    addAbortableEventListener(document, "mousedown", abortSignal, (e) => {
      if (!contextMenuWrapper.contains(e.target)) {
        closeContextMenu();
      }
    });
    addAbortableEventListener(document, "click", abortSignal, closeContextMenu);
    addAbortableEventListener(window, "resize", abortSignal, closeContextMenu);
    function closeContextMenu() {
      contextMenuElt.classList.remove("show");
      contextMenuElt.remove();
      contextMenuElt.style.left = "";
      contextMenuElt.style.top = "";
      contextMenuWrapper.innerHTML = "";
      contextMenuWrapper.display = "none";
    }
  }
  function getSvg(svg) {
    const svgWrapperElt = document.createElement("div");
    svgWrapperElt.innerHTML = svg;
    const svgElt = svgWrapperElt.children[0];
    return svgElt;
  }

  // src/components/DesktopAppIcons.mjs
  var USER_DESKTOP_CONFIG = "/userconfig/desktop.config.json";
  async function DesktopAppIcons(containerElt, onOpen, parentAbortSignal) {
    const iconWrapperElt = document.createElement("div");
    let lastAppListMemory;
    let currentAbortController = createLinkedAbortController(parentAbortSignal);
    addContainerContextMenu(containerElt, onOpen, parentAbortSignal);
    filesystem_default.watch(
      USER_DESKTOP_CONFIG,
      async () => {
        const abortSignal2 = currentAbortController.signal;
        const [hasChanged, newAppList] = await getAppList();
        if (abortSignal2.aborted || !hasChanged) {
          return;
        }
        iconWrapperElt.innerHTML = "";
        currentAbortController.abort();
        currentAbortController = createLinkedAbortController(parentAbortSignal);
        await constructGrid(newAppList, currentAbortController.signal);
        if (abortSignal2.aborted) {
          return;
        }
      },
      parentAbortSignal
    );
    const abortSignal = currentAbortController.signal;
    const [_, appList] = await getAppList();
    if (abortSignal.aborted) {
      return;
    }
    constructGrid(appList, abortSignal);
    async function getAppList() {
      try {
        const userConfig = await filesystem_default.readFile(USER_DESKTOP_CONFIG);
        if (lastAppListMemory === userConfig) {
          return [false, JSON.parse(userConfig).list];
        }
        lastAppListMemory = userConfig;
        let tmpList;
        try {
          tmpList = JSON.parse(userConfig).list;
        } catch (err) {
          notification_emitter_default.warning(
            "Invalid Desktop Config",
            `"${USER_DESKTOP_CONFIG}" is not a valid JSON file.
Resetting it to its default value...`
          );
          throw new Error("Malformed config file");
        }
        for (const app of tmpList) {
          if (typeof app.title !== "string" || typeof app.icon !== "string" || typeof app.run !== "string" || app.args != null && !Array.isArray(app.args)) {
            notification_emitter_default.warning(
              "Invalid Desktop Config",
              `"${USER_DESKTOP_CONFIG}" contains invalid data.
Resetting it to its default value...`
            );
            throw new Error("Malformed config file");
          }
        }
        return [true, tmpList];
      } catch (err) {
        if (err.code === "NoEntryError") {
          console.info(`No "${USER_DESKTOP_CONFIG}" yet. Initializing one...`);
        }
        const systemConfig = await filesystem_default.readFile(
          "/system32/default-desktop.json",
          "object"
        );
        lastAppListMemory = JSON.stringify(systemConfig, null, 2);
        try {
          await filesystem_default.writeFile(USER_DESKTOP_CONFIG, lastAppListMemory);
        } catch (err2) {
          console.info(
            "The desktop icons won't be persisted, cannot save file to IndexedDB storage:",
            err2.toString()
          );
        }
        return [true, systemConfig.list.slice()];
      }
    }
    function constructGrid(appList2, abortSignal2) {
      if (abortSignal2.aborted) {
        return;
      }
      let currentGridAbortController = createLinkedAbortController(abortSignal2);
      let lastGrid = [0, 0];
      SETTINGS.fontSize.onUpdate(recheckUpdate, {
        clearSignal: parentAbortSignal
      });
      window.addEventListener("resize", recheckUpdate);
      SETTINGS.taskbarSize.onUpdate(recheckUpdate, {
        clearSignal: parentAbortSignal
      });
      SETTINGS.taskbarLocation.onUpdate(recheckUpdate, {
        clearSignal: parentAbortSignal
      });
      if (parentAbortSignal) {
        parentAbortSignal.addEventListener("abort", () => {
          window.removeEventListener("resize", recheckUpdate);
        });
      }
      containerElt.appendChild(iconWrapperElt);
      return recheckUpdate();
      function recheckUpdate(force) {
        return new Promise((resolve, reject) => {
          requestAnimationFrame(() => {
            try {
              const newDimensions = getMaxDesktopDimensions(
                SETTINGS.taskbarLocation.getValue(),
                SETTINGS.taskbarSize.getValue()
              );
              const newMaxWidth = newDimensions.maxWidth;
              const newMaxHeight = newDimensions.maxHeight;
              const newIconHeight = ICON_HEIGHT_BASE + SETTINGS.fontSize.getValue() * 2 + ICON_Y_OFFSET_FROM_HEIGHT;
              const newGrid = [
                // nb of icons on height / column
                Math.floor(
                  (newMaxHeight - ICON_Y_BASE) / (newIconHeight + ICON_MARGIN)
                ),
                // nb of icons on width / row
                Math.floor(
                  (newMaxWidth - ICON_X_BASE) / (ICON_WIDTH_BASE + ICON_X_OFFSET_FROM_WIDTH)
                )
              ];
              const doRefresh = () => {
                currentGridAbortController?.abort();
                currentGridAbortController = createLinkedAbortController(abortSignal2);
                refreshIcons(
                  appList2,
                  newGrid,
                  newIconHeight,
                  currentGridAbortController.signal
                );
                lastGrid = newGrid;
              };
              if (force) {
                doRefresh();
              }
              if (newGrid[0] < lastGrid[0]) {
                if (newGrid[0] >= appList2.length) {
                  return;
                } else {
                  doRefresh();
                }
              } else if (newGrid[0] === lastGrid[0]) {
                if (newGrid[1] < lastGrid[1]) {
                  if (newGrid[0] * newGrid[1] < appList2.length) {
                    doRefresh();
                  }
                } else if (newGrid[1] > lastGrid[1]) {
                  if (lastGrid[0] * lastGrid[1] < appList2.length) {
                    doRefresh();
                  }
                }
              } else {
                if (lastGrid[0] >= appList2.length) {
                  return;
                } else {
                  doRefresh();
                }
              }
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    }
    function refreshIcons(appList2, gridSize, iconHeight, abortSignal2) {
      if (abortSignal2.aborted) {
        return;
      }
      let nextIconPosition = {
        x: ICON_X_BASE,
        y: ICON_Y_BASE
      };
      iconWrapperElt.innerHTML = "";
      const iconEltToAppMap = /* @__PURE__ */ new Map();
      let currentRow = 0;
      for (let i = 0; i < appList2.length; i++) {
        const app = appList2[i];
        const iconElt = document.createElement("div");
        iconElt.tabIndex = "0";
        iconElt.className = `icon icon-app-${app.id}`;
        if (currentRow >= gridSize[0]) {
          currentRow = 0;
          nextIconPosition.y = ICON_Y_BASE;
          nextIconPosition.x += ICON_WIDTH_BASE + ICON_X_OFFSET_FROM_WIDTH;
        }
        if (i >= gridSize[0] * gridSize[1]) {
          break;
        }
        const basePositionTop = nextIconPosition.y;
        const basePositionLeft = nextIconPosition.x;
        applyStyle(iconElt, {
          height: String(iconHeight) + "px",
          width: String(ICON_WIDTH_BASE) + "px",
          left: `${basePositionLeft}px`,
          top: `${basePositionTop}px`
        });
        nextIconPosition.y += iconHeight + ICON_MARGIN;
        iconElt.innerHTML = `
<div class="icon-img">${app.icon}</div>
<div class="icon-text">${app.title}</div>
`;
        let clickCount = 0;
        let lastClickTs = -Infinity;
        addIconEltContextMenu(iconElt, appList2, app, abortSignal2);
        iconElt.onkeydown = (e) => onKeyDown(appList2, iconElt, app, e);
        iconElt.addEventListener("blur", () => {
          iconElt.classList.remove("selected");
        });
        iconElt.addEventListener("click", (evt) => {
          if (evt.pointerType === "mouse") {
            selectIcon(iconElt);
            if (clickCount && performance.now() - lastClickTs < 300) {
              clickCount = 0;
              onOpen(app.run, app.args ?? []);
              iconElt.blur();
            } else {
              clickCount = 1;
              lastClickTs = performance.now();
            }
          } else {
            clickCount = 0;
            onOpen(app.run, app.args ?? []);
            iconElt.blur();
          }
        });
        const onDocumentClick = (evt) => {
          if (evt.target !== iconElt && !iconElt.contains(evt.target)) {
            iconElt.classList.remove("selected");
          }
        };
        document.addEventListener("click", onDocumentClick);
        abortSignal2.addEventListener("abort", () => {
          document.removeEventListener("click", onDocumentClick);
        });
        iconEltToAppMap.set(iconElt, app);
        iconWrapperElt.appendChild(iconElt);
        currentRow++;
      }
      addMovingAroundListeners(
        iconWrapperElt.children,
        {
          height: iconHeight,
          width: ICON_WIDTH_BASE
        },
        (elt1, elt2) => exchangeAppPlaces(appList2, iconEltToAppMap, elt1, elt2),
        abortSignal2
      );
    }
    function exchangeAppPlaces(appList2, iconEltToAppMap, iconElt1, iconElt2) {
      const app1 = iconEltToAppMap.get(iconElt1);
      const app2 = iconEltToAppMap.get(iconElt2);
      for (let i = 0; i < appList2.length; i++) {
        if (appList2[i] === app1) {
          for (let j = 0; j < appList2.length; j++) {
            if (appList2[j] === app2) {
              const tempApp1 = appList2[i];
              appList2[i] = appList2[j];
              appList2[j] = tempApp1;
              lastAppListMemory = JSON.stringify({ list: appList2 }, null, 2);
              filesystem_default.writeFile(USER_DESKTOP_CONFIG, lastAppListMemory);
              return;
            }
          }
          return;
        }
      }
    }
    function onKeyDown(appList2, iconElt, app, e) {
      switch (e.key) {
        case "Escape": {
          e.preventDefault();
          iconElt.blur();
          iconElt.classList.remove("selected");
          break;
        }
        case "Delete": {
          e.preventDefault();
          const index = appList2.indexOf(app);
          if (index >= 0) {
            appList2.splice(index, 1);
            const newAppList = JSON.stringify({ list: appList2 }, null, 2);
            filesystem_default.writeFile(USER_DESKTOP_CONFIG, newAppList);
          }
          break;
        }
        case "Backspace": {
          e.preventDefault();
          navigateToParent();
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const allElements = iconWrapperElt.getElementsByClassName("icon");
          if (allElements.length === 0) {
            return;
          }
          const currentClientRect = iconElt.getBoundingClientRect();
          let prevSibling = iconElt.previousElementSibling;
          while (prevSibling) {
            const clientRect = prevSibling.getBoundingClientRect();
            if (clientRect.top === currentClientRect.top) {
              prevSibling.focus();
              break;
            }
            prevSibling = prevSibling.previousElementSibling;
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const allElements = iconWrapperElt.getElementsByClassName("icon");
          if (allElements.length === 0) {
            return;
          }
          const currentClientRect = iconElt.getBoundingClientRect();
          let nextSibling = iconElt.nextElementSibling;
          while (nextSibling) {
            const clientRect = nextSibling.getBoundingClientRect();
            if (clientRect.top === currentClientRect.top) {
              nextSibling.focus();
              break;
            }
            nextSibling = nextSibling.nextElementSibling;
          }
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const allElements = iconWrapperElt.getElementsByClassName("icon");
          if (allElements.length === 0) {
            return;
          }
          const currentClientRect = iconElt.getBoundingClientRect();
          const nextSibling = iconElt.nextElementSibling;
          if (nextSibling) {
            const clientRect = nextSibling.getBoundingClientRect();
            if (clientRect.left === currentClientRect.left) {
              nextSibling.focus();
            }
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const allElements = iconWrapperElt.getElementsByClassName("icon");
          if (allElements.length === 0) {
            return;
          }
          const currentClientRect = iconElt.getBoundingClientRect();
          const previousSibling = iconElt.previousElementSibling;
          if (previousSibling) {
            const clientRect = previousSibling.getBoundingClientRect();
            if (clientRect.left === currentClientRect.left) {
              previousSibling.focus();
            }
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          onOpen(app.run, app.args ?? []);
          iconElt.blur();
          break;
        }
      }
    }
    function addIconEltContextMenu(iconElt, appList2, app, abortSignal2) {
      setUpContextMenu({
        element: iconElt,
        filter: (e) => iconElt.contains(e.target),
        abortSignal: abortSignal2,
        actions: [
          {
            name: "open",
            title: "Open icon",
            height: "1.3em",
            svg: `<svg width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-139.000000, -560.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M98.75,413 L101.9,413 L101.9,407 L98.75,407 L98.75,413 Z M90.35,405 L96.65,405 L96.65,402 L90.35,402 L90.35,405 Z M90.35,413 L96.65,413 L96.65,407 L90.35,407 L90.35,413 Z M90.35,418 L96.65,418 L96.65,415 L90.35,415 L90.35,418 Z M85.1,413 L88.25,413 L88.25,407 L85.1,407 L85.1,413 Z M98.75,405 L98.75,400 L88.25,400 L88.25,405 L83,405 L83,415 L88.25,415 L88.25,420 L98.75,420 L98.75,415 L104,415 L104,405 L98.75,405 Z"></path></g></g></g></svg>`,
            onClick: () => {
              onOpen(app.run, app.args ?? []);
              iconElt.blur();
            }
          },
          {
            name: "clear",
            title: "Delete icon",
            onClick: () => {
              const index = appList2.indexOf(app);
              if (index >= 0) {
                appList2.splice(index, 1);
                const newAppList = JSON.stringify({ list: appList2 }, null, 2);
                filesystem_default.writeFile(USER_DESKTOP_CONFIG, newAppList);
              }
            }
          },
          { name: "separator" },
          ...getBasicContextMenuActions()
        ]
      });
    }
  }
  function selectIcon(iconElt) {
    for (const i of document.getElementsByClassName("icon")) {
      i.classList.remove("selected");
    }
    iconElt.classList.add("selected");
  }
  function getMaxIconPosition(iconElt) {
    const maxDesktopDimensions = getMaxDesktopDimensions(
      SETTINGS.taskbarLocation.getValue(),
      SETTINGS.taskbarSize.getValue()
    );
    const maxX = maxDesktopDimensions.maxWidth - iconElt.clientWidth;
    const maxY = maxDesktopDimensions.maxHeight - iconElt.clientHeight;
    return { maxX, maxY };
  }
  function addMovingAroundListeners(iconElts, { height, width }, exchangeApps, abortSignal) {
    let isDragging = null;
    let offsetX, offsetY;
    let dragBaseLeft;
    let dragBaseTop;
    let updatedLeft;
    let updatedTop;
    let tempMovedElt = null;
    abortSignal.addEventListener("abort", () => {
      unblockElementsFromTakingPointerEvents();
    });
    for (const iconElt of iconElts) {
      const onMouseUp = () => {
        if (isDragging !== iconElt) {
          return;
        }
        if (tempMovedElt) {
          exchangeApps(tempMovedElt.element, iconElt);
        }
        tempMovedElt = null;
        isDragging = null;
        resetIconPosition(iconElt);
        unblockElementsFromTakingPointerEvents();
      };
      addAbortableEventListener(
        iconElt,
        "touchstart",
        abortSignal,
        (e) => {
          const touch = e.touches[0];
          onStart(iconElt, touch);
        },
        {
          passive: true
        }
      );
      addAbortableEventListener(iconElt, "touchend", abortSignal, onMouseUp);
      addAbortableEventListener(
        document,
        "visibilitychange",
        abortSignal,
        onMouseUp
      );
      addAbortableEventListener(
        iconElt,
        "touchmove",
        abortSignal,
        (e) => {
          if (e.touches.length !== 1) {
            return;
          }
          const touch = e.touches[0];
          onMove(iconElt, touch);
        },
        {
          passive: true
        }
      );
      addAbortableEventListener(iconElt, "selectstart", abortSignal, (e) => {
        e.preventDefault();
      });
      addAbortableEventListener(iconElt, "mousedown", abortSignal, (e) => {
        if (e.button !== 0) {
          return;
        }
        onStart(iconElt, e);
      });
      addAbortableEventListener(document, "mousemove", abortSignal, (e) => {
        if (isDragging !== iconElt) {
          return;
        }
        onMove(iconElt, e);
      });
      addAbortableEventListener(document, "mouseup", abortSignal, onMouseUp);
      addAbortableEventListener(
        document.documentElement,
        "mouseleave",
        abortSignal,
        () => {
          if (isDragging !== iconElt) {
            return;
          }
          isDragging = null;
          resetIconPosition();
        }
      );
      addAbortableEventListener(
        document.documentElement,
        "mouseenter",
        abortSignal,
        () => {
          if (isDragging !== iconElt) {
            return;
          }
          isDragging = null;
          resetIconPosition();
        }
      );
      addAbortableEventListener(
        document.documentElement,
        "click",
        abortSignal,
        () => {
          if (isDragging !== iconElt) {
            return;
          }
          isDragging = null;
          resetIconPosition();
        }
      );
    }
    function onStart(iconElt, { clientX, clientY }) {
      if (!SETTINGS.moveAroundIcons.getValue()) {
        return;
      }
      isDragging = iconElt;
      blockElementsFromTakingPointerEvents();
      const topOffset = SETTINGS.taskbarLocation.getValue() === "top" ? SETTINGS.taskbarSize.getValue() : 0;
      const leftOffset = SETTINGS.taskbarLocation.getValue() === "left" ? SETTINGS.taskbarSize.getValue() : 0;
      iconElt.style.transition = "";
      dragBaseLeft = parseInt(iconElt.style.left);
      dragBaseTop = parseInt(iconElt.style.top);
      updatedLeft = dragBaseLeft;
      updatedTop = dragBaseTop;
      offsetX = clientX - dragBaseLeft + leftOffset;
      offsetY = clientY - dragBaseTop + topOffset;
    }
    function onMove(iconElt, { clientX, clientY }) {
      const newX = clientX - offsetX;
      const newY = clientY - offsetY;
      const { maxX, maxY } = getMaxIconPosition(iconElt);
      const newLeft = Math.max(0, Math.min(newX, maxX));
      const newTop = Math.max(0, Math.min(newY, maxY));
      iconElt.style.left = `${newLeft}px`;
      iconElt.style.top = `${newTop}px`;
      const newRight = newLeft + width;
      const newBottom = newTop + height;
      for (const child of iconElts) {
        if (child === iconElt) {
          continue;
        }
        const childLeft = parseInt(child.style.left);
        const childTop = parseInt(child.style.top);
        const isOverlapping = !(newRight < childLeft || newLeft > childLeft + width || newBottom < childTop || newTop > childTop + height);
        if (isOverlapping) {
          if (Math.abs(childLeft - newLeft) < width / 2 && Math.abs(childTop - newTop) < height / 2) {
            let resettedChild;
            if (tempMovedElt) {
              tempMovedElt.element.style.left = tempMovedElt.from.left;
              tempMovedElt.element.style.top = tempMovedElt.from.top;
              if (tempMovedElt.element === child) {
                resettedChild = true;
              }
            }
            if (!resettedChild) {
              tempMovedElt = {
                element: child,
                from: {
                  left: child.style.left,
                  top: child.style.top
                }
              };
              child.style.transition = "background-color 0.2s, top 0.2s, left 0.2s";
              child.style.left = `${dragBaseLeft}px`;
              child.style.top = `${dragBaseTop}px`;
            } else {
              tempMovedElt = null;
            }
            updatedLeft = childLeft;
            updatedTop = childTop;
          }
          break;
        }
      }
    }
    function resetIconPosition(iconElt) {
      iconElt.style.transition = "background-color 0.2s, top 0.2s, left 0.2s";
      iconElt.style.zIndex = "";
      iconElt.style.left = `${updatedLeft}px`;
      iconElt.style.top = `${updatedTop}px`;
      dragBaseLeft = updatedLeft;
      dragBaseTop = updatedTop;
    }
  }
  function addContainerContextMenu(containerElt, onOpen, abortSignal) {
    setUpContextMenu({
      element: containerElt,
      filter: (e) => e.target === containerElt,
      abortSignal,
      actions: getBasicContextMenuActions(onOpen)
    });
  }
  function getBasicContextMenuActions(onOpen) {
    return [
      {
        name: "reset",
        title: "Reset desktop icons to default",
        svg: resetSvg,
        onClick: async () => {
          try {
            await filesystem_default.rmFile(USER_DESKTOP_CONFIG);
          } catch (err) {
            notification_emitter_default.error(
              "Desktop icons reset",
              "Failed to reset desktop icons: " + err.toString()
            );
          }
        }
      },
      {
        name: "add",
        title: "Add desktop icons",
        svg: `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        onClick: () => {
          onOpen("/apps/add-desktop-icon.run", []);
        }
      },
      {
        name: "clear",
        title: "Clear all icons",
        onClick: async () => {
          try {
            await filesystem_default.writeFile(
              USER_DESKTOP_CONFIG,
              JSON.stringify({ list: [] }, null, 2)
            );
          } catch (err) {
            notification_emitter_default.error(
              "Desktop icons clear",
              "Failed to clear desktop icons: " + err.toString()
            );
          }
        }
      },
      { name: "separator" },
      {
        name: "settings",
        title: "Open settings",
        svg: settingsSvg,
        onClick: () => {
          onOpen("/apps/settings.run", []);
        }
      },
      {
        name: "fullscreen",
        title: "Toggle fullscreen",
        onClick: () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.body.requestFullscreen();
          }
        }
      },
      {
        name: "code",
        title: "Go to the project's code repository",
        onClick: () => window.open(PROJECT_REPO, "_blank")
      }
    ];
  }

  // src/components/StartMenu.mjs
  var currentStartState = "closed";
  var startButtonElt = document.getElementById("start-button");
  var startPicElt = document.getElementById("start-pic");
  var startMenuElt = document.getElementById("start-menu");
  async function StartMenu(openApp, abortSignal) {
    const startMenuApps = await filesystem_default.readFile(
      "/system32/start_menu.config.json",
      "object"
    );
    const apps = startMenuApps.list;
    refreshStartMenu(startMenuElt, apps, openApp, {
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth
    });
    const onDocumentClick = (evt) => {
      if (evt.target === startMenuElt || startMenuElt.contains(evt.target) || evt.target === startButtonElt || startButtonElt.contains(evt.target)) {
        return;
      }
      closeStartMenu(startMenuElt);
    };
    const onStartButtonClick = () => {
      switch (currentStartState) {
        case "opening":
        case "opened":
          closeStartMenu(startMenuElt);
          break;
        default:
          startPicElt.style.animation = "SPEEN 0.3s ease-in-out";
          startPicElt.onanimationend = () => {
            startPicElt.style.animation = "";
          };
          openStartMenu(startMenuElt);
          break;
      }
    };
    const scheduleRefresh = () => {
      requestAnimationFrame(() => {
        refreshStartMenu(startMenuElt, apps, openApp, {
          clientHeight: document.documentElement.clientHeight,
          clientWidth: document.documentElement.clientWidth
        });
      });
    };
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    startButtonElt.addEventListener("click", onStartButtonClick);
    startButtonElt.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onStartButtonClick();
      }
    });
    window.addEventListener("resize", scheduleRefresh);
    startMenuElt.addEventListener("mousedown", onMouseDown);
    SETTINGS.enableStartMenuSublists.onUpdate(scheduleRefresh, {
      clearSignal: abortSignal
    });
    SETTINGS.taskbarSize.onUpdate(scheduleRefresh, {
      clearSignal: abortSignal
    });
    SETTINGS.taskbarLocation.onUpdate(scheduleRefresh, {
      clearSignal: abortSignal
    });
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        startMenuElt.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("click", onDocumentClick);
        document.removeEventListener("keydown", onKeyDown);
        startButtonElt.removeEventListener("click", onStartButtonClick);
        window.removeEventListener("resize", scheduleRefresh);
      });
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        closeStartMenu(startMenuElt);
      }
    }
    function onMouseDown(e) {
      if (e.button) {
        return;
      }
      e.preventDefault();
    }
  }
  function openStartMenu(startMenuElt2) {
    if (currentStartState === "opening" || currentStartState === "opened") {
      return;
    }
    currentStartState = "opening";
    startMenuElt2.style.display = "flex";
    switch (SETTINGS.taskbarLocation.getValue()) {
      case "bottom":
        startMenuElt2.style.animation = "openStartAnim " + String(START_MENU_OPEN_ANIM_TIMER / 1e3) + "s ease-out";
        break;
      default:
        startMenuElt2.style.animation = "openStartFromTopAnim " + String(START_MENU_OPEN_ANIM_TIMER / 1e3) + "s ease-out";
        break;
    }
    startMenuElt2.onanimationend = () => {
      if (currentStartState !== "opening") {
        return;
      }
      currentStartState = "opened";
      if (startMenuElt2.style.display === "flex") {
        startMenuElt2.classList.add("active");
      }
    };
  }
  function closeStartMenu(startMenuElt2) {
    if (currentStartState === "closing" || currentStartState === "closed") {
      return;
    }
    currentStartState = "closing";
    startMenuElt2.classList.remove("active");
    const sublists = startMenuElt2.getElementsByClassName("s-list");
    const animation = SETTINGS.taskbarLocation.getValue() === "bottom" ? "closeStartAnim " + String(CLOSE_MENU_OPEN_ANIM_TIMER / 1e3) + "s ease-out" : "closeStartFromTopAnim " + String(CLOSE_MENU_OPEN_ANIM_TIMER / 1e3) + "s ease-out";
    startMenuElt2.style.animation = animation;
    startMenuElt2.onanimationend = () => {
      const mainItems = startMenuElt2.getElementsByClassName("start-menu-items");
      for (const mainItem of mainItems) {
        mainItem.style.display = "block";
      }
      for (const list of sublists) {
        list.classList.remove("active");
      }
      if (currentStartState !== "closing") {
        return;
      }
      currentStartState = "closed";
      if (!startMenuElt2.classList.contains("active")) {
        startMenuElt2.style.display = "none";
      }
    };
  }
  function refreshStartMenu(startMenuElt2, apps, openApp, { clientHeight, clientWidth, dependentSubLists }) {
    startMenuElt2.innerHTML = "";
    const startMenuHeaderElt = document.createElement("div");
    startMenuHeaderElt.className = "start-header";
    startMenuHeaderElt.textContent = "Paul's Web Desktop";
    startMenuHeaderElt.style.height = String(START_ITEM_HEIGHT) + "px";
    startMenuHeaderElt.style.display = "flex";
    startMenuHeaderElt.style.alignItems = "center";
    const startMenuItemsElt = document.createElement("div");
    startMenuItemsElt.className = "start-menu-items";
    startMenuItemsElt.style.overflow = "auto";
    const doesTaskbarInfluencesMaxHeight = ["top", "bottom"].includes(
      SETTINGS.taskbarLocation.getValue()
    );
    const separatedSublists = !dependentSubLists && clientWidth - (doesTaskbarInfluencesMaxHeight ? 0 : SETTINGS.taskbarSize.getValue()) >= 10 + 250 + 200;
    const itemsWrapperElt = document.createElement("div");
    itemsWrapperElt.appendChild(startMenuItemsElt);
    itemsWrapperElt.style.overflow = "auto";
    if (SETTINGS.taskbarLocation.getValue() !== "top") {
      startMenuElt2.appendChild(startMenuHeaderElt);
    }
    startMenuElt2.appendChild(itemsWrapperElt);
    for (let currentIdx = 0; currentIdx < apps.length; currentIdx++) {
      const appObj = apps[currentIdx];
      if (appObj.type === "application") {
        startMenuItemsElt.appendChild(constructAppItem(appObj));
      } else if (appObj.type === "sublist") {
        if (!SETTINGS.enableStartMenuSublists.getValue()) {
          for (const subAppObj of appObj.list) {
            startMenuItemsElt.appendChild(constructAppItem(subAppObj));
          }
        } else {
          const listIconElt = document.createElement("div");
          listIconElt.className = "start-icon";
          switch (appObj.name) {
            case "Games":
              listIconElt.textContent = "\u{1F3AE}";
              break;
            case "My Other Projects":
              listIconElt.textContent = "\u{1F468}\u200D\u{1F4BB}";
              break;
            case "External Apps":
              listIconElt.textContent = "\u{1F4E1}";
              break;
            case "Misc":
              listIconElt.textContent = "\u23F0";
              break;
            default:
              listIconElt.textContent = "\u{1F5C3}\uFE0F";
              break;
          }
          const listTitleElt = document.createElement("div");
          listTitleElt.style.display = "flex";
          listTitleElt.style.alignItems = "center";
          listTitleElt.className = "start-title";
          listTitleElt.textContent = appObj.name;
          const startItemListElt = document.createElement("div");
          startItemListElt.className = "start-item start-item-list";
          startItemListElt.style.height = String(START_ITEM_HEIGHT) + "px";
          startItemListElt.appendChild(listIconElt);
          startItemListElt.appendChild(listTitleElt);
          startMenuItemsElt.appendChild(startItemListElt);
          const list = document.createElement("div");
          list.className = "s-list";
          let baseYOffset = 0;
          const listItemsWrapper = document.createElement("div");
          listItemsWrapper.className = "s-list-wrapper";
          list.appendChild(listItemsWrapper);
          startMenuElt2.appendChild(list);
          for (const subAppObj of appObj.list) {
            listItemsWrapper.appendChild(constructAppItem(subAppObj));
          }
          if (separatedSublists) {
            listItemsWrapper.style.maxHeight = String(clientHeight - baseYOffset) + "px";
            if (SETTINGS.taskbarLocation.getValue() === "bottom") {
              list.style.bottom = String((apps.length - 1 - currentIdx) * START_ITEM_HEIGHT) + "px";
            } else {
              const offset = SETTINGS.taskbarLocation.getValue() === "top" ? 0 : START_ITEM_HEIGHT;
              list.style.top = String(offset + currentIdx * START_ITEM_HEIGHT) + "px";
            }
            startItemListElt.onmouseenter = () => {
              if (!startMenuElt2.classList.contains("active")) {
                return;
              }
              list.classList.add("active");
            };
            list.onmouseleave = (e) => {
              if (!list.contains(e.relatedTarget)) {
                list.classList.remove("active");
              }
            };
            startItemListElt.onmouseleave = (e) => {
              if (!list.contains(e.relatedTarget)) {
                list.classList.remove("active");
              }
            };
            const listHeight = Math.min(
              baseYOffset + START_ITEM_HEIGHT * appObj.list.length,
              clientHeight
            );
            if (SETTINGS.taskbarLocation.getValue() === "bottom") {
              const totalTop = (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) + (apps.length - 1 - currentIdx) * START_ITEM_HEIGHT + listHeight;
              if (clientHeight < totalTop) {
                listItemsWrapper.style.marginBottom = "-" + String(totalTop - clientHeight) + "px";
              }
            } else {
              const totalBottom = (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) + (apps.length - 1 - currentIdx) * START_ITEM_HEIGHT + listHeight;
              if (clientHeight < totalBottom) {
                listItemsWrapper.style.marginTop = "-" + String(totalBottom - clientHeight) + "px";
              }
            }
          } else {
            listItemsWrapper.style.width = "100%";
            list.classList.add("dependent");
            const backToMenuElt = document.createElement("div");
            backToMenuElt.className = "start-item start-item-back";
            backToMenuElt.tabIndex = "0";
            backToMenuElt.style.height = String(START_ITEM_HEIGHT) + "px";
            backToMenuElt.textContent = "Back to menu";
            listItemsWrapper.prepend(backToMenuElt);
            backToMenuElt.onclick = () => {
              startMenuItemsElt.style.display = "block";
              list.classList.remove("active");
            };
            startItemListElt.onclick = () => {
              startMenuItemsElt.style.display = "none";
              list.classList.add("active");
            };
          }
        }
      }
    }
    if (separatedSublists && (doesTaskbarInfluencesMaxHeight ? SETTINGS.taskbarSize.getValue() : 0) + apps.length * START_ITEM_HEIGHT > clientHeight) {
      return refreshStartMenu(startMenuElt2, apps, openApp, {
        clientHeight,
        clientWidth,
        dependentSubLists: true
      });
    }
    if (SETTINGS.taskbarLocation.getValue() === "top") {
      startMenuElt2.appendChild(startMenuHeaderElt);
    }
    function constructAppItem(appObj) {
      const startItemElt = document.createElement("div");
      startItemElt.className = "start-item";
      startItemElt.tabIndex = "0";
      startItemElt.style.height = String(START_ITEM_HEIGHT) + "px";
      const startIconElt = document.createElement("div");
      startIconElt.className = "start-icon";
      startIconElt.textContent = appObj.icon;
      const startTitleElt = document.createElement("div");
      startTitleElt.className = "start-title";
      startTitleElt.textContent = appObj.title;
      startItemElt.appendChild(startIconElt);
      startItemElt.appendChild(startTitleElt);
      startItemElt.addEventListener("click", () => {
        closeStartMenu(startMenuElt2);
        openApp(appObj.run, appObj.args);
      });
      startItemElt.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          closeStartMenu(startMenuElt2);
          openApp(appObj.run, appObj.args);
        }
      });
      return startItemElt;
    }
  }

  // src/components/Taskbar.mjs
  var Taskbar = class {
    /**
     * @param {Object} [opts={}]
     * @param {Array.<HTMLElement>} [opts.applets] - HTMLElements which will be
     * inserted to the right of the taskbar
     */
    constructor(opts = {}) {
      this._abortController = new AbortController();
      const taskbarElt = document.getElementById("taskbar");
      if (opts.applets) {
        const taskbarLastElt = document.getElementById("taskbar-last");
        for (const applet of opts.applets) {
          taskbarLastElt.appendChild(applet);
        }
      }
      this._taskbarItemsElt = taskbarElt.getElementsByClassName("taskbar-items")[0];
      addResizeHandle(taskbarElt, this._abortController.signal);
      handleTaskbarMove(taskbarElt, this._abortController.signal);
      this._eltPerHandle = /* @__PURE__ */ new WeakMap();
      this._appCallbacksPerElt = /* @__PURE__ */ new WeakMap();
      this._setupContextMenu();
    }
    /**
     * Add an item to the taskbar's tasks.
     * @param {Object} windowHandle - Handle for the corresponding opened window.
     * Give the same reference anytime you wish to update an aspect of it.
     * @param {Object} appText - Strings to write for the task.
     * @param {string} appText.icon - Icon of the application, as an unicode
     * emoji probably.
     * @param {string} appText.title - Title of the application.
     * @param {Object} callbacks - Callbacks to interact with the window from the
     * taskbar.
     */
    addWindow(windowHandle, { icon, title }, callbacks) {
      const itemElt = document.createElement("div");
      this._appCallbacksPerElt.set(itemElt, callbacks);
      itemElt.className = "taskbar-item";
      itemElt.tabIndex = "0";
      itemElt.addEventListener("mousedown", (evt) => {
        if (evt && evt.button == 1) {
          callbacks.closeWindow();
        }
      });
      const toggleAppActivation = () => {
        if (callbacks.isWindowMinimized()) {
          callbacks.restoreWindow();
          callbacks.activateWindow();
        } else if (callbacks.isWindowActivated()) {
          callbacks.minimizeWindow();
        } else {
          callbacks.activateWindow();
        }
      };
      itemElt.addEventListener("click", (evt) => {
        if (evt && evt.button == 1) {
          return;
        }
        toggleAppActivation();
      });
      itemElt.addEventListener("keydown", (evt) => {
        if (evt.key === " " || evt.key === "Enter") {
          toggleAppActivation();
        }
      });
      const iconElt = document.createElement("span");
      iconElt.className = "taskbar-item-text taskbar-item-icon";
      iconElt.textContent = icon;
      const titleElt = document.createElement("span");
      titleElt.className = "taskbar-item-text taskbar-item-title";
      titleElt.textContent = title;
      itemElt.appendChild(iconElt);
      itemElt.appendChild(titleElt);
      this._eltPerHandle.set(windowHandle, itemElt);
      this._taskbarItemsElt.appendChild(itemElt);
    }
    /**
     * Update the title and icon of a specific window in the taskbar.
     * @param {string} windowHandle - The `windowHandle` (@see `addWindow`) of the
     * window whose title should be updated.
     * @param {string|null} icon - The icon, as a single character (generally an
     * emoji). `null` if it shouldn't be changed
     * @param {string} title - The title of the application.
     */
    updateTitle(windowHandle, icon, title) {
      const itemElt = this._eltPerHandle.get(windowHandle);
      if (!itemElt) {
        return;
      }
      const iconElt = itemElt.getElementsByClassName("taskbar-item-icon");
      if (icon !== null && iconElt.length) {
        iconElt[0].textContent = icon;
      }
      const titleElt = itemElt.getElementsByClassName("taskbar-item-title");
      if (titleElt.length) {
        titleElt[0].textContent = title;
      }
    }
    /**
     * Change the active window or deactivate all windows.
     * @param {string|null} windowHandle - The `windowHandle` for the window you
     * wish to activate, or `null` if no window should be activated.
     */
    setActiveWindow(windowHandle) {
      const itemElt = this._eltPerHandle.get(windowHandle);
      for (const currItemElt of this._taskbarItemsElt.getElementsByClassName(
        "taskbar-item"
      )) {
        if (currItemElt === itemElt) {
          currItemElt.classList.add("active");
        } else {
          currItemElt.classList.remove("active");
        }
      }
    }
    /**
     * "Deactivate" visually a specific window in the taskbar.
     * @param {string} windowHandle - The `windowHandle` (@see `addWindow`) of
     * the window which should be deactivated.
     */
    deActiveWindow(windowHandle) {
      const itemElt = this._eltPerHandle.get(windowHandle);
      if (itemElt) {
        itemElt.classList.remove("active");
      }
    }
    /**
     * @param {string} windowHandle
     * @returns {DOMRect|null}
     */
    getTaskBoundingClientRect(windowHandle) {
      const itemElt = this._eltPerHandle.get(windowHandle);
      if (itemElt) {
        return itemElt.getBoundingClientRect();
      }
      return null;
    }
    /**
     * Remove a window from the taskbar.
     * @param {string} windowHandle - The `windowHandle` (@see `addWindow`) of the
     * window that should be removed.
     */
    remove(windowHandle) {
      const itemElt = this._eltPerHandle.get(windowHandle);
      if (itemElt) {
        itemElt.remove();
      }
    }
    /**
     * Free resources maintained by this Taskbar.
     */
    dispose() {
      this._abortController.abort();
      this._taskbarItemsElt.innerHTML = "";
      const taskbarLastElt = document.getElementById("taskbar-last");
      taskbarLastElt.innerHTML = "";
    }
    _setupContextMenu() {
      const taskbarElt = document.getElementById("taskbar");
      setUpContextMenu({
        element: taskbarElt,
        // filter: (e) => e.target === taskbarElt,
        abortSignal: this._abortController.signal,
        actions: [
          // TODO: toggle start menu, adapt if there's actually tasks?
          {
            name: "minimize",
            title: "Minimize all windows",
            onClick: () => {
              for (const elt of this._taskbarItemsElt.children) {
                const cbs = this._appCallbacksPerElt.get(elt);
                if (!cbs?.isWindowMinimized()) {
                  cbs.minimizeWindow();
                }
              }
            }
          },
          {
            name: "restore",
            title: "Restore all windows",
            height: "1.3rem",
            svg: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-220.000000, -6919.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M172,6769.586 L176.586,6765 L172,6765 L172,6763 L180,6763 L180,6771 L178,6771 L178,6766.414 L173.414,6771 L172,6769.586 Z M166,6761 L182,6761 L182,6777 L172,6777 L172,6771 L166,6771 L166,6761 Z M164,6779 L184,6779 L184,6759 L164,6759 L164,6779 Z"></path></g></g></g></svg>`,
            onClick: () => {
              for (const elt of this._taskbarItemsElt.children) {
                const cbs = this._appCallbacksPerElt.get(elt);
                if (cbs?.isWindowMinimized()) {
                  cbs.restoreWindow();
                }
              }
            }
          },
          {
            name: "close",
            title: "Close all windows",
            onClick: () => {
              for (let i = this._taskbarItemsElt.children.length; i >= 0; i--) {
                const cbs = this._appCallbacksPerElt.get(
                  this._taskbarItemsElt.children[i]
                );
                cbs?.closeWindow();
              }
            }
          }
        ]
      });
    }
  };
  function addResizeHandle(elt, abortSignal) {
    const handle = document.createElement("div");
    handle.className = "taskbar-resize-handle";
    elt.appendChild(handle);
    let taskbarLocation2;
    let isTaskbarHorizontal;
    let shouldDecreaseDeltaToIncreaseSize;
    let startX;
    let startY;
    let startHeight;
    let startWidth;
    abortSignal.addEventListener("abort", stopResize);
    addAbortableEventListener(window, "resize", abortSignal, stopResize);
    SETTINGS.taskbarLocation.onUpdate(
      () => {
        taskbarLocation2 = SETTINGS.taskbarLocation.getValue();
        isTaskbarHorizontal = ["top", "bottom"].includes(taskbarLocation2);
        shouldDecreaseDeltaToIncreaseSize = ["bottom", "right"].includes(
          taskbarLocation2
        );
      },
      { emitCurrentValue: true }
    );
    handle.addEventListener("mousedown", (e) => {
      if (e.button) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      blockElementsFromTakingPointerEvents();
      startX = e.clientX;
      startY = e.clientY;
      startHeight = isTaskbarHorizontal ? SETTINGS.taskbarSize.getValue() : document.documentElement.clientHeight;
      startWidth = !isTaskbarHorizontal ? SETTINGS.taskbarSize.getValue() : document.documentElement.clientWidth;
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
    });
    function resize(e) {
      requestAnimationFrame(() => {
        if (isTaskbarHorizontal) {
          const deltaY = e.clientY - startY;
          const minHeight = TASKBAR_MIN_HORIZONTAL_SIZE;
          const newHeight = Math.min(
            Math.max(
              minHeight,
              shouldDecreaseDeltaToIncreaseSize ? startHeight - deltaY : startHeight + deltaY
            ),
            TASKBAR_MAX_HORIZONTAL_SIZE
          );
          SETTINGS.taskbarSize.setValueIfChanged(Math.floor(newHeight));
        } else {
          const deltaX = e.clientX - startX;
          const minWidth = TASKBAR_MIN_VERTICAL_SIZE;
          const newWidth = Math.min(
            Math.max(
              minWidth,
              shouldDecreaseDeltaToIncreaseSize ? startWidth - deltaX : startWidth + deltaX
            ),
            TASKBAR_MAX_VERTICAL_SIZE
          );
          SETTINGS.taskbarSize.setValueIfChanged(Math.floor(newWidth));
        }
      });
    }
    function stopResize() {
      unblockElementsFromTakingPointerEvents();
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    }
  }
  function handleTaskbarMove(taskbarElt, abortSignal) {
    let isDragging = false;
    let containerWidth;
    let containerHeight;
    const stopDragging = () => {
      isDragging = false;
      taskbarElt.style.cursor = "";
    };
    abortSignal.addEventListener("abort", stopDragging);
    addAbortableEventListener(
      taskbarElt,
      "touchstart",
      abortSignal,
      () => {
        startDraggingTaskbar();
      },
      { passive: true }
    );
    addAbortableEventListener(taskbarElt, "touchend", abortSignal, stopDragging);
    addAbortableEventListener(
      taskbarElt,
      "touchcancel",
      abortSignal,
      stopDragging
    );
    addAbortableEventListener(
      taskbarElt,
      "touchmove",
      abortSignal,
      (e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          moveDraggedTaskbar(touch.clientX, touch.clientY);
        }
      },
      { passive: true }
    );
    addAbortableEventListener(taskbarElt, "selectstart", abortSignal, (e) => {
      e.preventDefault();
    });
    addAbortableEventListener(taskbarElt, "mousedown", abortSignal, (e) => {
      if (e.button !== 0) {
        return;
      }
      e.preventDefault();
      startDraggingTaskbar();
    });
    addAbortableEventListener(
      document.documentElement,
      "mouseleave",
      abortSignal,
      stopDragging
    );
    addAbortableEventListener(
      document.documentElement,
      "mouseenter",
      abortSignal,
      stopDragging
    );
    addAbortableEventListener(
      document.documentElement,
      "click",
      abortSignal,
      stopDragging
    );
    addAbortableEventListener(document, "mousemove", abortSignal, (e) => {
      if (!isDragging) {
        return;
      }
      e.preventDefault();
      moveDraggedTaskbar(e.clientX, e.clientY);
    });
    addAbortableEventListener(taskbarElt, "mouseup", abortSignal, stopDragging);
    addAbortableEventListener(window, "resize", abortSignal, stopDragging);
    function startDraggingTaskbar() {
      if (!SETTINGS.allowManualTaskbarMove.getValue()) {
        return;
      }
      isDragging = true;
      taskbarElt.style.cursor = "move";
      containerWidth = document.documentElement.clientWidth;
      containerHeight = document.documentElement.clientHeight;
    }
    function moveDraggedTaskbar(clientX, clientY) {
      const taskbarSize = SETTINGS.taskbarSize.getValue();
      if (containerHeight - clientY <= taskbarSize) {
        SETTINGS.taskbarLocation.setValueIfChanged("bottom");
      } else if (clientY <= taskbarSize) {
        SETTINGS.taskbarLocation.setValueIfChanged("top");
      } else if (clientX <= taskbarSize) {
        SETTINGS.taskbarLocation.setValueIfChanged("left");
      } else if (containerWidth - clientX <= taskbarSize) {
        SETTINGS.taskbarLocation.setValueIfChanged("right");
      }
    }
  }

  // src/components/window/position_utils.mjs
  function setWindowWidth(windowElt, widthPx) {
    if (SETTINGS.absoluteWindowSize.getValue()) {
      windowElt.style.width = String(widthPx) + "px";
    } else {
      windowElt.style.width = String(widthPx / getMaxDesktopWidth() * 100) + "%";
    }
  }
  function isPercentWidthSized(windowElt) {
    return windowElt.style.width && windowElt.style.width.endsWith("%");
  }
  function getWindowWidth(windowElt) {
    if (isPercentWidthSized(windowElt)) {
      const initialWidth = parseFloat(windowElt.style.width, 10) / 100;
      return initialWidth * getMaxDesktopWidth();
    } else {
      return parseFloat(windowElt.style.width, 10);
    }
  }
  function setWindowHeight(windowElt, heightPx) {
    if (SETTINGS.absoluteWindowSize.getValue()) {
      windowElt.style.height = String(heightPx) + "px";
    } else {
      windowElt.style.height = String(heightPx / getMaxDesktopHeight() * 100) + "%";
    }
  }
  function isPercentHeightSized(windowElt) {
    return windowElt.style.height && windowElt.style.height.endsWith("%");
  }
  function getWindowHeight(windowElt) {
    if (isPercentHeightSized(windowElt)) {
      const initialHeight = parseFloat(windowElt.style.height, 10) / 100;
      return initialHeight * getMaxDesktopHeight();
    } else {
      return parseFloat(windowElt.style.height, 10);
    }
  }
  function setLeftPositioning(windowElt, leftPx) {
    if (SETTINGS.absoluteWindowPositioning.getValue()) {
      windowElt.style.left = String(leftPx) + "px";
    } else {
      windowElt.style.left = String(leftPx / getMaxDesktopWidth() * 100) + "%";
    }
  }
  function isPercentLeftPositioned(windowElt) {
    return windowElt.style.left && windowElt.style.left.endsWith("%");
  }
  function getLeftPositioning(windowElt) {
    const clientWidth = document.documentElement.clientWidth;
    if (isPercentLeftPositioned(windowElt)) {
      const initialLeft = parseFloat(windowElt.style.left, 10) / 100;
      return initialLeft * clientWidth;
    } else {
      return parseFloat(windowElt.style.left, 10);
    }
  }
  function isPercentTopPositioned(windowElt) {
    return windowElt.style.top && windowElt.style.top.endsWith("%");
  }
  function getTopPositioning(windowElt) {
    if (isPercentTopPositioned(windowElt)) {
      const initialTop = parseFloat(windowElt.style.top, 10) / 100;
      return initialTop * getMaxDesktopHeight();
    } else {
      return parseFloat(windowElt.style.top, 10);
    }
  }
  function setTopPositioning(windowElt, topPx) {
    if (SETTINGS.absoluteWindowPositioning.getValue()) {
      windowElt.style.top = String(topPx) + "px";
    } else {
      windowElt.style.top = String(topPx / getMaxDesktopHeight() * 100) + "%";
    }
  }
  function getMaxWindowPositions(windowElt) {
    const maxWidth = getMaxDesktopWidth();
    const maxHeight = getMaxDesktopHeight();
    const maxXBound = maxWidth - getWindowWidth(windowElt);
    const maxYBound = maxHeight - getWindowHeight(windowElt);
    if (SETTINGS.oobWindows.getValue()) {
      return {
        maxX: maxWidth - WINDOW_OOB_SECURITY_PIX,
        maxY: maxHeight - (SETTINGS.windowBorderSize.getValue() + WINDOW_OOB_SECURITY_PIX),
        maxXBound,
        maxYBound,
        maxHeight,
        maxWidth
      };
    }
    return {
      maxX: maxXBound,
      maxY: maxYBound,
      maxXBound,
      maxYBound,
      maxHeight,
      maxWidth
    };
  }
  function getMinWindowPositions(windowElt) {
    if (!SETTINGS.oobWindows.getValue()) {
      return { minX: 0, minY: 0, minXBound: 0, minYBound: 0 };
    }
    return {
      minX: 0 - getWindowWidth(windowElt) + WINDOW_OOB_SECURITY_PIX,
      minY: 0 - Math.max(SETTINGS.windowHeaderHeight.getValue() - 15, 0),
      minXBound: 0,
      minYBound: 0
    };
  }
  function calculateOutOfBounds({ minXBound, minYBound }, { maxXBound, maxYBound }, newLeft, newTop) {
    const oobDistances = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    if (newLeft >= minXBound && newLeft <= maxXBound) {
      oobDistances.left = 0;
      oobDistances.right = 0;
    } else {
      if (newLeft < minXBound) {
        oobDistances.left = minXBound - newLeft;
      }
      if (newLeft > maxXBound) {
        oobDistances.right = newLeft - maxXBound;
      }
    }
    if (newTop >= minYBound && newTop <= maxYBound) {
      oobDistances.top = 0;
      oobDistances.bottom = 0;
    } else {
      if (newTop < minYBound) {
        oobDistances.top = minYBound - newTop;
      }
      if (newTop > maxYBound) {
        oobDistances.bottom = newTop - maxYBound;
      }
    }
    return oobDistances;
  }
  function getMaxDesktopHeight() {
    return ["top", "bottom"].includes(SETTINGS.taskbarLocation.getValue()) ? document.documentElement.clientHeight - SETTINGS.taskbarSize.getValue() : document.documentElement.clientHeight;
  }
  function getMaxDesktopWidth() {
    return ["left", "right"].includes(SETTINGS.taskbarLocation.getValue()) ? document.documentElement.clientWidth - SETTINGS.taskbarSize.getValue() : document.documentElement.clientWidth;
  }

  // src/components/window/fullscreen.mjs
  function isFullscreen(windowElt) {
    return windowElt.classList.contains("fullscreen");
  }
  function isFullscreenFull(windowElt) {
    return windowElt.classList.contains("fs-full");
  }
  function isFullscreenLeft(windowElt) {
    return windowElt.classList.contains("fs-left");
  }
  function isFullscreenRight(windowElt) {
    return windowElt.classList.contains("fs-right");
  }
  function enterFullFullScreen(windowElt) {
    windowElt.style.left = "0";
    windowElt.style.top = "0";
    windowElt.style.width = "100%";
    windowElt.style.height = "100%";
    windowElt.classList.add("fullscreen");
    windowElt.classList.add("fs-full");
    windowElt.classList.remove("fs-left");
    windowElt.classList.remove("fs-right");
  }
  function enterLeftFullScreen(windowElt) {
    windowElt.style.left = "0";
    windowElt.style.top = "0";
    windowElt.style.width = "50%";
    windowElt.style.height = "100%";
    windowElt.classList.add("fullscreen");
    windowElt.classList.add("fs-left");
    windowElt.classList.remove("fs-right");
    windowElt.classList.remove("fs-full");
  }
  function enterRightFullScreen(windowElt) {
    windowElt.style.left = "50%";
    windowElt.style.top = "0";
    windowElt.style.width = "50%";
    windowElt.style.height = "100%";
    windowElt.classList.add("fullscreen");
    windowElt.classList.add("fs-right");
    windowElt.classList.remove("fs-left");
    windowElt.classList.remove("fs-full");
  }
  function exitAllFullScreens(windowElt, originalDimensions) {
    windowElt.classList.remove("fullscreen");
    windowElt.classList.remove("fs-full");
    windowElt.classList.remove("fs-left");
    windowElt.classList.remove("fs-right");
    if (originalDimensions) {
      setLeftPositioning(windowElt, originalDimensions.left);
      setTopPositioning(windowElt, originalDimensions.top);
      setWindowWidth(windowElt, originalDimensions.width);
      setWindowHeight(windowElt, originalDimensions.height);
    }
  }

  // src/components/window/snap_zone.mjs
  var snapZoneElt = document.getElementById("snap-zone");
  function activateFullScreenSnapping(windowElt) {
    initializeSnapZone(windowElt);
    snapZoneElt.style.animation = "fullScreenSnapping 0.4s ease-in-out";
    snapZoneElt.classList.add("active");
    snapZoneElt.classList.add("active-full");
    snapZoneElt.onanimationend = () => {
      snapZoneElt.style.animation = "";
      snapZoneElt.style.top = "0";
      snapZoneElt.style.left = "0";
      snapZoneElt.style.height = "100%";
      snapZoneElt.style.width = "100%";
    };
  }
  function activateLeftScreenSnapping(windowElt) {
    initializeSnapZone(windowElt);
    snapZoneElt.style.animation = "leftScreenSnapping 0.3s ease-in-out";
    snapZoneElt.classList.add("active");
    snapZoneElt.classList.add("active-left");
    snapZoneElt.onanimationend = () => {
      snapZoneElt.style.animation = "";
      snapZoneElt.style.top = "0";
      snapZoneElt.style.left = "0";
      snapZoneElt.style.height = "100%";
      snapZoneElt.style.width = "50%";
    };
  }
  function activateRightScreenSnapping(windowElt) {
    initializeSnapZone(windowElt);
    snapZoneElt.style.animation = "rightScreenSnapping 0.3s ease-in-out";
    snapZoneElt.classList.add("active");
    snapZoneElt.classList.add("active-right");
    snapZoneElt.onanimationend = () => {
      snapZoneElt.style.animation = "";
      snapZoneElt.style.top = "0";
      snapZoneElt.style.height = "100%";
      snapZoneElt.style.width = "50%";
      snapZoneElt.style.left = "50%";
    };
  }
  function disableSnappingZones() {
    snapZoneElt.classList.remove("active");
    snapZoneElt.classList.remove("active-full");
    snapZoneElt.classList.remove("active-left");
    snapZoneElt.classList.remove("active-right");
    snapZoneElt.style.animation = "";
    snapZoneElt.style.width = "";
    snapZoneElt.style.left = "";
    snapZoneElt.style.zIndex = "";
  }
  function isFullScreenSnapping() {
    return snapZoneElt.classList.contains("active-full");
  }
  function isLeftScreenSnapping() {
    return snapZoneElt.classList.contains("active-left");
  }
  function isRightScreenSnapping() {
    return snapZoneElt.classList.contains("active-right");
  }
  function initializeSnapZone(windowElt) {
    snapZoneElt.style.zIndex = parseInt(windowElt.style.zIndex, 10) - 1;
    snapZoneElt.style.top = String(getTopPositioning(windowElt)) + "px";
    snapZoneElt.style.left = String(getLeftPositioning(windowElt)) + "px";
    snapZoneElt.style.height = String(getWindowHeight(windowElt)) + "px";
    snapZoneElt.style.width = String(getWindowWidth(windowElt)) + "px";
  }

  // src/components/window/utils.mjs
  function keepWindowActiveInCurrentEventLoopIteration(windowElt) {
    windowElt.dataset.dontDisableOnLoop = true;
    setTimeout(() => {
      delete windowElt.dataset.dontDisableOnLoop;
    }, 0);
  }

  // src/components/window/resize_and_move.mjs
  function handleResizeAndMove(windowElt, minDimensions, callbacks, abortSignal) {
    handleMoveOnWindow(windowElt, minDimensions, callbacks, abortSignal);
    handleResizeOnWindow(windowElt, minDimensions, callbacks, abortSignal);
  }
  function handleMoveOnWindow(windowElt, { minWidth }, {
    activateWindow,
    updateOobDistances,
    exitFullScreen,
    saveCurrentCoordinates
  }, abortSignal) {
    let isDragging = false;
    let offsetX;
    let offsetY;
    let initialX;
    let initialY;
    let initialHeight;
    let initialWidth;
    let initialXPercent;
    let containerWidth;
    let containerHeight;
    abortSignal.addEventListener("abort", () => {
      isDragging = false;
      disableSnappingZones();
      unblockElementsFromTakingPointerEvents();
    });
    const header = windowElt.getElementsByClassName("w-header")[0];
    if (header) {
      const stopDragging = () => {
        isDragging = false;
        if (!isFullscreen(windowElt)) {
          saveCurrentCoordinates();
        }
        disableSnappingZones();
        unblockElementsFromTakingPointerEvents();
      };
      const validateWindowMovement = () => {
        if (!isDragging) {
          return;
        }
        if (isFullScreenSnapping()) {
          enterFullFullScreen(windowElt);
          keepWindowActiveInCurrentEventLoopIteration(windowElt);
        } else if (isLeftScreenSnapping()) {
          enterLeftFullScreen(windowElt);
          keepWindowActiveInCurrentEventLoopIteration(windowElt);
        } else if (isRightScreenSnapping()) {
          enterRightFullScreen(windowElt);
          keepWindowActiveInCurrentEventLoopIteration(windowElt);
        }
        stopDragging();
      };
      addAbortableEventListener(
        header,
        "touchstart",
        abortSignal,
        (e) => {
          const touch = e.touches[0];
          startDraggingWindow(touch.clientX, touch.clientY);
        },
        { passive: true }
      );
      addAbortableEventListener(
        header,
        "touchend",
        abortSignal,
        validateWindowMovement
      );
      addAbortableEventListener(header, "touchcancel", abortSignal, stopDragging);
      addAbortableEventListener(
        header,
        "touchmove",
        abortSignal,
        (e) => {
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            moveDraggedWindow(touch.clientX, touch.clientY);
          }
        },
        { passive: true }
      );
      addAbortableEventListener(header, "selectstart", abortSignal, (e) => {
        e.preventDefault();
      });
      addAbortableEventListener(header, "mousedown", abortSignal, (e) => {
        if (e.button !== 0) {
          return;
        }
        startDraggingWindow(e.clientX, e.clientY);
      });
      addAbortableEventListener(
        document.documentElement,
        "mouseleave",
        abortSignal,
        stopDragging
      );
      addAbortableEventListener(
        document.documentElement,
        "mouseenter",
        abortSignal,
        validateWindowMovement
      );
      addAbortableEventListener(
        document.documentElement,
        "click",
        abortSignal,
        validateWindowMovement
      );
      addAbortableEventListener(document, "mousemove", abortSignal, (e) => {
        if (!isDragging) {
          return;
        }
        moveDraggedWindow(e.clientX, e.clientY);
      });
      addAbortableEventListener(
        windowElt,
        "mouseup",
        abortSignal,
        validateWindowMovement
      );
      addAbortableEventListener(window, "resize", abortSignal, stopDragging);
    }
    function startDraggingWindow(clientX, clientY) {
      isDragging = true;
      if (!isFullscreen(windowElt)) {
        saveCurrentCoordinates();
      }
      blockElementsFromTakingPointerEvents();
      const initialLeft = getLeftPositioning(windowElt);
      const initialTop = getTopPositioning(windowElt);
      initialHeight = getWindowHeight(windowElt);
      initialWidth = getWindowWidth(windowElt);
      offsetX = clientX - initialLeft;
      offsetY = clientY - initialTop;
      initialXPercent = offsetX / initialWidth;
      initialX = clientX;
      initialY = clientY;
      const maxDimensions = getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue()
      );
      containerWidth = maxDimensions.maxWidth;
      containerHeight = maxDimensions.maxHeight;
      activateWindow();
    }
    function moveDraggedWindow(clientX, clientY) {
      const newX = clientX - offsetX;
      const newY = clientY - offsetY;
      const { minX, minY, minXBound, minYBound } = getMinWindowPositions(windowElt);
      const { maxX, maxY, maxXBound, maxYBound } = getMaxWindowPositions(windowElt);
      if (!isFullscreen(windowElt)) {
        const newLeft = Math.max(minX, Math.min(newX, maxX));
        if (newLeft >= minXBound && newLeft <= maxXBound) {
          updateOobDistances({ left: 0, right: 0 });
        } else {
          if (newLeft < minXBound) {
            updateOobDistances({ left: minXBound - newLeft });
          }
          if (newLeft > maxXBound) {
            updateOobDistances({ right: newLeft - maxXBound });
          }
        }
        const newTop = Math.max(minY, Math.min(newY, maxY));
        if (newTop >= minYBound && newTop <= maxYBound) {
          updateOobDistances({ top: 0, bottom: 0 });
        } else {
          if (newTop < minYBound) {
            updateOobDistances({ top: minYBound - newTop });
          }
          if (newTop > maxYBound) {
            updateOobDistances({ bottom: newTop - maxYBound });
          }
        }
        const windowLeft = Math.max(minX, Math.min(newX, maxX));
        setLeftPositioning(windowElt, windowLeft);
        const windowTop = Math.max(minY, Math.min(newY, maxY));
        setTopPositioning(windowElt, windowTop);
        checkSnapping({
          clientY,
          clientX,
          windowTop,
          windowLeft
        });
      } else if (Math.abs(clientX - initialX) > 30 || clientY - initialY > 30) {
        exitFullScreen();
        const newWidth = getWindowWidth(windowElt);
        const maxWindowPos = getMaxWindowPositions(windowElt);
        const newX2 = Math.max(
          minX,
          Math.min(clientX - initialXPercent * newWidth, maxWindowPos.maxX)
        );
        offsetX = clientX - newX2;
        initialX = clientX;
        moveDraggedWindow(clientX, clientY);
      }
    }
    function checkSnapping({ clientX, clientY, windowLeft, windowTop }) {
      if (SETTINGS.topWindowSnapping.getValue() && (initialWidth < containerWidth || initialHeight < containerHeight)) {
        const snapPosLimitTop = SETTINGS.oobWindows.getValue() ? clientY - 15 - (SETTINGS.taskbarLocation.getValue() === "top" ? SETTINGS.taskbarSize.getValue() : 0) : windowTop;
        if (snapPosLimitTop <= 0) {
          if (!isFullScreenSnapping()) {
            activateFullScreenSnapping(windowElt);
          }
          return;
        }
      }
      if (isFullScreenSnapping()) {
        disableSnappingZones();
      }
      if (SETTINGS.sideWindowSnapping.getValue() && containerWidth / 2 >= minWidth && initialWidth < containerWidth) {
        const snapPosLimitLeft = SETTINGS.oobWindows.getValue() ? clientX - 15 - (SETTINGS.taskbarLocation.getValue() === "left" ? SETTINGS.taskbarSize.getValue() : 0) : windowLeft;
        if (snapPosLimitLeft <= 0) {
          if (!isLeftScreenSnapping()) {
            activateLeftScreenSnapping(windowElt);
          }
          return;
        }
        if (isLeftScreenSnapping()) {
          disableSnappingZones();
        }
        const snapPosLimitRight = SETTINGS.oobWindows.getValue() ? clientX + 15 : windowLeft + initialWidth;
        if (snapPosLimitRight >= containerWidth) {
          if (!isRightScreenSnapping()) {
            activateRightScreenSnapping(windowElt);
          }
          return;
        }
      }
      if (isRightScreenSnapping()) {
        disableSnappingZones();
      }
    }
  }
  function handleResizeOnWindow(windowElt, { minHeight, minWidth }, { activateWindow, getOobDistances, exitFullScreen, saveCurrentCoordinates }, abortSignal) {
    for (const dir of ["n", "e", "s", "w", "ne", "nw", "se", "sw"]) {
      const handle = document.createElement("div");
      handle.className = `w-res-bord res-${dir}`;
      windowElt.appendChild(handle);
      setupResizeEvent(handle, dir);
    }
    function setupResizeEvent(handle, direction) {
      let startX;
      let startY;
      let startWidth;
      let startHeight;
      let startLeft;
      let startTop;
      let containerWidth;
      let containerHeight;
      abortSignal.addEventListener("abort", () => {
        unblockElementsFromTakingPointerEvents();
      });
      addAbortableEventListener(handle, "mousedown", abortSignal, (e) => {
        if (e.button) {
          return;
        }
        if (isFullscreenFull(windowElt)) {
          return;
        }
        windowElt.classList.add("resizing");
        e.stopPropagation();
        e.preventDefault();
        blockElementsFromTakingPointerEvents();
        activateWindow();
        startX = e.clientX;
        startY = e.clientY;
        const maxDimensions = getMaxDesktopDimensions(
          SETTINGS.taskbarLocation.getValue(),
          SETTINGS.taskbarSize.getValue()
        );
        containerWidth = maxDimensions.maxWidth;
        containerHeight = maxDimensions.maxHeight;
        startWidth = getWindowWidth(windowElt);
        startHeight = getWindowHeight(windowElt);
        startLeft = getLeftPositioning(windowElt);
        startTop = getTopPositioning(windowElt);
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", validateAndStopResize);
        document.addEventListener("click", validateAndStopResize);
        document.addEventListener("resize", validateAndStopResize);
      });
      const validateAndStopResize = () => {
        if (!isFullscreen(windowElt)) {
          saveCurrentCoordinates();
        } else if (isFullscreenLeft(windowElt)) {
          if (getWindowHeight(windowElt) < containerHeight || getLeftPositioning(windowElt) > 0) {
            exitFullScreen(true);
          }
        } else if (isFullscreenRight(windowElt)) {
          const windowWidth = getWindowWidth(windowElt);
          if (getWindowHeight(windowElt) < containerHeight || getLeftPositioning(windowElt) + windowWidth < containerWidth) {
            exitFullScreen(true);
          }
        }
        unblockElementsFromTakingPointerEvents();
        windowElt.classList.remove("resizing");
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", validateAndStopResize);
        document.removeEventListener("click", validateAndStopResize);
        document.removeEventListener("resize", validateAndStopResize);
      };
      const resize = (e) => {
        requestAnimationFrame(() => {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          let minPossibleWidth = minWidth;
          const oobDistances = getOobDistances();
          if (oobDistances.left > 0 || oobDistances.right > 0) {
            minPossibleWidth = Math.max(
              minPossibleWidth,
              WINDOW_OOB_SECURITY_PIX + Math.max(oobDistances.left, oobDistances.right)
            );
          }
          let minPossibleHeight = minHeight;
          if (oobDistances.bottom > 0) {
            minPossibleHeight = Math.max(
              minPossibleHeight,
              WINDOW_OOB_SECURITY_PIX + oobDistances.bottom
            );
          }
          if (direction.includes("e")) {
            const maxWidth = containerWidth - startLeft;
            const newWidth = Math.max(
              minPossibleWidth,
              Math.min(startWidth + deltaX, maxWidth)
            );
            setWindowWidth(windowElt, newWidth);
          }
          if (direction.includes("s")) {
            const maxHeight = containerHeight - startTop;
            const newHeight = Math.max(
              minPossibleHeight,
              Math.min(startHeight + deltaY, maxHeight)
            );
            setWindowHeight(windowElt, newHeight);
          }
          if (direction.includes("w")) {
            const newWidth = Math.max(
              minPossibleWidth,
              Math.min(startWidth - deltaX, startLeft + startWidth)
            );
            setWindowWidth(windowElt, newWidth);
            const deltaLeft = newWidth === minPossibleWidth && startWidth - deltaX < minPossibleWidth ? startWidth - minPossibleWidth : deltaX;
            setLeftPositioning(windowElt, Math.max(startLeft + deltaLeft, 0));
          }
          if (direction.includes("n")) {
            const newHeight = Math.max(
              minPossibleHeight,
              Math.min(startHeight - deltaY, startTop + startHeight)
            );
            setWindowHeight(windowElt, newHeight);
            const deltaTop = newHeight === minPossibleHeight && startHeight - deltaY < minPossibleHeight ? startHeight - minPossibleHeight : deltaY;
            setTopPositioning(windowElt, Math.max(startTop + deltaTop, 0));
          }
        });
      };
    }
  }

  // src/components/window/AppWindow.mjs
  var {
    WINDOW_MIN_WIDTH: WINDOW_MIN_WIDTH2,
    WINDOW_MIN_HEIGHT: WINDOW_MIN_HEIGHT2,
    DEFAULT_WINDOW_HEIGHT: DEFAULT_WINDOW_HEIGHT2,
    DEFAULT_WINDOW_WIDTH: DEFAULT_WINDOW_WIDTH2,
    EXIT_FULLSCREEN_ANIM_TIMER: EXIT_FULLSCREEN_ANIM_TIMER2,
    OPEN_APP_ANIM_TIMER: OPEN_APP_ANIM_TIMER2,
    CLOSE_APP_ANIM_TIMER: CLOSE_APP_ANIM_TIMER2,
    MINIMIZE_APP_ANIM_TIMER: MINIMIZE_APP_ANIM_TIMER2,
    DEMINIMIZE_APP_ANIM_TIMER: DEMINIMIZE_APP_ANIM_TIMER2,
    WINDOW_OOB_SECURITY_PIX: WINDOW_OOB_SECURITY_PIX2
  } = constants_exports;
  var contextMenuWrapperElt = document.getElementById("context-menu-wrapper");
  var AppWindow = class extends EventEmitter {
    /**
     * @param {HTMLElement} initialContent - The application's initial content.
     * @param {Object} options - Various options to configure how that new
     * application window will behave
     * @param {boolean} [options.skipAnim] - If set to `true`, we will not show the
     * open animation for this new window.
     * @param {boolean} [options.centered] - If set to `true`, the application
     * window will be centered relative to the desktop in which it can be moved.
     * @param {number} [options.defaultHeight] - Default height of the window in
     * CSS pixels without counting the window decorations (borders, header...).
     * If not set, the general default will be used instead.
     * @param {number} [options.defaultWidth] - Default width of the window in
     * CSS pixels without counting the window decorations (like borders).
     * If not set, the general default will be used instead.
     * @param {string} [options.defaultIcon] - Default "icon" representing the
     * application in that window.
     * Can be updated at any time through the `updateTitle` method.
     * If not set the window won't show an icon for now.
     * @param {string} [options.defaultTitle] - Default "title" for the
     * application in that window.
     * Can be updated at any time through the `updateTitle` method.
     * If not set the window won't have a title for now.
     */
    constructor(initialContent, options = {}) {
      super();
      const {
        skipAnim,
        centered,
        defaultHeight,
        defaultWidth,
        defaultIcon,
        defaultTitle
      } = options;
      this.defaultHeight = defaultHeight ?? DEFAULT_WINDOW_HEIGHT2;
      this.defaultWidth = defaultWidth ?? DEFAULT_WINDOW_WIDTH2;
      this._abortController = new AbortController();
      const appContainer = constructVisibleWindowScaffolding(
        defaultIcon ?? "",
        defaultTitle ?? ""
      );
      appContainer.appendChild(initialContent);
      this.element = document.createElement("div");
      this.element.appendChild(appContainer);
      this._savedCoordinates = null;
      this._oobDistances = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
      this.element.className = "window";
      this._setPositionAndSize({
        isInitialization: true,
        centerOnDesktop: centered
      });
      this._saveCurrentCoordinates();
      this._setupWindowEvents();
      if (!skipAnim) {
        this._performWindowTransition("open");
      }
    }
    setFullscreen() {
      enterFullFullScreen(this.element);
    }
    /**
     * Run animation for the closing window and removes it from the DOM.
     * Might activate the next visible window as a side-effect.
     */
    close() {
      this._performWindowTransition("close");
      this._abortController.abort();
      this.trigger("closing");
      this.removeEventListener();
    }
    isClosed() {
      return this._abortController.signal.aborted;
    }
    isActivated() {
      return this.element.classList.contains("active");
    }
    updateTitle(newIcon, newTitle) {
      if (newIcon !== null) {
        const iconElt = this.element.getElementsByClassName("w-title-icon")[0];
        if (iconElt) {
          iconElt.textContent = newIcon;
        }
      }
      const titleElt = this.element.getElementsByClassName("w-title-title")[0];
      if (titleElt) {
        titleElt.textContent = newTitle;
      }
    }
    /**
     * Function to toggle the activation of the current window (e.g. when clicking
     * on it in the taskbar).
     */
    toggleActivation() {
      if (this.isMinimizedOrMinimizing()) {
        if (!this._performWindowTransition("deminimize")) {
          return;
        }
        this.activate();
      } else if (this.isActivated()) {
        this.minimize();
      } else {
        this.activate();
      }
    }
    minimize() {
      this.element.classList.remove("active");
      if (!this._performWindowTransition("minimize")) {
        return;
      }
      this.trigger("minimizing");
    }
    deminimize() {
      if (this.isMinimizedOrMinimizing()) {
        this._performWindowTransition("deminimize");
      }
    }
    /**
     * @returns {boolean}
     */
    isMinimizedOrMinimizing() {
      return this.element.classList.contains("minimized") || this.element.dataset.state === "minimize";
    }
    /**
     * Bring this window to the front.
     */
    activate() {
      if (this.isActivated()) {
        return;
      }
      if (this.element.dataset.state === "close") {
        return;
      }
      keepWindowActiveInCurrentEventLoopIteration(this.element);
      this.element.classList.add("active");
      this.trigger("activated");
    }
    /**
     * Bring window to back.
     */
    deActivate() {
      if (!this.element.classList.contains("active")) {
        return;
      }
      this.element.classList.remove("active");
      this.trigger("deactivated");
      if (this.element.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }
    /**
     * Move/resize current window `HTMLElement`.
     * @param {Object} position
     * @param {number|undefined} [position.left] - The absolute position from the
     * left of its container, in pixels.
     * Wont' change it this parameter is omitted.
     * @param {number|undefined} [position.top] - The absolution position from the
     * top of its container, in pixels.
     * Wont' change it this parameter is omitted.
     * @param {number|undefined} [position.height] - The new window height, in
     * pixels.
     * Wont' change it this parameter is omitted.
     * @param {number|undefined} [position.width] - The new window width, in
     * pixels.
     * Wont' change it this parameter is omitted.
     * @param {Object|undefined} [position.desktopDimensions] - Communicate the
     * maximum width and height of the parent container in pixels as two number
     * properties called `maxWidth` and `maxHeight` respectively.
     * Will be re-computed if this parameter is omitted.
     */
    move({ left, top, height, width, desktopDimensions }) {
      let newHeight;
      let newWidth;
      const maxDesktopDimensions = desktopDimensions ?? getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue()
      );
      if (height !== void 0) {
        setWindowHeight(this.element, height);
        newHeight = height;
      } else {
        newHeight = getWindowHeight(this.element);
      }
      if (width !== void 0) {
        setWindowWidth(this.element, width);
        newWidth = width;
      } else {
        newWidth = getWindowWidth(this.element);
      }
      if (left !== void 0) {
        setLeftPositioning(this.element, left);
      } else {
        left = getLeftPositioning(this.element);
      }
      if (top !== void 0) {
        setTopPositioning(this.element, top);
      } else {
        top = getTopPositioning(this.element);
      }
      const minBounds = { minXBound: 0, minYBound: 0 };
      const maxBounds = {
        maxXBound: maxDesktopDimensions.maxWidth - newWidth,
        maxYBound: maxDesktopDimensions.maxHeight - newHeight
      };
      this._oobDistances = calculateOutOfBounds(minBounds, maxBounds, left, top);
    }
    getPlacement() {
      return {
        top: getTopPositioning(this.element),
        left: getLeftPositioning(this.element),
        height: getWindowHeight(this.element),
        width: getWindowWidth(this.element)
      };
    }
    _onMaximizeButton() {
      if (!isFullscreenFull(this.element)) {
        enterFullFullScreen(this.element);
      } else {
        this._performWindowTransition("exit-fullscreen");
      }
      const maximizeBtn = this.element.getElementsByClassName("w-maximize")[0];
      if (!maximizeBtn) {
        return;
      }
      if (isFullscreenFull(this.element)) {
        maximizeBtn.title = "Restore";
      } else {
        maximizeBtn.title = "Maximize";
      }
    }
    /**
     * @private
     * @param {string} stateUpdate
     * @returns {boolean}
     */
    _performWindowTransition(stateUpdate) {
      if (this.element.dataset.state === "close") {
        if (this.element.parentElement) {
          this.element.parentElement.removeChild(this.element);
        }
        return false;
      }
      const prevState = this.element.dataset.state;
      switch (prevState) {
        case "":
          break;
        case "close":
          return false;
        case "open":
          this.element.style.animation = "";
          break;
        case "minimize":
          this.element.classList.add("minimized");
          this.element.style.animation = "";
          break;
        case "deminimize":
          this.element.classList.remove("deminimize-animation");
          this.element.style.animation = "";
          this.trigger("deminimized");
          break;
        case "exit-fullscreen":
          this.element.style.transition = "";
          break;
      }
      this.element.dataset.state = stateUpdate;
      switch (stateUpdate) {
        case "":
          return true;
        case "open":
          this.element.style.animation = "openAppAnim " + (OPEN_APP_ANIM_TIMER2 / 1e3).toFixed(2) + "s ease-out";
          this.element.onanimationend = () => {
            this._performWindowTransition("");
          };
          return true;
        case "minimize":
          this.element.style.animation = "minimizeAnim " + (MINIMIZE_APP_ANIM_TIMER2 / 1e3).toFixed(2) + "s ease-out forwards";
          this.element.onanimationend = () => {
            this._performWindowTransition("");
            if (this.isMinimizedOrMinimizing()) {
              this.trigger("minimized");
            }
          };
          return true;
        case "deminimize":
          this.element.style.animation = "deminimizeAnim " + (DEMINIMIZE_APP_ANIM_TIMER2 / 1e3).toFixed(2) + "s ease-out";
          this.element.classList.remove("minimized");
          this.element.onanimationend = () => {
            this._performWindowTransition("");
          };
          return true;
        case "close":
          this.element.style.animation = "closeAppAnim " + (CLOSE_APP_ANIM_TIMER2 / 1e3).toFixed(2) + "s ease-out";
          this.element.onanimationend = () => {
            this._performWindowTransition("");
          };
          return true;
        case "exit-fullscreen":
          this.element.style.transition = ["height", "width", "top", "left"].map(
            (direction) => direction + " " + (EXIT_FULLSCREEN_ANIM_TIMER2 / 1e3).toFixed(2) + "s ease-in"
          ).join(",");
          exitAllFullScreens(this.element, this._savedCoordinates);
          this._setPositionAndSize({
            isInitialization: false,
            centerOnDesktop: false
          });
          setTimeout(() => {
            this._performWindowTransition("");
          }, EXIT_FULLSCREEN_ANIM_TIMER2);
          return true;
      }
      return true;
    }
    _setPositionAndSize({ isInitialization, centerOnDesktop }) {
      const minWindowWidth = WINDOW_MIN_WIDTH2;
      const minWindowHeight = WINDOW_MIN_HEIGHT2;
      const maxDesktopDimensions = getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue()
      );
      const maxAbsoluteWidth = maxDesktopDimensions.maxWidth + (SETTINGS.oobWindows.getValue() ? this._oobDistances.left + this._oobDistances.right : 0);
      const maxWindowWidth = Math.max(minWindowWidth, maxAbsoluteWidth);
      const maxAbsoluteHeight = maxDesktopDimensions.maxHeight + (SETTINGS.oobWindows.getValue() ? this._oobDistances.top + this._oobDistances.bottom : 0);
      const maxWindowHeight = Math.max(minWindowHeight, maxAbsoluteHeight);
      let left;
      let top;
      let wantedWHeight;
      let wantedWWidth;
      if (isInitialization) {
        wantedWHeight = this.defaultHeight + SETTINGS.windowHeaderHeight.getValue() + SETTINGS.windowBorderSize.getValue();
        wantedWWidth = this.defaultWidth + SETTINGS.windowBorderSize.getValue() * 2;
        if (wantedWWidth > maxWindowWidth) {
          wantedWWidth = maxWindowWidth;
        }
        if (wantedWHeight > maxWindowHeight) {
          wantedWHeight = maxWindowHeight;
        }
        wantedWHeight = Math.ceil(Math.max(minWindowHeight, wantedWHeight));
        wantedWWidth = Math.ceil(Math.max(minWindowWidth, wantedWWidth));
        if (centerOnDesktop || (wantedWWidth + 200) * 2 >= maxWindowWidth) {
          left = Math.ceil(Math.max((maxWindowWidth - wantedWWidth) / 2, 0));
        } else {
          left = 200;
        }
        if (centerOnDesktop || (wantedWHeight + 100) * 2 >= maxWindowHeight) {
          top = Math.ceil(Math.max((maxWindowHeight - wantedWHeight) / 2, 0));
        } else {
          top = 100;
        }
      } else {
        if (isFullscreen(this.element)) {
          return;
        }
        const prevHeight = getWindowHeight(this.element);
        wantedWHeight = Math.max(
          Math.min(prevHeight, maxWindowHeight),
          minWindowHeight
        );
        const prevWidth = getWindowWidth(this.element);
        wantedWWidth = Math.max(
          Math.min(prevWidth, maxWindowWidth),
          minWindowWidth
        );
        const currLeft = getLeftPositioning(this.element);
        if (SETTINGS.absoluteWindowPositioning.getValue()) {
          if (currLeft < 0 && !SETTINGS.oobWindows.getValue()) {
            left = 0;
          }
          const rightSidePx = currLeft + wantedWWidth;
          if (rightSidePx > maxWindowWidth) {
            if (maxWindowWidth - rightSidePx > currLeft) {
              left = 0;
            } else {
              left = currLeft - (rightSidePx - maxWindowWidth);
            }
          } else if (isPercentLeftPositioned(this.element)) {
            setLeftPositioning(this.element, currLeft);
          }
        } else {
          if (!isPercentLeftPositioned(this.element)) {
            setLeftPositioning(this.element, currLeft);
          }
          const rightSidePx = currLeft + wantedWWidth;
          if (rightSidePx > maxWindowWidth) {
            if (maxWindowWidth - currLeft < minWindowWidth) {
              wantedWWidth = minWindowWidth;
              left = maxWindowWidth - minWindowWidth;
            } else {
              wantedWWidth = maxWindowWidth - currLeft;
            }
          }
        }
        if ((left ?? currLeft) < 0 && (left ?? currLeft) + wantedWWidth < WINDOW_OOB_SECURITY_PIX2) {
          left = WINDOW_OOB_SECURITY_PIX2 - wantedWWidth;
        } else if (maxAbsoluteWidth - (left ?? currLeft) < WINDOW_OOB_SECURITY_PIX2) {
          left = maxAbsoluteWidth - WINDOW_OOB_SECURITY_PIX2;
        }
        const currTop = getTopPositioning(this.element);
        if (SETTINGS.absoluteWindowPositioning.getValue()) {
          const currTop2 = getTopPositioning(this.element);
          if (currTop2 < 0 && !SETTINGS.oobWindows.getValue()) {
            top = 0;
          }
          const bottomSidePx = currTop2 + wantedWHeight;
          if (bottomSidePx > maxWindowHeight) {
            if (maxWindowHeight - bottomSidePx > currTop2) {
              top = 0;
            } else {
              top = currTop2 - (bottomSidePx - maxWindowHeight);
            }
          } else if (isPercentTopPositioned(this.element)) {
            setTopPositioning(this.element, currTop2);
          }
        } else {
          if (!isPercentTopPositioned(this.element)) {
            setTopPositioning(this.element, currTop);
          }
          const bottomSidePx = currTop + wantedWHeight;
          if (bottomSidePx > maxWindowHeight) {
            if (maxWindowHeight - currTop < minWindowHeight) {
              wantedWHeight = minWindowHeight;
              top = maxWindowHeight - minWindowHeight;
            } else {
              wantedWHeight = maxWindowHeight - currTop;
            }
          }
        }
        const oobsafetyTop = Math.max(
          SETTINGS.windowHeaderHeight.getValue() - 15,
          0
        );
        if ((top ?? currTop) < 0 && (top ?? currTop) + wantedWHeight < oobsafetyTop) {
          top = oobsafetyTop - wantedWHeight;
        } else if (maxAbsoluteHeight - (top ?? currTop) < WINDOW_OOB_SECURITY_PIX2) {
          left = maxAbsoluteHeight - WINDOW_OOB_SECURITY_PIX2;
        }
      }
      this.move({
        left,
        top,
        height: wantedWHeight,
        width: wantedWWidth,
        desktopDimensions: maxDesktopDimensions
      });
    }
    /**
     * Register all DOM events linked to this window: to close deactivate,
     * resize etc.
     */
    _setupWindowEvents() {
      const abortSignal = this._abortController.signal;
      const windowElt = this.element;
      const header = windowElt.getElementsByClassName("w-header")[0];
      const closeBtn = header.getElementsByClassName("w-close")[0];
      const minimizeBtn = header.getElementsByClassName("w-minimize")[0];
      const maximizeBtn = header.getElementsByClassName("w-maximize")[0];
      setUpContextMenu({
        element: header,
        filter: (e) => header.contains(e.target),
        abortSignal,
        actions: [
          {
            name: "minimize",
            title: "Minimize window",
            onClick: () => this.minimize()
          },
          {
            name: "fullscreen",
            title: "Toggle window maximization",
            onClick: () => {
              if (isFullscreen(windowElt)) {
                this._performWindowTransition("exit-fullscreen");
                this.activate();
              } else {
                enterFullFullScreen(windowElt);
                this.activate();
              }
            }
          },
          {
            name: "close",
            title: "Close window",
            onClick: () => this.close()
          },
          {
            name: "deactivate",
            title: "Make window inactive",
            onClick: () => this.deActivate()
          }
        ]
      });
      addAbortableEventListener(windowElt, "mousedown", abortSignal, () => {
        this.activate();
      });
      handleResizeAndMove(
        windowElt,
        { minHeight: WINDOW_MIN_HEIGHT2, minWidth: WINDOW_MIN_WIDTH2 },
        {
          activateWindow: () => this.activate(),
          getOobDistances: () => this._oobDistances,
          updateOobDistances: (update) => this._oobDistances = { ...this._oobDistances, ...update },
          exitFullScreen: (soft) => {
            this._performWindowTransition("");
            exitAllFullScreens(windowElt, soft ? null : this._savedCoordinates);
            this._setPositionAndSize({
              isInitialization: false,
              centerOnDesktop: false
            });
          },
          saveCurrentCoordinates: () => this._saveCurrentCoordinates()
        },
        abortSignal
      );
      addAbortableEventListener(header, "dblclick", abortSignal, () => {
        if (!SETTINGS.dblClickHeaderFullScreen.getValue()) {
          return;
        }
        if (isFullscreen(windowElt)) {
          this._performWindowTransition("exit-fullscreen");
        } else {
          enterFullFullScreen(windowElt);
        }
      });
      addAbortableEventListener(windowElt, "mousedown", abortSignal, () => {
        this.activate();
      });
      if (minimizeBtn) {
        addAbortableEventListener(minimizeBtn, "click", abortSignal, () => {
          this.minimize();
        });
        addAbortableEventListener(minimizeBtn, "keydown", abortSignal, (e) => {
          if (e.key === "Enter") {
            this.minimize();
          }
        });
      }
      if (maximizeBtn) {
        addAbortableEventListener(maximizeBtn, "click", abortSignal, () => {
          this._onMaximizeButton(windowElt);
        });
        addAbortableEventListener(maximizeBtn, "keydown", abortSignal, (e) => {
          if (e.key === "Enter") {
            this._onMaximizeButton();
          }
        });
      }
      if (closeBtn) {
        addAbortableEventListener(closeBtn, "click", abortSignal, () => {
          this.close();
        });
        addAbortableEventListener(closeBtn, "keydown", abortSignal, (e) => {
          if (e.key === "Enter") {
            this.close();
          }
        });
      }
      [minimizeBtn, maximizeBtn, closeBtn].forEach((btn) => {
        if (btn) {
          addAbortableEventListener(
            btn,
            "touchstart",
            abortSignal,
            (e) => {
              e.stopPropagation();
            },
            { passive: true }
          );
          addAbortableEventListener(btn, "mousedown", abortSignal, (e) => {
            if (e.button !== 0) {
              return;
            }
            e.stopPropagation();
          });
        }
      });
      addAbortableEventListener(document, "focusin", abortSignal, (evt) => {
        if (contextMenuWrapperElt.contains(evt.target)) {
          return;
        }
        if (windowElt.contains(evt.target)) {
          this.activate(windowElt);
        } else {
          this.deActivate(windowElt);
        }
      });
      const reCheckPlacement = () => {
        requestAnimationFrame(() => {
          this._setPositionAndSize({
            isInitialization: false,
            centerOnDesktop: false
          });
        });
      };
      addAbortableEventListener(
        window,
        "resize",
        this._abortController.signal,
        reCheckPlacement
      );
      SETTINGS.taskbarLocation.onUpdate(reCheckPlacement, {
        clearSignal: this._abortController.signal
      });
      SETTINGS.taskbarSize.onUpdate(reCheckPlacement, {
        clearSignal: this._abortController.signal
      });
      SETTINGS.oobWindows.onUpdate(reCheckPlacement, {
        clearSignal: this._abortController.signal
      });
    }
    _saveCurrentCoordinates() {
      this._savedCoordinates = {
        width: getWindowWidth(this.element),
        height: getWindowHeight(this.element),
        left: getLeftPositioning(this.element),
        top: getTopPositioning(this.element)
      };
    }
  };
  function constructVisibleWindowScaffolding(icon, title) {
    const visibleElt = document.createElement("div");
    visibleElt.className = "w-visible";
    visibleElt.innerHTML = `<div class="w-header">
  <div class="w-title">
    <span class="w-title-icon">${icon ?? ""}</span>
    <span class="w-title-title">${title ?? ""}</span>
  </div>
  <div class="w-controls">
    <div class="w-button w-minimize" aria-label="Minimize window" title="Minimize" tabindex="0"><span class="w-button-icon"></span></div>
    <div class="w-button w-maximize" aria-label="Maximize window" title="Maximize" tabindex="0"><span class="w-button-icon"></span></div>
    <div class="w-button w-close" aria-label="close window" title="Close" tabindex="0"><span class="w-button-icon"></span></div>
  </div>
</div>`;
    return visibleElt;
  }

  // src/app-lib/header-line.mjs
  function constructAppHeaderLine(buttonConfigs) {
    const headerElt = document.createElement("div");
    headerElt.className = "w-tools";
    const buttonElts = {};
    const addButton = (config, buttonName) => {
      const defaultButtonConfig = BUTTONS_BY_NAME[buttonName] ?? [];
      const buttonElt = createButtonElt(
        config.svg ?? defaultButtonConfig.svg ?? "",
        config.title ?? defaultButtonConfig.defaultTitle ?? "",
        config.height ?? defaultButtonConfig.height,
        (e) => {
          e.preventDefault();
          config.onClick();
        }
      );
      buttonElts[buttonName] = buttonElt;
      buttonElt.className = "w-tool-btn";
      buttonElt.onmousedown = (e) => e.preventDefault();
      buttonElt.onselect = (e) => e.preventDefault();
      headerElt.appendChild(buttonElt);
    };
    if (Array.isArray(buttonConfigs)) {
      for (const config of buttonConfigs) {
        if (config.name === "separator") {
          const separatorElt = document.createElement("span");
          applyStyle(separatorElt, {
            width: "1px",
            borderRight: "1px solid var(--sidebar-hover-bg)"
          });
          headerElt.appendChild(separatorElt);
        } else {
          addButton(config, config.name);
        }
      }
    } else {
      BUTTONS_LIST.forEach(({ name }) => {
        if (buttonConfigs[name]) {
          addButton(buttonConfigs[name], name);
        }
      });
    }
    return {
      element: headerElt,
      enableButton: (buttonName) => {
        const buttonElt = buttonElts[buttonName];
        if (buttonElt) {
          enableButton(buttonElt);
        }
      },
      disableButton: (buttonName) => {
        const buttonElt = buttonElts[buttonName];
        if (buttonElt) {
          disableButton(buttonElt);
        }
      }
    };
  }
  function enableButton(buttonElt) {
    buttonElt.setAttribute("tabindex", "0");
    buttonElt.classList.remove("disabled");
  }
  function disableButton(buttonElt) {
    buttonElt.removeAttribute("tabindex");
    buttonElt.classList.add("disabled");
  }
  function createButtonElt(svg, title, height = "1.7rem", onClick) {
    const buttonWrapperElt = document.createElement("span");
    applyStyle(buttonWrapperElt, {
      display: "flex",
      height: "100%",
      alignItems: "center"
    });
    const svgWrapperElt = document.createElement("span");
    applyStyle(svgWrapperElt, {
      height
    });
    const buttonSvgElt = getSvg2(svg);
    if (buttonSvgElt) {
      applyStyle(buttonSvgElt, {
        width: "1.7rem",
        height: "100%"
        // flex: "0 0 auto",
      });
      svgWrapperElt.appendChild(buttonSvgElt);
    }
    buttonWrapperElt.appendChild(svgWrapperElt);
    svgWrapperElt.className = "w-tool-icon";
    buttonWrapperElt.onclick = (e) => {
      if (buttonWrapperElt.classList.contains("disabled")) {
        return;
      }
      return onClick(e);
    };
    buttonWrapperElt.onkeydown = (e) => {
      if (buttonWrapperElt.classList.contains("disabled")) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        return onClick(e);
      }
    };
    buttonWrapperElt.title = title;
    const titleElt = document.createElement("span");
    titleElt.textContent = title;
    buttonWrapperElt.appendChild(titleElt);
    titleElt.className = "w-tool-title";
    buttonWrapperElt.setAttribute("tabindex", "0");
    return buttonWrapperElt;
  }
  function getSvg2(svg) {
    const svgWrapperElt = document.createElement("div");
    svgWrapperElt.innerHTML = svg;
    const svgElt = svgWrapperElt.children[0];
    return svgElt;
  }

  // src/app-lib/app-utils.mjs
  function getAppUtils() {
    return {
      // Often needed utils:
      constructAppHeaderLine,
      setUpContextMenu,
      // In rare situations:
      constructSidebarElt,
      createExternalIframe,
      createAppTitle,
      createFullscreenButton
    };
  }
  function createAppTitle(title, ql) {
    const h2Elt = document.createElement("h2");
    h2Elt.className = "app-titl";
    h2Elt.appendChild(document.createTextNode(title));
    h2Elt.appendChild(constructQuicklinks(ql ?? {}));
    return h2Elt;
  }
  function constructQuicklinks(ql) {
    const links = [];
    if (ql.demo) {
      const imgWrapper = document.createElement("span");
      imgWrapper.innerHTML = demoImgSvg;
      imgWrapper.className = "quicklink-img";
      imgWrapper.title = "Link to its demo page";
      imgWrapper.alt = "Link to demo page";
      const aElt = document.createElement("a");
      aElt.className = "quicklink-link";
      aElt.href = ql.demo;
      aElt.target = "_blank";
      aElt.appendChild(imgWrapper);
      links.push(aElt);
    }
    if (ql.github) {
      const imgWrapper = document.createElement("span");
      imgWrapper.innerHTML = codeImgSvg;
      imgWrapper.className = "quicklink-img";
      imgWrapper.title = "Link to its code repository";
      imgWrapper.alt = "Link to its code repository";
      const aElt = document.createElement("a");
      aElt.className = "quicklink-link";
      aElt.href = ql.github;
      aElt.target = "_blank";
      aElt.appendChild(imgWrapper);
      links.push(aElt);
    }
    if (ql.doc) {
      const imgWrapper = document.createElement("span");
      imgWrapper.innerHTML = docImgSvg;
      imgWrapper.className = "quicklink-img";
      imgWrapper.title = "Link to its API documentation";
      imgWrapper.alt = "Link to its API documentation";
      const aElt = document.createElement("a");
      aElt.className = "quicklink-link";
      aElt.href = ql.doc;
      aElt.target = "_blank";
      aElt.appendChild(imgWrapper);
      links.push(aElt);
    }
    const quickLinksElt = document.createElement("span");
    quickLinksElt.className = "quickLinks";
    for (const lnk of links) {
      quickLinksElt.appendChild(lnk);
    }
    return quickLinksElt;
  }
  function createFullscreenButton(abortSignal) {
    const fullscreenButton = document.createElement("input");
    fullscreenButton.className = "btn";
    fullscreenButton.type = "button";
    fullscreenButton.value = "";
    function updateFullScreenText() {
      const fullscreenText = document.fullscreenElement === null ? "Go fullscreen!" : "Exit fullcreen mode";
      fullscreenButton.value = fullscreenText;
    }
    updateFullScreenText();
    document.body.addEventListener("fullscreenchange", updateFullScreenText);
    abortSignal.addEventListener("aborted", () => {
      document.body.removeEventListener("fullscreenchange", updateFullScreenText);
    });
    fullscreenButton.onclick = function() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.body.requestFullscreen();
      }
    };
    return fullscreenButton;
  }

  // src/app-lib/sidebar.mjs
  function constructAppWithSidebar(sections, abortSignal) {
    let childAbortController = new AbortController();
    abortSignal.addEventListener("abort", () => {
      childAbortController.abort();
    });
    const container = document.createElement("div");
    container.className = "w-container";
    const content = document.createElement("div");
    content.className = "w-content";
    content.tabIndex = "0";
    const formattedSections = sections.slice().map((s, i) => {
      return { ...s, section: i };
    });
    formattedSections[0].active = true;
    const displaySection = (section) => {
      childAbortController.abort();
      childAbortController = new AbortController();
      content.innerHTML = "";
      if (formattedSections[section].noPadding) {
        content.style.padding = "0";
      } else {
        content.style.padding = "";
      }
      const wantedSection = formattedSections[section];
      const innerContentElt = wantedSection.render(childAbortController.signal);
      if (wantedSection.centered) {
        innerContentElt.classList.add("w-content-centered");
      }
      content.appendChild(innerContentElt);
      content.focus({ preventScroll: true });
    };
    const sidebar = constructSidebarElt(formattedSections, (section) => {
      displaySection(section);
      content.scrollTo(0, 0);
    });
    container.appendChild(sidebar);
    container.appendChild(content);
    displaySection(0);
    return {
      element: container,
      focus: () => {
        content.focus({ preventScroll: true });
      }
    };
  }

  // src/app-launcher/windowed_application_stack.mjs
  var WindowedApplicationStack = class {
    /**
     * @param {Object} initalApp
     * @param {boolean} isActivated - If `true`, the window is currently
     * activated. If `false`, it is deactivated.
     */
    constructor(initalApp, isActivated) {
      this._appStack = [];
      this.wrapper = document.createElement("div");
      applyStyle(this.wrapper, {
        position: "relative",
        height: "100%",
        width: "100%"
      });
      this.wrapper.appendChild(initalApp.element);
      this.onActivateCallback = initalApp.onActivate ?? null;
      this.onDeactivateCallback = initalApp.onDeactivate ?? null;
      this.onCloseCallback = initalApp.onClose ?? null;
      if (isActivated) {
        this.onActivateCallback?.();
      } else {
        this.onDeactivateCallback?.();
      }
    }
    getElement() {
      return this.wrapper;
    }
    /**
     * Method to call when the window is activated.
     */
    onActivate() {
      this.onActivateCallback?.();
    }
    /**
     * Method to call when the window is deactivated.
     */
    onDeactivate() {
      this.onDeactivateCallback?.();
    }
    /**
     * Method to call when the window is closed.
     */
    onClose() {
      this.onDeactivateCallback?.();
      this.onCloseCallback?.();
      while (true) {
        const lastWindow = this._appStack.pop();
        if (!lastWindow) {
          this.onActivateCallback = null;
          this.onDeactivateCallback = null;
          this.onCloseCallback = null;
          return;
        }
        lastWindow.onDeactivateCallback?.();
        lastWindow.onCloseCallback?.();
      }
    }
    /**
     * Remove the currently-displayed application and show the next one in the
     * stack, if one.
     * @param {boolean} isActivated - If `true`, the window is currently
     * activated. If `false`, it is deactivated.
     * @returns {boolean} - If `true`, there is still an element displayed.
     * If `false`, there's no more element in the stack.
     */
    pop(isActivated) {
      this.onDeactivateCallback?.();
      this.onCloseCallback?.();
      this._closeCurrentApp();
      try {
        this.currentAppElement()?.remove();
      } catch (err) {
      }
      const lastWindow = this._appStack.pop();
      if (lastWindow) {
        this._restoreAppFromStack(lastWindow, isActivated);
        return true;
      }
      this.onActivateCallback = null;
      this.onDeactivateCallback = null;
      this.onCloseCallback = null;
      return false;
    }
    currentAppElement() {
      return this.wrapper.children[this.wrapper.children.length - 1];
    }
    /**
     * Pop until a specific element included.
     * @param {HTMLElement} element - The `HTMLElement` you wish to pop.
     * @param {boolean} isActivated - If `true`, the window is currently
     * activated. If `false`, it is deactivated.
     * @returns {boolean} - If `true`, there is still an element displayed.
     * If `false`, there's no more element in the stack.
     */
    popElement(element, isActivated) {
      if (this.currentAppElement() === element) {
        return this.pop(isActivated);
      }
      const index = this._appStack.findIndex((a) => a.element === element);
      if (index === -1) {
        return this._appStack.length > 0;
      }
      while (this._appStack.length > index) {
        const popped = this._appStack.pop();
        popped.onDeactivateCallback?.();
        popped.onCloseCallback?.();
      }
      const newElt = this._appStack.pop();
      if (!newElt) {
        return false;
      }
      this._closeCurrentApp();
      this._restoreAppFromStack(newElt, isActivated);
      return true;
    }
    /**
     * Set a new current application and move the precedent one to the top of the
     * stack.
     * @param {Object} newAppObject
     * @param {boolean} isActivated - If `true`, the window is currently
     * activated. If `false`, it is deactivated.
     */
    push(newAppObject, isActivated) {
      this.onDeactivateCallback?.();
      const element = this.currentAppElement();
      this._appStack.push({
        element,
        previousDisplay: element.style.display,
        onActivateCallback: this.onActivateCallback,
        onDeactivateCallback: this.onDeactivateCallback,
        onCloseCallback: this.onCloseCallback
      });
      element.style.display = "none";
      this._addCurrentAppFromAppObject(newAppObject, isActivated);
    }
    /**
     * Replace all mounted elements until then by this one new app.
     * Will close all already-pushed applications.
     * @param {Object} newAppObject
     * @param {boolean} isActivated - If `true`, the window is currently
     * activated. If `false`, it is deactivated.
     */
    replaceAll(newAppObject, isActivated) {
      this.onDeactivateCallback?.();
      this.onCloseCallback?.();
      while (this._appStack.length > 0) {
        const currentApp = this._appStack.pop();
        currentApp.onDeactivateCallback?.();
        currentApp.onCloseCallback?.();
      }
      this.wrapper.innerHTML = "";
      this._addCurrentAppFromAppObject(newAppObject, isActivated);
    }
    _addCurrentAppFromAppObject(newAppObject, isActivated) {
      this.wrapper.appendChild(newAppObject.element);
      this.onActivateCallback = newAppObject.onActivate;
      this.onDeactivateCallback = newAppObject.onDeactivate;
      this.onCloseCallback = newAppObject.onClose;
      if (isActivated) {
        this.onActivateCallback?.();
      } else {
        this.onDeactivateCallback?.();
      }
    }
    _restoreAppFromStack(stackObj, isActivated) {
      stackObj.element.style.display = stackObj.previousDisplay;
      this.onActivateCallback = stackObj.onActivateCallback;
      this.onDeactivateCallback = stackObj.onDeactivateCallback;
      this.onCloseCallback = stackObj.onCloseCallback;
      if (isActivated) {
        this.onActivateCallback?.();
      } else {
        this.onDeactivateCallback?.();
      }
    }
    _closeCurrentApp() {
      const closedElement = this.wrapper.children[this.wrapper.length - 1];
      if (closedElement) {
        try {
          this.wrapper.removeChild(closedElement);
        } catch (_) {
        }
      }
    }
  };

  // src/app-launcher/launch_sandboxed_app.mjs
  var appBaseUrl;
  var appDomain;
  if (typeof __APP_BASE_URL__ === "string") {
    appBaseUrl = __APP_BASE_URL__;
    appDomain = new URL(appBaseUrl).origin;
  } else {
    if (location.href.startsWith("https://peaberberian.github.io")) {
      appBaseUrl = "https://paulswebdesktop.netlify.app";
      appDomain = appBaseUrl;
    } else if (location.href.startsWith("https://paulswebdesktop.netlify.app")) {
      appBaseUrl = "https://peaberberian.github.io";
      appDomain = appBaseUrl;
    } else {
      appBaseUrl = ".";
      appDomain = window.location.origin;
    }
  }
  function launchSandboxedApp(appData, appArgs, env, abortSignal) {
    let isIframeLoaded = false;
    let isActivated = true;
    const backgroundColor = parseAppDefaultBackground(appData.defaultBackground);
    const wrapperElt = document.createElement("div");
    applyStyle(wrapperElt, {
      position: "relative",
      height: "100%",
      width: "100%"
    });
    const spinnerElt = getSpinnerApp(backgroundColor);
    wrapperElt.appendChild(spinnerElt.element);
    const iframe = document.createElement("iframe");
    iframe.tabIndex = "0";
    iframe.style.height = "100%";
    iframe.style.width = "100%";
    iframe.style.backgroundColor = backgroundColor;
    iframe.style.border = "0";
    iframe.style.padding = "0";
    iframe.style.margin = "0";
    iframe.style.overflow = "hidden";
    iframe.style.display = "none";
    iframe.src = appBaseUrl + "/sandbox.html";
    wrapperElt.appendChild(iframe);
    iframe.addEventListener("load", () => {
      sendSettingsToIframe(iframe, abortSignal);
      processEventsFromIframe(
        iframe,
        env,
        () => {
          iframe.style.display = "block";
          spinnerElt.onClose();
          try {
            wrapperElt.removeChild(spinnerElt.element);
          } catch (err) {
          }
          if (isActivated) {
            iframe.contentWindow?.postMessage(
              {
                type: "__pwd__activate",
                data: null
              },
              appDomain
            );
          }
        },
        (err) => {
          try {
            iframe.remove();
            spinnerElt.onClose();
            wrapperElt.removeChild(spinnerElt.element);
          } catch (err2) {
          }
          wrapperElt.appendChild(getErrorApp(err));
        },
        abortSignal
      );
      iframe.contentWindow.postMessage(
        {
          type: "__pwd__run-app",
          data: {
            scriptUrl: appData.lazyLoad,
            args: appArgs,
            desktopOrigin: window.location.origin,
            dependencies: appData.dependencies
          }
        },
        appDomain
      );
      isIframeLoaded = true;
    });
    redirectKeyDownEvents();
    return {
      element: wrapperElt,
      onActivate: () => {
        isActivated = true;
        if (!isIframeLoaded) {
          return;
        }
        if (!iframe.contains(document.activeElement)) {
          iframe.focus();
        }
        iframe.contentWindow?.postMessage(
          {
            type: "__pwd__activate",
            data: null
          },
          appDomain
        );
      },
      onDeactivate: () => {
        isActivated = false;
        if (!isIframeLoaded) {
          return;
        }
        if (iframe.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        iframe.contentWindow.postMessage(
          {
            type: "__pwd__deactivate",
            data: null
          },
          appDomain
        );
      },
      onClose: () => {
        if (!isIframeLoaded) {
          return;
        }
        if (iframe.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        iframe.contentWindow?.postMessage(
          {
            type: "__pwd__close",
            data: null
          },
          appDomain
        );
      }
    };
    function redirectKeyDownEvents() {
      ["keydown", "keyup"].forEach((eventName) => {
        addAbortableEventListener(
          document,
          eventName,
          abortSignal,
          function(event) {
            if (!isActivated || !iframe.contentWindow) {
              return;
            }
            iframe.contentWindow.postMessage(
              {
                type: "__pwd__" + eventName,
                key: event.key,
                code: event.code,
                keyCode: event.keyCode,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey
              },
              appDomain
            );
          }
        );
      });
    }
  }
  function handleForwardedEvent(iframe, eventData) {
    if (eventData.eventType.startsWith("touch")) {
      iframe.dispatchEvent(
        new TouchEvent(eventData.eventType, {
          bubbles: true,
          cancelable: true,
          touches: eventData.touches || [],
          ctrlKey: eventData.ctrlKey,
          shiftKey: eventData.shiftKey,
          altKey: eventData.altKey,
          metaKey: eventData.metaKey
        })
      );
    } else {
      iframe.dispatchEvent(
        new MouseEvent(eventData.eventType, {
          bubbles: true,
          cancelable: true,
          clientX: eventData.clientX,
          clientY: eventData.clientY,
          button: eventData.button,
          buttons: eventData.buttons,
          ctrlKey: eventData.ctrlKey,
          shiftKey: eventData.shiftKey,
          altKey: eventData.altKey,
          metaKey: eventData.metaKey
        })
      );
    }
  }
  function sendSettingsToIframe(iframe, abortSignal) {
    if (abortSignal.aborted) {
      return;
    }
    Object.keys(APP_STYLE_SETTINGS).forEach((key) => {
      APP_STYLE_SETTINGS[key].onUpdate(
        (newVal) => {
          iframe.contentWindow.postMessage(
            {
              type: "__pwd__update-style",
              data: {
                vars: [
                  {
                    name: key,
                    cssName: APP_STYLE[key].cssName,
                    value: newVal
                  }
                ]
              }
            },
            appDomain
          );
        },
        { clearSignal: abortSignal, emitCurrentValue: true }
      );
    });
    SETTINGS.sidebarFormat.onUpdate(
      (format) => {
        iframe.contentWindow.postMessage(
          {
            type: "__pwd__sidebar-format-update",
            data: format
          },
          appDomain
        );
      },
      { clearSignal: abortSignal, emitCurrentValue: true }
    );
    SETTINGS.showIframeBlockerHelp.onUpdate(
      (shouldShow) => {
        iframe.contentWindow.postMessage(
          {
            type: "__pwd__show-iframe-blocker",
            data: shouldShow
          },
          appDomain
        );
      },
      { clearSignal: abortSignal, emitCurrentValue: true }
    );
  }
  function processEventsFromIframe(iframe, cbs, resolve, reject, abortSignal) {
    if (abortSignal.aborted) {
      return;
    }
    addAbortableEventListener(window, "message", abortSignal, (e) => {
      if (e.source !== iframe.contentWindow) {
        return;
      }
      switch (e.data.type) {
        case "__pwd__forwarded-event":
          handleForwardedEvent(iframe, e.data);
          break;
        case "__pwd__update-title":
          checkUpdateTitleMessageData(e.data.data);
          cbs.updateTitle(e.data.data.icon ?? null, e.data.data.title);
          break;
        case "__pwd__close-app":
          cbs.closeApp();
          break;
        case "__pwd__filePickerOpen":
          if (typeof e.data.requestId !== "string") {
            throw new Error("No requestId for a filePickerOpen");
          }
          checkFilePickerOpenMessageData(e.data.data);
          handleAsyncResponse(
            cbs.filePickerOpen({
              title: e.data.data.title,
              baseDirectory: e.data.data.baseDirectory,
              allowMultipleSelections: e.data.data.allowMultipleSelections,
              confirmValue: e.data.data.confirmValue
            }),
            e.data.type,
            e.data.requestId
          );
          break;
        case "__pwd__filePickerSave":
          if (typeof e.data.requestId !== "string") {
            throw new Error("No requestId for a filePickerSave");
          }
          checkFilePickerSaveMessageData(e.data.data);
          handleAsyncResponse(
            cbs.filePickerSave({
              title: e.data.data.title,
              baseDirectory: e.data.data.baseDirectory,
              savedFileName: e.data.data.savedFileName,
              savedFileData: e.data.data.savedFileData,
              confirmValue: e.data.data.confirmValue
            }),
            e.data.type,
            e.data.requestId
          );
          break;
        case "__pwd__quickSave":
          if (typeof e.data.requestId !== "string") {
            throw new Error("No requestId for a quickSave");
          }
          checkQuickSaveMessageData(e.data.data);
          handleAsyncResponse(
            cbs.quickSave(e.data.data.handle, e.data.data.data),
            e.data.type,
            e.data.requestId
          );
          break;
        case "__pwd__notification": {
          const data = e.data.data;
          checkNotificationMessageData(data);
          notification_emitter_default[data.type](data.title, data.message, data.duration);
          break;
        }
        case "__pwd__loaded":
          resolve();
          break;
        case "__pwd__error": {
          const data = e.data.data;
          checkErrorMessageData(data);
          const error = new Error(data.message);
          if (data.name !== void 0) {
            error.name = data.name;
          }
          reject(error);
          break;
        }
      }
    });
    function handleAsyncResponse(operationProm, type, requestId) {
      operationProm.then((val) => {
        iframe.contentWindow?.postMessage(
          {
            type,
            requestId,
            success: true,
            data: val
          },
          appDomain
        );
      }).catch((err) => {
        iframe.contentWindow?.postMessage(
          {
            type,
            requestId,
            success: false,
            data: {
              name: err.name,
              message: err.message
            }
          },
          appDomain
        );
      });
    }
  }
  function checkErrorMessageData(data) {
    if (typeof data !== "object" || data === null || typeof data.name !== "string" && data.name !== void 0 || typeof data.message !== "string") {
      throw new Error("Cannot update title: wrong data format");
    }
  }
  function checkUpdateTitleMessageData(data) {
    if (typeof data !== "object" || data === null || typeof data.icon !== "string" && data.icon !== void 0 || typeof data.title !== "string") {
      throw new Error("Cannot update title: wrong data format");
    }
  }
  function checkFilePickerOpenMessageData(data) {
    if (typeof data !== "object" || data === null || typeof data.title !== "string" && data.title !== void 0 || typeof data.baseDirectory !== "string" && data.baseDirectory !== void 0 || typeof data.allowMultipleSelections !== "boolean" && data.allowMultipleSelections !== void 0 || typeof data.confirmValue !== "string" && data.confirmValue !== void 0) {
      throw new Error("Cannot spawn filePickerOpen: wrong data format");
    }
  }
  function checkFilePickerSaveMessageData(data) {
    if (typeof data !== "object" || data === null || typeof data.title !== "string" && data.title !== void 0 || typeof data.baseDirectory !== "string" && data.baseDirectory !== void 0 || typeof data.savedFileName !== "string" && data.savedFileName !== void 0 || typeof data.confirmValue !== "string" && data.confirmValue !== void 0) {
      throw new Error("Cannot spawn filePickerSave: wrong data format");
    }
    if (typeof data.savedFileData !== "string" && !(data.savedFileData instanceof ArrayBuffer) && !ArrayBuffer.isView(data.savedFileData)) {
      throw new Error(
        "Cannot spawn filePickerSave: saved file data is in the wrong type"
      );
    }
  }
  function checkQuickSaveMessageData(data) {
    if (typeof data !== "object" || data === null || typeof data.handle !== "string") {
      throw new Error("Cannot spawn filePickerSave: wrong data format");
    }
    if (typeof data.data !== "string" && !(data.data instanceof ArrayBuffer) && !ArrayBuffer.isView(value)) {
      throw new Error(
        "Cannot spawn filePickerSave: saved file data is in the wrong type"
      );
    }
  }
  function checkNotificationMessageData(data) {
    if (typeof data !== "object" || data === null || !["success", "error", "warning", "info"].includes(data.type)(
      typeof data.baseDirectory !== "string" && data.baseDirectory !== void 0
    ) || typeof data.title !== "string" || typeof data.message !== "string" || typeof data.duration !== "number" && data.duration !== void 0) {
      throw new Error("Cannot add notification: wrong data format");
    }
  }

  // src/app-launcher/path_token_creator.mjs
  var PathTokenCreator = class {
    constructor() {
      this._key = crypto.getRandomValues(new Uint8Array(32));
    }
    /**
     * Encrypt a path with that `PathTokenCreator`'s inner key.
     *
     * The obtained result can then be decrypted through that **same instance**'s
     * `decryptPath` method.
     * @param {string} path
     * @returns {Promise.<string>}
     */
    async encryptPath(path) {
      const encoder = new TextEncoder();
      const data = encoder.encode(path);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        this._key,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
      );
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        data
      );
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      return btoa(String.fromCharCode(...combined));
    }
    /**
     * Decrypt a path, previously encrypted with the `encryptPath` method of the
     * same `PathTokenCreator` instance.
     * @param {string} path
     * @returns {Promise.<string>}
     */
    async decryptPath(token) {
      try {
        const combined = new Uint8Array(
          atob(token).split("").map((c) => c.charCodeAt(0))
        );
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          this._key,
          "AES-GCM",
          false,
          ["encrypt", "decrypt"]
        );
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          cryptoKey,
          encrypted
        );
        return new TextDecoder().decode(decrypted);
      } catch (e) {
        throw new Error("Invalid token");
      }
    }
  };

  // src/app-launcher/AppsLauncher.mjs
  var { BASE_WINDOW_Z_INDEX: BASE_WINDOW_Z_INDEX2, IMAGE_ROOT_PATH: IMAGE_ROOT_PATH2, __VERSION__: __VERSION__2 } = constants_exports;
  var AppsLauncher = class {
    /**
     * Creates a new `AppsLauncher` for the desktop.
     * @param {HTMLElement} dekstopElt - `HTMLElement` where new windows may be
     * added and removed from.
     * @param {Object} taskbarManager - Abstraction allowing to show the current
     * opened application windows. The `AppsLauncher` will add and remove tasks to
     * that `TaskbarManager` for the corresponding windows.
     */
    constructor(desktopElt, taskbarManager) {
      this._desktopElt = desktopElt;
      this._windows = [];
      this._taskbarManager = taskbarManager;
      this._pathTokenCreator = new PathTokenCreator();
      let mousedownTarget = null;
      this._desktopElt.addEventListener("mousedown", (e) => {
        mousedownTarget = e.target;
      });
      this._desktopElt.addEventListener("click", (e) => {
        if (e.target === this._desktopElt) {
          this._windows.forEach(({ appWindow }) => {
            if (mousedownTarget && appWindow.element.contains(mousedownTarget)) {
              return;
            }
            appWindow.deActivate();
          });
        }
        mousedownTarget = null;
      });
    }
    /**
     * Open the given application, and optionally open a window for it.
     * @param {string} appPath - FileSystem path to the application to run (e.g.
     * `/apps/about.run`).
     * @param {Array.<Object>} appArgs - The application's arguments.
     * @param {Object} options - Various options to configure how that new
     * application will behave.
     * @param {boolean} [options.fullscreen] - If set to `true`, the application's
     * window will be started full screen.
     * @param {boolean} [options.skipAnim] - If set to `true`, we will not show the
     * open animation for the optional new window linked to that application.
     * @param {boolean} [options.centered] - If set to `true`, the application
     * window will be centered relative to the desktop in which it can be moved.
     * @returns {Promise.<boolean>} - `true` if a window has been created, `false`
     * if not.
     */
    async openApp(appPath, appArgs, options = {}) {
      let app;
      try {
        app = typeof appPath === "string" ? await filesystem_default.readFile(appPath, "object") : appPath;
      } catch (err) {
        if (err.code === "NoEntryError") {
          notification_emitter_default.error(
            "Invalid app",
            `"${appPath}" is not a valid app path`
          );
        } else {
          notification_emitter_default.error(
            "Invalid app",
            `"${appPath}" does not lead to a valid executable`
          );
        }
        throw err;
      }
      if (!app) {
        notification_emitter_default.error(
          "Invalid app",
          `Cannot run wanted application: the app is not valid.`
        );
        throw new Error("Invalid app");
      }
      if (app.onlyOne) {
        const createdWindowForApp = this._getNextWindowForApp(app.id);
        if (createdWindowForApp !== null) {
          createdWindowForApp.deminimize();
          createdWindowForApp.activate();
          return false;
        }
      }
      const applicationAbortCtrl = new AbortController();
      const defaultBackground = parseAppDefaultBackground(
        app.data.defaultBackground
      );
      const appStack = new WindowedApplicationStack(
        getSpinnerApp(defaultBackground),
        true
      );
      const appWindow = new AppWindow(appStack.getElement(), {
        ...options,
        defaultHeight: app.data.defaultHeight,
        defaultWidth: app.data.defaultWidth,
        defaultIcon: app.icon,
        defaultTitle: app.title
      });
      this._windows.push({ appId: app.id, appWindow });
      this._checkRelativeWindowPlacement(appWindow);
      this._taskbarManager.addWindow(appWindow, app, {
        isWindowActivated: () => appWindow.isActivated(),
        isWindowMinimized: () => appWindow.isMinimizedOrMinimizing(),
        minimizeWindow: () => appWindow.minimize(),
        restoreWindow: () => appWindow.deminimize(),
        activateWindow: () => appWindow.activate(),
        closeWindow: () => appWindow.close()
      });
      appWindow.addEventListener("closing", () => {
        applicationAbortCtrl.abort();
        const windowIndex = this._windows.findIndex(
          (elt) => elt.appWindow === appWindow
        );
        if (windowIndex !== -1) {
          this._windows.splice(windowIndex, 1);
          this.activateMostVisibleWindow();
        }
        this._taskbarManager.remove(appWindow);
        appStack.onClose();
      });
      appWindow.addEventListener("minimizing", () => {
        this.activateMostVisibleWindow();
        appWindow.element.style.zIndex = 500;
        this._taskbarManager.deActiveWindow(appWindow);
        const taskRect = this._taskbarManager.getTaskBoundingClientRect(appWindow);
        if (taskRect) {
          const windowRect = appWindow.element.getBoundingClientRect();
          const taskbarCenterX = taskRect.left + taskRect.width / 2;
          const taskbarCenterY = taskRect.top - taskRect.height / 2;
          appWindow.element.style.transformOrigin = `${taskbarCenterX - windowRect.left}px ${taskbarCenterY - windowRect.top}px`;
        }
      });
      appWindow.addEventListener("deminimized", () => {
        appWindow.element.style.transformOrigin = "";
      });
      appWindow.addEventListener("activated", () => {
        const windowEltsWithZIndex = [];
        for (const w of this._windows) {
          if (w.appWindow !== appWindow) {
            w.appWindow.deActivate();
          }
          windowEltsWithZIndex.push({
            element: w.appWindow.element,
            zIndex: parseInt(w.appWindow.element.style.zIndex, 10) || BASE_WINDOW_Z_INDEX2
          });
        }
        windowEltsWithZIndex.sort((a, b) => a.zIndex - b.zIndex);
        windowEltsWithZIndex.forEach((item, index) => {
          const newZIndex = String(BASE_WINDOW_Z_INDEX2 + index);
          if (newZIndex !== item.element.style.zIndex) {
            item.element.style.zIndex = newZIndex;
          }
        });
        appWindow.element.style.zIndex = BASE_WINDOW_Z_INDEX2 + windowEltsWithZIndex.length + 1;
        this._taskbarManager.setActiveWindow(appWindow);
        appStack.onActivate();
      });
      appWindow.addEventListener("deactivated", () => {
        this._taskbarManager.deActiveWindow(appWindow);
        appStack.onDeactivate();
      });
      appWindow.activate();
      this._taskbarManager.setActiveWindow(appWindow);
      if (options.fullscreen) {
        appWindow.setFullscreen();
      }
      const env = this._constructEnvObject(
        app.data.dependencies,
        appStack,
        appWindow,
        applicationAbortCtrl.signal
      );
      this._launchAppFromAppData(
        "create",
        app.data,
        appArgs,
        env,
        applicationAbortCtrl.signal
      ).then(
        (appObj) => {
          if (applicationAbortCtrl.signal.aborted) {
            appStack.onClose();
            return;
          }
          appStack.replaceAll(appObj, appWindow.isActivated());
        },
        (err) => {
          appStack.replaceAll(getErrorApp(err), appWindow.isActivated());
        }
      );
      this._desktopElt.appendChild(appWindow.element);
      return true;
    }
    /**
     * General open function for when the type of data to open is unknown.
     * @param {string|Object} data - Either path to the file to open or executable
     * object directly.
     * @returns {Promise}
     */
    async open(data) {
      if (typeof data === "string") {
        if (data.endsWith(".run")) {
          return this.openApp(data, []);
        }
        const lastIdxOfDot = data.lastIndexOf(".");
        if (lastIdxOfDot < 0) {
          notification_emitter_default.error(
            "Unable to open file",
            `Cannot open file "${data}".

Unknown extension`
          );
          return;
        }
        const extension = data.substring(lastIdxOfDot + 1);
        if (!extension) {
          notification_emitter_default.error(
            "Unable to open file",
            `Cannot open file "${data}".

Empty extension`
          );
          return;
        }
        if (extension.includes("/")) {
          notification_emitter_default.error(
            "Unable to open file",
            `Cannot open file "${data}".

Unknown file extension`
          );
          return;
        }
        const defaultApps = await filesystem_default.readFile(
          "/system32/default_apps.config.json",
          "object"
        );
        if (!defaultApps[extension]) {
          notification_emitter_default.error(
            "Unable to open file",
            `Cannot open file "${data}".

Found no default app for extension "${extension}".`
          );
          return;
        }
        try {
          const openedFile = await filesystem_default.readFile(data, "arraybuffer");
          let token = null;
          try {
            token = await this._pathTokenCreator.encryptPath(data);
          } catch (err) {
            console.error("Cannot create path encrypted token:", err);
          }
          return this.openApp(defaultApps[extension], [
            {
              type: "file",
              filename: getName(data),
              data: openedFile,
              handle: token
            }
          ]);
        } catch (err) {
          notification_emitter_default.error(
            "Failed to run file",
            `Failed to run "${data}": ${err}`
          );
          return;
        }
      }
      if (typeof data === "object" && data !== null) {
        if (typeof data.id === "string" && typeof data.data === "object") {
          return this.openApp(data, []);
        }
      }
    }
    /**
     * Activate the window the most forward and non-minimized.
     */
    activateMostVisibleWindow() {
      if (this._windows.length === 0) {
        return;
      }
      let currentWindowWithMaxZIndex;
      let maxZindex = -Infinity;
      for (const { appWindow } of this._windows) {
        if (!appWindow.isMinimizedOrMinimizing()) {
          const wZindex = parseInt(appWindow.element.style.zIndex, 10);
          if (!isNaN(wZindex) && wZindex >= maxZindex) {
            currentWindowWithMaxZIndex = appWindow;
            maxZindex = wZindex;
          }
        }
      }
      if (currentWindowWithMaxZIndex) {
        currentWindowWithMaxZIndex.activate();
      }
    }
    /**
     * Launch an application from its executable's `data` property and get its
     * return values (element and various lifecycle functions).
     * @param {string} method - Either "create" for the default app launch, or the
     * method name of the various other features they may provide (e.g. a
     * file-picker may provide other entry points for opening and saving files).
     * @param {Object} appData - The `data` property from an executable, which
     * describes how to actually launch the application.
     * @param {Array.<Object>} appArgs - The arguments that should be communicated
     * to the application when launching it.
     * @param {Object} env - The `env` object providing some desktop context and
     * API to applications.
     * @param {AbortSignal} abortSignal - `AbortSignal` which triggers when the
     * application is closed.
     * @returns {Promise.<Object>} - Promise which resolves when and if it
     * succeded to launch the application, with the payload obtained from
     * launching it.
     */
    async _launchAppFromAppData(method, appData, appArgs, env, abortSignal) {
      if (appData.website) {
        if (method !== "create") {
          console.warn('Not calling "create" on an i-frame application.');
        }
        const backgroundColor = parseAppDefaultBackground(
          appData.defaultBackground
        );
        const iframeContainer = createExternalIframe(
          appData.website,
          backgroundColor
        );
        const element = iframeContainer;
        const onActivate = iframeContainer.focus.bind(iframeContainer);
        return { element, onActivate };
      } else if (appData.lazyLoad) {
        if (appData.sandboxed && method === "create") {
          return launchSandboxedApp(appData, appArgs, env, abortSignal);
        }
        return await this._launchAppFromScript(
          appData.lazyLoad,
          method,
          appArgs,
          env,
          abortSignal
        );
      } else {
        throw new Error("Unknown application data format.");
      }
    }
    /**
     * Launch an application from its external script's URL and get its return
     * values (element and various lifecycle functions).
     * @param {string} scriptUrl
     * @param {string} method - Either "create" for the default app launch, or the
     * method name of the various other features they may provide (e.g. a
     * file-picker may provide other entry points for opening and saving files).
     * @param {Array.<Object>} appArgs - The arguments that should be communicated
     * to the application when launching it.
     * @param {Object} env - The `env` object providing some desktop context and
     * API to applications.
     * @param {AbortSignal} abortSignal - `AbortSignal` which triggers when the
     * application is closed.
     * @returns {Promise.<Object>} - Promise which resolves when and if it
     * succeded to launch the application, with the payload obtained from
     * launching it.
     */
    async _launchAppFromScript(scriptUrl, method, appArgs, env, abortSignal) {
      const appVal = await import(scriptUrl);
      if (typeof appVal?.[method] !== "function") {
        throw new Error(
          `Empty application JS file. Please export a function called "${method}" in it.`
        );
      }
      const appRet = await appVal[method](appArgs, env, abortSignal);
      let element;
      let onActivate;
      let onDeactivate;
      let onClose;
      if (appRet?.element == null) {
        if (Array.isArray(appRet?.sidebar) && appRet.sidebar.length > 0) {
          const sidebarInfo = constructAppWithSidebar(
            appRet.sidebar,
            abortSignal
          );
          element = sidebarInfo.element;
          onActivate = sidebarInfo.focus;
        } else {
          throw new Error("Application without a returned `element` property.");
        }
      } else {
        element = appRet.element;
      }
      if (!onActivate && typeof appRet.onActivate === "function") {
        onActivate = appRet.onActivate.bind(appRet);
      }
      if (!onDeactivate && typeof appRet.onDeactivate === "function") {
        onDeactivate = appRet.onDeactivate.bind(appRet);
      }
      if (!onClose && typeof appRet.onClose === "function") {
        onClose = appRet.onClose.bind(appRet);
      }
      return { element, onActivate, onDeactivate, onClose };
    }
    _createFilePickerOpen(config, appStack, appWindow, appAbortSignal) {
      return new Promise(async (resolveFilePicker, rejectFilePicker) => {
        let filePickerElt;
        const fileOpenerAbortCtrl = createLinkedAbortController(appAbortSignal);
        try {
          const providers = await filesystem_default.readFile(
            "/system32/providers.config.json",
            "object"
          );
          if (!providers.filePickerOpen || providers.filePickerOpen.length === 0) {
            rejectFilePicker(
              new Error("No file picker provider found in this system.")
            );
            return;
          }
          const filePickerApp = await filesystem_default.readFile(
            providers.filePickerOpen[0],
            "object"
          );
          const onFilesOpened = (files) => {
            fileOpenerAbortCtrl.abort();
            appStack.popElement(filePickerElt, appWindow.isActivated());
            resolveFilePicker(files);
          };
          const env = {
            ...this._constructEnvObject(
              filePickerApp.data.dependencies,
              appStack,
              appWindow,
              fileOpenerAbortCtrl.signal
            ),
            onOpen: onFilesOpened
          };
          const appObj = await this._launchAppFromAppData(
            "createFileOpener",
            filePickerApp.data,
            [config],
            env,
            fileOpenerAbortCtrl.signal
          );
          filePickerElt = appObj.element;
          appStack.push(appObj, appWindow.isActivated());
        } catch (err) {
          rejectFilePicker(err);
        }
      });
    }
    _createFilePickerSave(config, appStack, appWindow, appAbortSignal) {
      return new Promise(async (resolveFilePicker, rejectFilePicker) => {
        let filePickerElt;
        const fileSaverAbortCtrl = createLinkedAbortController(appAbortSignal);
        try {
          const providers = await filesystem_default.readFile(
            "/system32/providers.config.json",
            "object"
          );
          if (!providers.filePickerSave || providers.filePickerSave.length === 0) {
            rejectFilePicker(
              new Error("No file picker provider found in this system.")
            );
            return;
          }
          const filePickerApp = await filesystem_default.readFile(
            providers.filePickerSave[0],
            "object"
          );
          const onFileSaved = (fileInfo) => {
            if (fileInfo === null) {
              fileSaverAbortCtrl.abort();
              appStack.popElement(filePickerElt, appWindow.isActivated());
              resolveFilePicker(null);
              return;
            }
            fileSaverAbortCtrl.abort();
            appStack.popElement(filePickerElt, appWindow.isActivated());
            resolveFilePicker(fileInfo);
          };
          const env = {
            ...this._constructEnvObject(
              filePickerApp.data.dependencies,
              appStack,
              appWindow,
              fileSaverAbortCtrl.signal
            ),
            onSaved: onFileSaved
          };
          const appObj = await this._launchAppFromAppData(
            "createFileSaver",
            filePickerApp.data,
            [config],
            env,
            fileSaverAbortCtrl.signal
          );
          filePickerElt = appObj.element;
          appStack.push(appObj, appWindow.isActivated());
        } catch (err) {
          rejectFilePicker(err);
        }
      });
    }
    /**
     * @private
     * @returns {AppWindow|null}
     */
    _getNextWindowForApp(appId) {
      for (const w of this._windows) {
        if (w.appId === appId) {
          return w;
        }
      }
      return null;
    }
    /**
     * @param {AppWindow} newAppWindow - The newly-created `AppWindow` for which
     * we want to check the relative positionning to other windows.
     * @private
     */
    _checkRelativeWindowPlacement(newAppWindow) {
      const {
        top: initialTop,
        left: initialLeft,
        height: initialHeight,
        width: initialWidth
      } = newAppWindow.getPlacement();
      const maxDesktopDimensions = getMaxDesktopDimensions(
        SETTINGS.taskbarLocation.getValue(),
        SETTINGS.taskbarSize.getValue()
      );
      let top = initialTop;
      let left = initialLeft;
      for (let windowIdx = 0; windowIdx < this._windows.length; windowIdx++) {
        const { appWindow } = this._windows[windowIdx];
        if (appWindow === newAppWindow) {
          continue;
        }
        const windowPlacement = appWindow.getPlacement();
        let needRecheck = false;
        if (initialHeight && windowPlacement.top === top) {
          if (top + initialHeight + 25 <= maxDesktopDimensions.maxHeight) {
            top += 25;
            needRecheck = true;
          } else {
            top = maxDesktopDimensions.maxHeight - initialHeight;
          }
        }
        if (initialWidth && windowPlacement.left === left) {
          if (left + initialWidth + 25 <= maxDesktopDimensions.maxWidth) {
            left += 25;
            needRecheck = true;
          } else {
            left = maxDesktopDimensions.maxWidth - initialWidth;
          }
        }
        if (needRecheck) {
          windowIdx = -1;
        }
      }
      if (left !== void 0 || top !== void 0) {
        newAppWindow.move({ left, top, desktopDimensions: maxDesktopDimensions });
      }
    }
    /**
     * Construct `env` object that is given to application as their link to the
     * desktop element.
     * @param {Array.<string>} dependencies - The application's listed
     * dependencies.
     * @param {WindowedApplicationStack} appStack
     * @param {AppWindow} appWindow
     * @param {AbortSignal} abortSignal
     */
    _constructEnvObject(dependencies, appStack, appWindow, abortSignal) {
      const env = {
        appUtils: getAppUtils(),
        getImageRootPath: () => IMAGE_ROOT_PATH2,
        getVersion: () => __VERSION__2,
        // TODO: With imediately-updating titles, it can look quite jumpy to first
        // update it to its initial title and then potentially update it once the
        // app is loaded... Find a solution.
        updateTitle: (newIcon, newTitle) => {
          appWindow.updateTitle(newIcon, newTitle);
          this._taskbarManager.updateTitle(appWindow, newIcon, newTitle);
        },
        closeApp: () => appWindow.close(),
        STYLE: constructAppStyleObject()
      };
      if (Array.isArray(dependencies)) {
        if (dependencies.includes("CONSTANTS")) {
          env.CONSTANTS = constants_exports;
        }
        if (dependencies.includes("settings")) {
          env.settings = SETTINGS;
        }
        if (dependencies.includes("filesystem")) {
          env.filesystem = filesystem_default;
        }
        if (dependencies.includes("notificationEmitter")) {
          env.notificationEmitter = notification_emitter_default;
        }
        if (dependencies.includes("quickSave")) {
          env.quickSave = async (handle, content) => {
            const filePath = await this._pathTokenCreator.decryptPath(handle);
            if (!filePath) {
              throw new Error("Unknown file handle.");
            }
            return filesystem_default.writeFile(filePath, content);
          };
        }
        if (dependencies.includes("open")) {
          env.open = (path) => {
            if (Array.isArray(path)) {
              path.forEach((p) => this.open(p));
            } else {
              this.open(path);
            }
          };
        }
        if (dependencies.includes("filePickerOpen")) {
          env.filePickerOpen = (config) => this._createFilePickerOpen(
            { type: "options", ...config },
            appStack,
            appWindow,
            abortSignal
          ).then(
            (files) => Promise.all(
              files.map(async (filePath) => {
                const data = await filesystem_default.readFile(filePath, "arraybuffer");
                let token = null;
                try {
                  token = await this._pathTokenCreator.encryptPath(filePath);
                } catch (err) {
                  console.error("Cannot create path encrypted token:", err);
                }
                return {
                  filename: getName(filePath),
                  handle: token,
                  filePath: dependencies.includes("filesystem") ? filePath : null,
                  data
                };
              })
            )
          );
        }
        if (dependencies.includes("filePickerSave")) {
          env.filePickerSave = (config) => this._createFilePickerSave(
            { type: "options", ...config },
            appStack,
            appWindow,
            abortSignal
          ).then(async (fileInfo) => {
            if (!fileInfo) {
              return;
            }
            let token = null;
            try {
              token = await this._pathTokenCreator.encryptPath(fileInfo.path);
            } catch (err) {
              console.error("Cannot create path encrypted token:", err);
            }
            return {
              filename: getName(fileInfo.path),
              filePath: dependencies.includes("filesystem") ? fileInfo.path : null,
              handle: token
            };
          });
        }
      }
      return env;
    }
  };

  // src/clock_applet.mjs
  function initializeClockElement(abortSignal) {
    const clockElt = document.createElement("div");
    clockElt.className = "clock";
    const use12HourClockFormat = is12HourClockFormat();
    updateClock(use12HourClockFormat, clockElt);
    const itv = setInterval(
      () => updateClock(use12HourClockFormat, clockElt),
      2e3
    );
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        clearInterval(itv);
      });
    }
    return clockElt;
    function updateClock(use12HourClock, clockElt2) {
      const now = /* @__PURE__ */ new Date();
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
      clockElt2.textContent = `${formattedHours}\u200B:\u200B${formattedMinutes}${ampm}`;
    }
  }

  // src/desktop.mjs
  var SPECIAL_NO_APP_STRING = "#";
  console.log(
    "Welcome to my Web Desktop! This is an open-source project whose code can be found here:",
    PROJECT_REPO
  );
  async function start() {
    const desktopElt = document.getElementById("desktop");
    const clockElt = initializeClockElement();
    clockElt.onclick = function() {
      appsLauncher.openApp("/apps/clock.run", [], {
        centered: true
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
    StartMenu(openPath);
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
          centered: true
        });
      }
    } else if (wantedApp !== SPECIAL_NO_APP_STRING) {
      appsLauncher.openApp(`/apps/${wantedApp}.run`, [], {
        skipAnim: true,
        centered: true
      });
    }
    function openPath(appPath, appArgs) {
      if (appArgs && appArgs.length > 0) {
        appsLauncher.openApp(appPath, appArgs);
      } else {
        appsLauncher.open(appPath);
      }
    }
  }
  document.addEventListener("DOMContentLoaded", function() {
    start().catch(() => {
    });
  });
})();
