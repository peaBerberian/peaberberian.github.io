import { is12HourClockFormat } from "./utils.mjs";

/**
 * Create a simple infinitely self-updating clock whose goal is to be shown
 * inside the taskbar.
 *
 * @param {AbortSignal|undefined} [abortSignal] - Optional `AbortSignal` to free
 * the resources taken by this applet.
 * @returns {HTMLElement} - The clock element itself, showing the digital
 * local hour.
 */
export default function initializeClockElement(abortSignal) {
  const clockElt = document.createElement("div");
  clockElt.className = "clock";
  const use12HourClockFormat = is12HourClockFormat();
  updateClock(use12HourClockFormat, clockElt);
  const itv = setInterval(
    () => updateClock(use12HourClockFormat, clockElt),
    2000,
  );
  if (abortSignal) {
    abortSignal.addEventListener("abort", () => {
      clearInterval(itv);
    });
  }
  return clockElt;
  function updateClock(use12HourClock, clockElt) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let ampm;
    if (use12HourClock) {
      ampm = hours >= 12 ? " PM" : " AM";
    } else {
      ampm = "";
    }
    const formattedHours = use12HourClock ? hours % 12 || 12 : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    // NOTE: \u200B == Zero-width space. Allows line breaks if needed.
    clockElt.textContent = `${formattedHours}\u200B:\u200B${formattedMinutes}${ampm}`;
  }
}
