const DOC_LINK =
  "https://peaberberian.github.io/README/doc/Getting_Started/Home.html";
const GITHUB_LINK = "https://github.com/canalplus/README";

export function create(_args, env) {
  const { createAppTitle } = env.appUtils;

  // Indicate more clearly that this app only talks about another project
  env.updateTitle(null /* keep same icon */, "Other Projects: README");
  return {
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          const overviewContainer = document.createElement("div");
          overviewContainer.appendChild(
            createAppTitle("README", { github: GITHUB_LINK, doc: DOC_LINK }),
          );

          const overviewText = document.createElement("div");
          overviewContainer.appendChild(overviewText);
          overviewText.innerHTML = `<p>README is a simple (in a KISS way) documentation generator taking as input fully CommonMark-compatible Markdown files.</p>

  <img style="width: 100%" src="${env.getImageRootPath() + "README-screenshot.png"}" alt="README's screenshot" />

  <p>Its goal is to keep the original documentation files readability in a text-editor (as intended by the Markdown format) as well as on other Markdown-capable UIs like Github's interface. This is done without doing any specific modification on them, just by adding minimal .docConfig.json JSON files alongside documentation files.</p>

  <div class=\"separator\"></div>

  <p>Initially (we talk about a time before most popular documentation generator, including docusaurus) the RxPlayer project I maintain had its own documentation generator.<br>When docusaurus became popular, we explored the possibility to migrate to that new generator.</p>
  <p>However we had multiple pain points with it: their markdown files rely on supplementary syntax that is unnecessary noise in our markdown files (which makes them less readable when seen in an alternative markdown formatter, e.g. GitHub's or some developer tools), it relied on many third parties for advanced features (search through algolia, React for an interactive page), and it has a very huge amount of dependencies - many bringing features we'll never need - which also sometimes seemed to led to issues when updating it (to be perfectly fair, this was only seen when they were in beta, which still spanned multiple years).</p>

  <p>It thus appeared that improving our own documentation generator by taking inspiration from many of docusaurus' great ideas (soft navigation, search, table of contents on the right, nice look and feel etc.) would lead to better maintainability than bringing docusaurus into our project (and with it its not-so-standard markdown files).<br>We profited from that improvement to completely spin-off this project in its own git repository. I'm now using that documentation generator for multiple projects.</p>`;
          return overviewContainer;
        },
      },
    ],
  };
}
