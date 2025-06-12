/** This is the code for the app identified as "docx". */
function v(r,e){let{constructAppHeaderLine:a}=e.appUtils,i={isLoaded:!1,pendingFile:null},n=document.createElement("div");n.style.position="relative",n.style.display="flex",n.style.flexDirection="column",n.style.height="100%",n.style.width="100%",n.style.backgroundColor=e.STYLE.bgColor;let l=document.createElement("div");f(l,{display:"none",position:"absolute",height:"100%",width:"100%",alignItems:"center",justifyContent:"center"});let p=document.createElement("div");p.className="spinner",l.appendChild(p),n.appendChild(l);let{element:m}=a([{name:"upload",onClick:()=>{n.setAttribute("inert",!0),l.style.display="flex";let t=document.createElement("input");t.type="file",t.accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document",t.multiple=!1,t.click(),t.addEventListener("cancel",()=>{n.removeAttribute("inert"),l.style.display="none"}),t.addEventListener("change",s=>{let u=s.target.files;if(u.length===0){n.removeAttribute("inert"),l.style.display="none";return}let y=new FileReader,d=u[0];e.updateTitle(null,d.name+" - Docx Reader (docx.js)"),y.onload=g=>{c(d.name,g.target.result),n.removeAttribute("inert"),l.style.display="none"},y.readAsArrayBuffer(d)})}},{name:"open",onClick:()=>{n.setAttribute("inert",!0),l.style.display="flex",i.isLoaded=!1,e.filePickerOpen({title:"Open a docx from files stored on this Web Desktop",allowMultipleSelections:!1}).then(t=>{if(t.length===0){n.removeAttribute("inert"),l.style.display="none";return}let s=t[0];c(s.filename,s.data),n.removeAttribute("inert"),l.style.display="none"}).catch(t=>{h(n,"\u274C "+t.toString(),1e4),n.removeAttribute("inert"),l.style.display="none"})}}]);n.appendChild(m);let o=document.createElement("iframe");o.tabIndex="0",o.style.height="100%",o.style.width="100%",o.style.backgroundColor="gray",o.style.border="0",o.style.padding="0",o.style.margin="0",n.appendChild(o),o.srcdoc=`<body style="margin: 0; padding: 7px; display: flex; justify-content: center">
<script src="https://unpkg.com/jszip/dist/jszip.min.js"><\/script>
<script type="module">
import * as docxPreview from "https://cdn.jsdelivr.net/npm/docx-preview@0.3.5/+esm";

onmessage = (e) => {

  if (e.data.type === "open-file") {
    document.body.innerHTML = "";
    const statusElt = document.createElement("p");
    statusElt.style.color = "white";
    statusElt.style.padding = "7px";
    statusElt.textContent = "Loading file...";
    document.body.appendChild(statusElt);
    docxPreview.renderAsync(new Blob([e.data.data]), document.body)
      .then(() => {
        statusElt.remove();
      })
      .catch((err) => {
        statusElt.textContent = err.toString();
      });
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
</body>`,o.addEventListener("load",()=>{i.isLoaded=!0,i.pendingFile&&(o.contentWindow.postMessage({type:"open-file",data:i.pendingFile},window.location.origin),i.pendingFile=null)}),window.addEventListener("message",t=>{t.source===o.contentWindow&&t.data.type==="forwarded-event"&&E(o,t.data)});for(let t of r)if(t.type==="file"){c(t.filename,t.data);break}return{element:n};function c(t,s){e.updateTitle(null,t+" - Docx Reader (docx.js)"),i.pendingFile=s,i.isLoaded&&(i.pendingFile=null,o.contentWindow.postMessage({type:"open-file",data:s},window.location.origin))}}function h(r,e,a=5e3){let i=document.createElement("div");i.textContent=e,f(i,{position:"absolute",top:"10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"rgba(0, 0, 0, 0.8)",color:"white",padding:"10px 20px",borderRadius:"4px",zIndex:"1000",transition:"opacity 0.3s",textAlign:"center"}),r.appendChild(i),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>{i.remove()},350)},a)}function E(r,e){e.eventType.startsWith("touch")?r.dispatchEvent(new TouchEvent(e.eventType,{bubbles:!0,cancelable:!0,touches:e.touches||[],ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey,metaKey:e.metaKey})):r.dispatchEvent(new MouseEvent(e.eventType,{bubbles:!0,cancelable:!0,clientX:e.clientX,clientY:e.clientY,button:e.button,buttons:e.buttons,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey,metaKey:e.metaKey}))}function f(r,e){for(let a of Object.keys(e))r.style[a]=e[a]}export{v as create};
