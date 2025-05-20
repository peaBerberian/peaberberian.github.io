import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
} from "./utils.mjs";
import strHtml from "./str-html.mjs";

export default function createApplicationsSection(
  { settings, appUtils },
  abortSignal,
) {
  const { createAppTitle } = appUtils;
  const section = strHtml`<div>${createAppTitle("Applications", {})}</div>`;
  section.dataset.section = "applications";

  const libGroup = strHtml`<div class="w-group"><h3>Common Settings</h3></div>`;

  libGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.aboutMeStart,
        label: `Launch the "About Me" app on start-up by default`,
      },
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
      abortSignal,
    ),
  );
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
      abortSignal,
    ),
  );

  libGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.showIframeBlockerHelp,
        label: "Display i-frame help message when they are not interactive",
      },
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
    colorGroupElt.appendChild(createColorPickerOnRef(ref, text, abortSignal));
  });
  section.appendChild(colorGroupElt);
  return section;
}
