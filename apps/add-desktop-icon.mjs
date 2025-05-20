export function create(_args, env) {
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    position: "relative",
    height: "100%",
    overflow: "hidden",
    width: "100%",
    backgroundColor: "var(--window-content-bg)",
  });
  const spinnerContainerElt = document.createElement("div");
  applyStyle(spinnerContainerElt, {
    display: "none",
    position: "absolute",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  });
  const spinnerElt = document.createElement("div");
  spinnerElt.className = "spinner";
  spinnerContainerElt.appendChild(spinnerElt);
  containerElt.appendChild(spinnerContainerElt);
  spinnerContainerElt.style.display = "flex";
  env
    .filePickerOpen({
      title: "Choose apps or files that should be added as desktop shortcuts",
      allowMultipleSelections: true,
      baseDirectory: "/apps/",
      confirmValue: "Add to desktop",
    })
    .then(
      async (files) => {
        if (files.length === 0) {
          env.closeApp();
          return;
        }

        const newIcons = [];
        try {
          for (const file of files) {
            if (file.filename.endsWith(".run")) {
              // Executable: parse executable format to get rigth title+icon
              const data = await env.filesystem.readFile(
                file.filePath,
                "object",
              );
              newIcons.push({
                run: file.filePath,
                args: [],
                title: data.title,
                icon: data.icon,
              });
            } else {
              // Regular file: don't bother with icon and title for now
              newIcons.push({
                run: file.filePath,
                args: [],
                title: file.filename,
                icon: file.filename[0],
              });
            }
          }
          const baseConfig = await env.filesystem.readFile(
            "/userconfig/desktop.config.json",
            "object",
          );
          baseConfig.list.push(...newIcons);
          await env.filesystem.writeFile(
            "/userconfig/desktop.config.json",
            JSON.stringify(baseConfig, null, 2),
          );
          env.notificationEmitter.success(
            "Desktop icons",
            "Added new desktop icons with success!",
          );
        } catch (err) {
          env.notificationEmitter.error(
            "Failed to add desktop icon",
            "Failed to update icons: " + err.toString(),
          );
        }
        spinnerContainerElt.style.display = "none";
        env.closeApp();
      },
      (err) => {
        env.notificationEmitter.error(
          "Failed to add desktop icon",
          "The file picker encountered an issue: " + err.toString(),
        );
        env.closeApp();
      },
    );

  return {
    element: containerElt,
  };
}

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
export function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
