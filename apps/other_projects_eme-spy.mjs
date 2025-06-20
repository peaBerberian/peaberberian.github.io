const GITHUB_LINK = "https://github.com/peaberberian/EMESpy.js";

export function create(_args, env) {
  const { createAppTitle } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(null /* keep same icon */, "Other Projects: EMESpy");
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("EMESpy.js", {
              github: GITHUB_LINK,
            }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p><a href="${GITHUB_LINK}" target="_blank">EMESpy</a> is a reverse-engineering tool I developed to easily see when a webpage calls "EME" web API.</p>
<p>"EME" for "Encrypted Media Extensions" is a group of web API to allow the playback of encrypted media in a browser, without having to resort in an easily-breakable decryption step in JavaScript.</p>
<p>Media encryption is often a requirement of content right-holders and as such almost all big streaming platforms (Netflix, Disney+, Canal+, Amazon Prime Video etc.) rely on those API to have the right to distribute those contents to their customers inside a web browser.</p>
<p>In some contexts EME API even allow the communication with secure hardware enclaves inside the user's CPU (e.g. a <a href="https://en.wikipedia.org/wiki/Trusted_execution_environment" target="_blank">TEE</a>) or GPU so that both media decryption and decoding never leave the hardware (again, to ensure that the decrypted content is not easily accessible).<br>As a surprising anecdote, in that situation no software is able to "see" the decoded media, for example even screen recorders and screenshoting softwares will usually show a black screen where the media should have been.</p>`;
          return overviewContainer;
        },
      },
      {
        text: "Why creating this tool?",
        icon: "🛠️",
        centered: true,
        render: () => {
          const roleCtner = document.createElement("div");
          roleCtner.appendChild(
            createAppTitle("What's the role of this tool?", {}),
          );

          const overviewText = document.createElement("div");
          roleCtner.appendChild(overviewText);
          overviewText.innerHTML = `<p>The EME API are flexible and allow to configure complex behaviors to allow for optimizations and future-proofing some future security requirements. Due to their complexity, they <b>very often</b> are subtly broken, and all media players relying on those API end up writing a lot of platform-specific (e.g. edge-only, Samsung TV-only etc.) work-arounds.</p>
<p>Which brings us to why I needed to create this tool.<br>It works by identifying and <a href="https://en.wikipedia.org/wiki/Monkey_patch" target="_blank">monkey-patching</a> all EME API, then filling an array with details about those calls. By then manually inspecting that array, we're able to understand what was done - like what API was called with which arguments and in which order.</p>
<p>This in turn is used to know what can be done and what behavior is problematic on a given user-agent and platform.</p>`;
          return roleCtner;
        },
      },
    ],
  };
}
