var n="https://github.com/canalplus/RxPaired";function c(h,o){let{strHtml:e,createAppTitle:i,applyStyle:r}=o.appUtils;return{sidebar:[{text:"Overview",render:a},{text:"Why this project",centered:!0,render:d}]};function a(){return e`<div>
${i("RxPaired",{github:n})}

<p><a href="${n}" target="_blank">RxPaired</a> is a remote debugger lightweight on resources, with an RxPlayer specialization.<br>
We use it daily at Canal+ Group to debug our applications.</p>

<p>Here's what it looks like when running:</p>

${l()}

</div>`}function d(){return e`<div>
	${i("Why creating this?",{})}

	<p>This project is linked to Canal+' media player: the RxPlayer.</p>

  <p>The RxPlayer runs in production on many devices with low performances (e.g. some old smart TVs, set-top boxes and usb dongles) which can frequently show issues.<br>
	We previously relied on tools such as Google Chrome's or webkit's own inspectors but on constrained devices, those debuggers have endurance issues: they cannot run for sometimes more than a minute.</p>

	<div class=\"separator\"></div>

	<p>The global idea of RxPaired, is that the tested device will regularly send "enriched" logs (the basic logs with some more information added, such as timestamps, info on HTTP traffic etc.), either through a WebSocket connection or through HTTP POST requests. Then, the "inspector" part of that tool - running on your computer and receiving such logs - exploit the received metadata.<br>
	We added a lot of features over time: time-travel (being able to "rewind time" to see conditions when a previous log was sent), network-bandwidth estimates, being able to send instructions to the device etc.</p>

	<p>We even saw usage for cases which do not rely on the RxPlayer, where it is used as a lightweight log server when the browser's own debugger is not reliable / easily usable.</p>
</div>`}function l(){let t=e`<div />`;r(t,{border:"2px dotted var(--window-line-color)",paddingTop:String(580/1e3*100)+"%",position:"relative",display:"block"});let s=e`<img style="width: 100%; position: absolute; top: 0" src="${o.getImageRootPath()+"rx-paired-screenshot.png"}" alt="RxPaired's screenshot" />`;return r(s,{width:"100%",position:"absolute",top:"0"}),t.appendChild(s),t}}export{c as create};
