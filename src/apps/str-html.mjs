import strHtml from "../str-html.mjs";
import { createAppTitle } from "./app-utils.mjs";

const GITHUB_LINK = "https://github.com/peaberberian/str-html";

/**
 * @returns {Object}
 */
export default function StrHtmlApp() {
  return {
    title: "str-html",
    icon: "📄",
    sidebar: [
      {
        text: "Overview",
        icon: "🧑‍🏫",
        centered: true,
        render: () => {
          return strHtml`<div>
	${createAppTitle("str-html", { github: GITHUB_LINK })}
	<p>str-html is a very fast and lightweight UI library allowing to write HTML-in-JS without needing to bring an heavy library or transpilation step (unlike most popular attempts at simplifying HTML-in-JS like JSX or svelte).</p>

	<p>The main idea is to rely on JavaScript's <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates" target="_blank">tagged template literals feature</a> to allow writing HTML as just plain strings and allowing the interpolation of some other HTML elements and strings (that this library will properly escape).<br>It was written to improve a developer's experience when writing DOM-heavy code in JS in applications that do not need to pull heavy UI frameworks.<br>For example, this homepage uses str-html in many places, and the RxPaired project does as well.</p>

	<div class=\"separator\"></div>

	<p>Note that you however lose a lot of features when compared to bigger libraries or frameworks like React, Vue or svelte.<br>For example, str-html has no state management feature and it cannot profit from syntax completion/correction in a text editor like JSX does.</p>

	<p>Still, it's a very simple (in a KISS way AND at usage) and fast tool when all you need is just to make it slightly less annoying to create HTML elements in JavaScript.</p> 

	<div class=\"separator\"></div>

		<p>Thanks to its simplicity, I now consider this project complete: I do not see how I could improve it without making its API needlessly more complex.</p> 

</div>`;
        },
      },
    ],
  };
}
