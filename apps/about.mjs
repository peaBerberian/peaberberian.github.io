// I don't want to tell my birthday online for some reason, so I set up a funny
// value instead, yet rest assured that you weren't fooled that much, the
// operation it ends up to be used in is statistically more right than wrong.
let MY_VERY_TOTALLY_REAL_BIRTHDAY_DAY = new Date("1991-02-31");

// NOTE: That date doesn't even exists - but it seems to work on most JS
// implementation.
// What they have to do in cases of invalid dates is not that clear to me,
// though there could be a way to assume that it would be legal:
//
// -  You have first the "Date Time String Format"
//    https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
//
//    Which says that the "day" part of that format can be from the range 01 to
//    31 without telling anything about dates that do not exist in the context
//    of the associated year and month.
//
// - Then there's the Date parse algorithm, which is what is called here with
//   this constructor:
//   https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.parse
//
//   The spec does talk about "Strings that [...[ contain out-of-bounds format
//   element values shall cause this function to return NaN, but to me the
//   out-of-bounds nature would be to the "Date Time String's Format" rules, not
//   to actual "real" gregorian date and I think we passed the "Date Time String
//   Format" check as stated in the previous point.
//
// - However that Date.parse algorithm is supposed to output a "Number": the
//   "UTC Time Value" for that string which is just defined as your usual unix
//   timestamp in milliseconds. Details on how the conversions between the two
//   are not explicited it seems.
//
// So to me, declaring a fake date that is still within the bounds of the "Date
// Time String Format" is legal and should be handled by JS implementations. Yet
// I understand that this may be ambiguous. For this reason, I do add this
// fallback.
if (isNaN(MY_VERY_TOTALLY_REAL_BIRTHDAY_DAY)) {
  MY_VERY_TOTALLY_REAL_BIRTHDAY_DAY = new Date("1991-03-01");
}

const IMAGE_HEIGHT = 45;
const IMAGE_WIDTH = 60;

const quickLinks = [
  {
    link: "https://github.com/peaBerberian",
    label: "GitHub",
    description: "Link to my GitHub account",
    img: "github.png",
  },
  {
    link: "https://www.linkedin.com/in/paul-berberian-6a685335/",
    label: "LinkedIn",
    description: "Link to my LinkedIn page",
    img: "linkedin.png",
  },
];

const selectedProjects = [
  {
    id: "rx-player",
    image: "rx-player-play.svg",
    title: "RxPlayer",
    description: "The open-source media player I lead at Canal+ Group.",
    path: "/apps/other_projects_rx-player.run",
  },
  {
    id: "wasp-hls",
    image: "wasp-hls.svg",
    title: "WASP-HLS",
    description:
      "A media player written mainly in Rust, running through WebAssembly and Web Workers.",
    path: "/apps/other_projects_wasp-hls.run",
  },
  {
    id: "rx-paired",
    icon: "📈",
    title: "RxPaired",
    description:
      "A lightweight remote debugger for the RxPlayer, designed to work on constrained devices.",
    path: "/apps/other_projects_rx-paired.run",
  },
  {
    id: "isobmff-inspector",
    image: "isobmff-inspector.svg",
    title: "isobmff-inspector",
    description:
      "The parser behind an interactive tool to inspect MP4-like media files.",
    path: "/apps/other_projects_isobmff-inspector.run",
  },
  {
    id: "eme-spy",
    image: "eme-spy.svg",
    title: "EMESpy",
    description:
      "A tool to understand how web players use browser APIs for media DRMs.",
    path: "/apps/other_projects_eme-spy.run",
  },
  {
    id: "mse-spy",
    image: "mse-spy.svg",
    title: "MSESpy",
    description:
      "A similar tool focused on the browser APIs used to buffer media.",
    path: "/apps/other_projects_mse-spy.run",
  },
];

const jobs = [
  {
    dateFrom: "2017/05",
    dateTo: "Today",
    jobTitle: "Tech Lead",
    company: "Canal+ Group",
    companyDescription:
      "<b>Canal+ Group</b> is a French media company which produces and broadcasts content in multiple countries.",
    jobDescription:
      '<p>I work on the architecture, development and maintenance of Canal+ Group\'s cross-platform media playback systems.</p><p>I have led the development of the <a href="https://github.com/canalplus/rx-player" target="_blank">RxPlayer</a> as it grew from an internal R&D project into a player used by several Canal+ entities and other broadcasters. It supports DASH and Smooth Streaming across browsers, smart TVs, gaming consoles, set-top boxes and Chromecast. During major sporting events, it runs in more than one million concurrent playback sessions in France alone.</p><p>I work on low-latency playback, multi-threading, multi-key DRM, playback resilience, performance and device compatibility. I also investigate complex playback issues which may come from the application, the player, the browser, the DRM system, the device, or the distribution infrastructure.</p><p>My work also includes DVB-S and multicast playback, R&D on new media features, remote debugging tools, and libraries for device-specific media APIs. I work in a small core team and mentor the other engineer working with me.</p><p>I also lead several open-source projects around the RxPlayer, including <a href="https://github.com/canalplus/rx-paired" target="_blank">RxPaired</a> and other supporting tools and libraries.</p>',
    img: "canal.png",
    imgDescription: "Canal+",
  },
  {
    dateFrom: "2014/09",
    dateTo: "2017/04",
    jobTitle: "Software developer",
    company: "Davidson Consulting",
    companyDescription:
      '<b>Davidson Consulting</b> is a French consulting company named 4 times in a row (between 2014 and 2017 included) at the top of the "best place to work" ranking for French companies.',
    jobDescription:
      "<p>I worked at Canal+ Group on two generations of applications for set-top boxes, smart TVs, gaming consoles and other similar devices.</p><p>Those were large web applications with several layers: a JavaScript front-end, a JavaScript core containing logic such as video playback, channel scanning and software updates, and a Python layer exposing lower-level C++ and D-Bus APIs.</p><p>I also ported those applications to several device families. This involved abstracting platform-specific APIs and working with memory-constrained devices and unusual embedded environments.</p><p>The main technologies included JavaScript, React, Redux, RxJS, Backbone.js, Python, QML, and CEF.</p>",
    img: "davidson2.png",
    imgDescription: "Davidson Consulting",
  },

  {
    dateFrom: "2011/09",
    dateTo: "2014/08",
    jobTitle: "Software developer / Engineering apprenticeship",
    company: "Orange",
    companyDescription:
      "<b>Orange</b> is a French telecommunications corporation. It provides mobile, landline, internet and IPTV services in multiple countries.",
    jobDescription:
      "<p>I worked in Orange's IPTV division while studying at engineering school. I developed applications and internal tools for both developers and project managers.</p><p>This included web applications for set-top boxes, an Android application used to control the TV experience, tools for quickly prototyping IPTV projects, and VBA tooling for Microsoft Office documents.</p><p>Depending on the project, I mainly used JavaScript, Node.js, PHP, Java for Android and VBA.</p>",
    img: "orange.png",
    imgDescription: "Orange",
  },

  {
    dateTo: "08/2011",
    dateFrom: "06/2011",
    jobTitle: "Telecommunications technician",
    company: "Orange",
    companyDescription:
      "<b>Orange</b> is a French telecommunications corporation. It provides mobile, landline, internet and IPTV services in multiple countries.",
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
      "The Electronics and Electrical Engineering school (<b>ESIEE Paris</b>) is a French engineering school specialized in electronic engineering.",
    firstLine:
      "5-year engineering diploma (equivalent to a master's degree in engineering) with a specialization in Networks and Telecommunications.",
    shortDescription:
      "This cursus was done in apprenticeship (I also worked at Orange during that time) and it ended with a foreign experience: 6 months in a Chinese university (Xidian University in Xi'An) where I studied Networks and Computer Science.<br />The ESIEE Paris cursus included courses in programming (mainly algorithms, Java and C), networks (TCP/IP, mobile networks, routing...) and system management (mostly Linux-related administration).",
    img: "esiee2.png",
    imgDescription: "ESIEE",
  },

  {
    dateFrom: "2013/09",
    dateTo: "2014/02",
    schoolName: "Xidian University (Chinese: 西安电子科技大学)",
    diploma: "University exchange in a master's degree context",
    schoolDescription:
      "<b>Xidian</b> is a Chinese university specialized in electronic engineering",
    firstLine:
      "6 months in Xidian as a university exchange (with ESIEE Paris).",
    shortDescription:
      "I followed several courses concerning networks engineering and computer science there, in English, while learning (trying to!) Chinese and living in immersion in this country. This was definitely a good experience, both on a personal and educational level.",
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
  <p>Hi, I'm Paul Berberian. I'm a software engineer and tech lead at Canal+ Group.</p>

  <p>I mostly work on video playback across browsers, TVs, consoles and set-top boxes. My main project is the <a href="https://github.com/canalplus/rx-player" target="_blank">RxPlayer</a>, an open-source adaptive-streaming library used by Canal+ and several other broadcasters.</p>

  <p>You're on my personal website which implements a desktop environment. Everything you see here was built specifically for this desktop without any external dependency.<br>
  <i>Note that everything you do here, even files you save or load on this site, never leaves your computer. This website doesn't track nor collect your data.</i></p>

  <p>To contact me, send an e-mail to: <a href="mailto:paul.berberian@proton.me">paul.berberian@proton.me</a>.</p>

<div class="quickLinks"><b>External links: </b>${formatQuickLinks(quickLinks, env)}</div></div>`,
    },
    current: {
      title: "What I work on",
      description: `<span>
<p>At Canal+ Group, I primarily work on media playback projects, mainly using TypeScript, JavaScript, and Rust (through WebAssembly).</p>

<p>Most of that work is around the <a href="https://github.com/canalplus/rx-player" target="_blank">RxPlayer</a>, an adaptive streaming library supporting live and VoD contents, DRM, low-latency playback, and many different devices. It is used across web browsers, set-top boxes, smart TVs, and gaming consoles. During major sporting events, Canal+ has measured more than one million concurrent RxPlayer playback sessions in France alone.</p>

<p>I also lead other media playback projects and develop tools to debug web players. Some of those projects are <a href="https://github.com/orgs/canalplus/repositories" target="_blank">open-source</a>, while many others are only used internally. Outside of work, I also maintain several <a href="https://github.com/peaberberian/" target="_blank">personal projects</a>.</p>

<div class="separator"></div>

<p>A lot of my work happens below the usual web application layer. It involves browser and device differences, media-specific web APIs, Web Workers, memory usage, performance, and DRM. I also investigate playback issues which may come from the application, the player, the browser, the device, or the streaming infrastructure.</p>

<div class="separator"></div>

<p>Previously, I developed set-top box applications with unusual constraints: software updates, storage management, offline browsing, TV remote navigation, and support for multiple devices in environments quite different from typical web applications.</p>

<p>More generally, I have worked on the web platform for many years, from React-based interfaces to specialized libraries using less common and more domain-specific web APIs.</p>

<br>

</span>`,
    },
    projects: {
      title: "Selected projects",
      description: `<div>
<p class="about-project-intro">Here are a few projects representative of what I work on. Each one can be opened as an application on this desktop.</p>
${formatSelectedProjects(selectedProjects, env)}
</div>`,
    },
    experiences: {
      title: "Experience",
      description:
        "<p>I have worked professionally as a software engineer since 2011.</p>" +
        getJobs(jobs, env),
    },

    education: {
      title: "Education",
      description:
        '<p>I have a French engineering diploma (called a <a href="https://en.wikipedia.org/wiki/Dipl%C3%B4me_d%27Ing%C3%A9nieur" target="_blank">"diplôme d\'ingénieur"</a>) - a 5-year diploma delivered by French engineering schools, equivalent to a master\'s degree in engineering.</p><p>My cursus had a specialization in telecommunications and networks engineering.</p>' +
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
      icon: "🧪",
      text: "Projects",
      centered: true,
      render: getSectionRenderCallback("projects"),
    },
    {
      icon: "🏢",
      text: "Experience",
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

      if (sectionName === "projects") {
        for (const projectElt of descElt.querySelectorAll(
          ".about-project-link",
        )) {
          const project = selectedProjects.find(
            ({ id }) => id === projectElt.dataset.projectId,
          );
          projectElt.addEventListener("click", () => {
            env.open(project.path);
          });
        }
      }

      if (sectionName === "general") {
        const fullscreenAction = document.createElement("p");
        fullscreenAction.className = "about-fullscreen-action";
        const fullscreenButton = createFullscreenButton(abortSignal);
        fullscreenButton.classList.add("about-fullscreen-button");
        fullscreenAction.appendChild(fullscreenButton);
        descElt.appendChild(fullscreenAction);
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
        `<a class="about-external-link" href="${linkInfo.link}" target="_blank" rel="noreferrer"><img class="quicklink-img" alt="" src="${env.getImageRootPath() + linkInfo.img}"/><span>${linkInfo.label}</span></a>`,
    )
    .join("");
}

function formatSelectedProjects(projects, env) {
  return `<div class="about-project-list">${projects
    .map((project) => {
      const icon = project.image
        ? `<img src="${env.getImageRootPath() + project.image}" alt="" />`
        : project.icon;
      return `<button class="about-project-link" type="button" data-project-id="${project.id}">
  <span class="about-project-icon" aria-hidden="true">${icon}</span>
  <span class="about-project-text"><b>${project.title}</b><span>${project.description}</span></span>
</button>`;
    })
    .join("")}</div>`;
}

function getAlmostAge() {
  // May deviate max a day, on purpose, I don't care at all for exactness here
  const age = Math.floor(
    (new Date() - MY_VERY_TOTALLY_REAL_BIRTHDAY_DAY) /
      (365.25 * 24 * 60 * 60 * 1000),
  );
  const ageStr = age.toString();

  // Yes, I **WANT** to still have the right article at like 809134 y.o.
  const article = ageStr[0] === "8" ? "an" : "a";
  return `${article} ${ageStr} y.o.`;
}
