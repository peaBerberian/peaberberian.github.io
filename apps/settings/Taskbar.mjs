import {
  createCheckboxOnRef,
  createColorPickerOnRef,
  createDropdownOnRef,
  createNumericSliderOnRef,
} from "./utils.mjs";

export default function createTaskbarSection(
  { settings, appUtils },
  taskbarDimensionLimits,
  abortSignal,
) {
  const { createAppTitle, strHtml } = appUtils;
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
      appUtils,
      abortSignal,
    ),
  );
  generalGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.taskbarDisplayTitle,
        label: "Show applications titles",
      },
      appUtils,
      abortSignal,
    ),
  );

  generalGroup.appendChild(
    createTaskbarSizeElt(settings, taskbarDimensionLimits, abortSignal),
  );
  generalGroup.appendChild(
    createNumericSliderOnRef(
      {
        ref: settings.taskbarTaskMargin,
        label: "Space between Tasks",
        min: 0,
        max: 20,
        valueToText: (val) => String(val) + "px",
      },
      appUtils,
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
      appUtils,
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
      appUtils,
      abortSignal,
    ),
  );
  manualGroup.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.allowManualTaskbarMove,
        label: "Enable moving the taskbar by selecting it",
      },
      appUtils,
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
      appUtils,
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
      appUtils,
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
    colorGroupElt.appendChild(
      createColorPickerOnRef(ref, text, appUtils, abortSignal),
    );
  });
  section.appendChild(colorGroupElt);
  return section;

  function createTaskbarSizeElt(settings, taskbarDimensionLimits, abortSignal) {
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
                ? taskbarDimensionLimits.minHorizontalSize
                : taskbarDimensionLimits.minVerticalSize,
              max: isCurrentlyHorizontal
                ? taskbarDimensionLimits.maxHorizontalSize
                : taskbarDimensionLimits.maxVerticalSize,
              valueToText: (val) => String(val),
            },
            appUtils,
            abortSignal,
          ),
        );
      },
      { emitCurrentValue: true, clearSignal: abortSignal },
    );
    return taskbarSizeWrapperElt;
  }
}

function constructStartMenuLogoSelection(settings) {
  const wrapperElt = document.createElement("div");

  // First the text description
  const startMenuOptElt = document.createElement("div");
  startMenuOptElt.className = "w-small-opt";
  startMenuOptElt.innerHTML = "<span>Start Menu Logo</span>";

  // Then the button:
  // TODO: I don't even remember why I created an empty label here.
  const startMenuLabelElt = document.createElement("label");
  const startMenuLogoElt = document.createElement("input");
  startMenuLogoElt.type = "button";
  startMenuLogoElt.className = "btn";
  startMenuLogoElt.value = settings.startMenuPic.getValue();
  startMenuLabelElt.appendChild(startMenuLogoElt);

  startMenuOptElt.appendChild(startMenuLabelElt);
  wrapperElt.appendChild(startMenuOptElt);

  // Now the char selection grid that is optionally shown
  const charPickerElt = document.createElement("div");
  charPickerElt.className = "w-char-picker";
  const gridElt = document.createElement("div");
  gridElt.className = "w-char-grid";
  charPickerElt.appendChild(gridElt);

  startMenuLogoElt.onclick = () => {
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
      startMenuLogoElt.value = emoji;
      settings.startMenuPic.setValueIfChanged(emoji);
      closePicker();
      evt.stopPropagation();
      evt.preventDefault();
    });
    gridElt.appendChild(button);
  });
  return wrapperElt;

  function addPicker() {
    wrapperElt.appendChild(charPickerElt);
  }
  function closePicker() {
    try {
      wrapperElt.removeChild(charPickerElt);
    } catch (_) {}
  }
}
