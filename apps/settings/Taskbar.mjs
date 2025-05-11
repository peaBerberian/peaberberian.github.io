import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
  createNumericSliderOnRef,
} from "./utils.mjs";

const { CONSTANTS, createAppTitle, strHtml } = AppUtils;
const {
  TASKBAR_MAX_HORIZONTAL_SIZE,
  TASKBAR_MAX_VERTICAL_SIZE,
  TASKBAR_MIN_HORIZONTAL_SIZE,
  TASKBAR_MIN_VERTICAL_SIZE,
} = CONSTANTS;

export default function createTaskbarSection(settings, abortSignal) {
  const section = strHtml`<div>${createAppTitle("Taskbar", {})}</div>`;
  section.dataset.section = "taskbar";

  const generalGroup = strHtml`<div class="w-group"><h3>General settings</h3></div>`;

  generalGroup.appendChild(
    createDropdownOnRef(
      {
        ref: settings.taskbarLocation,
        options: ["bottom", "top", "left", "right"],
        label: "Location of the taskbar",
      },
      abortSignal,
    ),
  );
  generalGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.taskbarDisplayTitle,
        label: "Show applications titles",
      },
      abortSignal,
    ),
  );

  generalGroup.appendChild(createTaskbarSizeElt(settings, abortSignal));
  generalGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: settings.taskbarTaskMargin,
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

  startMenuGroup.appendChild(constructStartMenuLogoSelection(settings));
  startMenuGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.enableStartMenuSublists,
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
        ref: settings.allowManualTaskbarResize,
        label: "Enable resizing the taskbar from its edge",
      },
      abortSignal,
    ),
  );
  manualGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.allowManualTaskbarMove,
        label: "Enable moving the taskbar by selecting it",
      },
      abortSignal,
    ),
  );
  section.appendChild(manualGroup);

  const colorGroupElt = strHtml`<div class="w-group"><h3>Colors</h3></div>`;
  colorGroupElt.appendChild(
    createNumericSliderOnRef(
      {
        ref: settings.taskbarOpacity,
        label: "Taskbar Opacity",
        min: 0,
        max: 100,
        valueToText: (val) => String(val) + "%",
      },
      abortSignal,
    ),
  );
  colorGroupElt.appendChild(
    createNumericSliderOnRef(
      {
        ref: settings.taskbarActiveAppOpacity,
        label: "Taskbar Active App Opacity",
        min: 0,
        max: 100,
        valueToText: (val) => String(val) + "%",
      },
      abortSignal,
    ),
  );

  [
    ["Taskbar Background", settings.taskbarBgColor],
    ["Taskbar Hover", settings.taskbarHoverColor],
    ["Taskbar Text", settings.taskbarTextColor],
    ["Taskbar Active App Background", settings.taskbarActiveBgColor],
    ["Taskbar Inactive App Background", settings.taskbarInactiveBgColor],
    ["Start Menu Background", settings.startMenuBgColor],
    ["Start Menu Text", settings.startMenuTextColor],
    ["Start Menu Selected Item", settings.startMenuActiveBgColor],
    ["Start Menu Icon Background", settings.startMenuIconBgColor],
  ].forEach(([text, ref]) => {
    colorGroupElt.appendChild(createColorPickerOnRef(ref, text, abortSignal));
  });
  section.appendChild(colorGroupElt);
  return section;
}

function constructStartMenuLogoSelection(settings) {
  const startMenuLogo = strHtml`<input type="button" class="btn" value="${settings.startMenuPic.getValue()}">`;

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
      settings.startMenuPic.setValueIfChanged(emoji);
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

function createTaskbarSizeElt(settings, abortSignal) {
  const taskbarSizeWrapperElt = document.createElement("span");
  settings.taskbarLocation.onUpdate(
    (newVal) => {
      const isCurrentlyHorizontal = ["top", "bottom"].includes(newVal);
      taskbarSizeWrapperElt.innerHTML = "";

      taskbarSizeWrapperElt.appendChild(
        createNumericSliderOnRef(
          {
            ref: settings.taskbarSize,
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
