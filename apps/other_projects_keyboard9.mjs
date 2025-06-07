const DEMO_LINK =
  "https://peaberberian.github.io/keyboard9/examples/configurable_keyboard.html";
const GITHUB_LINK = "https://github.com/peaberberian/keyboard9";

export function create(_app, env) {
  const { createAppTitle } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(null /* keep same icon */, "Other Projects: keyboard9");
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("keyboard9", {
              github: GITHUB_LINK,
              demo: DEMO_LINK,
            }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p>keyboard9 is a visual keyboard intended for devices without a keyboard (e.g. with a remote or a joypad).</p>

  <p>I often work on devices without a keyboard such as TV, HDMI dongles or game consoles.<br>
  When you need to be inputing text (e.g. to enter your wifi password), applications deployed to those devices often present to you a visual keyboard which I find to be non-optimal: you need many inputs to choose a letter, often relying on direction keys which isn't the "natural" way of interacting with this keyboard concept.</p>

  <p>So as a fun attempt I tried to define my own efficient keyboard interface.<br>It is inspired from the "MultiTap"/"ABC" mode we had on phones before most of them had a tactile interfaces - but also bringing multiple improvements by exploiting the fact that we can update the face of the "keys" displayed on screen.<br>Today, I'm using that dependency in debugging tool only, when I have to debug on devices without an actual keyboard.</p>`;
          return overviewContainer;
        },
      },
    ],
  };
}
