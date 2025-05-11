const { strHtml, createAppTitle } = window.AppUtils;

// To dynamically import, put `import("/lazy/example.js")` (the name of the
// directory with a `.js` suffix) in your code.
//
// As an example for an app, you can export:
// ```
// export default function MyApp() {
//   return {
//     // ...
//     lazyLoad: () => import("/lazy/example.js")`,
//   };
// }
// ```
//
// Take a look at `app-utils.js` to see globally defined utils.
export function create() {
  return {
    element: strHtml`<div class="w-content">
${createAppTitle("Example application", {})}
<p>${"I'm a lazy-loaded application, my code is not in the initial bundle, I'm only loaded when the application is first opened."}</p>
</div>`,
  };
}
