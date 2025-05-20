import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createNumericSliderOnRef,
} from "./utils.mjs";
import strHtml from "./str-html.mjs";

export default function createDesktopIconsSection(
  { filesystem, settings, appUtils },
  abortSignal,
) {
  const { createAppTitle } = appUtils;
  const section = strHtml`<div>${createAppTitle("Desktop Icons", {})}</div>`;
  section.dataset.section = "icons";
  const generalGroupElt = strHtml`<div class="w-group"><h3>General Settings</h3></div>`;
  generalGroupElt.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.moveAroundIcons,
        label: "Desktop icons can be moved around from the desktop",
      },
      abortSignal,
    ),
  );
  const resetButtonElt = document.createElement("button");
  resetButtonElt.className = "btn";
  resetButtonElt.textContent = "Reset";
  resetButtonElt.onclick = () => {
    filesystem.rmFile("/userconfig/desktop.config.json");
  };
  generalGroupElt.appendChild(strHtml`<div class="w-small-opt">
	<span class="w-small-opt-desc">Reset to original desktop icons</span>
	${resetButtonElt}
</div>`);
  section.appendChild(generalGroupElt);
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
