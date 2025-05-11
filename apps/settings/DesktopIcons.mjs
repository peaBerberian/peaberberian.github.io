import { createColorPickerOnRef, createNumericSliderOnRef } from "./utils.mjs";

const { createAppTitle, strHtml } = AppUtils;

export default function createDesktopIconsSection(settings, abortSignal) {
  const section = strHtml`<div>${createAppTitle("Desktop Icons", {})}</div>`;
  section.dataset.section = "icons";
  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;
  const imgBgIconOpacitySlider = createNumericSliderOnRef(
    {
      ref: settings.iconImageBgOpacity,
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
      ref: settings.iconHoverOpacity,
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
      ref: settings.iconActiveOpacity,
      label: "Active Icon Opacity",
      min: 0,
      max: 100,
      valueToText: (val) => String(val) + "%",
    },
    abortSignal,
  );
  colorGroupElt.appendChild(activeIconOpacitySlider);

  [
    ["Icon Image Background", settings.iconImageBgColor],
    ["Icon Hover Background", settings.iconHoverBgColor],
    ["Inactive Icon Text", settings.iconInactiveTextColor],
    ["Active Icon Background", settings.iconActiveBgColor],
    ["Active Icon Text", settings.iconActiveTextColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(createColorPickerOnRef(ref, text, abortSignal));
  });
  section.appendChild(colorGroupElt);
  return section;
}
