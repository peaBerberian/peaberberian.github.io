import { createAppIframe } from "../utils.mjs";

/**
 * @returns {Object}
 */
export default function PassGenDemoApp() {
  return {
    title: "passgen",
    icon: "🔑",
    create: () => createElement(),
  };
}

function createElement() {
  return createAppIframe("https://peaberberian.github.io/passgen/");
}
