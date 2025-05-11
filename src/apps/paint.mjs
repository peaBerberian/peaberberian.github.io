/**
 * @returns {Object}
 */
export default function PaintApp() {
  return {
    title: "Paint",
    icon: "🖌️",
    defaultHeight: 950,
    defaultWidth: 1000,
    lazyLoad: () => import("/lazy/paint.js"),
  };
}
