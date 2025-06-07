/**
 * Allows to encrypt and decrypt "file system paths", so untrusted environments
 * can store them without being able to read them.
 *
 * Read remaining comment for more information on why and the history of this.
 *
 * ---
 *
 * In the desktop, I want some apps to be able to retain "file handles", which
 * are each linked to a filesystem path, yet without the app knowing of that
 * path (as it may contain user-sensitive information).
 *
 * Yet, it would be nicer if the desktop doesn't need to perform bookkeeping,
 * where e.g. would have to explictly "free" paths that are not needed anymore
 * to be able to free the "resource" from memory (well, just the path string
 * in our case, but theoretically we could imagine some apps doing whatever it
 * wants with thousands of paths during its runtime).
 *
 * So there was 2 ideas here:
 *
 * 1. The initial one was to declare an "empty object" (`{}`) handle and use a
 *    JS WeakMap inside the desktop to add a weak reference to that path, so
 *    that if the root app does not have the reference to the handle anymore,
 *    the path is collected.
 *
 *    This idea was efficient and worked well but is not really portable on
 *    "sandboxed" applications, as they don't run in the same environment and
 *    under JS rules they do not share references for the WeakMap trick to work
 *    as intented.
 *
 * 2. This second, more involved, solution. A hash is created through AES which
 *    is actually the encrypted path, that we communicate to the app, but we
 *    keep the key inside the desktop.
 *
 *    When the app needs to reference the path, they give us back that encrypted
 *    data, we can decrypt it through the same key and re-obtain the path.
 *
 *    There's some (negligible) overhead but this solution also have the nice
 *    advantage that it is the app that's actually keeping that reference alive,
 *    and can trash it at any time without needing to call another API.
 */
export default class PathTokenCreator {
  constructor() {
    /**
     * Key relied on by this instance of`PathTokenCreator` to be able to
     * encrypt AND decrypt (AES being symmetrical) paths.
     */
    this._key = crypto.getRandomValues(new Uint8Array(32));
  }

  /**
   * Encrypt a path with that `PathTokenCreator`'s inner key.
   *
   * The obtained result can then be decrypted through that **same instance**'s
   * `decryptPath` method.
   * @param {string} path
   * @returns {Promise.<string>}
   */
  async encryptPath(path) {
    const encoder = new TextEncoder();
    const data = encoder.encode(path);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      this._key,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"],
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data,
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt a path, previously encrypted with the `encryptPath` method of the
   * same `PathTokenCreator` instance.
   * @param {string} path
   * @returns {Promise.<string>}
   */
  async decryptPath(token) {
    try {
      const combined = new Uint8Array(
        atob(token)
          .split("")
          .map((c) => c.charCodeAt(0)),
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        this._key,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"],
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encrypted,
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      throw new Error("Invalid token");
    }
  }
}
