var a="https://peaberberian.github.io/AISOBMFFWVDFBUTFAII/",s="https://github.com/peaberberian/isobmff-inspector";function n(o,e){let{strHtml:t,createAppTitle:i}=e.appUtils;return{sidebar:[{text:"Overview",icon:"\u{1F9D1}\u200D\u{1F3EB}",centered:!0,render:()=>t`<div>
	${i("isobmff-inspector",{github:s,demo:a})}

	<p>ISOBMFF-inspector is an ISOBMFF-compatible (for example: "mp4" files) file parser written in JavaScript.</p>

	<p>When working on technical aspects of a media player, you end-up having to understand at least the basics of multiple media formats and compression standards.</p>

	<p>One of the most ubiquitous formats you encounter are mp4 container files.<br>Those follow a specific syntax allowing those files to both contain metadata and compressed media (e.g. the audio and/or video itself). Those are binary files with very flexible contents making them hard to manually inspect.</p>
	<p>Isobmff-inspector is a simple parser for those files allowing to visualize the metadata contained in a mp4 file. I often use it in professional contexts when inspecting some playback-related issues.</p>

</div>`}]}}export{n as create};
