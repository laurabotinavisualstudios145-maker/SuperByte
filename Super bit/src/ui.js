(function () {
  window.SuperByte = window.SuperByte || {};

  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game-canvas");
    const hudBar = document.getElementById("hud-bar");
    const hudLives = document.getElementById("hud-lives");
    const hudBytes = document.getElementById("hud-bytes");
    const hudAlgebra = document.getElementById("hud-algebra");
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
      gameover: document.getElementById("screen-gameover"),
      algebra: document.getElementById("screen-algebra")
    };

    const algebraCategory = document.getElementById("algebra-category");
    const algebraPrompt = document.getElementById("algebra-prompt");
    const algebraExpression = document.getElementById("algebra-expression");
    const algebraOptions = document.getElementById("algebra-options");
    const btnAlgebraHint = document.getElementById("btn-algebra-hint");
    const algebraHintText = document.getElementById("algebra-hint-text");
    const algebraFeedback = document.getElementById("algebra-feedback");
    const algebraFeedbackTitle = document.getElementById("algebra-feedback-title");
    const algebraFeedbackExplanation = document.getElementById("algebra-feedback-explanation");
    const btnAlgebraContinue = document.getElementById("btn-algebra-continue");

    let activeAlgebraState = null;

    let toastTimer = null;
    const touchControls = document.getElementById("touch-controls");

    function showOverlay(name) {
      Object.keys(overlays).forEach((key) => {
        if (key === name) {
          overlays[key].classList.remove("hidden");
        } else {
          overlays[key].classList.add("hidden");
        }
      });
      if (touchControls) {
        touchControls.classList.toggle("overlay-active", name !== null);
      }
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
      if (hudAlgebra) {
        hudAlgebra.textContent = String(data.algebraSolved || 0);
      }
      hudLevel.textContent = data.levelName;
      hudScore.textContent = String(data.score).padStart(6, "0");
    }

    function openAlgebraModal(question) {
      activeAlgebraState = {
        question,
        answered: false,
        savedLife: false
      };

      algebraCategory.textContent = `Nivel ${question.levelId} • ${question.category}`;
      algebraPrompt.textContent = question.prompt;
      algebraExpression.textContent = question.expression;
      algebraHintText.textContent = question.hint;
      algebraHintText.classList.add("hidden");
      btnAlgebraHint.classList.remove("hidden");

      algebraFeedback.classList.add("hidden");
      algebraFeedback.classList.remove("is-wrong");

      algebraOptions.innerHTML = "";
      question.options.forEach((optText, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "algebra-option-btn";
        btn.innerHTML = `
          <span class="algebra-key-badge">${idx + 1}</span>
          <span>${optText}</span>
        `;
        btn.addEventListener("click", () => handleAlgebraOptionSelect(idx));
        algebraOptions.appendChild(btn);
      });

      showOverlay("algebra");
    }

    function handleAlgebraOptionSelect(selectedIndex) {
      if (!activeAlgebraState || activeAlgebraState.answered) return;
      activeAlgebraState.answered = true;

      const { question } = activeAlgebraState;
      const isCorrect = selectedIndex === question.correctIndex;
      activeAlgebraState.savedLife = isCorrect;

      if (window.SuperByte.algebra) {
        window.SuperByte.algebra.recordResult(isCorrect);
      }

      const buttons = algebraOptions.querySelectorAll(".algebra-option-btn");
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.correctIndex) {
          btn.classList.add("correct");
        } else if (idx === selectedIndex && !isCorrect) {
          btn.classList.add("wrong");
        }
      });

      if (isCorrect) {
        window.SuperByte.audio.algebraSuccess();
        algebraFeedback.classList.remove("is-wrong");
        algebraFeedbackTitle.textContent =
          "¡CORRECTO! Escudo activado: conservas tu vida (+250 pts)";
      } else {
        window.SuperByte.audio.algebraFail();
        algebraFeedback.classList.add("is-wrong");
        algebraFeedbackTitle.textContent = `INCORRECTO — Respuesta correcta: ${question.answer} (-1 Vida)`;
      }

      algebraFeedbackExplanation.textContent = `Explicación: ${question.explanation}`;
      algebraFeedback.classList.remove("hidden");
      btnAlgebraContinue.focus();
    }

    function finishAlgebraModal() {
      if (!activeAlgebraState || !activeAlgebraState.answered) return;
      const savedLife = activeAlgebraState.savedLife;
      activeAlgebraState = null;
      window.SuperByte.audio.uiClick();
      showOverlay(null);
      engine.resolveAlgebraChallenge(savedLife);
    }

    btnAlgebraHint.addEventListener("click", () => {
      window.SuperByte.audio.uiClick();
      algebraHintText.classList.toggle("hidden");
    });

    btnAlgebraContinue.addEventListener("click", () => {
      finishAlgebraModal();
    });

    window.addEventListener("keydown", (e) => {
      if (!activeAlgebraState) return;
      if (!activeAlgebraState.answered) {
        if (e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4") {
          e.preventDefault();
          handleAlgebraOptionSelect(Number(e.key) - 1);
        }
      } else if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        finishAlgebraModal();
      }
    });

    const engine = new window.SuperByte.Engine(canvas, {
      onHUDUpdate: updateHUD,
      onLevelStart: (level) => {
        activeAlgebraState = null;
        hudBar.classList.remove("hidden");
        showOverlay(null);
        showLevelToast(level);
      },
      onPauseChange: (isPaused) => {
        showOverlay(isPaused ? "pause" : null);
      },
      onAlgebraChallenge: (question) => {
        openAlgebraModal(question);
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
        activeAlgebraState = null;
        window.SuperByte.audio.uiClick();
        window.SuperByte.audio.stopMusic();
        engine.state = "MENU";
        engine.loadLevel(0, true);
        hudBar.classList.add("hidden");
        showOverlay("main");
      });
    });

    // HUD Actions
    const btnFullscreen = document.getElementById("btn-hud-fullscreen");
    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", async () => {
        window.SuperByte.audio.uiClick();
        const docEl = document.documentElement;
        try {
          if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (docEl.requestFullscreen) {
              await docEl.requestFullscreen();
            } else if (docEl.webkitRequestFullscreen) {
              docEl.webkitRequestFullscreen();
            }
            if (screen.orientation && screen.orientation.lock) {
              screen.orientation.lock("landscape").catch(() => {});
            }
          } else {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          }
        } catch (_) {
          // Ignore fullscreen permission errors on restricted webviews
        }
      });
    }

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

    function setTouchControlsVisible(visible) {
      touchControls.classList.toggle("visible", visible);
      btnTouch.classList.toggle("active", visible);
      btnTouch.textContent = visible ? "VISIBLES" : "OCULTOS";
    }

    // Auto-enable touch controls on mobile & tablet devices
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth <= 900;

    setTouchControlsVisible(isTouchDevice);
    touchControls.classList.add("overlay-active");

    // Unlock Web Audio on first mobile touch interaction
    const unlockAudioOnce = () => {
      if (window.SuperByte.audio) {
        window.SuperByte.audio.ensureContext();
      }
      window.removeEventListener("touchstart", unlockAudioOnce);
      window.removeEventListener("pointerdown", unlockAudioOnce);
    };
    window.addEventListener("touchstart", unlockAudioOnce, { passive: true });
    window.addEventListener("pointerdown", unlockAudioOnce, { passive: true });

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
      const nextState = !touchControls.classList.contains("visible");
      setTouchControlsVisible(nextState);
    });

    // Multi-touch + thumb slide controller for mobile phones
    const touchBtns = {
      left: document.getElementById("touch-left"),
      right: document.getElementById("touch-right"),
      run: document.getElementById("touch-run"),
      jump: document.getElementById("touch-jump")
    };

    function applyTouchKeyStates(activeSet) {
      ["left", "right", "run", "jump"].forEach((key) => {
        const isPressed = activeSet.has(key);
        if (key === "jump" && isPressed && !engine.keys.jump) {
          engine.keys.jumpJustPressed = true;
        }
        engine.keys[key] = isPressed;
        if (touchBtns[key]) {
          touchBtns[key].classList.toggle("pressed", isPressed);
        }
      });
    }

    function syncTouches(e) {
      if (e.cancelable) e.preventDefault();
      const activeSet = new Set();
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        const btn = el && el.closest("[data-touch-key]");
        if (btn) {
          activeSet.add(btn.getAttribute("data-touch-key"));
        }
      }
      applyTouchKeyStates(activeSet);
    }

    touchControls.addEventListener("touchstart", syncTouches, { passive: false });
    touchControls.addEventListener("touchmove", syncTouches, { passive: false });
    touchControls.addEventListener("touchend", syncTouches, { passive: false });
    touchControls.addEventListener("touchcancel", syncTouches, { passive: false });
    touchControls.addEventListener("contextmenu", (e) => e.preventDefault());

    // Desktop mouse fallback when testing on-screen buttons with a mouse
    Object.keys(touchBtns).forEach((keyProp) => {
      const el = touchBtns[keyProp];
      if (!el) return;

      const pressMouse = (e) => {
        if (e.pointerType === "touch") return;
        e.preventDefault();
        el.classList.add("pressed");
        if (keyProp === "jump" && !engine.keys.jump) {
          engine.keys.jumpJustPressed = true;
        }
        engine.keys[keyProp] = true;
      };

      const releaseMouse = (e) => {
        if (e.pointerType === "touch") return;
        e.preventDefault();
        el.classList.remove("pressed");
        engine.keys[keyProp] = false;
      };

      el.addEventListener("pointerdown", pressMouse);
      el.addEventListener("pointerup", releaseMouse);
      el.addEventListener("pointerleave", releaseMouse);
      el.addEventListener("pointercancel", releaseMouse);
    });
  });
})();
