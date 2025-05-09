import { SETTINGS } from "../../../settings.mjs";
import strHtml from "../../../str-html.mjs";
import { createAppTitle } from "../../app-utils.mjs";
import { createColorPickerOnRef, createNumericSliderOnRef } from "./utils.mjs";

export default function createDesktopIconsSection(abortSignal) {
  const section = strHtml`<div>${createAppTitle("Desktop Icons", {})}</div>`;
  section.dataset.section = "icons";
  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;
  const imgBgIconOpacitySlider = createNumericSliderOnRef(
    {
      ref: SETTINGS.iconImageBgOpacity,
      label: "Image background Opacity",
      min: 0,
      max: 100,
      valueToText: (val) => String(val) + "%",
    },
    abortSignal,
  );
  colorGroupElt.appendChild(imgBgIconOpacitySlider);
  const hoverOpacitySlider = createNumericSliderOnRef(
    {
      ref: SETTINGS.iconHoverOpacity,
      label: "Hover background Opacity",
      min: 0,
      max: 100,
      valueToText: (val) => String(val) + "%",
    },
    abortSignal,
  );
  colorGroupElt.appendChild(hoverOpacitySlider);
  const activeIconOpacitySlider = createNumericSliderOnRef(
    {
      ref: SETTINGS.iconActiveOpacity,
      label: "Active Icon Opacity",
      min: 0,
      max: 100,
      valueToText: (val) => String(val) + "%",
    },
    abortSignal,
  );
  colorGroupElt.appendChild(activeIconOpacitySlider);

  [
    ["Icon Image Background", SETTINGS.iconImageBgColor],
    ["Icon Hover Background", SETTINGS.iconHoverBgColor],
    ["Inactive Icon Text", SETTINGS.iconInactiveTextColor],
    ["Active Icon Background", SETTINGS.iconActiveBgColor],
    ["Active Icon Text", SETTINGS.iconActiveTextColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(createColorPickerOnRef(ref, text, abortSignal));
  });
  section.appendChild(colorGroupElt);
  return section;
}
