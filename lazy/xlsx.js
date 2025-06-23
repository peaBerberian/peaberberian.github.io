/** This is the code for the app identified as "xlsx". */
function E(s,e){let{constructAppHeaderLine:a}=e.appUtils,i={isLoaded:!1,pendingFile:null},n=document.createElement("div");n.style.position="relative",n.style.display="flex",n.style.flexDirection="column",n.style.height="100%",n.style.width="100%",n.style.backgroundColor=e.STYLE.bgColor;let l=document.createElement("div");f(l,{display:"none",position:"absolute",height:"100%",width:"100%",alignItems:"center",justifyContent:"center"});let p=document.createElement("div");p.className="spinner",l.appendChild(p),n.appendChild(l);let{element:h}=a([{name:"upload",onClick:()=>{n.setAttribute("inert",!0),l.style.display="flex";let t=document.createElement("input");t.type="file",t.accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",t.multiple=!1,t.click(),t.addEventListener("cancel",()=>{n.removeAttribute("inert"),l.style.display="none"}),t.addEventListener("change",r=>{let u=r.target.files;if(u.length===0){n.removeAttribute("inert"),l.style.display="none";return}let y=new FileReader,d=u[0];e.updateTitle(null,d.name+" - Xslx Reader (xslx.js)"),y.onload=m=>{c(d.name,m.target.result),n.removeAttribute("inert"),l.style.display="none"},y.readAsArrayBuffer(d)})}},{name:"open",onClick:()=>{n.setAttribute("inert",!0),l.style.display="flex",i.isLoaded=!1,e.filePickerOpen({title:"Open a xlsx from files stored on this Web Desktop",allowMultipleSelections:!1}).then(t=>{if(t.length===0){n.removeAttribute("inert"),l.style.display="none";return}let r=t[0];c(r.filename,r.data),n.removeAttribute("inert"),l.style.display="none"}).catch(t=>{g(n,"\u274C "+t.toString(),1e4),n.removeAttribute("inert"),l.style.display="none"})}}]);n.appendChild(h);let o=document.createElement("iframe");o.tabIndex="0",o.style.height="100%",o.style.width="100%",o.style.backgroundColor="gray",o.style.border="0",o.style.padding="0",o.style.margin="0",n.appendChild(o),o.srcdoc=`<html><head>
<style>
table {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: white;
  border-collapse: collapse;
}
td, th {
  border: 1px solid #000;
}
</style>
</head>
<body style="margin: 0; display: flex; justify-content: center">
<script src="https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js"><\/script>
<script type="module">
onmessage = (e) => {
  if (e.data.type === "open-file") {
    document.body.innerHTML = "";
    const statusElt = document.createElement("p");
    statusElt.style.color = "white";
    statusElt.textContent = "Loading file...";
    document.body.appendChild(statusElt);

    const workbook = XLSX.read(e.data.data, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const html = XLSX.utils.sheet_to_html(worksheet);
    document.body.innerHTML = html;
  }
};

["mousedown", "mouseup", "click", "touchstart", "touchend"].forEach(eventType => {
  document.addEventListener(eventType, function(e) {
    forwardEvent(eventType, e);
  }, true);
});
[].forEach(eventType => {
  document.addEventListener(eventType, function(e) {
    forwardEvent(eventType, e);
  }, true);
});

// Forward mouse and touch events to parent
function forwardEvent(eventType, originalEvent) {
  const eventData = {
    type: "forwarded-event",
    eventType: eventType,
    clientX: originalEvent.clientX,
    clientY: originalEvent.clientY,
    pageX: originalEvent.pageX,
    pageY: originalEvent.pageY,
    button: originalEvent.button,
    buttons: originalEvent.buttons,
    ctrlKey: originalEvent.ctrlKey,
    shiftKey: originalEvent.shiftKey,
    altKey: originalEvent.altKey,
    metaKey: originalEvent.metaKey,
    timestamp: Date.now()
  };

  if (originalEvent.touches) {
    eventData.touches = Array.from(originalEvent.touches).map(touch => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      pageX: touch.pageX,
      pageY: touch.pageY,
      identifier: touch.identifier
    }));
  }
  parent.postMessage(eventData, ${JSON.stringify(window.location.origin)});
}
<\/script>
</body></html>`,o.addEventListener("load",()=>{i.isLoaded=!0,i.pendingFile&&(o.contentWindow.postMessage({type:"open-file",data:i.pendingFile},window.location.origin),i.pendingFile=null)}),window.addEventListener("message",t=>{t.source===o.contentWindow&&t.data.type==="forwarded-event"&&b(o,t.data)});for(let t of s)if(t.type==="file"){c(t.filename,t.data);break}return{element:n};function c(t,r){e.updateTitle(null,t+" - Xslsx Reader (xlsx.js)"),i.pendingFile=r,i.isLoaded&&(i.pendingFile=null,o.contentWindow.postMessage({type:"open-file",data:r},window.location.origin))}}function g(s,e,a=5e3){let i=document.createElement("div");i.textContent=e,f(i,{position:"absolute",top:"10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"rgba(0, 0, 0, 0.8)",color:"white",padding:"10px 20px",borderRadius:"4px",zIndex:"1000",transition:"opacity 0.3s",textAlign:"center"}),s.appendChild(i),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>{i.remove()},350)},a)}function b(s,e){e.eventType.startsWith("touch")?s.dispatchEvent(new TouchEvent(e.eventType,{bubbles:!0,cancelable:!0,touches:e.touches||[],ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey,metaKey:e.metaKey})):s.dispatchEvent(new MouseEvent(e.eventType,{bubbles:!0,cancelable:!0,clientX:e.clientX,clientY:e.clientY,button:e.button,buttons:e.buttons,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey,metaKey:e.metaKey}))}function f(s,e){for(let a of Object.keys(e))s.style[a]=e[a]}export{E as create};
