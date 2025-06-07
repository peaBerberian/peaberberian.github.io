/**
 * Generate content of the "Inception" application.
 * @returns {HTMLElement}
 */
export function create(_args, env) {
  const { createExternalIframe } = env.appUtils;
  const fragmentIdx = location.href.indexOf("#");
  const urlWithoutFragment =
    fragmentIdx > 0 ? location.href.substring(0, fragmentIdx) : location.href;
  // Ugly trick to authorize iframe-in-iframe usage
  // If the URL is reachable or not depends on the server.
  // On Github-pages, it works!
  return {
    element: createExternalIframe(
      urlWithoutFragment + "?" + String(Date.now()),
    ),
  };
}
