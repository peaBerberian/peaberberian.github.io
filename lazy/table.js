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
`;document.head.appendChild(z);function M(a,e,t){let{applyStyle:c,constructAppHeaderLine:u}=e.appUtils,s=new L(49,13),g=document.createElement("div");c(g,{width:"100%",height:"100%",display:"flex",flexDirection:"column"});let f=document.createElement("div");f.className="__table_app_spreadsheet";let h=[],o=0,p=D();f.appendChild(p);let{element:_,enableButton:E,disableButton:m}=u({newFile:{title:"New blank sheet",onClick:()=>{h.length=0,o=0,m("undo"),m("redo"),s.reset(),p.remove(),p=D(),f.appendChild(p)}},undo:{onClick:I},redo:{onClick:T},download:{title:"Download as CSV",onClick:()=>{let i=s.getData().map(l=>l.map(A).join(",")).join(`
`);if(typeof window.showSaveFilePicker=="function")W(i);else{let l=document.createElement("a");l.download="sheet.csv",l.href="data:text/plain;charset=utf-8,"+encodeURIComponent(i),l.click()}}}});return m("undo"),m("redo"),m("clear"),R(f,s,t),g.appendChild(_),g.appendChild(f),{element:g};function H(r,i,l,n){if(l!==n){for(o<h.length&&h.splice(o),h.push({row:r,col:i,prevValue:l,newValue:n}),o++;h.length>100;)h.shift(),o--;m("redo"),o>0&&E("undo")}}function I(){var l,n,d;if(o<=0)return;o--;let r=h[o];s.setCell(r.row,r.col,r.prevValue);let i=(d=(n=(l=p.getElementsByTagName("tr"))==null?void 0:l[r.row+1])==null?void 0:n.getElementsByTagName("td"))==null?void 0:d[r.col];i&&(i.textContent=r.prevValue,i.focus()),E("redo"),o<=0&&m("undo")}function T(){var l,n,d;if(o>=h.length)return;let r=h[o];o++,s.setCell(r.row,r.cell,r.newValue);let i=(d=(n=(l=p.getElementsByTagName("tr"))==null?void 0:l[r.row+1])==null?void 0:n.getElementsByTagName("td"))==null?void 0:d[r.col];i&&(i.textContent=r.newValue),o>0&&E("undo"),o>=h.length&&m("redo")}function D(){let r=document.createElement("table");r.className="__table_app_spreadsheet-table";let i=document.createElement("tr");i.className="header-row";let l=document.createElement("th");c(l,{border:"1px solid var(--window-line-color)",textAlign:"center"}),i.appendChild(l);for(let n=0;n<s.nbCols;n++){let d=document.createElement("th");d.textContent=String.fromCharCode(65+n),c(d,{border:"1px solid var(--window-line-color)",width:`${s.colWidths[n]}px`});let C=document.createElement("div");C.className="resizer col-resizer",C.dataset.col=n,d.appendChild(C),i.appendChild(d)}r.appendChild(i);for(let n=0;n<s.nbRows;n++){let d=document.createElement("tr");d.style.height=`${s.rowHeights[n]}px`;let C=document.createElement("th");C.textContent=n+1;let y=document.createElement("div");y.className="resizer row-resizer",y.dataset.row=n,C.appendChild(y),d.appendChild(C);for(let b=0;b<s.nbCols;b++){let w=document.createElement("td");w.textContent=s.getCell(n,b),w.dataset.row=n,w.dataset.col=b,w.contentEditable=!0,c(w,{maxWidth:`${s.colWidths[b]}px`,minWidth:`${s.colWidths[b]}px`}),w.addEventListener("keydown",x=>{x.key==="Enter"&&w.blur()}),w.addEventListener("focusout",()=>{var x;H(n,b,(x=s.getCell(n,b))!=null?x:"",w.textContent),s.setCell(n,b,w.textContent)}),d.appendChild(w)}r.appendChild(d)}return r}}function R(a,e,t){let c=!1,u=null,s=0,g=0,f=0,h=0;v(document,"mousedown",t,o=>{o.target.classList.contains("resizer")&&(c=!0,u=o.target,s=o.clientX,g=o.clientY,u.classList.contains("col-resizer")?f=u.parentElement.offsetWidth:h=u.parentElement.parentElement.offsetHeight,o.preventDefault())}),v(document,"mousemove",t,o=>{c&&window.requestAnimationFrame(()=>{if(c)if(u.classList.contains("col-resizer")){let p=parseInt(u.dataset.col),_=f+(o.clientX-s);e.resizeColumn(p,_),u.parentElement.style.width=`${_}px`,a.querySelectorAll(`td[data-col="${p}"]`).forEach(m=>{m.style.maxWidth=`${_}px`,m.style.minWidth=`${_}px`})}else{let p=parseInt(u.dataset.row),_=h+(o.clientY-g);e.resizeRow(p,_),u.parentElement.parentElement.style.height=`${_}px`}})}),v(document,"mouseup",t,()=>{c=!1,u=null})}var L=class{constructor(e,t){this.nbRows=e,this.nbCols=t,this.maxRowDirty=0,this.maxColDirty=0,this.data=Array(e).fill().map(()=>Array(t).fill("")),this.colWidths=Array(t).fill(100),this.rowHeights=Array(e).fill(30)}reset(){this.maxRowDirty=0,this.maxColDirty=0,this.data=Array(this.nbRows).fill().map(()=>Array(this.nbCols).fill("")),this.colWidths=Array(this.nbCols).fill(100),this.rowHeights=Array(this.nbRows).fill(30)}getCell(e,t){return this.isCellValid(e,t)?this.data[e][t]:null}setCell(e,t,c){this.isCellValid(e,t)&&(c!==""&&(this.maxRowDirty=Math.max(this.maxRowDirty,e+1),this.maxColDirty=Math.max(this.maxColDirty,t+1)),this.data[e][t]=c)}resizeColumn(e,t){e>=0&&e<this.nbCols&&(this.colWidths[e]=Math.max(20,t))}resizeRow(e,t){e>=0&&e<this.nbRows&&(this.rowHeights[e]=Math.max(20,t))}isCellValid(e,t){return e>=0&&e<this.nbRows&&t>=0&&t<this.nbCols}getData(){let e=this.data.slice(0,this.maxRowDirty);for(let t of e)t.length=this.maxColDirty;return e}};function v(a,e,t,c){a.addEventListener(e,c),t.addEventListener("abort",()=>{a.removeEventListener(e,c)})}function A(a){return typeof a!="string"&&(a=String(a)),a=a.replace(/"/g,'""'),a.includes(",")||a.includes(`
`)||a.includes('"')?`"${a}"`:a}async function W(a){try{let e=await window.showSaveFilePicker({suggestedName:"sheet.csv"}),t=await e.createWritable();return await t.write(a),await t.close(),e}catch(e){console.error(e)}}export{M as create};
