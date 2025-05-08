// To dynamically import, put `import("./lazy/example.js")`
// See `app-utils.js` to see globally defined utils
export function create() {
  return window.strHtml`<div class="w-content">
${window.createAppTitle("Example application", {})}
<p>${"I'm a lazy-loaded application, my code is not in the initial bundle, I'm only loaded when the application is first opened."}</p>
</div>`;
}
