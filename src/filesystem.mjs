import apps from "./__generated_apps.mjs";

const DB_NAME = "fake_filesystem";
const DB_VERSION = 1;

const METADATA_STORE = "files";
const CONTENT_STORE = "files_content";

const DIR_CONFIG_FILENAME = ".dir_config";

// TODO: check consistency at startup?

class DesktopFileSystem {
  constructor() {
    this._dbProm = openDB();
    this._virtualRootDirs = [
      "/apps/",
      // "/config/",
      // "/appdata/",
    ];
  }

  async writeFile(path, content, mimeType) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }
    if (path.endsWith("/")) {
      throw new Error("Writing a directory instead of a file");
    }

    const name = getName(path);
    if (name === DIR_CONFIG_FILENAME) {
      throw new Error("Using a reserved system name");
    }
    if (/[\x00-\x1F\x7F/\\]/.test(name)) {
      throw new Error(
        "Unauthorized file name: Please do not use control characters, slash or anti-slash characters.",
      );
    }

    // I group both metadata and content write in the same IndexedDB
    // transaction (its mechanism for consistency) to avoid desynchronization.
    // There might still be due to a browser crash or power outage but shit
    // happens.
    const db = await this._dbProm;
    const tx = db.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
    const metadataStore = tx.objectStore(METADATA_STORE);
    const contentStore = tx.objectStore(CONTENT_STORE);
    const now = Date.now();
    const id = pathToId(path);
    metadataStore.put({
      id,
      fullPath: path,
      directory: getDirectory(path),
      name,
      type: "file",
      modified: now,
      mimeType,
    });
    contentStore.put({ id, content });

    return new Promise((resolve, reject) => {
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  async readDir(dirPath) {
    const normalizedDirPath = dirPath.endsWith("/") ? dirPath : dirPath + "/";
    if (this._virtualRootDirs.includes(normalizedDirPath)) {
      if (normalizedDirPath === "/apps/") {
        return apps.map((a) => {
          return {
            name: a.id,
            icon: a.icon,
            type: "file",
            mimeType: "exec",
          };
        });
      }

      // TODO: other virtual dirs?
      return [];
    }

    if (normalizedDirPath === "/") {
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

    if (!normalizedDirPath.startsWith("/user/")) {
      return Promise.reject(new Error("Invalid directory"));
    }

    const db = await this._dbProm;
    const metadataStore = db
      .transaction(METADATA_STORE, "readonly")
      .objectStore(METADATA_STORE);
    const range = IDBKeyRange.only(normalizedDirPath);

    return new Promise((resolve, reject) => {
      const request = metadataStore.index("directory").getAll(range, 100);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result.length === 0) {
          if (normalizedDirPath === "/user/") {
            resolve([]);
          } else {
            // For now we placed a system file in all other directories
            // If we don't see it, the directory doesn't exists
            reject(new Error("Unknown directory"));
          }
        }
        const res = [];
        for (const r of request.result) {
          if (r.name === DIR_CONFIG_FILENAME) {
            continue;
          }
          res.push({
            name: r.name,
            type: r.type,
            modified: r.modified,
            mimeType: r.mimeType,
          });
        }
        resolve(res);
      };
    });
  }

  async rmFile(filePath) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }
    if (path.endsWith("/")) {
      throw new Error("Writing a directory instead of a file");
    }

    // I group both metadata and content write in the same IndexedDB
    // transaction (its mechanism for consistency) to avoid desynchronization.
    // There might still be due to a browser crash or power outage but shit
    // happens.
    const db = await this._dbProm;
    const tx = db.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
    return new Promise((resolve, reject) => {
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
      const id = pathToId(filePath);

      const metadataStore = tx.objectStore(METADATA_STORE);
      const contentStore = tx.objectStore(CONTENT_STORE);
      metadataStore.delete(id);
      contentStore.delete(id);
    });
  }

  async mv(sourcePath, destinationPath) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }

    const db = await this._dbProm;

    const allEntries = await this._readDirRecursive(sourcePath);
    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();

      const metadataStore = tx.objectStore(METADATA_STORE);
      const contentStore = tx.objectStore(CONTENT_STORE);

      allEntries.forEach((entry) => {
        const originalId = pathToId(entry.fullPath);
        let newPath;
        if (entry.fullPath === sourcePath) {
          newPath = destinationPath;
        } else {
          newPath = destinationPath + entry.fullPath.slice(sourcePath.length);
        }
        const newId = pathToId(newPath);
        metadataStore.put({
          ...dirEntry,
          id: newId,
          fullPath: newPath,
          directory: getDirectory(newPath),
          name: getName(newPath),
        });
        metadataStore.delete(originalId);

        if (entry.type !== "directory") {
          const getRequest = contentStore.get(originalId);
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              contentStore.put({
                id: newId,
                content: getRequest.result.content,
              });
              contentStore.delete(originalId);
            }
          };
        }
      });
    });
  }

  async rm(path) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }

    const db = await this._dbProm;

    const allEntries = await this._readDirRecursive(path);
    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, CONTENT_STORE], "readwrite");
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();

      const metadataStore = tx.objectStore(METADATA_STORE);
      const contentStore = tx.objectStore(CONTENT_STORE);
      allEntries.forEach((entry) => {
        const originalId = pathToId(entry.fullPath);
        metadataStore.delete(originalId);

        if (entry.type !== "directory") {
          const getRequest = contentStore.get(originalId);
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              contentStore.delete(originalId);
            }
          };
        }
      });
    });
  }

  async readFile(path) {
    if (path.startsWith("/apps/") && path !== "/apps/") {
      const wantedApp = path.substring("/apps/".length);
      for (const app of apps) {
        if (app.id === wantedApp) {
          return app.id;
        }
      }
      throw new Error("File not found.");
    }

    if (!path.startsWith("/user/")) {
      throw new Error("File not found.");
    }

    const db = await this._dbProm;
    const contentStore = db
      .transaction(CONTENT_STORE, "readwrite")
      .objectStore(CONTENT_STORE);
    return new Promise((resolve, reject) => {
      const request = contentStore.get(pathToId(path));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (!request.result) {
          reject(new Error("File not found."));
        }
        resolve(request.result.content);
      };
    });
  }

  async mkdir(path) {
    if (!path.startsWith("/user/")) {
      throw new Error("No permission to write in the given path: " + path);
    }

    const db = await this._dbProm;
    const tx = db.transaction(METADATA_STORE, "readwrite");
    const store = tx.objectStore(METADATA_STORE);

    // TODO: What if the parent dir doesn't even exist?
    // Maybe add some consistency checks somewhere so it doesn't go out of hands

    return new Promise((resolve, reject) => {
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();

      const fullPath = path.endsWith("/") ? path : path + "/";
      const name = getName(fullPath);
      const now = Date.now();
      store.put({
        id: pathToId(fullPath),
        fullPath,
        directory: getDirectory(fullPath.substring(0, fullPath.length - 1)),
        name,
        type: "directory",
        modified: now,
        mimeType: undefined,
      });

      const systemFile = fullPath + DIR_CONFIG_FILENAME;
      store.put({
        id: pathToId(systemFile),
        fullPath: systemFile,
        directory: fullPath,
        name: DIR_CONFIG_FILENAME,
        type: "system",
        modified: now,
        mimeType: undefined,
      });
    });
  }
  async _readDirRecursive(dirPath) {
    const db = await this._dbProm;
    const normalizedDirPath = dirPath.endsWith("/") ? dirPath : dirPath + "/";

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], "readonly");
      const metadataStore = transaction.objectStore(METADATA_STORE);
      const allEntries = [];
      const request = metadataStore.openCursor();
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const entry = cursor.value;

          // TODO: more efficient
          if (
            entry.fullPath === normalizedDirPath ||
            entry.fullPath.startsWith(normalizedDirPath)
          ) {
            allEntries.push(entry);
          }
          cursor.continue();
        } else {
          resolve(allEntries);
        }
      };
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

function getDirectory(path) {
  return path.substring(0, path.lastIndexOf("/") + 1);
}

function getName(path) {
  return path.split("/").filter(Boolean).pop();
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
