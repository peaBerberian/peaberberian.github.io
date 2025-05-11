/**
 * Identifier unique to a created clock App.
 * Allows to avoid SVG collisions in a very simple way.
 *
 * It breaks if it overflows `Number.MAX_SAFE_INTEGER` but if someone succeeds
 * to do this, kudos!
 */
let clockId = 0;

export function create(_args, env, abortSignal) {
  const { applyStyle } = env.appUtils;
  const use12HourClockFormat = is12HourClockFormat();
  const wrapper = document.createElement("div");
  applyStyle(wrapper, {
    backgroundColor: "var(--app-primary-bg)",
    position: "relative",
    height: "100%",
    width: "100%",
    margin: "0px",
    textAlign: "center",
  });
  const clockContainer = document.createElement("div");
  applyStyle(clockContainer, {
    height: "100%",
    width: "100%",
    position: "absolute",
  });
  clockContainer.innerHTML = generateClock();
  const clockTextElt = clockContainer.getElementsByClassName("clock-text")[0];
  wrapper.appendChild(clockContainer);
  updateClockText();
  const textUpdateItv = setInterval(() => {
    updateClockText();
  }, 350);
  let isStopped;
  abortSignal.addEventListener("abort", () => {
    clearInterval(textUpdateItv);
    isStopped = true;
  });
  requestAnimationFrame(startUpdatingClockHands);
  return { element: wrapper };

  function updateClockText() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const formattedHours = use12HourClockFormat ? hours % 12 || 12 : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    let ampm;
    if (use12HourClockFormat) {
      ampm = hours >= 12 ? " PM" : " AM";
    } else {
      ampm = "";
    }
    clockTextElt.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}${ampm}`;
  }
  function startUpdatingClockHands() {
    if (isStopped) {
      return;
    }

    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
    const totalSecondsHours = hours * 3600 + totalSeconds;

    const hourRotation = (totalSecondsHours / 120) % 360;
    const minuteRotation = (totalSeconds / 10) % 360;
    const secondRotation = seconds * 6 + milliseconds * 0.006;
    clockContainer
      .getElementsByClassName("hour")[0]
      .setAttribute("transform", `rotate(${hourRotation}, 200, 200)`);
    clockContainer
      .getElementsByClassName("minute")[0]
      .setAttribute("transform", `rotate(${minuteRotation}, 200, 200)`);
    clockContainer
      .getElementsByClassName("second")[0]
      .setAttribute("transform", `rotate(${secondRotation}, 200, 200)`);
    requestAnimationFrame(startUpdatingClockHands);
  }
}

function generateClock() {
  let minuteMarkers = ``;
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) {
      continue;
    }
    const angle = i * 6;
    const elt = [
      // x1
      200 + 155 * Math.sin((angle * Math.PI) / 180),
      // y1

      200 - 155 * Math.cos((angle * Math.PI) / 180),
      // x2
      200 + 162 * Math.sin((angle * Math.PI) / 180),
      // y2
      200 - 162 * Math.cos((angle * Math.PI) / 180),
    ];
    for (const j of [0, 1, 2, 3]) {
      // could probably be done in a more accurate way, don't care for now
      // gotta go fast
      if (elt[j] % 1 !== 0) {
        if (elt[j] % 1 > 0.95) {
          elt[j] = Math.ceil(elt[j]);
        } else if (elt[j] % 1 < 0.05) {
          elt[j] = Math.floor(elt[j]);
        }
        elt[j] = elt[j].toFixed(1);
      }
    }
    minuteMarkers += `
		<!-- ${i}m -->
    <line x1="${elt[0]}" y1="${elt[1]}" x2="${elt[2]}" y2="${elt[3]}" stroke="#888888" stroke-width="1" stroke-linecap="round" />`;
  }
  clockId++;
  return `<svg viewBox="0 0 400 400" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Definitions for shadows and gradients -->
  <defs>
    <filter id="clock-${clockId}-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
      <feOffset dx="2" dy="2" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3" />
      </feComponentTransfer>
      <feMerge0
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    
    <linearGradient id="clock-${clockId}-clockFaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f5f5" />
      <stop offset="100%" stop-color="#e0e0e0" />
    </linearGradient>

    <linearGradient id="clock-${clockId}-rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#606060" />
      <stop offset="100%" stop-color="#383838" />
    </linearGradient>
  </defs>

  <!-- Clock rim -->
  <circle cx="200" cy="200" r="180" fill="url(#clock-${clockId}-rimGradient)" filter="url(#clock-${clockId}-shadow)" />
  
  <!-- Clock face -->
  <circle cx="200" cy="200" r="170" fill="url(#clock-${clockId}-clockFaceGradient)" />
  
  <!-- Minute markers -->
  <g>
${minuteMarkers}
  </g>
	<text class="clock-text" x="200" y="275" text-anchor="middle" font-family="monospace" font-size="22" fill="#666666"></text>
  <!-- Hour markers -->
  <g>
    <!-- 12h -->
    <line x1="200" y1="63" x2="200" y2="38" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 1h -->
    <line x1="272.5" y1="74" x2="281" y2="59" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 2h -->
    <line x1="325" y1="127.5" x2="340" y2="119" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 3h -->
    <line x1="345" y1="200" x2="362" y2="200" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 4h -->
    <line x1="325.5" y1="272.5" x2="340" y2="281" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 5h -->
    <line x1="272.5" y1="325.5" x2="281" y2="340" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 6h -->
    <line x1="200" y1="345" x2="200" y2="362" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 7h -->
    <line x1="127.5" y1="325.5" x2="119" y2="340" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 8h -->
    <line x1="74.5" y1="272.5" x2="59.7" y2="281" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 9h -->
    <line x1="55" y1="200" x2="38" y2="200" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 10h -->
    <line x1="74.4" y1="127.5" x2="59.7" y2="119" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 11h -->
    <line x1="127.5" y1="74.4" x2="119" y2="59.7" stroke="#333333" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Clock hands -->
  <g>
    <!-- Hour hand -->
    <line class="hour" x1="200" y1="200" x2="200" y2="120" stroke="#555555" stroke-width="5" stroke-linecap="round">
    </line>
    
    <!-- Minute hand -->
    <line class="minute"" x1="200" y1="200" x2="200" y2="80" stroke="#555555" stroke-width="5" stroke-linecap="round">
    </line>
    
    <!-- Second hand -->
    <line class="second" x1="200" y1="220" x2="200" y2="80" stroke="#D32F2F" stroke-width="2" stroke-linecap="round">
    </line>
    
    <!-- Center pin -->
    <circle cx="200" cy="200" r="8" fill="#555555" />
    <circle cx="200" cy="200" r="4" fill="#D32F2F" />
  </g>
</svg>`;
}

// Sadly, the browser does annoying tricks which makes this beautiful self-animating SVG not always working
// <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 200 200" to="360 200 200" dur="3600s" repeatCount="indefinite" />
// const { secondHand, minuteHand, hourHand } = getClockHandsCoordinates();
// function getClockHandsCoordinates() {
//   const now = new Date();
//   const hours = now.getHours();
//   const minutes = now.getMinutes();
//   const seconds = now.getSeconds();
//   const ms = now.getMilliseconds();
//   const floatSeconds = seconds + ms / 1000;
//   const secondAngle = floatSeconds * 6;
//   const minuteAngle = minutes * 6 + floatSeconds * 0.1;
//   const hourAngle = (hours % 12) * 30 + minutes * 0.5;
//   const secondHand = getHand(200, 200, 120, -20, secondAngle);
//   const minuteHand = getHand(200, 200, 120, 0, minuteAngle);
//   const hourHand = getHand(200, 200, 80, 0, hourAngle);
//
//   function getHand(centerX, centerY, handLength, startDistance, angleDegrees) {
//     const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
//     return {
//       x1: centerX + startDistance * Math.cos(angleRadians),
//       y1: centerY + startDistance * Math.sin(angleRadians),
//       x2: Math.round(centerX + handLength * Math.cos(angleRadians)),
//       y2: Math.round(centerY + handLength * Math.sin(angleRadians)),
//     };
//   }
//   return { secondHand, minuteHand, hourHand };
// }

/**
 * @returns {boolean} - If `true`, the current system seems to default to
 * 12-hours based time. If `false`, the hours can be based as the only
 * real sensible way: 24h time.
 */
function is12HourClockFormat() {
  const locale = navigator.language;
  try {
    return (
      Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions()
        .hour12 === true
    );
  } catch (err) {
    return locale === "en-US";
  }
}
