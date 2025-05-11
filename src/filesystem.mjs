import apps from "./__generated_apps.mjs";

const DB_NAME = "fake_filesystem";
const DB_VERSION = 1;

const METADATA_STORE = "files";
const CONTENT_STORE = "files_content";

class DesktopFileSystem {
  constructor() {
    this._dbProm = openDB();
    this._virtualRootDir = {
      "/apps/": { type: "virtual" },
      // "/config/": { type: "virtual" },
    };
  }

  async _getMetadataStore(mode = "readonly") {
    const db = await this._dbProm;
    return db.transaction(METADATA_STORE, mode).objectStore(METADATA_STORE);
  }

  async _getContentStore(mode = "readonly") {
    const db = await this._dbProm;
    return db.transaction(CONTENT_STORE, mode).objectStore(CONTENT_STORE);
  }

  async writeFile(path, content, mimeType) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }
    if (path.endsWith("/")) {
      throw new Error("Writing a directory instead of a file");
    }

    const [metadataStore, contentStore] = await Promise.all([
      this._getMetadataStore("readwrite"),
      this._getContentStore("readwrite"),
    ]);

    const now = Date.now();
    const name = path.split("/").filter(Boolean).pop();
    const entry = {
      id: pathToId(path),
      fullPath: path,
      directory: getParentDirectory(path),
      name,
      type: "file",
      modified: now,
      mimeType,
      content,
    };

    // XXX TODO: If one operation fails remove the other
    // TODO: check rejection syntax
    await Promise.all([
      new Promise((resolve) => (metadataStore.put(entry).onsuccess = resolve)),
      new Promise(
        (resolve) =>
          (contentStore.put({ id: entry.id, content }).onsuccess = resolve),
      ),
    ]);
  }

  async readDir(directoryPath) {
    if (directoryPath in this._virtualRootDir) {
      if (directoryPath === "/apps/") {
        return apps.map((a) => {
          return {
            name: a.title,
            icon: a.icon,
            type: "file",
            mimeType: "exec",
          };
        });
      }
      return [];
    }

    if (directoryPath === "/") {
      return [
        {
          name: "apps",
          type: "directory",
        },
        {
          name: "user",
          type: "directory",
        },
      ];
    }

    if (!directoryPath.startsWith("/user/")) {
      return Promise.reject(new Error("Invalid directory"));
    }

    const store = await this._getMetadataStore();
    const range = IDBKeyRange.only(directoryPath);

    return new Promise((resolve, reject) => {
      const request = store.index("directory").getAll(range, 100);
      request.onsuccess = () =>
        resolve(
          request.result.map(({ name, type, size, modified, mimeType }) => ({
            name,
            type,
            size,
            modified,
            mimeType,
          })),
        );
      request.onerror = () => reject(request.error);
    });
  }

  async deletePath(path, options = { recursive: false }) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to delete in the given path: " + path);
    }
    if (path === "/user/") {
      throw new Error("Cannot delete the user directory itself.");
    }

    const store = await this._getMetadataStore("readwrite");
    const getRequest = store.index("fullPath").get(path);

    const entry = await new Promise((resolve) => {
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => resolve(null);
    });

    if (!entry) {
      throw new Error("Cannot delete: Path not found");
    }

    if (entry.type === "file") {
      return this._deleteFile(path);
    } else {
      return this._deleteDirectory(path, options.recursive);
    }
  }

  async _deleteFile(filePath) {
    // TODO: we could reuse the store already requested
    const [metadataStore, contentStore] = await Promise.all([
      this._getMetadataStore("readwrite"),
      this._getContentStore("readwrite"),
    ]);
    const id = pathToId(filePath);

    // TODO: check rejection syntax
    await Promise.all([
      new Promise((resolve) => {
        metadataStore.delete(id).onsuccess = resolve;
      }),
      new Promise((resolve) => {
        contentStore.delete({ id: entry.id, content }).onsuccess = resolve;
      }),
    ]);
  }

  async _deleteDirectory(dirPath, recursive = false) {
    if (!dirPath.endsWith("/")) {
      throw new Error("Deleting a file instead of a directory");
    }

    // XXX TODO: check with file content and whatnot
    const metadataStore = await this._getMetadataStore("readwrite");
    const range = IDBKeyRange.lowerBound(dirPath);

    return new Promise((resolve, reject) => {
      const itemsToDelete = [];
      const cursorRequest = metadataStore.index("fullPath").openCursor(range);

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.fullPath.startsWith(dirPath)) {
            if (
              !recursive &&
              cursor.value.fullPath.replace(dirPath, "").includes("/")
            ) {
              reject(new Error("Directory not empty"));
              return;
            }
            itemsToDelete.push(cursor.value.id);
            cursor.continue();
          } else {
            processDeletion();
          }
        } else {
          processDeletion();
        }
      };

      cursorRequest.onerror = () => reject(cursorRequest.error);

      function processDeletion() {
        if (itemsToDelete.length === 0) {
          return resolve();
        }
        let processed = 0;

        itemsToDelete.forEach((id) => {
          const deleteRequest = store.delete(id);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => {
            if (++processed === itemsToDelete.length) {
              resolve();
            }
          };
        });
      }
    });
  }

  async readFile(path) {
    if (path in this._virtualRootDir) {
      return null;
    }

    if (!path.startsWith("/user/")) {
      // TODO:
      throw new Error("File not found.");
    }

    const contentStore = await this._getContentStore("readwrite");

    return new Promise((resolve, reject) => {
      const request = contentStore.get(pathToId(path));
      request.onsuccess = () => {
        if (!request.result) {
          reject(new Error("File not found."));
        }
        resolve(request.result.content);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async mkdir(path) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }

    const store = await this._getMetadataStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put({
        path: path.endsWith("/") ? path : `${path}/`,
        type: "directory",
        created: Date.now(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const fs = new DesktopFileSystem();
export default fs;
window.fs = fs;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      const store = db.createObjectStore(METADATA_STORE, { keyPath: "id" });
      store.createIndex("directory", "directory");
      store.createIndex("fullPath", "fullPath", { unique: true });

      // Store content separately for efficiency
      db.createObjectStore(CONTENT_STORE, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getParentDirectory(path) {
  return path.substring(0, path.lastIndexOf("/") + 1);
}

function pathToId(path) {
  const utf8Bytes = new TextEncoder().encode(path);
  return btoa(String.fromCharCode(...utf8Bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// function idToPath(id) {
//   id = id.replace(/-/g, "+").replace(/_/g, "/");
//   const bytes = Uint8Array.from(atob(id), (c) => c.charCodeAt(0));
//   return new TextDecoder().decode(bytes);
// }
