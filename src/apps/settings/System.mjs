import { __VERSION__ } from "../../constants.mjs";
import { SETTINGS, resetStateToDefault } from "../../settings.mjs";
import strHtml from "../../str-html.mjs";
import { applyStyle } from "../../utils.mjs";
import { createAppTitle, createFullscreenButton } from "../app-utils.mjs";
import { createNumericSliderOnRef } from "./utils.mjs";

export default function createSystemSection(abortSignal) {
  const section = strHtml`<div>${createAppTitle("System", {})}</div>`;
  section.dataset.section = "system";

  const wholeAppGroup = strHtml`<div class="w-group"><h3>General Settings</h3></div>`;
  const fontSizeSlider = createNumericSliderOnRef(
    {
      ref: SETTINGS.fontSize,
      label: "Font Size",
      min: 12,
      max: 19,
      valueToText: (val) => {
        const numVal = +val;
        if (numVal <= 12) {
          return "Very small";
        } else if (numVal === 13) {
          return "Small";
        } else if (numVal === 14) {
          return "Medium";
        } else if (numVal === 15) {
          return "Somewhat Large?";
        } else if (numVal === 16) {
          return "Large";
        } else if (numVal === 17) {
          return "Even Larger";
        } else if (numVal === 18) {
          return "Very Large";
        } else {
          return "Extra Large";
        }
      },
    },
    abortSignal,
  );
  fontSizeSlider.classList.add("w-small-opt");
  fontSizeSlider.style.height = "50px";
  wholeAppGroup.appendChild(fontSizeSlider);

  section.appendChild(wholeAppGroup);

  const usefulGroup = strHtml`<div class="w-group"><h3>Useful buttons!</h3></div>`;

  const fullscreenButton = createFullscreenButton(abortSignal);
  fullscreenButton.style.marginRight = "10px";
  fullscreenButton.style.marginBottom = "10px";
  usefulGroup.appendChild(fullscreenButton);

  const resetButton = strHtml`<input class="btn" type="button" value="Reset all settings">`;
  resetButton.style.marginRight = "10px";
  resetButton.style.marginBottom = "10px";
  resetButton.onclick = function () {
    resetStateToDefault();
  };
  usefulGroup.appendChild(resetButton);

  const rebootButton = strHtml`<input class="btn" type="button" value="Fast Reboot">`;
  rebootButton.style.marginRight = "10px";
  rebootButton.style.marginBottom = "10px";
  rebootButton.onclick = function () {
    const fragmentIdx = location.href.indexOf("#");
    const urlWithoutFragment =
      fragmentIdx > 0 ? location.href.substring(0, fragmentIdx) : location.href;
    window.location.href = urlWithoutFragment;
    window.location.reload();
  };
  usefulGroup.appendChild(rebootButton);
  section.appendChild(usefulGroup);

  const infoGroup = strHtml`<div class="w-group"><h3>Technical Information</h3></div>`;

  const linkToGitHub = strHtml`<div class="w-small-opt"><div>Link to GitHub</div><div><a href="https://github.com/peaBerberian/peaberberian.github.io" target="_blank">peaberberian.github.io</a></div>`;
  infoGroup.appendChild(linkToGitHub);

  const version = strHtml`<div class="w-small-opt"><div>version</div><div>${__VERSION__}</div></div>`;
  infoGroup.appendChild(version);

  section.appendChild(infoGroup);

  const thanks = strHtml`<div><div class="separator" />
	<p> Thanks to <a href="https://unsplash.com" target="_blank">unsplash</a> for providing free-to-use pictures - that I used to get wallpapers, and especially thanks to the following unsplash contributors from which I sourced wallpaper images (because I liked those!):
	<ul>
		<li>Kalen Emsley (@kalenemsley on unsplash)</li>
		<li>Jack B (@nervum on unsplash)</li>
		<li>Irina Iriser (@iriser on unsplash)</li>
		<li>Lucas Dalamarta (@lucasdalamartaphoto on unsplash)</li>
		<li>Tim Schmidbauer (@timschmidbauer on unsplash)</li>
		<li>Ashim D'Silva (@randomlies on unsplash)</li>
		<li>Benjamin Voros (@vorosbenisop on unsplash)</li>
	</ul>
</p></div>`;
  applyStyle(thanks, {
    fontSize: "0.9em",
  });
  section.appendChild(thanks);
  return section;
}
