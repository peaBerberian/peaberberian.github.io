const { strHtml, createAppTitle } = window.AppUtils;

const GITHUB_LINK = "https://github.com/peaberberian/MSESpy.js";

const sidebar = [
  {
    text: "Overview",
    icon: "🧑‍🏫",
    centered: true,
    render: () => {
      return strHtml`<div>
	${createAppTitle("MSESpy", { github: GITHUB_LINK })}
<p><a href="${GITHUB_LINK}" target="_blank">MSESpy</a> is a reverse-engineering tool I developed to easily see when a webpage calls "MSE" web API</p>
	<div class=\"separator\"></div>
<p>"MSE" for "MediaSource Extensions" is the group of web API which allows a media player written in JavaScript to feed audio and video data to the corresponding lower-level buffers.<br>
It can be seen as a lower-level API than just setting a media file directly on a <span style="color:#994422">${"<video\>"}</span> tag and it's what media players rely on to offer most of their advanced features: adaptive quality selection, live streaming, multiple audio tracks etc.</p>
	<div class=\"separator\"></div>
<p>This MSESpy tool works by identifying and <a href="https://en.wikipedia.org/wiki/Monkey_patch" target="_blank">monkey-patching</a> all API linked to MSE API and then filling an array with details about those calls. We then manually take a look at those results and draw conclusions on how the page interact with those API.</p>
<p>Practical use of these API are not so frequent in the wild, so this tool allows to understand what user-agents and platforms support and how we're able to interact with it.</p>
</div>`;
    },
  },
];

export { sidebar };
