import terser from "@rollup/plugin-terser";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const PROJECT_ROOT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

const DESKTOP_SRC_DIR = path.join(PROJECT_ROOT_DIRECTORY, "src");
const APPS_SRC_DIR = path.join(PROJECT_ROOT_DIRECTORY, "apps");

const GENERATED_APP_PATH = path.join(DESKTOP_SRC_DIR, "__generated_apps.mjs");

const OUTPUT_DIR = path.join(PROJECT_ROOT_DIRECTORY, "dist");
const OUTPUT_LAZY_LOADED_APPS = path.join(OUTPUT_DIR, "lazy");

// We'll create `GENERATED_APP_PATH` here:
const lazyLoadedApps = writeGeneratedAppFile(APPS_SRC_DIR);

// Re-create the lazy-loaded destination folder, just to clean-up.
try {
  fs.rmSync(OUTPUT_LAZY_LOADED_APPS, { recursive: true, force: true });
} catch (err) {
  if (err.code !== "ENOENT") {
    throw err;
  }
}
fs.mkdirSync(OUTPUT_LAZY_LOADED_APPS, { recursive: true });

// Produce all bundles. First the apps (the desktop might depend statically on
// some), then the desktop
// NOTE: We for now have to kill and re-launch the build script when
// adding/removing apps in `AppInfo.json` (and only in that case), even with
// rollup's `watch` option, because of this setup.
// We could watch that `AppInfo.json` file and restart the logic on change but
// this would mean using rollup's JS API and it is subpar / not recommended for
// some reasons (I don't know what it is with JS tools not wanting us to rely on
// a JS API - even TypeScript has this issue, though esbuild's JS API is very
// nice despite not being its main language).
export default [
  ...lazyLoadedApps,
  {
    outputFile: path.join(OUTPUT_DIR, "bundle.js"),
    input: path.join(DESKTOP_SRC_DIR, "desktop.mjs"),
    intoEsm: false,
  },
].map((bundle) => ({
  input: bundle.input,
  output: {
    file: bundle.outputFile,
    format: bundle.intoEsm ? "es" : "iife",
  },
  plugins: [process.env.MINIFY && terser()].filter(Boolean),
}));

/**
 * Write the app file inside the desktop's code, based on the apps defined in
 * `baseDir`.
 * @param {string} baseDir
 * @returns {Array.<Object>} - Defines the bundles to produce all apps, and
 * where to put them.
 */
function writeGeneratedAppFile(baseDir) {
  let fileContent;
  try {
    fileContent = fs.readFileSync(path.join(baseDir, "AppInfo.json"), {
      encoding: "utf8",
    });
  } catch (err) {
    throw new Error(`Failed to read "AppInfo.json": ${e}`);
  }

  let json;
  try {
    json = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to parse "AppInfo.json": ${err}`);
  }

  if (!Array.isArray(json?.apps)) {
    throw new Error("Invalid AppInfo.json: no apps Array");
  }

  /** Information on the bundles to create for apps. */
  const bundlesToMake = [];
  /** Static imports to write in the generated file. */
  const importsToWrite = [];
  /** Dynamic imports to write in the generated file to be imported after a timer. */
  const automaticDynImportsAfterTimer = [];

  /** I'll uglily write manually the JS code, being careful with it. */
  let uglyHandWrittenJsObject = "export default [";

  for (let i = 0; i < json.apps.length; i++) {
    const app = json.apps[i];

    let hasRemoteUrl = !!app.website;
    let filePath;

    // dumb rule so it's simpler to write the following code
    if (!/^[A-Za-z0-9-_]+$/.test(app.id)) {
      throw new Error(
        `Invalid app id: "${app.id}". Should only contain alphanumeric, dash or lowescore characters`,
      );
    }

    if (typeof app.title !== "string" || app.title === "") {
      throw new Error(
        `Invalid title for app id: "${app.id}". Title should be non-empty strings`,
      );
    }

    // Find the corresponding app. Either:
    // 1. <APPID>.mjs
    // 2. <APPID>/index.mjs
    // 3. <APPID>.js
    // 4. <APPID>/index.js
    //
    // In that order
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

    // TODO: I don't even know if `JSON.stringify` is sufficient here for all
    // chars, or if I could find some case where the inner string outputed by
    // `JSON.stringify` could contain a special char that doesn't work as a JS
    // string. This should however not happen for now unless I'm trying to hack
    // myself.
    uglyHandWrittenJsObject += `
  {
    id: ${JSON.stringify(app.id)},
		title: ${JSON.stringify(app.title ?? "Unnamed Application")},
`;

    if (typeof app.icon === "string") {
      uglyHandWrittenJsObject +=
        "    icon: " + JSON.stringify(app.icon) + ",\n";
    }

    if (typeof app.inStartList === "string") {
      uglyHandWrittenJsObject +=
        "    inStartList: " + JSON.stringify(app.inStartList) + ",\n";
    }

    if (typeof app.desktopDir === "string") {
      uglyHandWrittenJsObject +=
        "    desktopDir: " + JSON.stringify(app.desktopDir) + ",\n";
    }

    if (typeof app.defaultHeight === "number") {
      uglyHandWrittenJsObject +=
        "    defaultHeight: " + app.defaultHeight + ",\n";
    }

    if (typeof app.defaultWidth === "number") {
      uglyHandWrittenJsObject +=
        "    defaultWidth: " + app.defaultWidth + ",\n";
    }

    if (!!app.onlyOne) {
      uglyHandWrittenJsObject += "    onlyOne: true,\n";
    }

    if (Array.isArray(app.dependencies)) {
      for (const dep of app.dependencies) {
        if (dep !== "settings") {
          throw new Error(
            `Error in app "${app.id}". One of the asked dependency does not exist: ${dep}`,
          );
        }
      }
      uglyHandWrittenJsObject +=
        "    dependencies: " + JSON.stringify(app.dependencies) + ",\n";
    }

    if (!!app.autoload) {
      uglyHandWrittenJsObject += "    autoload: true,\n";
    }

    if (filePath) {
      if (app.preload === true) {
        // Here I will just write a regular static import statement on top of
        // the generated file toward this file.
        uglyHandWrittenJsObject += "    data: __APP__" + String(i) + ",\n";
        importsToWrite.push({
          name: "__APP__" + String(i),
          filePath: path.relative(DESKTOP_SRC_DIR, filePath),
        });
      } else {
        // Here I will put the import path as a `lazyLoad` property.
        const importPath = `./lazy/${app.id}.js`;
        uglyHandWrittenJsObject += `    data: {
			lazyLoad: ${JSON.stringify(importPath)},
		},
`;
        const outputFile = path.join(OUTPUT_LAZY_LOADED_APPS, `${app.id}.js`);
        bundlesToMake.push({
          outputFile,
          input: filePath,
          intoEsm: true,
        });

        // The preload.after idea is to preload the app only after a low
        // timeout.
        // Browsers are smart enough to not load a given import multiple times (I
        // would even guess this is ECMAScript-defined).
        if (typeof app.preload?.after === "number") {
          automaticDynImportsAfterTimer.push({
            importPath,
            timer: app.preload.after,
          });
        }
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

  let jsFile = `// NOTE: This is a generated file by this project's build script.
// Manually updating it is futile!

`;

  if (importsToWrite.length) {
    for (const importStmt of importsToWrite) {
      jsFile += `import * as ${importStmt.name} from ${JSON.stringify(importStmt.filePath)};\n`;
    }

    jsFile += `
// Making the imports available in global scope just so the app object stay
// serializable **AND** complete.
window.globalApps = {};
`;
    for (const importStmt of importsToWrite) {
      jsFile += `window.globalApps.${importStmt.name} = ${importStmt.name};
`;
    }
  }
  jsFile += "\n" + uglyHandWrittenJsObject;

  for (const timerImports of automaticDynImportsAfterTimer) {
    jsFile += `

setTimeout(
	() => {
    // trick so our bundler doesn't try funky things like rewriting paths
    const importPath = ${JSON.stringify(timerImports.importPath)};
    import(importPath);
  },
  ${timerImports.timer}
);
`;
  }

  fs.writeFileSync(GENERATED_APP_PATH, jsFile);
  return bundlesToMake;
}
