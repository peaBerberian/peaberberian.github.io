#!/usr/bin/env node
/**
 * start_local_server
 * ==================
 *
 * This script allows to build and serve the desktop locally,
 *
 * It will start an HTTP and HTTPS (only if a certificate and key have been
 * generated) server to serve, on the port 8000 and 8443 respectively.
 *
 * You can run it as a script through `node start_local_server.mjs`.
 * The build will be automatically updated each time any of it file changes.
 *
 * You can also import this file through ES6 imports.
 */

import { join, dirname } from "path";
import { pathToFileURL, fileURLToPath } from "url";
import build from "./build.mjs";
import launchStaticServer from "./launch_static_server.mjs";

const PROJECT_ROOT_DIRECTORY = dirname(fileURLToPath(import.meta.url));

/**
 * Build the desktop and serve it through the configured ports.
 * @param {Object|undefined} [opts] - Various options to configure the build,
 * the launched HTTP/HTTPS server, or both.
 * Provide defaults if not specified (see below).
 * @param {boolean|undefined} [opts.verbose] - If `true` logs will be outputed
 * to stdout/stderr indicate the current status of build and server.
 * Defaults to `false`.
 * @param {boolean|undefined} [opts.minify] - If `true`, the built bundle will
 * be minified to a smaller, less readable, JavaScript file.
 * Defaults to `false`.
 * @param {boolean|undefined} [opts.watch] - If `true`, all built files will be
 * "watched", and as such re-built when/if they're updated.
 * Defaults to `false`.
 * @param {number|undefined} [opts.httpPort] - The port on which the bundle will
 * be served on incoming HTTP connections.
 * Defaults to `8000`.
 * @param {number|undefined} [opts.httpsPort] - The port on which the bundle
 * will be served on incoming HTTP connections.
 * Defaults to `8443`.
 * @param {string|undefined} [opts.keyPath] - The path to the private key file
 * you want to use for the HTTPS connection.
 * Defaults to `<PROJECT_ROOT>/localhost.key`.
 * @param {string|undefined} [opts.certificatePath] - The path to the
 * certificate file you want to use for the HTTPS connection.
 * Defaults to `<PROJECT_ROOT>/localhost.crt`.
 * @returns {Promise}
 */
export default function startBundleWebServer({
  verbose,
  minify,
  watch,
  httpPort,
  httpsPort,
  keyPath,
  certificatePath,
} = {}) {
  return Promise.all([
    build({
      // appBaseUrl: "https://peaberberian.github.io",
      watch: !!watch,
      minify: !!minify,
      silent: !verbose,
    }),
    launchStaticServer(join(PROJECT_ROOT_DIRECTORY, "dist/"), {
      certificatePath:
        certificatePath ?? join(PROJECT_ROOT_DIRECTORY, "localhost.crt"),
      keyPath: keyPath ?? join(PROJECT_ROOT_DIRECTORY, "localhost.key"),
      verbose: !!verbose,
      httpPort: httpPort ?? 8000,
      httpsPort: httpsPort ?? 8443,
    }).listeningPromise,
  ]);
}

// If true, this script is called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let singleBuild = false;
  let shouldMinify = false;
  let silent = false;
  for (let argOffset = 0; argOffset < args.length; argOffset++) {
    const currentArg = args[argOffset];
    switch (currentArg) {
      case "-h":
      case "--help":
        displayHelp();
        process.exit(0);
      case "-1":
      case "--single-build":
        singleBuild = true;
        break;
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

  try {
    startBundleWebServer({
      verbose: !silent,
      watch: !singleBuild,
      minify: shouldMinify,
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
 * Display through `console.log` an helping message relative to how to run this
 * script.
 */
function displayHelp() {
  console.log(
    `start_local_server.mjs: Build the bundles and start an HTTP/HTTPS server to serve them.

Usage: node start_local_server.mjs [OPTIONS]

Options:
  -h, --help             Display this help
  -m, --minify           Minify the built demo
  -1, --single-build     Only build a single time (don't watch)
  -s, --silent           Don't log to stdout/stderr when bundling`,
  );
}
