/**
 * @returns {Object}
 */
export default function PassGenDemoApp() {
  return {
    title: "BombSweeper!",
    icon: "💣",
    defaultHeight: 700,
    defaultWidth: 600,
    lazyLoad: () => import("/lazy/bombsweeper.js"),
  };
}
