# Paul's Web Desktop

This is my personal website, which takes the form of a desktop environment,
done with no external library nor dependency (besides a JS bundler to produce
efficient bundles).

![screenshot of this desktop](./screenshot.png)
_showing off my pong skills_

## Idea behind this project

It was started as yet another OS-like portfolio website, though I realized that
I was having too much fun implementing the desktop parts and that I didn't
actually want to work on the portfolio aspects of that website at all!

So I deviated from this by instead doing some kind of web desktop environment
proof-of-concept.

## Implementation choices

After playing with multiple ideas, I've taken the following technical choices
here that I find interesting:

- Applications (`./apps/`), here called "apps", are totally separated from the
  desktop code (`./src/`) and do not share any code besides what the desktop
  may provide to them.

  They are lazily loaded through dynamic imports by the desktop when the
  application first needs to be run. They can receive arguments and call API
  that the desktop communicated to them.

  They return the content of their own app only, and optionally some other
  methods linked to their lifecycle (e.g. `onActivate`, `onDeactivate`...).

- I also started implementing a permission-like system (here called
  `dependencies`) where apps declare in advance what they will need and the
  desktop will choose to give them interfaces to those or not (e.g. "filesystem"
  access, desktop settings access, able to open other applications and files
  etc.)

  That permission system has some modern concepts, most notably an application
  may have access to a file-picker to open and save files, but no direct access
  to the filesystem.
  The resulting application will never see paths nor the organization of files
  (only the file-picker, another application, will), just data and filenames for
  files the user explicitly chose to open through the file-picker.

  Though because the next point is not yet finished, applications can today
  theoretically be able to escape that limitation if motivated enough (e.g.
  by reimplementing the whole filesystem logic).

- A next step would be to run most applications in "sandboxed" iframes, to
  ensure that their permissions can never be escaped and to also prevent a
  misbehaving application from hanging the whole "system".

  I tested this, it works as intended, but I did not actually fully implement it
  for now... There's work to do like communication between iframe and the
  desktop, and I focused for now on other, more visible, stuff!

- I ended up implementing an "executable" format: a JS object that can be
  serialized to JSON which contains metadata about the app and how to run it.

  The desktop actually runs applications by running those executables after
  reading them from the filesystem (read next point).

  This makes it possible to "install" applications (by adding them to the
  file system) and to let applications run other applications when they
  have the permission (e.g. the file explorer runs applications when you
  launch them from their location in the filesystem).

- I implemented a "filesystem", mostly backed by [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)-based
  storage.

  It is influenced by how things work on unix-like systems for familiarity
  reasons: the root directory is `/` with a "user" directory in it
  (`/userdata/`) and some directories with virtual files (not actually on
  disk, and computed at read time).

- As we're on the web platform, we do not have much control over memory and
  performance. At first I thought this would become ugly very quick but until
  now it seems to hold up pretty well with the following strategies:

  1. I tried to be very careful to avoid repaints at unwanted times, by
     choosing well the DOM API that I call, and by being careful in how I'm
     updating the DOM.

  2. When large rendering updates occur (e.g. during a window resize), I ensure
     that it needs to be re-rendered in JS before doing the updates (all in the
     same scheduled animation frame when possible).

  3. Complex animations are all done in CSS only.

  4. Memory-wise, I just try to be careful with event listeners, what data
     I keep around, and just stood memory conscious. Turns out the job
     of window management itself does not necessitate a lot of memory.

  5. I rely on the browser/user-agent for most things. They already implement
     very well a lot of the stuff needed and thus here do all the
     low-to-medium-level heavy lifting: CSS (an extremely expressive and capable
     tool), font/image rendering etc.

     Seeing the simplicity with which complex ideas could be quickly implemented
     efficiently is what dragged me to this rabbit hole of implementing a desktop.

  6. In all honesty, I didn't yet finish everything, especially the
     application-in-iframe-sandbox idea, which may or may not have a visible
     impact (I could see it going either way, to test with actual cases).

- I'm still unsure of how to do keyboard shortcuts, as we're running on top of an
  environment with already its fair share of it: the OS, the browser, and
  maybe browser extensions (as a vimium user, I heavily dislike websites catching
  random keys!). Also, the page could theoretically run in all kind of devices
  with different interfaces (keyboard, touch, TV remote, game controller...).

  For now, I only "catch" keys when it should be obvious (Escape key to abort
  some stuff, navigation keys in some situations...), but keyboard shortcuts are
  so linked to window managers that I think I'll need to work more on it at
  some point.

  My current idea is to just let the user declare them in the "settings app"
  (not done yet).

- For now I implemented a common UI design for most applications, which all
  respect the current theme chosen in the settings by relying on CSS variables.

  Though apps sometimes do have to explicitly write the CSS variable names in
  their code. I'm still iterating on this as I don't think this is the best
  solution yet.

- The icons in the desktop, the start menu, the taskbar and application windows
  (but not the application launcher relying on it) are all "components" with a
  simple enough API that could theoretically be implemented differently (e.g. a
  "dock" instead of a taskbar).

  I didn't give too much time yet on how this could be replaced though.
