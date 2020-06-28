const fs = require("fs");

const wordingEn = require("./assets/wording.en.json");

// templates
const headTpl = require("./templates/head.js");
const titleTpl = require("./templates/title");
const pagesTpl = require("./templates/pages/index.js");

function generateHTML() {
  const contents = pagesTpl.map(({ id, content }) => {
    return `<div id="${id}" class="page">${content(wordingEn)}</div>`;
  });

  return `<!DOCTYPE html>
<html lang="en">` +
         headTpl(wordingEn) +
         "<body>\n" +
         titleTpl(wordingEn) +
         "<div class=\"main-container\">\n" +
         "<div class=\"main\">\n" +
         contents.join("\n") +
         "</div>\n" +
         "</div>\n" +
         "</body>\n" +
         "</html>";
}

(function main() {
  const html = generateHTML();
  fs.writeFile("./index.html", html, function(err) {
    if(err) {
      return console.error("Could not write file: ", err);
    }
    console.log("Generated html with success!");
  }); 
})();
