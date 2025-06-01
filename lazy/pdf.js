/** This is the code for the app identified as "pdf". */
function v(l,e){let{constructAppHeaderLine:s}=e.appUtils,o={isLoaded:!1,pendingFile:null},n=document.createElement("div");n.style.position="relative",n.style.display="flex",n.style.flexDirection="column",n.style.height="100%",n.style.width="100%",n.style.backgroundColor=e.STYLE.bgColor;let a=document.createElement("div");f(a,{display:"none",position:"absolute",height:"100%",width:"100%",alignItems:"center",justifyContent:"center"});let p=document.createElement("div");p.className="spinner",a.appendChild(p),n.appendChild(a);let{element:g}=s([{name:"upload",onClick:()=>{n.setAttribute("inert",!0),a.style.display="flex";let t=document.createElement("input");t.type="file",t.accept="application/pdf",t.multiple=!1,t.click(),t.addEventListener("cancel",()=>{n.removeAttribute("inert"),a.style.display="none"}),t.addEventListener("change",r=>{let u=r.target.files;if(u.length===0){n.removeAttribute("inert"),a.style.display="none";return}let y=new FileReader,d=u[0];e.updateTitle(null,d.name+" - PDF Reader (pdf.js) \u{1F6A7} In construction"),y.onload=m=>{c(d.name,m.target.result),n.removeAttribute("inert"),a.style.display="none"},y.readAsArrayBuffer(d)})}},{name:"open",onClick:()=>{n.setAttribute("inert",!0),a.style.display="flex",o.isLoaded=!1,e.filePickerOpen({title:"Open a doc(x) from files stored on this Web Desktop",allowMultipleSelections:!1}).then(t=>{if(t.length===0){n.removeAttribute("inert"),a.style.display="none";return}let r=t[0];c(r.filename,r.data),n.removeAttribute("inert"),a.style.display="none"}).catch(t=>{h(n,"\u274C "+t.toString(),1e4),n.removeAttribute("inert"),a.style.display="none"})}}]);n.appendChild(g);let i=document.createElement("iframe");i.style.height="100%",i.style.width="100%",i.style.backgroundColor="grey",i.style.border="0",i.style.padding="0",i.style.margin="auto",n.appendChild(i),i.srcdoc=`<body style="margin: 0; padding: 7px; display: flex; justify-content: center">
<script type="module">
import * as pdfjsLib from "https://mozilla.github.io/pdf.js/build/pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.mjs";

onmessage = (e) => {
  if (e.data.type === "open-file") {
    document.body.innerHTML = "";
    const statusElt = document.createElement("p");
    statusElt.style.color = "white";
    statusElt.style.padding = "7px";
    statusElt.textContent = "Loading file...";
    document.body.appendChild(statusElt);
    const loadingTask = pdfjsLib.getDocument({ data: e.data.data });
    loadingTask.promise
      .then((result) => {
        result.getPage(1).then(function(page) {
          const canvas = document.createElement("canvas")
          canvas.style.border = "1px solid black";
          canvas.style.boxShadow = "0 -2px 10px rgba(0, 0, 0, 0.3)";
          const context = canvas.getContext('2d');
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          const renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            document.body.innerHTML = "";
            document.body.appendChild(canvas);
            return page.getTextContent();
          })
          .then(function(textContent) {
            const textLayerElt = document.createElement("div");
            textLayerElt.style.position = "absolute";
            textLayerElt.style.left = canvas.offsetLeft + 'px';
            textLayerElt.style.top = canvas.offsetTop + 'px';
            textLayerElt.style.height = canvas.offsetHeight + 'px';
            textLayerElt.style.width = canvas.offsetWidth + 'px';
            document.body.appendChild(textLayerElt);

            // // Worst API documentation of all time
            // // The text is not well-placed, why PDF.js, why?
            // const textLayer = new pdfjsLib.TextLayer({
            //   textContentSource: textContent,
            //   container: textLayerElt,
            //   viewport: viewport
            // });
            // textLayer.render();
          });
        });
        // TODO: communicate back number of pages and shit
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
</body>`,i.addEventListener("load",()=>{o.isLoaded=!0,o.pendingFile&&(i.contentWindow.postMessage({type:"open-file",data:o.pendingFile},window.location.origin),o.pendingFile=null)});for(let t of l)if(t.type==="file"){c(t.filename,t.data);break}return window.addEventListener("message",t=>{t.source===i.contentWindow&&t.data.type==="forwarded-event"&&b(i,t.data)}),{element:n};function c(t,r){e.updateTitle(null,t+" - PDF Reader (pdf.js) \u{1F6A7} In construction"),o.pendingFile=r,o.isLoaded&&(o.pendingFile=null,i.contentWindow.postMessage({type:"open-file",data:r},window.location.origin))}}function h(l,e,s=5e3){let o=document.createElement("div");o.textContent=e,f(o,{position:"absolute",top:"10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"rgba(0, 0, 0, 0.8)",color:"white",padding:"10px 20px",borderRadius:"4px",zIndex:"1000",transition:"opacity 0.3s",textAlign:"center"}),l.appendChild(o),setTimeout(()=>{o.style.opacity="0",setTimeout(()=>{o.remove()},350)},s)}function b(l,e){e.eventType.startsWith("touch")?l.dispatchEvent(new TouchEvent(e.eventType,{bubbles:!0,cancelable:!0,touches:e.touches||[],ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey,metaKey:e.metaKey})):l.dispatchEvent(new MouseEvent(e.eventType,{bubbles:!0,cancelable:!0,clientX:e.clientX,clientY:e.clientY,button:e.button,buttons:e.buttons,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey,metaKey:e.metaKey}))}function f(l,e){for(let s of Object.keys(e))l.style[s]=e[s]}export{v as create};
