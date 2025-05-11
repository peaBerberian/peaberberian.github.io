/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
export function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
