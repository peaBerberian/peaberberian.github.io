const textDecoder = new TextDecoder();

/**
 * This is just an application which displays other applications and files
 * listed in arguments.
 * @param {Array.<Object>} args - The application arguments,
 * @param {Object} env - Util functions coming from the environment
 * @param {function(string, string):undefined} env.updateTitle - Update the
 * title of the current application. First argument is the icon, second is the
 * title.
 * @param {Function} env.open - API allowing to open new files and applications.
 * @returns {Promise.<Object>}
 */
export async function create(args = [], env) {
  const apps = [];
  for (const opt of args) {
    if (opt.type === "options" && opt.icon && opt.title) {
      env.updateTitle(opt.icon, "Apps: " + opt.title);
    } else if (opt.type === "file" && opt.data) {
      apps.push(JSON.parse(textDecoder.decode(opt.data)));
    }
  }

  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    backgroundColor: "var(--app-primary-bg)",
    height: "100%",
    width: "100%",
    overflowY: "auto",
    color: "var(--window-text-color)",
    padding: "10px",
  });
  const iconsContainerElt = document.createElement("div");
  applyStyle(iconsContainerElt, {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 100px)",
    gap: "5px",
    overflowX: "hidden",
    justifyContent: "space-evenly",
  });
  containerElt.appendChild(iconsContainerElt);

  // Prevent annoying random selection when clicking fast.
  containerElt.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });
  containerElt.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });

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
          env.open(app, []);
        } else {
          clickCount = 1;
          lastClickTs = performance.now();
        }
      } else {
        clickCount = 0;
        env.open(app, []);
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

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
