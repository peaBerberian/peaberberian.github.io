/** @typedef {{repository: string, path: string}} AppIconImage */

/** Repository locations and artwork authorization are owned by the desktop. */
const repositories = new Map([
  [
    "desktop",
    {
      // The desktop is served from either mirror. Keep asset paths portable.
      baseUrl: null,
      origins: new Set([
        "https://peaberberian.github.io",
        "https://paulswebdesktop.netlify.app",
      ]),
    },
  ],
]);

/** Validate the single supported app-artwork reference format. */
export function isAppIconImage(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  if (
    Object.keys(value).length !== 2 ||
    !Object.hasOwn(value, "repository") ||
    !Object.hasOwn(value, "path")
  ) {
    return false;
  }
  if (
    typeof value.repository !== "string" ||
    value.repository.trim().length === 0
  ) {
    return false;
  }
  if (
    typeof value.path !== "string" ||
    value.path.length === 0 ||
    value.path !== value.path.trim()
  ) {
    return false;
  }
  if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(value.path)) {
    return false;
  }
  return !/[\\\x00-\x1f\x7f]/.test(value.path);
}

/**
 * Resolve a repository-relative image reference without executable trust checks.
 * Future enabled repositories can extend the desktop-owned registry above;
 * app manifests cannot provide base URLs or authorize origins themselves.
 * @param {AppIconImage} value
 * @param {string} desktopUrl - Base URL for the desktop's built-in repository.
 * @returns {URL|null}
 */
export function resolveAppImageUrl(value, desktopUrl) {
  if (!isAppIconImage(value)) {
    return null;
  }
  const repository = repositories.get(value.repository);
  if (!repository) {
    return null;
  }
  try {
    const base = new URL("./", repository.baseUrl ?? desktopUrl);
    const url = new URL(value.path, base);
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      !repository.origins.has(base.origin) ||
      url.origin !== base.origin ||
      url.username ||
      url.password ||
      !url.pathname.startsWith(base.pathname)
    ) {
      return null;
    }
    return url;
  } catch (_) {
    return null;
  }
}
