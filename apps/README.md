# Apps

_LAST UPDATE: 2025-05-13_
_APPS API VERSION: 0.1.0_

This directory regroups "apps" that can be loaded by this desktop.

They are lazily loaded (only loaded once the corresponding application is
opened) with only their metadata defined in `AppInfo.json` known by the
initial JS bundle.

The build script then generates a JS file automatically, for now relying on ES6
dynamic imports. It will find the corresponding app by looking at its `id`
property in `AppInfo.json`. It will look for the files:

1. `<id>.mjs`

2. `<id>/index.mjs`

3. `<id>.js`

4. `<id>/index.js`

In that order.

The corresponding file(s) that may be imported by this entry point will be
bundled as a single file named `<id>.js` in the `dist/lazy/` directory.
The `export` statements present in the entry file will be kept in place
however.

Then when the desktop needs to load the application at runtime, it will be
lazily imported as an ES6 module through a dynamic import, such as
`import("./lazy/<id>.js")`.

## The `create` function

Entry file of applications should export a `create` function in their main file,

### Parameters

The `create` function will be provided 3 arguments that may be exploited or not
depending on the application's needs:

1.  Arguments `{Array.<string>}`: The optional arguments with which the
    application was launched. This can be done to for example open an editor on
    a particular file.

2.  Environment `{Object}`: The data provided from the desktop environment.

    Contains the following properties:

    - `appUtils` (`Object`): the standard desktop libraries (look at
      `../src/app-utils.mjs` for more information on what utils there is)

    - The `getImageRootPath` function, which returns the base URL where static
      images will be served.

    - The `getVersion` function, which returns the current version of the
      desktop OS.

    - Optionally, there may be the `dependencies` asked for the App in the
      `AppInfo.json` file (e.g. asking for the `settings` dependency will provide
      a `settings` object).

3.  AbortSignal (`AbortSignal`): An `AbortSignal` that will be triggered when
    the application is closed. This should be used to clean-up all
    resource-reserving logic present in the application, like event listeners
    on `document` and whatnot.

    The application's DOM elements themselves will be unmounted so it's not
    necessary to clean-up resources linked to those, they should be GCed by
    the browser.

### Return value

Apps have to follow a particular syntax where they have to export a `create`
function returning at least either:

- An `element` `HTMLElement` property corresponding to the app's content.
  Most applications should probably define an `element` property.

- **OR**, a `sidebar` array. This allows to simplify the syntax of simple
  text-heavy applications with a sidebar.

  The `sidebar` property is an array of object, each representing a sidebar
  section. Each object can contain the following properties:

  - `text` (`string`): This is mandatory and is the text for the corresponding
    sidebar section.

  - `icon` (`string|undefined`): This is optional. An "emoji" character to act
    as the section's icon. If not indicated, just the text will be displayed.

  - `centered` (`boolean|undefined`): This is optional. If `true` the content
    of that section will be assigned a maximum width and will be centered.

    This is especially useful for text-heavy sections, as having the full width
    of text in full screen is kind of hard to read.

  - `render` (`Function`): The section's HTML content. It should return an
    `HTMLElement` which corresponds to what will be displayed (and optionally
    centered in the window, see `centered` property) when the section is chosen.

    This function takes an `AbortSignal` as its argument, which will be
    triggered when the section is closed (so different from the `create`
    function `AbortSignal` which is triggered when it is application is closed).

    In the sidebar scenario, it is is generally this `AbortSignal` that should
    be listened to to free resources, not the one from `create` which would
    have more nich usages.

- Optionally, the `create` function can also return a `focus` property which
  will be called when the corresponding window is focused (e.g. the text area
  in a text editor).

Look at the apps already here for more information.
