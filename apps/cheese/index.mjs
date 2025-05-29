// const MAZE_RESOLUTION = 20;
const CANVAS_SIZE = 1620;
const CANVAS_WIDTH = CANVAS_SIZE;
const CANVAS_HEIGHT = CANVAS_SIZE * (21 / 27);
const CELL_SIZE = 60;
// const PLAYER_START_X = Math.round(14 * CELL_SIZE);
// const PLAYER_START_Y = Math.round(19 * CELL_SIZE);
const PLAYER_START_X = 1 * CELL_SIZE;
const PLAYER_START_Y = 1 * CELL_SIZE;
const SPEED = 4;
const SLOWER_SPEED = 3;
const DOT_SIZE = 8;
const CAMEMBERT_SIZE = 18;

const GHOST_MODES = {
  CHASE: 0,
  SCATTER: 1,
  FRIGHTENED: 2,
  EATEN: 3,
};

const PLAYER_DIRECTIONS = [
  { x: SPEED, y: 0 }, // right
  { x: 0, y: SPEED }, // down
  { x: -SPEED, y: 0 }, // left
  { x: 0, y: -SPEED }, // up
];

const GHOST_DIRECTIONS = [
  // Blinky (red)
  [
    { x: SPEED, y: 0 }, // right
    { x: 0, y: SPEED }, // down
    { x: -SPEED, y: 0 }, // left
    { x: 0, y: -SPEED }, // up
  ],
  // Pinky (pink)
  [
    { x: SPEED, y: 0 }, // right
    { x: 0, y: SPEED }, // down
    { x: -SPEED, y: 0 }, // left
    { x: 0, y: -SPEED }, // up
  ],
  // Inky (cyan)
  [
    { x: SLOWER_SPEED, y: 0 }, // right
    { x: 0, y: SLOWER_SPEED * 0.9 }, // down
    { x: -SLOWER_SPEED, y: 0 }, // left
    { x: 0, y: -SLOWER_SPEED * 0.9 }, // up
  ],
  // Clyde (cyan)
  [
    { x: SLOWER_SPEED, y: 0 }, // right
    { x: 0, y: SLOWER_SPEED }, // down
    { x: -SLOWER_SPEED, y: 0 }, // left
    { x: 0, y: -SLOWER_SPEED }, // up
  ],
];

const SCATTER_TARGETS = [
  { x: CANVAS_WIDTH - CELL_SIZE, y: CELL_SIZE }, // Blinky (red) - top right
  { x: CELL_SIZE, y: CELL_SIZE }, // Pinky (pink) - top left
  { x: CANVAS_WIDTH - CELL_SIZE, y: CANVAS_HEIGHT - CELL_SIZE }, // Inky (cyan) - bottom right
  { x: CELL_SIZE, y: CANVAS_HEIGHT - CELL_SIZE }, // Sue/Clyde (orange) - bottom left
];

const mouseSvg = `<svg height="${CELL_SIZE}px" width="${CELL_SIZE}px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
<g>
	<path stroke-width="10" stroke="#000000" fill="#ffffff" d="M506.046,300.288l-74.596-74.588c22.354-11.759,37.606-35.174,37.606-62.184   c0-38.806-31.452-70.266-70.259-70.266c-12.745,0-24.66,3.448-34.959,9.38c9.639,14.169,15.281,31.258,15.281,49.646   c0,20.479-7.051,39.304-18.766,54.31l-10.357-7.184c10.29-12.946,16.467-29.302,16.467-47.126   c0-41.906-33.965-75.886-75.886-75.886c-38.97,0-71.037,29.383-75.352,67.204c-5.71,0.8-11.5,1.802-17.409,3.062   C92.517,169.061,80.09,275.316,79.378,317.556c-7.63,0-15.103,0-22.094,0c-12.679,0.007-23.593,2.164-32.512,5.982   c-8.89,3.826-15.874,9.313-20.226,16.186C1.646,344.299,0,349.534,0,354.887c-0.007,5.242,1.602,10.484,4.568,15.082   c2.966,4.619,7.222,8.63,12.546,11.966c10.692,6.636,25.676,10.752,45.472,11.508c13.502,0.497,23.592,2.202,30.889,4.464   c7.317,2.269,11.796,5.041,14.532,7.592c1.824,1.705,2.929,3.322,3.663,4.871c0.964,2.06,1.304,4.092,1.312,6.065   c0.03,3.558-1.298,6.777-1.438,7.036v0.014c-2.025,4.152-0.342,9.157,3.796,11.233c4.174,2.084,9.238,0.4,11.314-3.774   c0.304-0.682,3.143-6.258,3.196-14.51c0-2.981-0.408-6.317-1.542-9.78c-1.128-3.456-3.003-7.006-5.761-10.306   c-5.546-6.629-14.355-12.011-27.233-15.459c-8.608-2.313-19.122-3.819-32.105-4.308c-13.309-0.49-23.54-2.729-30.828-5.747   c-7.318-3.01-11.574-6.754-13.621-9.972c-1.379-2.166-1.883-4.086-1.89-5.977c0.008-1.928,0.556-3.944,1.943-6.161   c1.379-2.202,3.64-4.537,6.933-6.687c6.554-4.286,17.201-7.637,31.54-7.615c7.095,0,14.68,0,22.443,0   c0.023,0.342,0.037,0.549,0.037,0.549h411.912c8.215,0,15.63-4.946,18.773-12.53C513.6,314.842,511.858,306.101,506.046,300.288z    M400.19,278.764c-7.763,0-14.05-6.295-14.05-14.058c0-7.762,6.287-14.05,14.05-14.05c7.763,0,14.058,6.288,14.058,14.05   C414.248,272.469,407.954,278.764,400.19,278.764z"/>
</g>
</svg>`;

const ghostSvg = `<svg width="${CELL_SIZE}px" height="${CELL_SIZE}px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 6C2 2.68629 4.68629 0 8 0C11.3137 0 14 2.68629 14 6V16H12L10 14L8 16L6 14L4 16H2V6ZM7 6C7 6.55228 6.55228 7 6 7C5.44772 7 5 6.55228 5 6C5 5.44772 5.44772 5 6 5C6.55228 5 7 5.44772 7 6ZM10 7C10.5523 7 11 6.55228 11 6C11 5.44772 10.5523 5 10 5C9.44772 5 9 5.44772 9 6C9 6.55228 9.44772 7 10 7Z" fill="#000000"/></svg>`;

const mouseSvgUrl = URL.createObjectURL(
  new Blob([mouseSvg], { type: "image/svg+xml" }),
);
const mouseImg = new Image();
mouseImg.src = mouseSvgUrl;
mouseImg.onload = () => {
  URL.revokeObjectURL(mouseSvgUrl);
};

const ghostSvgUrl = URL.createObjectURL(
  new Blob([ghostSvg], { type: "image/svg+xml" }),
);
const ghostImg = new Image();
ghostImg.src = ghostSvgUrl;
ghostImg.onload = () => {
  URL.revokeObjectURL(ghostSvgUrl);
};

export function create(_args, env) {
  const wrapper = document.createElement("div");
  // wrapper.style.background = env.STYLE.barBg;
  wrapper.style.background = "#27272c";
  wrapper.style.position = "relative";
  wrapper.style.height = "100%";
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "center";
  wrapper.style.alignItems = "center";
  wrapper.style.overflow = "hidden";
  const gameArea = document.createElement("div");
  // gameArea.style.background = env.STYLE.windowActiveHeader;
  gameArea.style.background = "#27272c";
  gameArea.style.margin = "0";
  gameArea.style.height = "auto";
  gameArea.style.width = "auto";
  gameArea.style.overflow = "hidden";
  gameArea.style.maxWidth = "1200px";
  gameArea.style.aspectRatio = "27/ 21";
  gameArea.style.maxHeight = "100%";

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  // canvas.style.minWidth = "600px";
  // canvas.style.background = env.windowActiveHeader;
  const ctx = canvas.getContext("2d");

  const scoreWrapper = document.createElement("div");
  // scoreWrapper.style.color = env.STYLE.barText;
  scoreWrapper.style.color = "#fff";
  scoreWrapper.style.fontFamily = "monospace";
  scoreWrapper.style.fontWeight = "bold";
  scoreWrapper.style.position = "absolute";
  scoreWrapper.style.top = "2px";
  scoreWrapper.style.left = "5px";
  scoreWrapper.style.opacity = "0.6";
  scoreWrapper.textContent = "Score: ";
  const scoreElt = document.createElement("span");
  scoreWrapper.appendChild(scoreElt);
  scoreWrapper.appendChild(document.createTextNode(" | Lives: "));
  scoreElt.textContent = "0";
  const livesElt = document.createElement("span");
  scoreWrapper.appendChild(livesElt);
  livesElt.textContent = "3";

  gameArea.appendChild(canvas);
  wrapper.appendChild(gameArea);
  wrapper.appendChild(scoreWrapper);

  let modeTimer = 0;
  let currentMode = GHOST_MODES.SCATTER;
  const MODE_DURATIONS = [420, 1200, 420, 1200, 300, 1200, 300]; // scatter/chase alternating
  let modeIndex = 0;

  const player = {
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    direction: 0, // 0=right, 1=down, 2=left, 3=up
    nextDirection: 0, // awaited direction for next frame
  };

  const ROWS = canvas.height / CELL_SIZE;
  const COLS = canvas.width / CELL_SIZE;

  // Game state
  let score = 0;
  let lives = 3;
  let gameRunning = true;
  let dots = [];
  let camemberts = [];

  // Maze layout (W = wall, 0 = empty, D = dot, C = camembert)
  const W = 1;
  const D = 2;
  const C = 3;

  const maze =
    // prettier-ignore
    [[W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
		 [W,D,D,D,D,D,D,D,D,D,D,D,D,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
		 [W,C,W,W,W,W,D,W,W,W,W,W,D,W,D,W,W,W,W,W,D,W,W,W,W,C,W],
		 [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
		 [W,D,W,W,W,W,D,W,W,D,W,W,W,W,W,W,W,D,W,W,D,W,W,W,W,D,W],
		 [W,D,D,D,D,D,D,W,W,D,D,D,D,W,D,D,D,D,W,W,D,D,D,D,D,D,W],
		 [W,W,W,W,W,W,D,W,W,W,W,W,0,W,0,W,W,W,W,W,D,W,W,W,W,W,W],
		 [0,0,0,0,0,W,D,W,W,0,0,0,0,0,0,0,0,0,W,W,D,W,0,0,0,0,0],
		 [W,W,W,W,W,W,D,W,W,0,W,W,0,0,0,W,W,0,W,W,D,W,W,W,W,W,W],
		 [0,0,0,0,0,0,D,0,0,0,W,0,0,0,0,0,W,0,0,0,D,0,0,0,0,0,0],
		 [W,W,W,W,W,W,D,W,W,0,W,0,0,0,0,0,W,0,W,W,D,W,W,W,W,W,W],
		 [0,0,0,0,0,W,D,W,W,0,W,W,W,W,W,W,W,0,W,W,D,W,0,0,0,0,0],
		 [W,W,W,W,W,W,D,W,W,0,0,0,0,0,0,0,0,0,W,W,D,W,W,W,W,W,W],
		 [W,D,D,D,D,D,D,D,D,D,D,D,D,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
		 [W,D,W,W,W,W,D,W,W,W,W,W,D,W,D,W,W,W,W,W,D,W,W,W,W,D,W],
		 [W,C,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,C,W],
		 [W,W,W,D,W,W,D,W,W,D,W,W,W,W,W,W,W,D,W,W,D,W,W,D,W,W,W],
		 [W,D,D,D,D,D,D,W,W,D,D,D,D,W,D,D,D,D,W,W,D,D,D,D,D,D,W],
		 [W,D,W,W,W,W,W,W,W,W,W,W,D,W,D,W,W,W,W,W,W,W,W,W,W,D,W],
		 [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
		 [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W]];

  // Initialize dots and camembert from maze
  function initDots() {
    for (let row = 0; row < maze.length; row++) {
      for (let col = 0; col < maze[row].length; col++) {
        if (maze[row][col] === D) {
          dots.push({ x: col, y: row });
        } else if (maze[row][col] === C) {
          camemberts.push({ x: col, y: row });
        }
      }
    }
  }

  const ghosts = [
    // Blinky
    {
      x: 12 * CELL_SIZE,
      y: 10 * CELL_SIZE,
      direction: 0,
      color: "#ff0000",
      mode: GHOST_MODES.SCATTER,
      frightenedTimer: 0,
    },
    // Pinky
    {
      x: 13 * CELL_SIZE,
      y: 10 * CELL_SIZE,
      direction: 2,
      color: "#ffb8ff",
      mode: GHOST_MODES.SCATTER,
      frightenedTimer: 0,
    },
    // Inky
    {
      x: 14 * CELL_SIZE,
      y: 10 * CELL_SIZE,
      direction: 0,
      color: "#00ffff",
      mode: GHOST_MODES.SCATTER,
      frightenedTimer: 0,
    },
    // Clyde
    {
      x: 15 * CELL_SIZE,
      y: 10 * CELL_SIZE,
      direction: 3,
      color: "#ffb852",
      mode: GHOST_MODES.SCATTER,
      frightenedTimer: 0,
    },
  ];

  function isWall(x, y) {
    const floorX = Math.floor(x / CELL_SIZE);
    const floorY = Math.floor(y / CELL_SIZE);
    const ceilX = Math.ceil(x / CELL_SIZE);
    const ceilY = Math.ceil(y / CELL_SIZE);
    if (
      floorY < 0 ||
      ceilY >= maze.length ||
      floorX < 0 ||
      ceilX >= maze[0].length
    ) {
      return true;
    }
    return (
      maze[floorY][floorX] === W ||
      maze[ceilY][ceilX] === W ||
      maze[floorY][ceilX] === W ||
      maze[ceilY][floorX] === W
    );
  }

  function hasCollision(x, y, type) {
    const roundedX = Math.round(x / CELL_SIZE);
    const roundexY = Math.round(y / CELL_SIZE);
    if (maze[roundexY][roundedX] === type) {
      return [roundedX, roundexY];
    }
  }

  // function drawMaze() {
  //   ctx.fillStyle = "#0000ff";
  //   for (let row = 0; row < maze.length; row++) {
  //     for (let col = 0; col < maze[row].length; col++) {
  //       if (maze[row][col] === W) {
  //         ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  //       }
  //     }
  //   }
  // }
  // function drawMaze() {
  //   ctx.strokeStyle = "#0000ff";
  //   ctx.lineWidth = 2;
  //
  //   for (let row = 0; row < maze.length; row++) {
  //     for (let col = 0; col < maze[row].length; col++) {
  //       if (maze[row][col] === W) {
  //         const x = col * CELL_SIZE;
  //         const y = row * CELL_SIZE;
  //
  //         ctx.beginPath();
  //
  //         // Draw top edge if cell above is empty or out of bounds
  //         if (row === 0 || maze[row - 1][col] === 0) {
  //           ctx.moveTo(x, y);
  //           ctx.lineTo(x + CELL_SIZE, y);
  //         }
  //
  //         // Draw bottom edge if cell below is empty or out of bounds
  //         if (row === maze.length - 1 || maze[row + 1][col] === 0) {
  //           ctx.moveTo(x, y + CELL_SIZE);
  //           ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
  //         }
  //
  //         // Draw left edge if cell to left is empty or out of bounds
  //         if (col === 0 || maze[row][col - 1] === 0) {
  //           ctx.moveTo(x, y);
  //           ctx.lineTo(x, y + CELL_SIZE);
  //         }
  //
  //         // Draw right edge if cell to right is empty or out of bounds
  //         if (col === maze[row].length - 1 || maze[row][col + 1] === 0) {
  //           ctx.moveTo(x + CELL_SIZE, y);
  //           ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
  //         }
  //
  //         ctx.stroke();
  //       }
  //     }
  //   }
  // }
  // function drawMaze() {
  //   ctx.strokeStyle = "#0000ff";
  //   ctx.lineWidth = 2;
  //
  //   for (let row = 0; row < maze.length; row++) {
  //     for (let col = 0; col < maze[row].length; col++) {
  //       if (maze[row][col] === W) {
  //         const x = col * CELL_SIZE;
  //         const y = row * CELL_SIZE;
  //
  //         ctx.beginPath();
  //
  //         // Draw top edge if cell above is not a wall or out of bounds
  //         if (row === 0 || maze[row - 1][col] !== W) {
  //           ctx.moveTo(x, y);
  //           ctx.lineTo(x + CELL_SIZE, y);
  //         }
  //
  //         // Draw bottom edge if cell below is not a wall or out of bounds
  //         if (row === maze.length - 1 || maze[row + 1][col] !== W) {
  //           ctx.moveTo(x, y + CELL_SIZE);
  //           ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
  //         }
  //
  //         // Draw left edge if cell to left is not a wall or out of bounds
  //         if (col === 0 || maze[row][col - 1] !== W) {
  //           ctx.moveTo(x, y);
  //           ctx.lineTo(x, y + CELL_SIZE);
  //         }
  //
  //         // Draw right edge if cell to right is not a wall or out of bounds
  //         if (col === maze[row].length - 1 || maze[row][col + 1] !== W) {
  //           ctx.moveTo(x + CELL_SIZE, y);
  //           ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
  //         }
  //
  //         ctx.stroke();
  //       }
  //     }
  //   }
  // }
  function drawMaze() {
    // ctx.fillStyle = "#222288";
    ctx.fillStyle = "#224455";
    const radius = 30;

    for (let row = 0; row < maze.length; row++) {
      for (let col = 0; col < maze[row].length; col++) {
        if (maze[row][col] === W) {
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;

          // Check adjacent cells
          const hasWallAbove = row > 0 && maze[row - 1][col] === W;
          const hasWallBelow =
            row < maze.length - 1 && maze[row + 1][col] === W;
          const hasWallLeft = col > 0 && maze[row][col - 1] === W;
          const hasWallRight =
            col < maze[row].length - 1 && maze[row][col + 1] === W;

          // Check diagonal neighbors for corner rounding
          const hasWallTopLeft =
            row > 0 && col > 0 && maze[row - 1][col - 1] === W;
          const hasWallTopRight =
            row > 0 &&
            col < maze[row].length - 1 &&
            maze[row - 1][col + 1] === W;
          const hasWallBottomLeft =
            row < maze.length - 1 && col > 0 && maze[row + 1][col - 1] === W;
          const hasWallBottomRight =
            row < maze.length - 1 &&
            col < maze[row].length - 1 &&
            maze[row + 1][col + 1] === W;

          ctx.beginPath();

          // Determine which corners should be rounded (external corners only)
          const roundTopLeft = !hasWallAbove && !hasWallLeft;
          const roundTopRight = !hasWallAbove && !hasWallRight;
          const roundBottomLeft = !hasWallBelow && !hasWallLeft;
          const roundBottomRight = !hasWallBelow && !hasWallRight;

          // Also round internal corners where diagonal is missing
          const roundInternalTopLeft =
            hasWallAbove && hasWallLeft && !hasWallTopLeft;
          const roundInternalTopRight =
            hasWallAbove && hasWallRight && !hasWallTopRight;
          const roundInternalBottomLeft =
            hasWallBelow && hasWallLeft && !hasWallBottomLeft;
          const roundInternalBottomRight =
            hasWallBelow && hasWallRight && !hasWallBottomRight;

          const r = radius;
          ctx.moveTo(x + (roundTopLeft ? r : 0), y);

          // Top edge
          ctx.lineTo(x + CELL_SIZE - (roundTopRight ? r : 0), y);
          if (roundTopRight) {
            ctx.quadraticCurveTo(x + CELL_SIZE, y, x + CELL_SIZE, y + r);
          }

          // Right edge
          ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE - (roundBottomRight ? r : 0));
          if (roundBottomRight) {
            ctx.quadraticCurveTo(
              x + CELL_SIZE,
              y + CELL_SIZE,
              x + CELL_SIZE - r,
              y + CELL_SIZE,
            );
          }

          // Bottom edge
          ctx.lineTo(x + (roundBottomLeft ? r : 0), y + CELL_SIZE);
          if (roundBottomLeft) {
            ctx.quadraticCurveTo(x, y + CELL_SIZE, x, y + CELL_SIZE - r);
          }

          // Left edge
          ctx.lineTo(x, y + (roundTopLeft ? r : 0));
          if (roundTopLeft) {
            ctx.quadraticCurveTo(x, y, x + r, y);
          }

          ctx.fill();

          // Handle internal corner cutouts
          if (roundInternalTopLeft) {
            ctx.beginPath();
            ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + r);
            ctx.fill();
          }
          if (roundInternalTopRight) {
            ctx.beginPath();
            ctx.arc(x + CELL_SIZE - r, y + r, r, 1.5 * Math.PI, 0);
            ctx.lineTo(x + CELL_SIZE, y);
            ctx.lineTo(x + CELL_SIZE - r, y);
            ctx.fill();
          }
          if (roundInternalBottomLeft) {
            ctx.beginPath();
            ctx.arc(x + r, y + CELL_SIZE - r, r, 0.5 * Math.PI, Math.PI);
            ctx.lineTo(x, y + CELL_SIZE);
            ctx.lineTo(x, y + CELL_SIZE - r);
            ctx.fill();
          }
          if (roundInternalBottomRight) {
            ctx.beginPath();
            ctx.arc(x + CELL_SIZE - r, y + CELL_SIZE - r, r, 0, 0.5 * Math.PI);
            ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
            ctx.lineTo(x + CELL_SIZE - r, y + CELL_SIZE);
            ctx.fill();
          }
        }
      }
    }
  }

  function drawDotsAndCamembert() {
    ctx.fillStyle = "#ffffff";
    dots.forEach((dot) => {
      ctx.beginPath();
      const startAngle = 0;
      const endAngle = Math.PI * 2;
      ctx.arc(
        dot.x * CELL_SIZE + CELL_SIZE / 2,
        dot.y * CELL_SIZE + CELL_SIZE / 2,
        DOT_SIZE,
        startAngle,
        endAngle,
      );
      ctx.lineTo(
        dot.x * CELL_SIZE + CELL_SIZE / 2,
        dot.y * CELL_SIZE + CELL_SIZE / 2,
      );
      ctx.fill();
    });

    camemberts.forEach((camembert) => {
      ctx.fillStyle = "#e1d606";
      ctx.beginPath();
      const startAngle = Math.PI / 6;
      const endAngle = -Math.PI / 6;
      ctx.arc(
        camembert.x * CELL_SIZE + CELL_SIZE / 2,
        camembert.y * CELL_SIZE + CELL_SIZE / 2,
        CAMEMBERT_SIZE,
        startAngle,
        endAngle,
      );
      ctx.lineTo(
        camembert.x * CELL_SIZE + CELL_SIZE / 2,
        camembert.y * CELL_SIZE + CELL_SIZE / 2,
      );
      ctx.fill();
    });
  }

  function drawPlayer() {
    const xPlacement = player.x;
    const yPlacement = player.y;

    switch (player.direction) {
      case 0:
        // right
        ctx.drawImage(mouseImg, xPlacement, yPlacement);
        break;
      case 1: {
        // down
        const currentTransform = ctx.getTransform();
        const centerX = xPlacement + mouseImg.width / 2;
        const centerY = yPlacement + mouseImg.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(mouseImg, -mouseImg.width / 2, -mouseImg.height / 2);
        ctx.setTransform(currentTransform);
        break;
      }
      case 2: {
        // left
        const currentTransform = ctx.getTransform();
        ctx.setTransform(-1, 0, 0, 1, xPlacement + mouseImg.width, yPlacement);
        ctx.drawImage(mouseImg, 0, 0);
        ctx.setTransform(currentTransform);
        break;
      }
      default: {
        // up
        const currentTransform = ctx.getTransform();
        const centerX = xPlacement + mouseImg.width / 2;
        const centerY = yPlacement + mouseImg.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(mouseImg, -mouseImg.width / 2, -mouseImg.height / 2);
        ctx.setTransform(currentTransform);
        break;
      }
    }
  }

  function drawGhosts() {
    ghosts.forEach((ghost) => {
      const xPlacement = ghost.x + CELL_SIZE / 2;
      const yPlacement = ghost.y + CELL_SIZE / 2;

      ctx.fillStyle = ghost.scared ? "#0000ff" : ghost.color;
      // ctx.drawImage(ghostImg, xPlacement, yPlacement);
      const radius = CELL_SIZE / 2 - 2;

      // Ghost body
      ctx.beginPath();
      ctx.arc(xPlacement, yPlacement - radius / 2, radius, Math.PI, 0, false);
      ctx.rect(
        xPlacement - radius,
        yPlacement - radius / 2,
        radius * 2,
        radius * 1.5,
      );
      ctx.fill();

      // Ghost bottom wavy part
      ctx.beginPath();
      ctx.moveTo(xPlacement - radius, yPlacement + radius / 2);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(
          xPlacement - radius + (radius / 2) * (i + 0.5),
          yPlacement + radius / 2 + (i % 2 ? -4 : 0),
        );
        ctx.lineTo(
          xPlacement - radius + (radius / 2) * (i + 1),
          yPlacement + radius / 2,
        );
      }
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        xPlacement - radius / 2,
        yPlacement - radius / 2,
        radius / 3,
        radius / 3,
      );
      ctx.fillRect(
        xPlacement + radius / 6,
        yPlacement - radius / 2,
        radius / 3,
        radius / 3,
      );

      if (!ghost.mode === GHOST_MODES.FRIGHTENED) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(
          xPlacement - radius / 3,
          yPlacement - radius / 3,
          radius / 6,
          radius / 6,
        );
        ctx.fillRect(
          xPlacement + radius / 4,
          yPlacement - radius / 3,
          radius / 6,
          radius / 6,
        );
      }
    });
  }

  function movePlayer() {
    const dir = PLAYER_DIRECTIONS[player.nextDirection];
    const newX = player.x + dir.x;
    const newY = player.y + dir.y;

    if (!isWall(newX, newY)) {
      player.direction = player.nextDirection;
      player.x = newX;
      player.y = newY;
    } else {
      // Try to continue in current direction
      const currentDir = PLAYER_DIRECTIONS[player.direction];
      const nextX = player.x + currentDir.x;
      const nextY = player.y + currentDir.y;

      if (!isWall(nextX, nextY)) {
        player.x = nextX;
        player.y = nextY;
      }
    }

    // Tunnels
    if (player.x <= 0 && player.direction === 2) {
      player.x = CELL_SIZE * (COLS - 1);
    } else if (player.direction === 0 && player.x >= (COLS - 1) * CELL_SIZE) {
      player.x = 0;
    } else if (player.y <= 0 && player.direction === 3) {
      player.y = CELL_SIZE * (ROWS - 1);
    } else if (player.direction === 4 && player.y >= (ROWS - 1) * CELL_SIZE) {
      player.y = 0;
    }

    const dotCollision = hasCollision(player.x, player.y, D);
    if (dotCollision) {
      const [x, y] = dotCollision;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (dot.x === x && dot.y === y) {
          dots.splice(i, 1);
          score += 10;
          scoreElt.textContent = score;
          break;
        }
      }
    }

    const camembertCollision = hasCollision(player.x, player.y, C);
    if (camembertCollision) {
      const [x, y] = camembertCollision;
      for (let i = 0; i < camemberts.length; i++) {
        const p = camemberts[i];
        if (p.x === x && p.y === y) {
          camemberts.splice(i, 1);
          score += 50;
          scoreElt.textContent = score;
          frightenGhosts();
          break;
        }
      }
    }
  }

  function checkGhostAndPlayerCollision() {
    ghosts.forEach((ghost) => {
      if (ghost.x === player.x && ghost.y === player.y) {
        if (ghost.scared) {
          // Ghost eaten
          score += 200;
          scoreElt.textContent = score;
          // ghost.x = 14;
          // ghost.y = 9;
          ghost.scared = false;
          ghost.scaredTimer = 0;
        } else {
          // Player caught
          lives--;
          livesElt.textContent = lives;

          if (lives <= 0) {
            gameRunning = false;
            // alert("Game Over! Final Score: " + score);
            // location.reload();
          } else {
            // Reset positions
            player.x = PLAYER_START_X;
            player.y = PLAYER_START_Y;
            // ghosts.forEach((g) => {
            //   g.x = 14;
            //   g.y = 9;
            //   g.scared = false;
            //   g.scaredTimer = 0;
            // });
          }
        }
      }
    });
  }

  function checkWin() {
    if (dots.length === 0 && camemberts.length === 0) {
      gameRunning = false;
      // alert("You Win! Final Score: " + score);
      // location.reload();
    }
  }

  function gameLoop() {
    if (!gameRunning) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawDotsAndCamembert();
    movePlayer();
    updateGhosts();
    drawPlayer();
    drawGhosts();
    checkGhostAndPlayerCollision();
    checkWin();

    requestAnimationFrame(gameLoop);
  }

  // Input handling
  document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
      case "w":
      case "arrowup":
        player.nextDirection = 3;
        break;
      case "s":
      case "arrowdown":
        player.nextDirection = 1;
        break;
      case "a":
      case "arrowleft":
        player.nextDirection = 2;
        break;
      case "d":
      case "arrowright":
        player.nextDirection = 0;
        break;
    }
  });

  // Initialize and start game
  initDots();
  gameLoop();
  return { element: wrapper };

  function updateGhostAI() {
    modeTimer++;
    if (
      modeTimer >= MODE_DURATIONS[modeIndex] &&
      currentMode !== GHOST_MODES.FRIGHTENED
    ) {
      modeTimer = 0;
      modeIndex = Math.min(modeIndex + 1, MODE_DURATIONS.length - 1);
      currentMode === GHOST_MODES.SCATTER
        ? GHOST_MODES.CHASE
        : GHOST_MODES.SCATTER;
      ghosts.forEach((ghost) => {
        if (
          ghost.mode !== GHOST_MODES.FRIGHTENED &&
          ghost.mode !== GHOST_MODES.EATEN
        ) {
          ghost.direction = (ghost.direction + 2) % 4;
        }
      });
    }

    ghosts.forEach((ghost, index) => updateGhost(ghost, index));
  }

  function updateGhost(ghost, ghostIndex) {
    if (
      ghost.mode !== GHOST_MODES.FRIGHTENED &&
      ghost.mode !== GHOST_MODES.EATEN
    ) {
      ghost.mode = currentMode;
    }

    let targetX, targetY;

    switch (ghost.mode) {
      case GHOST_MODES.CHASE:
        const target = getChaseTarget(ghostIndex);
        targetX = target.x;
        targetY = target.y;
        break;

      case GHOST_MODES.SCATTER:
        targetX = SCATTER_TARGETS[ghostIndex].x;
        targetY = SCATTER_TARGETS[ghostIndex].y;
        break;

      case GHOST_MODES.FRIGHTENED:
        moveGhostRandom(ghost, ghostIndex);
        return;

      case GHOST_MODES.EATEN:
        // XXX TODO:
        targetX = GHOST_HOME.x;
        targetY = GHOST_HOME.y;
        if (
          Math.abs(ghost.x - targetX) < CELL_SIZE &&
          Math.abs(ghost.y - targetY) < CELL_SIZE
        ) {
          ghost.mode = GHOST_MODES.SCATTER;
        }
        break;
    }
    moveGhostToTarget(ghost, ghostIndex, targetX, targetY);
  }

  function getChaseTarget(ghostIndex) {
    const ghost = ghosts[ghostIndex];
    switch (ghostIndex) {
      case 0: // Blinky (red) - directly targets player
        return { x: player.x, y: player.y };

      case 1: // Pinky (pink) - targets 4 cells ahead of player
        let offsetX = 0;
        let offsetY = 0;
        switch (player.direction) {
          case 0:
            offsetX = 4 * CELL_SIZE;
            break; // right
          case 1:
            offsetY = 4 * CELL_SIZE;
            break; // down
          case 2:
            offsetX = -4 * CELL_SIZE;
            break; // left
          case 3:
            offsetY = -4 * CELL_SIZE;
            offsetX = -4 * CELL_SIZE;
            break; // up (with original bug in bonus!)
        }
        return {
          x: Math.max(
            0,
            Math.min(canvas.width - CELL_SIZE, player.x + offsetX),
          ),
          y: Math.max(
            0,
            Math.min(canvas.height - CELL_SIZE, player.y + offsetY),
          ),
        };

      case 2: // Inky (cyan)
        const blinky = ghosts[0];
        const vectorX =
          player.x +
          (player.direction === 0
            ? 2 * CELL_SIZE
            : player.direction === 2
              ? -2 * CELL_SIZE
              : 0) -
          blinky.x;
        const vectorY =
          player.y +
          (player.direction === 1
            ? 2 * CELL_SIZE
            : player.direction === 3
              ? -2 * CELL_SIZE
              : 0) -
          blinky.y;
        return {
          x: Math.max(
            0,
            Math.min(canvas.width - CELL_SIZE, blinky.x + vectorX * 2),
          ),
          y: Math.max(
            0,
            Math.min(canvas.height - CELL_SIZE, blinky.y + vectorY * 2),
          ),
        };

      case 3: // Sue/Clyde (orange) - targets player if far, scatters if close
        const distance = Math.sqrt(
          Math.pow(ghost.x - player.x, 2) + Math.pow(ghost.y - player.y, 2),
        );
        if (distance > 8 * CELL_SIZE) {
          return { x: player.x, y: player.y };
        } else {
          return SCATTER_TARGETS[3];
        }
    }
  }

  function moveGhostToTarget(ghost, ghostIndex, targetX, targetY) {
    if (!isAtCell(ghost)) {
      moveGhost(ghost, ghostIndex);
      return;
    }

    // Use A* to find optimal path
    const newDirection = findPathAStar(ghost.x, ghost.y, targetX, targetY);

    if (newDirection !== null) {
      // Don't reverse direction unless it's the optimal path
      if (
        newDirection !== (ghost.direction + 2) % 4 ||
        getPossibleMoves(ghost, ghostIndex).length === 1
      ) {
        ghost.direction = newDirection;
      }
    }

    // If no path found, fall back to current behavior
    if (getPossibleMoves(ghost, ghostIndex).includes(ghost.direction)) {
      moveGhost(ghost, ghostIndex);
    } else {
      // Find any valid direction
      const possibleMoves = getPossibleMoves(ghost, ghostIndex);
      if (possibleMoves.length > 0) {
        ghost.direction = possibleMoves[0];
        moveGhost(ghost, ghostIndex);
      }
    }
  }

  function moveGhostRandom(ghost, ghostIndex) {
    if (!isAtCell(ghost)) {
      moveGhost(ghost, ghostIndex);
      return;
    }
    const possibleMoves = getPossibleMoves(ghost, ghostIndex);
    if (possibleMoves.length === 0) {
      return;
    }

    // Prefer not to reverse direction
    const nonReverseMoves = possibleMoves.filter(
      (dir) => dir !== (ghost.direction + 2) % 4,
    );
    const availableMoves =
      nonReverseMoves.length > 0 ? nonReverseMoves : possibleMoves;

    ghost.direction =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    moveGhost(ghost, ghostIndex);
  }

  function getPossibleMoves(ghost, ghostIndex) {
    const moves = [];
    for (let dir = 0; dir < 4; dir++) {
      const offset = getGhostDirectionOffset(ghostIndex, dir);
      const newX = ghost.x + offset.x;
      const newY = ghost.y + offset.y;

      if (!isWall(newX, newY)) {
        moves.push(dir);
      }
    }

    return moves;
  }

  function getGhostDirectionOffset(ghostIndex, direction) {
    return GHOST_DIRECTIONS[ghostIndex][direction];
  }

  function moveGhost(ghost, ghostIndex) {
    const offset = getGhostDirectionOffset(ghostIndex, ghost.direction);
    ghost.x += offset.x;
    ghost.y += offset.y;

    // Handle screen wrapping (if your maze supports it)
    if (ghost.x < 0) ghost.x = canvas.width - CELL_SIZE;
    if (ghost.x >= canvas.width) ghost.x = 0;
  }

  // Call this when power pellet is eaten to frighten ghosts
  function frightenGhosts(duration = 600) {
    // 10 seconds at 60fps
    ghosts.forEach((ghost) => {
      if (ghost.mode !== GHOST_MODES.EATEN) {
        ghost.mode = GHOST_MODES.FRIGHTENED;
        ghost.frightenedTimer = duration;
        ghost.direction = (ghost.direction + 2) % 4; // Reverse direction
      }
    });
  }

  // Call this when ghost is eaten
  function eatGhost(ghostIndex) {
    ghosts[ghostIndex].mode = GHOST_MODES.EATEN;
    ghosts[ghostIndex].frightenedTimer = 0;
  }

  // Update frightened timers
  function updateFrightenedTimers() {
    ghosts.forEach((ghost) => {
      if (ghost.mode === GHOST_MODES.FRIGHTENED && ghost.frightenedTimer > 0) {
        ghost.frightenedTimer--;
        if (ghost.frightenedTimer <= 0) {
          ghost.mode = currentMode;
        }
      }
    });
  }

  function updateGhosts() {
    updateFrightenedTimers();
    updateGhostAI();
  }

  function isAtCell(ghost) {
    return ghost.x % CELL_SIZE === 0 || ghost.y % CELL_SIZE === 0;
  }

  function findPathAStar(startX, startY, targetX, targetY) {
    const startCellX = Math.floor(startX / CELL_SIZE);
    const startCellY = Math.floor(startY / CELL_SIZE);
    const targetCellX = Math.floor(targetX / CELL_SIZE);
    const targetCellY = Math.floor(targetY / CELL_SIZE);

    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${startCellX},${startCellY}`;
    const targetKey = `${targetCellX},${targetCellY}`;

    openSet.push({ x: startCellX, y: startCellY, f: 0 });
    gScore.set(startKey, 0);
    fScore.set(
      startKey,
      getManhattanDistance(startCellX, startCellY, targetCellX, targetCellY),
    );

    while (openSet.length > 0) {
      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      const currentKey = `${current.x},${current.y}`;

      if (currentKey === targetKey) {
        // Reconstruct path and return first direction
        return reconstructFirstDirection(
          cameFrom,
          current,
          startCellX,
          startCellY,
        );
      }

      closedSet.add(currentKey);

      // Check all 4 directions
      const neighbors = [
        { x: current.x + 1, y: current.y, dir: 0 }, // right
        { x: current.x, y: current.y + 1, dir: 1 }, // down
        { x: current.x - 1, y: current.y, dir: 2 }, // left
        { x: current.x, y: current.y - 1, dir: 3 }, // up
      ];

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        // Skip if out of bounds or wall or already processed
        if (
          neighbor.x < 0 ||
          neighbor.x >= maze[0].length ||
          neighbor.y < 0 ||
          neighbor.y >= maze.length ||
          maze[neighbor.y][neighbor.x] === W ||
          closedSet.has(neighborKey)
        ) {
          continue;
        }

        const tentativeG = gScore.get(currentKey) + 1;

        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, {
            x: current.x,
            y: current.y,
            dir: neighbor.dir,
          });
          gScore.set(neighborKey, tentativeG);
          const f =
            tentativeG +
            getManhattanDistance(
              neighbor.x,
              neighbor.y,
              targetCellX,
              targetCellY,
            );
          fScore.set(neighborKey, f);

          // Add to open set if not already there
          if (!openSet.find((n) => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push({ x: neighbor.x, y: neighbor.y, f: f });
          }
        }
      }
    }

    return null; // No path found
  }

  function getManhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  function reconstructFirstDirection(cameFrom, target, startX, startY) {
    let current = target;
    let path = [current];

    while (cameFrom.has(`${current.x},${current.y}`)) {
      const parent = cameFrom.get(`${current.x},${current.y}`);
      path.unshift(parent);
      current = parent;

      if (current.x === startX && current.y === startY) {
        break;
      }
    }

    // Return direction from start to first step
    if (path.length > 1) {
      return cameFrom.get(`${path[1].x},${path[1].y}`).dir;
    }

    return null;
  }
}
