(function () {
  window.SuperByte = window.SuperByte || {};

  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game-canvas");
    const hudBar = document.getElementById("hud-bar");
    const hudLives = document.getElementById("hud-lives");
    const hudBytes = document.getElementById("hud-bytes");
    const hudLevel = document.getElementById("hud-level");
    const hudScore = document.getElementById("hud-score");

    const levelToast = document.getElementById("level-toast");
    const toastTitle = document.getElementById("toast-title");
    const toastSub = document.getElementById("toast-sub");

    const overlays = {
      main: document.getElementById("screen-main"),
      levels: document.getElementById("screen-levels"),
      instructions: document.getElementById("screen-instructions"),
      config: document.getElementById("screen-config"),
      pause: document.getElementById("screen-pause"),
      victory: document.getElementById("screen-victory"),
      gameover: document.getElementById("screen-gameover")
    };

    let toastTimer = null;

    function showOverlay(name) {
      Object.keys(overlays).forEach((key) => {
        if (key === name) {
          overlays[key].classList.remove("hidden");
        } else {
          overlays[key].classList.add("hidden");
        }
      });
    }

    function showLevelToast(level) {
      toastTitle.textContent = level.name;
      toastSub.textContent = level.subtitle;
      levelToast.classList.remove("hidden");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        levelToast.classList.add("hidden");
      }, 2800);
    }

    function updateHUD(data) {
      hudLives.innerHTML = "";
      const totalHearts = Math.max(3, data.lives);
      for (let i = 0; i < totalHearts; i++) {
        const span = document.createElement("span");
        span.className = i < data.lives ? "heart-icon" : "heart-icon lost";
        span.textContent = "♥";
        hudLives.appendChild(span);
      }

      hudBytes.textContent = String(data.bytes).padStart(2, "0");
      hudLevel.textContent = data.levelName;
      hudScore.textContent = String(data.score).padStart(6, "0");
    }

    const engine = new window.SuperByte.Engine(canvas, {
      onHUDUpdate: updateHUD,
      onLevelStart: (level) => {
        hudBar.classList.remove("hidden");
        showOverlay(null);
        showLevelToast(level);
      },
      onPauseChange: (isPaused) => {
        showOverlay(isPaused ? "pause" : null);
      },
      onLevelWin: (stats) => {
        document.getElementById("win-level-name").textContent = stats.levelName;
        document.getElementById("win-bytes").textContent = stats.bytes;
        document.getElementById("win-score").textContent = stats.score;
        const btnNext = document.getElementById("btn-next-level");
        btnNext.textContent = stats.isFinalLevel
          ? "JUGAR DE NUEVO DESDE NIVEL 1"
          : "SIGUIENTE NIVEL ▶";
        showOverlay("victory");
      },
      onGameOver: (stats) => {
        document.getElementById("over-level-name").textContent = stats.levelName;
        document.getElementById("over-bytes").textContent = stats.bytes;
        document.getElementById("over-score").textContent = stats.score;
        showOverlay("gameover");
      }
    });

    // Populate Level Select Cards dynamically
    const levelGrid = document.getElementById("level-grid");
    window.SuperByte.LEVELS.forEach((lvl, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "level-card";
      card.innerHTML = `
        <div>
          <div class="level-card-num">MUNDO ${lvl.id}</div>
          <div class="level-card-title">${lvl.name.replace(/^Nivel \d+:\s*/, "")}</div>
          <div class="level-card-desc">${lvl.subtitle}</div>
        </div>
        <span class="level-card-badge">Dificultad: ${lvl.difficulty}</span>
      `;
      card.addEventListener("click", () => {
        window.SuperByte.audio.uiClick();
        engine.startNewGame(idx);
      });
      levelGrid.appendChild(card);
    });

    // Main Menu Buttons
    document.getElementById("btn-play").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      engine.startNewGame(0);
    });

    document.getElementById("btn-select-level").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      showOverlay("levels");
    });

    document.getElementById("btn-instructions").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      showOverlay("instructions");
    });

    document.getElementById("btn-config").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      showOverlay("config");
    });

    // Back to Main Menu buttons
    document.querySelectorAll("[data-back-main]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SuperByte.audio.uiClick();
        window.SuperByte.audio.stopMusic();
        engine.state = "MENU";
        engine.loadLevel(0, true);
        hudBar.classList.add("hidden");
        showOverlay("main");
      });
    });

    // HUD Actions
    document.getElementById("btn-hud-pause").addEventListener("click", () => {
      engine.togglePause();
    });

    document.getElementById("btn-hud-restart").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      engine.restartCurrentLevel();
    });

    // Pause Screen Buttons
    document.getElementById("btn-resume").addEventListener("click", () => {
      engine.togglePause();
    });

    document.getElementById("btn-pause-restart").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      engine.restartCurrentLevel();
    });

    // Victory Screen Buttons
    document.getElementById("btn-next-level").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      engine.nextLevel();
    });

    document.getElementById("btn-win-replay").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      engine.restartCurrentLevel();
    });

    // Game Over Screen Buttons
    document.getElementById("btn-gameover-retry").addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      engine.startNewGame(engine.currentLevelIndex);
    });

    // Configuration Controls
    const sliderMusic = document.getElementById("slider-music");
    const sliderSfx = document.getElementById("slider-sfx");
    const btnCrt = document.getElementById("btn-toggle-crt");
    const btnTouch = document.getElementById("btn-toggle-touch");
    const touchControls = document.getElementById("touch-controls");

    sliderMusic.addEventListener("input", (e) => {
      window.SuperByte.audio.musicVolume = Number(e.target.value) / 100;
    });

    sliderSfx.addEventListener("input", (e) => {
      window.SuperByte.audio.sfxVolume = Number(e.target.value) / 100;
      window.SuperByte.audio.uiClick();
    });

    btnCrt.addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      document.body.classList.toggle("crt-enabled");
      const active = document.body.classList.contains("crt-enabled");
      btnCrt.classList.toggle("active", active);
      btnCrt.textContent = active ? "ACTIVADO" : "DESACTIVADO";
    });

    btnTouch.addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      touchControls.classList.toggle("visible");
      const active = touchControls.classList.contains("visible");
      btnTouch.classList.toggle("active", active);
      btnTouch.textContent = active ? "VISIBLES" : "OCULTOS";
    });

    // Bind On-Screen Touch Buttons
    function bindHoldButton(btnId, keyProp, isJump = false) {
      const el = document.getElementById(btnId);
      if (!el) return;

      const press = (e) => {
        e.preventDefault();
        el.classList.add("pressed");
        if (isJump && !engine.keys.jump) {
          engine.keys.jumpJustPressed = true;
        }
        engine.keys[keyProp] = true;
      };

      const release = (e) => {
        e.preventDefault();
        el.classList.remove("pressed");
        engine.keys[keyProp] = false;
      };

      el.addEventListener("pointerdown", press);
      el.addEventListener("pointerup", release);
      el.addEventListener("pointerleave", release);
      el.addEventListener("pointercancel", release);
    }

    bindHoldButton("touch-left", "left");
    bindHoldButton("touch-right", "right");
    bindHoldButton("touch-run", "run");
    bindHoldButton("touch-jump", "jump", true);
  });
})();
