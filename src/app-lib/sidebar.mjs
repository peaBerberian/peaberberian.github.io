import { constructSidebarElt } from "../utils.mjs";

/**
 * Construct the content part of an app with a sidebar corresponding to the
 * given `sections` object.
 *
 * @param {Array.<Object>} sections - Array of objects, each of which describes
 * a single sidebar section.
 * Each object have the following properties:
 * -  `icon` (`string|undefined`): Optional icon describing the section.
 * -  `text` (`string`): Title describing the section.
 * -  `centered` (`boolean|undefined`): If `true`, the section should be
 *    centered on screen and have large paddings. Adapted for text-only
 *    sections.
 * -  `noPadding` (`boolean|undefined`): If `true`, we will ensure that there's
 *    no padding in the content. Adapted for i-frame. SHOULD NOT be combined
 *    with the `centered` option.
 * - `render` (Function): Function taking in argument an `AbortSignal` (so the
 *   section can know when to free resources) and returning the `HTMLElement`
 *   that will be the content of this section.
 * @param {AbortSignal} abortSignal - `AbortSignal` that will be provided to the
 * application so it can free the resources it reserved.
 * @returns {Object} - Object describing the application:
 * -  `element` (`HTMLElement`): The application's content, with a sidebar.
 * -  `focus` (`function`): Allows to focus the content of the application.
 */
export function constructAppWithSidebar(sections, abortSignal) {
  /**
   * Inner AbortController, used to free resources when navigating to the
   * different sections.
   * @type {AbortController}
   */
  let childAbortController = new AbortController();
  abortSignal.addEventListener("abort", () => {
    childAbortController.abort();
  });

  // const sidebarTitle = strHtml`<div class="sidebar-title">...</div>`;
  const container = document.createElement("div");
  container.className = "w-container";
  const content = document.createElement("div");
  content.className = "w-content";
  content.tabIndex = "0";
  const formattedSections = sections.slice().map((s, i) => {
    return { ...s, section: i };
  });
  formattedSections[0].active = true;
  const displaySection = (section) => {
    childAbortController.abort();
    childAbortController = new AbortController();
    content.innerHTML = "";
    if (formattedSections[section].noPadding) {
      content.style.padding = "0";
    } else {
      content.style.padding = "";
    }
    const wantedSection = formattedSections[section];
    const innerContentElt = wantedSection.render(childAbortController.signal);
    if (wantedSection.centered) {
      innerContentElt.classList.add("w-content-centered");
    }
    content.appendChild(innerContentElt);
    content.focus({ preventScroll: true });
  };
  const sidebar = constructSidebarElt(formattedSections, (section) => {
    displaySection(section);
    content.scrollTo(0, 0);
  });
  container.appendChild(sidebar);
  container.appendChild(content);
  displaySection(0);
  return {
    element: container,
    focus: () => {
      content.focus({ preventScroll: true });
    },
  };
}
