const GITHUB_LINK = "https://github.com/peaberberian/paul-envs";

export function create(_args, env) {
  const { createAppTitle } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(null /* keep same icon */, "Other Projects: paul-envs");
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("paul-envs", {
              github: GITHUB_LINK,
            }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p><i>paul-envs</i> is my own development container manager.</p>

<p>At work, I often have to navigate between multiple projects. Some are huge monorepos with specific environment requirements: specific dependencies, language versions, certificates etc.<br>I started relying for some of them on containers to easily start from the right expected environment.</p>

<p>Additionally, my workflow is heavy on the command line, as my main IDE is <a href="https://neovim.io/" target="_blank">neovim</a> alongside a battery of other CLI tools.<br>So for each project I ended up with the simpler road of just working directly from shells running inside those containers.<br>To facilitate the configuration of a new project (language versions, open ports, third-party tools etc.). I had a BASH script that quickly grew very large (1k+ lines) as I was improving this setup.</p>

<video style="width: 100%" src="https://github.com/user-attachments/assets/0eb8bbb8-5ad4-4c8d-8d80-f92fbb0072c4" alt="paul-envs video preview" controls="controls"></video>

<p>I ended up naming it <b>paul-envs</b> and rewriting it in Go.<br>Because I wanted to be easy-to-maintain long term even if I have totally new needs or a new PC (e.g. new OS or CPU architecture), I made it OS-agnostic, arch-agnostic (container follow the host arch), forward compatible (presence of lockfiles to link configurations to versions, metadata on last build information to know when a container should be re-built...), and I set up a simple, helpful, API.</p>

<p>One of the main ideas behind <i>paul-envs</i> is also to have "smart" storage persistence: only the project's code, tools' state (editor plugins, shell history...) and caches are persisted, everything else resets when the container is exited. This makes those environments extremely easy to keep clean, minimal and reproducible enough over long periods of time.</p>

<p>I use it heavily at work and on some personal projects where I can profit from the supplementary isolation.</p>`;

          return overviewContainer;
        },
      },
    ],
  };
}
