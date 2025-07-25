// TODO: configurable?

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 10;

export function create(_args, env, abortSignal) {
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    backgroundColor: env.STYLE.windowActiveHeader,
    color: env.STYLE.windowActiveHeaderText,
    height: "100%",
    width: "100%",
    overflowY: "auto",
    margin: "0",
    padding: "0",
    overflow: "hidden",
  });

  let frameId;

  // Redo the canvas on resize, after some delay

  let debounceTimer = null;
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect) {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          containerElt.innerHTML = "";
          resizeAndRestartCanvas(entry.contentRect);
        }, 50);
      }
    }
  });
  resizeObserver.observe(containerElt);
  abortSignal.addEventListener("abort", () => {
    resizeObserver.unobserve(containerElt);
  });

  let canvas;
  let hasStarted = false;
  let userPaddle;
  let isTopPressed = false;
  let isDownPressed = false;

  resizeAndRestartCanvas(containerElt.getBoundingClientRect());
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

  function resizeAndRestartCanvas(rect) {
    containerElt.innerHTML = "";
    if (rect.width > 0 && rect.height > 0) {
      containerElt.appendChild(contructCanvas(rect));
    } else if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      frameId = undefined;
    }
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
      const touch = e.touches[0];
      const canvasRect = containerElt.getBoundingClientRect();
      const relativeY = touch.clientY - canvasRect.top;
      userPaddle.y = Math.max(
        0,
        Math.min(relativeY - PADDLE_HEIGHT / 2, canvas.height - PADDLE_HEIGHT),
      );
    }
  }
  function onMouseMove(e) {
    const canvasRect = canvas.getBoundingClientRect();
    const relativeY = e.clientY - canvasRect.top;
    userPaddle.y = Math.max(
      0,
      Math.min(relativeY - PADDLE_HEIGHT / 2, canvas.height - PADDLE_HEIGHT),
    );
  }

  /**
   * @param {DOMRect} containerRect
   */
  function contructCanvas(containerRect) {
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      frameId = undefined;
    }
    canvas = document.createElement("canvas");
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    applyStyle(canvas, {
      height: "100%",
      width: "100%",
      backgroundColor: env.STYLE.windowActiveHeader,
    });
    const ctx = canvas.getContext("2d");

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: BALL_RADIUS,
      dx: 5,
      dy: 5,
      prevX: canvas.width / 2,
      prevY: canvas.height / 2,
    };

    const enemyPaddle = {
      x: 0,
      y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    };

    userPaddle = {
      x: canvas.width - PADDLE_WIDTH,
      y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    };

    hasStarted = false;
    let leftScore = 0;
    let rightScore = 0;

    // As a quick win to make the game more alive, I just randomize the enemy
    // speed each collision with the user
    // This may be totally nonsensical, I'm not too used to that type of dev.
    let currEnemySpeed = 8;

    // Draw the initial frame before returning the canvas to prevent black flash
    drawTheObjects(false, false);

    canvas.addEventListener("click", () => {
      hasStarted = true;
    });
    tick();
    return canvas;

    function tick() {
      if (isTopPressed) {
        userPaddle.y = Math.max(0, userPaddle.y - 5);
      } else if (isDownPressed) {
        userPaddle.y = Math.min(
          canvas.height - PADDLE_HEIGHT,
          userPaddle.y + 5,
        );
      }

      if (!hasStarted) {
        drawTheObjects(false, false);
        ctx.font = "32px monospace";
        ctx.fillText("Click to start a game", 10, 50);
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      drawTheObjects(true, true);

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
        Math.min(enemyPaddle.y, canvas.height - PADDLE_HEIGHT),
      );

      // Move the ball
      ball.prevX = ball.x;
      ball.prevY = ball.y;
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Top/bottom walls collision
      if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      if (ball.dx < 0) {
        checkPaddleBallCollision(enemyPaddle, ball);
      } else if (ball.dx > 0) {
        if (checkPaddleBallCollision(userPaddle, ball)) {
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
      if (ball.x + ball.radius > canvas.width) {
        leftScore++;
        resetBall();
      } else if (ball.x - ball.radius < 0) {
        ball.dx = 5;
        rightScore++;
        resetBall();
      }

      frameId = requestAnimationFrame(tick);
    }

    function drawTheObjects(withScore, withLine) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (withLine) {
        // NOTE: This one is also not "bordered" with black.
        // As this is not required for the game, I did not care much
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
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
        ctx.fillText(leftScore, canvas.width / 4, 50);
        ctx.fillText(rightScore, (3 * canvas.width) / 4, 50);
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
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
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
