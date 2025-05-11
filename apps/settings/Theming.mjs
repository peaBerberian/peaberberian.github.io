import { createColorPickerOnRef, createDropdownOnRef } from "./utils.mjs";

const themes = {
  light: [
    // button style,
    "Colorful",
    // taskbar-bg
    // (Background color of the taskbar)
    "#1a2e4b",
    // taskbar-text
    // (Text color for unselected tasks in the taskbar)
    "#ffffff",
    // taskbar-hover
    // (Background color when a task is hovered in the taskbar)
    "#2196f3",
    // taskbar-active-bg
    // (Background color for the opened task in the taskbar)
    "#3498db",
    // taskbar-inactive-bg
    // (Background color a unselected tasks in the taskbar)
    "#263b59",
    // window-active-header
    // (Background color for the header and borders of the active window)
    "#0f4774",
    // window-active-header-text
    // (Text color for the header and borders of the active window)
    "#ffffff",
    // window-inactive-header
    // (Background color for the header and borders of inactive windows)
    "#737373",
    // window-inactive-header-text
    // (Text color for the header and borders of inactive windows)
    "#ffffff",
    // window-sidebar-bg
    // (Background color for the optional sidebar of windows)
    "#e0e0e0",
    // window-text-color
    // (Default text color inside windows)
    "#333333",
    // window-content-bg
    // (Background color inside windows)
    "#ffffff",
    // window-line-color
    // (Thin lines inside windows like button borders, title underlines etc.)
    "#dddddd",
    // app-primary-color
    // (Emphasis color used inside windows)
    "#3498db",
    // (Background color used by some elements like buttons, disabled
    // input and range input's line)
    "#efefef",
    // sidebar-hover-bg
    // (Background color when hovering a sidebar item)
    "#c8c8c8",
    // sidebar-selected-bg-color
    // (Background color for the selected sidebar item)
    "#3498db",
    // sidebar-selected-text-color
    // (Text color for the selected sidebar item)
    "#ffffff",
    // start-menu-text
    // (Text color for the start menu)
    "#000000",
    // start-menu-bg
    // (Background color for the start menu)
    "#f5f5f5",
    // start-menu-active-bg
    // (Background color for the hovered application in the start menu)
    "#e0e0e0",
    // start-icon-bg
    // (Background color behind app icons in the start menu, should be discrete
    // regarding `start-menu-bg`)
    "#dddddd",
    // icon-active-text
    // (Text color for the selected item in the desktop)
    "#ffffff",
    // icon-inactive-text
    // (Text color for not-selected item in the desktop)
    "#ffffff",
    // icon-active-bg
    // (Background color for the selected item in the desktop)
    "#ffffff",
    // icon-image-bg
    // (Background color specific to the icon of a desktop's item)
    "#ffffff",
    // icon-hover
    // (Background color for the hovered item in the desktop)
    "#ffffff",
  ],
  dark: [
    // button style,
    "Colorful",
    // taskbar-bg
    // (Background color for the taskbar)
    "#121212",
    // taskbar-text
    // (Text color for unselected tasks in the taskbar)
    "#cccccc",
    // taskbar-hover
    // (Background color when a task is hovered in the taskbar)
    "#2c2c2c",
    // taskbar-active-bg
    // (Background color for the opened task in the taskbar)
    "#303030",
    // taskbar-inactive-bg
    // (Background color a unselected tasks in the taskbar)
    "#1a1a1a",
    // window-active-header
    // (Background color for the header and borders of the active window)
    "#202020",
    // window-active-header-text
    // (Text color for the header and borders of the active window)
    "#ffffff",
    // window-inactive-header
    // (Background color for the header and borders of inactive windows)
    "#2c2c2c",
    // window-inactive-header-text
    // (Text color for the header and borders of inactive windows)
    "#aaaaaa",
    // window-sidebar-bg
    // (Background color for the optional sidebar of windows)
    "#252525",
    // window-text-color
    // (Default text color inside windows)
    "#dddddd",
    // window-content-bg
    // (Background color inside windows)
    "#1e1e1e",
    // window-line-color
    // (Thin lines inside windows like button borders, title underlines etc.)
    "#333333",
    // app-primary-color
    // (Emphasis color used inside windows)
    "#e00000",
    // (Background color used by some elements like buttons, disabled
    // input and range input's line)
    "#2a2a2a",
    // sidebar-hover-bg
    // (Background color when hovering a sidebar item)
    "#363636",
    // sidebar-selected-bg-color
    // (Background color for the selected sidebar item)
    "#4a4a4a",
    // sidebar-selected-text-color
    // (Text color for the selected sidebar item)
    "#ffffff",
    // start-menu-text
    // (Text color for the start menu)
    "#dddddd",
    // start-menu-bg
    // (Background color for the start menu)
    "#1a1a1a",
    // start-menu-active-bg
    // (Background color for the hovered application in the start menu)
    "#303030",
    // start-icon-bg
    // (Background color behind app icons in the start menu, should be discrete
    // regarding `start-menu-bg`)
    "#252525",
    // icon-active-text
    // (Text color for the selected item in the desktop)
    "#ffffff",
    // icon-inactive-text
    // (Text color for not-selected item in the desktop)
    "#eeeeee",
    // icon-active-bg
    // (Background color for the selected item in the desktop)
    "#383838",
    // icon-image-bg
    // (Background color specific to the icon of a desktop's item)
    "#2c2c2c",
    // icon-hover
    // (Background color for the hovered item in the desktop)
    "#333333",
  ],
  moon: [
    // button style,
    "Colorful",
    // taskbar-bg
    "#27334a",
    // taskbar-text
    "#f0f0f0",
    // taskbar-hover
    "#2a5d8f",
    // taskbar-active-bg
    "#36486d",
    // taskbar-inactive-bg
    "#21304a",
    // winndow-active-header
    "#41567c",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#3d3d3d",
    // window-inactive-header-text
    "#dfdfdf",
    // window-sidebar-bg
    "#2a303e",
    // window-text-color
    "#e6e6e6",
    // window-content-bg
    "#2b3342",
    // window-line-color
    "#404755",
    // app-primary-color
    "#4a99d9",
    // app-primary-bg
    "#4c5467",
    // sidebar-hover-bg
    "#3e4758",
    // sidebar-selected-bg-color
    "#3b6ea3",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#e6e6e6",
    // start-menu-bg
    "#2a3242",
    // start-menu-active-bg
    "#36435a",
    // start-icon-bg
    "#374256",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#37415A",
    // icon-image-bg
    "#37415A",
    // icon-hover
    "#4B5F7D",
  ],
  robot: [
    // button style,
    "Sober",
    // taskbar-bg
    // (Background color for the taskbar)
    "#1a1a1d",
    // taskbar-text
    // (Text color for unselected tasks in the taskbar)
    "#8a8a8f",
    // taskbar-hover
    // (Background color when a task is hovered in the taskbar)
    "#2e2e33",
    // taskbar-active-bg
    // (Background color for the opened task in the taskbar)
    "#33333a",
    // taskbar-inactive-bg
    // (Background color a unselected tasks in the taskbar)
    "#232329",
    // window-active-header
    // (Background color for the header and borders of the active window)
    "#27272c",
    // window-active-header-text
    // (Text color for the header and borders of the active window)
    "#ffffff",
    // window-inactive-header
    // (Background color for the header and borders of inactive windows)
    "#35353c",
    // window-inactive-header-text
    // (Text color for the header and borders of inactive windows)
    "#65656d",
    // window-sidebar-bg
    // (Background color for the optional sidebar of windows)
    "#1f1f24",
    // window-text-color
    // (Default text color inside windows)
    "#b3b3b8",
    // window-content-bg
    // (Background color inside windows)
    "#19191d",
    // window-line-color
    // (Thin lines inside windows like button borders, title underlines etc.)
    "#40404a",
    // app-primary-color
    // (Emphasis color used inside windows)
    "#039b31",
    // (Background color used by some elements like buttons, disabled
    // input and range input's line)
    "#2b2b33",
    // sidebar-hover-bg
    // (Background color when hovering a sidebar item)
    "#2e2e36",
    // sidebar-selected-bg-color
    // (Background color for the selected sidebar item)
    "#38383f",
    // sidebar-selected-text-color
    // (Text color for the selected sidebar item)
    "#ffffff",
    // start-menu-text
    // (Text color for the start menu)
    "#b8b8bf",
    // start-menu-bg
    // (Background color for the start menu)
    "#222228",
    // start-menu-active-bg
    // (Background color for the hovered application in the start menu)
    "#2d2d36",
    // start-icon-bg
    // (Background color behind app icons in the start menu, should be discrete
    // regarding `start-menu-bg`)
    "#2a2a33",
    // icon-active-text
    // (Text color for the selected item in the desktop)
    "#ffffff",
    // icon-inactive-text
    // (Text color for not-selected item in the desktop)
    "#ffffff",
    // icon-active-bg
    // (Background color for the selected item in the desktop)
    "#323239",
    // icon-image-bg
    // (Background color specific to the icon of a desktop's item)
    "#27272e",
    // icon-hover
    // (Background color for the hovered item in the desktop)
    "#2c2c33",
  ],
  otter: [
    // button style,
    "Sober",
    // taskbar-bg
    "#0d3a40", // Deep teal (dark river water)
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#3dd0d8", // Bright otter-play teal
    // taskbar-active-bg
    "#1a7a7f", // Mid-depth teal
    // taskbar-inactive-bg
    "#1a4a4f", // Slightly lighter than taskbar-bg
    // window-active-header
    "#0d5a62", // Richer teal for active window
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#5a7a7f", // Desaturated teal-gray
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#e0f5f5", // Very light teal (foam/bubbles)
    // window-text-color
    "#222222",
    // window-content-bg
    "#ffffff",
    // window-line-color
    "#cce5e5", // Subtle teal tint
    // app-primary-color
    "#2ab7c1", // Vibrant otter-pop teal
    // element-bg
    "#f0fafa", // Ice-teal (soft background)
    // sidebar-hover-bg
    "#b3e5e5", // Light teal hover
    // sidebar-selected-bg-color
    "#1a7a7f", // Matches taskbar-active-bg
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#f0fafa", // Matches element-bg
    // start-menu-active-bg
    "#cce5e5", // Slightly darker than sidebar-hover
    // start-icon-bg
    "#ddf0f0", // Very faint teal
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#2ab7c1", // Primary teal
    // icon-image-bg
    "#ffffff",
    // icon-hover
    "#e0f5f5", // Light teal (matches sidebar)
  ],
  crystal: [
    // button style,
    "Sober",

    // taskbar-bg
    "#1e2a4a",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#8a76dc",
    // taskbar-active-bg
    "#8a76dc",
    // taskbar-inactive-bg
    "#2d3b59",
    // window-active-header
    "#4b3c82",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#788697",
    // window-inactive-header-text
    "#e8f0ff",
    // window-sidebar-bg
    "#d9e3f1",
    // window-text-color
    "#203354",
    // window-content-bg
    "#f0f8ff",
    // window-line-color

    "#d7d1f0",
    // app-primary-color
    "#8a76dc",
    // app-primary-bg
    "#e6f0fa",
    // sidebar-hover-bg
    "#d7d1f0",
    // sidebar-selected-bg-color
    "#8a76dc",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#203354",
    // start-menu-bg
    "#f0f8ff",
    // start-menu-active-bg
    "#d7d1f0",
    // start-icon-bg
    "#ffffff",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#a492e2",
    // icon-image-bg
    "#e6f0fa",
    // icon-hover
    "#ffffff",
  ],

  whale: [
    // button style,
    "Sober",
    // taskbar-bg
    "#1e3b43",
    // taskbar-text
    "#e5f4f7",
    // taskbar-hover
    "#52aec1",
    // taskbar-active-bg
    "#2d5a6b",
    // taskbar-inactive-bg
    "#243f4a",
    // window-active-header
    "#184a5c",
    // window-active-header-text
    "#e5f4f7",
    // window-inactive-header
    "#3d6b77",
    // window-inactive-header-text
    "#d7e8ea",
    // window-sidebar-bg
    "#d7eaed",
    // window-text-color
    "#25474e",
    // window-content-bg (background color specific to windows)
    "#f2f9fa",
    // window-line-color (used for very thin lines inside windows)
    "#b3d6dd",
    // app-primary-color (user by a windows UI elements)
    "#3a96ab",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#dff0f4",
    // sidebar-hover-bg
    "#b3d6dd",
    // sidebar-selected-bg-color
    "#3a96ab",
    // sidebar-selected-text-color
    "#f2f9fa",
    // start-menu-text
    "#25474e",
    // start-menu-bg
    "#f2f9fa",
    // start-menu-active-bg (background color for the active application in the taskbar)
    "#dff0f4",
    // start-icon-bg
    "#b3d6dd",
    // icon-active-text
    "#e5f4f7",
    // icon-inactive-text
    "#e5f4f7",
    // icon-active-bg
    "#3A96AB",
    // icon-image-bg
    "#418FA0",
    // icon-hover
    "#3A96AB",
  ],
  hot: [
    // button style,
    "Sober",
    // taskbar-bg
    "#8a4f2d",
    // taskbar-text
    "#fff6e9",
    // taskbar-hover
    "#e9a264",
    // taskbar-active-bg
    "#c17c60",
    // taskbar-inactive-bg
    "#a16645",
    // window-active-header
    "#b04700",
    // window-active-header-text
    "#fff6e9",
    // window-inactive-header
    "#94785c",
    // window-inactive-header-text
    "#fff6e9",
    // window-sidebar-bg
    "#f5e0c9",
    // window-text-color
    "#4d2e17",
    // window-content-bg
    "#fff6e9",
    // window-line-color
    "#e5cba9",
    // app-primary-color
    "#e07a3d",
    // app-primary-bg
    "#f2e3d0",
    // sidebar-hover-bg
    "#e9ccaa",
    // sidebar-selected-bg-color
    "#e07a3d",
    // sidebar-selected-text-color
    "#fff6e9",
    // start-menu-text
    "#4d2e17",
    // start-menu-bg
    "#fff6e9",
    // start-menu-active-bg
    "#f2e3d0",
    // start-icon-bg
    "#e9ccaa",
    // icon-active-text
    "#fff6e9",
    // icon-inactive-text
    "#fff6e9",
    // icon-active-bg
    "#E1B88F",
    // icon-image-bg
    "#E1B88F",
    // icon-hover
    "#E1B88F",
  ],

  watermelon: [
    // button style,
    "Sober",
    // taskbar-bg
    "#2c3e2c",
    // taskbar-text
    "#f5e9e9",
    // taskbar-hover
    "#e15b64",
    // taskbar-active-bg
    "#4d7a4d",
    // taskbar-inactive-bg
    "#3a4d3a",
    // window-active-header
    "#3e6347",
    // window-active-header-text
    "#f5e9e9",
    // window-inactive-header
    "#5d6e5d",
    // window-inactive-header-text
    "#f0dede",
    // window-sidebar-bg
    "#e8f0e8",
    // window-text-color
    "#334433",
    // window-content-bg (background color specific to windows)
    "#f9f5f5",
    // window-line-color (used for very thin lines inside windows)
    "#ddebdd",
    // app-primary-color (user by a windows UI elements)
    "#e15b64",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#d0e6d0",
    // sidebar-hover-bg
    "#d0e6d0",
    // sidebar-selected-bg-color
    "#e15b64",
    // sidebar-selected-text-color
    "#f9f5f5",
    // start-menu-text
    "#334433",
    // start-menu-bg
    "#f9f5f5",
    // start-menu-active-bg
    "#d0e6d0",
    // start-icon-bg
    "#d0e6d0",
    // icon-active-text
    "#f5e9e9",
    // icon-inactive-text
    "#f5e9e9",
    // icon-active-bg
    "#4D7A4D",
    // icon-image-bg
    "#4D7A4D",
    // icon-hover
    "#4D7A4D",
  ],
  strawberry: [
    // button style,
    "Sober",
    // taskbar-bg
    "#8c2134",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#e63553",
    // taskbar-active-bg
    "#ff2e2e",
    // taskbar-inactive-bg
    "#a0293c",
    // window-active-header
    "#a82a3e",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#b75967",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#ffedf0",
    // window-text-color
    "#000000",
    // window-content-bg (background color specific to windows)
    "#fff9fa",
    // window-line-color (used for very thin lines inside windows)
    "#ffd3d9",
    // app-primary-color (user by a windows UI elements)
    "#e63553",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#ffd1d7",
    // sidebar-hover-bg
    "#ffd3d9",
    // sidebar-selected-bg-color
    "#e63553",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#fff9fa",
    // start-menu-active-bg (background color for the active application in the taskbar)
    "#ffd3d9",
    // start-icon-bg
    "#ffd3d9",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#E63553",
    // icon-image-bg
    "#E63553",
    // icon-hover
    "#E63553",
  ],
  coffee: [
    // button style,
    "Sober",
    // taskbar-bg
    "#2c1e17",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#9b6b4a",
    // taskbar-active-bg
    "#6a412f",
    // taskbar-inactive-bg
    "#382720",
    // window-active-header
    "#40291e",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#5e4639",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#e8e0d8",
    // window-text-color
    "#000000",
    // window-content-bg (background color specific to windows)
    "#faf5f0",
    // window-line-color (used for very thin lines inside windows)
    "#e1d4c7",
    // app-primary-color (user by a windows UI elements)
    "#8f5e3c",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#f0e8e2",
    // sidebar-hover-bg
    "#d9cec4",
    // sidebar-selected-bg-color
    "#8f5e3c",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#faf5f0",
    // start-menu-active-bg (background color for the active application in the taskbar)
    "#f0e8e2",
    // start-icon-bg
    "#d9cec4",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#8F5E3C",
    // icon-image-bg
    "#8F5E3C",
    // icon-hover
    "#8F5E3C",
  ],
  honey: [
    // button style,
    "Sober",
    // taskbar-bg
    "#422b0d",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#e9a42c",
    // taskbar-active-bg
    "#b07616",
    // taskbar-inactive-bg
    "#573a13",
    // window-active-header
    "#6a4615",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#7d5c2e",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#f8f0db",
    // window-text-color
    "#000000",
    // window-content-bg (background color specific to windows)
    "#fdf8ea",
    // window-line-color (used for very thin lines inside windows)
    "#e5d6b0",
    // app-primary-color (user by a windows UI elements)
    "#d89b28",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#f5e7c7",
    // sidebar-hover-bg
    "#f0e0bc",
    // sidebar-selected-bg-color
    "#d89b28",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#fdf8ea",
    // start-menu-active-bg (background color for the active application in the taskbar)
    "#f5e7c7",
    // start-icon-bg
    "#f0e0bc",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#D89B28",
    // icon-image-bg
    "#D89B28",
    // icon-hover
    "#D89B28",
  ],
  pig: [
    // button style,
    "Sober",
    // taskbar-bg
    "#8c3b59",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#c07293",
    // taskbar-active-bg
    "#ff8fb6",
    // taskbar-inactive-bg
    "#a74e6f",
    // window-active-header
    "#ff8fb6",
    // window-active-header-text
    "#000000",
    // window-inactive-header
    "#b56581",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#ffeef4",
    // window-text-color
    "#000000",
    // window-content-bg (background color specific to windows)
    "#fff9fb",
    // window-line-color (used for very thin lines inside windows)
    "#ffe0ec",
    // app-primary-color (user by a windows UI elements)
    "#ff5c99",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#ffdbea",
    // sidebar-hover-bg
    "#ffc2db",
    // sidebar-selected-bg-color
    "#ff8fb6",
    // sidebar-selected-text-color
    "#000000",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#fff9fb",
    // start-menu-active-bg (background color for the active application in the taskbar)
    "#fff2f7",
    // start-icon-bg
    "#ffe9f2",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#F193B8",
    // icon-image-bg
    "#F193B8",
    // icon-hover
    "#F193B8",
  ],
  panda: [
    // button style,
    "Sober",
    // taskbar-bg
    "#202020",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#7ab372",
    // taskbar-active-bg
    "#474747",
    // taskbar-inactive-bg
    "#2a2a2a",
    // window-active-header
    "#303030",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#7D7D7D",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#f2f2f2",
    // window-text-color
    "#000000",
    // window-content-bg (background color specific to windows)
    "#ffffff",
    // window-line-color (used for very thin lines inside windows)
    "#e5e5e5",
    // app-primary-color (user by a windows UI elements)
    "#5a9b52",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#e3e3e3",
    // sidebar-hover-bg
    "#c0c0c0",
    // sidebar-selected-bg-color
    "#5a9b52",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#ffffff",
    // start-menu-active-bg (background color for the active application in the taskbar)
    "#f7f7f7",
    // start-icon-bg
    "#ebebeb",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#ffffff",
    // icon-image-bg
    "#2A2A2A",
    // icon-hover
    "#ffffff",
  ],
  matcha: [
    // button style,
    "Sober",
    // taskbar-bg
    "#3a5f3a",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#5d9e5d",
    // taskbar-active-bg
    "#4d8b4d",
    // taskbar-inactive-bg
    "#2e4e2e",
    // window-active-header
    "#2d5a2d",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#737373",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#e0e0e0",
    // window-text-color
    "#333333",
    // window-content-bg
    "#ffffff",
    // window-line-color
    "#dddddd",
    // app-primary-color
    "#4d8b4d",
    // app-primary-bg
    "#efefef",
    // sidebar-hover-bg
    "#c8c8c8",
    // sidebar-selected-bg-color
    "#4d8b4d",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#f5f5f5",
    // start-menu-active-bg
    "#e0e0e0",
    // start-icon-bg
    "#dddddd",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#4d8b4d",
    // icon-image-bg
    "#3a5f3a",
    // icon-hover
    "#5d9e5d",
  ],
  turtle: [
    // button style,
    "Sober",
    // taskbar-bg
    "#0d352a", // Dark turtle shell (forest green)
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#2ac1a8", // Bright algae green
    // taskbar-active-bg
    "#1a6a5a", // Mid-tone shell green
    // taskbar-inactive-bg
    "#124a3a", // Darker green
    // window-active-header
    "#0a4a3a", // Rich pond green
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#4a6a5a", // Desaturated green-gray
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#e0f0ea", // Light water reflection (hint of blue)
    // window-text-color
    "#222222",
    // window-content-bg
    "#ffffff",
    // window-line-color
    "#b8d8d0", // Subtle aquatic tint
    // app-primary-color
    "#1a9a82", // Vibrant turtle green
    // element-bg
    "#e8f5f2", // Ice-blue/green (water surface)
    // sidebar-hover-bg
    "#a8e0d0", // Light aquatic hover
    // sidebar-selected-bg-color
    "#1a6a5a", // Matches taskbar-active-bg
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#e8f5f0", // Pale water (replaces sand)
    // start-menu-active-bg
    "#c8e8e0", // Rippled water effect
    // start-icon-bg
    "#d0f0e8", // Foam/light reflection
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#1a9a82", // Primary turtle green
    // icon-image-bg
    "#ffffff",
    // icon-hover
    "#c8f0e0", // Shallow water highlight
  ],
  island: [
    // button style,
    "Sober",
    // taskbar-bg
    "#0369a1",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#0ea5e9",
    // taskbar-active-bg
    "#098fce",
    // taskbar-inactive-bg
    "#003552",
    // window-active-header
    "#0076ad",
    // window-active-header-text
    "#fafaf9",
    // window-inactive-header
    "#a8a29e",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#f5f5f4",
    // window-text-color
    "#1c1917",
    // window-content-bg
    "#f8fafc",
    // window-line-color
    "#d6d3d1",
    // app-primary-color
    "#098fce",
    // (Background color used by some elements like buttons, disabled
    // input and range input's line)
    "#f1f5f9",
    // sidebar-hover-bg
    "#e7e5e4",
    // sidebar-selected-bg-color
    "#43a8db",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#1c1917",
    // start-menu-bg
    "#fafaf9",
    // start-menu-active-bg
    "#e7e5e4",
    // start-icon-bg
    "#d6d3d1",
    // icon-active-text
    "#ffffff",
    // icon-inactive-text
    "#ffffff",
    // icon-active-bg
    "#003857",
    // icon-image-bg
    "#005075",
    // icon-hover
    "#005075",
  ],
};

export default function createThemeSection(
  { settings, appUtils },
  abortSignal,
) {
  const { createAppTitle, strHtml } = appUtils;
  const refs = [
    settings.buttonStyle,
    settings.taskbarBgColor,
    settings.taskbarTextColor,
    settings.taskbarHoverColor,
    settings.taskbarActiveBgColor,
    settings.taskbarInactiveBgColor,
    settings.windowActiveHeaderBgColor,
    settings.windowActiveHeaderTextColor,
    settings.windowInactiveHeaderBgColor,
    settings.windowIninactiveHeaderTextColor,
    settings.windowSidebarBgColor,
    settings.windowTextColor,
    settings.windowContentBgColor,
    settings.windowLineColor,
    settings.appPrimaryColorBg,
    settings.appPrimaryBgColor,
    settings.windowSidebarHoverBgColor,
    settings.windowSidebarSelectedBgColor,
    settings.windowSidebarSelectedTextColor,
    settings.startMenuTextColor,
    settings.startMenuBgColor,
    settings.startMenuActiveBgColor,
    settings.startMenuIconBgColor,
    settings.iconActiveTextColor,
    settings.iconInactiveTextColor,
    settings.iconActiveBgColor,
    settings.iconImageBgColor,
    settings.iconHoverBgColor,
  ];
  const section = strHtml`<div>${createAppTitle("Theming", {})}</div>`;
  section.dataset.section = "theme";
  const themeGroupElt = strHtml`<div class="w-group"><h3>Theme Presets</h3></div>`;
  section.appendChild(themeGroupElt);
  section.appendChild(constructThemePresetSelection(setTheme, strHtml));

  const styleGroup = strHtml`<div class="w-group"><h3>Styling</h3></div>`;
  styleGroup.appendChild(
    createDropdownOnRef(
      {
        ref: settings.buttonStyle,
        options: ["Colorful", "Sober"],
        label: "Windows button style",
      },
      appUtils,
      abortSignal,
    ),
  );
  section.append(styleGroup);

  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;
  [
    ["Taskbar Background", settings.taskbarBgColor],
    ["Taskbar Hover", settings.taskbarHoverColor],
    ["Taskbar Text", settings.taskbarTextColor],
    ["Taskbar Active App Background", settings.taskbarActiveBgColor],
    ["Taskbar Inactive App Background", settings.taskbarInactiveBgColor],
    ["Start Menu Background", settings.startMenuBgColor],
    ["Start Menu Text", settings.startMenuTextColor],
    ["Start Menu Selected Item", settings.startMenuActiveBgColor],
    ["Start Menu Icon Background", settings.startMenuIconBgColor],
    ["Active Header Background", settings.windowActiveHeaderBgColor],
    ["Active Header Text", settings.windowActiveHeaderTextColor],
    ["Inactive Header Background", settings.windowInactiveHeaderBgColor],
    ["Inactive Header Text", settings.windowIninactiveHeaderTextColor],
    ["Regular Text", settings.windowTextColor],
    ["Regular Background", settings.windowContentBgColor],
    ["Alternative App Color", settings.appPrimaryColorBg],
    ["Alternative App Background", settings.appPrimaryBgColor],
    ["Application Lines", settings.windowLineColor],
    ["Sidebar Background", settings.windowSidebarBgColor],
    ["Sidebar Hover Background", settings.windowSidebarHoverBgColor],
    ["Sidebar Selected Background", settings.windowSidebarSelectedBgColor],
    ["Sidebar Selected Text", settings.windowSidebarSelectedTextColor],
    ["Active Icon Text", settings.iconActiveTextColor],
    ["Active Icon Background", settings.iconActiveBgColor],
    ["Inactive Icon Text", settings.iconInactiveTextColor],
    ["Icon Image Background", settings.iconImageBgColor],
    ["Icon Hover Background", settings.iconHoverBgColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(
      createColorPickerOnRef(ref, text, appUtils, abortSignal),
    );
  });
  section.appendChild(colorGroupElt);
  return section;

  function setTheme(theme) {
    if (!theme) {
      return;
    }
    for (let i = 0; i < theme.length; i++) {
      const color = theme[i];
      const ref = refs[i];
      if (color && ref) {
        ref.setValueIfChanged(color);
      }
    }
  }
}

function constructThemePresetSelection(setTheme, strHtml) {
  const themeOptElt = strHtml`<div>Choose a theme preset</div>`;
  themeOptElt.style.marginBottom = "10px";
  const gridElt = strHtml`<div class="w-char-grid"></div>`;
  const themePickerElt = strHtml`<div class="w-char-picker">
${gridElt}
</div>`;
  const emojis = [
    ["🥷", "dark"],
    ["🌚", "moon"],
    ["🤖", "robot"],
    ["🌊", "light"],
    ["🏝️", "island"],
    ["🥵", "hot"],
    ["🔮", "crystal"],
    ["🍉", "watermelon"],
    ["🍓", "strawberry"],
    ["☕", "coffee"],
    ["🍵", "matcha"],
    ["🍯", "honey"],
    ["🐖", "pig"],
    ["🦦", "otter"],
    ["🐋", "whale"],
    ["🐢", "turtle"],
    ["🐼", "panda"],
  ];
  emojis.forEach(([emoji, val]) => {
    const button = document.createElement("span");
    button.className = "w-char-picker-char";
    button.textContent = emoji;
    button.addEventListener("click", (evt) => {
      setTheme(themes[val]);
      evt.stopPropagation();
      evt.preventDefault();
    });
    button.tabIndex = "0";
    button.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        button.click();
      }
    };
    gridElt.appendChild(button);
  });
  const container = strHtml`<div />`;
  container.appendChild(themeOptElt);
  container.appendChild(themePickerElt);
  return container;
}
