/** Desktop configuration containing the last approved hash for each user app. */
export const TRUST_REGISTRY_PATH = "/userconfig/trusted-apps.json";

/** A trust failure whose message can be displayed by the launcher. */
export class AppTrustError extends Error {}

/**
 * Check whether an executable can run under its declared app id.
 *
 * Executables in the read-only `/apps/` directory are the source of trust for
 * their ids. Their hashes are rebuilt when this instance is created, so an
 * update of those apps does not require user approval. An identical copy can
 * also run from another location.
 *
 * For other ids, `/userconfig/trusted-apps.json` contains the last approved
 * hash. Unknown or modified executables need approval before they can run.
 * An entry in that file cannot override an id defined in `/apps/`.
 *
 * This class handles those decisions and their persistence. The launcher
 * supplies the function opening the approval app, which only displays the
 * request and calls back with the user's decision.
 */
export default class AppTrust {
  /**
   * @param {Object} filesystem - Desktop filesystem, also used to observe
   * changes to the trust configuration made through an editor or trusted app.
   * @param {Array.<Object>} builtins - Executables exposed through `/apps/`.
   * @param {Function} openApproval - Opens the approval app with three arguments:
   * the `approvalRequest`, its `setApproval` callback, and a signal which aborts
   * when that request finishes. Returns a promise for app initialization.
   */
  constructor(filesystem, builtins, openApproval) {
    this._filesystem = filesystem;
    this._openApproval = openApproval;
    /**
     * Pending launch requests, grouped by app id and executable hash.
     * Each function finishes just one request. Multiple requests still open
     * separate approval windows, but approval of that hash releases all of them.
     * @type {Map.<string, Set.<Function>>}
     */
    this._pending = new Map();
    /**
     * Serialize registry writes so concurrent approvals do not overwrite each
     * other's changes. Launches can still wait for approval independently.
     * @type {Promise}
     */
    this._writes = Promise.resolve();
    /**
     * Built-in hashes, captured before any executable can be launched.
     * @type {Map.<string, Promise.<string>>}
     */
    this._builtins = new Map();
    for (const app of builtins) {
      this._builtins.set(app.id, hashExecutable(serializeExecutable(app)));
    }
    filesystem.watch(TRUST_REGISTRY_PATH, () => {
      // A missing or invalid registry must not release pending launches.
      // Errors while saving approval are returned separately to the approval app.
      this._refreshPendingApprovals().catch(() => {});
    });
  }

  /**
   * Check trust, waiting for the user if this executable needs approval.
   *
   * The returned object is a copy of the executable at the time of this call.
   * The launcher should use that copy to construct the app environment and run
   * its code, so later changes to the original object cannot bypass the check.
   * @param {Object} executable
   * @param {string} [path] - Filesystem location, displayed in the approval app.
   * It does not participate in the hash, so moving an executable preserves trust.
   * Paths inside the executable itself (such as `lazyLoad`) are still hashed.
   * @param {AbortSignal} [signal] - Cancels this launch and its approval window.
   * Used e.g. when a file picker is requested by a window which then closes.
   * @returns {Promise.<Object>} - Executable whose trust has been checked.
   * Rejects on invalid executables, registry errors or changed trust, and with
   * an `AbortError` when the launch is cancelled or a built-in id does not match.
   */
  async checkTrust(executable, path, signal) {
    // Copy before any await, including the one needed to compute the hash.
    const serialized = serializeExecutable(executable);
    const app = JSON.parse(serialized);
    if (
      !app ||
      typeof app.id !== "string" ||
      !/^[A-Za-z0-9_-]+$/.test(app.id) ||
      !app.data ||
      typeof app.data !== "object" ||
      Array.isArray(app.data) ||
      !(
        (typeof app.data.lazyLoad === "string" && app.data.lazyLoad) ||
        (typeof app.data.website === "string" && app.data.website)
      ) ||
      (app.data.dependencies !== undefined &&
        (!Array.isArray(app.data.dependencies) ||
          app.data.dependencies.some(
            (dependency) => typeof dependency !== "string",
          )))
    ) {
      throw new AppTrustError(
        "This executable is invalid. The app was not started.",
      );
    }
    const hash = await hashExecutable(serialized);
    signal?.throwIfAborted();
    // Display information for the approval app. This is not an executable:
    // no code reference is passed, and the hash and path come from the desktop.
    const approvalRequest = {
      id: app.id,
      hash,
      title: app.title ?? app.id,
      icon: app.icon,
      path,
      dependencies: app.data.dependencies,
    };
    // Check built-in ids before even reading the user registry. A modified
    // executable claiming one of those ids cannot be approved as that app.
    if (this._builtins.has(app.id)) {
      const builtinHash = await this._builtins.get(app.id);
      signal?.throwIfAborted();
      if (builtinHash === hash) return app;
      await this._requestApproval(approvalRequest, "builtin", signal);
      throw new DOMException(
        "Executable differs from the built-in app",
        "AbortError",
      );
    }
    const registry = await this._readRegistry();
    signal?.throwIfAborted();
    const known = Object.hasOwn(registry.apps, app.id);
    const entry = known ? registry.apps[app.id] : undefined;
    if (entry?.hash === hash) return app;
    const decision = this._requestApproval(
      approvalRequest,
      known ? "changed" : "new",
      signal,
    );
    // Cover an external approval between the initial read and opening the prompt.
    this._refreshPendingApprovals().catch(() => {});
    if ((await decision) !== true)
      throw new DOMException("Launch cancelled", "AbortError");
    signal?.throwIfAborted();
    // Another executable with this same id may have been approved meanwhile.
    // Check the current hash again before allowing this particular launch.
    const current = await this._readRegistry();
    signal?.throwIfAborted();
    if (
      !Object.hasOwn(current.apps, app.id) ||
      current.apps[app.id]?.hash !== hash
    ) {
      throw new AppTrustError(
        "Trust for this app changed before it could start. Open it again to check the current version.",
      );
    }
    return app;
  }

  /**
   * Read the current trust configuration. No cache is kept here because the
   * user and fully trusted apps can also edit that file.
   * @returns {Promise.<Object>}
   * @private
   */
  async _readRegistry() {
    let registry;
    try {
      registry = await this._filesystem.readFile(TRUST_REGISTRY_PATH, "object");
    } catch (error) {
      if (error.code !== "NoEntryError") {
        throw new AppTrustError(
          `Could not read ${TRUST_REGISTRY_PATH}. The app was not started. Check that file and try again.`,
          { cause: error },
        );
      }
      return { version: 1, apps: {} };
    }
    if (
      registry?.version !== 1 ||
      !registry.apps ||
      typeof registry.apps !== "object" ||
      Array.isArray(registry.apps)
    ) {
      throw new AppTrustError(
        `${TRUST_REGISTRY_PATH} has an invalid format. The app was not started. Fix that file and try again.`,
      );
    }
    return registry;
  }

  /**
   * Record approval, replacing the previous hash for this id. Older versions
   * will need approval again if launched later. Existing app data is untouched.
   * @param {string} id
   * @param {string} hash
   * @returns {Promise} - Resolves only after the registry has been written.
   * @private
   */
  _approve(id, hash) {
    const write = this._writes.then(async () => {
      if (this._builtins.has(id))
        throw new Error("Built-in trust cannot be overridden");
      const registry = await this._readRegistry();
      // App ids such as "__proto__" should be ordinary entries here, without
      // invoking a setter inherited from Object.prototype.
      Object.defineProperty(registry.apps, id, {
        value: { hash },
        enumerable: true,
        writable: true,
        configurable: true,
      });
      await this._filesystem.writeFile(
        TRUST_REGISTRY_PATH,
        JSON.stringify(registry, null, 2),
      );
    });
    // Keep the queue usable after a failed write, while returning the original
    // rejection so the approval app can display the error and offer a retry.
    this._writes = write.catch(() => {});
    return write;
  }

  /**
   * Open one approval app for one launch request.
   * @param {Object} approvalRequest - Information prepared by `checkTrust`.
   * @param {string} reason - "new", "changed", or "builtin" (id mismatch).
   * @param {AbortSignal} [signal] - Cancellation of the requesting launch.
   * @returns {Promise.<boolean>} - Whether this request was approved.
   * @private
   */
  _requestApproval(approvalRequest, reason, signal) {
    if (signal?.aborted) return Promise.resolve(false);
    const { id, hash } = approvalRequest;
    const key = `${id}:${hash}`;
    const controller = new AbortController();
    let resolveDecision;
    let rejectDecision;
    const decision = new Promise((resolve, reject) => {
      resolveDecision = resolve;
      rejectDecision = reject;
    });
    // Aborting this local signal tells the approval app to close. Its onClose
    // callback may call setApproval(false) again, so finishing is idempotent.
    const finish = (value) => {
      if (controller.signal.aborted) return;
      const requests = this._pending.get(key);
      requests?.delete(finish);
      if (requests?.size === 0) this._pending.delete(key);
      controller.abort();
      resolveDecision(value);
    };
    // The callback is tied to this id/hash. The app supplies only a boolean,
    // and cannot use it to approve another executable or a built-in mismatch.
    const setApproval = async (approved) => {
      if (controller.signal.aborted) return;
      if (approved === true && reason !== "builtin") {
        // Save before releasing launches. A write failure leaves them pending
        // and rejects back to the approval app instead of granting trust.
        await this._approve(id, hash);
        this._releasePending(id, hash);
      } else {
        finish(false);
      }
    };
    signal?.addEventListener("abort", () => finish(false), {
      signal: controller.signal,
    });
    // Built-in mismatches cannot be released by registry changes.
    if (reason !== "builtin") {
      let requests = this._pending.get(key);
      if (!requests) {
        requests = new Set();
        this._pending.set(key, requests);
      }
      requests.add(finish);
    }
    this._openApproval(
      { ...approvalRequest, reason },
      setApproval,
      controller.signal,
    ).catch((error) => {
      if (controller.signal.aborted) return;
      if (error.name !== "AbortError") rejectDecision(error);
      finish(false);
    });
    return decision;
  }

  /**
   * Finish all pending requests for exactly this approved id and hash.
   * @param {string} id
   * @param {string} hash
   * @private
   */
  _releasePending(id, hash) {
    const requests = this._pending.get(`${id}:${hash}`);
    if (!requests) return;
    // Each callback removes its own entry. Removing the current Set entry
    // still lets this loop visit the remaining requests; no copy is needed.
    for (const finish of requests) finish(true);
  }

  /**
   * Release matching requests when approval was written to the registry,
   * including changes made outside the approval app. Built-in ids are ignored.
   * @returns {Promise}
   * @private
   */
  async _refreshPendingApprovals() {
    const registry = await this._readRegistry();
    for (const [id, entry] of Object.entries(registry.apps)) {
      if (!this._builtins.has(id) && typeof entry?.hash === "string") {
        this._releasePending(id, entry.hash);
      }
    }
  }
}

/**
 * Serialize an executable to JSON, sorting object keys so that their original
 * order does not change the hash. Array order still matters.
 *
 * Unsupported values are rejected instead of letting `JSON.stringify` remove
 * or convert them: the executable we check should be the one we will run.
 * @param {*} value - Executable, or one of its properties during recursion.
 * @param {Set.<Object>} [ancestors] - Objects in the current recursion branch,
 * used to detect circular references. An object reused in separate branches
 * is allowed.
 * @returns {string}
 */
export function serializeExecutable(value, ancestors = new Set()) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === "number" && Number.isFinite(value))
    return JSON.stringify(value);
  if (
    typeof value !== "object" ||
    ancestors.has(value) ||
    Object.getOwnPropertySymbols(value).length > 0
  ) {
    throw new Error("Executables must contain only JSON values");
  }
  ancestors.add(value);
  let serialized;
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length) {
      throw new Error(
        "Executable arrays must contain only indexed JSON values",
      );
    }
    const entries = [];
    for (const entry of value) {
      entries.push(serializeExecutable(entry, ancestors));
    }
    serialized = `[${entries.join(",")}]`;
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error("Executables must contain plain JSON objects");
    }
    const entries = [];
    for (const key of Object.keys(value).sort()) {
      entries.push(
        `${JSON.stringify(key)}:${serializeExecutable(value[key], ancestors)}`,
      );
    }
    serialized = `{${entries.join(",")}}`;
  }
  ancestors.delete(value);
  return serialized;
}

/**
 * Compute a SHA-256 hash from the UTF-8 serialization of an executable.
 *
 * This hashes all the executable's fields, including code URLs and requested
 * dependencies. It does not fetch or hash the code behind those URLs.
 * @param {string} serialized - Output of `serializeExecutable`.
 * @returns {Promise.<string>} - Hexadecimal hash prefixed with "sha256:".
 */
export async function hashExecutable(serialized) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(serialized),
  );
  const bytes = new Uint8Array(digest);
  let hash = "sha256:";
  for (const byte of bytes) hash += byte.toString(16).padStart(2, "0");
  return hash;
}
