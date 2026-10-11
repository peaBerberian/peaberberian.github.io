export default `
.app-approval {
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  overflow: auto;
  padding: 24px;
  background: var(--window-content-bg);
  color: var(--window-text-color);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.app-approval h2 {
  font-size: 1.35em;
  line-height: 1.25;
}

.app-approval-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-approval-icon {
  display: grid;
  place-items: center;
  flex: 0 0 64px;
  height: 64px;
  border: 1px solid var(--window-line-color);
  border-radius: 14px;
  background: var(--app-primary-bg);
  font-size: 34px;
  line-height: 1;
}

.app-approval-status {
  margin-top: 4px;
  font-size: 0.85em;
  color: color-mix(in srgb, var(--window-text-color) 70%, var(--window-content-bg));
}

.app-approval-message {
  font-size: 0.95em;
}

.app-approval dl {
  display: grid;
  grid-template-columns: minmax(80px, 0.8fr) minmax(0, 2fr);
  gap: 10px 16px;
  padding: 16px;
  border: 1px solid var(--window-line-color);
  border-radius: 8px;
  background: color-mix(in srgb, var(--app-primary-bg) 55%, var(--window-content-bg));
  font-size: 0.85em;
}

.app-approval dt {
  font-weight: bold;
}

.app-approval dd {
  user-select: text;
}

.app-approval-error:empty {
  display: none;
}

.app-approval-error {
  border-left: 3px solid #c33;
  padding-left: 12px;
  font-size: 0.9em;
}

.app-approval-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--window-line-color);
}

.app-approval .btn {
  min-height: 40px;
  padding: 8px 16px;
  box-shadow: none;
}

.app-approval .btn:hover {
  transform: none;
  box-shadow: 0 2px 6px #0002;
}

.app-approval .app-approval-trust {
  background: var(--window-active-header);
  color: var(--window-active-header-text);
  border-color: var(--window-active-header);
}

.app-approval .btn:focus-visible {
  outline: 2px solid var(--window-active-header);
  outline-offset: 3px;
}

.app-approval .btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
`;
