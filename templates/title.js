const data = require("../assets/data.js");

module.exports = (wording) =>
`<div class="title-block">` +
`<h1 class="title-name">Paul Berberian</h1>` +
`<span class="subtitle">Software engineer</span>` +
`<div class="quickLinks">${getQuickLinks(data.quickLinks)}</div>` +
`</div>`;

const getQuickLinks = (quickLinksData) =>
  quickLinksData.map(linkInfo =>
    `<a class="quicklink-link" href="${linkInfo.link}"><img class="quicklink-img" alt="${linkInfo.description}" src="${linkInfo.img}"/></a>`).join("");
