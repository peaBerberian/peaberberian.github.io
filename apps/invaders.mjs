// NOTE: This one was very quickly done before posting to HN, it may be
// completely broken and not fun.
const LEFT_KEYS = ["a", "arrowleft"];
const RIGHT_KEYS = ["d", "arrowright"];

const PLAYER_CHAR = "🛩️";
const PLAYER_DAMAGE_CHAR = "💥";

export function create() {
  const gameContainer = document.createElement("div");
  applyStyle(gameContainer, {
    width: "100%",
    height: "100%",
    backgroundColor: "var(--window-active-header)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "monospace",
    cursor: "crosshair",
  });

  let gameState;
  let animationId;
  let currentlyPressedKeys = {};
  let mouseX = null;
  let mousePressed = false;

  let config = {};
  initGame();

  const hud = document.createElement("div");
  applyStyle(hud, {
    position: "absolute",
    top: "10px",
    left: "10px",
    color: "var(--window-active-header-text)",
    fontSize: Math.max(12, gameState.gameWidth * 0.025) + "px",
    zIndex: "1000",
    fontWeight: "bold",
  });
  gameContainer.appendChild(hud);

  const playerElt = document.createElement("div");
  playerElt.textContent = PLAYER_CHAR;
  applyStyle(playerElt, {
    position: "absolute",
    fontSize: config.playerSize + "px",
    zIndex: "10",
    userSelect: "none",
  });
  gameContainer.appendChild(playerElt);

  const gameOverScreen = document.createElement("div");
  applyStyle(gameOverScreen, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // backgroundColor: "var(--window-content-bg)",
    // color: "var(--window-text-color)",
    backgroundColor: "var(--window-active-header)",
    color: "var(--window-active-header-text)",
    fontSize: "24px",
    textAlign: "center",
    display: "none",
    zIndex: "1001",
    padding: "20px",
    borderRadius: "10px",
  });
  gameOverScreen.innerHTML =
    'GAME OVER<br><span style="font-size: 16px;">Press R or Click to restart</span>';
  gameContainer.appendChild(gameOverScreen);

  let resizeObserver;

  return {
    element: gameContainer,
    onActivate,
    onDeactivate,
  };

  function initGame() {
    gameState = {
      player: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        lives: 3,
        lastDamageTs: -Infinity,
      },
      bullets: [],
      enemies: [],
      enemyBullets: [],
      barriers: [],
      score: 0,
      gameOver: false,
      lastShot: 0,
      enemyDirection: 1,
      gameWidth: 0,
      gameHeight: 0,
      level: 1,
    };
    updateGameSize();
  }

  function updateGameSize() {
    gameState.gameWidth = gameContainer.offsetWidth;
    gameState.gameHeight = gameContainer.offsetHeight;
    config = {
      playerSpeed: 0.008 * gameState.gameWidth,
      bulletSpeed: 0.015 * gameState.gameHeight,
      enemyBaseSpeed: 0.002 * gameState.gameWidth,
      enemySuppSpeed: 0,
      enemyDropDistance: 0.05 * gameState.gameHeight,
      fireRate: 200,
      playerSize: Math.max(20, 0.04 * gameState.gameWidth),
      enemySize: Math.max(16, 0.035 * gameState.gameWidth),
      bulletSize: Math.max(7, 0.002 * gameState.gameWidth),
      hudSize: Math.max(12, 0.025 * gameState.gameWidth),
      barrierSize: Math.max(30, 0.06 * gameState.gameWidth),
    };
    gameState.player.width = config.playerSize;
    gameState.player.height = config.playerSize;
    gameState.player.x = (gameState.gameWidth - gameState.player.width) / 2;
    gameState.player.y = gameState.gameHeight - gameState.player.height - 20;
    setupEnemies();
    setupBarriers();
  }

  function setupEnemies() {
    gameState.enemies = [];
    for (let i = gameContainer.children.length - 1; i >= 0; i--) {
      const child = gameContainer.children[i];
      if (child.dataset.type === "enemy") {
        gameContainer.removeChild(child);
      }
    }

    const rows = 4;
    const cols = 9;
    const enemySize = config.enemySize || 25;
    const spacing = enemySize * 1.4;
    const totalWidth = cols * spacing;
    const startX = (gameState.gameWidth - totalWidth) / 2;
    const startY = gameState.gameHeight * 0.1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy = {
          x: startX + col * spacing,
          y: startY + row * spacing,
          width: enemySize,
          height: enemySize,
          type: row < 2 ? "👾" : row < 3 ? "👽" : "🛸",
        };
        const enemyElt = document.createElement("div");
        enemyElt.dataset.type = "enemy";
        enemyElt.textContent = enemy.type;
        applyStyle(enemyElt, {
          position: "absolute",
          left: enemy.x + "px",
          top: enemy.y + "px",
          fontSize: config.enemySize + "px",
          userSelect: "none",
        });
        gameContainer.appendChild(enemyElt);
        enemy.element = enemyElt;
        gameState.enemies.push(enemy);
      }
    }
  }

  function setupBarriers() {
    gameState.barriers = [];
    for (let i = gameContainer.children.length - 1; i >= 0; i--) {
      const child = gameContainer.children[i];
      if (child.dataset.type === "barrier") {
        gameContainer.removeChild(child);
      }
    }

    const numBarriers = 4;
    const barrierSize = config.barrierSize || 40;
    const totalWidth = numBarriers * barrierSize * 2;
    const startX = (gameState.gameWidth - totalWidth) / 4;
    const barrierY = gameState.gameHeight * 0.75;

    for (let i = 0; i < numBarriers; i++) {
      const baseX = startX + i * (barrierSize * 4);
      const pattern = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 1],
      ];

      const blockSize = barrierSize / 6;

      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          if (pattern[row][col] === 1) {
            const barrier = {
              x: baseX + col * blockSize,
              y: barrierY + row * blockSize,
              width: blockSize,
              height: blockSize,
              health: 3,
            };
            const barrierElt = document.createElement("div");
            barrierElt.dataset.type = "barrier";
            barrierElt.textContent = "🟩";
            applyStyle(barrierElt, {
              position: "absolute",
              left: barrier.x + "px",
              top: barrier.y + "px",
              fontSize: barrier.width * 0.8 + "px",
              userSelect: "none",
            });
            gameContainer.appendChild(barrierElt);
            barrier.element = barrierElt;
            gameState.barriers.push(barrier);
          }
        }
      }
    }
  }

  function shoot() {
    const now = performance.now();
    if (now - gameState.lastShot > config.fireRate && !gameState.gameOver) {
      const bulletSize = config.bulletSize;
      const bullet = {
        x: gameState.player.x + gameState.player.width / 2 - bulletSize / 2,
        y: gameState.player.y,
        width: bulletSize,
        height: bulletSize * 1.5,
      };
      const bulletElt = document.createElement("div");
      bulletElt.dataset.type = "bullet";
      bulletElt.textContent = "";
      applyStyle(bulletElt, {
        position: "absolute",
        left: bullet.x + "px",
        top: bullet.y + "px",
        width: bullet.width + "px",
        height: bullet.height + "px",
        borderRadius: config.bulletSize + "px",
        fontSize: config.bulletSize + "px",
        backgroundColor: "var(--window-active-header-text)",
        userSelect: "none",
      });
      gameContainer.appendChild(bulletElt);
      bullet.element = bulletElt;
      gameState.bullets.push(bullet);
      gameState.lastShot = now;
    }
  }

  function updatePlayer() {
    if (LEFT_KEYS.some((k) => currentlyPressedKeys[k])) {
      gameState.player.x = Math.max(0, gameState.player.x - config.playerSpeed);
    }
    if (RIGHT_KEYS.some((k) => currentlyPressedKeys[k])) {
      gameState.player.x = Math.min(
        gameState.gameWidth - gameState.player.width,
        gameState.player.x + config.playerSpeed,
      );
    }

    if (mouseX !== null) {
      const targetX = mouseX - gameState.player.width / 2;
      const diff = targetX - gameState.player.x;
      const moveSpeed = Math.min(Math.abs(diff), config.playerSpeed * 2);
      if (Math.abs(diff) > 2) {
        gameState.player.x += diff > 0 ? moveSpeed : -moveSpeed;
      } else {
        gameState.player.x = targetX;
      }
    }
  }

  function updateBullets() {
    gameState.bullets = gameState.bullets.filter((bullet) => {
      bullet.y -= config.bulletSpeed;
      if (bullet.y <= -bullet.height) {
        bullet.element.remove();
        return false;
      }
      return true;
    });

    gameState.enemyBullets = gameState.enemyBullets.filter((bullet) => {
      bullet.y += config.bulletSpeed * 0.7;
      if (bullet.y >= gameState.height + bullet.height) {
        bullet.element.remove();
        return false;
      }
      return true;
    });
  }

  function updateEnemies() {
    if (gameState.enemies.length === 0) {
      gameState.level++;
      setupEnemies();
      config.enemyBaseSpeed += 0.5;
      config.enemySuppSpeed = 0;
      return;
    }

    let shouldDrop = false;

    for (let enemy of gameState.enemies) {
      if (
        (enemy.x <= 0 && gameState.enemyDirection === -1) ||
        (enemy.x >= gameState.gameWidth - enemy.width &&
          gameState.enemyDirection === 1)
      ) {
        shouldDrop = true;
        break;
      }
    }

    if (shouldDrop) {
      gameState.enemyDirection *= -1;
      gameState.enemies.forEach((enemy) => {
        enemy.y += config.enemyDropDistance;
      });
    } else {
      gameState.enemies.forEach((enemy) => {
        enemy.x +=
          (config.enemyBaseSpeed + config.enemySuppSpeed) *
          gameState.enemyDirection;
      });
    }

    if (Math.random() < 0.001 * gameState.enemies.length) {
      const shooter =
        gameState.enemies[Math.floor(Math.random() * gameState.enemies.length)];
      const bulletSize = config.bulletSize;
      const bullet = {
        x: shooter.x + shooter.width / 2 - bulletSize / 2,
        y: shooter.y + shooter.height,
        width: bulletSize,
        height: bulletSize,
      };
      const bulletElt = document.createElement("div");
      bulletElt.dataset.type = "enemy-bullet";
      bulletElt.textContent = "";
      applyStyle(bulletElt, {
        position: "absolute",
        left: bullet.x + "px",
        top: bullet.y + "px",
        fontSize: config.bulletSize + "px",
        border: "1px solid var(--window-active-header-text)",
        transform: "translate(2px, 2px)",
        backgroundColor: "red",
        width: bullet.width + "px",
        height: bullet.height + "px",
        borderRadius: `0px 0px ${bulletSize}px ${bulletSize}px`,
        userSelect: "none",
      });
      gameContainer.appendChild(bulletElt);
      bullet.element = bulletElt;
      gameState.enemyBullets.push(bullet);
    }
  }

  function checkCollisions() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = gameState.bullets[i];
      let bulletHit = false;

      for (let j = gameState.enemies.length - 1; j >= 0; j--) {
        const enemy = gameState.enemies[j];
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          gameState.bullets[i].element.remove();
          gameState.bullets.splice(i, 1);
          gameState.enemies[j].element.remove();
          gameState.enemies.splice(j, 1);
          config.enemySuppSpeed += 0.00015 * gameState.gameWidth;
          gameState.score += 10;
          bulletHit = true;
          break;
        }
      }

      if (!bulletHit) {
        for (let k = gameState.barriers.length - 1; k >= 0; k--) {
          const barrier = gameState.barriers[k];
          if (
            bullet.x < barrier.x + barrier.width &&
            bullet.x + bullet.width > barrier.x &&
            bullet.y < barrier.y + barrier.height &&
            bullet.y + bullet.height > barrier.y
          ) {
            gameState.bullets[i].element.remove();
            gameState.bullets.splice(i, 1);
            barrier.health--;
            if (barrier.health <= 0) {
              gameState.barriers[k].element.remove();
              gameState.barriers.splice(k, 1);
            }
            break;
          }
        }
      }
    }

    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = gameState.enemyBullets[i];
      let bulletHit = false;

      if (
        bullet.x < gameState.player.x + gameState.player.width &&
        bullet.x + bullet.width > gameState.player.x &&
        bullet.y < gameState.player.y + gameState.player.height &&
        bullet.y + bullet.height > gameState.player.y
      ) {
        // Let's do some invicibility frames
        if (performance.now() - gameState.player.lastDamageTs > 600) {
          gameState.enemyBullets[i].element.remove();
          gameState.enemyBullets.splice(i, 1);
          gameState.player.lives--;
          gameState.player.lastDamageTs = performance.now();
          if (gameState.player.lives <= 0) {
            gameState.gameOver = true;
          }
          bulletHit = true;
        }
      }

      if (!bulletHit) {
        for (let k = gameState.barriers.length - 1; k >= 0; k--) {
          const barrier = gameState.barriers[k];
          if (
            bullet.x < barrier.x + barrier.width &&
            bullet.x + bullet.width > barrier.x &&
            bullet.y < barrier.y + barrier.height &&
            bullet.y + bullet.height > barrier.y
          ) {
            gameState.enemyBullets[i].element.remove();
            gameState.enemyBullets.splice(i, 1);
            barrier.health--;
            if (barrier.health <= 0) {
              gameState.barriers[k].element.remove();
              gameState.barriers.splice(k, 1);
            }
            break;
          }
        }
      }
    }

    for (let enemy of gameState.enemies) {
      if (
        enemy.x < gameState.player.x + gameState.player.width &&
        enemy.x + enemy.width > gameState.player.x &&
        enemy.y < gameState.player.y + gameState.player.height &&
        enemy.y + enemy.height > gameState.player.y
      ) {
        gameState.gameOver = true;
      }

      if (enemy.y + enemy.height >= gameState.gameHeight - 50) {
        gameState.gameOver = true;
      }
    }
  }

  function render() {
    applyStyle(playerElt, {
      left: gameState.player.x + "px",
      top: gameState.player.y + "px",
      fontSize: config.playerSize + "px",
    });
    gameState.enemies.forEach((enemy) => {
      applyStyle(enemy.element, {
        position: "absolute",
        left: enemy.x + "px",
        top: enemy.y + "px",
        fontSize: config.enemySize + "px",
        userSelect: "none",
      });
    });
    gameState.barriers.forEach((barrier) => {
      if (barrier.health === 3) {
        barrier.element.textContent = "🟩"; // Full health - green
      } else if (barrier.health === 2) {
        barrier.element.textContent = "🟨"; // Damaged - yellow
      } else {
        barrier.element.textContent = "🟥"; // Very damaged - red
      }
      applyStyle(barrier.element, {
        position: "absolute",
        left: barrier.x + "px",
        top: barrier.y + "px",
      });
    });
    gameState.bullets.forEach((bullet) => {
      applyStyle(bullet.element, {
        left: bullet.x + "px",
        top: bullet.y + "px",
      });
    });
    gameState.enemyBullets.forEach((bullet) => {
      applyStyle(bullet.element, {
        left: bullet.x + "px",
        top: bullet.y + "px",
      });
    });

    if (performance.now() - gameState.player.lastDamageTs < 500) {
      playerElt.textContent = PLAYER_DAMAGE_CHAR;
    } else if (!gameState.gameOver) {
      playerElt.textContent = PLAYER_CHAR;
    }

    hud.textContent = `SCORE: ${gameState.score} | LIVES: ${gameState.player.lives} | LEVEL: ${gameState.level}`;
    hud.style.fontSize = config.hudSize + "px";

    if (gameState.gameOver) {
      gameState.bullets.forEach((bullet) => {
        bullet.element.remove();
      });
      gameState.bullets.length = 0;
      gameState.enemyBullets.forEach((bullet) => {
        bullet.element.remove();
      });
      gameState.enemyBullets.length = 0;
      gameOverScreen.style.display = "block";
      gameOverScreen.style.fontSize = config.hudSize * 1.5 + "px";
      gameOverScreen.innerHTML = `GAME OVER<br>FINAL SCORE: ${gameState.score}<br><span style="font-size: ${config.hudSize}px;">Press R or Click to restart</span>`;
    } else {
      gameOverScreen.style.display = "none";
    }
  }

  function tick() {
    if (!gameState.gameOver) {
      updatePlayer();
      updateBullets();
      updateEnemies();
      checkCollisions();
    }

    render();
    animationId = requestAnimationFrame(tick);
  }

  function restartGame() {
    initGame();
    updateGameSize();
  }

  function onActivate() {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    gameContainer.addEventListener("mousemove", onMouseMove);
    gameContainer.addEventListener("touchmove", onMouseMove);
    gameContainer.addEventListener("mousedown", onMouseDown);
    gameContainer.addEventListener("mouseup", onMouseUp);
    gameContainer.addEventListener("click", onClick);
    // Observe container resize instead of window resize
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateGameSize();
      });
      resizeObserver.observe(gameContainer);
    }
    updateGameSize();
    tick();
  }

  function onDeactivate() {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    gameContainer.removeEventListener("mousemove", onMouseMove);
    gameContainer.removeEventListener("touchmove", onMouseMove);
    gameContainer.removeEventListener("mousedown", onMouseDown);
    gameContainer.removeEventListener("mouseup", onMouseUp);
    gameContainer.removeEventListener("click", onClick);

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }

  function onKeyDown(e) {
    const keyPressed = e.key.toLowerCase();
    currentlyPressedKeys[keyPressed] = true;

    if (LEFT_KEYS.includes(keyPressed) || RIGHT_KEYS.includes(keyPressed)) {
      mouseX = null;
    }

    if (keyPressed === " ") {
      e.preventDefault();
      shoot();
    }

    if (keyPressed === "r" && gameState.gameOver) {
      restartGame();
    }
  }

  function onKeyUp(e) {
    currentlyPressedKeys[e.key.toLowerCase()] = false;
  }

  function onMouseMove(e) {
    let clientX;
    if (e.touches?.length) {
      if (e.touches.length > 1) {
        return;
      }
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    e.preventDefault();
    const rect = gameContainer.getBoundingClientRect();
    mouseX = clientX - rect.left;
  }

  function onMouseDown(e) {
    e.preventDefault();
    mousePressed = true;
    shoot();
  }

  function onMouseUp() {
    mousePressed = false;
  }

  function onClick() {
    if (gameState.gameOver) {
      restartGame();
    }
  }
}

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
export function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
