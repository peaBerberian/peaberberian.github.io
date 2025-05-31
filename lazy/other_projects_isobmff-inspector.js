/** This is the code for the app identified as "other_projects_isobmff-inspector". */
var a="https://peaberberian.github.io/AISOBMFFWVDFBUTFAII/",o="https://github.com/peaberberian/isobmff-inspector";function r(s,t){let{createAppTitle:n}=t.appUtils;return t.updateTitle(null,"Other Projects: isobmff-inspector.rs"),{sidebar:[{text:"Overview",icon:"\u{1F9D1}\u200D\u{1F3EB}",centered:!0,render:()=>{let e=document.createElement("div");e.appendChild(n("isobmff-inspector",{github:o,demo:a}));let i=document.createElement("div");return e.appendChild(i),i.innerHTML=`<p>ISOBMFF-inspector is an ISOBMFF-compatible (for example: "mp4" files) file parser written in JavaScript.</p>

  <p>When working on technical aspects of a media player, you end-up having to understand at least the basics of multiple media formats and compression standards.</p>

  <p>One of the most ubiquitous formats you encounter are mp4 container files.<br>Those follow a specific syntax allowing those files to both contain metadata and compressed media (e.g. the audio and/or video itself). Those are binary files with very flexible contents making them hard to manually inspect.</p>
  <p>Isobmff-inspector is a simple parser for those files allowing to visualize the metadata contained in a mp4 file. I often use it in professional contexts when inspecting some playback-related issues.</p>`,e}}]}}export{r as create};
