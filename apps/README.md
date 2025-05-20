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

The build script will check that file for most mistakes and abort the build
operation if it detects unknown options or options in the wrong format, to
make sure the file is well-formed.

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

- `"startMenu"` (`Object`, optional): This application's configuration regarding
  its display (or not) in the start menu.

  Can contain the following properties, all optional:

  - `"list"` (`string`, optional): If set, the application may be added to
    a "sub-list" in the start menu of that name, instead of displaying directly
    in it.

    Most applications should have a `"list"`, preferably shared between
    multiple applications as to be more useful.

    The presence of a `"list"` property makes the value of the `"display"`
    property ignored.

  - `"display"` (`boolean`, optional): Ignored if `"list"` is set.
    Else, if set to `true`, the application will be displayed directly inside
    the start menu and not inside a sub-list.

- `"desktop"` (`Object`, optional): This application's configuration regarding
  its display (or not) as a desktop icon.

  Can contain the following properties, all optional:

  - `"group"` (`string`, optional): If set, the application will not be added
    direcly as a desktop icon but part of an "app-group" with that name instead.

    Multiple apps should preferably be in the same app group, which should be
    aptly named with the same string.

    The presence of a `"group"` property makes the value of the `"display"`
    property ignored.

  - `"display"` (`boolean`, optional): Ignored if `"group"` is set.
    Else, if set to `true`, the application will be displayed directly as a
    desktop icon.

- `"preload"` (`Object`, optional): Set trigger conditions for "application
  preloading", that is, for loading it before it is actually opened - to speed
  up the time to interactive when it is indeed opened.

  For only the `after` key (a `number`) is implemented, which if set will run a
  timer when the desktop is first loaded of the corresponding amounts of
  milliseconds before preloading that application.

- `"defaultForExtensions"` (`Array.<string>`, optional): The "extensions" for
  which this application should be chosen by default when opening it without
  specifying an application.

  E.g. adding `"png"` will make this application open PNG images by default if
  opened in some applications such as a file explorer.

  If more than one application declares the same extension. Only the first
  application that declare it in the `apps` array will be considered.

- `"dependencies"` (`Array.<string>`, optional): Supplementary API that will be
  provided to the application when it is run.

  This is close to a permission system.

  For now the following dependencies are handled:

  - `"settings"`: Read and write access to the Desktop's core settings.
    Very few applications will need that.

  - `"open"`: Allows to open any path or file object from the file system
    (executable, applications etc.).

  - `"filesystem"`: Complete read and write access to the Desktop's
    "filesystem".

    This is a very broad permission, the `"filePickerOpen"` and
    `"filePickerSave"` permissions should be prefered in almost all cases.

  - `"filePickerOpen"`: Allows to spawn a "file-picker" to open a file.

    The file-picker is an application that will be placed "on top" of the
    application asking for it. It has `"filesystem"` access and as such can
    navigate freely all files in the user's desktop. When the user made its
    choise the file-picker will communicate back to the application the
    filename and file's data - but not its full path.

    This allows most application to open any file choosen explicitly by the
    user.

  - `"filePickerSave"`: Equivalent of `"filePickerOpen"` but this time to choose
    a save location (and save) for a file.

  - `"quickSave"`: Allows to save files already communicated to the application
    (either as an application's argument or through one of the file pickers),
    just by communicating its file "handle". Allows to bypass the need to
    open `"filePickerSave"` when the path to save at should not have change
    (still without the application knowing where).

- `"provider"` (`Array.<string>`, optional): The supplementary features the
  application can provide.

  If more than one application declares the same features. Only the first
  application that declare it in the `apps` array will be considered.

  For now only the following values are supported:

  - `"filePickerOpen"`: The application alternatively allows to spawn a
    file-picker application to provide file opening capabilities to other
    applications (those with the `"filePickerOpen"` dependency).

    Applications with that feature should export a `createFileOpener` function
    (additionally to their `create` function).

  - `"filePickerSave"`: The application alternatively allows to spawn a
    file-picker application to provide file saving capabilities to other
    applications (those with the `"filePickerSave"` dependency).

    Applications with that feature should export a `createFileSaver` function
    (additionally to their `create` function).

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
      `../src/app-launcher/app-utils` for more information on what utils there
      is)

    - The `getImageRootPath` function, which returns the base URL where static
      images will be served.

    - The `getVersion` function, which returns the current version of the
      desktop OS.

    - Optionally, there may be the `dependencies` asked for the App in the
      `AppInfo.json` file (e.g. asking for the `settings` dependency will provide
      a `settings` object etc.).

3.  AbortSignal (`AbortSignal`): An `AbortSignal` that will be triggered when
    the application is closed. This should be used to clean-up all
    resource-reserving logic present in the application, like event listeners
    on `document` and whatnot.

    The application's DOM elements themselves will be unmounted so it's not
    necessary to clean-up resources linked to those, they should be GCed by
    the browser.

### Return value

The `create` function should return either and object or a a Promise which
resolves with that same object. In cases where it returns a promise, a spinner
will be shown while the promise is not yet resolved.

The object may have the following properties:

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

- Optionally, the `create` function can also return a `onActivate` function
  which will be called when the corresponding window is focused, an
  `onDeactivate` function for when it is un-focused, and an `onClose` function
  which will be called just before the application is closed.

  This can be used to for example register keyboard event listener when it's
  the application which has the focus, and removing them when it's another
  (on `onActivate` and `onDeactivate` respectively).

  This can also be used to decide what element will be focused when opening
  or switching to the application.

  However note that the desktop may choose to kill the application at any time
  without calling either `onDeactivate` or `onClose`, even if it will try to
  refrain to do so. It will only do so when the application does not risk to
  leak memory, such as when it is part of an i-frame, or when the page is being
  closed anyway.

Look at the apps already here for more information.
