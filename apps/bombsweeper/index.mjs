const HIDDEN_CELL_VALUE = "⬛";
const FLAG_CELL_VALUE = "🚩";
const BOMB_CELL_VALUE = "💣";
const EXPLODED_BOMB_CELL_VALUE = "💥";
const NUMBER_VALUES = ["⬜", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

const DIFFICULTY_PRESETS = [
  { id: "easy", title: "Easy", rows: 8, cols: 8, bombs: 10 },
  { id: "normal", title: "Normal", rows: 10, cols: 10, bombs: 15 },
  { id: "hard", title: "Hard", rows: 16, cols: 16, bombs: 40 },
];

const DEFAULT_CONFIG = DIFFICULTY_PRESETS[1];
const MIN_BOARD_LENGTH = 4;
const MAX_BOARD_LENGTH = 30;

export function create(_args, env) {
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    backgroundColor: env.STYLE.barBg,
    color: env.STYLE.textColor,
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
  let hasClickedInCurrGame = true;
  let nbFlagsPlaced = 0;
  let nbCellsRevealed = 0;
  let gameConfig = {
    rows: DEFAULT_CONFIG.rows,
    cols: DEFAULT_CONFIG.cols,
    bombs: DEFAULT_CONFIG.bombs,
  };

  const titleElt = document.createElement("h1");
  titleElt.textContent = "💣 BombSweeper!";
  applyStyle(titleElt, {
    marginTop: "15px",
    color: env.STYLE.primaryColor,
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
  infoBombValueElt.textContent = gameConfig.bombs;

  infoBombElt.appendChild(infoBombTitleElt);
  infoBombElt.appendChild(infoBombValueElt);
  infoContainerElt.appendChild(infoBombElt);
  containerElt.appendChild(infoContainerElt);

  const controlsElt = document.createElement("form");
  applyStyle(controlsElt, {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    width: "min(340px, calc(100vw - 40px))",
    padding: "14px",
    backgroundColor: env.STYLE.barBg,
    color: env.STYLE.textColor,
    border: "2px solid " + env.STYLE.lineColor,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    zIndex: "1",
    boxSizing: "border-box",
    visibility: "hidden",
  });
  controlsElt.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  const settingsTitle = document.createElement("div");
  settingsTitle.textContent = "Board settings";
  applyStyle(settingsTitle, {
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    color: env.STYLE.primaryColor,
  });
  controlsElt.appendChild(settingsTitle);

  const boardSummaryElt = document.createElement("div");
  applyStyle(boardSummaryElt, {
    width: "100%",
    textAlign: "center",
    padding: "6px 8px",
    border: "1px solid " + env.STYLE.lineColor,
    boxSizing: "border-box",
  });
  controlsElt.appendChild(boardSummaryElt);

  const presetSelect = document.createElement("select");
  applyStyle(presetSelect, {
    minHeight: "28px",
    backgroundColor: env.STYLE.barBg,
    color: env.STYLE.textColor,
    border: "2px solid " + env.STYLE.lineColor,
  });
  const customPresetOption = document.createElement("option");
  customPresetOption.value = "custom";
  customPresetOption.textContent = "Custom";
  presetSelect.appendChild(customPresetOption);
  DIFFICULTY_PRESETS.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.title;
    presetSelect.appendChild(option);
  });
  presetSelect.value = DEFAULT_CONFIG.id;
  presetSelect.addEventListener("change", () => {
    const preset = DIFFICULTY_PRESETS.find(
      (preset) => preset.id === presetSelect.value,
    );
    if (preset !== undefined) {
      setGameConfig(preset);
    }
  });
  controlsElt.appendChild(createLabeledControl("Preset", presetSelect));

  const rowsInput = createNumberInput(
    gameConfig.rows,
    MIN_BOARD_LENGTH,
    MAX_BOARD_LENGTH,
  );
  styleFormControl(rowsInput);
  controlsElt.appendChild(createLabeledControl("Rows", rowsInput));

  const colsInput = createNumberInput(
    gameConfig.cols,
    MIN_BOARD_LENGTH,
    MAX_BOARD_LENGTH,
  );
  styleFormControl(colsInput);
  controlsElt.appendChild(createLabeledControl("Cols", colsInput));

  const bombsInput = createNumberInput(
    gameConfig.bombs,
    1,
    getMaxBombs(gameConfig),
  );
  styleFormControl(bombsInput);
  controlsElt.appendChild(createLabeledControl("Bombs", bombsInput));

  rowsInput.addEventListener("input", syncCustomInputLimits);
  colsInput.addEventListener("input", syncCustomInputLimits);
  rowsInput.addEventListener("change", setCustomConfigFromInputs);
  colsInput.addEventListener("change", setCustomConfigFromInputs);
  bombsInput.addEventListener("change", setCustomConfigFromInputs);
  bombsInput.addEventListener("input", () => {
    presetSelect.value = "custom";
  });

  const statusElt = document.createElement("div");
  applyStyle(statusElt, {
    color: env.STYLE.textColor,
  });
  containerElt.appendChild(statusElt);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset!";
  resetBtn.className = "btn";
  resetBtn.onclick = initializeGame;

  const actionsElt = document.createElement("div");
  applyStyle(actionsElt, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    position: "relative",
  });
  actionsElt.appendChild(resetBtn);

  const settingsWrapperElt = document.createElement("div");
  applyStyle(settingsWrapperElt, {
    position: "relative",
  });

  const settingsBtn = document.createElement("button");
  settingsBtn.type = "button";
  settingsBtn.className = "btn";
  settingsBtn.textContent = "Settings";
  settingsBtn.addEventListener("click", () => {
    setSettingsPanelOpen(controlsElt.style.visibility !== "visible");
  });
  settingsWrapperElt.appendChild(settingsBtn);
  settingsWrapperElt.appendChild(controlsElt);
  actionsElt.appendChild(settingsWrapperElt);
  containerElt.appendChild(actionsElt);

  const board = document.createElement("div");
  applyStyle(board, {
    display: "inline-grid",
    gap: "2px",
    margin: "0 auto",
    border: "6px solid " + env.STYLE.lineColor,
    borderCollapse: "collapse",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  });
  containerElt.appendChild(board);

  syncConfigControls();
  initializeGame();

  return { element: containerElt };

  function getNumberOfBombsAroundCell(row, col) {
    let count = 0;

    for (
      let r = Math.max(0, row - 1);
      r <= Math.min(gameConfig.rows - 1, row + 1);
      r++
    ) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(gameConfig.cols - 1, col + 1);
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

  function getNumberOfFlagsAroundCell(row, col) {
    let count = 0;

    for (
      let r = Math.max(0, row - 1);
      r <= Math.min(gameConfig.rows - 1, row + 1);
      r++
    ) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(gameConfig.cols - 1, col + 1);
        c++
      ) {
        if (r === row && c === col) continue;

        if (getCellElementAt(r, c).dataset.flagged === "true") {
          count++;
        }
      }
    }

    return count;
  }

  function getCellElementAt(row, col) {
    // For now, just do this.
    return containerElt.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  function toggleFlagOnCell(cell) {
    if (hasGameOvered || cell.dataset.revealed === "true") {
      return;
    }

    if (cell.dataset.flagged === "true") {
      cell.dataset.flagged = "false";
      cell.textContent = HIDDEN_CELL_VALUE;
      nbFlagsPlaced--;
    } else if (nbFlagsPlaced >= gameConfig.bombs) {
      return;
    } else {
      cell.dataset.flagged = "true";
      cell.textContent = FLAG_CELL_VALUE;
      nbFlagsPlaced++;
    }

    infoBombValueElt.textContent = gameConfig.bombs - nbFlagsPlaced;
    checkGameStatus();
  }

  function revealCell(cell) {
    if (cell.dataset.revealed === "true" || cell.dataset.flagged === "true") {
      return;
    }

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    cell.dataset.revealed = "true";
    cell.style.cursor = "auto";

    if (cell.dataset.bomb === "true") {
      cell.textContent = EXPLODED_BOMB_CELL_VALUE;
      endGame(false);
      return;
    }

    nbCellsRevealed++;

    const neighborCount = parseInt(cell.dataset.neighbors);
    cell.textContent = NUMBER_VALUES[neighborCount];

    if (neighborCount === 0) {
      for (
        let r = Math.max(0, row - 1);
        r <= Math.min(gameConfig.rows - 1, row + 1);
        r++
      ) {
        for (
          let c = Math.max(0, col - 1);
          c <= Math.min(gameConfig.cols - 1, col + 1);
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

  function middleClickReveal(cell) {
    if (hasGameOvered || cell.dataset.revealed !== "true") {
      return;
    }

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const neighborCount = parseInt(cell.dataset.neighbors);
    const flagsAround = getNumberOfFlagsAroundCell(row, col);

    // Only reveal if the number of flags matches the number on the cell
    if (flagsAround !== neighborCount) {
      return;
    }

    // Reveal all non-flagged neighbors
    for (
      let r = Math.max(0, row - 1);
      r <= Math.min(gameConfig.rows - 1, row + 1);
      r++
    ) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(gameConfig.cols - 1, col + 1);
        c++
      ) {
        if (r === row && c === col) continue;

        const neighbor = getCellElementAt(r, c);
        if (
          neighbor.dataset.revealed === "false" &&
          neighbor.dataset.flagged === "false"
        ) {
          revealCell(neighbor);
        }
      }
    }

    checkGameStatus();
  }

  function checkGameStatus() {
    if (hasGameOvered) {
      return;
    }

    const totalCells = gameConfig.rows * gameConfig.cols;
    const safeCells = totalCells - gameConfig.bombs;

    if (nbCellsRevealed === safeCells) {
      endGame(true);
    }
  }

  function endGame(hasWon) {
    hasGameOvered = true;

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
    hasClickedInCurrGame = true;
    nbFlagsPlaced = 0;
    nbCellsRevealed = 0;

    infoBombValueElt.textContent = gameConfig.bombs;
    // NOTE: It's actually not really "right click" but more about the "context"
    // button (e.g. long press on android etc.).
    // I don't know how to word it right so for now I call it "right click".
    statusElt.textContent = "Left click to reveal, right click to flag";
    resetBtn.textContent = "Generate new grid";

    board.innerHTML = "";
    applyStyle(board, {
      gridTemplateColumns: `repeat(${gameConfig.cols}, 36px)`,
      gridTemplateRows: `repeat(${gameConfig.rows}, 36px)`,
    });

    for (let row = 0; row < gameConfig.rows; row++) {
      for (let col = 0; col < gameConfig.cols; col++) {
        const cell = document.createElement("div");
        // NOTE: `dataset` is convenient but I'm not sure about its
        // discoverability.
        // Though for an app as simple as bombsweeper we may not care at all
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
          border: "6px solid " + env.STYLE.lineColor,
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

          if (hasClickedInCurrGame) {
            hasClickedInCurrGame = false;
            initializeBombsPlacement(row, col);
          }
          revealCell(cell);

          checkGameStatus();
        });
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          toggleFlagOnCell(cell);
        });
        cell.addEventListener("mousedown", (e) => {
          // Middle click
          if (e.button === 1) {
            e.preventDefault();
            middleClickReveal(cell);
          }
        });

        // Prevent middle click from opening new tabs/scrolling
        cell.addEventListener("auxclick", (e) => {
          if (e.button === 1) {
            e.preventDefault();
          }
        });

        board.appendChild(cell);
      }
    }
  }

  function initializeBombsPlacement(firstRow, firstCol) {
    let bombsPlaced = 0;

    while (bombsPlaced < gameConfig.bombs) {
      const row = Math.floor(Math.random() * gameConfig.rows);
      const col = Math.floor(Math.random() * gameConfig.cols);

      if (
        (row === firstRow && col === firstCol) ||
        getCellElementAt(row, col).dataset.bomb === "true"
      ) {
        continue;
      }

      getCellElementAt(row, col).dataset.bomb = "true";
      bombsPlaced++;
    }

    for (let row = 0; row < gameConfig.rows; row++) {
      for (let col = 0; col < gameConfig.cols; col++) {
        const cell = getCellElementAt(row, col);
        if (cell.dataset.bomb !== "true") {
          const count = getNumberOfBombsAroundCell(row, col);
          cell.dataset.neighbors = count;
        }
      }
    }
  }

  function setGameConfig(config) {
    gameConfig = normalizeGameConfig(config);
    syncConfigControls();
    initializeGame();
  }

  function setCustomConfigFromInputs() {
    setGameConfig({
      rows: parseInt(rowsInput.value, 10),
      cols: parseInt(colsInput.value, 10),
      bombs: parseInt(bombsInput.value, 10),
    });
  }

  function setSettingsPanelOpen(isOpen) {
    applyStyle(controlsElt, {
      visibility: isOpen ? "visible" : "hidden",
    });
    settingsBtn.setAttribute("aria-expanded", String(isOpen));
  }

  function styleFormControl(control) {
    applyStyle(control, {
      backgroundColor: env.STYLE.barBg,
      color: env.STYLE.textColor,
      border: "2px solid " + env.STYLE.lineColor,
      boxSizing: "border-box",
      padding: "3px 5px",
      textAlign: "center",
    });
  }

  function syncConfigControls() {
    rowsInput.value = gameConfig.rows;
    colsInput.value = gameConfig.cols;
    syncCustomInputLimits();
    bombsInput.value = gameConfig.bombs;

    const matchingPreset = DIFFICULTY_PRESETS.find(
      (preset) =>
        preset.rows === gameConfig.rows &&
        preset.cols === gameConfig.cols &&
        preset.bombs === gameConfig.bombs,
    );
    presetSelect.value =
      matchingPreset === undefined ? "custom" : matchingPreset.id;
    boardSummaryElt.textContent =
      `${gameConfig.rows} x ${gameConfig.cols} grid, ${gameConfig.bombs} bombs`;
  }

  function syncCustomInputLimits() {
    const rows = clampInteger(
      parseInt(rowsInput.value, 10),
      MIN_BOARD_LENGTH,
      MAX_BOARD_LENGTH,
    );
    const cols = clampInteger(
      parseInt(colsInput.value, 10),
      MIN_BOARD_LENGTH,
      MAX_BOARD_LENGTH,
    );
    const maxBombs = getMaxBombs({ rows, cols });
    bombsInput.max = maxBombs;
    if (parseInt(bombsInput.value, 10) > maxBombs) {
      bombsInput.value = maxBombs;
    }
    presetSelect.value = "custom";
  }
}

function createLabeledControl(labelText, control) {
  const label = document.createElement("label");
  applyStyle(label, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    fontSize: "12px",
    fontWeight: "bold",
  });

  const labelTitle = document.createElement("span");
  labelTitle.textContent = labelText;
  label.appendChild(labelTitle);
  label.appendChild(control);
  return label;
}

function createNumberInput(value, min, max) {
  const input = document.createElement("input");
  input.type = "number";
  input.min = min;
  input.max = max;
  input.value = value;
  applyStyle(input, {
    width: "58px",
    minHeight: "24px",
  });
  return input;
}

function normalizeGameConfig(config) {
  const rows = clampInteger(config.rows, MIN_BOARD_LENGTH, MAX_BOARD_LENGTH);
  const cols = clampInteger(config.cols, MIN_BOARD_LENGTH, MAX_BOARD_LENGTH);
  const bombs = clampInteger(config.bombs, 1, getMaxBombs({ rows, cols }));
  return { rows, cols, bombs };
}

function getMaxBombs(config) {
  return config.rows * config.cols - 1;
}

function clampInteger(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(Math.floor(value), max));
}

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
