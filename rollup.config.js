import terser from "@rollup/plugin-terser";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const lazyAppPlugin = {
  name: "preserve-dynamic-imports",
  resolveDynamicImport(specifier) {
    if (typeof specifier === "string" && specifier.startsWith("/lazy/")) {
      return {
        id: "." + specifier,
        external: true,
      };
    }
    return null;
  },
};

const PROJECT_ROOT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = path.join(PROJECT_ROOT_DIRECTORY, "dist");

const MAIN_FILE = path.join(PROJECT_ROOT_DIRECTORY, "src", "desktop.mjs");
const LAZY_LOADED_APP_DIRECTORY = path.join(
  PROJECT_ROOT_DIRECTORY,
  "src",
  "apps",
  "lazy-loaded",
);

const LAZY_LOADED_DEST = path.join(OUTPUT_DIR, "lazy");
try {
  fs.rmSync(LAZY_LOADED_DEST, { recursive: true, force: true });
} catch (err) {
  if (err.code !== "ENOENT") {
    throw err;
  }
}
fs.mkdirSync(LAZY_LOADED_DEST, { recursive: true });
const lazyLoadedApps = getLazyLoadedApps(
  LAZY_LOADED_APP_DIRECTORY,
  LAZY_LOADED_DEST,
);

export default [
  {
    bundlePath: path.join(OUTPUT_DIR, "bundle.js"),
    input: MAIN_FILE,
    keepEsm: false,
  },
  ...lazyLoadedApps,
].map((bundle) => ({
  input: bundle.input,
  output: {
    file: bundle.bundlePath,
    format: bundle.keepEsm ? "es" : "iife",
  },
  plugins: [process.env.MINIFY && terser(), lazyAppPlugin].filter(Boolean),
}));

function getLazyLoadedApps(baseDir, OUTPUT_DIR) {
  const results = [];

  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const subDir = path.join(baseDir, item.name);
      const indexJsPath = path.join(subDir, "index.js");
      const indexMjsPath = path.join(subDir, "index.mjs");
      if (fs.existsSync(indexMjsPath)) {
        results.push({
          bundlePath: path.join(OUTPUT_DIR, `${item.name}.js`),
          input: indexMjsPath,
          keepEsm: true,
        });
      } else if (fs.existsSync(indexJsPath)) {
        results.push({
          bundlePath: path.join(OUTPUT_DIR, `${item.name}.js`),
          input: indexJsPath,
          keepEsm: true,
        });
      }
    }
  }
  return results;
}
