const data = require("../../assets/data.js");

module.exports = (wording) =>
  `<h2 class="page-title">${wording.education.title}</h2>
${wording.education.description}
${getSchools(wording.education.schools)}
`;

const getSchools = (schools) =>
  schools.map((schoolObj) =>
              `<div class="edu-item item-group">
  <span class= "item-group-img-container">
    <img class="edu-school-img item-group-img"
      alt=${data.education[schoolObj.id].description}\"
      src="${data.education[schoolObj.id].image}" />
  </span>
  <div class="edu-title item-group-header">
    <span class="edu-diploma item-group-name">${schoolObj.diploma}</span>
    <br />
    <span class="edu-date item-group-date">${schoolObj.dateFrom} - ${schoolObj.dateTo}</span>
  </div>
  <div class="edu-school item-group-loc">
    <p class="school-desc item-group-loc-desc">${schoolObj.schoolDescription}</p>
  </div>
  ${getSchool(schoolObj)}
</div>
`).join("");

const getSchool = (schoolObj) =>
  `<p>${schoolObj.firstLine}</p>
<p>${schoolObj.shortDescription}</p>
`;
