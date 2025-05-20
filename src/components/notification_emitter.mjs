import { applyStyle } from "../utils.mjs";

const DEFAULT_NOTIF_DURATION = 8000;
const NOTIF_STYLE = {
  success: {
    icon: "✓",
    background: "linear-gradient(135deg, #10b981, #059669)",
    borderColor: "#047857",
  },
  error: {
    icon: "😿",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    borderColor: "#b91c1c",
  },
  warning: {
    icon: "⚠",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    borderColor: "#b45309",
  },
  info: {
    icon: "ℹ",
    background: "var(--app-primary-color)",
    color: "var(--window-content-bg)",
    borderColor: "#1d4ed8",
  },
};

const generateNewId = idGenerator();

export class NotificationEmitter {
  constructor() {
    this._notifs = [];
    this.container = document.createElement("div");
    applyStyle(this.container, {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: "10000",
      maxHeight: "100vh",
      overflow: "hidden",
      pointerEvents: "none",
    });
    document.body.appendChild(this.container);
  }

  clear() {
    this._notifs.forEach((notification) => {
      applyStyle(notification.element, {
        transform: "translateX(100%)",
        opacity: "0",
      });
    });

    setTimeout(() => {
      this._notifs.forEach((notification) => {
        if (notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
      });
      this._notifs = [];
    }, 300);
  }

  success(title, message, duration) {
    return this._addNotif("success", title, message, duration);
  }

  error(title, message, duration) {
    return this._addNotif("error", title, message, duration);
  }

  warning(title, message, duration) {
    return this._addNotif("warning", title, message, duration);
  }

  info(title, message, duration) {
    return this._addNotif("info", title, message, duration);
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this._notifs = [];
  }

  _addNotif(type, title, message, duration = DEFAULT_NOTIF_DURATION) {
    const id = generateNewId();
    const config = NOTIF_STYLE[type] ?? NOTIF_STYLE.info;

    const notification = {
      id,
      type,
      title,
      message,
      timestamp: Date.now(),
      duration,
      element: this._createNewNotif(config, title, message, id),
    };

    this._notifs.push(notification);
    this.container.appendChild(notification.element);

    setTimeout(() => {
      applyStyle(notification.element, {
        transform: "translateX(0)",
        opacity: "1",
      });
    }, 10);

    if (duration > 0) {
      setTimeout(() => {
        this._removeNotif(id);
      }, duration);
    }

    return id;
  }

  _removeNotif(id) {
    const notification = this._notifs.find((n) => n.id === id);
    if (!notification) return;

    applyStyle(notification.element, {
      transform: "translateX(100%)",
      opacity: "0",
    });

    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      this._notifs = this._notifs.filter((n) => n.id !== id);
    }, 300);
  }

  _createNewNotif(config, title, message, id) {
    const notifElt = document.createElement("div");

    applyStyle(notifElt, {
      background: config.background,
      // borderLeft: `4px solid ${config.borderColor}`,
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      padding: "16px",
      marginBottom: "12px",
      minWidth: "min(calc(90vw - 16px), 400px)",
      maxWidth: "320px",
      backdropFilter: "blur(10px)",
      color: config.color ?? "white",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transform: "translateX(100%)",
      opacity: "0",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      pointerEvents: "auto",
    });

    const headerElt = document.createElement("div");
    applyStyle(headerElt, {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "8px",
    });

    const iconTitleElt = document.createElement("div");
    applyStyle(iconTitleElt, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flex: "1",
    });

    const iconElt = document.createElement("span");
    iconElt.textContent = config.icon;
    applyStyle(iconElt, {
      fontSize: "16px",
      fontWeight: "bold",
      flexShrink: "0",
    });

    const titleElt = document.createElement("h4");
    titleElt.textContent = title;
    applyStyle(titleElt, {
      fontSize: "14px",
      fontWeight: "600",
      margin: "0",
      wordBreak: "break-word",
    });

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    applyStyle(closeBtn, {
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      borderRadius: "4px",
      color: "white",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      height: "24px",
      width: "24px",
      marginLeft: "8px",
      transition: "background 0.2s",
      flexShrink: "0",
    });

    closeBtn.addEventListener("mouseenter", () => {
      applyStyle(closeBtn, {
        background: "rgba(255, 255, 255, 0.3)",
      });
    });

    closeBtn.addEventListener("mouseleave", () => {
      applyStyle(closeBtn, {
        background: "rgba(255, 255, 255, 0.2)",
      });
    });

    closeBtn.addEventListener("click", () => {
      this._removeNotif(id);
    });

    const messageElt = document.createElement("p");
    // Just handle line breaks simply for now
    const splittedMsg = message?.split("\n") ?? [];
    for (let i = 0; i < splittedMsg.length; i++) {
      if (i > 0) {
        messageElt.appendChild(document.createElement("br"));
      }
      messageElt.appendChild(document.createTextNode(splittedMsg[i]));
    }
    applyStyle(messageElt, {
      fontSize: "13px",
      margin: "0",
      opacity: "0.9",
      wordBreak: "break-word",
      lineHeight: "1.4",
    });

    const timestampElt = document.createElement("p");
    timestampElt.textContent = new Date().toLocaleTimeString();
    applyStyle(timestampElt, {
      fontSize: "11px",
      margin: "8px 0 0 0",
      opacity: "0.7",
    });

    iconTitleElt.appendChild(iconElt);
    iconTitleElt.appendChild(titleElt);
    headerElt.appendChild(iconTitleElt);
    headerElt.appendChild(closeBtn);

    notifElt.appendChild(headerElt);
    notifElt.appendChild(messageElt);
    notifElt.appendChild(timestampElt);

    return notifElt;
  }
}

export default new NotificationEmitter();

/**
 * Creates an ID generator which generates a number containing an incremented
 * number each time you call it.
 * @returns {Function}
 */
function idGenerator() {
  let prefix = "";
  let currId = -1;
  return function generateNewId() {
    currId++;
    if (currId >= Number.MAX_SAFE_INTEGER) {
      prefix += "0";
      currId = 0;
    }
    return prefix + String(currId);
  };
}
