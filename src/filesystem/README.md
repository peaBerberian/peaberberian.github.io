# The FileSystem

This directory defines this desktop's "filesystem".

It follows the old unix way of doing `/` stuff but with many many
simplifications in some ways and specificities in other due to the nature of
the site.

The root directory is `/` and can be read through the `readDir` API.
It is read-only.

## Directories at the root

The root directory contains itself the following directories.

### `/apps/`

The `/apps/` root contains virtual "executable" files corresponding to this
desktop's application. They are not actually stored on long term storage on
the user's device, they are embedded inside the JS files.

Each "file" in that directory is an actual app. This whole directory is
read-only: no file can be removed, moved or renamed. No file can be added to
this directory. Doing any of this will lead to an error.

#### Reading the `/apps/` dir

When reading the dir, e.g. through `readDir`, you'll get an Array of objects
corresponding to the list of ""installed"" applications.

Each returned object will have the following properties:

- Its `name` property is the actual application's `id` property, followed by
  the extension `.run` (e.g. `paint.run`)

- Its `icon` property wll correspond to the application's `icon` property.

- Its `type` property set to `file`.

- Its `modified` property set to some hardcoded old date.

#### Reading a file from `/apps/`

When reading a file in `/apps/` e.g. `/apps/about.run`, the returned
information will contain the corresponding app object in
`./__generated_apps.mjs` that contains everything that's needed to run it.

It's basically the executable format of this desktop: a JSON/JS object with
some set properties defining different aspects of the app (wanted
width/height, where to find its code etc.).

### `/system32/`

`/system32/` (the name itself being a nonsensical joke) is also a read-only
root directory. It contains basically virtual "config files" for the desktop.

It is read-only, as well as all its content.

For now it contains the following files (with the `type` set to `file`), they
can be discovered through `readDir`, but they should be always there:

- `/system32/default-desktop.json`: Contains metadata on the default
  wanted arrangement for the desktop icons, which can be updated at any time
  by the user through its `/userconfig/` directory.

  Reading that file will return you a JSON object.
  That object will contain a `list` key containing an Array of JSON objects,
  each representing an application to display on the desktop, in the given
  order they should be ordered, with the following keys:

  - `run` (`string`): The path to the application "executable" (e.g.
    `/apps/paint.run`).

  - `args` (`Array.<string>`): The arguments the application "executable"
    should be run with.

  - `title` (`string`): The `title` of the application to show on the
    desktop.

  - `icon` (`string|undefined`): The icon to show for the application.

    There's also a `version` property in that file, derived from the original
    application list file.

    The intent is to make it detectable if executables and files referenced here
    could since be moved in a default system.

- `system32/start_menu.config.json`: Contains metadata for the arrangement of
  apps in the start menu

  Reading that file will return you a JSON object,

  That object will contain a `list` key containing an Array of JSON objects.

  Those objects can be of two forms: application objects (each representing
  an application to display on that menu) or sublists (each representing a
  sub-list of applications in the menu).

  They are all in the given order they should be ordered.

  Application objects have the following keys:

  - `type` (`string`): Set to `"application"`.

  - `run` (`string`): The path to the application (e.g. `/apps/about.run`).

  - `args` (`Array.<string>`): The arguments the application "executable"
    should be run with.

  - `title` (`string`): The `title` of the application to show on the
    start menu.

  - `icon` (`string|undefined`): The icon to show for the application.

  Sublists have the following properties:

  - `type` (`string`): Set to `"sublist"`.

  - `name` (`string`): The name to display for this sublist.

  - `list` (`Array.<Object>`): The application objects inside that sublist.
    A sublist cannot contain another sublist.

    There's also a `version` property in that file, derived from the original
    application list file.

    The intent is to make it detectable if executables and files referenced here
    could since be moved in a default system.

- `system32/default_apps.config.json`: Contains object where the keys are files
  extensions and the value is the path of the corresponding application to
  launch by default for that type of file (with that file in argument).

- `system32/providers.config.json`: Contain metadata on "providers", which are
  application with supplementary features.

  One example of such features would be `"filePickerOpen"`, allowing an
  application to open a file picker to access a file from the file system
  without actually having access to it.

  It takes the form of an Object, where the keys are the features (e.g.
  `"filePickerOpen"`) and where the value is an array of path to the
  corresponding executable implementing those (e.g. `["/apps/explorer.run"]`),
  by order of preference.

### `/userdata/`

The root directory where the user can do whatever it wants: read/write.

### `/userconfig/`

A directory that can be used by the desktop (probably not app, even if rights
are permissive in it) to configure some things.

For example the desktop app icons may be updated at any time, and a
`/userconfig/desktop.config.json` file will reflect what the user last
configured.

Those files can also be manually updated through an editor if the user wants to
discover how much they can hack things around, which is also the point!
