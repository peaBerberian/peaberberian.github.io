const { strHtml, createAppTitle } = window.AppUtils;

const GITHUB_LINK = "https://github.com/peaberberian/gif-renderer.rs";

const sidebar = [
  {
    text: "Overview",
    icon: "🧑‍🏫",
    centered: true,
    render: () => {
      return strHtml`<div>
	${createAppTitle("gif-renderer.rs", { github: GITHUB_LINK })}

	<p>gif-renderer.rs is a simple GIF renderer in Rust.</p>

	<p>That's it, nothing special here 😅. This was written as I was learning Rust with the goal of undestanding that old inefficient moving picture's format.<br> I limited my reliance on dependencies, here only relying on some libraries for cross-platform window creation and for rendering (basically rendering directly frames into a framebuffer).</p>

  <p>Yet it turns out that maintaining those few dependencies was the biggest pain point here!<br>This was due to the very fast pace at which the Rust's ecosystem evolued when I was writing this, leading to many breakages and refactoring (the main "event loop" in which we react to user input had to be re-written several times) at each update.</p>

	<p>I initially planned to add a secondary platform where it could run through WebAssembly rendering the GIF inside a canvas on the page.<br>The idea was even to add some controls, for example to navigate frame-to-frame or go in reverse. However, I grew bored and more inclined to do other projects right when I could have started doing that, so mayber for later!</p>

</div>`;
    },
  },
];

export { sidebar };
