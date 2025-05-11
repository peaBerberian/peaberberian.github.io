import { applyStyle } from "./utils.mjs";

export default function generateAppGroup(name, apps, onOpen) {
  let icon = "💽";
  if (name === "External Apps") {
    icon = "📡";
  }
  return {
    id: `__dir-${name}`,
    title: name,
    icon,
    data: {
      create: (abortSignal) => createApp(apps, onOpen, abortSignal),
    },
    // TODO: calculate from number of apps?
    defaultHeight: 400,
    defaultWidth: 460,
  };
}

function createApp(apps, onOpen) {
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
  const icons = [];
  for (const app of apps) {
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
          onOpen(app.run);
        } else {
          clickCount = 1;
          lastClickTs = performance.now();
        }
      } else {
        clickCount = 0;
        onOpen(app.run);
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
