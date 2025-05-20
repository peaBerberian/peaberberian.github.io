const LEFT_KEYS = ["a", "arrowleft"];
const RIGHT_KEYS = ["d", "arrowright"];

const PLAYER_CHAR = "🛩️";
const PLAYER_DAMAGE_CHAR = "💥";

const style = document.createElement("style");
style.textContent = `
@keyframes circle {
  0%   { transform: translate(5px, 0px); }
  25%  { transform: translate(0px, -5px); }
  50%  { transform: translate(-5px, 0px); }
  75%  { transform: translate(0px, 5px); }
  100% { transform: translate(5px, 0px); }
}
@keyframes swing {
  0% {
    transform: rotate(-15deg);
  }
  100% {
    transform: rotate(15deg);
  }
}
`;
document.head.appendChild(style);

export function create(_args, env) {
  const gameWrapper = document.createElement("div");
  applyStyle(gameWrapper, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: env.STYLE.windowActiveHeader,
    position: "relative",
    overflow: "hidden",
    fontFamily: "monospace",
    cursor: "crosshair",
  });
  const gameArea = document.createElement("div");
  applyStyle(gameArea, {
    border: `1px dashed ${env.STYLE.windowActiveHeaderText}`,
    // width: "100%",
    // height: "100%",
    position: "relative",
    overflow: "hidden",
  });
  gameWrapper.appendChild(gameArea);

  let gameState;
  let animationId;
  let currentlyPressedKeys = {};
  let playerMouseX = null;
  let mousePressed = false;

  let config = {};
  resetGameState();

  const hud = document.createElement("div");
  applyStyle(hud, {
    position: "absolute",
    top: "10px",
    left: "10px",
    color: env.STYLE.windowActiveHeaderText,
    fontSize: Math.max(12, gameState.gameWidth * 0.025) + "px",
    zIndex: "1000",
    fontWeight: "bold",
  });
  gameArea.appendChild(hud);

  const playerElt = document.createElement("div");
  playerElt.textContent = PLAYER_CHAR;
  applyStyle(playerElt, {
    position: "absolute",
    fontSize: config.playerSize + "px",
    zIndex: "10",
    userSelect: "none",
  });
  gameArea.appendChild(playerElt);

  const startScreen = document.createElement("div");
  applyStyle(startScreen, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: env.STYLE.windowActiveHeader,
    color: env.STYLE.windowActiveHeaderText,
    border: "1px solid " + env.STYLE.windowActiveHeaderText,
    fontSize: "24px",
    textAlign: "center",
    display: "none",
    zIndex: "1001",
    padding: "20px",
    borderRadius: "10px",
  });
  startScreen.innerHTML =
    'GAME OVER<br><span style="font-size: 16px;">Press R or Click to restart</span>';
  startScreen.innerHTML = `Invaders!<br><span style="font-size: ${config.hudSize}px;">Press Space or Click to Start</span>`;
  gameArea.appendChild(startScreen);

  const gameOverScreen = document.createElement("div");
  applyStyle(gameOverScreen, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: env.STYLE.windowActiveHeader,
    color: env.STYLE.windowActiveHeaderText,
    border: "1px solid " + env.STYLE.windowActiveHeaderText,
    fontSize: "24px",
    textAlign: "center",
    display: "none",
    zIndex: "1001",
    padding: "20px",
    borderRadius: "10px",
  });
  gameOverScreen.innerHTML =
    'GAME OVER<br><span style="font-size: 16px;">Press R or Click to restart</span>';
  gameArea.appendChild(gameOverScreen);

  tick();
  return {
    element: gameWrapper,
    onActivate,
    onDeactivate,
  };

  function resetGameState() {
    clearEnemies();
    clearShields();
    clearBullets();
    clearEnemyBullets();
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
      shields: [],
      score: 0,
      started: false,
      gameOver: false,
      lastShot: 0,
      enemyDirection: 1,
      gameWidth: 0,
      gameHeight: 0,
      level: 1,
    };
    recheckGameStartupSize();
  }

  function recheckGameStartupSize() {
    gameState.gameWidth = gameWrapper.offsetWidth;
    gameState.gameHeight = gameWrapper.offsetHeight;
    gameArea.style.height = gameWrapper.offsetHeight + "px";
    gameArea.style.width = gameWrapper.offsetWidth + "px";
    config = {
      playerSpeed: 0.008 * gameState.gameWidth,
      bulletSpeed: 0.015 * gameState.gameHeight,
      enemyBulletSpeed: 0.005 * gameState.gameHeight,
      enemyBaseSpeed: 0.002 * gameState.gameWidth,
      enemySuppSpeed: 0,
      enemyDropDistance: 0.05 * gameState.gameHeight,
      fireRate: 200,
      playerSize: Math.max(20, 0.04 * gameState.gameWidth),
      enemySize: Math.max(16, 0.035 * gameState.gameWidth),
      bulletSize: Math.max(7, 0.002 * gameState.gameWidth),
      hudSize: Math.max(12, 0.025 * gameState.gameWidth),
      shieldSize: Math.max(30, 0.06 * gameState.gameWidth),
    };
    gameState.player.width = config.playerSize;
    gameState.player.height = config.playerSize;
    gameState.player.x = (gameState.gameWidth - gameState.player.width) / 2;
    gameState.player.y = gameState.gameHeight - gameState.player.height - 20;
    setupEnemies();
    setupShields();
  }

  function clearEnemies() {
    if (!gameState?.enemies) {
      return;
    }
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      gameState.enemies[i].element.remove();
    }
    gameState.enemies = [];
  }

  function clearShields() {
    if (!gameState?.shields) {
      return;
    }
    for (let i = gameState.shields.length - 1; i >= 0; i--) {
      gameState.shields[i].element.remove();
    }
    gameState.shields = [];
  }

  function clearBullets() {
    if (!gameState?.bullets) {
      return;
    }
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      gameState.bullets[i].element.remove();
    }
    gameState.bullets = [];
  }

  function clearEnemyBullets() {
    if (!gameState?.enemyBullets) {
      return;
    }
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
      gameState.enemyBullets[i].element.remove();
    }
    gameState.enemyBullets = [];
  }

  function setupEnemies() {
    clearEnemies();
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
          row,
          col,
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
        if (row === 2) {
          enemyElt.style.animation = "swing 2s ease-in-out infinite alternate";
          enemyElt.transformOrigin = "top center";
        } else if (row === 3) {
          enemyElt.style.animation = "circle 3s infinite linear";
        }
        gameArea.appendChild(enemyElt);
        enemy.element = enemyElt;
        gameState.enemies.push(enemy);
      }
    }
  }

  function setupShields() {
    clearShields();
    for (let i = gameArea.children.length - 1; i >= 0; i--) {
      const child = gameArea.children[i];
      if (child.dataset.type === "shield") {
        gameArea.removeChild(child);
      }
    }

    const numShields = 4;
    const shieldSize = config.shieldSize || 40;
    const totalWidth = numShields * shieldSize * 2;
    const startX = (gameState.gameWidth - totalWidth) / 4;
    const shieldY = gameState.gameHeight * 0.75;

    for (let i = 0; i < numShields; i++) {
      const baseX = startX + i * (shieldSize * 4);
      const pattern = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 1],
      ];

      const blockSize = shieldSize / 6;

      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          if (pattern[row][col] === 1) {
            const shield = {
              row,
              col,
              x: baseX + col * blockSize,
              y: shieldY + row * blockSize,
              width: blockSize,
              height: blockSize,
              // health: 3,
            };
            const shieldElt = document.createElement("div");
            shieldElt.dataset.type = "shield";
            // shieldElt.textContent = "🛡️";
            // shieldElt.textContent = "⬜";
            // shieldElt.textContent = "◻️";
            applyStyle(shieldElt, {
              position: "absolute",
              left: shield.x + "px",
              top: shield.y + "px",
              height: shield.height + "px",
              width: shield.width + "px",
              // background: env.STYLE.windowActiveHeaderText,
              opacity: "0.7",
              background: `linear-gradient(to top left, ${env.STYLE.windowActiveHeaderText}, #ccc 99%)`,
              // background: `radial-gradient(${env.STYLE.windowActiveHeaderText}, ${env.STYLE.windowActiveHeader} 80%)`,
              // fontSize: shield.width + "px",
              userSelect: "none",
            });
            gameArea.appendChild(shieldElt);
            shield.element = shieldElt;
            gameState.shields.push(shield);
          }
        }
      }
    }
  }

  function shoot() {
    if (!gameState.started || gameState.gameOver) {
      return;
    }
    const now = performance.now();
    if (now - gameState.lastShot > config.fireRate) {
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
        backgroundColor: env.STYLE.windowActiveHeaderText,
        userSelect: "none",
      });
      gameArea.appendChild(bulletElt);
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

    if (playerMouseX !== null) {
      const targetX = playerMouseX - gameState.player.width / 2;
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
      bullet.y += config.enemyBulletSpeed;
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
      clearEnemyBullets();
      clearBullets();
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
        border: "1px solid " + env.STYLE.windowActiveHeaderText,
        transform: "translate(2px, 2px)",
        backgroundColor: "red",
        width: bullet.width + "px",
        height: bullet.height + "px",
        borderRadius: `0px 0px ${bulletSize}px ${bulletSize}px`,
        userSelect: "none",
      });
      gameArea.appendChild(bulletElt);
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
        for (let k = gameState.shields.length - 1; k >= 0; k--) {
          const shield = gameState.shields[k];
          if (
            bullet.x < shield.x + shield.width &&
            bullet.x + bullet.width > shield.x &&
            bullet.y < shield.y + shield.height &&
            bullet.y + bullet.height > shield.y
          ) {
            gameState.bullets[i].element.remove();
            gameState.bullets.splice(i, 1);
            // shield.health--;
            // if (shield.health <= 0) {
            gameState.shields[k].element.remove();
            gameState.shields.splice(k, 1);
            // }
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
        for (let k = gameState.shields.length - 1; k >= 0; k--) {
          const shield = gameState.shields[k];
          if (
            bullet.x < shield.x + shield.width &&
            bullet.x + bullet.width > shield.x &&
            bullet.y < shield.y + shield.height &&
            bullet.y + bullet.height > shield.y
          ) {
            gameState.enemyBullets[i].element.remove();
            gameState.enemyBullets.splice(i, 1);
            // shield.health--;
            // if (shield.health <= 0) {
            gameState.shields[k].element.remove();
            gameState.shields.splice(k, 1);
            // }
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
    gameState.shields.forEach((shield) => {
      // if (shield.health === 3) {
      //   shield.element.textContent = "🟩"; // Full health - green
      // } else if (shield.health === 2) {
      //   shield.element.textContent = "🟨"; // Damaged - yellow
      // } else {
      //   shield.element.textContent = "🟥"; // Very damaged - red
      // }
      applyStyle(shield.element, {
        position: "absolute",
        left: shield.x + "px",
        top: shield.y + "px",
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
      if (!gameState.started) {
        startScreen.style.display = "block";
        startScreen.style.fontSize = config.hudSize * 1.5 + "px";
        startScreen.innerHTML = `Invaders!<br><span style="font-size: ${config.hudSize}px;">Press Space or Click to Start</span>`;
      } else {
        startScreen.style.display = "none";
      }
      gameOverScreen.style.display = "none";
    }
  }

  function tick() {
    if (!gameState.started) {
      if (
        gameState.gameWidth !== gameWrapper.offsetWidth ||
        gameState.gameHeight !== gameWrapper.offsetHeight
      ) {
        recheckGameStartupSize();
      }
    } else if (
      gameState.gameWidth > gameWrapper.offsetWidth ||
      gameState.gameHeight > gameWrapper.offsetHeight
    ) {
      resetGameState();
    } else if (!gameState.gameOver) {
      updatePlayer();
      updateBullets();
      updateEnemies();
      checkCollisions();
    }

    render();
    animationId = requestAnimationFrame(tick);
  }

  function restartGame() {
    resetGameState();
  }

  function onActivate() {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    gameWrapper.addEventListener("mousemove", onMouseMove, { passive: true });
    gameWrapper.addEventListener("touchmove", onMouseMove, { passive: true });
    gameWrapper.addEventListener("mousedown", onMouseDown);
    gameWrapper.addEventListener("mouseup", onMouseUp);
    gameWrapper.addEventListener("click", onClick);
    cancelAnimationFrame(animationId);
    tick();
  }

  function onDeactivate() {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    gameWrapper.removeEventListener("mousemove", onMouseMove);
    gameWrapper.removeEventListener("touchmove", onMouseMove);
    gameWrapper.removeEventListener("mousedown", onMouseDown);
    gameWrapper.removeEventListener("mouseup", onMouseUp);
    gameWrapper.removeEventListener("click", onClick);
    cancelAnimationFrame(animationId);
    animationId = null;
    //
    // if (resizeObserver) {
    //   resizeObserver.disconnect();
    // }
  }

  function onKeyDown(e) {
    const keyPressed = e.key.toLowerCase();
    currentlyPressedKeys[keyPressed] = true;

    if (LEFT_KEYS.includes(keyPressed) || RIGHT_KEYS.includes(keyPressed)) {
      playerMouseX = null;
    }

    if (keyPressed === " ") {
      e.preventDefault();
      if (!gameState.started) {
        gameState.started = true;
      } else {
        shoot();
      }
    }

    if (keyPressed === "r") {
      restartGame();
    }
  }

  function onKeyUp(e) {
    currentlyPressedKeys[e.key.toLowerCase()] = false;
  }

  function onMouseMove(e) {
    if (!gameState.started || gameState.gameOver) {
      return;
    }
    let clientX;
    if (e.touches?.length) {
      if (e.touches.length > 1) {
        return;
      }
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const rect = gameArea.getBoundingClientRect();
    playerMouseX = clientX - rect.left;
    if (playerMouseX < 0) {
      playerMouseX = 0;
    }
    if (playerMouseX > rect.width) {
      playerMouseX = rect.width;
    }
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
    } else if (!gameState.started) {
      gameState.started = true;
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
function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
