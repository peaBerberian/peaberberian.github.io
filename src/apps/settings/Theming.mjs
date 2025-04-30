import { SETTINGS } from "../../settings.mjs";
import strHtml from "../../str-html.mjs";
import { createAppTitle } from "../app-utils.mjs";
import { createColorPickerOnRef, createDropdownOnRef } from "./utils.mjs";

const themes = {
  light: [
    // button style,
    "Colorful",
    // taskbar-bg
    "#1a2e4b",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#2196f3",
    // taskbar-active-bg
    "#3498db",
    // taskbar-inactive-bg
    "#263b59",
    // window-active-header
    "#0f4774",
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
    // window-content-bg (background color specific to windows)
    "#ffffff",
    // window-line-color (used for very thin lines inside windows)
    "#dddddd",
    // window-border-color (border around windows if enabled)
    "#000000",
    // app-primary-color (user by a windows UI elements)
    "#3498db",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#efefef",
    // sidebar-hover-bg
    "#c8c8c8",
    // sidebar-selected-bg-color
    "#3498db",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#000000",
    // start-menu-bg
    "#f5f5f5",
    // start-menu-active-bg (background color for the active application in the taskbar)
    "#e0e0e0",
    // start-icon-bg
    "#dddddd",

    // TODO:
    // icon-text
    "#ffffff",
    // icon-bg
    "rgba(255, 255, 255, 0.25)",
    // icon-hover
    "rgba(255, 255, 255, 0.2)",
    // icon-active-bg
    "rgba(255, 255, 255, 0.3)",
  ],
  dark: [
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
    // window-border-color
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

    // TODO:
    // icon-text
    "#ffffff",
    // icon-bg
    "rgba(55, 65, 90, 0.4)",
    // icon-hover
    "rgba(75, 95, 125, 0.5)",
    // icon-active-bg
    "rgba(85, 110, 145, 0.6)",
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
    // window-border-color
    "#b8c6db",
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

    // TODO:
    // Desktop icons
    // icon-text
    "#1e2a4a",
    // icon-bg
    "#e6f0fa",
    // icon-hover
    "#a0d8ff",
    // icon-active-bg
    "#a492e2",
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
    // window-border-color (border around windows if enabled)
    "#2c5f70",
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

    // icon-text
    "#e5f4f7",
    // icon-bg
    "rgba(65, 143, 160, 0.25)",
    // icon-hover
    "rgba(58, 150, 171, 0.25)",
    // icon-active-bg
    "rgba(58, 150, 171, 0.35)",
  ],

  cold: [
    // button style,
    "Sober",

    // taskbar-bg
    "#0095e6",
    // taskbar-text
    "#ffffff",
    // taskbar-hover
    "#8db6d3",
    // taskbar-active-bg
    "#00a3e0",
    // taskbar-inactive-bg
    "#a8d5f7",
    // window-active-header
    "#0077b6",
    // window-active-header-text
    "#ffffff",
    // window-inactive-header
    "#90c2e7",
    // window-inactive-header-text
    "#ffffff",
    // window-sidebar-bg
    "#caf0f8",
    // window-text-color
    "#023047",
    // window-content-bg
    "#ffffff",
    // window-line-color

    "#c1e0fe",
    // window-border-color
    "#90e0ef",
    // app-primary-color
    "#0096c7",
    // app-primary-bg
    "#e6f7ff",
    // sidebar-hover-bg
    "#ade8f4",
    // sidebar-selected-bg-color
    "#0096c7",
    // sidebar-selected-text-color
    "#ffffff",
    // start-menu-text
    "#023047",
    // start-menu-bg
    "#ffffff",
    // start-menu-active-bg
    "#ade8f4",
    // start-icon-bg
    "#48b0e8",

    // Desktop icons
    // icon-text
    "#003566",
    // icon-bg
    "#bae1ff",
    // icon-hover
    "#0095ff",
    // icon-active-bg
    "#00a3e0",
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
    // window-border-color
    "#6d3b1c",
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

    // icon-text
    "#fff6e9",
    // icon-bg
    "rgba(225, 184, 143, 0.25)",
    // icon-hover
    "rgba(225, 184, 143, 0.4)",
    // icon-active-bg
    "rgba(225, 184, 143, 0.5)",
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
    // window-border-color (border around windows if enabled)
    "#4d6a4d",
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

    // icon-text
    "#f5e9e9",
    // icon-bg
    "rgba(77, 122, 77, 0.2)",
    // icon-hover
    "rgba(225, 91, 100, 0.2)",
    // icon-active-bg
    "rgba(225, 91, 100, 0.3)",
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
    // window-border-color (border around windows if enabled)
    "#8c2134",
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

    // icon-text
    "#ffffff",
    // icon-bg
    "rgba(230, 53, 83, 0.2)",
    // icon-hover
    "rgba(230, 53, 83, 0.3)",
    // icon-active-bg
    "rgba(230, 53, 83, 0.4)",
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
    // window-border-color (border around windows if enabled)
    "#40291e",
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

    // icon-text
    "#ffffff",
    // icon-bg
    "rgba(143, 94, 60, 0.2)",
    // icon-hover
    "rgba(143, 94, 60, 0.3)",
    // icon-active-bg
    "rgba(143, 94, 60, 0.4)",
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
    // window-border-color (border around windows if enabled)
    "#6a4615",
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

    // icon-text
    "#ffffff",
    // icon-bg
    "rgba(216, 155, 40, 0.2)",
    // icon-hover
    "rgba(216, 155, 40, 0.3)",
    // icon-active-bg
    "rgba(216, 155, 40, 0.4)",
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
    // window-border-color (border around windows if enabled)
    "#c14775",
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

    // icon-text
    "#ffffff",
    // icon-bg
    "rgba(241, 147, 184, 0.2)",
    // icon-hover
    "rgba(241, 147, 184, 0.3)",
    // icon-active-bg
    "rgba(241, 147, 184, 0.4)",
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
    "#404040",
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
    // window-border-color (border around windows if enabled)
    "#303030",
    // app-primary-color (user by a windows UI elements)
    "#5a9b52",
    // app-primary-bg (when a UI element should be discrete, e.g. disabled
    // input, button background and range input's line)
    "#e3e3e3",
    // sidebar-hover-bg
    "#ebebeb",
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

    // icon-text
    "#ffffff",
    // icon-bg
    "rgba(42, 42, 42, 0.6)",
    // icon-hover
    "rgba(90, 155, 82, 0.3)",
    // icon-active-bg
    "rgba(90, 155, 82, 0.4)",
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
    // window-border-color
    "#000000",
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
    // icon-text
    "#ffffff",
    // icon-bg
    "#3a5f3a",
    // icon-hover
    "#5d9e5d",
    // icon-active-bg
    "#4d8b4d",
  ],
};
const refs = [
  SETTINGS.buttonStyle,
  SETTINGS.taskbarBgColor,
  SETTINGS.taskbarTextColor,
  SETTINGS.taskbarHoverColor,
  SETTINGS.taskbarActiveBgColor,
  SETTINGS.taskbarInactiveBgColor,
  SETTINGS.windowActiveHeaderBgColor,
  SETTINGS.windowActiveHeaderTextColor,
  SETTINGS.windowInactiveHeaderBgColor,
  SETTINGS.windowIninactiveHeaderTextColor,
  SETTINGS.windowSidebarBgColor,
  SETTINGS.windowTextColor,
  SETTINGS.windowContentBgColor,
  SETTINGS.windowLineColor,
  SETTINGS.windowBorderColor,
  SETTINGS.appPrimaryColorBg,
  SETTINGS.appPrimaryBgColor,
  SETTINGS.windowSidebarHoverBgColor,
  SETTINGS.windowSidebarSelectedBgColor,
  SETTINGS.windowSidebarSelectedTextColor,
  SETTINGS.startMenuTextColor,
  SETTINGS.startMenuBgColor,
  SETTINGS.startMenuActiveBgColor,
  SETTINGS.startMenuIconBgColor,
  null,
  null,
  null,
  null,
];

export default function createThemeSection(abortSignal) {
  const section = strHtml`<div>${createAppTitle("Theming", {})}</div>`;
  section.dataset.section = "theme";
  const themeGroupElt = strHtml`<div class="w-group"><h3>Theme Presets</h3></div>`;
  section.appendChild(themeGroupElt);
  section.appendChild(constructThemePresetSelection());

  const styleGroup = strHtml`<div class="w-group"><h3>Styling</h3></div>`;
  styleGroup.appendChild(
    createDropdownOnRef(
      {
        ref: SETTINGS.buttonStyle,
        options: ["Colorful", "Sober"],
        label: "Windows button style",
      },
      abortSignal,
    ),
  );
  section.append(styleGroup);

  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;
  [
    ["Taskbar Background", SETTINGS.taskbarBgColor],
    ["Taskbar Hover", SETTINGS.taskbarHoverColor],
    ["Taskbar Text", SETTINGS.taskbarTextColor],
    ["Taskbar Active App Background", SETTINGS.taskbarActiveBgColor],
    ["Taskbar Inactive App Background", SETTINGS.taskbarInactiveBgColor],
    ["Start Menu Background", SETTINGS.startMenuBgColor],
    ["Start Menu Text", SETTINGS.startMenuTextColor],
    ["Start Menu Selected Item", SETTINGS.startMenuActiveBgColor],
    ["Start Menu Icon Background", SETTINGS.startMenuIconBgColor],
    ["Active Header Background", SETTINGS.windowActiveHeaderBgColor],
    ["Active Header Text", SETTINGS.windowActiveHeaderTextColor],
    ["Inactive Header Background", SETTINGS.windowInactiveHeaderBgColor],
    ["Inactive Header Text", SETTINGS.windowIninactiveHeaderTextColor],
    ["Regular Text", SETTINGS.windowTextColor],
    ["Regular Background", SETTINGS.windowContentBgColor],
    ["Alternative App Color", SETTINGS.appPrimaryColorBg],
    ["Alternative App Background", SETTINGS.appPrimaryBgColor],
    ["Window borders", SETTINGS.windowBorderColor],
    ["Application Lines", SETTINGS.windowLineColor],
    ["Sidebar Background", SETTINGS.windowSidebarBgColor],
    ["Sidebar Hover Background", SETTINGS.windowSidebarHoverBgColor],
    ["Sidebar Selected Background", SETTINGS.windowSidebarSelectedBgColor],
    ["Sidebar Selected Text", SETTINGS.windowSidebarSelectedTextColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(createColorPickerOnRef(ref, text, abortSignal));
  });
  section.appendChild(colorGroupElt);
  return section;
}

function constructThemePresetSelection() {
  const themeOptElt = strHtml`<div class="w-small-opt">Choose a theme preset</div>`;
  const gridElt = strHtml`<div class="w-char-grid"></div>`;
  const themePickerElt = strHtml`<div class="w-char-picker">
${gridElt}
</div>`;
  const emojis = [
    ["🌚", "dark"],
    ["🌊", "light"],
    ["🥶", "cold"],
    ["🥵", "hot"],
    ["🔮", "crystal"],
    ["🍉", "watermelon"],
    ["🍓", "strawberry"],
    ["☕", "coffee"],
    ["🍵", "matcha"],
    ["🍯", "honey"],
    ["🐖", "pig"],
    ["🐋", "whale"],
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
    gridElt.appendChild(button);
  });
  const container = strHtml`<div />`;
  container.appendChild(themeOptElt);
  container.appendChild(themePickerElt);
  return container;
}

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
