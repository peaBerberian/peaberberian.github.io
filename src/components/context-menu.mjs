import { BUTTONS_BY_NAME } from "../constants.mjs";
import { addAbortableEventListener, applyStyle } from "../utils.mjs";

const contextMenuWrapper = document.getElementById("context-menu-wrapper");

// TODO: up/down navigation
export default function setUpContextMenu({
  actions,
  element,
  filter,
  abortSignal,
}) {
  const contextMenuElt = document.createElement("div");
  contextMenuElt.className = "context-menu";

  const filterMap = new WeakMap();

  function createButtonElt(svg, title, height = "1.7rem", onClick) {
    const buttonWrapperElt = document.createElement("span");
    applyStyle(buttonWrapperElt, {
      display: "flex",
      height: "100%",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "8px",
    });
    const svgWrapperElt = document.createElement("span");
    applyStyle(svgWrapperElt, {
      height: height,
    });
    const buttonSvgElt = getSvg(svg);
    if (buttonSvgElt) {
      applyStyle(buttonSvgElt, {
        width: "1.7rem",
        height: "100%",
        // flex: "0 0 auto",
      });
      svgWrapperElt.appendChild(buttonSvgElt);
    }
    svgWrapperElt.className = "context-icon";
    buttonWrapperElt.appendChild(svgWrapperElt);
    buttonWrapperElt.onclick = (e) => {
      if (buttonWrapperElt.classList.contains("disabled")) {
        return;
      }
      return onClick(e);
    };
    buttonWrapperElt.onkeydown = (e) => {
      if (buttonWrapperElt.classList.contains("disabled")) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        return onClick(e);
      }
    };
    const titleElt = document.createElement("span");
    titleElt.textContent = title;
    buttonWrapperElt.appendChild(titleElt);
    // titleElt.className = "w-tool-title";
    buttonWrapperElt.setAttribute("tabindex", "0");
    return buttonWrapperElt;
  }

  actions.forEach((actionData) => {
    if (actionData.name === "separator") {
      const separatorElt = document.createElement("span");
      applyStyle(separatorElt, {
        height: "1px",
        margin: "0px 10px",
        borderBottom: "1px dotted var(--sidebar-hover-bg)",
      });
      contextMenuElt.appendChild(separatorElt);
      if (actionData.filter) {
        filterMap.set(separatorElt, actionData.filter);
      }
    } else {
      const defaultButtonConfig = BUTTONS_BY_NAME[actionData.name] ?? [];
      const contextMenuItemElt = createButtonElt(
        actionData.svg ?? defaultButtonConfig.svg ?? "",
        actionData.title ?? defaultButtonConfig.defaultTitle ?? "",
        actionData.height ?? defaultButtonConfig.height,
        (e) => {
          e.preventDefault();
          actionData.onClick();
          closeContextMenu();
        },
      );
      contextMenuItemElt.tabIndex = "0";
      contextMenuItemElt.className = "context-menu-item";
      if (actionData.filter) {
        filterMap.set(contextMenuItemElt, actionData.filter);
      }
      contextMenuElt.appendChild(contextMenuItemElt);
    }
  });

  element.addEventListener("contextmenu", (e) => {
    if (filter && !filter(e)) {
      return;
    }
    e.preventDefault();

    contextMenuWrapper.innerHTML = "";
    contextMenuWrapper.appendChild(contextMenuElt);
    contextMenuWrapper.style.display = "block";

    for (const child of contextMenuElt.children) {
      const filter = filterMap.get(child);
      if (!filter || filter()) {
        child.style.display = "flex";
      } else {
        child.style.display = "none";
      }
    }

    if (e.pageX + 3 + contextMenuElt.offsetWidth > document.body.clientWidth) {
      if (e.pageX - 3 - contextMenuElt.offsetWidth >= 0) {
        contextMenuElt.style.left =
          e.pageX - 3 - contextMenuElt.offsetWidth + "px";
      } else {
        contextMenuElt.style.left = "0px";
      }
    } else {
      contextMenuElt.style.left = e.pageX + 3 + "px";
    }

    if (
      e.pageY + 3 + contextMenuElt.offsetHeight >
      document.body.clientHeight
    ) {
      if (e.pageY - 3 - contextMenuElt.offsetHeight >= 0) {
        contextMenuElt.style.top =
          e.pageY - 3 - contextMenuElt.offsetHeight + "px";
      } else {
        contextMenuElt.style.top = "0px";
      }
    } else {
      contextMenuElt.style.top = e.pageY + 3 + "px";
    }
    requestAnimationFrame(() => {
      contextMenuElt.classList.add("show");
    });
  });

  contextMenuElt.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (action) {
      handleAction(action);
      closeContextMenu();
    }
  });

  addAbortableEventListener(document, "keydown", abortSignal, (e) => {
    if (e.key === "Escape") {
      if (contextMenuElt.classList.contains("show")) {
        closeContextMenu();
      }
    }
  });
  addAbortableEventListener(document, "mousedown", abortSignal, (e) => {
    if (!contextMenuWrapper.contains(e.target)) {
      closeContextMenu();
    }
  });
  addAbortableEventListener(document, "click", abortSignal, closeContextMenu);
  addAbortableEventListener(window, "resize", abortSignal, closeContextMenu);
  function closeContextMenu() {
    contextMenuElt.classList.remove("show");
    contextMenuElt.remove();
    contextMenuElt.style.left = "";
    contextMenuElt.style.top = "";
    contextMenuWrapper.innerHTML = "";
    contextMenuWrapper.display = "none";
  }
}

function getSvg(svg) {
  const svgWrapperElt = document.createElement("div");
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}
