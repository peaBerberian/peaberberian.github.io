import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
} from "./utils.mjs";

export default function createApplicationsSection(
  { settings, appUtils },
  abortSignal,
) {
  const { createAppTitle, strHtml } = appUtils;
  const section = strHtml`<div>${createAppTitle("Applications", {})}</div>`;
  section.dataset.section = "applications";

  const libGroup = strHtml`<div class="w-group"><h3>App libraries settings</h3></div>`;

  libGroup.appendChild(
    createDropdownOnRef(
      {
        ref: settings.toolbarFormat,
        options: ["Icons and text (default)", "Just icons"],
        label: "Toolbar format (in concerned apps)",
        fromRef: (value) => {
          return value === "icon" ? "Just icons" : "Icons and text (default)";
        },
        toRef: (value) => {
          return value === "Just icons" ? "icon" : "both";
        },
      },
      appUtils,
      abortSignal,
    ),
  );
  libGroup.appendChild(
    createDropdownOnRef(
      {
        ref: settings.sidebarFormat,
        options: ["auto (default)", "Always on top"],
        label: "Location of the sidebar (in concerned apps)",
        fromRef: (value) => {
          return value === "auto" ? "auto (default)" : "Always on top";
        },
        toRef: (value) => {
          return value === "Always on top" ? "top" : "auto";
        },
      },
      appUtils,
      abortSignal,
    ),
  );

  libGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.showIframeBlockerHelp,
        label: "Display i-frame help message when they are not interactive",
      },
      appUtils,
      abortSignal,
    ),
  );
  section.appendChild(libGroup);

  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;
  [
    ["Regular Text", settings.windowTextColor],
    ["Regular Background", settings.windowContentBgColor],
    ["Alternative App Color", settings.appPrimaryColorBg],
    ["Alternative App Background", settings.appPrimaryBgColor],
    ["Application Lines", settings.windowLineColor],
    ["Sidebar Background", settings.windowSidebarBgColor],
    ["Sidebar Hover Background", settings.windowSidebarHoverBgColor],
    ["Sidebar Selected Background", settings.windowSidebarSelectedBgColor],
    ["Sidebar Selected Text", settings.windowSidebarSelectedTextColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(
      createColorPickerOnRef(ref, text, appUtils, abortSignal),
    );
  });
  section.appendChild(colorGroupElt);
  return section;
}
