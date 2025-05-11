/**
 * This is just an application which displays other applications and files
 * listed in arguments.
 *
 * To run it, provide to it as arguments:
 *
 *   1. The title wanted for that application, including the icon as a first
 *      character
 *
 *   2. Then a variable numbers of paths to the applications or files that
 *      should be listed in this application group.
 * @param {Array.<string>} args - The application arguments, as documented
 * above.
 * @param {Object} env - Util functions coming from the environment
 * @param {Object} env.filesystem
 * @param {Object} env.appUtils
 * @param {function(string, Array.<string>):undefined} env.open
 * @param {function(HTMLElement, Object):undefined} env.appUtils.applyStyle -
 * Util function allowing to apply multiple CSS rules at once on an
 * `HTMLElement`.
 * @returns {Promise.<Object>}
 */
export async function create(args, env) {
  const applyStyle = env.appUtils.applyStyle;
  if (args.length > 0) {
    env.updateTitle(args[0]);
  }
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    // backgroundColor: "var(--window-sidebar-bg)",
    backgroundColor: "var(--app-primary-bg)",
    height: "100%",
    width: "100%",
    overflowY: "auto",
    color: "var(--window-text-color)",
    padding: "10px",
  });
  const iconsContainerElt = document.createElement("div");
  applyStyle(iconsContainerElt, {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    alignItems: "center",
  });
  containerElt.appendChild(iconsContainerElt);

  const appPaths = args.slice(1);
  const appProms = appPaths.map((a) => env.filesystem.readFile(a, "object"));
  const apps = await Promise.all(appProms);
  const icons = [];
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    const icon = document.createElement("span");
    icons.push(icon);
    iconsContainerElt.appendChild(icon);

    applyStyle(icon, {
      cursor: "pointer",
      justifyContent: "flex-start",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "background-color 0.2s",
      borderRadius: "5px",
      padding: "5px",
      width: "105px",
      height: "105px",
      overflow: "hidden",
    });
    const iconImgElt = document.createElement("span");
    applyStyle(iconImgElt, {
      width: "50px",
      height: "50px",
      borderRadius: "5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "30px",
      margin: "5px 0px",
    });
    iconImgElt.textContent = app.icon;
    const iconTextElt = document.createElement("span");
    applyStyle(iconTextElt, {
      fontSize: "var(--font-size)",
      textAlign: "center",
      textOverflow: "ellipsis",
      whiteSpace: "normal",
      lineHeight: "1.2",
      overflow: "hidden",
      margin: "auto",
      display: "-webkit-box",
      webkitLineClamp: "2",
      webkitBoxOrient: "vertical",
      paddingBottom: "7px",
    });
    iconTextElt.textContent = app.title;
    icon.appendChild(iconImgElt);
    icon.appendChild(iconTextElt);

    let clickCount = 0;
    let lastClickTs = -Infinity;
    icon.addEventListener("click", (evt) => {
      if (evt.pointerType === "mouse") {
        selectIcon(icon);

        // Double click to open app
        if (clickCount && performance.now() - lastClickTs < 300) {
          clickCount = 0;
          env.open(appPaths[i], []);
        } else {
          clickCount = 1;
          lastClickTs = performance.now();
        }
      } else {
        clickCount = 0;
        env.open(appPaths[i], []);
      }
    });
    icon.addEventListener("mouseover", () => {
      icon.style.backgroundColor = "var(--sidebar-hover-bg)";
    });

    icon.addEventListener("mouseout", () => {
      if (icon.classList.contains("selected")) {
        icon.style.backgroundColor = "var(--sidebar-selected-bg-color)";
      } else {
        icon.style.backgroundColor = "transparent";
      }
    });
  }
  return { element: containerElt };

  /**
   * @param {HTMLElement} icon
   */
  function selectIcon(icon) {
    for (const i of icons) {
      i.style.backgroundColor = "transparent";
      i.style.color = "inherit";
      i.classList.remove("selected");
    }
    icon.classList.add("selected");
    icon.style.backgroundColor = "var(--sidebar-selected-bg-color)";
    icon.style.color = "var(--sidebar-selected-text-color)";
  }
}
