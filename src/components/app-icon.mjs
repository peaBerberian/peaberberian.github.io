import { resolveAppImageUrl } from "../app_image_sources.mjs";

const pendingRenders = new WeakMap();
const MAX_IMAGE_BYTES = 256 * 1024;
const MAX_IMAGE_DIMENSION = 1024;

/** Cancel a pending image when its target is removed or reused. */
export function cancelAppIcon(element) {
  pendingRenders.get(element)?.();
}

/**
 * @param {HTMLElement} element - Icon container in the current document.
 * @param {string} icon - Immediately visible text/emoji fallback.
 * @param {import("../app_image_sources.mjs").AppIconImage|undefined} iconImage
 * Optional repository asset reference.
 * @param {string} [size="1.2em"] - Image width and height as a CSS length.
 * @param {AbortSignal} [signal] - Lifetime of the view containing the icon.
 */
export function renderAppIcon(element, icon, iconImage, size = "1.2em", signal) {
  cancelAppIcon(element);
  element.textContent = typeof icon === "string" ? icon : "📦";
  if (signal?.aborted) {
    return;
  }
  const url = resolveAppImageUrl(iconImage, document.baseURI);
  if (!url) {
    return;
  }

  const controller = new AbortController();
  const image = new Image();
  image.alt = "";
  image.draggable = false;
  image.decoding = "async";
  Object.assign(image.style, {
    width: size,
    height: size,
    objectFit: "contain",
    verticalAlign: "middle",
    pointerEvents: "none",
  });

  // Clear this reference on cancellation, so a slow request cannot retain its target.
  let target = element;
  function finish() {
    if (!target) {
      return;
    }
    pendingRenders.delete(target);
    target = null;
    signal?.removeEventListener("abort", cancel);
  }
  function cancel() {
    finish();
    controller.abort();
    image.removeAttribute("src");
  }
  pendingRenders.set(element, cancel);
  signal?.addEventListener("abort", cancel, { once: true });
  loadImage(url, controller.signal)
    .then(async (dataUrl) => {
      if (!target) {
        return;
      }
      // Decode fetched bytes; <img> cannot make another remote request.
      image.src = dataUrl;
      await image.decode();
      if (
        image.naturalWidth > MAX_IMAGE_DIMENSION ||
        image.naturalHeight > MAX_IMAGE_DIMENSION
      ) {
        throw new Error("App artwork dimensions exceed the limit.");
      }
      if (target) {
        target.replaceChildren(image);
      }
    })
    .catch(() => {
      controller.abort();
      // Blocked, failed, or oversized images retain the text fallback.
    })
    .finally(finish);
}

async function loadImage(url, signal) {
  const response = await fetch(url.href, {
    credentials: "omit",
    referrerPolicy: "no-referrer",
    redirect: "error",
    mode: "cors",
    signal,
  });
  if (!response.ok || response.redirected) {
    throw new Error("Cannot load app artwork.");
  }
  const type = response.headers
    .get("Content-Type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  if (!type?.startsWith("image/")) {
    throw new Error("App artwork is not an image.");
  }
  if (
    Number(response.headers.get("Content-Length")) > MAX_IMAGE_BYTES ||
    !response.body
  ) {
    throw new Error("App artwork exceeds the download limit.");
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      total += value.byteLength;
      if (total > MAX_IMAGE_BYTES) {
        throw new Error("App artwork exceeds the download limit.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  signal.throwIfAborted();
  // A data URL needs no global object-URL registry or persistent application cache.
  return readImageBytes(new Blob(chunks, { type }), signal);
}

function readImageBytes(blob, signal) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    function cleanup() {
      signal.removeEventListener("abort", abort);
      reader.onload = reader.onerror = reader.onabort = null;
    }
    function abort() {
      reader.abort();
    }
    reader.onload = () => {
      const result = reader.result;
      cleanup();
      resolve(result);
    };
    reader.onerror = reader.onabort = () => {
      const error = reader.error ?? new DOMException("App artwork load aborted.", "AbortError");
      cleanup();
      reject(error);
    };
    signal.addEventListener("abort", abort, { once: true });
    reader.readAsDataURL(blob);
  });
}
