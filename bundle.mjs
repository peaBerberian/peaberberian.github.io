#!/usr/bin/env node
/**
 * # run_bundler.mjs
 *
 * This file allows to create JavaScript bundles for the RxPlayer through our
 * bundlers with the right configuration.
 *
 * You can either run it directly as a script (run `node run_bundler.mjs -h`
 * to see the different options) or by requiring it as a node module.
 * If doing the latter you will obtain a function you will have to run with the
 * right options.
 */

import * as fs from "fs";
import * as path from "path";
import { pathToFileURL, fileURLToPath } from "url";
import esbuild from "esbuild";

const PROJECT_ROOT_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
/**
 * Run bundler with the given options.
 * @param {string} inputFile
 * @param {Object} options
 * @param {boolean} [options.minify] - If `true`, the output will be minified.
 * @param {boolean} [options.watch] - If `true`, the RxPlayer's files involve
 * will be watched and the code re-built each time one of them changes.
 * @param {boolean} [options.silent] - If `true`, we won't output logs.
 * @param {string} [options.outfile] - Destination of the produced es2017
 * bundle. To ignore to skip ES2017 bundle generation.
 * @param {Object} [options.globals] - Optional globally-defined identifiers, as
 * a key-value objects, where the object is a string (trick: if you want to
 * replace an identifier with a string, call `JSON.stringify` on it).
 * @returns {Promise}
 */
export default async function runBundler(inputFile, options) {
  const minify = !!options.minify;
  const watch = !!options.watch;
  const isSilent = options.silent;
  const outfile = options.outfile;
  const globals = options.globals;
  const relativeInFile = path.relative(PROJECT_ROOT_DIRECTORY, inputFile);
  const relativeOutfile =
    outfile === undefined
      ? undefined
      : path.relative(PROJECT_ROOT_DIRECTORY, options.outfile);

  if (outfile === undefined) {
    throw new Error("No output file has been provided");
  }

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
      target: "es2017",
      minify,
      write: outfile !== undefined,
      outfile,
      plugins: [esbuildStepsPlugin],
      define: {
        ...globals,
      },
    });
    if (watch) {
      return context.watch();
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

// If true, this script is called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let shouldWatch = false;
  let shouldMinify = false;
  let outputFile = "";
  let silent = false;

  if (args[0] === "-h" || args[0] === "--help") {
    displayHelp();
    process.exit(0);
  }
  for (let argOffset = 1; argOffset < args.length; argOffset++) {
    const currentArg = args[argOffset];
    switch (currentArg) {
      case "-h":
      case "--help":
        displayHelp();
        process.exit(0);
        break;

      case "-w":
      case "--watch":
        shouldWatch = true;
        break;

      case "-m":
      case "--minify":
        shouldMinify = true;
        break;

      case "-s":
      case "--silent":
        silent = true;
        break;

      case "-o":
      case "--output":
        {
          argOffset++;
          const wantedOutput = args[argOffset];
          if (wantedOutput === undefined) {
            console.error("ERROR: no output file provided\n");
            displayHelp();
            process.exit(1);
          }
          outputFile = path.normalize(wantedOutput);
        }
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

  const inputFile = args[0];
  if (inputFile === undefined) {
    console.error("ERROR: no input file provided\n");
    displayHelp();
    process.exit(1);
  }

  const normalizedPath = path.normalize(inputFile);
  if (!fs.existsSync(normalizedPath)) {
    console.error(`ERROR: input file not found: ${inputFile}\n`);
    displayHelp();
    process.exit(1);
  }

  try {
    runBundler(normalizedPath, {
      watch: shouldWatch,
      minify: shouldMinify,
      silent,
      outfile: outputFile,
    }).catch((err) => {
      console.error(`ERROR: ${err}\n`);
      process.exit(1);
    });
  } catch (err) {
    console.error(`ERROR: ${err}\n`);
    process.exit(1);
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
 * Display through `console.log` an helping message relative to how to run this
 * script.
 */
function displayHelp() {
  console.log(
    `run_bundler.mjs: Produce a RxPlayer bundle (a single JS file containing the RxPlayer).

Usage: node run_bundler.mjs <INPUT FILE> [OPTIONS]

Available options:
  -h, --help                  Display this help message.
  -o <PATH>, --output <PATH>  Mandatory: Specify the output file.
  -m, --minify                Minify the built bundle.
  -s, --silent                Don't log to stdout/stderr when bundling.
  -w, --watch                 Re-build each time any of the files depended on changed.`,
  );
}
