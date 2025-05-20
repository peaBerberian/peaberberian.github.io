import { createNumericSliderOnRef } from "./utils.mjs";

export default function createSystemSection(env, abortSignal) {
  const { settings, appUtils } = env;
  const { createAppTitle, strHtml, createFullscreenButton } = appUtils;
  const currentVersion = env.getVersion();
  const section = strHtml`<div>${createAppTitle("System", {})}</div>`;
  section.dataset.section = "system";

  const wholeAppGroup = strHtml`<div class="w-group"><h3>General Settings</h3></div>`;
  const fontSizeSlider = createNumericSliderOnRef(
    {
      ref: settings.fontSize,
      label: "Font Size",
      min: 10,
      max: 19,
      valueToText: (val) => {
        const numVal = +val;
        switch (numVal) {
          case 10:
            return "Extremely small";
          case 11:
            return "Minuscule";
          case 12:
            return "Very small";
          case 13:
            return "Small";
          case 14:
            return "Medium";
          case 15:
            return "Somewhat Large?";
          case 16:
            return "Large";
          case 17:
            return "Even Larger";
          case 18:
            return "Very Large";
          default:
            return "Extra Large";
        }
      },
    },
    appUtils,
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
    settings.resetStateToDefault();
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

  const linkToGitHub = strHtml`<div class="w-small-opt"><div>Link to GitHub</div><div><a href="${env.CONSTANTS.PROJECT_REPO}" target="_blank">peaberberian.github.io</a></div>`;
  infoGroup.appendChild(linkToGitHub);

  const version = strHtml`<div class="w-small-opt"><div>version</div><div>${currentVersion}</div></div>`;
  infoGroup.appendChild(version);

  section.appendChild(infoGroup);
  return section;
}
