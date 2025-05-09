import { createAppIframe } from "../utils.mjs";

/**
 * @returns {Object}
 */
export default function PassGenDemoApp() {
  return {
    title: "passgen",
    icon: "🔑",
    create: () => createApp(),
  };
}

function createApp() {
  return {
    element: createAppIframe("https://peaberberian.github.io/passgen/"),
  };
}
