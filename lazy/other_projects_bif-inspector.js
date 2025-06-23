/** This is the code for the app identified as "other_projects_bif-inspector". */
var a="https://peaberberian.github.io/bif-inspector/",o="https://github.com/peaberberian/bif-inspector";function n(r,e){let{createAppTitle:s}=e.appUtils;return e.updateTitle(null,"Other Projects: bif-inspector"),{sidebar:[{text:"Overview",icon:"\u{1F9D1}\u200D\u{1F3EB}",centered:!0,render:()=>{let t=document.createElement("div");t.appendChild(s("bif-inspector",{github:o,demo:a}));let i=document.createElement("div");return t.appendChild(i),i.innerHTML=`<p>bif-inspector is a tool allowing to inspect "BIF" files.</p>

<img style="width: 100%" src="${e.getImageRootPath()+"bif-inspector-screenshot.png"}" alt="bif-inspector's screenshot" />


<p>The "BIF" format is frequently used by streaming platforms to package together "thumbnails": compact images that represents video data at a regular intervals.<br>Then those thumbnails are generally used to implement "seeking previews" which are small-ish preview images you see when moving your mouse over a streaming website's UI.</p>

<div class="separator"></div>

<p>Inside, BIF is just an archive format of several discrete images concatenated with metadata, making their parsing client-side straightforward and efficient.<br>This is not the only way streaming platforms provide thumbnails however. Multiple solutions exist, each with its pros and cons.</p>
<p>The main issues with BIF files are linked to the fact that those files contain all thumbnails for a given content, making them unsuitable for live contents or very long VoD contents. For those situations, other solution exists: if you want to know more you can for example search the terms "DASH thumbnails", "trickmode tracks" as well as "i-frame playlists" - those are all other standards and popular ways to provide thumbnails when BIF is not a good fit.</p>`,t}}]}}export{n as create};
