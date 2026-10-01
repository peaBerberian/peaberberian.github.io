import {
  applyStyle,
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
} from "./utils.mjs";
import strHtml from "./str-html.mjs";

export default function createApplicationsSection(
  { settings, appUtils, STYLE },
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
    createToolbarFormatSetting(settings, appUtils, STYLE, abortSignal),
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

function createToolbarFormatSetting(settings, appUtils, style, abortSignal) {
  const wrapper = strHtml`<div />`;
  applyStyle(wrapper, {
    width: "100%",
    maxWidth: "450px",
  });

  wrapper.appendChild(
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
  wrapper.appendChild(createToolbarFormatPreview(appUtils, style));
  return wrapper;
}

function createToolbarFormatPreview({ constructAppHeaderLine }, style) {
  const previewRow = strHtml`<div />`;
  applyStyle(previewRow, {
    display: "flex",
    width: "calc(100% - 16px)",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "4px 8px",
    margin: "6px 8px 0",
    minWidth: "0",
  });

  const previewLabel = strHtml`<span>Preview</span>`;
  applyStyle(previewLabel, {
    fontSize: "0.8em",
    lineHeight: "1",
    opacity: "0.7",
  });

  const { element: preview } = constructAppHeaderLine([
    { name: "newFile", title: "New", onClick: () => {} },
    { name: "open", title: "Open", onClick: () => {} },
    { name: "save", title: "Save", onClick: () => {} },
  ]);

  applyStyle(preview, {
    width: "auto",
    minWidth: "min(230px, 100%)",
    flex: "1 1 230px",
    border: "1px solid " + style.lineColor,
    borderRadius: "3px",
  });
  previewRow.setAttribute("role", "group");
  previewRow.setAttribute("aria-label", "Preview");

  previewRow.appendChild(previewLabel);
  previewRow.appendChild(preview);
  return previewRow;
}
