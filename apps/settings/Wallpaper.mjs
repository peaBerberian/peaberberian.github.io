/** Wallpapers provided by default in settings. */
export const WALLPAPERS = [
  // From Kalen Emsley (@kalenemsley from unsplash)
  "photo-1464822759023-fed622ff2c3b.jpg",

  // Jack B (@nervum on unsplash)
  "beach1.avif",

  // Irina Iriser (@iriser on unsplash)
  "forest1.avif",

  // Lucas Dalamarta (@lucasdalamartaphoto on unsplash)
  "some_ducks.avif",

  // Tim Schmidbauer (@timschmidbauer on unsplash)
  "photo-1745761412274-5303bc3f2e45.jpg",

  // Ashim D’Silva (@randomlies on unsplash)
  "photo-1479030160180-b1860951d696.jpg",

  // Benjamin Voros (@vorosbenisop on unsplash)
  "dark_mountain.avif",
];

const DEFAULT_GRADIENTS = [
  "linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)",
  "linear-gradient(to right, #2980b9, #6dd5fa, #ffffff)",
  "linear-gradient(to right, #ff8177, #ff867a, #ff8c7f, #f99185, #cf556c)",
  "linear-gradient(to right, #00b09b, #96c93d)",
  "linear-gradient(to right, #434343, #000000)",
  "linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)",
  "linear-gradient(to bottom, #1e3c72, #2a5298, #7db9e8)", // ocean
  "linear-gradient(to left, #0f2027, #203a43, #2c5364)", // dark
  "linear-gradient(135deg, #667eea, #764ba2)", // purple
];

export default function createWallpaperSection(env) {
  const { settings } = env;
  const { createAppTitle, strHtml, applyStyle } = env.appUtils;
  const section = strHtml`<div>${createAppTitle("Wallpaper", {})}</div>`;
  section.dataset.section = "wallpaper";

  const selectableWallpaperItems = [];
  const currentBackground = settings.desktopBackground.getValue();

  // =================== WALLPAPERS ====================

  const wpGroupElt = strHtml`<div class="w-group"><h3>Pre-selected Images</h3></div>`;

  let foundInBaseWallpapers = false;
  for (let i = 0; i < WALLPAPERS.length; i++) {
    const wp = env.getImageRootPath() + WALLPAPERS[i];
    const wpPreviewElt = strHtml`<img class="w-color-item selectable img-empty" src="${encodeURI(wp)}" />`;
    wpPreviewElt.onload = () => {
      window.requestAnimationFrame(() => {
        wpPreviewElt.classList.remove("img-empty");
      });
    };
    if (currentBackground.type === "image" && currentBackground.value === wp) {
      foundInBaseWallpapers = true;
      wpPreviewElt.classList.add("selected");
    }
    wpPreviewElt.onclick = () => {
      selectableWallpaperItems.forEach((wi) => {
        wi.classList.remove("selected");
      });
      wpPreviewElt.classList.add("selected");
      settings.desktopBackground.setValue({ type: "image", value: wp });
    };
    selectableWallpaperItems.push(wpPreviewElt);
    wpGroupElt.appendChild(wpPreviewElt);
  }
  section.appendChild(wpGroupElt);

  // =================== CUSTOM IMAGE ====================

  const baseUrl =
    currentBackground.type === "image" && !foundInBaseWallpapers
      ? currentBackground.value
      : "";

  const customImgInputElt = strHtml`<input type="text" class="text-input" value="${
    baseUrl
  }" placeholder="URL">`;

  const imageSpinnerElt = strHtml`<span class="spinner" style="position: relative; margin-left: -112px; margin-bottom: 35px; display:none" />`;
  let customImageTimeoutId;
  customImgInputElt.oninput = () => {
    imageSpinnerElt.style.display = "inline-block";
    if (customImageTimeoutId) {
      clearTimeout(customImageTimeoutId);
      customImageTimeoutId = undefined;
    }
    customImageTimeoutId = setTimeout(() => {
      customImgPreviewElt.src =
        customImgInputElt.value || // tiny white GIF
        "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D";
      if (customImgPreviewElt.classList.contains("selected")) {
        customImgPreviewElt.click();
      }
    }, 1100);
  };

  const customImgPreviewElt = strHtml`<img class="w-color-item img-empty selectable" src="${
    customImgInputElt.value || // tiny white GIF
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"
  }" />`;

  customImgPreviewElt.onload = () => {
    imageSpinnerElt.style.display = "none";
  };
  customImgPreviewElt.onerror = () => {
    imageSpinnerElt.style.display = "none";
  };
  if (baseUrl) {
    customImgPreviewElt.classList.add("selected");
  }
  customImgPreviewElt.onclick = () => {
    if (
      !customImgInputElt.value &&
      !customImgPreviewElt.classList.contains("selected")
    ) {
      return;
    }
    selectableWallpaperItems.forEach((wi) => {
      wi.classList.remove("selected");
    });
    customImgPreviewElt.classList.add("selected");
    settings.desktopBackground.setValue({
      type: "image",
      value: customImgInputElt.value,
    });
  };
  selectableWallpaperItems.push(customImgPreviewElt);
  const customImgGroup = strHtml`<div class="w-group"><h3>Custom Image</h3>${[
    customImgInputElt,
    strHtml`<span style="width: 230px">${[
      customImgPreviewElt,
      imageSpinnerElt,
    ]}</span>`,
  ]}</div>`;
  section.appendChild(customImgGroup);

  // =================== PLAIN COLOR ====================

  const colorGroupElt = strHtml`<div class="w-group" />`;
  const colorTitleElt = strHtml`<h3>Plain color</h3>`;
  const colorInputElt = strHtml`<input type="color" value="#1e88e5" />`;
  colorInputElt.style.visibility = "hidden";
  colorInputElt.style.height = "0px";
  const colorPreviewElt = strHtml`<div class="w-color-item selectable" />`;
  colorPreviewElt.style.background = colorInputElt.value;
  colorPreviewElt.onclick = () => colorInputElt.click();
  colorInputElt.onclick = function () {
    selectableWallpaperItems.forEach((wi) => {
      wi.classList.remove("selected");
    });
    colorPreviewElt.classList.add("selected");

    colorPreviewElt.style.background = colorInputElt.value;
    settings.desktopBackground.setValue({
      type: "color",
      value: colorInputElt.value,
    });
  };
  colorInputElt.oninput = function (evt) {
    colorPreviewElt.style.background = colorInputElt.value;
    settings.desktopBackground.setValue({
      type: "color",
      value: evt.target.value,
    });
  };
  selectableWallpaperItems.push(colorPreviewElt);
  colorGroupElt.appendChild(colorTitleElt);
  colorGroupElt.appendChild(colorPreviewElt);
  colorGroupElt.appendChild(colorInputElt);
  section.appendChild(colorGroupElt);

  // =================== GRADIENTS ====================

  const gradientGroup = strHtml`<div class="w-group" />`;
  const gradientsTitleElt = strHtml`<h3>Or... Check those beautiful gradients</h3>`;
  const gradientsGridElt = strHtml`<div class="w-grid" />`;

  for (let i = 0; i < DEFAULT_GRADIENTS.length; i++) {
    const item = strHtml`<div class="w-color-item selectable" />`;
    if (
      currentBackground.type === "color" &&
      currentBackground.value === DEFAULT_GRADIENTS[i]
    ) {
      item.classList.add("selected");
    }
    item.dataset.wallpaper = `gradient${i + 1}`;
    const gradientElt = strHtml`<div alt="Gradient ${i + 1}" class="img-gradient${i + 1}" />`;
    applyStyle(gradientElt, {
      background: DEFAULT_GRADIENTS[i],
      height: "100%",
      width: "100%",
    });
    item.appendChild(gradientElt);
    gradientsGridElt.appendChild(item);
    selectableWallpaperItems.push(item);
    item.onclick = function () {
      selectableWallpaperItems.forEach((wi) => wi.classList.remove("selected"));
      item.classList.add("selected");
      settings.desktopBackground.setValue({
        type: "color",
        value: DEFAULT_GRADIENTS[i],
      });
    };
  }

  gradientGroup.appendChild(gradientsTitleElt);
  gradientGroup.appendChild(gradientsGridElt);

  section.appendChild(gradientGroup);

  return section;
}
