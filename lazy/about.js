/** This is the code for the app identified as "about". */
var g=[{link:"https://github.com/peaBerberian",description:"Link to my GitHub account",img:"github.png"},{link:"https://www.linkedin.com/in/paul-berberian-6a685335/",description:"Link to my LinkedIn page",img:"linkedin.png"}],u=[{dateFrom:"2017/05",dateTo:"Today",jobTitle:"Tech Lead",company:"Canal+ Group",companyDescription:"<b>Canal+ Group</b> is a french media company which broadcasts and produces contents for multiple countries.",jobDescription:'<p>Lead developer of several media-related projects, including the <a href="https://github.com/canalplus/rx-player" target="_blank">RxPlayer</a>: A featureful media player for the web with adaptive streaming, live playback, low-latency streaming, support of multiple devices and DRMs.</p><p>The RxPlayer is an on-going project used in production for internal needs and several premium products at Canal+ as well as outside the company.</p><p>I also lead several other projects some open-source, some closed-source, to help with the development of those media products.</p>',img:"canal.png",imgDescription:"Canal+"},{dateFrom:"2014/09",dateTo:"2017/04",jobTitle:"Software developer",company:"Davidson Consulting",companyDescription:'<b>Davidson Consulting</b> is a french consulting company named 4 times in a row (between 2014 and 2017 included) at the top of the "best place to work" ranking for french companies.',jobDescription:"<p>Worked with Canal+ in the STB development team where we designed and developed new interfaces for various set-top boxes and other similar platforms.</p><p>In particular, I worked on several aspects of those applications like general design, media player integration, TV remote controls, GUI, porting the API abstraction layer to multiple devices and others. We did all of that with the help of multiple JavaScript libraries: mainly RxJS, React, flow, Redux and BackboneJS.</p>",img:"davidson2.png",imgDescription:"Davidson Consulting"},{dateFrom:"2011/09",dateTo:"2014/08",jobTitle:"Software developer / Assistant Project Manager",company:"Orange",companyDescription:"<b>Orange</b> is a french telecommunications corporation. It provides mobile, landline, internet and IPTV services in multiple countries.",jobDescription:"<p>Worked as a software developer helping the project managers of the IPTV division.</p><p>Those 3 years were done in apprenticeship, as I continued to study at my engineering school at the time.</p>The programming languages I used to create these tools were varied depending on the project: PHP, javascript, Node.js, Java Android and VBA - for Microsoft Office documents.</p>",img:"orange.png",imgDescription:"Orange"},{dateTo:"08/2011",dateFrom:"06/2011",jobTitle:"Telecommunications technician",company:"Orange",companyDescription:"<b>Orange</b> is a french telecommunications corporation. It provides mobile, landline, internet and IPTV services in multiple countries.",jobDescription:"<p>These 3 months in Orange were in the context of an internship. I had as a mission to help with the maintenance of Orange's local loop in Paris.</p>",img:"orange.png",imgDescription:"Orange"}],h=[{dateFrom:"2011/09",dateTo:"2014/08",schoolName:"ESIEE Paris",diploma:"Engineering Diploma",schoolDescription:"The Electronics and Electrical Engineering school (<b>ESIEE Paris</b>) is a french engineering school specialized in electronic engineering.",firstLine:"5-year engineering diploma (equivalent to a master's degree in engineering) with a specialization in Networks and Telecommunications.",shortDescription:"This cursus was done in apprenticeship (I also worked at Orange during that time) and it ended with a foreign experience: 6 month in a chinese university (Xidian University in Xi'An) where I studied Networks and Computer Science.<br />The ESIEE Paris cursus included courses in programming (mainly algorithms, Java and C), networks (tcp/ip, mobile networks, routing...) and system management (mostly linux-related administration).",img:"esiee2.png",imgDescription:"ESIEE"},{dateFrom:"2013/09",dateTo:"2014/02",schoolName:"Xidian University (Chinese: \u897F\u5B89\u7535\u5B50\u79D1\u6280\u5927\u5B66)",diploma:"University exchange in a master's degree context",schoolDescription:"<b>Xidian</b> is a chinese university specialized in electronic engineering",firstLine:"6 months in Xidian done as an university Exchange (with ESIEE Paris).",shortDescription:"I followed several courses concerning networks engineering and computer science there, in english, while learning (trying to!) chinese and living in immersion in this country. This was definitely a good experience as well on a personal than on an educational level",img:"xidian2.png",imgDescription:"Xidian"},{dateFrom:"2009/09",dateTo:"2011/08",schoolName:"UPEC",diploma:"DUT in network and telecommunications",schoolDescription:'<b>UPEC</b>, for "East-Paris University", is a multi-disciplinary university located both in and close to Paris.',firstLine:'I obtained a 2-year "DUT" diploma in the French UPEC university where I studied networks, telecommunications and computer science.',shortDescription:"",img:"upec2.png",imgDescription:"UPEC"}];function w(t,n){let{createAppTitle:e,createFullscreenButton:i}=n.appUtils,s={general:{title:"Welcome \u{1F44B}\u{1F3FB}",description:`<div>
  <p>Hi, I'm Paul Berberian, a software engineer and tech lead at Canal+ Group in Montpellier, France.<br>I lead media streaming projects, including the open-source <a href="https://github.com/canalplus/rx-player" target="_blank">RxPlayer</a> that powers Canal+ and other streaming platforms worldwide.</p>

  <p>You're on my personal website which implements a desktop environment. Everything you see here was built specifically for this desktop without any external dependency.</p>

  <p><b>Also note that everything you do here, even files you save or load on this site, never leaves your computer. This website doesn't track nor collect your data.</b></p>

  <p>To contact me, send an e-mail to: <a href="mailto:paul.berberian@proton.me">paul.berberian@proton.me</a>.</p>

<div class="quickLinks"><b>External links: </b>${b(g,n)}</div></div>`},current:{title:"What I work on",description:`<span>
<p>I primarily work on media web applications using TypeScript, JavaScript, and Rust (via WebAssembly).<br>My main project is the RxPlayer at Canal+ Group, an adaptive streaming library handling live and VoD contents with DRM support for millions of simultaneous users across web browsers, set-top boxes, smart TVs, and gaming consoles.</p>

<p>Beyond the RxPlayer, I lead various media playback projects and develop debugging tools for front-end developers. A few of these are <a href="https://github.com/orgs/canalplus/repositories" target="_blank">open-source</a>\xB9, and I maintain many <a href="https://github.com/peaberberian/" target="_blank">personal projects</a> as well.</p>

<div class="separator"></div>

<p>Previously, I developed set-top box applications with unique constraints: software updates, storage management, offline browsing, TV remote navigation, and multi-device support in environments quite different from typical web applications.</p>

<div class="separator"></div>

<p>I consider myself proficient with the web platform, having led projects ranging from React-based UIs to specialized libraries that leverage advanced and domain-specific web APIs.</p>

<p class="asterisk"><span class="note">1. Most projects at Canal+ are closed-source, including some that I lead. The few open-source ones are all under my lead.</span></p>


</span>`},experiences:{title:"Experiences",description:"<p>I have more than 13 years of professional software engineering experience.</p>"+v(u,n)},education:{title:"Education",description:`<p>I have a french engineering diploma (called <a href="https://en.wikipedia.org/wiki/Dipl%C3%B4me_d%27Ing%C3%A9nieur" target="_blank">"dipl\xF4me d'ing\xE9nieur"</a>) - a 5-year diploma delivered by french engineering schools, equivalent to a master's degree in engineering.</p><p>My cursus had a specialization in telecommunications and networks engineering.</p>`+f(h,n)}};return{sidebar:[{icon:"\u{1F44B}\u{1F3FB}",text:"General info",centered:!0,render:a("general")},{icon:"\u{1F4BC}",text:"What I do",centered:!0,render:a("current")},{icon:"\u{1F3E2}",text:"Experiences",section:"experiences",centered:!0,render:a("experiences")},{icon:"\u{1F3EB}",text:"Education",centered:!0,render:a("education")}]};function a(r){return d=>{let o=document.createElement("div"),m=e(s[r].title,{});o.appendChild(m);let p=document.createElement("div");if(p.innerHTML=`${s[r].description}`,o.appendChild(p),r==="general"){let c=document.createElement("p"),l=document.createElement("span");l.appendChild(i(d)),c.appendChild(l),o.appendChild(c)}return o}}}function v(t,n){return t.map(e=>`<div class="job-item item-group">
  <div class="group-header">
    <span class= "item-group-img-container">
      <img height="45px" width="60px" class="job-company-img item-group-img"
        alt="${e.imgDescription}"
        src="${n.getImageRootPath()+e.img}" />
    </span>
    <div class="job-title item-group-header">
      <span class="job-name item-group-name">${e.jobTitle}</span>
      <br />
      <span class="job-date item-group-date">${e.dateFrom} - ${e.dateTo}</span>
    </div>
  </div>
  <div class="job-company item-group-loc">
    <span class="company-desc item-group-loc-desc">${e.companyDescription}</span>
  </div>
  ${e.jobDescription}
</div>
`).join("")}function f(t,n){return t.map(i=>`<div class="edu-item item-group">
  <div class="group-header">
    <span class= "item-group-img-container">
      <img height="45px" width="60px" class="edu-school-img item-group-img"
        alt="${i.imgDescription}"
        src="${n.getImageRootPath()+i.img}" />
    </span>
    <div class="edu-title item-group-header">
      <span class="edu-diploma item-group-name">${i.diploma}</span>
      <br />
      <span class="edu-date item-group-date">${i.dateFrom} - ${i.dateTo}</span>
    </div>
  </div>
  <div class="edu-school item-group-loc">
    <span class="school-desc item-group-loc-desc">${i.schoolDescription}</span>
  </div>
  ${e(i)}
</div>
`).join("");function e(i){return`<p>${i.firstLine}</p>
<p>${i.shortDescription}</p>
`}}function b(t,n){return t.map(e=>`<a class="quicklink-link" href="${e.link}" target="_blank"><img class="quicklink-img" title="${e.description}" alt="${e.description}" src="${n.getImageRootPath()+e.img}"/></a>`).join("")}export{w as create};
