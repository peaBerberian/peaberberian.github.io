import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
  createNumericSliderOnRef,
} from "./utils.mjs";

export default function createWindowSection(
  { appUtils, settings },
  abortSignal,
) {
  const { createAppTitle, strHtml } = appUtils;
  const section = strHtml`<div>${createAppTitle("Window", {})}</div>`;
  section.dataset.section = "window";

  const headerStyleGroup = strHtml`<div class="w-group"><h3>Header style</h3></div>`;
  headerStyleGroup.appendChild(
    createDropdownOnRef(
      {
        ref: settings.headerTitlePosition,
        options: ["Left", "Right", "Center"],
        label: "Title Position",
      },
      appUtils,
      abortSignal,
    ),
  );
  headerStyleGroup.appendChild(
    createDropdownOnRef(
      {
        ref: settings.buttonPosition,
        options: ["Left", "Right"],
        label: "Button Position",
      },
      appUtils,
      abortSignal,
    ),
  );
  headerStyleGroup.appendChild(
    createDropdownOnRef(
      {
        ref: settings.buttonStyle,
        options: ["Colorful", "Sober"],
        label: "Button Style",
      },
      appUtils,
      abortSignal,
    ),
  );
  section.appendChild(headerStyleGroup);

  const headerGroup = strHtml`<div class="w-group"><h3>Sizes</h3></div>`;
  headerGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: settings.windowHeaderHeight,
        label: "Header's Height",
        min: 25,
        max: 50,
        valueToText: (val) => String(val) + "px",
      },
      appUtils,
      abortSignal,
    ),
  );
  headerGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: settings.windowButtonSize,
        label: "Button Size",
        min: 10,
        max: 25,
        valueToText: (val) => String(val),
      },
      appUtils,
      abortSignal,
    ),
  );
  headerGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: settings.windowBorderSize,
        label: "Window Border Size (0 to remove borders)",
        min: 0,
        max: 15,
        valueToText: (val) => String(val),
      },
      appUtils,
      abortSignal,
    ),
  );
  section.appendChild(headerGroup);

  const positionGroup = strHtml`<div class="w-group"><h3>Positioning</h3></div>`;
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.oobWindows,
        label: "Windows can partially be moved out of the screen",
      },
      appUtils,
      abortSignal,
    ),
  );
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.absoluteWindowPositioning,
        label: "Absolute Positioning (don't move windows on page resize)",
      },
      appUtils,
      abortSignal,
    ),
  );
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.absoluteWindowSize,
        label: "Absolute size (don't update window size on page resize)",
      },
      appUtils,
      abortSignal,
    ),
  );
  positionGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.dblClickHeaderFullScreen,
        label: "Double clicking on header toggles full-screen mode",
      },
      appUtils,
      abortSignal,
    ),
  );
  section.appendChild(positionGroup);
  const snapGroup = strHtml`<div class="w-group"><h3>Snapping</h3></div>`;
  snapGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.topWindowSnapping,
        label:
          "When moving a window to the top of the screen, put it on fullscreen",
      },
      appUtils,
      abortSignal,
    ),
  );
  snapGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.sideWindowSnapping,
        label:
          "When moving a window to a side of the screen, put it on half-screen mode (if there's enough horizontal space)",
      },
      appUtils,
      abortSignal,
    ),
  );
  section.appendChild(snapGroup);

  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;

  [
    ["Active Header Background", settings.windowActiveHeaderBgColor],
    ["Active Header Text", settings.windowActiveHeaderTextColor],
    ["Inactive Header Background", settings.windowInactiveHeaderBgColor],
    ["Inactive Header Text", settings.windowIninactiveHeaderTextColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(
      createColorPickerOnRef(ref, text, appUtils, abortSignal),
    );
  });
  section.appendChild(colorGroupElt);
  return section;
}
