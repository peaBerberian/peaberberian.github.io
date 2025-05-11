const IMAGE_HEIGHT = 45;
const IMAGE_WIDTH = 60;

const quickLinks = [
  {
    link: "https://github.com/peaBerberian",
    description: "Link to my GitHub account",
    img: "github.png",
  },
  {
    link: "https://www.linkedin.com/in/paul-berberian-6a685335/",
    description: "Link to my LinkedIn page",
    img: "linkedin.png",
  },
];

const jobs = [
  {
    dateFrom: "2017/05",
    dateTo: "Today",
    jobTitle: "Tech Lead",
    company: "Canal+ Group",
    companyDescription:
      "<b>Canal+ Group</b> is a french media company which broadcasts and produces contents for multiple countries.",
    jobDescription:
      '<p>Lead developer of several media-related projects, including the <a href="https://github.com/canalplus/rx-player" target="_blank">RxPlayer</a>: A featureful media player for the web with adaptive streaming, live playback, low-latency streaming, support of multiple devices and DRMs.</p><p>The RxPlayer is an on-going project used in production for internal needs and several premium products at Canal+ as well as outside the company.</p><p>I also lead several other projects some open-source, some closed-source, to help with the development of those media products.</p>',
    img: "canal.png",
    imgDescription: "Canal+",
  },
  {
    dateFrom: "2014/09",
    dateTo: "2017/04",
    jobTitle: "Software developer",
    company: "Davidson Consulting",
    companyDescription:
      '<b>Davidson Consulting</b> is a french consulting company named 4 times in a row (between 2014 and 2017 included) at the top of the "best place to work" ranking for french companies.',
    jobDescription:
      "<p>Worked with Canal+ in the STB development team where we designed and developed new interfaces for various set-top boxes and other similar platforms.</p><p>In particular, I worked on several aspects of those applications like general design, media player integration, TV remote controls, GUI, porting the API abstraction layer to multiple devices and others. We did all of that with the help of multiple JavaScript libraries: mainly RxJS, React, flow, Redux and BackboneJS.</p>",
    img: "davidson2.png",
    imgDescription: "Davidson Consulting",
  },

  {
    dateFrom: "2011/09",
    dateTo: "2014/08",
    jobTitle: "Software developer / Assistant Project Manager",
    company: "Orange",
    companyDescription:
      "<b>Orange</b> is a french telecommunications corporation. It provides mobile, landline, internet and IPTV services in multiple countries.",
    jobDescription:
      "<p>Worked as a software developer helping the project managers of the IPTV division.</p><p>Those 3 years were done in apprenticeship, as I continued to study at my engineering school at the time.</p>The programming languages I used to create these tools were varied depending on the project: PHP, javascript, Node.js, Java Android and VBA - for Microsoft Office documents.</p>",
    img: "orange.png",
    imgDescription: "Orange",
  },

  {
    dateTo: "08/2011",
    dateFrom: "06/2011",
    jobTitle: "Telecommunications technician",
    company: "Orange",
    companyDescription:
      "<b>Orange</b> is a french telecommunications corporation. It provides mobile, landline, internet and IPTV services in multiple countries.",
    jobDescription:
      "<p>These 3 months in Orange were in the context of an internship. I had as a mission to help with the maintenance of Orange's local loop in Paris.</p>",
    img: "orange.png",
    imgDescription: "Orange",
  },
];

const schools = [
  {
    dateFrom: "2011/09",
    dateTo: "2014/08",
    schoolName: "ESIEE Paris",
    diploma: "Engineering Diploma",
    schoolDescription:
      "The Electronics and Electrical Engineering school (<b>ESIEE Paris</b>) is a french engineering school specialized in electronic engineering.",
    firstLine:
      "5-year engineering diploma (equivalent to a master's degree in engineering) with a specialization in Networks and Telecommunications.",
    shortDescription:
      "This cursus was done in apprenticeship (I also worked at Orange during that time) and it ended with a foreign experience: 6 month in a chinese university (Xidian University in Xi'An) where I studied Networks and Computer Science.<br />The ESIEE Paris cursus included courses in programming (mainly algorithms, Java and C), networks (tcp/ip, mobile networks, routing...) and system management (mostly linux-related administration).",
    img: "esiee2.png",
    imgDescription: "ESIEE",
  },

  {
    dateFrom: "2013/09",
    dateTo: "2014/02",
    schoolName: "Xidian University (Chinese: 西安电子科技大学)",
    diploma: "University exchange in a master's degree context",
    schoolDescription:
      "<b>Xidian</b> is a chinese university specialized in electronic engineering",
    firstLine:
      "6 months in Xidian done as an university Exchange (with ESIEE Paris).",
    shortDescription:
      "I followed several courses concerning networks engineering and computer science there, in english, while learning (trying to!) chinese and living in immersion in this country. This was definitely a good experience as well on a personal than on an educational level",
    img: "xidian2.png",
    imgDescription: "Xidian",
  },

  {
    dateFrom: "2009/09",
    dateTo: "2011/08",
    schoolName: "UPEC",
    diploma: "DUT in network and telecommunications",
    schoolDescription:
      '<b>UPEC</b>, for "East-Paris University", is a multi-disciplinary university located both in and close to Paris.',
    firstLine:
      'I obtained a 2-year "DUT" diploma in the French UPEC university where I studied networks, telecommunications and computer science.',
    shortDescription: "",
    img: "upec2.png",
    imgDescription: "UPEC",
  },
];

export function create(_args, env) {
  const { createAppTitle, createFullscreenButton } = env.appUtils;

  const wording = {
    general: {
      title: "Welcome 👋🏻",
      description: `<div>
	<p>Hi, my name is Paul Berberian, I'm 34¹ I'm a software engineer and tech lead at Canal+ Group living in Montpellier, France. I lead several projects linked to media streaming, including the open-source <a href="https://github.com/canalplus/rx-player" target="_blank">RxPlayer</a> media player.</p>

	<p>You're here in my personal website which emulates a classical desktop environment. Everything you see here has been done especially for this desktop without any external dependency.</p>

	<p>To contact me, you can send an e-mail to: <a href="mailto:paul.berberian@proton.me">paul.berberian@proton.me</a>.</p>

	<p class="asterisk"><span class="note">1</a>. As long as we\'re still in 2025, that is.</span></p>

<div class="quickLinks"><b>External links: </b>${formatQuickLinks(quickLinks, env)}</div></div>`,
    },
    current: {
      title: "What I work on",
      description: `<span>
	<p>I'm mostly working on media web-applications using TypeScript, JavaScript, Zig and Rust (thanks to WebAssembly).<br>Right now the main project I lead is the RxPlayer, at Canal+ Group.<\p><p>The RxPlayer is a library allowing various front-end applications - among which Canal+' flagship products - to play live and VoD contents with adaptive streaming, multiple tracks and DRMs. It targets both the web and embedded platforms (set-top boxes, SmartTVs, ChromeCast, game consoles etc.).</p>

	<p>I also lead several other projects: some allowing media playback under more locked vendor-specific media APIs, but also debugging and reverse engineering tools helping front-end developpers to maintain those applications.<br>A part of the projects I maintain at Canal+ are <a href="https://github.com/canalplus/" target="_blank">open-source</a>¹.<br>I also maintain many <a href="https://github.com/peaberberian/" target="_blank">personal projects</a>.</p>

	<p class="asterisk"><span class="note">1</a>. Most projects at Canal+ are closed-source, including some that I lead. The few maintained open-sourced ones (that are under the <i>"canalplus"</i> organization on GitHub) all gravitate around the RxPlayer library and are all under my lead.</span></p>

	<div class=\"separator\"></div>

	<p>Previously, I worked on set-top boxes, to create large front-end applications with important stability constraints and many features not usually found in web platforms.<br/>Among them: updates, storage management, browsing in offline contexts, records scheduling, TV remote-based navigation, multi-devices support, media player integration and TV channel scanning.</p>
</span>`,
    },
    experiences: {
      title: "Experiences",
      description:
        "<p>I have more than 13 years of professional software engineering experience.</p>" +
        getJobs(jobs, env),
    },

    education: {
      title: "Education",
      description:
        '<p>I have a french engineering diploma (called <a href="https://en.wikipedia.org/wiki/Dipl%C3%B4me_d%27Ing%C3%A9nieur" target="_blank">"diplôme d\'ingénieur"</a>) - a 5-year diploma delivered by french engineering schools, equivalent to a master\'s degree in engineering.</p><p>My cursus had a specialization in telecommunications and networks engineering.</p>' +
        getSchools(schools, env),
    },
  };

  /**
   * Generate content of the "About Me" application.
   * @returns {Object}
   */
  const sidebar = [
    {
      icon: "👋🏻",
      text: "General info",
      centered: true,
      render: getSectionRenderCallback("general"),
    },
    {
      icon: "💼",
      text: "What I do",
      centered: true,
      render: getSectionRenderCallback("current"),
    },
    {
      icon: "🏢",
      text: "Experiences",
      section: "experiences",
      centered: true,
      render: getSectionRenderCallback("experiences"),
    },
    {
      icon: "🏫",
      text: "Education",
      centered: true,
      render: getSectionRenderCallback("education"),
    },
  ];
  return { sidebar };

  function getSectionRenderCallback(sectionName) {
    return (abortSignal) => {
      const wrapperElement = document.createElement("div");
      const titleElt = createAppTitle(wording[sectionName].title, {});
      wrapperElement.appendChild(titleElt);
      const descElt = document.createElement("div");
      descElt.innerHTML = `${wording[sectionName].description}`;
      wrapperElement.appendChild(descElt);

      if (sectionName === "general") {
        const psElt = document.createElement("p");
        const fullscreenBtnElt = document.createElement("span");
        fullscreenBtnElt.appendChild(createFullscreenButton(abortSignal));
        psElt.appendChild(fullscreenBtnElt);
        wrapperElement.appendChild(psElt);
      }
      return wrapperElement;
    };
  }
}

function getJobs(jobs, env) {
  return jobs
    .map(
      (jobObj) =>
        `<div class="job-item item-group">
  <div class="group-header">
		<span class= "item-group-img-container">
			<img height="${IMAGE_HEIGHT}px" width="${IMAGE_WIDTH}px" class="job-company-img item-group-img"
				alt="${jobObj.imgDescription}"
				src="${env.getImageRootPath() + jobObj.img}" />
		</span>
		<div class="job-title item-group-header">
			<span class="job-name item-group-name">${jobObj.jobTitle}</span>
			<br />
			<span class="job-date item-group-date">${jobObj.dateFrom} - ${jobObj.dateTo}</span>
		</div>
  </div>
  <div class="job-company item-group-loc">
    <span class="company-desc item-group-loc-desc">${jobObj.companyDescription}</span>
  </div>
  ${jobObj.jobDescription}
</div>
`,
    )
    .join("");
}
function getSchools(schools, env) {
  return schools
    .map(
      (schoolObj) =>
        `<div class="edu-item item-group">
  <div class="group-header">
		<span class= "item-group-img-container">
			<img height="${IMAGE_HEIGHT}px" width="${IMAGE_WIDTH}px" class="edu-school-img item-group-img"
				alt="${schoolObj.imgDescription}"
				src="${env.getImageRootPath() + schoolObj.img}" />
		</span>
		<div class="edu-title item-group-header">
			<span class="edu-diploma item-group-name">${schoolObj.diploma}</span>
			<br />
			<span class="edu-date item-group-date">${schoolObj.dateFrom} - ${schoolObj.dateTo}</span>
		</div>
  </div>
  <div class="edu-school item-group-loc">
    <span class="school-desc item-group-loc-desc">${schoolObj.schoolDescription}</span>
  </div>
  ${getSchool(schoolObj)}
</div>
`,
    )
    .join("");

  function getSchool(schoolObj) {
    return `<p>${schoolObj.firstLine}</p>
<p>${schoolObj.shortDescription}</p>
`;
  }
}

function formatQuickLinks(quickLinksData, env) {
  return quickLinksData
    .map(
      (linkInfo) =>
        `<a class="quicklink-link" href="${linkInfo.link}" target="_blank"><img class="quicklink-img" title="${linkInfo.description}" alt="${linkInfo.description}" src="${env.getImageRootPath() + linkInfo.img}"/></a>`,
    )
    .join("");
}
