const GITHUB_LINK = "https://github.com/canalplus/RxPaired";

const IMAGE_HEIGHT = 580;
const IMAGE_WIDTH = 1000;

export function create(_args, env) {
  const { createAppTitle } = env.appUtils;
  return {
    sidebar: [
      { text: "Overview", render: getOverview },
      { text: "Why this project", centered: true, render: getWhy },
    ],
  };

  function getOverview() {
    const overviewContainer = document.createElement("div");
    overviewContainer.appendChild(
      createAppTitle("RxPaired", {
        github: GITHUB_LINK,
      }),
    );
    const p1Elt = document.createElement("p");
    p1Elt.innerHTML = `<a href="${GITHUB_LINK}" target="_blank">RxPaired</a> is a remote debugger lightweight on resources, with an RxPlayer specialization.<br>
We use it daily at Canal+ Group to debug our applications.`;
    overviewContainer.appendChild(p1Elt);

    const p2Elt = document.createElement("p");
    p2Elt.innerHtml = "Here's what it looks like when running";
    overviewContainer.appendChild(p2Elt);

    overviewContainer.appendChild(getRxPairedImg());
    return overviewContainer;
  }
  function getWhy() {
    const whyContainer = document.createElement("div");
    whyContainer.appendChild(createAppTitle("Why creating this?", {}));

    const whyTextContent = document.createElement("div");
    whyTextContent.innerHTML = `<p>This project is linked to Canal+' media player: the RxPlayer.</p>

  <p>The RxPlayer runs in production on many devices with low performances (e.g. some old smart TVs, set-top boxes and usb dongles) which can frequently show issues.<br>
	We previously relied on tools such as Google Chrome's or webkit's own inspectors but on constrained devices, those debuggers have endurance issues: they cannot run for sometimes more than a minute.</p>

	<div class=\"separator\"></div>

	<p>The global idea of RxPaired, is that the tested device will regularly send "enriched" logs (the basic logs with some more information added, such as timestamps, info on HTTP traffic etc.), either through a WebSocket connection or through HTTP POST requests. Then, the "inspector" part of that tool - running on your computer and receiving such logs - exploit the received metadata.<br>
	We added a lot of features over time: time-travel (being able to "rewind time" to see conditions when a previous log was sent), network-bandwidth estimates, being able to send instructions to the device etc.</p>

	<p>We even saw usage for cases which do not rely on the RxPlayer, where it is used as a lightweight log server when the browser's own debugger is not reliable / easily usable.</p>`;

    whyContainer.appendChild(whyTextContent);
    return whyContainer;
  }

  function getRxPairedImg() {
    // Some way to add a placeholder to remove reflow
    // TODO: A less hacky way may be found
    const placeholder = document.createElement("div");
    applyStyle(placeholder, {
      border: "2px dotted " + env.STYLE.lineColor,
      paddingTop: String((IMAGE_HEIGHT / IMAGE_WIDTH) * 100) + "%",
      position: "relative",
      display: "block",
    });
    const imgElt = document.createElement("img");
    applyStyle(imgElt, {
      width: "100%",
      position: "absolute",
      top: 0,
    });
    imgElt.src = env.getImageRootPath() + "rx-paired-screenshot.png";
    imgElt.alt = "RxPaired's screenshot";
    placeholder.appendChild(imgElt);
    return placeholder;
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
