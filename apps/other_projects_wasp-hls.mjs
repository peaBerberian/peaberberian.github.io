const DEMO_LINK = "https://peaberberian.github.io/wasp-hls/";
const DOC_LINK =
  "https://peaberberian.github.io/wasp-hls/doc/Getting_Started/Welcome.html";
const GITHUB_LINK = "https://github.com/peaBerberian/wasp-hls";

export function create(_args, env) {
  const { createAppTitle, createExternalIframe } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(null /* keep same icon */, "Other Projects: WASP-HLS");
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("WASP-HLS", {
              github: GITHUB_LINK,
              doc: DOC_LINK,
              demo: DEMO_LINK,
            }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p><a href="${GITHUB_LINK}" target="_blank">WASP-HLS</a> is a personal project where I did some R&D on the side to see how a very efficient web media player could look like:</p>
<ul>
  <li>Its main logic runs in a WebWorker, which enables multiple threads (so that the UI and the player may not block each other during heavy operations).</li>
  <li>The core code is compiled to WebAssembly (written initially in Rust), for more control over memory usage and performance - than when relying on JavaScript.</li>
  <li>I wrote it from scratch, profiting from a decade of experience I have on this subject</li>
</ul>
<p>Also, unlike the RxPlayer, WASP-HLS plays only HLS contents (generally "simpler" to implement than DASH). It is today functional for most HLS contents, live or VoD. For a end user, HLS and DASH more or less look the same yet internally they are very different!</p>

<p>I'm pretty happy with this project, I've experimented a lot with WebAssembly, different potential architectures that could be a good fit with Rust and even with how a media player API I create from scratch could look like (admittedly different in many ways than the one of the RxPlayer - though it also has a nice API).</p>

<p>I sometimes come back to it but not as much, yet it is still very functional. At some point, I wanted to also <a href="https://github.com/peaBerberian/wasp-hls/pull/5">port to Rust the optional transmuxing code</a> (converting some specific containers here to an mp4-like one to improve browser compatibility) - yet the task was enormous and I never really finished it, nor could see if the gain of porting that code would be sensible (I guessed it would, it's a relatively heavy operation).<br>Though transmuxing is less and less needed so I'm not too unhappy that it has not been done yet.</p>`;
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
