import strHtml from "../str-html.mjs";
import { createAppIframe } from "../utils.mjs";
import { createAppTitle } from "./app-utils.mjs";

const DEMO_LINK = "https://developers.canal-plus.com/rx-player/";
const DOC_LINK =
  "https://developers.canal-plus.com/rx-player/doc/api/Overview.html";
const GITHUB_LINK = "https://github.com/canalplus/rx-player";

/**
 * Generate content of the "RxPlayer" application.
 * @returns {Object}
 */
export default function RxPlayer() {
  return {
    title: "RxPlayer",
    icon: "⏯️",
    defaultHeight: 720,
    defaultWidth: 950,
    // defaultHeight: ({ maxHeight }) => {
    //   if (maxHeight * 0.85 > 200) {
    //     return maxHeight * 0.85;
    //   }
    //   return maxHeight;
    // },
    // defaultWidth: ({ maxWidth }) => {
    //   if (maxWidth * 0.85 > 400) {
    //     return maxWidth * 0.85;
    //   }
    //   return maxWidth;
    // },
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          return strHtml`<div>
${createAppTitle("RxPlayer", { github: GITHUB_LINK, doc: DOC_LINK, demo: DEMO_LINK })}

<p>The <a href="${GITHUB_LINK}" target="_blank">RxPlayer</a> is an advanced media player adapted for large streaming companies: instead of just relying on a video element's \`src\` attribute and let the browser handle contents, the RxPlayer progressively loads chunks of audio and video data and then push them to lower-level buffers. It can also rely on other browser API to decrypt an encrypted content.</p>

<p>This way of "manually" handling a content in-JavaScript allows some key improvements:<ul>
	<li>We can change the quality loaded at any time if the user's bandwidth changes.</li>
	<li>We can play live contents.</li>
	<li>We can change audio tracks while keeping the same video data playing.</li>
	<li>We have much more control over how the media is played (e.g. how much media data is buffered in advance, how are requests scheduled etc.) than if we gave control to the browser.</li>
</ul></p>

<div class="separator" />

<p>Because of all those advantages, multiple standards have been created to facilitate the interoperabilities of JS players, browsers and contents:
<ul>
	<li>
	To format those complex contents in a format media players can understand multiple standards exist. The main ones are DASH, HLS and smooth streaming.<br>
	The RxPlayer handles DASH and Smooth streaming contents but not HLS directly (it only can if the browser itself supports HLS, such as Safari or IOS browsers).
	</li>
	<li>To let JS media players feed media content to lower-level buffers, browsers implement a special web API: Media Source Extensions (or MSE).</li>
	<li>To allow media content decryption, browsers also implement a special web API: Encrypted Media Extensions (or EME).</li>
	<li>To ensure the media is decodable and its metadata readable, there's also many file formats and compression standards.</li>
</ul>
</p>

<p>The RxPlayer thus fills the role of a library interacting with those standards to play a content efficiently in a web browser.</p>

</div>`;
        },
      },
      {
        text: "Demo",
        icon: "📺",
        noPadding: true,
        render: () => {
          const appIframe = createAppIframe(
            "https://developers.canal-plus.com/rx-player/",
          );
          return appIframe;
        },
      },
    ],
  };
}
