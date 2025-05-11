const paddleWidth = 10;
const paddleHeight = 80;

export function create(_args, env, abortSignal) {
  const { applyStyle } = env.appUtils;
  const containerElt = document.createElement("div");
  applyStyle(containerElt, {
    backgroundColor: "var(--window-active-header)",
    height: "100%",
    width: "100%",
    overflowY: "auto",
    margin: "0",
    padding: "0",
    overflow: "hidden",
  });

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
          containerElt.appendChild(contructCanvas(entry.contentRect));
        }, 50);
      }
    }
  });
  resizeObserver.observe(containerElt);
  abortSignal.addEventListener("abort", () => {
    resizeObserver.unobserve(containerElt);
  });

  let canvas;
  let userPaddle;
  containerElt.appendChild(
    contructCanvas(containerElt.getBoundingClientRect()),
  );
  containerElt.addEventListener("mousemove", onMouseMove);
  containerElt.addEventListener("touchmove", onTouchMove);

  // Safari just selects all over the place like some maniac without this
  containerElt.addEventListener("selectstart", (e) => e.preventDefault());

  return { element: containerElt };

  function onTouchMove(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvasRect = containerElt.getBoundingClientRect();
      const relativeY = touch.clientY - canvasRect.top;
      userPaddle.y = Math.max(
        0,
        Math.min(relativeY - paddleHeight / 2, canvas.height - paddleHeight),
      );
    }
  }
  function onMouseMove(e) {
    const canvasRect = canvas.getBoundingClientRect();
    const relativeY = e.clientY - canvasRect.top;
    userPaddle.y = Math.max(
      0,
      Math.min(relativeY - paddleHeight / 2, canvas.height - paddleHeight),
    );
  }

  /**
   * @param {DOMRect} containerRect
   */
  function contructCanvas(containerRect) {
    canvas = document.createElement("canvas");
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    applyStyle(canvas, {
      height: "100%",
      width: "100%",
    });
    const ctx = canvas.getContext("2d");

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      dx: 5,
      dy: 5,
      prevX: canvas.width / 2,
      prevY: canvas.height / 2,
    };

    const enemyPaddle = {
      x: 0,
      y: canvas.height / 2 - paddleHeight / 2,
    };

    userPaddle = {
      x: canvas.width - paddleWidth,
      y: canvas.height / 2 - paddleHeight / 2,
    };

    let hasStarted = false;
    let leftScore = 0;
    let rightScore = 0;

    // As a quick win to make the game more alive, I just randomize the enemy
    // speed each collision with the user
    // This may be totally nonsensical, I'm not too used to that type of dev.
    let currEnemySpeed = 15;

    drawTheObjects(false, false);

    canvas.addEventListener("click", () => {
      hasStarted = true;
    });
    tick();
    return canvas;

    function tick() {
      if (!hasStarted) {
        drawTheObjects(false, false);
        ctx.font = "32px monospace";
        ctx.fillText("Click to start a game", 10, 50);
        window.requestAnimationFrame(tick);
        return;
      }

      drawTheObjects(true, true);

      // Move the enemy paddle
      // TODO: Stop iterating with insane logic and find a good smart one :D
      const paddleCenter = enemyPaddle.y + paddleHeight / 2;
      if (paddleCenter < ball.y - 10) {
        enemyPaddle.y += Math.min(2 + currEnemySpeed, ball.y - paddleCenter);
      } else if (paddleCenter > ball.y + 10) {
        enemyPaddle.y -= Math.min(paddleCenter - ball.y, 2 + currEnemySpeed);
      } else if (paddleCenter < ball.y - 5) {
        enemyPaddle.y += 1;
      } else if (paddleCenter > ball.y + 5) {
        enemyPaddle.y -= 1;
      }

      enemyPaddle.y = Math.max(
        0,
        Math.min(enemyPaddle.y, canvas.height - paddleHeight),
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
            currEnemySpeed = 15;
          } else if (rightScore - leftScore >= 2) {
            currEnemySpeed = getRandomNumber(9, 13);
          } else if (rightScore - leftScore <= -1) {
            currEnemySpeed = getRandomNumber(0, 5);
          } else if (rightScore - leftScore <= -3) {
            currEnemySpeed = 0;
          } else {
            currEnemySpeed = getRandomNumber(0, 10);
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

      requestAnimationFrame(tick);
    }

    function drawTheObjects(withScore, withLine) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Quite unsure of which colors should be taken.
      // I do it at each tick because I'm sure some persons will want to update
      // the theme mid-game.
      // TODO: optimize that shit? To check.
      const objectsColor = getComputedStyle(canvas).getPropertyValue(
        // "--app-primary-color",
        // "--window-text-color",
        // "--window-content-bg",
        "--window-active-header-text",
      );

      // Doing the ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = objectsColor;
      ctx.fill();
      ctx.closePath();

      // Now the "paddles"
      ctx.fillStyle = objectsColor;
      ctx.fillRect(enemyPaddle.x, enemyPaddle.y, paddleWidth, paddleHeight);
      ctx.fillRect(userPaddle.x, userPaddle.y, paddleWidth, paddleHeight);

      if (withScore) {
        // And now the score
        ctx.font = "32px monospace";
        ctx.fillText(leftScore, canvas.width / 4, 50);
        ctx.fillText(rightScore, (3 * canvas.width) / 4, 50);
      }

      if (withLine) {
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = objectsColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    function resetBall() {
      currEnemySpeed = 15;
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
      (ball.dx > 0 ? -ball.radius : paddleWidth + ball.radius)) /
    ball.dx;

  if (timeToX < 0 || timeToX > 1) {
    return;
  }

  const collisionY = ball.prevY + ball.dy * timeToX;
  if (
    collisionY + ball.radius > paddle.y &&
    collisionY - ball.radius < paddle.y + paddleHeight
  ) {
    ball.x = ball.prevX + ball.dx * timeToX;
    ball.y = collisionY;

    ball.dx = -ball.dx * 1.05;

    // Change some y based on where the paddle is
    const paddleCenter = paddle.y + paddleHeight / 2;
    ball.dy += (ball.y - paddleCenter) * 0.1;
    return true;
  }
  return false;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
