import filesystem from "../filesystem/filesystem.mjs";

const APP_STORAGE_ROOT_DIR = "/userdata/apps/";
const APP_STORAGE_READ_FORMATS = ["string", "object", "arraybuffer"];
const APP_ID_PATTERN = /^[A-Za-z0-9-_]+$/;

export function createAppStorage(appId) {
  validateAppId(appId);
  const rootDir = APP_STORAGE_ROOT_DIR + appId + "/";

  return {
    readFile: (relativePath, format = "string") => {
      if (!APP_STORAGE_READ_FORMATS.includes(format)) {
        throw new Error("Unsupported appStorage read format: " + format);
      }
      return filesystem.readFile(
        toScopedStoragePath(rootDir, relativePath),
        format,
      );
    },
    writeFile: async (relativePath, content) => {
      await ensureStorageDirectory(APP_STORAGE_ROOT_DIR);
      await ensureStorageDirectory(rootDir);
      await ensureStorageParentDirectories(rootDir, relativePath);
      return filesystem.writeFile(
        toScopedStoragePath(rootDir, relativePath),
        formatAppStorageContent(content),
      );
    },
    rmFile: (relativePath) => {
      return filesystem.rmFile(toScopedStoragePath(rootDir, relativePath));
    },
  };
}

function validateAppId(appId) {
  if (typeof appId !== "string" || !APP_ID_PATTERN.test(appId)) {
    throw new Error("Invalid appStorage app id.");
  }
}

function formatAppStorageContent(content) {
  if (typeof content === "string" || content instanceof ArrayBuffer) {
    return content;
  }
  if (ArrayBuffer.isView(content)) {
    return content.buffer.slice(
      content.byteOffset,
      content.byteOffset + content.byteLength,
    );
  }
  if (typeof content === "object" && content !== null) {
    return JSON.stringify(content, null, 2);
  }
  throw new Error("Invalid appStorage content type.");
}

async function ensureStorageDirectory(path) {
  try {
    await filesystem.mkdir(path);
  } catch (err) {
    if (err?.code !== "IllegalOperation") {
      throw err;
    }
  }
}

async function ensureStorageParentDirectories(rootDir, relativePath) {
  const segments = validateAppStorageRelativePath(relativePath);
  let currentDir = rootDir;
  for (let i = 0; i < segments.length - 1; i++) {
    currentDir += segments[i] + "/";
    await ensureStorageDirectory(currentDir);
  }
}

function toScopedStoragePath(rootDir, relativePath) {
  return rootDir + validateAppStorageRelativePath(relativePath).join("/");
}

function validateAppStorageRelativePath(relativePath) {
  if (typeof relativePath !== "string") {
    throw new Error("Invalid appStorage path: expected a string.");
  }
  if (
    relativePath === "" ||
    relativePath.startsWith("/") ||
    relativePath.endsWith("/")
  ) {
    throw new Error("Invalid appStorage path.");
  }
  const segments = relativePath.split("/");
  for (const segment of segments) {
    if (
      segment === "" ||
      segment === "." ||
      segment === ".." ||
      segment === ".dir_config" ||
      /[\x00-\x1F\x7F\\]/.test(segment)
    ) {
      throw new Error("Invalid appStorage path segment.");
    }
  }
  return segments;
}
