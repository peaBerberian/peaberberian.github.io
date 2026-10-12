import styles from "./styles.mjs";

/**
 * Display a trust question for an executable which the desktop wants to launch.
 *
 * This app does not write trust configuration or launch that executable. Those
 * operations stay in the desktop, through the callback provided in arguments.
 * @param {Array.<*>} args - Three values supplied by the desktop:
 * - `approvalRequest`: display information (id, hash, title, icon, path,
 *   dependencies and reason), assembled by the desktop. Not an executable.
 * - `setApproval`: callback taking true to approve or false to cancel. It is tied
 *   to this request's id/hash and returns a promise for recording the decision.
 * - `decisionSignal`: aborts when this request finishes, possibly because another
 *   approval window approved the same executable. This window should then close.
 * @param {Object} env - Util functions coming from the environment.
 * @param {Function} env.updateTitle - Update this window's icon and title.
 * @param {Function} env.closeApp - Close this approval app's window.
 * @param {AbortSignal} abortSignal - Lifetime of this app's window, separate from
 * the pending launch's `decisionSignal`.
 * @returns {Object} - The application's element and its close callback.
 */
export function create([approvalRequest, setApproval, decisionSignal], env, abortSignal) {
  const {
    id,
    title = id,
    icon,
    path,
    sourceUrl,
    dependencies = [],
    reason = "new",
  } = approvalRequest;
  const blocked = reason === "builtin";
  // Keep the desktop's shield in the title bar. The executable's own icon and
  // name provide context inside the window, but are not evidence of trust.
  env.updateTitle(blocked ? `Cannot run ${title}` : `Trust ${title}?`, {
    icon: "🛡️",
  });
  const element = document.createElement("div");
  element.className = "app-approval";
  const identity = document.createElement("div");
  identity.className = "app-approval-identity";
  const appIcon = document.createElement("span");
  appIcon.className = "app-approval-icon";
  appIcon.setAttribute("aria-hidden", "true");
  appIcon.textContent = icon || "📦";
  const identityText = document.createElement("div");
  const heading = document.createElement("h2");
  heading.textContent = title;
  const status = document.createElement("p");
  status.className = "app-approval-status";
  status.textContent = blocked
    ? "Built-in app mismatch"
    : reason === "changed"
      ? "Executable changed"
      : "New executable";
  identityText.append(heading, status);
  identity.append(appIcon, identityText);
  const message = document.createElement("p");
  message.className = "app-approval-message";
  message.textContent = blocked
    ? "This executable differs from the built-in app with the same ID. It cannot run under that ID."
    : reason === "changed"
      ? "This executable differs from the last approved version. Trust it to run as the same app?"
      : "Only approve this executable if you trust its source.";
  // These values come from the executable or its location. Render them as text,
  // so e.g. a declared title containing HTML cannot insert elements here.
  const details = document.createElement("dl");
  for (const [label, value] of [
    ["App ID", id],
    ["Executable", path ?? "Executable object"],
    ["Source URL", sourceUrl ?? "Unknown"],
    ["Requested permissions", dependencies.join(", ") || "None"],
  ]) {
    const term = document.createElement("dt");
    term.textContent = label;
    const definition = document.createElement("dd");
    definition.textContent = value;
    details.append(term, definition);
  }
  const errorMessage = document.createElement("p");
  errorMessage.className = "app-approval-error";
  errorMessage.setAttribute("role", "alert");
  const actions = document.createElement("div");
  actions.className = "app-approval-actions";
  const cancel = document.createElement("button");
  cancel.className = "btn";
  cancel.textContent = blocked ? "Close" : "Cancel";
  actions.append(cancel);
  element.append(identity, message, details);
  if (!blocked) {
    const scope = document.createElement("p");
    scope.textContent =
      "Approval also trusts future code updates from this source. " +
      "Changes to the executable configuration require approval again.";
    element.appendChild(scope);
  }
  element.append(errorMessage, actions);

  const style = document.createElement("style");
  style.textContent = styles;
  element.append(style);
  cancel.addEventListener("click", () => setApproval(false));
  element.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setApproval(false);
    }
  });
  // A built-in mismatch can only be closed. The desktop also rejects approval
  // for it; hiding the button is just how that policy is presented here.
  if (!blocked) {
    const trust = document.createElement("button");
    trust.className = "btn app-approval-trust";
    trust.textContent = "Trust and run";
    trust.addEventListener("click", async () => {
      if (trust.disabled || decisionSignal.aborted) return;
      trust.disabled = true;
      errorMessage.textContent = "";
      try {
        // Recording approval may fail (e.g. filesystem writes are disabled).
        // Keep the window open and allow retry instead of assuming it succeeded.
        await setApproval(true);
      } catch (error) {
        if (!abortSignal.aborted) {
          errorMessage.textContent = `Could not approve this app: ${error.message}`;
          trust.disabled = false;
        }
      }
    });
    actions.append(trust);
  }
  // This request can finish while the app's module is still loading. Otherwise,
  // wait for it to finish, removing the listener when this window is closed.
  if (decisionSignal.aborted) {
    env.closeApp();
  } else {
    decisionSignal.addEventListener("abort", () => env.closeApp(), {
      signal: abortSignal,
    });
  }
  // Closing the window cancels just this launch. If it was already approved,
  // the desktop ignores this callback, so closing cannot undo that decision.
  return { element, onClose: () => setApproval(false) };
}
