// TODO: Explosion of confetti on win?
// TODO: Count errors

const CARD_FACE_BG = "linear-gradient(135deg, white, #bbb)";
const CARD_BASE_BG =
  "linear-gradient(135deg, rgb(82, 82, 82), rgb(62, 62, 62))";

const PREVIEW_TIME_MS = 2000;

export function create(_args, env) {
  const emojis = [
    "🦜", // Polly wants a cracker etc. Not continuing this one's lyrics
    "🦚",
    "🦩", // なんであいつらはピンク？
    // hehe, delightfully devilish:
    "🐪",
    "🐫",
    "🦉",
    "🦤",
    "🐊", // Interior crocodile alligator, I drive a chevrolet movie theater
    "🐢",
    "🦎",
    "🐏", // Give your heart to someboooody, sooon, riiiight awayyyyy
    "🐑",
    "🐍",
    "🐙",
    "🪼",
    "🐀",
    "🐁",
    "🦀",
    "🐋",
    "🦭",
    "🐟",
    "🦪",
    "🦑", // I'd like to be etc.
    "🦐",
    "🦞",
    "🐬",
    "🐸",
    "🦈",
    "🐛",
    "🐞",
    "🐌",
    "🦘",
  ];

  let gameBoard = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let gameStarted = false;
  let gameComplete = false;
  let selectedIndex = 0;
  let gridCols = 5;
  let gridRows = 4;
  let previewTimeoutId = null;

  const container = document.createElement("div");
  applyStyle(container, {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    padding: "10px",
    backgroundColor: env.STYLE.windowActiveHeader,
    color: env.STYLE.windowActiveHeaderText,
    overflow: "auto",
    boxSizing: "border-box",
  });

  const header = document.createElement("div");
  applyStyle(header, {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "10px",
    borderRadius: "10px",
    flexShrink: "0",
  });

  const titleRow = document.createElement("div");
  applyStyle(titleRow, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  });

  const title = document.createElement("h2");
  title.textContent = "🦜 Memory";
  applyStyle(title, {
    margin: "0",
    color: env.STYLE.windowActiveHeaderText,
    fontSize: "clamp(18px, 4vw, 24px)",
    flexShrink: "0",
  });

  const stats = document.createElement("div");
  applyStyle(stats, {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  });

  const movesDisplay = document.createElement("span");
  movesDisplay.textContent = "Moves: 0";
  applyStyle(movesDisplay, {
    fontSize: "clamp(12px, 3vw, 16px)",
    color: env.STYLE.windowActiveHeaderText,
    whiteSpace: "nowrap",
  });

  const newGameBtn = document.createElement("button");
  newGameBtn.textContent = "New Game";
  applyStyle(newGameBtn, {
    padding: "6px 12px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "clamp(12px, 3vw, 14px)",
    transition: "background-color 0.3s",
    whiteSpace: "nowrap",
    flexShrink: "0",
  });
  newGameBtn.addEventListener("click", handleNewGame);
  newGameBtn.addEventListener("mouseenter", handleNewGameHover);
  newGameBtn.addEventListener("mouseleave", handleNewGameLeave);

  stats.appendChild(movesDisplay);
  stats.appendChild(newGameBtn);
  titleRow.appendChild(title);
  titleRow.appendChild(stats);

  const controlsRow = document.createElement("div");
  applyStyle(controlsRow, {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    alignItems: "center",
    justifyContent: "flex-start",
  });

  const gridControls = document.createElement("div");
  applyStyle(gridControls, {
    display: "flex",
    gap: "5px",
    alignItems: "center",
    flexWrap: "wrap",
  });

  const gridLabel = document.createElement("span");
  gridLabel.textContent = "Size:";
  applyStyle(gridLabel, {
    fontSize: "clamp(12px, 3vw, 14px)",
    color: env.STYLE.windowActiveHeaderText,
    whiteSpace: "nowrap",
    marginRight: "5px",
  });
  gridControls.appendChild(gridLabel);

  [
    {
      cols: 3,
      rows: 2,
    },
    {
      cols: 4,
      rows: 3,
    },
    {
      cols: 4,
      rows: 4,
    },
    {
      cols: 5,
      rows: 4,
    },
    {
      cols: 6,
      rows: 5,
    },
    {
      cols: 8,
      rows: 6,
    },
    {
      cols: 8,
      rows: 8,
    },
  ].forEach((gridObj) => {
    const gridBtn = document.createElement("button");
    gridBtn.textContent = `${gridObj.cols}x${gridObj.rows}`;
    gridBtn.dataset.rows = gridObj.rows;
    gridBtn.dataset.cols = gridObj.cols;
    applyStyle(gridBtn, {
      padding: "3px 6px",
      color: env.STYLE.windowActiveHeaderText,
      border: "none",
      borderRadius: "3px",
      cursor: "pointer",
      fontSize: "clamp(10px, 2.5vw, 12px)",
      transition: "background-color 0.3s",
      whiteSpace: "nowrap",
      minWidth: "32px",
    });
    gridControls.appendChild(gridBtn);
    gridBtn.addEventListener("click", () =>
      handleGridSizeChange(gridObj.cols, gridObj.rows),
    );
  });

  const previewToggle = document.createElement("label");
  applyStyle(previewToggle, {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "clamp(12px, 3vw, 14px)",
    color: env.STYLE.windowActiveHeaderText,
    cursor: "pointer",
    flexShrink: "0",
  });

  const previewCheckbox = document.createElement("input");
  previewCheckbox.type = "checkbox";
  previewCheckbox.checked = true;
  applyStyle(previewCheckbox, {
    cursor: "pointer",
  });
  previewCheckbox.addEventListener("change", handlePreviewToggle);

  const previewLabel = document.createElement("span");
  previewLabel.textContent = "Preview cards";
  applyStyle(previewLabel, {
    whiteSpace: "nowrap",
  });

  previewToggle.appendChild(previewCheckbox);
  previewToggle.appendChild(previewLabel);

  controlsRow.appendChild(gridControls);
  controlsRow.appendChild(previewToggle);

  header.appendChild(titleRow);
  header.appendChild(controlsRow);

  // Create game board container
  const boardContainer = document.createElement("div");
  applyStyle(boardContainer, {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
  });

  const gameGrid = document.createElement("div");
  applyStyle(gameGrid, {
    display: "grid",
    gap: "20px",
    padding: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    maxWidth: "100%",
    overflow: "auto",
  });

  boardContainer.appendChild(gameGrid);
  container.appendChild(header);
  container.appendChild(boardContainer);

  const successMessage = document.createElement("div");
  applyStyle(successMessage, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#27ae60",
    color: "white",
    padding: "20px 40px",
    borderRadius: "12px",
    fontSize: "clamp(18px, 4vw, 24px)",
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    opacity: "0",
    pointerEvents: "none",
    transition: "opacity 0.5s, transform 0.5s",
    zIndex: "1000",
    maxWidth: "90vw",
    textAlign: "center",
  });
  successMessage.textContent = "Congratulations!";
  container.appendChild(successMessage);

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function updateGridButtons() {
    const buttons = Array.from(gridControls.getElementsByTagName("button"));

    buttons.forEach((elt) => {
      if (
        elt.dataset.rows === String(gridRows) &&
        elt.dataset.cols === String(gridCols)
      ) {
        applyStyle(elt, {
          backgroundColor: "#e74c3c",
          color: "white",
          fontWeight: "bold",
        });
      } else {
        applyStyle(elt, {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          fontWeight: "normal",
        });
      }
    });
  }

  function updateGridSize() {
    const containerRect = boardContainer.getBoundingClientRect();
    const availableWidth = Math.max(containerRect.width - 80, 200);
    const availableHeight = Math.max(containerRect.height - 80, 200);

    const gap = 15;
    const cardSize = Math.max(
      50,
      Math.min(
        Math.floor((availableWidth - (gridCols - 1) * gap) / gridCols),
        Math.floor((availableHeight - (gridRows - 1) * gap) / gridRows),
        120,
      ),
    );

    applyStyle(gameGrid, {
      gridTemplateColumns: `repeat(${gridCols}, ${cardSize}px)`,
      gridTemplateRows: `repeat(${gridRows}, ${cardSize}px)`,
      gap: `${gap}px`,
    });

    return cardSize;
  }

  function createCard(emoji, index, cardSize) {
    const card = document.createElement("div");
    applyStyle(card, {
      width: `${cardSize}px`,
      height: `${cardSize}px`,
      background: CARD_BASE_BG,
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: "rotateY(0deg)",
      fontSize: `${Math.max(cardSize * 0.4, 12)}px`,
      userSelect: "none",
      position: "relative",
      transformStyle: "preserve-3d",
    });

    const front = document.createElement("div");
    applyStyle(front, {
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: CARD_BASE_BG,
      borderRadius: "8px",
      fontSize: `${Math.max(cardSize * 0.5, 12)}px`,
    });
    front.textContent = "❓";

    const back = document.createElement("div");
    applyStyle(back, {
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: CARD_FACE_BG,
      borderRadius: "8px",
      fontSize: `${Math.max(cardSize * 0.4, 12)}px`,
    });
    back.textContent = emoji;

    card.appendChild(front);
    card.appendChild(back);

    card.dataset.index = index;
    card.dataset.emoji = emoji;
    card.dataset.flipped = "false";
    card.dataset.matched = "false";

    return card;
  }

  function flipCard(card, show = true) {
    if (show) {
      applyStyle(card, {
        transform: "rotateY(180deg)",
        background: CARD_FACE_BG,
      });
      card.dataset.flipped = "true";
    } else {
      applyStyle(card, {
        transform: "rotateY(0deg)",
        background: CARD_BASE_BG,
      });
      card.dataset.flipped = "false";
    }
  }

  function initializeGame() {
    gameBoard = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    gameStarted = false;
    gameComplete = false;
    selectedIndex = 0;

    movesDisplay.textContent = "Moves: 0";
    successMessage.style.opacity = "0";

    const cardSize = updateGridSize();
    const totalCards = gridCols * gridRows;
    const pairsNeeded = Math.floor(totalCards / 2);

    const gameEmojis = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const emoji = emojis[i % emojis.length];
      gameEmojis.push(emoji, emoji);
    }

    // Add one more emoji if odd number of cards
    if (totalCards % 2 === 1) {
      gameEmojis.push(emojis[pairsNeeded % emojis.length]);
    }

    const shuffledEmojis = shuffleArray(gameEmojis);

    // Clear existing cards
    gameGrid.innerHTML = "";

    // Create new cards
    shuffledEmojis.forEach((emoji, index) => {
      const card = createCard(emoji, index, cardSize);
      card.addEventListener("click", handleCardClickEvent);
      card.addEventListener("mouseenter", handleCardEnter);
      card.addEventListener("mouseleave", handleCardLeave);
      gameBoard.push(card);
      gameGrid.appendChild(card);
    });

    updateGridButtons();

    if (previewCheckbox.checked) {
      showCardPreview();
    } else {
      updateSelectedCard();
    }
  }

  function showCardPreview() {
    if (previewTimeoutId !== null) {
      clearTimeout(previewTimeoutId);
      previewTimeoutId = null;
    }

    gameBoard.forEach((card) => {
      flipCard(card, true);
    });

    previewTimeoutId = setTimeout(() => {
      gameBoard.forEach((card) => {
        if (card.dataset.matched === "false") {
          flipCard(card, false);
        }
      });
      updateSelectedCard();
    }, PREVIEW_TIME_MS);
  }
  function updateSelectedCard() {
    gameBoard.forEach((card, index) => {
      if (index === selectedIndex) {
        applyStyle(card, {
          boxShadow: "0 0 0 3px " + env.STYLE.primaryColor,
          transform:
            card.dataset.flipped === "true"
              ? "rotateY(180deg) scale(1.05)"
              : "rotateY(0deg) scale(1.05)",
        });
      } else {
        applyStyle(card, {
          boxShadow: "none",
          transform:
            card.dataset.flipped === "true"
              ? "rotateY(180deg)"
              : "rotateY(0deg)",
        });
      }
    });
  }

  function handleCardClick(index) {
    if (gameComplete) {
      return;
    }

    const card = gameBoard[index];
    if (card.dataset.flipped === "true" || card.dataset.matched === "true") {
      return;
    }

    if (flippedCards.length >= 2) {
      for (const elt of flippedCards) {
        flipCard(elt.card, false);
      }
      flippedCards.length = 0;
    }

    if (!gameStarted) {
      gameStarted = true;
    }

    flipCard(card, true);
    flippedCards.push({ card, index });

    if (flippedCards.length === 2) {
      const flipped = flippedCards.slice();

      moves++;
      movesDisplay.textContent = `Moves: ${moves}`;

      const [first, second] = flipped;
      if (first.card.dataset.emoji === second.card.dataset.emoji) {
        first.card.dataset.matched = "true";
        second.card.dataset.matched = "true";
        flippedCards.length = 0;
        for (const { card } of [first, second]) {
          applyStyle(card, {
            backgroundColor: "#27ae60",
            transform: "rotateY(180deg) scale(1.1)",
          });
          setTimeout(() => {
            if (card.dataset.flipped === "true") {
              applyStyle(card, {
                transform: "rotateY(180deg)",
              });
            }
          }, 300);
        }

        matchedPairs++;
        if (matchedPairs === Math.floor(gameBoard.length / 2)) {
          gameComplete = true;
          showSuccess();
        }
      } else {
        setTimeout(() => {
          if (!flippedCards.includes(flipped[0])) {
            return;
          }
          for (const f of flipped) {
            flipCard(f.card, false);
          }
          flippedCards.length = 0;
        }, 1000);
      }
    }
  }

  function showSuccess() {
    applyStyle(successMessage, {
      opacity: "1",
      transform: "translate(-50%, -50%) scale(1.1)",
    });

    setTimeout(() => {
      applyStyle(successMessage, {
        transform: "translate(-50%, -50%) scale(1)",
      });
    }, 200);

    setTimeout(() => {
      applyStyle(successMessage, {
        opacity: "0",
      });
    }, 3000);
  }

  function handleCardClickEvent(e) {
    const card = e.currentTarget;
    const index = parseInt(card.dataset.index);
    selectedIndex = index;
    updateSelectedCard();
    handleCardClick(index);
  }

  function handleKeyDown(e) {
    if (gameComplete) return;

    const totalCards = gameBoard.length;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (selectedIndex >= gridCols) {
          selectedIndex -= gridCols;
          updateSelectedCard();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (selectedIndex < totalCards - gridCols) {
          selectedIndex += gridCols;
          updateSelectedCard();
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (selectedIndex % gridCols > 0) {
          selectedIndex--;
          updateSelectedCard();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (
          selectedIndex % gridCols < gridCols - 1 &&
          selectedIndex < totalCards - 1
        ) {
          selectedIndex++;
          updateSelectedCard();
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleCardClick(selectedIndex);
        break;
      case "n":
      case "N":
        e.preventDefault();
        initializeGame();
        break;
    }
  }

  function handleResize() {
    if (gameBoard.length > 0) {
      const cardSize = updateGridSize();
      gameBoard.forEach((card) => {
        const fontSize = Math.max(cardSize * 0.4, 12);
        applyStyle(card, {
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          fontSize: `${fontSize}px`,
        });
        const front = card.children[0];
        const back = card.children[1];
        applyStyle(front, {
          fontSize: `${Math.max(cardSize * 0.5, 12)}px`,
        });
        applyStyle(back, {
          fontSize: `${fontSize}px`,
        });
      });
      updateSelectedCard();
    }
  }

  function handleNewGame() {
    initializeGame();
  }

  function handleGridSizeChange(cols, rows) {
    gridCols = cols;
    gridRows = rows;
    initializeGame();
  }

  function handlePreviewToggle() {
    if (!gameStarted) {
      handleNewGame();
    }
  }

  function handleCardEnter(e) {
    const card = e.currentTarget;
    if (card.dataset.matched === "false" && card.dataset.flipped === "false") {
      applyStyle(card, {
        transform: "rotateY(0deg) scale(1.05)",
        backgroundColor: "#c0392b",
      });
    }
  }

  function handleCardLeave(e) {
    const card = e.currentTarget;
    const index = parseInt(card.dataset.index);
    if (card.dataset.matched === "false" && card.dataset.flipped === "false") {
      applyStyle(card, {
        transform:
          index === selectedIndex
            ? "rotateY(0deg) scale(1.05)"
            : "rotateY(0deg)",
        backgroundColor: "#e74c3c",
      });
    }
  }

  function handleNewGameHover() {
    applyStyle(newGameBtn, {
      backgroundColor: "#c0392b",
    });
  }

  function handleNewGameLeave() {
    applyStyle(newGameBtn, {
      backgroundColor: "#e74c3c",
    });
  }

  initializeGame();

  return {
    element: container,

    onActivate() {
      document.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", handleResize);

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
      container._resizeObserver = resizeObserver;
    },

    onDeactivate() {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);

      if (container._resizeObserver) {
        container._resizeObserver.disconnect();
        delete container._resizeObserver;
      }
    },
  };
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
