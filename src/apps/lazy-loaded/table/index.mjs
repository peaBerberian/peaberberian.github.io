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
  containerElt.className = "__table_app_spreadsheet";

  renderTableInContainer();
  setupResizeEvents(containerElt, spreadsheet, abortSignal);
  return { element: containerElt };

  function renderTableInContainer() {
    containerElt.innerHTML = "";

    // Create table element
    const table = document.createElement("table");
    table.className = "__table_app_spreadsheet-table";

    // Create header row with column resizers
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
        td.contentEditable = true; // Make cell editable
        applyStyle(td, {
          maxWidth: `${spreadsheet.colWidths[col]}px`,
          minWidth: `${spreadsheet.colWidths[col]}px`,
        });
        td.addEventListener("blur", () => {
          spreadsheet.setCell(row, col, td.textContent);
        });
        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    containerElt.appendChild(table);
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
    this.data = Array(nbRows)
      .fill()
      .map(() => Array(nbCols).fill(""));
    this.colWidths = Array(nbCols).fill(DEFAULT_CELL_WIDTH);
    this.rowHeights = Array(nbRows).fill(DEFAULT_CELL_HEIGHT);
  }

  getCell(row, col) {
    if (this.isCellValid(row, col)) {
      return this.data[row][col];
    }
    return null;
  }

  setCell(row, col, value) {
    if (this.isCellValid(row, col)) {
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
