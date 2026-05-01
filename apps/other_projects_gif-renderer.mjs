const DEMO_LINK = "https://peaberberian.github.io/gif-renderer.rs/";
const GITHUB_LINK = "https://github.com/peaberberian/gif-renderer.rs";

export function create(_args, env) {
  const { createAppTitle, createExternalIframe } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(null /* keep same icon */, "Other Projects: gif-renderer.rs");
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("gif-renderer.rs", { github: GITHUB_LINK, demo: DEMO_LINK }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p>gif-renderer.rs is a GIF renderer in Rust compatible with web browser environments thanks to WebAssembly.</p>

  <p>As it can be seen from my other projects, I'm particularly interested by the handling of media data, but at the time never much dived into the decoding logic of an image format, instead always working on upper presentation layers.<br>
   So that project was here to change that by looking at a weird, inneficient, culturally important, format as an added bonus!</p>

  <p>It was also started as I was learning the Rust language. I limited my reliance on dependencies, only relying on some libraries for cross-platform window creation and for rendering the decoded output (basically rendering directly frames into a framebuffer).</p>

  <p>Yet it turns out that maintaining those few dependencies was the biggest pain point here!<br>This was due to the very fast pace at which the Rust's ecosystem evolued when I was writing this, leading to many breakages and refactoring at each update.</p>

  <p>A key goal of the project was for it to be runnable in a web browser, through WebAssembly.
  I thus made it compatible with multiple targets:</p>
  <ul>
    <li>one native running a binary as a gif decoder</li>
    <li>and a web target rendering the GIF inside a canvas on a page</li>
  </ul>
  <p>That second way of interacting with it led to fun experimentations like adding controls to navigate frame-to-frame, go in reverse or to export each frame as a png.</p>`;
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
