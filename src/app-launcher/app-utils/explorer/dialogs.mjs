import {
  applyStyle,
  disableButton,
  enableHighlightedButton,
  pathJoin,
} from "./utils.mjs";

export function askUserForUpload(fs, currentPath) {
  return new Promise((resolve, reject) => {
    const fileInputElt = document.createElement("input");
    fileInputElt.style.display = "none";
    fileInputElt.type = "file";
    fileInputElt.multiple = true;
    fileInputElt.click();

    fileInputElt.addEventListener("cancel", async () => {
      resolve([]);
    });

    fileInputElt.addEventListener("error", async () => {
      reject(new Error(`Failed to get files from your computer.`));
    });

    fileInputElt.addEventListener("change", async (e) => {
      const files = e.target.files;
      if (files.length === 0) {
        resolve([]);
      }
      try {
        const names = [];
        for (const file of files) {
          names.push(file.name);
          const filePath = pathJoin(currentPath, file.name);
          const fileAB = await file.arrayBuffer();
          await fs.writeFile(filePath, fileAB);
        }
        resolve(names);
      } catch (error) {
        reject(new Error(`Failed to upload file: ${error.message}`));
      }
    });
  });
}

export async function askForUserInput(
  containerElt,
  title,
  message,
  defaultValue = "",
) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    applyStyle(overlay, {
      position: "absolute",
      inset: "0px",
      backgroundColor: "var(--window-content-bg)",
      opacity: "0.5",
      zIndex: "2",
      height: "100%",
      width: "100%",
    });
    containerElt.appendChild(overlay);

    const promptInputElt = document.createElement("input");
    promptInputElt.type = "text";
    promptInputElt.value = defaultValue;
    applyStyle(promptInputElt, {
      width: "100%",
      padding: "8px",
      marginBottom: "15px",
    });
    const cancelButtonElt = document.createElement("button");
    cancelButtonElt.className = "btn";
    cancelButtonElt.textContent = "Cancel";
    applyStyle(cancelButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    const okButtonElt = document.createElement("button");
    okButtonElt.className = "btn";
    okButtonElt.textContent = "OK";
    applyStyle(okButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    disableButton(okButtonElt);

    const titleElt = document.createElement("h3");
    applyStyle(titleElt, {
      color: "var(--app-primary-color)",
      marginTop: "0",
      marginBottom: "15px",
    });
    titleElt.textContent = title;

    const messageElt = document.createElement("p");
    applyStyle(messageElt, {
      marginBottom: "15px",
    });
    messageElt.textContent = message;

    const innerElt = document.createElement("div");
    applyStyle(innerElt, {
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
      position: "relative",
      padding: "20px",
      border: "1px solid var(--window-line-color)",
      zIndex: "3",
      backgroundColor: "var(--window-content-bg)",
      top: "50%",
      transform: "translateY(-50%)",
      maxWidth: "90%",
      width: "35em",
      margin: "auto",
    });
    innerElt.appendChild(titleElt);
    innerElt.appendChild(messageElt);
    innerElt.appendChild(promptInputElt);
    const buttonsContainerElt = document.createElement("div");
    applyStyle(buttonsContainerElt, {
      display: "flex",
      justifyContent: "flex-end",
    });
    buttonsContainerElt.appendChild(cancelButtonElt);
    buttonsContainerElt.appendChild(okButtonElt);
    innerElt.appendChild(buttonsContainerElt);
    containerElt.appendChild(innerElt);

    promptInputElt.focus();
    promptInputElt.select();

    okButtonElt.addEventListener("click", onOk);
    cancelButtonElt.addEventListener("click", onCancel);

    promptInputElt.oninput = () => {
      if (promptInputElt.value) {
        enableHighlightedButton(okButtonElt);
      } else {
        disableButton(okButtonElt);
      }
    };

    promptInputElt.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        onOk();
      }
      if (e.key === "Escape") {
        onCancel();
      }
    });
    overlay.onclick = () => resolve(null);

    function onOk() {
      overlay.remove();
      innerElt.remove();
      resolve(promptInputElt.value);
    }

    function onCancel() {
      overlay.remove();
      innerElt.remove();
      resolve(null);
    }
  });
}

export async function spawnConfirmDialog(containerElt, title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    applyStyle(overlay, {
      position: "absolute",
      inset: "0px",
      backgroundColor: "var(--window-content-bg)",
      opacity: "0.5",
      zIndex: "2",
      height: "100%",
      width: "100%",
    });
    containerElt.appendChild(overlay);

    const noButtonElt = document.createElement("button");
    noButtonElt.className = "btn";
    noButtonElt.textContent = "No";
    applyStyle(noButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    const yesButtonElt = document.createElement("button");
    yesButtonElt.className = "btn";
    yesButtonElt.textContent = "Yes";
    applyStyle(yesButtonElt, {
      margin: "5px",
      padding: "4px 15px",
      fontSize: "1.1em",
      fontWeight: "bold",
    });
    enableHighlightedButton(yesButtonElt);

    const titleElt = document.createElement("h3");
    applyStyle(titleElt, {
      color: "var(--app-primary-color)",
      marginTop: "0",
      marginBottom: "15px",
    });
    titleElt.textContent = title;

    const messageElt = document.createElement("div");
    applyStyle(messageElt, {
      marginBottom: "10px",
    });
    messageElt.textContent = message;

    const innerElt = document.createElement("div");
    applyStyle(innerElt, {
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
      position: "relative",
      padding: "20px",
      border: "1px solid var(--window-line-color)",
      zIndex: "3",
      backgroundColor: "var(--window-content-bg)",
      top: "50%",
      transform: "translateY(-50%)",
      maxWidth: "90%",
      width: "35em",
      margin: "auto",
    });
    innerElt.appendChild(titleElt);
    innerElt.appendChild(messageElt);
    const buttonsContainerElt = document.createElement("div");
    applyStyle(buttonsContainerElt, {
      display: "flex",
      justifyContent: "center",
    });
    buttonsContainerElt.appendChild(noButtonElt);
    buttonsContainerElt.appendChild(yesButtonElt);
    innerElt.appendChild(buttonsContainerElt);
    containerElt.appendChild(innerElt);

    yesButtonElt.addEventListener("click", onYes);
    noButtonElt.addEventListener("click", onNo);
    overlay.onclick = () => resolve(null);
    yesButtonElt.focus();

    function onYes() {
      overlay.remove();
      innerElt.remove();
      resolve(true);
    }

    function onNo() {
      overlay.remove();
      innerElt.remove();
      resolve(false);
    }
  });
}
