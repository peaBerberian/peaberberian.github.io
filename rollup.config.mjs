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

const SRC_DIR = path.join(PROJECT_ROOT_DIRECTORY, "src");
const MAIN_FILE = path.join(SRC_DIR, "desktop.mjs");
const APPS_DIRECTORY = path.join(PROJECT_ROOT_DIRECTORY, "apps");

const GENERATED_APP_DIR = path.join(
  PROJECT_ROOT_DIRECTORY,
  "src",
  "__generated_apps.mjs",
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
const lazyLoadedApps = createAppImports(APPS_DIRECTORY);

export default [
  ...lazyLoadedApps,
  {
    bundlePath: path.join(OUTPUT_DIR, "bundle.js"),
    input: MAIN_FILE,
    keepEsm: false,
  },
].map((bundle) => ({
  input: bundle.input,
  output: {
    file: bundle.bundlePath,
    format: bundle.keepEsm ? "es" : "iife",
  },
  plugins: [process.env.MINIFY && terser(), lazyAppPlugin].filter(Boolean),
}));

function createAppImports(baseDir) {
  const bundlesToMake = [];
  const fileContent = fs.readFileSync(path.join(baseDir, "AppInfo.json"), {
    encoding: "utf8",
  });
  const json = JSON.parse(fileContent);
  if (!Array.isArray(json?.apps)) {
    throw new Error("Invalid AppInfo.json: no apps Array");
  }

  const imports = [];
  let uglyHandWrittenJsObject = "export default [";
  for (let i = 0; i < json.apps.length; i++) {
    const app = json.apps[i];
    let hasRemoteUrl = !!app.website;
    let filePath;
    for (const ext of [".mjs", ".js"]) {
      const fileName = path.join(baseDir, app.id + ext);
      if (fs.existsSync(fileName)) {
        filePath = fileName;
        break;
      }
      const inSubdir = path.join(baseDir, app.id, "index" + ext);
      if (fs.existsSync(inSubdir)) {
        filePath = inSubdir;
        break;
      }
    }
    if (!filePath && !hasRemoteUrl) {
      throw new Error(`Failed to find app ${app.id}`);
    }
    uglyHandWrittenJsObject += `
  {
    id: ${JSON.stringify(app.id)},
		title: ${JSON.stringify(app.title ?? "Unnamed Application")},
`;
    if (app.icon) {
      uglyHandWrittenJsObject +=
        "    icon: " + JSON.stringify(app.icon) + ",\n";
    }
    if (app.inStartList) {
      uglyHandWrittenJsObject +=
        "    inStartList: " + JSON.stringify(app.inStartList) + ",\n";
    }
    if (app.desktopDir) {
      uglyHandWrittenJsObject +=
        "    desktopDir: " + JSON.stringify(app.desktopDir) + ",\n";
    }
    if (app.defaultHeight && typeof app.defaultHeight === "number") {
      uglyHandWrittenJsObject +=
        "    defaultHeight: " + app.defaultHeight + ",\n";
    }
    if (app.defaultWidth && typeof app.defaultWidth === "number") {
      uglyHandWrittenJsObject +=
        "    defaultWidth: " + app.defaultWidth + ",\n";
    }
    if (!!app.onlyOne) {
      uglyHandWrittenJsObject += "    onlyOne: true,\n";
    }
    if (!!app.needsSettingsObject) {
      uglyHandWrittenJsObject += "    needsSettingsObject: true,\n";
    }
    if (!!app.autoload) {
      uglyHandWrittenJsObject += "    autoload: true,\n";
    }
    if (filePath) {
      if (app.preload) {
        uglyHandWrittenJsObject += "    data: __APP__" + String(i) + ",\n";
        imports.push({
          name: "__APP__" + String(i),
          filePath: path.relative(SRC_DIR, filePath),
        });
      } else {
        uglyHandWrittenJsObject += `    data: {
			lazyLoad: () => import(${JSON.stringify(
        "/lazy/" +
          // TODO: I'm sure I missed some unauthorized char in a JS string
          app.id.replaceAll("\\", "\\\\").replaceAll('"', '\\"') +
          ".js",
      )}),
		},
`;
        bundlesToMake.push({
          bundlePath: path.join(OUTPUT_DIR, "lazy", `${app.id}.js`),
          input: filePath,
          keepEsm: true,
        });
      }
    } else if (typeof app.website === "string" && app.website !== "") {
      uglyHandWrittenJsObject += `    data: {
			website: ${JSON.stringify(app.website)}
		},
`;
    }
    uglyHandWrittenJsObject += `  },
`;
  }
  uglyHandWrittenJsObject += "];";

  let jsFile = "";
  for (const importStmt of imports) {
    jsFile += `import * as ${importStmt.name} from ${JSON.stringify(importStmt.filePath)};\n`;
  }
  jsFile += "\n" + uglyHandWrittenJsObject;

  fs.writeFileSync(GENERATED_APP_DIR, jsFile);
  return bundlesToMake;
}
