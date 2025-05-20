import { createCheckboxOnRef } from "./utils.mjs";
import strHtml from "./str-html.mjs";

export default function createStorageSection(
  { filesystem, settings, appUtils, notificationEmitter },
  abortSignal,
) {
  const { createAppTitle } = appUtils;
  const section = strHtml`<div>${createAppTitle("Storage", {})}</div>`;
  section.dataset.section = "storage";

  const localStorageGrpElt = strHtml`<div class="w-group"><h3>User Settings</h3></div>`;
  // Oops did not think too much about this new case of a sub-h3...
  // Well, just hack around with CSS for now (what could go wrong?)!
  localStorageGrpElt.appendChild(
    strHtml`<i style="position:relative;font-size:0.95em;top:-8px">${'Note: User settings include only what\'s configurable in the current "Settings" application.'}</i>`,
  );

  const localStorageSpaceUsgElt = document.createElement("span");
  localStorageSpaceUsgElt.textContent = formatSize(estimateLocalStorageSize());
  localStorageGrpElt.appendChild(strHtml`<div class="w-small-opt">
	<span class="w-small-opt-desc">localStorage usage estimate</span>
${localStorageSpaceUsgElt}
</div>`);

  // Just poll that one, it's a tiny thing
  const itv = setInterval(() => {
    localStorageSpaceUsgElt.textContent = formatSize(
      estimateLocalStorageSize(),
    );
  }, 1000);
  abortSignal.addEventListener("abort", () => {
    clearInterval(itv);
  });

  localStorageGrpElt.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.persistSettings,
        label: "Persist user settings (in localStorage)",
      },
      abortSignal,
    ),
  );
  const resetButtonElt = document.createElement("button");
  resetButtonElt.className = "btn";
  resetButtonElt.textContent = "Reset";
  resetButtonElt.onclick = () => {
    settings.resetStateToDefault();
  };
  localStorageGrpElt.appendChild(strHtml`<div class="w-small-opt">
	<span class="w-small-opt-desc">Reset to original settings</span>
	${resetButtonElt}
</div>`);
  section.appendChild(localStorageGrpElt);

  const userDataGrpElt = strHtml`<div class="w-group"><h3>User data</h3></div>`;
  userDataGrpElt.appendChild(
    strHtml`<i style="position:relative;font-size:0.95em;top:-8px">Note: User data includes application data, data you locally saved, as well as advanced configuration such as desktop icons customization.</i>`,
  );

  const indexedDBSpaceUsgElt = document.createElement("span");
  indexedDBSpaceUsgElt.textContent = "Calculating...";
  userDataGrpElt.appendChild(strHtml`<div class="w-small-opt">
	<span class="w-small-opt-desc">IndexedDB usage estimate</span>
<span>${indexedDBSpaceUsgElt}${createRecheckButton(reCheckStorage)}</span>
</div>`);
  reCheckStorage();
  function reCheckStorage() {
    indexedDBSpaceUsgElt.textContent = "Calculating...";
    filesystem.getUsageEstimate().then(
      (estimate) => {
        indexedDBSpaceUsgElt.textContent = formatSize(estimate);
      },
      (err) => {
        console.error("Impossible to get IndexedDB estimate:", err);
        indexedDBSpaceUsgElt.textContent = "Could not produce estimate :/";
      },
    );
  }

  userDataGrpElt.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.performFileSystemCheckAtStartup,
        label: "Do filesystem integrity check at startup",
      },
      abortSignal,
    ),
  );

  userDataGrpElt.appendChild(
    createCheckboxOnRef(
      {
        ref: settings.storeNewDataInIndexedDB,
        label:
          "Authorize creation of new files (⚠️ Many features are lost when disabling this)",
      },
      abortSignal,
    ),
  );

  const formatButtonElt = document.createElement("button");
  formatButtonElt.className = "btn";
  formatButtonElt.textContent = "Format";
  formatButtonElt.onclick = async () => {
    try {
      await filesystem.format();
      notificationEmitter.success("Storage", "Storage formatted with success!");
    } catch (err) {
      notificationEmitter.error(
        "Storage",
        "Failed to format storage: " + err.toString(),
      );
    }
    reCheckStorage();
  };
  userDataGrpElt.appendChild(strHtml`<div class="w-small-opt">
	<span class="w-small-opt-desc">Format IndexedDB storage</span>
	${formatButtonElt}
</div>`);

  const integrityButtonElt = document.createElement("button");
  integrityButtonElt.className = "btn";
  integrityButtonElt.textContent = "Check and repair";
  integrityButtonElt.onclick = async () => {
    try {
      await filesystem.repair();
      // TODO: report?
      notificationEmitter.success("Storage", "Integrity check done!");
    } catch (err) {
      notificationEmitter.error(
        "Storage",
        "Failed to check integrity: " + err.toString(),
      );
    }
    reCheckStorage();
  };
  userDataGrpElt.appendChild(strHtml`<div class="w-small-opt">
	<span class="w-small-opt-desc">Run integrity checks</span>
	${integrityButtonElt}
</div>`);
  section.appendChild(userDataGrpElt);
  return section;
}

export function formatSize(size) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;

  while (size >= 1000 && i < units.length - 1) {
    size /= 1000;
    i++;
  }

  return Math.round(size * 100) / 100 + " " + units[i];
}

function createRecheckButton(onClick) {
  const reCheckBtn = document.createElement("span");
  reCheckBtn.tabIndex = "0";
  reCheckBtn.ariaLabel = "Re-check";
  reCheckBtn.title = "Re-check";
  reCheckBtn.style.cursor = "pointer";
  reCheckBtn.style.marginLeft = "5px";
  reCheckBtn.innerHTML = `<svg width="800px" height="800px" viewBox="-1 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-342.000000, -7080.000000)" fill="currentColor"><g transform="translate(56.000000, 160.000000)"><path d="M300.002921,6930.85894 C299.524118,6934.16792 296.32507,6936.61291 292.744585,6935.86392 C290.471022,6935.38792 288.623062,6933.55693 288.145263,6931.29294 C287.32919,6927.42196 290.007276,6923.99998 294.022397,6923.99998 L294.022397,6925.99997 L299.041299,6922.99998 L294.022397,6920 L294.022397,6921.99999 C289.003495,6921.99999 285.16002,6926.48297 286.158782,6931.60494 C286.767072,6934.72392 289.294592,6937.23791 292.425383,6937.8439 C297.170253,6938.7619 301.37007,6935.51592 301.990406,6931.12594 C302.074724,6930.52994 301.591905,6929.99995 300.988633,6929.99995 L300.989637,6929.99995 C300.490758,6929.99995 300.074189,6930.36694 300.002921,6930.85894"></path></g></g></g></svg>`;
  reCheckBtn.children[0].style.height = "1em";
  reCheckBtn.children[0].style.width = "1em";
  reCheckBtn.onclick = onClick;
  return reCheckBtn;
}

function estimateLocalStorageSize() {
  // NOTE: For now we'll infer that most stored data are in the ASCII
  // Range, so length * 2 as the browser is probably storing them as UTF-16
  // code units.
  // This is really a ballpark measure, that should never be a big number
  // anyway or too far from this.
  return Math.max(
    (JSON.stringify(localStorage).length -
      2) /* `{}`, there's also technically the other JSON artefacts but ain't nobody got time for that */ *
      2,
    0,
  );
}
