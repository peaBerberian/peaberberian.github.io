export const SETTINGS_CSS = `
.settings-app .w-group {
  margin-bottom: 30px;
}

.settings-app .w-shadow-color-input {
  visibility: hidden;
  position: absolute;
  margin-left: -165px;
  margin-top: 45px;
}

.settings-app .w-color-item {
  height: 90px;
  width: 165px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px dashed black;
  margin: 0 9px 9px 0;
}

.settings-app .w-color-item.selectable {
  border: 4px solid transparent;
}

.settings-app .w-color-item.selectable.img-empty {
  border: 4px solid var(--app-primary-bg);
}

.settings-app .w-color-item:hover {
  transform: scale(1.1);
}

.settings-app .w-color-item.selected,
.settings-app .w-color-item.selectable.img-empty.selected {
  border-color: var(--app-primary-color);
}

.settings-app .w-color-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings-app .w-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

.settings-app .w-small-opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  max-width: 450px;
  min-height: 56px;
  padding: 10px 0;
}

.settings-app .w-small-opt-desc {
  min-width: 0;
}

.settings-app .w-small-opt.disabled {
  color: var(--app-primary-bg);
}

.settings-app .w-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  min-width: 48px;
  height: 24px;
}

.settings-app .w-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.settings-app .w-small-opt.disabled .w-switch-slider {
  background-color: var(--app-primary-bg);
}

.settings-app .w-char-picker {
  border: 1px solid var(--window-line-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.settings-app .w-char-picker-char {
  display: inline-block;
  font-size: 2em;
  text-align: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  line-height: 40px;
}

.settings-app .w-char-picker-char:hover {
  transform: scale(1.5);
}

.settings-app .w-slider-container {
  width: 100%;
  min-height: 60px;
  padding: 10px 0;
}

.settings-app .w-slider-container label {
  display: block;
  margin-bottom: 5px;
}

.settings-app .w-slider-with-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-app .w-slider {
  flex-grow: 1;
  appearance: none;
  height: 4px;
  background: var(--app-primary-bg);
  outline: none;
  border-radius: 2px;
  cursor: pointer;
}

.settings-app .w-slider:focus {
  background: var(--window-line-color);
}

.settings-app .w-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--app-primary-bg);
  cursor: pointer;
}

.settings-app .w-slider-value {
  width: 40px;
  text-align: center;
}

.settings-app .w-switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--app-primary-bg);
  transition: background-color 0.4s;
  border-radius: 24px;
}

.settings-app .w-switch-slider::before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: transform 0.4s;
  border-radius: 50%;
}

.settings-app input:checked + .w-switch-slider::before {
  transform: translateX(24px);
}

.settings-app input:checked + .w-switch-slider {
  background-color: var(--app-primary-color);
}

.settings-app input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: var(--app-primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.settings-app input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--app-primary-color);
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.settings-app .text-input {
  width: 100%;
  margin-bottom: 10px;
  background-color: var(--app-primary-bg);
  border: 1px solid var(--window-line-color);
  color: var(--window-text-color);
  border-radius: 3px;
  padding: 0 5px;
}

.settings-app .w-select {
  appearance: none;
  -webkit-appearance: none;
  background-color: var(--window-content-bg);
  color: var(--window-text-color);
  border: 1px solid var(--window-line-color);
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  width: auto;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23718096' d='M3 4.5l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  transition:
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

.settings-app .w-select:hover {
  border-color: var(--app-primary-color);
  background-color: var(--app-primary-bg);
}

.settings-app .w-select:focus {
  outline: none;
  border-color: var(--window-line-color);
  background-color: var(--app-primary-bg);
}
`;
