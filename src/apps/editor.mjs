/**
 * @returns {Object}
 */
export default function PaintApp() {
  return {
    title: "Notes",
    icon: "📝",
    defaultHeight: 500,
    defaultWidth: 500,
    lazyLoad: () => import("/lazy/editor.js"),
  };
}
