const DEMO_LINK = "https://peaberberian.github.io/AISOBMFFWVDFBUTFAII/";
const GITHUB_LINK = "https://github.com/peaberberian/isobmff-inspector";

export function create(_args, env) {
  const { createAppTitle, createExternalIframe } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(
    null /* keep same icon */,
    "Other Projects: isobmff-inspector.rs",
  );
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
  <p>Isobmff-inspector is a parser for those files allowing to visualize the metadata contained in a mp4 file.</p>

  <p>Originally a small project with a minimal web interface, as it grew I decided to split it in two:</p>
  <ol>
    <li><b><a href="https://github.com/peaberberian/isobmff-inspector" target="_blank">isobmff-inpector</a></b> is the parser itself</li>
    <li>I also created <b><a href="https://github.com/peaberberian/AISOBMFFWVDFBUTFAII" target="_blank">AISOBMFFWVDFBUTFAII</a></b> (yep, that's the name I chose) for the rich UI doing the analysis from that parsed data</li>
  </ol>
  <p>As I was iterating with both, I added a lot of features so both I and colleagues can (and do) actually rely on it in professional settings.</p>`;
          return overviewContainer;
        },
      },
      {
        text: "Demo",
        icon: "📺",
        noPadding: true,
        render: () => {
          const appIframe = createExternalIframe(DEMO_LINK);
          return appIframe;
        },
      },
    ],
  };
}
