import {
  TASKBAR_MAX_HORIZONTAL_SIZE,
  TASKBAR_MAX_VERTICAL_SIZE,
  TASKBAR_MIN_HORIZONTAL_SIZE,
  TASKBAR_MIN_VERTICAL_SIZE,
} from "../../../constants.mjs";
import { SETTINGS } from "../../../settings.mjs";
import strHtml from "../../../str-html.mjs";
import { createAppTitle } from "../../app-utils.mjs";
import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
  createNumericSliderOnRef,
} from "./utils.mjs";

export default function createTaskbarSection(abortSignal) {
  const section = strHtml`<div>${createAppTitle("Taskbar", {})}</div>`;
  section.dataset.section = "taskbar";

  const generalGroup = strHtml`<div class="w-group"><h3>General settings</h3></div>`;

  generalGroup.appendChild(
    createDropdownOnRef(
      {
        ref: SETTINGS.taskbarLocation,
        options: ["bottom", "top", "left", "right"],
        label: "Location of the taskbar",
      },
      abortSignal,
    ),
  );
  generalGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.taskbarDisplayTitle,
        label: "Show applications titles",
      },
      abortSignal,
    ),
  );

  generalGroup.appendChild(createTaskbarSizeElt(abortSignal));
  generalGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: SETTINGS.taskbarTaskMargin,
        label: "Space between Tasks",
        min: 0,
        max: 20,
        valueToText: (val) => String(val) + "px",
      },
      abortSignal,
    ),
  );
  section.appendChild(generalGroup);

  const startMenuGroup = strHtml`<div class="w-group"><h3>Start menu</h3></div>`;

  startMenuGroup.appendChild(constructStartMenuLogoSelection());
  startMenuGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.enableStartMenuSublists,
        label: "Enable sub-categories in start menu",
      },
      abortSignal,
    ),
  );

  section.appendChild(startMenuGroup);

  const manualGroup = strHtml`<div class="w-group"><h3>Taskbar manual updates</h3></div>`;
  manualGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.allowManualTaskbarResize,
        label: "Enable resizing the taskbar from its edge",
      },
      abortSignal,
    ),
  );
  manualGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: SETTINGS.allowManualTaskbarMove,
        label: "Enable moving the taskbar by selecting it",
      },
      abortSignal,
    ),
  );
  section.appendChild(manualGroup);

  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;
  const taskbarOpacitySlider = createNumericSliderOnRef(
    {
      ref: SETTINGS.taskbarOpacity,
      label: "Taskbar Opacity",
      min: 0,
      max: 100,
      valueToText: (val) => String(val) + "%",
    },
    abortSignal,
  );
  colorGroupElt.appendChild(taskbarOpacitySlider);

  [
    ["Taskbar Background", SETTINGS.taskbarBgColor],
    ["Taskbar Hover", SETTINGS.taskbarHoverColor],
    ["Taskbar Text", SETTINGS.taskbarTextColor],
    ["Taskbar Active App Background", SETTINGS.taskbarActiveBgColor],
    ["Taskbar Inactive App Background", SETTINGS.taskbarInactiveBgColor],
    ["Start Menu Background", SETTINGS.startMenuBgColor],
    ["Start Menu Text", SETTINGS.startMenuTextColor],
    ["Start Menu Selected Item", SETTINGS.startMenuActiveBgColor],
    ["Start Menu Icon Background", SETTINGS.startMenuIconBgColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(createColorPickerOnRef(ref, text, abortSignal));
  });
  section.appendChild(colorGroupElt);
  return section;
}

function constructStartMenuLogoSelection() {
  const startMenuLogo = strHtml`<input type="button" class="btn" value="${SETTINGS.startMenuPic.getValue()}">`;

  const startMenuLabel = strHtml`<label>${startMenuLogo}</label>`;
  const startMenuOptElt = strHtml`<div><div class="w-small-opt"><span>Start Menu Logo</span>${startMenuLabel}</div></div>`;
  const gridElt = strHtml`<div class="w-char-grid"></div>`;
  const charPickerElt = strHtml`<div class="w-char-picker">
${gridElt}
</div>`;
  startMenuLogo.onclick = () => {
    if (charPickerElt.parentElement) {
      closePicker();
    } else {
      addPicker();
    }
  };
  const emojis = [
    "🚀",
    "🖥️",
    "💻",
    "🖱️",
    "👨‍💻",
    "👩‍💻",
    "🏃",
    "🏃‍♀️",
    "🎬",
    "🗺️",
    "🗄️",
    "🗃️",
    "🧸",
    "🔎",
    "🧭",
    "🏖️",
    "🎉",
    "🍕",
    "🐶",
    "🐱",
    "🦄",
    "🐢",
    "🦁",
    "🐼",
  ];
  emojis.forEach((emoji) => {
    const button = document.createElement("span");
    button.className = "w-char-picker-char";
    button.textContent = emoji;
    button.addEventListener("click", (evt) => {
      startMenuLogo.value = emoji;
      SETTINGS.startMenuPic.setValueIfChanged(emoji);
      closePicker();
      evt.stopPropagation();
      evt.preventDefault();
    });
    gridElt.appendChild(button);
  });
  return startMenuOptElt;

  function addPicker() {
    startMenuOptElt.appendChild(charPickerElt);
  }
  function closePicker() {
    try {
      startMenuOptElt.removeChild(charPickerElt);
    } catch (_) {}
  }
}

function createTaskbarSizeElt(abortSignal) {
  const taskbarSizeWrapperElt = document.createElement("span");
  SETTINGS.taskbarLocation.onUpdate(
    (newVal) => {
      const isCurrentlyHorizontal = ["top", "bottom"].includes(newVal);
      taskbarSizeWrapperElt.innerHTML = "";

      taskbarSizeWrapperElt.appendChild(
        createNumericSliderOnRef(
          {
            ref: SETTINGS.taskbarSize,
            label: "Taskbar size",
            min: isCurrentlyHorizontal
              ? TASKBAR_MIN_HORIZONTAL_SIZE
              : TASKBAR_MIN_VERTICAL_SIZE,
            max: isCurrentlyHorizontal
              ? TASKBAR_MAX_HORIZONTAL_SIZE
              : TASKBAR_MAX_VERTICAL_SIZE,
            valueToText: (val) => String(val),
          },
          abortSignal,
        ),
      );
    },
    { emitCurrentValue: true, clearSignal: abortSignal },
  );
  return taskbarSizeWrapperElt;
}
