/**
 * @returns {Object}
 */
export default function PassGenDemoApp() {
  return {
    title: "passgen",
    icon: "🔑",
    defaultHeight: 300,
    defaultWidth: 450,
    lazyLoad: () => import("/lazy/passgen.js"),
  };
}
