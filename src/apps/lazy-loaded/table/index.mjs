// NOTE: I took again the buttons from the paint app.
// We may want to add them in the base js instead?
const undoSvg = `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.85355 2.14645c.19527.19526.19527.51184 0 .7071l-2.14644 2.14645h3.79289c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5h-4c-.27614 0-.5-.2239-.5-.5s.22386-.5.5-.5h4c1.38071 0 2.5-1.11929 2.5-2.5s-1.11929-2.5-2.5-2.5h-3.79289l2.14644 2.14645c.19527.19526.19527.51184 0 .7071-.19526.19527-.51184.19527-.7071 0l-3-3c-.19527-.19526-.19527-.51184 0-.7071l3-3c.19526-.19527.51184-.19527.7071 0z" fill-rule="evenodd"/></svg>`;
const redoSvg = `<svg height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg" ><path clip-rule="evenodd" d="m8.14645 2.14645c-.19527.19526-.19527.51184 0 .7071l2.14645 2.14645h-3.7929c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5h4c.2761 0 .5-.2239.5-.5s-.2239-.5-.5-.5h-4c-1.38071 0-2.5-1.11929-2.5-2.5s1.11929-2.5 2.5-2.5h3.7929l-2.14645 2.14645c-.19527.19526-.19527.51184 0 .7071.19526.19527.51184.19527.7071 0l3.00005-3c.1952-.19526.1952-.51184 0-.7071l-3.00005-3c-.19526-.19527-.51184-.19527-.7071 0z" fill-rule="evenodd"/></svg>`;
const newFileSvg = `<svg fill="var(--window-text-color)" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 317.001 317.001" xml:space="preserve">
<path d="M270.825,70.55L212.17,3.66C210.13,1.334,207.187,0,204.093,0H55.941C49.076,0,43.51,5.566,43.51,12.431V304.57
	c0,6.866,5.566,12.431,12.431,12.431h205.118c6.866,0,12.432-5.566,12.432-12.432V77.633
	C273.491,75.027,272.544,72.51,270.825,70.55z M55.941,305.073V12.432H199.94v63.601c0,3.431,2.78,6.216,6.216,6.216h54.903
	l0.006,222.824H55.941z"/>
</svg>`;
const saveSvg = `<svg fill="var(--window-text-color)" width="800px" height="800px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill-rule="evenodd"><g transform="translate(-419.000000, -640.000000)"><g transform="translate(56.000000, 160.000000)"><path d="M370.21875,484 C370.21875,483.448 370.68915,483 371.26875,483 C371.84835,483 372.31875,483.448 372.31875,484 C372.31875,484.552 371.84835,485 371.26875,485 C370.68915,485 370.21875,484.552 370.21875,484 L370.21875,484 Z M381.9,497 C381.9,497.552 381.4296,498 380.85,498 L379.8,498 L379.8,494 C379.8,492.895 378.86025,492 377.7,492 L369.3,492 C368.13975,492 367.2,492.895 367.2,494 L367.2,498 L366.15,498 C365.5704,498 365.1,497.552 365.1,497 L365.1,487.044 C365.1,486.911 365.15565,486.784 365.2533,486.691 L367.2,484.837 L367.2,486 C367.2,487.105 368.13975,488 369.3,488 L377.7,488 C378.86025,488 379.8,487.105 379.8,486 L379.8,482 L380.85,482 C381.4296,482 381.9,482.448 381.9,483 L381.9,497 Z M377.7,498 L369.3,498 L369.3,495 C369.3,494.448 369.7704,494 370.35,494 L376.65,494 C377.2296,494 377.7,494.448 377.7,495 L377.7,498 Z M369.3,482.837 L370.17885,482 L377.7,482 L377.7,485 C377.7,485.552 377.2296,486 376.65,486 L370.35,486 C369.7704,486 369.3,485.552 369.3,485 L369.3,482.837 Z M381.9,480 L369.7347,480 C369.45645,480 369.18975,480.105 368.99235,480.293 L363.30765,485.707 C363.11025,485.895 363,486.149 363,486.414 L363,498 C363,499.105 363.93975,500 365.1,500 L381.9,500 C383.06025,500 384,499.105 384,498 L384,482 C384,480.895 383.06025,480 381.9,480 L381.9,480 Z"></path></g></g></g></svg>`;

const DEFAULT_CELL_HEIGHT = 30;
const DEFAULT_CELL_WIDTH = 100;
const MINIMUM_CELL_HEIGHT = 20;
const MINIMUM_CELL_WIDTH = 20;

/*
 * This App is CSS-heavy.
 * Just declare a separate stylesheet with weird class names to avoid conflicts.
 * TODO: exploit things like shadow root? To investigate.
 */
const style = document.createElement("style");
style.textContent = `
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
`;

document.head.appendChild(style);

export function create(abortSignal) {
  const spreadsheet = new Spreadsheet(49, 13);
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  });

  const tableContainerElt = document.createElement("div");
  tableContainerElt.className = "__table_app_spreadsheet";

  const headerElt = document.createElement("div");
  applyStyle(headerElt, {
    backgroundColor: "var(--window-sidebar-bg)",
    width: "100%",
    overflow: "auto",
    display: "flex",
    padding: "3px",
    gap: "5px",
    flexShrink: "0",
  });

  let history = [];
  let historyIndex = 0;

  let tableElt = constructTable();
  tableContainerElt.appendChild(tableElt);

  const newFileButton = createButtonElt(
    newFileSvg,
    "New blank sheet",
    0.8,
    (e) => {
      e.preventDefault();
      history.length = 0;
      historyIndex = 0;
      disableButton(undoButton);
      disableButton(redoButton);
      spreadsheet.reset();
      tableElt.remove();
      tableElt = constructTable();
      tableContainerElt.appendChild(tableElt);
    },
  );
  headerElt.appendChild(newFileButton);

  const undoButton = createButtonElt(undoSvg, "Undo", 1, (e) => {
    e.preventDefault();
    undo();
  });
  disableButton(undoButton);
  headerElt.appendChild(undoButton);

  const redoButton = createButtonElt(redoSvg, "Redo", 1, (e) => {
    e.preventDefault();
    redo();
  });
  disableButton(redoButton);
  headerElt.appendChild(redoButton);

  const saveButton = createButtonElt(
    saveSvg,
    "Save as CSV (download)",
    0.75,
    () => {
      const rows = spreadsheet.getData();
      const data = rows
        .map((row) => row.map(escapeCsvField).join(","))
        .join("\n");
      if (typeof window.showSaveFilePicker === "function") {
        saveFile(data);
      } else {
        const link = document.createElement("a");
        link.download = "sheet.csv";
        link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(data);
        link.click();
      }
    },
  );
  headerElt.appendChild(saveButton);

  setupResizeEvents(tableContainerElt, spreadsheet, abortSignal);
  containerElt.appendChild(headerElt);
  containerElt.appendChild(tableContainerElt);
  return { element: containerElt };

  function saveToHistory(row, col, prevValue, newValue) {
    if (prevValue === newValue) {
      return;
    }
    if (historyIndex < history.length) {
      history.splice(historyIndex);
    }
    history.push({ row, col, prevValue, newValue });
    historyIndex++;

    while (history.length > 100) {
      history.shift();
      historyIndex--;
    }

    disableButton(redoButton);
    if (historyIndex > 0) {
      enableButton(undoButton);
    }
  }

  function undo() {
    if (historyIndex <= 0) {
      return;
    }

    historyIndex--;
    const historyElt = history[historyIndex];
    spreadsheet.setCell(historyElt.row, historyElt.col, historyElt.prevValue);

    const tdElt = tableElt
      .getElementsByTagName("tr")
      ?.[historyElt.row + 1]?.getElementsByTagName("td")?.[historyElt.col];
    if (tdElt) {
      tdElt.textContent = historyElt.prevValue;
      tdElt.focus();
    }

    enableButton(redoButton);
    if (historyIndex <= 0) {
      disableButton(undoButton);
    }
    // if (textArea.value === "") {
    //   disableButton(clearButton);
    // } else {
    //   enableButton(clearButton);
    // }
  }

  function redo() {
    if (historyIndex >= history.length) {
      return;
    }

    const historyElt = history[historyIndex];
    historyIndex++;
    spreadsheet.setCell(historyElt.row, historyElt.cell, historyElt.newValue);
    const tdElt = tableElt
      .getElementsByTagName("tr")
      ?.[historyElt.row + 1]?.getElementsByTagName("td")?.[historyElt.col];
    if (tdElt) {
      tdElt.textContent = historyElt.newValue;
    }

    if (historyIndex > 0) {
      enableButton(undoButton);
    }
    if (historyIndex >= history.length - 1) {
      disableButton(redoButton);
    }
    // if (textArea.value === "") {
    //   disableButton(clearButton);
    // } else {
    //   enableButton(clearButton);
    // }
  }

  function constructTable() {
    const table = document.createElement("table");
    table.className = "__table_app_spreadsheet-table";
    const headerRow = document.createElement("tr");
    headerRow.className = "header-row";

    const thHeaderRowElt = document.createElement("th");
    applyStyle(thHeaderRowElt, {
      border: "1px solid var(--window-line-color)",
      textAlign: "center",
    });
    headerRow.appendChild(thHeaderRowElt);

    // Column headers
    for (let col = 0; col < spreadsheet.nbCols; col++) {
      const th = document.createElement("th");
      th.textContent = String.fromCharCode(65 + col); // A, B, C...
      applyStyle(th, {
        border: "1px solid var(--window-line-color)",
        width: `${spreadsheet.colWidths[col]}px`,
      });

      // Column resizer
      const resizer = document.createElement("div");
      resizer.className = "resizer col-resizer";
      resizer.dataset.col = col;
      th.appendChild(resizer);

      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Create data rows
    for (let row = 0; row < spreadsheet.nbRows; row++) {
      const tr = document.createElement("tr");
      tr.style.height = `${spreadsheet.rowHeights[row]}px`;

      // Row header with resizer
      const rowHeader = document.createElement("th");
      rowHeader.textContent = row + 1;

      const rowResizer = document.createElement("div");
      rowResizer.className = "resizer row-resizer";
      rowResizer.dataset.row = row;
      rowHeader.appendChild(rowResizer);

      tr.appendChild(rowHeader);

      // Data cells
      for (let col = 0; col < spreadsheet.nbCols; col++) {
        const td = document.createElement("td");
        td.textContent = spreadsheet.getCell(row, col);
        td.dataset.row = row;
        td.dataset.col = col;
        td.contentEditable = true;
        applyStyle(td, {
          maxWidth: `${spreadsheet.colWidths[col]}px`,
          minWidth: `${spreadsheet.colWidths[col]}px`,
        });
        td.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            td.blur();
          }
        });
        td.addEventListener("focusout", () => {
          saveToHistory(
            row,
            col,
            spreadsheet.getCell(row, col) ?? "",
            td.textContent,
          );
          spreadsheet.setCell(row, col, td.textContent);
        });
        tr.appendChild(td);
      }

      table.appendChild(tr);
    }
    return table;
  }
}
function setupResizeEvents(containerElt, spreadsheet, abortSignal) {
  let isResizing = false;
  let currentResizer = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  addEventListener(document, "mousedown", abortSignal, (e) => {
    if (e.target.classList.contains("resizer")) {
      isResizing = true;
      currentResizer = e.target;
      startX = e.clientX;
      startY = e.clientY;

      if (currentResizer.classList.contains("col-resizer")) {
        const th = currentResizer.parentElement;
        startWidth = th.offsetWidth;
      } else {
        const tr = currentResizer.parentElement.parentElement;
        startHeight = tr.offsetHeight;
      }

      e.preventDefault();
    }
  });

  addEventListener(document, "mousemove", abortSignal, (e) => {
    if (!isResizing) {
      return;
    }
    window.requestAnimationFrame(() => {
      if (!isResizing) {
        return;
      }
      if (currentResizer.classList.contains("col-resizer")) {
        const col = parseInt(currentResizer.dataset.col);
        const width = startWidth + (e.clientX - startX);
        spreadsheet.resizeColumn(col, width);
        currentResizer.parentElement.style.width = `${width}px`;

        // Update all cells in this column
        const cells = containerElt.querySelectorAll(`td[data-col="${col}"]`);
        cells.forEach((cell) => {
          cell.style.maxWidth = `${width}px`;
          cell.style.minWidth = `${width}px`;
        });
      } else {
        const row = parseInt(currentResizer.dataset.row);
        const height = startHeight + (e.clientY - startY);
        spreadsheet.resizeRow(row, height);
        currentResizer.parentElement.parentElement.style.height = `${height}px`;
      }
    });
  });

  addEventListener(document, "mouseup", abortSignal, () => {
    isResizing = false;
    currentResizer = null;
  });
}

class Spreadsheet {
  constructor(nbRows, nbCols) {
    this.nbRows = nbRows;
    this.nbCols = nbCols;
    this.maxRowDirty = 0;
    this.maxColDirty = 0;
    this.data = Array(nbRows)
      .fill()
      .map(() => Array(nbCols).fill(""));
    this.colWidths = Array(nbCols).fill(DEFAULT_CELL_WIDTH);
    this.rowHeights = Array(nbRows).fill(DEFAULT_CELL_HEIGHT);
  }

  reset() {
    this.maxRowDirty = 0;
    this.maxColDirty = 0;
    this.data = Array(this.nbRows)
      .fill()
      .map(() => Array(this.nbCols).fill(""));
    this.colWidths = Array(this.nbCols).fill(DEFAULT_CELL_WIDTH);
    this.rowHeights = Array(this.nbRows).fill(DEFAULT_CELL_HEIGHT);
  }

  getCell(row, col) {
    if (this.isCellValid(row, col)) {
      return this.data[row][col];
    }
    return null;
  }

  setCell(row, col, value) {
    if (this.isCellValid(row, col)) {
      // TODO: also handle reseting the cell for the dirty parts?
      if (value !== "") {
        this.maxRowDirty = Math.max(this.maxRowDirty, row + 1);
        this.maxColDirty = Math.max(this.maxColDirty, col + 1);
      }
      this.data[row][col] = value;
    }
  }

  resizeColumn(col, width) {
    if (col >= 0 && col < this.nbCols) {
      this.colWidths[col] = Math.max(MINIMUM_CELL_WIDTH, width);
    }
  }

  resizeRow(row, height) {
    if (row >= 0 && row < this.nbRows) {
      this.rowHeights[row] = Math.max(MINIMUM_CELL_HEIGHT, height);
    }
  }

  isCellValid(row, col) {
    return row >= 0 && row < this.nbRows && col >= 0 && col < this.nbCols;
  }
  getData() {
    const clonedRows = this.data.slice(0, this.maxRowDirty);
    for (const row of clonedRows) {
      row.length = this.maxColDirty;
    }
    return clonedRows;
  }
}

/**
 * Function adding an event listener also accepting an `AbortSignal` for
 * automatic removal of that event listener.
 * @param {EventTarget} target
 * @param {string} event
 * @param {AbortSignal} abortSignal
 * @param {Function} callback
 */
function addEventListener(target, event, abortSignal, callback) {
  target.addEventListener(event, callback);
  abortSignal.addEventListener("abort", () => {
    target.removeEventListener(event, callback);
  });
}

function createButtonElt(svg, title, heightScale, onClick) {
  const buttonSvgElt = getSvg(svg);
  applyStyle(buttonSvgElt, {
    width: "2rem",
    height: `${heightScale * 2}rem`,
  });
  const buttonWrapperElt = document.createElement("span");
  buttonWrapperElt.style.margin = "auto 0";
  buttonWrapperElt.style.cursor = "pointer";
  buttonWrapperElt.appendChild(buttonSvgElt);
  buttonWrapperElt.onclick = onClick;
  buttonWrapperElt.title = title;
  return buttonWrapperElt;
}

function enableButton(buttonElt) {
  if (buttonElt.style.cursor !== "pointer") {
    buttonElt.style.cursor = "pointer";
    buttonElt.children[0].setAttribute("fill", "var(--window-text-color)");
  }
}

function disableButton(buttonElt) {
  if (buttonElt.style.cursor === "pointer") {
    buttonElt.style.cursor = "auto";
    buttonElt.children[0].setAttribute("fill", "var(--window-inactive-header)");
  }
}

function getSvg(svg) {
  const svgWrapperElt = document.createElement("div");
  svgWrapperElt.innerHTML = svg;
  const svgElt = svgWrapperElt.children[0];
  return svgElt;
}

function escapeCsvField(field) {
  if (typeof field !== "string") {
    field = String(field);
  }
  field = field.replace(/"/g, '""');
  if (field.includes(",") || field.includes("\n") || field.includes('"')) {
    return `"${field}"`;
  }
  return field;
}

async function saveFile(content) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "sheet.csv",
    });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return handle;
  } catch (err) {
    console.error(err);
  }
}
