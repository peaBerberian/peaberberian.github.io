#!/usr/bin/env node
/**
 * # bundle.mjs
 *
 * This file allows to create JavaScript bundles for the fake desktop through
 * esbuild with the right configuration.
 *
 * You can either run it directly as a script (run `node bundle.mjs -h`
 * to see the different options) or by requiring it as a node module.
 * If doing the latter you will obtain a function you will have to run with the
 * right options.
 */

import * as fs from "fs";
import * as path from "path";
import { pathToFileURL, fileURLToPath } from "url";
import esbuild from "esbuild";

const PROJECT_ROOT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

const DESKTOP_SRC_DIR = path.join(PROJECT_ROOT_DIRECTORY, "src");
const APPS_SRC_DIR = path.join(PROJECT_ROOT_DIRECTORY, "apps");

const GENERATED_APP_PATH = path.join(DESKTOP_SRC_DIR, "__generated_apps.mjs");

const OUTPUT_DIR = path.join(PROJECT_ROOT_DIRECTORY, "dist");
const OUTPUT_LAZY_LOADED_APPS = path.join(OUTPUT_DIR, "lazy");
const OUTPUT_APP_LIB_SCRIPT = path.join(OUTPUT_DIR, "app-sandbox.js");

/**
 * Produce the bundles for all application defined in `./apps/AppInfo.json` and
 * for the desktop itself (`./src`) and output them in `./dist`.
 * @param {Object} [options.appBaseUrl]
 * @param {boolean} [options.minify] - If `true`, the output will be minified.
 * @param {boolean} [options.watch] - If `true`, the RxPlayer's files involve
 * will be watched and the code re-built each time one of them changes.
 * @param {boolean} [options.silent] - If `true`, we won't output logs.
 * @param {Object} [options.globals] - Optional globally-defined identifiers, as
 * a key-value objects, where the object is a string (trick: if you want to
 * replace an identifier with a string, call `JSON.stringify` on it).
 * @returns {Promise}
 */
export default async function run(options) {
  if (options.appBaseUrl) {
    options.globals = {
      __APP_BASE_URL__: JSON.stringify(options.appBaseUrl),
      ...(options.globals ?? {}),
    };
  }
  if (!options.watch) {
    await reBuild();
    return;
  }

  return new Promise((_resolve, reject) => {
    let lastBuildContexts = reBuild().catch(reject);

    if (!options.watch) {
      return;
    }

    const appInfoFile = path.join(APPS_SRC_DIR, "AppInfo.json");

    // NOTE: fs.watch seems to not work as expected on some platforms (cygwin
    // seems to be one ""popular"" example). This is sad but I'm too lazy
    // to do a robust logic, so there's also that.
    let theWatcher = fs.watch(appInfoFile, onFileChange); // Things just ain't the same for gangstas

    async function onFileChange(eventName) {
      if (eventName !== "change") {
        // There's seem to be filesystem stuff happening which just perform
        // renames before actually updating the file.
        // Reacting to those risk to lead to an ENOENT, it's just simpler to
        // watch for change.
        return;
      }
      console.info(`"${appInfoFile}" updated. Restarting all builds...`);
      const contexts = await lastBuildContexts;
      contexts.forEach((context) => {
        context.cancel();
        context.dispose();
      });
      lastBuildContexts = reBuild().catch(reject);

      // Because of those same weird filesystem stuff, it's just safer to
      // re-watch the file here.
      theWatcher.close();
      theWatcher = fs.watch(appInfoFile, onFileChange);
    }
  });
  async function reBuild() {
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

    // Produce all bundles
    return await Promise.all(
      [
        ...lazyLoadedApps,
        {
          outputFile: OUTPUT_APP_LIB_SCRIPT,
          input: path.join(DESKTOP_SRC_DIR, "app-lib/app-sandbox.mjs"),
        },
        {
          outputFile: path.join(OUTPUT_DIR, "desktop.js"),
          input: path.join(DESKTOP_SRC_DIR, "desktop.mjs"),
        },
      ].map((bundle) =>
        produceBundle(bundle.input, bundle.outputFile, options),
      ),
    );
  }
}

/**
 * Run bundler on a single file with the given options.
 * @param {string} inputFile - The entry file for the bundle
 * @param {string} outfile - Destination of the produced bundle.
 * @param {Object} options
 * @param {boolean} [options.minify] - If `true`, the output will be minified.
 * @param {boolean} [options.watch] - If `true`, the RxPlayer's files involve
 * will be watched and the code re-built each time one of them changes.
 * @param {boolean} [options.silent] - If `true`, we won't output logs.
 * @param {Object} [options.globals] - Optional globally-defined identifiers, as
 * a key-value objects, where the object is a string (trick: if you want to
 * replace an identifier with a string, call `JSON.stringify` on it).
 * @returns {Promise}
 */
async function produceBundle(inputFile, outfile, options) {
  const minify = !!options.minify;
  const watch = !!options.watch;
  const isSilent = options.silent;
  const globals = options.globals;
  const relativeInFile = path.relative(PROJECT_ROOT_DIRECTORY, inputFile);
  const relativeOutfile = path.relative(PROJECT_ROOT_DIRECTORY, outfile);

  const esbuildStepsPlugin = {
    name: "bundler-steps",
    setup(build) {
      build.onStart(() => {
        logWarning(`Bundling of "${relativeInFile}" started.`);
      });
      build.onEnd((result) => {
        if (result.errors.length > 0 || result.warnings.length > 0) {
          const { errors, warnings } = result;
          logWarning(
            `Re-bundling for "${inputFile}" failed with ${errors.length} error(s) and ` +
              ` ${warnings.length} warning(s) `,
          );
          return;
        }
        if (relativeOutfile !== undefined) {
          logSuccess(`Bundling of "${relativeOutfile}" succeeded.`);
        }
      });
    },
  };

  const meth = watch ? "context" : "build";

  // Create a context for incremental builds
  try {
    const context = await esbuild[meth]({
      entryPoints: [inputFile],
      bundle: true,
      target: "es2020",
      minify,
      write: true,
      format: "esm",
      outfile,
      plugins: [esbuildStepsPlugin],
      define: {
        ...globals,
      },
    });
    if (watch) {
      context.watch();
      return context;
    }
  } catch (err) {
    logError(`Bundling failed for "${inputFile}":`, err);
    throw err;
  }

  function logSuccess(msg) {
    if (!isSilent) {
      console.log(`\x1b[32m[${getHumanReadableHours()}]\x1b[0m`, msg);
    }
  }

  function logWarning(msg) {
    if (!isSilent) {
      console.log(`\x1b[33m[${getHumanReadableHours()}]\x1b[0m`, msg);
    }
  }

  function logError(msg) {
    if (!isSilent) {
      console.log(`\x1b[31m[${getHumanReadableHours()}]\x1b[0m`, msg);
    }
  }
}

/**
 * Return the current date into a more readable `HH:mm:ss.fff`
 * (hours:minutes:seconds.milliseconds) format.
 * @returns {string}
 */
function getHumanReadableHours() {
  const date = new Date();
  return (
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ":" +
    String(date.getSeconds()).padStart(2, "0") +
    "." +
    String(date.getMilliseconds()).padStart(4, "0")
  );
}

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
    throw new Error(`Failed to read "AppInfo.json": ${err}`);
  }

  let json;
  try {
    json = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to parse "AppInfo.json": ${err}`);
  }

  if (typeof json.version !== "number") {
    throw new Error("Invalid AppInfo.json: invalid version property (number)");
  }
  if (!Array.isArray(json?.apps)) {
    throw new Error("Invalid AppInfo.json: no apps Array");
  }

  /** Information on the bundles to create for apps. */
  const bundlesToMake = [];
  /** Dynamic imports to write in the generated file to be imported after a timer. */
  const automaticDynImportsAfterTimer = [];

  /** I'll uglily write manually the JS code, being careful with it. */
  let uglyHandWrittenJsObject = `export const version = ${json.version};

export default [`;

  for (let i = 0; i < json.apps.length; i++) {
    const app = json.apps[i];

    let hasRemoteUrl = !!app.website;
    let filePath;

    // dumb rule so it's simpler to write the following code
    if (!/^[A-Za-z0-9-_]+$/.test(app.id)) {
      throw new Error(
        `Invalid app id: "${app.id}". Should only contain alphanumeric, dash or lowerscore characters`,
      );
    }

    if (typeof app.title !== "string") {
      throw new Error(
        `Invalid title for app id: "${app.id}". Title should be strings`,
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
    for (const key of Object.keys(app)) {
      switch (key) {
        case "id":
        case "title":
          // Already checked
          break;

        case "icon":
          if (typeof app.icon !== "string") {
            throw new Error(
              `Error in app "${app.id}". Invalid "icon" property: should be a string.`,
            );
          }
          uglyHandWrittenJsObject +=
            "    icon: " + JSON.stringify(app.icon) + ",\n";
          break;

        case "desktop":
          {
            if (typeof app.desktop !== "object" || app.desktop === null) {
              throw new Error(
                `Error in app "${app.id}". Invalid "desktop" property: should be an object or not set.`,
              );
            }
            uglyHandWrittenJsObject += `    desktop: {
`;
            if (!!app.desktop.display) {
              uglyHandWrittenJsObject += "      display: true,\n";
            }
            if (
              typeof app.desktop.group === "string" &&
              app.desktop.group !== ""
            ) {
              uglyHandWrittenJsObject += `      group: ${JSON.stringify(app.desktop.group)},
`;
            }
            uglyHandWrittenJsObject += `    },
`;
          }
          break;

        case "startMenu":
          {
            if (typeof app.startMenu !== "object" || app.startMenu === null) {
              throw new Error(
                `Error in app "${app.id}". Invalid "startMenu" property: should be an object or not set.`,
              );
            }
          }
          uglyHandWrittenJsObject += `    startMenu: {
`;
          if (!!app.startMenu.display) {
            uglyHandWrittenJsObject += "      display: true,\n";
          }
          if (
            typeof app.startMenu.list === "string" &&
            app.startMenu.list !== ""
          ) {
            uglyHandWrittenJsObject += `      list: ${JSON.stringify(app.startMenu.list)},
`;
          }
          uglyHandWrittenJsObject += `    },
`;
          break;

        case "sandboxed":
          if (typeof app.sandboxed !== "boolean") {
            throw new Error(
              `Error in app "${app.id}". Invalid "sandboxed" property: should be a boolean.`,
            );
          }
          break;

        case "defaultHeight":
          if (typeof app.defaultHeight !== "number") {
            throw new Error(
              `Error in app "${app.id}". Invalid "defaultHeight" property: should be a number.`,
            );
          }
          uglyHandWrittenJsObject +=
            "    defaultHeight: " + app.defaultHeight + ",\n";
          break;

        case "defaultWidth":
          if (typeof app.defaultWidth !== "number") {
            throw new Error(
              `Error in app "${app.id}". Invalid "defaultWidth" property: should be a number.`,
            );
          }
          uglyHandWrittenJsObject +=
            "    defaultWidth: " + app.defaultWidth + ",\n";
          break;

        case "onlyOne":
          if (typeof app.onlyOne !== "boolean") {
            throw new Error(
              `Error in app "${app.id}". Invalid "defaultWidth" property: should be a number.`,
            );
          }
          if (app.onlyOne) {
            uglyHandWrittenJsObject += "    onlyOne: true,\n";
          }
          break;

        case "dependencies":
          if (!Array.isArray(app.dependencies)) {
            throw new Error(
              `Error in app "${app.id}". Invalid "dependencies" property: should be an array.`,
            );
          }
          for (const dep of app.dependencies) {
            if (
              ![
                "settings",
                "notificationEmitter",
                "filesystem",
                "filePickerOpen",
                "filePickerSave",
                "quickSave",
                "open",
              ].includes(dep)
            ) {
              throw new Error(
                `Error in app "${app.id}". One of the asked dependency does not exist: ${dep}`,
              );
            }
          }
          uglyHandWrittenJsObject +=
            "    dependencies: " + JSON.stringify(app.dependencies) + ",\n";
          break;

        case "provider":
          if (!Array.isArray(app.provider)) {
            throw new Error(
              `Error in app "${app.id}". Invalid "provider" property: should be an array.`,
            );
          }
          for (const feature of app.provider) {
            if (!["filePickerOpen", "filePickerSave"].includes(feature)) {
              throw new Error(
                `Error in app "${app.id}". Provider of unknown feature: ${feature}`,
              );
            }
          }
          uglyHandWrittenJsObject +=
            "    provider: " + JSON.stringify(app.provider) + ",\n";
          break;

        case "defaultForExtensions":
          if (!Array.isArray(app.defaultForExtensions)) {
            throw new Error(
              `Error in app "${app.id}". Invalid "defaultForExtensions" property: should be an array.`,
            );
          }
          for (const ext of app.defaultForExtensions) {
            if (typeof ext !== "string") {
              throw new Error(
                `Error in app "${app.id}". Indicates non-string extension as \`defaultForExtensions\``,
              );
            }
          }
          uglyHandWrittenJsObject +=
            "    defaultForExtensions: " +
            JSON.stringify(app.defaultForExtensions) +
            ",\n";
          break;

        case "preload":
          {
            if (!filePath) {
              throw new Error(
                `Error in app "${app.id}". "preload" property for an external app`,
              );
            }
            if (typeof app.preload !== "object" || app.preload === null) {
              throw new Error(
                `Error in app "${app.id}". Invalid "preload" property: should be an object.`,
              );
            }

            const props = Object.keys(app.preload);
            if (props.length !== 1 || props[0] !== "after") {
              throw new Error(
                `Error in app "${app.id}". Invalid "preload" property: Only "after" is handled for now.`,
              );
            }
            if (typeof app.preload.after !== "number") {
              throw new Error(
                `Error in app "${app.id}". Invalid "preload" property: No "after" property.`,
              );
            }
          }
          break;

        case "website":
          if (filePath) {
            throw new Error(
              `Error in app "${app.id}". Declaring both internal app and "website". Choose one`,
            );
          }
          if (typeof app.website !== "string") {
            throw new Error(
              `Error in app "${app.id}". Invalid "website" property: should be a string.`,
            );
          }
          break;

        default:
          throw new Error(
            `Error in app "${app.id}". Unrecognized property: ${key}`,
          );
      }
    }

    if (filePath) {
      // Here I will put the import path as a `lazyLoad` property.
      const importPath = `./lazy/${app.id}.js`;
      uglyHandWrittenJsObject += `    data: {
      lazyLoad: ${JSON.stringify(importPath)},
`;
      if (app.sandboxed) {
        uglyHandWrittenJsObject += `      sandboxed: true,
`;
      }
      uglyHandWrittenJsObject += `    },
`;
      const outputFile = path.join(OUTPUT_LAZY_LOADED_APPS, `${app.id}.js`);
      bundlesToMake.push({
        outputFile,
        input: filePath,
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

// If true, this script is called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let shouldWatch = false;
  let shouldMinify = false;
  let silent = false;
  let appBaseUrl;

  for (let argOffset = 0; argOffset < args.length; argOffset++) {
    const currentArg = args[argOffset];
    switch (currentArg) {
      case "-h":
      case "--help":
        displayHelp();
        process.exit(0);

      case "-w":
      case "--watch":
        shouldWatch = true;
        break;

      case "-a":
      case "--app-base-url": {
        argOffset++;
        const wantedBaseUrl = args[argOffset];
        if (wantedBaseUrl === undefined) {
          console.error("ERROR: no base URL provided\n");
          displayHelp();
          process.exit(1);
        }
        appBaseUrl = wantedBaseUrl;
      }

      case "-m":
      case "--minify":
        shouldMinify = true;
        break;

      case "-s":
      case "--silent":
        silent = true;
        break;

      case "--":
        argOffset = args.length;
        break;

      default: {
        console.error('ERROR: unknown option: "' + currentArg + '"\n');
        displayHelp();
        process.exit(1);
      }
    }
  }

  run({
    appBaseUrl,
    watch: shouldWatch,
    minify: shouldMinify,
    silent,
  }).catch((err) => {
    console.error(`ERROR: ${err}\n`);
    process.exit(1);
  });
}

/**
 * Display through `console.log` an helping message relative to how to run this
 * script.
 */
function displayHelp() {
  console.log(
    `build.mjs: Produce the desktop bundles (of both the core desktop itself and
of all the declared apps).

Will interpret the \`/apps/AppInfo.json\` first to find out all the apps it needs to
bundle, and will advertise them to the desktop through a generated JS file.
The bundled desktop will then be able to list those applications and load their app
bundle when needed.

For now, this script doesn't react to modifications of the \`/apps/AppInfo.json\` file,
even in "watch" mode, meaning that this script should be relaunched anytime that json
file is modified (which should mostly happen when adding new applications).

Usage: node build.mjs [OPTIONS]

Available options:
  -h, --help                  Display this help message.
  -a, --app-base-url          The base URL where apps are reachable.
                              Defaults to relative from the desktop.
  -m, --minify                Minify the built bundle.
  -s, --silent                Don't log to stdout/stderr when bundling.
  -w, --watch                 Re-build each time any of the files depended on changed.`,
  );
}
