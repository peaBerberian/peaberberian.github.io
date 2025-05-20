const GITHUB_LINK = "https://github.com/peaberberian/MSESpy.js";

export function create(_app, env) {
  const { createAppTitle } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(null /* keep same icon */, "Other Projects: MSESpy");
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("MSESpy", {
              github: GITHUB_LINK,
            }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p><a href="${GITHUB_LINK}" target="_blank">MSESpy</a> is a reverse-engineering tool I developed to easily see when a webpage calls "MSE" web API</p>
  <div class=\"separator\"></div>
<p>"MSE" for "MediaSource Extensions" is the group of web API which allows a media player written in JavaScript to feed audio and video data to the corresponding lower-level buffers.<br>
It can be seen as a lower-level API than just setting a media file directly on a <span style="color:#994422">"&ltvideo\&gt"</span> tag and it's what media players rely on to offer most of their advanced features: adaptive quality selection, live streaming, multiple audio tracks etc.</p>
  <div class=\"separator\"></div>
<p>This MSESpy tool works by identifying and <a href="https://en.wikipedia.org/wiki/Monkey_patch" target="_blank">monkey-patching</a> all API linked to MSE API and then filling an array with details about those calls. We then manually take a look at those results and draw conclusions on how the page interact with those API.</p>
<p>Practical use of these API are not so frequent in the wild, so this tool allows to understand what user-agents and platforms support and how we're able to interact with it.</p>`;
          return overviewContainer;
        },
      },
    ],
  };
}
