import { createAppIframe } from "../utils.mjs";

/**
 * Generate content of the "RxPlayer" application.
 * @returns {Object}
 */
export default function RxPlayerDemo() {
  return {
    title: "Inception",
    icon: "🧠",
    create: () => createApp(),
    defaultHeight: ({ maxHeight }) => {
      if (maxHeight * 0.85 > 200) {
        return maxHeight * 0.85;
      }
      return maxHeight;
    },
    defaultWidth: ({ maxWidth }) => {
      if (maxWidth * 0.85 > 400) {
        return maxWidth * 0.85;
      }
      return maxWidth;
    },
  };
}

function createApp() {
  const fragmentIdx = location.href.indexOf("#");
  const urlWithoutFragment =
    fragmentIdx > 0 ? location.href.substring(0, fragmentIdx) : location.href;
  // Ugly trick to authorize iframe-in-iframe usage
  // If the URL is reachable or not depends on the server.
  // On Github-pages, it works!
  return {
    element: createAppIframe(urlWithoutFragment + "?" + String(Date.now())),
  };
}
