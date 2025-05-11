const { applyStyle } = AppUtils;

// TODO: configuration

const HIDDEN_CELL_VALUE = "⬛";
const FLAG_CELL_VALUE = "🚩";
const BOMB_CELL_VALUE = "💣";
const EXPLODED_BOMB_CELL_VALUE = "💥";
const NUMBER_VALUES = ["⬜", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

export function create() {
  const config = {
    rows: 10,
    cols: 10,
    numberOfBombs: 15,
  };

  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    backgroundColor: "var(--window-sidebar-bg)",
    color: "var(--window-text-color)",
    padding: "5px",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    height: "100%",
    width: "100%",
    alignItems: "center",
    gap: "20px",
  });

  let hasGameOvered = false;
  let firstClick = true;
  let nbOfFlagsPlaced = 0;
  let nbOfCellsRevealed = 0;

  const titleElt = document.createElement("h1");
  titleElt.textContent = "💣 BombSweeper!";
  applyStyle(titleElt, {
    marginTop: "15px",
    color: "var(--app-primary-color)",
  });
  containerElt.appendChild(titleElt);

  const infoContainerElt = document.createElement("div");
  applyStyle(infoContainerElt, {
    display: "flex",
  });

  const infoBombElt = document.createElement("div");
  const infoBombTitleElt = document.createElement("span");
  infoBombTitleElt.textContent = "Unflagged bombs: ";
  const infoBombValueElt = document.createElement("span");
  applyStyle(infoBombValueElt, {
    fontWeight: "bold",
  });
  infoBombValueElt.textContent = config.numberOfBombs;

  infoBombElt.appendChild(infoBombTitleElt);
  infoBombElt.appendChild(infoBombValueElt);
  infoContainerElt.appendChild(infoBombElt);
  containerElt.appendChild(infoContainerElt);

  const statusElt = document.createElement("div");
  applyStyle(statusElt, {
    color: "var(--window-text-color)",
  });
  containerElt.appendChild(statusElt);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset!";
  resetBtn.className = "btn";
  resetBtn.onclick = initializeGame;
  containerElt.appendChild(resetBtn);

  const board = document.createElement("div");
  applyStyle(board, {
    display: "inline-grid",
    gridTemplateColumns: `repeat(${config.cols}, 36px)`,
    gridTemplateRows: `repeat(${config.rows}, 36px)`,
    gap: "2px",
    margin: "0 auto",
    border: "6px solid var(--window-line-color)",
    borderCollapse: "collapse",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  });
  containerElt.appendChild(board);

  initializeGame();

  return { element: containerElt };

  function getNumberOfBombsAroundCell(row, col) {
    let count = 0;

    for (
      let r = Math.max(0, row - 1);
      r <= Math.min(config.rows - 1, row + 1);
      r++
    ) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(config.cols - 1, col + 1);
        c++
      ) {
        if (r === row && c === col) continue;

        if (getCellElementAt(r, c).dataset.bomb === "true") {
          count++;
        }
      }
    }

    return count;
  }

  function getCellElementAt(row, col) {
    // TODO?:
    return containerElt.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  function toggleFlagOnCell(cell) {
    if (hasGameOvered || cell.dataset.revealed === "true") {
      return;
    }

    if (cell.dataset.flagged === "true") {
      cell.dataset.flagged = "false";
      cell.textContent = HIDDEN_CELL_VALUE;
      nbOfFlagsPlaced--;
    } else if (nbOfFlagsPlaced >= config.numberOfBombs) {
      return;
    } else {
      cell.dataset.flagged = "true";
      cell.textContent = FLAG_CELL_VALUE;
      nbOfFlagsPlaced++;
    }

    infoBombValueElt.textContent = config.numberOfBombs - nbOfFlagsPlaced;
    checkGameStatus();
  }

  function revealCell(cell) {
    if (cell.dataset.revealed === "true" || cell.dataset.flagged === "true") {
      return;
    }

    cell.dataset.revealed = "true";
    cell.style.cursor = "auto";
    nbOfCellsRevealed++;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (cell.dataset.bomb === "true") {
      cell.textContent = EXPLODED_BOMB_CELL_VALUE;
      endGame(false);
      return;
    }

    const neighborCount = parseInt(cell.dataset.neighbors);
    cell.textContent = NUMBER_VALUES[neighborCount];

    if (neighborCount === 0) {
      for (
        let r = Math.max(0, row - 1);
        r <= Math.min(config.rows - 1, row + 1);
        r++
      ) {
        for (
          let c = Math.max(0, col - 1);
          c <= Math.min(config.cols - 1, col + 1);
          c++
        ) {
          if (r === row && c === col) continue;

          const neighbor = getCellElementAt(r, c);
          if (neighbor.dataset.revealed === "false") {
            revealCell(neighbor);
          }
        }
      }
    }
  }

  function checkGameStatus() {
    const totalCells = config.rows * config.cols;
    const safeCells = totalCells - config.numberOfBombs;

    if (nbOfCellsRevealed === safeCells) {
      endGame(true);
    }
  }

  function endGame(hasWon) {
    hasGameOvered = true;

    // TODO:
    containerElt.querySelectorAll('[data-bomb="true"]').forEach((cell) => {
      if (cell.dataset.revealed !== "true") {
        cell.textContent = BOMB_CELL_VALUE;
      }
    });

    if (hasWon) {
      statusElt.textContent = "You live another day, congratulation! 👏👏👏";
    } else {
      statusElt.textContent = "💥 BOOOOOOOM, you're dead! 💥";
    }
    resetBtn.textContent = "Restart!";
  }

  function initializeGame() {
    hasGameOvered = false;
    firstClick = true;
    nbOfFlagsPlaced = 0;
    nbOfCellsRevealed = 0;

    infoBombValueElt.textContent = config.numberOfBombs;
    statusElt.textContent =
      "Left click to reveal a cell, right click to place a flag";
    resetBtn.textContent = "Generate new grid";

    board.innerHTML = "";

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const cell = document.createElement("div");
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.revealed = "false";
        cell.dataset.flagged = "false";
        cell.dataset.bomb = "false";
        cell.dataset.neighbors = "0";

        applyStyle(cell, {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          cursor: "pointer",
          border: "6px solid var(--window-line-color)",
        });
        cell.textContent = HIDDEN_CELL_VALUE;

        cell.addEventListener("click", () => {
          if (
            hasGameOvered ||
            cell.dataset.revealed === "true" ||
            cell.dataset.flagged === "true"
          ) {
            return;
          }

          const row = parseInt(cell.dataset.row);
          const col = parseInt(cell.dataset.col);

          if (firstClick) {
            firstClick = false;
            initializeBombsPlacement(row, col);
          }
          revealCell(cell);

          checkGameStatus();
        });
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          toggleFlagOnCell(cell);
        });

        board.appendChild(cell);
      }
    }
  }

  function initializeBombsPlacement(firstRow, firstCol) {
    let bombsPlaced = 0;

    while (bombsPlaced < config.numberOfBombs) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);

      if (
        (row === firstRow && col === firstCol) ||
        getCellElementAt(row, col).dataset.bomb === "true"
      ) {
        continue;
      }

      getCellElementAt(row, col).dataset.bomb = "true";
      bombsPlaced++;
    }

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const cell = getCellElementAt(row, col);
        if (cell.dataset.bomb !== "true") {
          const count = getNumberOfBombsAroundCell(row, col);
          cell.dataset.neighbors = count;
        }
      }
    }
  }
}
