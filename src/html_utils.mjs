/** Escape a value interpolated into HTML text, rather than an attribute. */
export function escapeHtmlText(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
  return String(value ?? "").replace(/[&<>]/g, (character) => {
    return entities[character];
  });
}
