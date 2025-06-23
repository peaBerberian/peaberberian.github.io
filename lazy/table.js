/** This is the code for the app identified as "table". */
var z=document.createElement("style");z.textContent=`
.__table_app_spreadsheet {
  overflow: auto;
  margin: 20px;
  background-color: var(--window-content-bg);
  color: var(--window-text-color);
  overflow: auto;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.__table_app_spreadsheet-table {
  border-collapse: collapse;
  table-layout: fixed;
}

.__table_app_spreadsheet-table th, 
.__table_app_spreadsheet-table td {
  border: 1px solid var(--window-line-color);
  padding: 3px;
  text-align: left;
  position: relative;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  max-height: 100%;
}

.__table_app_spreadsheet-table tr {
  height: 20px;
  line-height: 20px;
}

.__table_app_spreadsheet-table td {
  text-align: right;
}

.__table_app_spreadsheet-table th {
  background-color: var(--app-primary-bg);
  font-weight: bold;
  position: relative;
  user-select: none;
}

.__table_app_spreadsheet-table .header-row th {
  text-align: center;
}

.__table_app_spreadsheet-table tr > th:first-child {
  text-align: center;
}

.resizer {
  position: absolute;
  background: transparent;
  z-index: 1;
}

.col-resizer {
  width: 5px;
  top: 0;
  right: 0;
  bottom: 0;
  cursor: col-resize;
}

.row-resizer {
  height: 5px;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: row-resize;
}

.col-resizer:hover, 
.row-resizer:hover {
  background-color: var(--app-primary-color);
}

.__table_app_spreadsheet-table td[contenteditable="true"] {
  outline: none;
}

.__table_app_spreadsheet-table td[contenteditable="true"]:focus {
  text-align: left;
  background-color: var(--sidebar-selected-bg-color);
  color: var(--sidebar-selected-text-color);
  box-shadow: inset 0 0 3px rgba(0,0,0,0.1);
}
`;document.head.appendChild(z);function k(o,e,t){let{constructAppHeaderLine:d}=e.appUtils,n=new L(49,13),g=document.createElement("div");x(g,{width:"100%",height:"100%",display:"flex",flexDirection:"column"});let b=document.createElement("div");b.className="__table_app_spreadsheet";let c=[],s=0,i=D();b.appendChild(i);let{element:f,enableButton:h,disableButton:m}=d({newFile:{title:"New sheet",onClick:()=>{c.length=0,s=0,m("undo"),m("redo"),n.reset(),i.remove(),i=D(),b.appendChild(i)}},undo:{onClick:H},redo:{onClick:I},download:{title:"Download as CSV",onClick:()=>{let l=n.getData().map(p=>p.map(A).join(",")).join(`
`);if(typeof window.showSaveFilePicker=="function")W(l);else{let p=document.createElement("a");p.download="sheet.csv",p.href="data:text/plain;charset=utf-8,"+encodeURIComponent(l),p.click()}}}});return m("undo"),m("redo"),m("clear"),R(b,n,t),g.appendChild(f),g.appendChild(b),{element:g};function E(r,l,p,a){if(p!==a){for(s<c.length&&c.splice(s),c.push({row:r,col:l,prevValue:p,newValue:a}),s++;c.length>100;)c.shift(),s--;m("redo"),s>0&&h("undo")}}function H(){if(s<=0)return;s--;let r=c[s];n.setCell(r.row,r.col,r.prevValue);let l=i.getElementsByTagName("tr")?.[r.row+1]?.getElementsByTagName("td")?.[r.col];l&&(l.textContent=r.prevValue,l.focus()),h("redo"),s<=0&&m("undo")}function I(){if(s>=c.length)return;let r=c[s];s++,n.setCell(r.row,r.cell,r.newValue);let l=i.getElementsByTagName("tr")?.[r.row+1]?.getElementsByTagName("td")?.[r.col];l&&(l.textContent=r.newValue),s>0&&h("undo"),s>=c.length&&m("redo")}function D(){let r=document.createElement("table");r.className="__table_app_spreadsheet-table";let l=document.createElement("tr");l.className="header-row";let p=document.createElement("th");x(p,{border:"1px solid var(--window-line-color)",textAlign:"center"}),l.appendChild(p);for(let a=0;a<n.nbCols;a++){let w=document.createElement("th");w.textContent=String.fromCharCode(65+a),x(w,{border:"1px solid var(--window-line-color)",width:`${n.colWidths[a]}px`});let C=document.createElement("div");C.className="resizer col-resizer",C.dataset.col=a,w.appendChild(C),l.appendChild(w)}r.appendChild(l);for(let a=0;a<n.nbRows;a++){let w=document.createElement("tr");w.style.height=`${n.rowHeights[a]}px`;let C=document.createElement("th");C.textContent=a+1;let y=document.createElement("div");y.className="resizer row-resizer",y.dataset.row=a,C.appendChild(y),w.appendChild(C);for(let _=0;_<n.nbCols;_++){let u=document.createElement("td");u.textContent=n.getCell(a,_),u.dataset.row=a,u.dataset.col=_,u.contentEditable=!0,x(u,{maxWidth:`${n.colWidths[_]}px`,minWidth:`${n.colWidths[_]}px`}),u.addEventListener("keydown",T=>{T.key==="Enter"&&u.blur()}),u.addEventListener("focusout",()=>{E(a,_,n.getCell(a,_)??"",u.textContent),n.setCell(a,_,u.textContent)}),w.appendChild(u)}r.appendChild(w)}return r}}function R(o,e,t){let d=!1,n=null,g=0,b=0,c=0,s=0;v(document,"mousedown",t,i=>{i.target.classList.contains("resizer")&&(d=!0,n=i.target,g=i.clientX,b=i.clientY,n.classList.contains("col-resizer")?c=n.parentElement.offsetWidth:s=n.parentElement.parentElement.offsetHeight,i.preventDefault())}),v(document,"mousemove",t,i=>{d&&window.requestAnimationFrame(()=>{if(d)if(n.classList.contains("col-resizer")){let f=parseInt(n.dataset.col),h=c+(i.clientX-g);e.resizeColumn(f,h),n.parentElement.style.width=`${h}px`,o.querySelectorAll(`td[data-col="${f}"]`).forEach(E=>{E.style.maxWidth=`${h}px`,E.style.minWidth=`${h}px`})}else{let f=parseInt(n.dataset.row),h=s+(i.clientY-b);e.resizeRow(f,h),n.parentElement.parentElement.style.height=`${h}px`}})}),v(document,"mouseup",t,()=>{d=!1,n=null})}var L=class{constructor(e,t){this.nbRows=e,this.nbCols=t,this.maxRowDirty=0,this.maxColDirty=0,this.data=Array(e).fill().map(()=>Array(t).fill("")),this.colWidths=Array(t).fill(100),this.rowHeights=Array(e).fill(30)}reset(){this.maxRowDirty=0,this.maxColDirty=0,this.data=Array(this.nbRows).fill().map(()=>Array(this.nbCols).fill("")),this.colWidths=Array(this.nbCols).fill(100),this.rowHeights=Array(this.nbRows).fill(30)}getCell(e,t){return this.isCellValid(e,t)?this.data[e][t]:null}setCell(e,t,d){this.isCellValid(e,t)&&(d!==""&&(this.maxRowDirty=Math.max(this.maxRowDirty,e+1),this.maxColDirty=Math.max(this.maxColDirty,t+1)),this.data[e][t]=d)}resizeColumn(e,t){e>=0&&e<this.nbCols&&(this.colWidths[e]=Math.max(20,t))}resizeRow(e,t){e>=0&&e<this.nbRows&&(this.rowHeights[e]=Math.max(20,t))}isCellValid(e,t){return e>=0&&e<this.nbRows&&t>=0&&t<this.nbCols}getData(){let e=this.data.slice(0,this.maxRowDirty);for(let t of e)t.length=this.maxColDirty;return e}};function v(o,e,t,d){o.addEventListener(e,d),t.addEventListener("abort",()=>{o.removeEventListener(e,d)})}function A(o){return typeof o!="string"&&(o=String(o)),o=o.replace(/"/g,'""'),o.includes(",")||o.includes(`
`)||o.includes('"')?`"${o}"`:o}async function W(o){try{let e=await window.showSaveFilePicker({suggestedName:"sheet.csv"}),t=await e.createWritable();return await t.write(o),await t.close(),e}catch(e){console.error(e)}}function x(o,e){for(let t of Object.keys(e))o.style[t]=e[t]}export{k as create};
