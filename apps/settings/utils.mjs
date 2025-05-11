export function createColorPickerOnRef(ref, text, appUtils, abortSignal) {
  const { strHtml, applyStyle } = appUtils;
  const container = strHtml`<span />`;
  const textElt = text != null ? strHtml`<span>${text}</span>` : null;
  if (textElt) {
    applyStyle(textElt, {
      backgroundColor: "#00000054",
      color: "#fff",
      padding: "5px",
      top: "0px",
      left: "0px",
      position: "absolute",
    });
  }
  const previewElt = strHtml`<div class="w-color-item">${textElt}</div>`;
  previewElt.style.display = "inline-block";
  const inputElt = strHtml`<input class="w-shadow-color-input" type="color" value="${ref.getValue()}" />`;
  ref.onUpdate(
    (val) => {
      inputElt.value = val;
      previewElt.style.backgroundColor = inputElt.value;
    },
    { clearSignal: abortSignal },
  );
  previewElt.style.backgroundColor = inputElt.value;
  previewElt.onclick = () => inputElt.click();
  previewElt.tabIndex = "0";
  previewElt.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      previewElt.click();
    }
  };
  inputElt.onclick = function (evt) {
    ref.setValueIfChanged(evt.target.value);
  };
  inputElt.oninput = function (evt) {
    ref.setValueIfChanged(evt.target.value);
  };
  container.appendChild(previewElt);
  container.appendChild(inputElt);
  return container;
}

export function createNumericSliderOnRef(
  { label, ref, min, max, valueToText },
  appUtils,
  abortSignal,
) {
  const { strHtml } = appUtils;
  const wrapper = strHtml`<div class="w-slider-container">`;
  const sliderLineElt = strHtml`<div class="w-slider-with-value" />`;
  const labelElt = strHtml`<label>${label}</label>`;
  const initialValue = ref.getValue();
  const inputElt = strHtml`<input type="range" class="w-slider" min="${min}" max="${max}" value="${initialValue}">`;
  const valueElt = strHtml`<span class="w-slider-value">${valueToText(initialValue)}</span>`;

  const onChange = () => {
    valueElt.textContent = valueToText(inputElt.value);
    ref.setValueIfChanged(+inputElt.value);
  };
  ref.onUpdate(
    (val) => {
      inputElt.value = val;
      valueElt.textContent = valueToText(val);
    },
    { clearSignal: abortSignal },
  );
  inputElt.oninput = onChange;
  inputElt.onchange = onChange;
  sliderLineElt.appendChild(inputElt);
  sliderLineElt.appendChild(valueElt);
  wrapper.appendChild(labelElt);
  wrapper.appendChild(sliderLineElt);
  return wrapper;
}

export function createCheckboxOnRef({ ref, label }, appUtils, abortSignal) {
  const { strHtml } = appUtils;
  const inputEl = strHtml`<input type="checkbox" checked="">`;
  inputEl.checked = ref.getValue();
  const checkboxElt = strHtml`<div class="w-small-opt">
<span class="w-small-opt-desc">${label}</span>
<label class="w-switch">
	${inputEl}
	<span class="w-switch-slider"></span>
</label>
</div>`;
  inputEl.onchange = function () {
    ref.setValueIfChanged(inputEl.checked);
  };
  ref.onUpdate(
    (val) => {
      inputEl.checked = val;
    },
    { clearSignal: abortSignal },
  );
  return checkboxElt;
}

export function createDropdownOnRef(
  { ref, options, toRef = (val) => val, fromRef = (val) => val, label },
  appUtils,
  abortSignal,
) {
  const { strHtml } = appUtils;
  const selectEl = strHtml`<select class="w-select">
${options.map((o) => strHtml`<option value="${o}">${o}</option>`)}
</select>`;
  selectEl.value = fromRef(ref.getValue());
  const wrapperEl = strHtml`<div class="w-small-opt">
<label>${label}</label>
${selectEl}
</div>`;
  selectEl.oninput = selectEl.onchange = function () {
    ref.setValueIfChanged(toRef(selectEl.value));
  };
  ref.onUpdate(
    (val) => {
      selectEl.value = fromRef(val);
    },
    { clearSignal: abortSignal },
  );
  return wrapperEl;
}
