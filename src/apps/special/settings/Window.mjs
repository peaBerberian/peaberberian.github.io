import { SETTINGS } from "../../../settings.mjs";
import strHtml from "../../../str-html.mjs";
import { createAppTitle } from "../../app-utils.mjs";
import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
  createNumericSliderOnRef,
} from "./utils.mjs";

export default function createWindowSection(abortSignal) {
  const section = strHtml`<div>${createAppTitle("Window", {})}</div>`;
  section.dataset.section = "window";

  const headerStyleGroup = strHtml`<div class="w-group"><h3>Header style</h3></div>`;
  headerStyleGroup.appendChild(
    createDropdownOnRef({
      ref: SETTINGS.headerTitlePosition,
      options: ["Left", "Right", "Center"],
      label: "Title Position",
    }),
  );
  headerStyleGroup.appendChild(
    createDropdownOnRef({
      ref: SETTINGS.buttonPosition,
      options: ["Right", "Left"],
      label: "Button Position",
    }),
  );
  headerStyleGroup.appendChild(
    createDropdownOnRef({
      ref: SETTINGS.buttonStyle,
      options: ["Colorful", "Sober"],
      label: "Button Style",
    }),
  );
  section.appendChild(headerStyleGroup);

  const headerGroup = strHtml`<div class="w-group"><h3>Sizes</h3></div>`;
  headerGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: SETTINGS.windowHeaderHeight,
        label: "Header's Height",
        min: 25,
        max: 50,
        valueToText: (val) => String(val) + "px",
      },
      abortSignal,
    ),
  );
  headerGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: SETTINGS.windowButtonSize,
        label: "Button Size",
        min: 10,
        max: 25,
        valueToText: (val) => String(val),
      },
      abortSignal,
    ),
  );
  headerGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: SETTINGS.windowBorderSize,
        label: "Window Border Size (0 to remove borders)",
        min: 0,
        max: 15,
        valueToText: (val) => String(val),
      },
      abortSignal,
    ),
  );
  section.appendChild(headerGroup);

  const positionGroup = strHtml`<div class="w-group"><h3>Positioning</h3></div>`;
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.oobWindows,
        label: "Windows can partially be moved out of the screen",
      },
      abortSignal,
    ),
  );
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.absoluteWindowPositioning,
        label: "Absolute Positioning (don't move windows on page resize)",
      },
      abortSignal,
    ),
  );
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.absoluteWindowSize,
        label: "Absolute size (don't update window size on page resize)",
      },
      abortSignal,
    ),
  );
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.dblClickHeaderFullScreen,
        label: "Double clicking on header toggles full-screen mode",
      },
      abortSignal,
    ),
  );
  section.appendChild(positionGroup);
  const snapGroup = strHtml`<div class="w-group"><h3>Snapping</h3></div>`;
  snapGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.topWindowSnapping,
        label:
          "When moving a window to the top of the screen, put it on fullscreen",
      },
      abortSignal,
    ),
  );
  snapGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.sideWindowSnapping,
        label:
          "When moving a window to a side of the screen, put it on half-screen mode (if there's enough horizontal space)",
      },
      abortSignal,
    ),
  );
  section.appendChild(snapGroup);

  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;

  [
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
