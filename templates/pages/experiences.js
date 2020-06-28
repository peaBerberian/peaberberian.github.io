const data = require("../../assets/data.js");

module.exports = (wording) =>
  `<h2 class="page-title">${wording.experiences.title}</h2>
<p>${wording.experiences.description}</p>
${getJobs(wording.experiences.jobs)}
`;

const getJobs = (jobs) =>
  jobs.map((jobObj) =>
    `<div class="job-item item-group">
  <span class= "item-group-img-container">
    <img class="job-company-img item-group-img"
      alt="${data.experiences[jobObj.id].description}"
      src="${data.experiences[jobObj.id].image}" />
  </span>
  <div class="job-title item-group-header">
    <span class="job-name item-group-name">${jobObj.jobTitle}</span>
    <br />
    <span class="job-date item-group-date">${jobObj.dateFrom} - ${jobObj.dateTo}</span>
  </div>
  <div class="job-company item-group-loc">
    <p class="company-desc item-group-loc-desc">${jobObj.companyDescription}</p>
  </div>
  ${jobObj.jobDescription}
</div>
`).join("");
