const DEMO_LINK = "https://peaberberian.github.io/AISOBMFFWVDFBUTFAII/";
const GITHUB_LINK = "https://github.com/peaberberian/isobmff-inspector";

export function create(_args, env) {
  const { createAppTitle } = env.appUtils;
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("isobmff-inspector", {
              github: GITHUB_LINK,
              demo: DEMO_LINK,
            }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p>ISOBMFF-inspector is an ISOBMFF-compatible (for example: "mp4" files) file parser written in JavaScript.</p>

  <p>When working on technical aspects of a media player, you end-up having to understand at least the basics of multiple media formats and compression standards.</p>

  <p>One of the most ubiquitous formats you encounter are mp4 container files.<br>Those follow a specific syntax allowing those files to both contain metadata and compressed media (e.g. the audio and/or video itself). Those are binary files with very flexible contents making them hard to manually inspect.</p>
  <p>Isobmff-inspector is a simple parser for those files allowing to visualize the metadata contained in a mp4 file. I often use it in professional contexts when inspecting some playback-related issues.</p>`;
          return overviewContainer;
        },
      },
    ],
  };
}
