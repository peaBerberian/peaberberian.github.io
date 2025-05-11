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

## The `AppInfo.json` file

`AppInfo.json` contains the list of application that will be included in the
desktop builds. It's a JSON file with for now a single key, `"apps"`, which is
set to an array of objects, each describing the properties wanted for that
application. The order of that array is important, as it may be re-used for
application listings in the desktops (e.g. earlier apps might be put before
as desktop icons or in the start menu).

The following properties can be set for each application:

- `"id"` (`string`, mandatory): unique identifier for the application, which
  will should correspond to its code location (see previous chapter).

  Only alphanumeric, lowerscore or dash characters are authorized in a `id`.

- `"title"` (`string`, mandatory): The name of the application that will usually
  be shown to the website user.

- `"icon"` (`string`, mandatory): An emoji that will be used as an application
  icon in the desktop.

- `"website"`: (`string`, optional): If set, this object does not represent an
  actual application stored here but will launch an "i-frame" to that website.

  `website` is set to the corresponding website URL. It should be browsable in
  an i-frame which is sadly not the case with most popular websites for
  security reasons.

  When `website` is set, no file should be declared in the `/apps` directory
  with this application's `id`.

- `"defaultHeight"` (`number`, optional): Optional wanted optimal defaut height
  in pixels for the application content (the window minus window decorations
  like potential borders and the header).

- `"defaultWidth"` (`number`, optional): Optional wanted optimal defaut width
  in pixels for the application content (the window minus window decorations
  like potential borders and the header).

- `"onlyOne"` (`boolean`, optional): If set to `true`, only one instance of the
  application will be opened at most in the desktop. New opening attempts will
  re-activate the window and not open a new one.

- `"inStartList"` (`string`, optional): If set, the application will not be
  directly visible in the start menu but ender a subcategory of that name.

  If multiple applications shares the same `"inStartList"` property, they will
  be together in that same subcategory.

- `"desktopDir"` (`string`, optional): If set, the application will not be
  directly visible as a desktop icon but will be added to an "app group" of that
  name.

  If multiple applications shares the same `"desktopDir"` property, they will
  be together in that same "app group".

- `"dependencies"` (`Array.<string>`, optional): Supplementary API that will be
  provided to the application when it is run. This is kind of a permission
  system, kind of its own thing, I'm still iterating on this.

- `"preload"` (`Object`, optional): I'm also iterating on this one, but the idea
  here is to set trigger conditions for "application preloading", that is, for
  loading it before it is actually opened - to speed up the time to interactive
  when it is indeed opened.

  For now I already implemented the `after` key (a `number`), which if set will
  run a timer when the desktop is first loaded of the corresponding amounts of
  milliseconds before preloading that application.

## The `create` function

The entry file of each application should export a `create` function in their main
file.

### Parameters

The `create` function will be provided 3 arguments that may be exploited or not
depending on the application's needs:

1.  Arguments `{Array.<string>}`: The optional arguments with which the
    application was launched. This can be done to for example open an editor on
    a particular file.

2.  Environment `{Object}`: The data provided from the desktop environment.

    Contains the following properties:

    - `appUtils` (`Object`): the standard desktop libraries (look at
      `../src/app-utils` for more information on what utils there is)

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

The `create` function should return either:

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
    triggered when the current sidebar section changed (so different from the
    `create` function's `AbortSignal` which is triggered when the application is
    closed).

    In the sidebar scenario, it is is generally this `AbortSignal` that should
    be listened to to free resources, not the one from `create` which would
    have more nich usages.

- Optionally, the `create` function can also return a `onActivate` property
  which will be called when the corresponding window is focused and an
  `onDeactivate` function for when it is deactivated.

  This can be used to for example register keyboard event listener when it's
  the application which has the focus, and removing them when it's another.

  This can also be used to decide what element will be focused when opening
  or switching to the application.

Alternatively, it can also return a Promise which resolves with the same object.
In cases where it returns a promise, a spinner will be shown while the promise
is not yet resolved.

Look at the apps already here for more information.
