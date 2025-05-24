var D=document.createElement("style");D.textContent=`
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
`;document.head.appendChild(D);function M(r,e,t){let{applyStyle:i,constructAppHeaderLine:h}=e.appUtils,s=new v(49,13),g=document.createElement("div");i(g,{width:"100%",height:"100%",display:"flex",flexDirection:"column"});let f=document.createElement("div");f.className="__table_app_spreadsheet";let c=[],n=0,d=L();f.appendChild(d);let{element:w,enableButton:E,disableButton:p}=h({newFile:{title:"New blank sheet",onClick:()=>{c.length=0,n=0,p("undo"),p("redo"),s.reset(),d.remove(),d=L(),f.appendChild(d)}},undo:{onClick:H},redo:{onClick:I},download:{title:"Download as CSV",onClick:()=>{let l=s.getData().map(u=>u.map(A).join(",")).join(`
`);if(typeof window.showSaveFilePicker=="function")W(l);else{let u=document.createElement("a");u.download="sheet.csv",u.href="data:text/plain;charset=utf-8,"+encodeURIComponent(l),u.click()}}}});return p("undo"),p("redo"),p("clear"),R(f,s,t),g.appendChild(w),g.appendChild(f),{element:g};function z(o,l,u,a){if(u!==a){for(n<c.length&&c.splice(n),c.push({row:o,col:l,prevValue:u,newValue:a}),n++;c.length>100;)c.shift(),n--;p("redo"),n>0&&E("undo")}}function H(){if(n<=0)return;n--;let o=c[n];s.setCell(o.row,o.col,o.prevValue);let l=d.getElementsByTagName("tr")?.[o.row+1]?.getElementsByTagName("td")?.[o.col];l&&(l.textContent=o.prevValue,l.focus()),E("redo"),n<=0&&p("undo")}function I(){if(n>=c.length)return;let o=c[n];n++,s.setCell(o.row,o.cell,o.newValue);let l=d.getElementsByTagName("tr")?.[o.row+1]?.getElementsByTagName("td")?.[o.col];l&&(l.textContent=o.newValue),n>0&&E("undo"),n>=c.length&&p("redo")}function L(){let o=document.createElement("table");o.className="__table_app_spreadsheet-table";let l=document.createElement("tr");l.className="header-row";let u=document.createElement("th");i(u,{border:"1px solid var(--window-line-color)",textAlign:"center"}),l.appendChild(u);for(let a=0;a<s.nbCols;a++){let _=document.createElement("th");_.textContent=String.fromCharCode(65+a),i(_,{border:"1px solid var(--window-line-color)",width:`${s.colWidths[a]}px`});let C=document.createElement("div");C.className="resizer col-resizer",C.dataset.col=a,_.appendChild(C),l.appendChild(_)}o.appendChild(l);for(let a=0;a<s.nbRows;a++){let _=document.createElement("tr");_.style.height=`${s.rowHeights[a]}px`;let C=document.createElement("th");C.textContent=a+1;let x=document.createElement("div");x.className="resizer row-resizer",x.dataset.row=a,C.appendChild(x),_.appendChild(C);for(let b=0;b<s.nbCols;b++){let m=document.createElement("td");m.textContent=s.getCell(a,b),m.dataset.row=a,m.dataset.col=b,m.contentEditable=!0,i(m,{maxWidth:`${s.colWidths[b]}px`,minWidth:`${s.colWidths[b]}px`}),m.addEventListener("keydown",T=>{T.key==="Enter"&&m.blur()}),m.addEventListener("focusout",()=>{z(a,b,s.getCell(a,b)??"",m.textContent),s.setCell(a,b,m.textContent)}),_.appendChild(m)}o.appendChild(_)}return o}}function R(r,e,t){let i=!1,h=null,s=0,g=0,f=0,c=0;y(document,"mousedown",t,n=>{n.target.classList.contains("resizer")&&(i=!0,h=n.target,s=n.clientX,g=n.clientY,h.classList.contains("col-resizer")?f=h.parentElement.offsetWidth:c=h.parentElement.parentElement.offsetHeight,n.preventDefault())}),y(document,"mousemove",t,n=>{i&&window.requestAnimationFrame(()=>{if(i)if(h.classList.contains("col-resizer")){let d=parseInt(h.dataset.col),w=f+(n.clientX-s);e.resizeColumn(d,w),h.parentElement.style.width=`${w}px`,r.querySelectorAll(`td[data-col="${d}"]`).forEach(p=>{p.style.maxWidth=`${w}px`,p.style.minWidth=`${w}px`})}else{let d=parseInt(h.dataset.row),w=c+(n.clientY-g);e.resizeRow(d,w),h.parentElement.parentElement.style.height=`${w}px`}})}),y(document,"mouseup",t,()=>{i=!1,h=null})}var v=class{constructor(e,t){this.nbRows=e,this.nbCols=t,this.maxRowDirty=0,this.maxColDirty=0,this.data=Array(e).fill().map(()=>Array(t).fill("")),this.colWidths=Array(t).fill(100),this.rowHeights=Array(e).fill(30)}reset(){this.maxRowDirty=0,this.maxColDirty=0,this.data=Array(this.nbRows).fill().map(()=>Array(this.nbCols).fill("")),this.colWidths=Array(this.nbCols).fill(100),this.rowHeights=Array(this.nbRows).fill(30)}getCell(e,t){return this.isCellValid(e,t)?this.data[e][t]:null}setCell(e,t,i){this.isCellValid(e,t)&&(i!==""&&(this.maxRowDirty=Math.max(this.maxRowDirty,e+1),this.maxColDirty=Math.max(this.maxColDirty,t+1)),this.data[e][t]=i)}resizeColumn(e,t){e>=0&&e<this.nbCols&&(this.colWidths[e]=Math.max(20,t))}resizeRow(e,t){e>=0&&e<this.nbRows&&(this.rowHeights[e]=Math.max(20,t))}isCellValid(e,t){return e>=0&&e<this.nbRows&&t>=0&&t<this.nbCols}getData(){let e=this.data.slice(0,this.maxRowDirty);for(let t of e)t.length=this.maxColDirty;return e}};function y(r,e,t,i){r.addEventListener(e,i),t.addEventListener("abort",()=>{r.removeEventListener(e,i)})}function A(r){return typeof r!="string"&&(r=String(r)),r=r.replace(/"/g,'""'),r.includes(",")||r.includes(`
`)||r.includes('"')?`"${r}"`:r}async function W(r){try{let e=await window.showSaveFilePicker({suggestedName:"sheet.csv"}),t=await e.createWritable();return await t.write(r),await t.close(),e}catch(e){console.error(e)}}export{M as create};
