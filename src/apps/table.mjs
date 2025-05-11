/**
 * @returns {Object}
 */
export default function TableApp() {
  return {
    title: "Sheets",
    icon: "📏",
    lazyLoad: () => import("/lazy/table.js"),
  };
}
