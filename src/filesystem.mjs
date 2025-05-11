import apps from "./__generated_apps.mjs";

const DB_NAME = "fake_filesystem";
const DB_VERSION = 1;
const STORE_NAME = "files";

class DesktopFileSystem {
  constructor() {
    this._dbProm = openDB();
    this._virtualRootDir = {
      "/apps/": { type: "virtual" },
      // "/config/": { type: "virtual" },
    };
  }

  async _getStore(mode = "readonly") {
    const db = await this._dbProm;
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  }

  async writeFile(path, content, mimeType) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }
    if (path.endsWith("/")) {
      throw new Error("Writing a directory instead of a file");
    }

    const db = await this._dbProm;
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const name = path.split("/").filter(Boolean).pop();
      const request = store.put({
        id: pathToId(path),
        fullPath: path,
        directory: getParentDirectory(path),
        name,
        mimeType,
        content,
        type: "file",
        modified: now,
      });
      request.onsuccess = resolve;
      request.onerror = reject;
    }).catch((err) => {
      tx.abort();
      throw err;
    });
  }

  async deletePath(path, options = { recursive: false }) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to delete in the given path: " + path);
    }
    if (path === "/user/") {
      throw new Error("Cannot delete the user directory itself.");
    }

    const store = await this._getStore("readwrite");
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
    const store = await this._getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(pathToId(filePath));
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async _deleteDirectory(dirPath, recursive = false) {
    if (!dirPath.endsWith("/")) dirPath += "/";

    const store = await this._getStore("readwrite");
    const range = IDBKeyRange.lowerBound(dirPath);

    return new Promise((resolve, reject) => {
      const itemsToDelete = [];
      const cursorRequest = store.index("fullPath").openCursor(range);

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Check if path is within our target directory
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
            if (++processed === itemsToDelete.length) resolve();
          };
        });
      }
    });
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
            data: a.id,
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

    const store = await this._getStore();
    const range = IDBKeyRange.only(directoryPath);

    return new Promise((resolve, reject) => {
      const items = [];
      const request = store.index("directory").openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
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

    const store = await this._getStore();
    return new Promise((resolve, reject) => {
      const request = store.index("fullPath").get(path);
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

    const store = await this._getStore("readwrite");
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
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("directory", "directory");
        store.createIndex("fullPath", "fullPath", { unique: true });
      }
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
