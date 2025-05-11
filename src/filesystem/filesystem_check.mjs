import {
  CONTENT_STORE,
  DIR_CONFIG_FILENAME,
  METADATA_STORE,
  USER_DATA_DIR,
  getDirPath,
  getName,
  pathToId,
} from "./utils.mjs";

export default async function checkAndRepairIntegrity(db) {
  const beforeTime = performance.now();
  console.debug("IDB fscheck: start", beforeTime);
  const metadata = await getAllMetadata(db);
  const contentIds = await getAllContentIds(db);
  if (metadata.length === 0 && contentIds.length === 0) {
    console.debug("IDB fscheck: nothing stored yet");
    return;
  }
  const allItems = await checkReachability(db, metadata);
  await checkContentIntegrity(db, metadata, contentIds);
  await checkDirConfigEntries(db, allItems);
  console.debug("IDB fscheck: done", performance.now() - beforeTime);
}

window.check = () => {
  checkAndRepairIntegrity(db);
};

async function getAllMetadata(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], "readonly");
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllContentIds(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTENT_STORE], "readonly");
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.getAllKeys();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function checkReachability(db, metadata) {
  const reachablePaths = new Set();
  const allPaths = new Map();

  metadata.forEach((entry) => {
    allPaths.set(entry.fullPath, entry);
  });

  reachablePaths.add(USER_DATA_DIR.substring(0, USER_DATA_DIR.length - 1));
  metadata.forEach((child) => {
    if (child.directory === USER_DATA_DIR) {
      markReachable(child.fullPath);
    }
  });

  const unreachableEntries = metadata.filter(
    (entry) => !reachablePaths.has(entry.fullPath),
  );

  for (const entry of unreachableEntries) {
    console.info(
      "IDB fscheck: Unreachable entry detected:",
      entry.fullPath,
      entry.directory,
    );
    await repairUnreachableEntry(db, entry, allPaths, reachablePaths);
  }
  return Array.from(allPaths.values());

  function markReachable(path) {
    if (reachablePaths.has(path)) {
      return;
    }

    reachablePaths.add(path);
    const entry = allPaths.get(path);
    if (entry && entry.type === "directory") {
      // Mark all direct children as reachable
      metadata.forEach((child) => {
        if (child.directory === path + "/") {
          markReachable(child.fullPath);
        }
      });
    }
  }
}

async function repairUnreachableEntry(db, entry, allPaths, reachablePaths) {
  const parentPath = entry.directory;

  if (!allPaths.has(parentPath)) {
    const pathParts = parentPath.split("/").filter((part) => part);
    let currentPath = "";

    for (const part of pathParts) {
      currentPath += "/" + part;

      if (!allPaths.has(currentPath) && currentPath.startsWith(USER_DATA_DIR)) {
        const newDir = await createMissingDirectory(db, currentPath);
        allPaths.set(currentPath, newDir);
        reachablePaths.add(currentPath);
        console.info(
          "IDB fscheck: Added missing parent directory:",
          currentPath,
        );
      }
    }

    // Remove ending /
    if (allPaths.has(parentPath.substring(0, parentPath.length - 1))) {
      reachablePaths.add(entry.fullPath);
      console.info("IDB fscheck: Entry is now reachable:", entry.fullPath);
    }
  }
}

async function createMissingDirectory(db, fullPath) {
  const dirEntry = {
    id: pathToId(fullPath),
    fullPath,
    directory: getDirPath(fullPath),
    name: getName(fullPath),
    size: 0,
    type: "directory",
    modified: Date.now(),
  };
  await saveMetadata(db, dirEntry);
  await createDirConfigEntry(db, fullPath);

  return dirEntry;
}

async function createDirConfigEntry(db, directoryPath) {
  const normalizedDir = directoryPath.endsWith("/")
    ? directoryPath
    : directoryPath + "/";
  const fullPath = normalizedDir + DIR_CONFIG_FILENAME;
  const id = pathToId(fullPath);

  const configEntry = {
    id,
    fullPath,
    directory: normalizedDir,
    name: DIR_CONFIG_FILENAME,
    size: 0,
    type: "system",
    modified: Date.now(),
  };

  await saveMetadata(db, configEntry);
  return configEntry;
}

async function checkContentIntegrity(db, metadata, contentIdArr) {
  const metadataIds = new Set(metadata.map((m) => m.id));
  const contentIds = new Set(contentIdArr);
  const fileEntries = metadata.filter((m) => m.type === "file");
  const fileIds = new Set(fileEntries.map((f) => f.id));

  const orphanedContent = contentIdArr.filter((id) => !metadataIds.has(id));
  for (const orphan of orphanedContent) {
    console.info("IDB fscheck: Content entry with no metadata found:", orphan);
    await removeOrphanedContent(db, orphan);
    console.info(
      "IDB fscheck: Removed content entry with no metadata found:",
      orphan,
    );
  }

  const filesWithoutContent = fileEntries.filter((f) => !contentIds.has(f.id));
  for (const file of filesWithoutContent) {
    console.info("IDB fscheck: Found file metadata without content", file.id);
    await removeMetadata(db, file.id);
    console.info(
      "IDB fscheck: Removed metadata entry with no content found:",
      file.id,
    );
  }

  // Check for content entries that don't belong to files
  const nonFileContent = contentIdArr.filter(
    (cId) => metadataIds.has(cId) && !fileIds.has(cId),
  );
  for (const wrongContent of nonFileContent) {
    console.info("IDB fscheck: Content found for non-file type", wrongContent);
    await removeOrphanedContent(db, wrongContent);
    console.info(
      "IDB fscheck: Removed Content found for non-file type",
      wrongContent,
    );
  }
}

async function checkDirConfigEntries(db, allItems) {
  const directories = allItems.filter((m) => m.type === "directory");
  const systemEntries = allItems.filter((m) => m.type === "system");

  for (const dir of directories) {
    const hasSystemFile = systemEntries.some(
      (s) =>
        s.name === DIR_CONFIG_FILENAME && s.directory === dir.fullPath + "/",
    );

    if (!hasSystemFile) {
      console.info(
        "IDB fscheck: a directory misses its DIR_CONFIG entry",
        dir.fullPath,
      );
      await createDirConfigEntry(db, dir.fullPath);
      console.info(
        "IDB fscheck: created missing DIR_CONFIG entry",
        dir.fullPath,
      );
    }
  }

  // Check for orphaned DIR_CONFIG_FILENAME entries
  for (const sysEntry of systemEntries.filter(
    (s) => s.name === DIR_CONFIG_FILENAME,
  )) {
    const hasDirectory = directories.some(
      (d) => d.fullPath + "/" === sysEntry.directory,
    );

    if (!hasDirectory) {
      console.info(
        "IDB fscheck: DIR_CONFIG entry for no directory",
        sysEntry.fullPath,
      );
      await removeMetadata(db, sysEntry.id);
      console.info(
        "IDB fscheck: removed DIR_CONFIG entry for no directory",
        sysEntry.fullPath,
      );
    }
  }
}

async function saveMetadata(db, entry) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], "readwrite");
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function removeMetadata(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], "readwrite");
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function removeOrphanedContent(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTENT_STORE], "readwrite");
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
