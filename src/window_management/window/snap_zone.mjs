import {
  getLeftPositioning,
  getTopPositioning,
  getWindowHeight,
  getWindowWidth,
} from "./position_utils.mjs";

const snapZoneElt = document.getElementById("snap-zone");

export function activateFullScreenSnapping(windowElt) {
  initializeSnapZone(windowElt);
  snapZoneElt.style.animation = "fullScreenSnapping 0.4s ease-in-out";
  snapZoneElt.classList.add("active");
  snapZoneElt.classList.add("active-full");
  snapZoneElt.onanimationend = () => {
    snapZoneElt.style.animation = "";
    snapZoneElt.style.top = "0";
    snapZoneElt.style.left = "0";
    snapZoneElt.style.height = "100%";
    snapZoneElt.style.width = "100%";
  };
}

export function activateLeftScreenSnapping(windowElt) {
  initializeSnapZone(windowElt);
  snapZoneElt.style.animation = "leftScreenSnapping 0.3s ease-in-out";
  snapZoneElt.classList.add("active");
  snapZoneElt.classList.add("active-left");
  snapZoneElt.onanimationend = () => {
    snapZoneElt.style.animation = "";
    snapZoneElt.style.top = "0";
    snapZoneElt.style.left = "0";
    snapZoneElt.style.height = "100%";
    snapZoneElt.style.width = "50%";
  };
}

export function activateRightScreenSnapping(windowElt) {
  initializeSnapZone(windowElt);
  snapZoneElt.style.animation = "rightScreenSnapping 0.3s ease-in-out";
  snapZoneElt.classList.add("active");
  snapZoneElt.classList.add("active-right");
  snapZoneElt.onanimationend = () => {
    snapZoneElt.style.animation = "";
    snapZoneElt.style.top = "0";
    snapZoneElt.style.height = "100%";
    snapZoneElt.style.width = "50%";
    snapZoneElt.style.left = "50%";
  };
}

export function disableSnappingZones() {
  snapZoneElt.classList.remove("active");
  snapZoneElt.classList.remove("active-full");
  snapZoneElt.classList.remove("active-left");
  snapZoneElt.classList.remove("active-right");
  snapZoneElt.style.animation = "";
  snapZoneElt.style.width = "";
  snapZoneElt.style.left = "";
  snapZoneElt.style.zIndex = "";
}

export function isFullScreenSnapping() {
  return snapZoneElt.classList.contains("active-full");
}

export function isLeftScreenSnapping() {
  return snapZoneElt.classList.contains("active-left");
}

export function isRightScreenSnapping() {
  return snapZoneElt.classList.contains("active-right");
}

function initializeSnapZone(windowElt) {
  snapZoneElt.style.zIndex = parseInt(windowElt.style.zIndex, 10) - 1;
  snapZoneElt.style.top = String(getTopPositioning(windowElt)) + "px";
  snapZoneElt.style.left = String(getLeftPositioning(windowElt)) + "px";
  snapZoneElt.style.height = String(getWindowHeight(windowElt)) + "px";
  snapZoneElt.style.width = String(getWindowWidth(windowElt)) + "px";
}
