/** Escape a value interpolated into HTML text, rather than an attribute. */
export function escapeHtmlText(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
  return String(value ?? "").replace(/[&<>]/g, (character) => entities[character]);
}

export function keepWindowActiveInCurrentEventLoopIteration(windowElt) {
  // Ugly trick to prevent the window to be needlesly deactivated before the
  // next event loop turn
  windowElt.dataset.dontDisableOnLoop = true;
  setTimeout(() => {
    delete windowElt.dataset.dontDisableOnLoop;
  }, 0);
}
