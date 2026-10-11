import { createAudioEngine } from "./audio.mjs";

// TODO: configurable?

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 10;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS; // ~16.67ms

export function create(_args, env, abortSignal) {
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    backgroundColor: env.STYLE.windowActiveHeader,
    color: env.STYLE.windowActiveHeaderText,
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    padding: "0",
    overflow: "hidden",
  });

  let frameId;
  let lastFrameTime = 0;
  let canvasGeneration = 0;
  let resizeCanvas;
  let gameHeight = GAME_HEIGHT;

  // Keep game state while resizing the arena and its physical-pixel bitmap.
  const resizeObserver = new ResizeObserver(([entry]) => {
    resizeCanvas(entry.contentRect);
  });
  resizeObserver.observe(containerElt);
  abortSignal.addEventListener("abort", () => {
    resizeObserver.disconnect();
    window.removeEventListener("resize", onWindowResize);
    canvasGeneration++;
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      frameId = undefined;
    }
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
  });

  let canvas;
  const audio = createAudioEngine();
  let hasStarted = false;
  let userPaddle;
  let isTopPressed = false;
  let isDownPressed = false;

  containerElt.appendChild(constructCanvas(++canvasGeneration));
  resizeCanvas(containerElt.getBoundingClientRect());
  window.addEventListener("resize", onWindowResize);
  containerElt.addEventListener("mousemove", onMouseMove, { passive: false });
  containerElt.addEventListener("touchmove", onTouchMove, { passive: false });

  // Safari just selects all over the place like some maniac without this
  containerElt.onselectstart = (e) => e.preventDefault();

  return {
    element: containerElt,

    onActivate: () => {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    },
    onDeactivate: () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      isTopPressed = false;
      isDownPressed = false;
    },
  };

  function onWindowResize() {
    resizeCanvas(containerElt.getBoundingClientRect());
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyDown(e) {
    switch (e.key) {
      case "ArrowUp":
        isTopPressed = true;
        break;
      case "ArrowDown":
        isDownPressed = true;
        break;
      case " ":
        if (!hasStarted) {
          audio.ensureAudio();
          audio.playSound("start");
        }
        hasStarted = true;
        break;
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyUp(e) {
    switch (e.key) {
      case "ArrowUp":
        isTopPressed = false;
        break;
      case "ArrowDown":
        isDownPressed = false;
        break;
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      movePaddle(e.touches[0].clientY);
    }
  }

  function onMouseMove(e) {
    movePaddle(e.clientY);
  }

  function movePaddle(clientY) {
    const rect = canvas.getBoundingClientRect();
    if (rect.height <= 0) {
      return;
    }
    const relativeY = (clientY - rect.top) * gameHeight / rect.height;
    userPaddle.y = Math.max(
      0,
      Math.min(relativeY - PADDLE_HEIGHT / 2, gameHeight - PADDLE_HEIGHT),
    );
  }

  function constructCanvas(generation) {
    canvas = document.createElement("canvas");
    let gameWidth = GAME_WIDTH;
    applyStyle(canvas, {
      display: "block",
      flexShrink: "0",
      touchAction: "none",
      backgroundColor: env.STYLE.windowActiveHeader,
    });
    const ctx = canvas.getContext("2d");

    const ball = {
      x: gameWidth / 2,
      y: gameHeight / 2,
      radius: BALL_RADIUS,
      dx: 5,
      dy: 5,
      prevX: gameWidth / 2,
      prevY: gameHeight / 2,
    };

    const enemyPaddle = {
      x: 0,
      y: gameHeight / 2 - PADDLE_HEIGHT / 2,
    };

    userPaddle = {
      x: gameWidth - PADDLE_WIDTH,
      y: gameHeight / 2 - PADDLE_HEIGHT / 2,
    };

    hasStarted = false;
    let leftScore = 0;
    let rightScore = 0;

    // As a quick win to make the game more alive, I just randomize the enemy
    // speed each collision with the user
    // This may be totally nonsensical, I'm not too used to that type of dev.
    let currEnemySpeed = 8;

    resizeCanvas = (rect) => {
      const viewport = getGameViewport(rect.width, rect.height, GAME_WIDTH, GAME_HEIGHT);
      if (!viewport) {
        canvas.style.visibility = "hidden";
        return;
      }
      canvas.style.visibility = "visible";
      const nextWidth = viewport.width;
      const nextHeight = viewport.height;
      // Keep the ball away from walls/paddles when changing the arena shape.
      ball.x = PADDLE_WIDTH + ball.radius +
        (ball.x - PADDLE_WIDTH - ball.radius) *
        (nextWidth - 2 * (PADDLE_WIDTH + ball.radius)) /
        (gameWidth - 2 * (PADDLE_WIDTH + ball.radius));
      ball.y = ball.radius + (ball.y - ball.radius) *
        (nextHeight - 2 * ball.radius) / (gameHeight - 2 * ball.radius);
      enemyPaddle.y *= (nextHeight - PADDLE_HEIGHT) / (gameHeight - PADDLE_HEIGHT);
      userPaddle.y *= (nextHeight - PADDLE_HEIGHT) / (gameHeight - PADDLE_HEIGHT);
      gameWidth = nextWidth;
      gameHeight = nextHeight;
      userPaddle.x = gameWidth - PADDLE_WIDTH;
      ball.prevX = ball.x;
      ball.prevY = ball.y;
      // The backing bitmap matches physical pixels, independently of physics.
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
      drawFrame();
    };

    // Draw the initial frame before returning the canvas to prevent black flash
    drawTheObjects(false, false);

    canvas.addEventListener("click", () => {
      if (!hasStarted) {
        audio.ensureAudio();
        audio.playSound("start");
      }
      hasStarted = true;
    });

    const now = performance.now();
    lastFrameTime = now;
    tick(now);
    return canvas;

    function tick(currentTime) {
      if (generation !== canvasGeneration) {
        return;
      }
      const deltaTime = currentTime - lastFrameTime;

      if (deltaTime + 0.1 >= FRAME_DURATION) {
        updateGame();

        lastFrameTime = currentTime - (deltaTime % FRAME_DURATION);
      }
      frameId = window.requestAnimationFrame(tick);
    }

    function updateGame() {
      if (isTopPressed) {
        userPaddle.y = Math.max(0, userPaddle.y - 5);
      } else if (isDownPressed) {
        userPaddle.y = Math.min(
          gameHeight - PADDLE_HEIGHT,
          userPaddle.y + 5,
        );
      }

      drawFrame();
      if (!hasStarted) {
        return;
      }

      // Move the enemy paddle
      // TODO: Stop iterating with insane logic and find a good smart one :D
      const paddleCenter = enemyPaddle.y + PADDLE_HEIGHT / 2;
      if (paddleCenter < ball.y - 20) {
        enemyPaddle.y += Math.min(12, ball.y - paddleCenter, currEnemySpeed);
      } else if (paddleCenter > ball.y + 20) {
        enemyPaddle.y -= Math.min(12, paddleCenter - ball.y, currEnemySpeed);
      } else if (paddleCenter < ball.y - 10) {
        enemyPaddle.y += Math.min(7, ball.y - paddleCenter, currEnemySpeed);
      } else if (paddleCenter > ball.y + 10) {
        enemyPaddle.y -= Math.min(7, paddleCenter - ball.y, currEnemySpeed);
      } else if (paddleCenter < ball.y - 5) {
        enemyPaddle.y += 1;
      } else if (paddleCenter > ball.y + 5) {
        enemyPaddle.y -= 1;
      }

      enemyPaddle.y = Math.max(
        0,
        Math.min(enemyPaddle.y, gameHeight - PADDLE_HEIGHT),
      );

      // Move the ball
      ball.prevX = ball.x;
      ball.prevY = ball.y;
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Top/bottom walls collision
      if (ball.y + ball.radius > gameHeight || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        audio.playSound("wall");
      }

      if (ball.dx < 0) {
        if (checkPaddleBallCollision(enemyPaddle, ball)) {
          audio.playSound("paddle");
        }
      } else if (ball.dx > 0) {
        if (checkPaddleBallCollision(userPaddle, ball)) {
          audio.playSound("paddle");
          // Mario Kart that thing
          if (rightScore - leftScore > 3) {
            currEnemySpeed = 12;
          } else if (rightScore - leftScore >= 2) {
            currEnemySpeed = getRandomNumber(10, 12);
          } else if (rightScore - leftScore < -3) {
            currEnemySpeed = 4;
          } else if (rightScore - leftScore <= -2) {
            currEnemySpeed = getRandomNumber(4, 8);
          } else if (rightScore - leftScore <= -1) {
            currEnemySpeed = getRandomNumber(8, 11);
          } else {
            currEnemySpeed = getRandomNumber(6, 10);
          }
        }
      }
      if (ball.x + ball.radius > gameWidth) {
        leftScore++;
        audio.playSound("score");
        resetBall();
      } else if (ball.x - ball.radius < 0) {
        ball.dx = 5;
        rightScore++;
        audio.playSound("score");
        resetBall();
      }
    }

    function drawFrame() {
      drawTheObjects(hasStarted, hasStarted);
      if (!hasStarted) {
        ctx.font = "32px monospace";
        ctx.fillText("Click to start a game", 10, 50, gameWidth - 20);
      }
    }

    function drawTheObjects(withScore, withLine) {
      ctx.setTransform(canvas.width / gameWidth, 0, 0, canvas.height / gameHeight, 0, 0);
      ctx.clearRect(0, 0, gameWidth, gameHeight);
      // Resizing the backing bitmap resets fillStyle to black.
      ctx.fillStyle = "#ffffff";

      if (withLine) {
        // NOTE: This one is also not "bordered" with black.
        // As this is not required for the game, I did not care much
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(gameWidth / 2, 0);
        ctx.lineTo(gameWidth / 2, gameHeight);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (withScore) {
        // And now the score
        ctx.font = "32px monospace";
        // NOTE: This text is not "bordered" with black meaning it won't be
        // visible if the background is white.
        // Maybe TODO?
        ctx.fillText(leftScore, gameWidth / 4, 50);
        ctx.fillText(rightScore, (3 * gameWidth) / 4, 50);
      }

      // Ball
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      // Now the "paddles"
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      if (!hasStarted) {
        ctx.font = "22px monospace";
        ctx.fillText(
          "Bot",
          enemyPaddle.x + PADDLE_WIDTH + 8,
          enemyPaddle.y + PADDLE_HEIGHT,
        );
        const metrics = ctx.measureText("You");
        ctx.fillText(
          "You",
          userPaddle.x - PADDLE_WIDTH - 5 - metrics.width,
          userPaddle.y + PADDLE_HEIGHT,
        );
      }
      ctx.fillRect(enemyPaddle.x, enemyPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.strokeRect(enemyPaddle.x, enemyPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(userPaddle.x, userPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.strokeRect(userPaddle.x, userPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }

    function resetBall() {
      currEnemySpeed = 8;
      ball.x = gameWidth / 2;
      ball.y = gameHeight / 2;
      ball.prevX = ball.x;
      ball.prevY = ball.y;
      ball.dx = ball.dx < 0 ? 5 : -5;
      ball.dy = Math.random() * 8 - 4;
    }
  }
}

function checkPaddleBallCollision(paddle, ball) {
  const timeToX =
    (paddle.x -
      ball.prevX +
      (ball.dx > 0 ? -ball.radius : PADDLE_WIDTH + ball.radius)) /
    ball.dx;

  if (timeToX < 0 || timeToX > 1) {
    return;
  }

  const collisionY = ball.prevY + ball.dy * timeToX;
  if (
    collisionY + ball.radius > paddle.y &&
    collisionY - ball.radius < paddle.y + PADDLE_HEIGHT
  ) {
    ball.x = ball.prevX + ball.dx * timeToX;
    ball.y = collisionY;

    ball.dx = -ball.dx * 1.05;

    // Change some y based on where the paddle is
    const paddleCenter = paddle.y + PADDLE_HEIGHT / 2;
    ball.dy += (ball.y - paddleCenter) * 0.1;
    return true;
  }
  return false;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

/** Fit a logical playfield to the whole window while keeping small-screen
 * sprites readable. Only very small windows need to scale below native size. */
function getGameViewport(width, height, defaultWidth, defaultHeight) {
  if (width <= 0 || height <= 0) {
    return null;
  }
  const scale = Math.max(
    Math.min(1, width / 480, height / 360),
    Math.min(width / defaultWidth, height / defaultHeight),
  );
  return { width: width / scale, height: height / scale, scale };
}
