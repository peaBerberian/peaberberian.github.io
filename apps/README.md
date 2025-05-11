# Apps

This directory regroups "apps" that can be loaded by this desktop.

Most are lazily loaded (only loaded once the corresponding application is
opened) with only their metadata defined in `AppInfo.json` known by the
initial JS bundle.

Our build script then generates a JS file automatically, for now relying on ES6
dynamic imports.

Apps have to follow a particular syntax where they have to export either a
`create` function returning at least an `element` `HTMLElement` property or a
`sidebar` array. You can look at the apps already here for more information.

## AppUtils

Many apps rely on common utils defined by the desktop in a global `AppUtils`
Object.

You can look at `../src/app-utils.mjs` for more information on what utils there
is.
