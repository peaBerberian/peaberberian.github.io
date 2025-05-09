/**
 * @returns {Object}
 */
export default function PongApp() {
  return {
    title: "Pong",
    icon: "🏓",
    defaultHeight: 400,
    defaultWidth: 600,
    lazyLoad: () => import("/lazy/pong.js"),
  };
}
