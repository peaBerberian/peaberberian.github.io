const about = require("./about.js");
const whatIWorkOn = require("./what_I_work_on.js");
const whatILikeToDo = require("./what_I_like_working_on.js");
const experiences = require("./experiences.js");
const education = require("./education.js");
const projects = require("./projects.js");
const skills = require("./skills.js");

module.exports = [
  { id: "about", content: about },
  { id: "whatIWorkOn", content: whatIWorkOn },
  { id: "whatILikeToDo", content: whatILikeToDo },
  { id: "experiences", content: experiences },
  { id: "education", content: education },
];
