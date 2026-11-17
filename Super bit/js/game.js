/**
 * SUPER BYTE – Motor Principal del Videojuego 2D
 * Implementa físicas de plataformas estilo clásico (Super Mario Bros.), animaciones de Byte,
 * enemigos (Bug Walker, Virus Bot, Glitch), bloques sorpresa, portales, parallax y HUD.
 */
class SuperByteGame {
  constructor() {
    this.VIEW_W = 960;
    this.VIEW_H = 576;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.VIEW_W;
    this.canvas.height = this.VIEW_H;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    const container = document.getElementById('game-container');
    container.innerHTML = '';
    container.appendChild(this.canvas);

    this.sprites = window.spriteBank.initAll();

    // Estado global de partida
    this.state = 'MENU'; // MENU | PLAYING | PAUSED | VICTORY | GAMEOVER
    this.currentLevelNum = 1;
    this.lives = 3;
    this.maxLives = 5;
    this.bytesCount = 0;
    this.score = 0;

    // Entradas de teclado y táctil
    this.keys = {
      left: false,
      right: false,
      jump: false,
      jumpJustPressed: false,
      run: false
    };

    this.cameraX = 0;
    this.tick = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.emergedRewards = [];

    this.setupInputs();
    this.setupUI();
    this.startHeroPreview();

    // Detectar si Phaser 3 también está cargado en el entorno
    const engineBadge = document.getElementById('engine-status');
    if (engineBadge) {
      engineBadge.textContent = typeof window.Phaser !== 'undefined'
        ? 'HTML5 Canvas + Phaser 3 Ready'
        : 'HTML5 Canvas 2D Arcade Engine';
    }

    // Cargar nivel 1 de fondo para vista atractiva
    this.loadLevel(1, false);

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (this.state === 'PLAYING') e.preventDefault();
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.run = true;

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (!this.keys.jump) this.keys.jumpJustPressed = true;
        this.keys.jump = true;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'PLAYING') this.togglePause(true);
        else if (this.state === 'PAUSED') this.togglePause(false);
      }

      if (e.code === 'KeyR' && (this.state === 'PLAYING' || this.state === 'PAUSED')) {
        this.restartCurrentLevel();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.run = false;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.keys.jump = false;
      }
    });

    // Controles táctiles
    const bindTouch = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;
      const press = (ev) => {
        ev.preventDefault();
        if (keyName === 'jump' && !this.keys.jump) this.keys.jumpJustPressed = true;
        this.keys[keyName] = true;
      };
      const release = (ev) => {
        ev.preventDefault();
        this.keys[keyName] = false;
      };
      el.addEventListener('touchstart', press, { passive: false });
      el.addEventListener('touchend', release, { passive: false });
      el.addEventListener('mousedown', press);
      el.addEventListener('mouseup', release);
    };

    bindTouch('touch-left', 'left');
    bindTouch('touch-right', 'right');
    bindTouch('touch-run', 'run');
    bindTouch('touch-jump', 'jump');
  }

  setupUI() {
    const showScreen = (screenId) => {
      document.querySelectorAll('.overlay-screen').forEach(s => s.classList.add('hidden'));
      if (screenId) {
        const target = document.getElementById(screenId);
        if (target) target.classList.remove('hidden');
      }
    };
    this.showScreen = showScreen;

    // Botones del menú principal
    document.getElementById('btn-play').addEventListener('click', () => {
      window.soundFX.init();
      this.startNewGame(1);
    });

    document.getElementById('btn-levels').addEventListener('click', () => {
      showScreen('screen-levels');
    });

    document.getElementById('btn-instructions').addEventListener('click', () => {
      showScreen('screen-instructions');
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      showScreen('screen-settings');
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => showScreen('screen-menu'));
    });

    // Selección de nivel
    document.querySelectorAll('.select-level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.getAttribute('data-level'), 10) || 1;
        window.soundFX.init();
        this.startNewGame(lvl);
      });
    });

    // HUD
    document.getElementById('btn-hud-pause').addEventListener('click', () => {
      if (this.state === 'PLAYING') this.togglePause(true);
    });
    document.getElementById('btn-hud-restart').addEventListener('click', () => {
      this.restartCurrentLevel();
    });

    // Pausa
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause(false));
    document.getElementById('btn-pause-restart').addEventListener('click', () => this.restartCurrentLevel());
    document.getElementById('btn-pause-menu').addEventListener('click', () => this.returnToMenu());

    // Victoria
    document.getElementById('btn-next-level').addEventListener('click', () => {
      const next = this.currentLevelNum < 3 ? this.currentLevelNum + 1 : 1;
      this.loadLevel(next, true);
    });
    document.getElementById('btn-victory-replay').addEventListener('click', () => {
      this.loadLevel(this.currentLevelNum, true);
    });
    document.getElementById('btn-victory-menu').addEventListener('click', () => this.returnToMenu());

    // Game Over
    document.getElementById('btn-gameover-retry').addEventListener('click', () => {
      this.startNewGame(this.currentLevelNum);
    });
    document.getElementById('btn-gameover-menu').addEventListener('click', () => this.returnToMenu());

    // Configuración
    document.getElementById('toggle-music').addEventListener('change', (e) => {
      window.soundFX.musicEnabled = e.target.checked;
      if (e.target.checked && this.state === 'PLAYING') {
        window.soundFX.startMusic(this.currentLevelNum);
      } else {
        window.soundFX.stopMusic();
      }
    });

    document.getElementById('toggle-sfx').addEventListener('change', (e) => {
      window.soundFX.sfxEnabled = e.target.checked;
    });

    document.getElementById('slider-volume').addEventListener('input', (e) => {
      window.soundFX.setVolume(parseInt(e.target.value, 10) / 100);
    });

    document.getElementById('toggle-crt').addEventListener('change', (e) => {
      document.getElementById('crt-overlay').classList.toggle('disabled', !e.target.checked);
    });
  }

  startHeroPreview() {
    const previewCanvas = document.getElementById('hero-preview-canvas');
    if (!previewCanvas) return;
    const pCtx = previewCanvas.getContext('2d');
    pCtx.imageSmoothingEnabled = false;
    let frame = 0;
    setInterval(() => {
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      const sprite = frame % 2 === 0 ? this.sprites.byte_run_1 : this.sprites.byte_run_2;
      pCtx.drawImage(sprite, 16, 16, 64, 64);
      frame++;
    }, 180);
  }

  startNewGame(levelNum = 1) {
    this.lives = 3;
    this.bytesCount = 0;
    this.score = 0;
    this.loadLevel(levelNum, true);
  }

  restartCurrentLevel() {
    if (this.lives <= 0) {
      this.startNewGame(this.currentLevelNum);
    } else {
      this.loadLevel(this.currentLevelNum, true);
    }
  }

  returnToMenu() {
    this.state = 'MENU';
    window.soundFX.stopMusic();
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('touch-controls').classList.remove('visible');
    this.showScreen('screen-menu');
  }

  togglePause(paused) {
    if (paused) {
      this.state = 'PAUSED';
      window.soundFX.stopMusic();
      this.showScreen('screen-pause');
    } else {
      this.state = 'PLAYING';
      window.soundFX.startMusic(this.currentLevelNum);
      this.showScreen(null);
    }
  }

  loadLevel(levelNum, startPlaying = true) {
    this.currentLevelNum = levelNum;
    const raw = window.SUPER_BYTE_LEVELS[levelNum] || window.SUPER_BYTE_LEVELS[1];
    this.level = JSON.parse(JSON.stringify(raw));

    // Construir geometría sólida estática (suelo, plataformas, tuberías)
    this.solids = [];

    // Segmentos de suelo
    this.level.groundSegments.forEach(([x1, x2]) => {
      this.solids.push({
        x: x1,
        y: this.level.groundY,
        w: x2 - x1,
        h: this.level.height - this.level.groundY,
        kind: 'ground'
      });
    });

    // Plataformas suspendidas
    this.level.platforms.forEach(p => {
      this.solids.push({
        x: p.x,
        y: p.y,
        w: p.w,
        h: 22,
        kind: 'platform'
      });
    });

    // Tuberías tecnológicas
    this.level.pipes.forEach(pipe => {
      this.solids.push({
        x: pipe.x,
        y: this.level.groundY - pipe.h,
        w: 52,
        h: pipe.h,
        kind: 'pipe'
      });
    });

    // Bloques interactivos (golpeables desde abajo)
    this.blocks = this.level.blocks.map(b => ({
      x: b.x,
      y: b.y,
      baseY: b.y,
      w: 32,
      h: 32,
      type: b.type,
      reward: b.reward,
      used: false,
      hitsLeft: b.reward === 'multibyte' ? 3 : 1,
      bounceOffset: 0
    }));

    // Plataformas móviles
    this.movingPlatforms = this.level.movingPlatforms.map(mp => ({
      x: mp.x,
      y: mp.y,
      startX: mp.x,
      startY: mp.y,
      w: mp.w,
      h: 20,
      dx: mp.dx,
      dy: mp.dy,
      speed: mp.speed,
      t: 0,
      vx: 0,
      vy: 0
    }));

    // Bytes coleccionables
    this.bytes = this.level.bytes.map(c => ({
      x: c.x,
      y: c.y,
      baseY: c.y,
      w: 24,
      h: 24,
      collected: false
    }));

    // Recompensas emergidas de bloques
    this.emergedRewards = [];

    // Enemigos
    this.enemies = this.level.enemies.map(e => ({
      type: e.type,
      x: e.x,
      y: e.y,
      w: 30,
      h: 30,
      vx: e.type === 'virus' ? 1.8 : 1.25,
      vy: 0,
      minX: e.minX,
      maxX: e.maxX,
      dir: -1,
      alive: true,
      squishTimer: 0,
      phaseTimer: Math.random() * 100,
      phasedOut: false
    }));

    // Jugador: Byte
    this.player = {
      x: this.level.playerStart.x,
      y: this.level.playerStart.y,
      w: 26,
      h: 30,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      coyoteTimer: 0,
      invulnTimer: 0,
      hurtTimer: 0,
      dead: false,
      deathTimer: 0,
      animState: 'idle',
      animFrame: 0,
      animTimer: 0
    };

    this.particles = [];
    this.floatingTexts = [];
    this.cameraX = 0;

    this.updateHUD();

    if (startPlaying) {
      this.state = 'PLAYING';
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('touch-controls').classList.add('visible');
      this.showScreen(null);
      window.soundFX.startMusic(this.currentLevelNum);
    }
  }

  updateHUD() {
    const heartsEl = document.getElementById('hud-lives');
    if (heartsEl) {
      heartsEl.textContent = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, 3 - this.lives));
    }
    const bytesEl = document.getElementById('hud-bytes');
    if (bytesEl) bytesEl.textContent = String(this.bytesCount).padStart(2, '0');

    const scoreEl = document.getElementById('hud-score');
    if (scoreEl) scoreEl.textContent = String(this.score).padStart(6, '0');

    const levelNameEl = document.getElementById('hud-level-name');
    if (levelNameEl && this.level) levelNameEl.textContent = this.level.name;
  }

  spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 3 + Math.random() * 3,
        color,
        life: 24 + Math.random() * 14
      });
    }
  }

  spawnFloatingText(x, y, text, color = '#fee440') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 40
    });
  }

  // ==================== FÍSICAS Y LÓGICA DEL JUEGO ====================
  update() {
    this.tick++;
    if (this.state !== 'PLAYING') return;

    const p = this.player;

    // Si Byte murió, ejecutar animación de muerte
    if (p.dead) {
      p.vy += 0.45;
      p.y += p.vy;
      p.deathTimer--;
      if (p.deathTimer <= 0) {
        if (this.lives > 0) {
          this.loadLevel(this.currentLevelNum, true);
        } else {
          this.triggerGameOver();
        }
      }
      return;
    }

    // Actualizar plataformas móviles
    this.movingPlatforms.forEach(mp => {
      const prevX = mp.x;
      const prevY = mp.y;
      mp.t += 0.02 * mp.speed;
      mp.x = mp.startX + Math.sin(mp.t) * mp.dx;
      mp.y = mp.startY + Math.sin(mp.t) * mp.dy;
      mp.vx = mp.x - prevX;
      mp.vy = mp.y - prevY;
    });

    // Movimiento horizontal de Byte (Caminar y Correr con aceleración suave)
    const maxSpeed = this.keys.run ? 5.6 : 3.6;
    const accel = p.onGround ? 0.48 : 0.32;
    const friction = p.onGround ? 0.80 : 0.92;

    if (this.keys.left) {
      p.vx = Math.max(p.vx - accel, -maxSpeed);
      p.facing = -1;
    } else if (this.keys.right) {
      p.vx = Math.min(p.vx + accel, maxSpeed);
      p.facing = 1;
    } else {
      p.vx *= friction;
      if (Math.abs(p.vx) < 0.08) p.vx = 0;
    }

    // Coyote time para saltos responsivos estilo arcade
    if (p.onGround) {
      p.coyoteTimer = 7;
    } else if (p.coyoteTimer > 0) {
      p.coyoteTimer--;
    }

    // Salto
    if (this.keys.jumpJustPressed && p.coyoteTimer > 0) {
      const runBonus = Math.abs(p.vx) > 4.0 ? -1.1 : 0;
      p.vy = -11.2 + runBonus;
      p.onGround = false;
      p.coyoteTimer = 0;
      window.soundFX.jump();
      this.spawnParticles(p.x + p.w / 2, p.y + p.h, '#00f5d4', 6);
    }
    this.keys.jumpJustPressed = false;

    // Salto de altura variable al soltar la barra espaciadora
    if (!this.keys.jump && p.vy < -4.0) {
      p.vy *= 0.65;
    }

    // Gravedad natural
    p.vy = Math.min(p.vy + 0.52, 12.5);

    // Reunir todos los obstáculos sólidos (estáticos + bloques + plataformas móviles)
    const allSolids = [
      ...this.solids,
      ...this.blocks,
      ...this.movingPlatforms
    ];

    // Aplicar desplazamiento horizontal y colisión X
    p.x += p.vx;
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
    if (p.x + p.w > this.level.width) {
      p.x = this.level.width - p.w;
      p.vx = 0;
    }

    for (const s of allSolids) {
      if (this.rectsOverlap(p, s)) {
        if (p.vx > 0) {
          p.x = s.x - p.w;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = s.x + s.w;
          p.vx = 0;
        }
      }
    }

    // Aplicar desplazamiento vertical y colisión Y
    p.y += p.vy;
    p.onGround = false;
    let ridingPlatform = null;

    for (const s of allSolids) {
      if (this.rectsOverlap(p, s)) {
        if (p.vy > 0) {
          // Aterrizando sobre plataforma o bloque
          p.y = s.y - p.h;
          p.vy = 0;
          p.onGround = true;
          if (s.vx !== undefined) ridingPlatform = s;
        } else if (p.vy < 0) {
          // Golpeando desde abajo
          p.y = s.y + s.h;
          p.vy = 1.2;
          if (s.type === 'surprise' || s.type === 'brick') {
            this.hitBlockFromBelow(s);
          } else {
            window.soundFX.blockHit();
          }
        }
      }
    }

    // Si está sobre una plataforma móvil, acompañar su movimiento
    if (ridingPlatform) {
      p.x += ridingPlatform.vx;
      p.y += ridingPlatform.vy;
    }

    // Actualizar animación de rebote de bloques
    this.blocks.forEach(b => {
      if (b.bounceOffset < 0) {
        b.bounceOffset += 1.5;
        if (b.bounceOffset > 0) b.bounceOffset = 0;
      }
      b.y = b.baseY + b.bounceOffset;
    });

    // Caída fuera del escenario (Abismo)
    if (p.y > this.level.height + 60) {
      this.killPlayer();
      return;
    }

    // Temporizadores de daño / invulnerabilidad
    if (p.invulnTimer > 0) p.invulnTimer--;
    if (p.hurtTimer > 0) p.hurtTimer--;

    // Determinar estado de animación de Byte (7 estados requeridos)
    this.updatePlayerAnimation();

    // Colisión con Bytes coleccionables
    this.bytes.forEach(b => {
      if (!b.collected && this.rectsOverlap(p, b)) {
        b.collected = true;
        this.collectByteItem(b.x + 12, b.y + 12);
      }
    });

    // Actualizar recompensas emergidas de bloques sorpresa
    for (let i = this.emergedRewards.length - 1; i >= 0; i--) {
      const item = this.emergedRewards[i];
      item.vy = Math.min(item.vy + 0.35, 6);
      item.x += item.vx;
      item.y += item.vy;

      for (const s of allSolids) {
        if (this.rectsOverlap(item, s)) {
          if (item.vy > 0) {
            item.y = s.y - item.h;
            item.vy = 0;
          }
        }
      }

      if (this.rectsOverlap(p, item)) {
        if (item.kind === 'heart') {
          this.lives = Math.min(this.maxLives, this.lives + 1);
          this.score += 500;
          window.soundFX.collectHeart();
          this.spawnParticles(item.x + 12, item.y + 12, '#ff3366', 14);
          this.spawnFloatingText(item.x, item.y, '+1 VIDA', '#ff3366');
        } else {
          this.collectByteItem(item.x + 12, item.y + 12);
        }
        this.updateHUD();
        this.emergedRewards.splice(i, 1);
      }
    }

    // Colisión con Obstáculos de Picos Láser
    for (const haz of this.level.hazards) {
      const hazRect = { x: haz.x + 4, y: haz.y + 4, w: haz.w - 8, h: 16 };
      if (this.rectsOverlap(p, hazRect)) {
        this.damagePlayer();
        break;
      }
    }

    // Actualizar y colisionar Enemigos (Bug Walker, Virus Bot, Glitch)
    this.updateEnemies();

    // Verificar llegada al Portal de Salida
    const portalRect = {
      x: this.level.portal.x + 10,
      y: this.level.portal.y,
      w: 44,
      h: 96
    };
    if (this.rectsOverlap(p, portalRect)) {
      this.completeLevel();
      return;
    }

    // Actualizar partículas y textos flotantes
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.15;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 1.1;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Seguimiento suave de cámara horizontal
    const targetCamX = p.x - this.VIEW_W * 0.35;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraX = Math.max(0, Math.min(this.level.width - this.VIEW_W, this.cameraX));
  }

  updatePlayerAnimation() {
    const p = this.player;
    p.animTimer++;

    if (p.dead) {
      p.animState = 'dead';
    } else if (p.hurtTimer > 0) {
      p.animState = 'hurt';
    } else if (!p.onGround) {
      p.animState = p.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(p.vx) > 4.0) {
      p.animState = 'run';
      if (p.animTimer % 5 === 0) p.animFrame = (p.animFrame + 1) % 2;
    } else if (Math.abs(p.vx) > 0.25) {
      p.animState = 'walk';
      if (p.animTimer % 8 === 0) p.animFrame = (p.animFrame + 1) % 2;
    } else {
      p.animState = 'idle';
      if (p.animTimer % 24 === 0) p.animFrame = (p.animFrame + 1) % 2;
    }
  }

  hitBlockFromBelow(block) {
    if (block.used) {
      window.soundFX.blockHit();
      return;
    }

    block.bounceOffset = -10;
    window.soundFX.blockHit();

    if (block.type === 'surprise') {
      block.hitsLeft--;
      if (block.hitsLeft <= 0) block.used = true;

      if (block.reward === 'heart') {
        window.soundFX.blockReward();
        this.emergedRewards.push({
          x: block.x + 4,
          y: block.y - 26,
          w: 24,
          h: 24,
          vx: 1.1,
          vy: -4.5,
          kind: 'heart'
        });
      } else {
        // Recompensa de Byte inmediata + efecto visual
        this.collectByteItem(block.x + 16, block.y - 12);
      }
    } else if (block.type === 'brick') {
      this.score += 50;
      this.spawnParticles(block.x + 16, block.y + 16, '#00bbf9', 8);
      this.updateHUD();
    }
  }

  collectByteItem(x, y) {
    this.bytesCount++;
    this.score += 100;
    window.soundFX.collectByte();
    this.spawnParticles(x, y, '#fee440', 10);
    this.spawnFloatingText(x - 10, y - 10, '+100', '#fee440');

    // Cada 25 bytes otorga 1 vida extra
    if (this.bytesCount % 25 === 0 && this.lives < this.maxLives) {
      this.lives++;
      window.soundFX.collectHeart();
      this.spawnFloatingText(x - 20, y - 28, '¡VIDA EXTRA!', '#00f5d4');
    }
    this.updateHUD();
  }

  updateEnemies() {
    const p = this.player;

    this.enemies.forEach(e => {
      if (!e.alive) {
        if (e.squishTimer > 0) e.squishTimer--;
        return;
      }

      // Comportamiento específico según tipo de enemigo
      if (e.type === 'bug') {
        // Bug Walker: patrulla constante
        e.x += e.vx * e.dir;
        if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
        if (e.x + e.w >= e.maxX) { e.x = e.maxX - e.w; e.dir = -1; }
      } else if (e.type === 'virus') {
        // Virus Bot: persigue al jugador cuando se acerca
        const dist = (p.x + p.w / 2) - (e.x + e.w / 2);
        const chaseSpeed = Math.abs(dist) < 230 ? 2.45 : 1.4;
        if (Math.abs(dist) < 230) {
          e.dir = dist > 0 ? 1 : -1;
        }
        e.x += chaseSpeed * e.dir;
        if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
        if (e.x + e.w >= e.maxX) { e.x = e.maxX - e.w; e.dir = -1; }
      } else if (e.type === 'glitch') {
        // Glitch: patrulla y aparece/desaparece periódicamente
        e.phaseTimer++;
        e.phasedOut = (e.phaseTimer % 140) > 95;
        e.x += 1.6 * e.dir;
        if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
        if (e.x + e.w >= e.maxX) { e.x = e.maxX - e.w; e.dir = -1; }
      }

      // Si el Glitch está desmaterializado, no colisiona
      if (e.phasedOut) return;

      if (this.rectsOverlap(p, e)) {
        // Comprobar si Byte cae encima del enemigo (pisotón clásico de plataformas)
        const playerBottom = p.y + p.h;
        const enemyCenterY = e.y + e.h * 0.55;
        if (p.vy > 0 && playerBottom - p.vy <= enemyCenterY) {
          // Enemigo derrotado
          e.alive = false;
          e.squishTimer = 25;
          p.vy = -9.2; // Rebote sobre el enemigo
          this.score += e.type === 'Bug' ? 200 : 300;
          window.soundFX.enemyDefeat();
          this.spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#f15bb5', 14);
          this.spawnFloatingText(e.x, e.y - 8, '+300', '#00f5d4');
          this.updateHUD();
        } else {
          // Contacto lateral: Byte recibe daño
          this.damagePlayer();
        }
      }
    });
  }

  damagePlayer() {
    const p = this.player;
    if (p.invulnTimer > 0 || p.dead) return;

    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      this.killPlayer();
    } else {
      p.invulnTimer = 75;
      p.hurtTimer = 26;
      p.vy = -6.8;
      p.vx = -p.facing * 4.2;
      window.soundFX.playerDamage();
      this.spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#ff3366', 12);
    }
  }

  killPlayer() {
    const p = this.player;
    if (p.dead) return;
    p.dead = true;
    p.vy = -10.0;
    p.vx = 0;
    p.deathTimer = 75;
    this.lives = Math.max(0, this.lives - (this.lives > 0 && p.y > this.level.height ? 1 : 0));
    this.updateHUD();
    window.soundFX.stopMusic();
    window.soundFX.playerDeath();
  }

  completeLevel() {
    this.state = 'VICTORY';
    this.score += 1000 + this.lives * 300;
    this.updateHUD();
    window.soundFX.stopMusic();
    window.soundFX.levelVictory();

    document.getElementById('vic-bytes').textContent = this.bytesCount;
    document.getElementById('vic-score').textContent = this.score;
    document.getElementById('vic-lives').textContent = this.lives;

    const titleEl = document.getElementById('victory-title');
    const subEl = document.getElementById('victory-subtitle');
    const nextBtn = document.getElementById('btn-next-level');

    if (this.currentLevelNum >= 3) {
      titleEl.textContent = '¡AVENTURA DIGITAL COMPLETADA!';
      subEl.textContent = '¡Felicidades! Has superado Byte Valley, Cyber Forest y Neon Factory.';
      nextBtn.textContent = '🔄 JUGAR DESDE NIVEL 1';
    } else {
      titleEl.textContent = `¡${this.level.name} SUPERADO!`;
      subEl.textContent = 'Byte ha cruzado el portal cuántico hacia el siguiente sector.';
      nextBtn.textContent = `⏭ IR AL NIVEL ${this.currentLevelNum + 1}`;
    }

    this.showScreen('screen-victory');
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    window.soundFX.stopMusic();
    document.getElementById('go-score').textContent = this.score;
    document.getElementById('go-bytes').textContent = this.bytesCount;
    this.showScreen('screen-gameover');
  }

  rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // ==================== RENDERIZADO PIXEL ART Y PARALLAX ====================
  render() {
    const ctx = this.ctx;
    const t = this.level.theme;

    // 1. Cielo con gradiente retro
    const grad = ctx.createLinearGradient(0, 0, 0, this.VIEW_H);
    grad.addColorStop(0, t.skyTop);
    grad.addColorStop(1, t.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.VIEW_W, this.VIEW_H);

    // 2. Capa Parallax Lejana: Estrellas digitales y torres cibernéticas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 36; i++) {
      const sx = ((i * 137 - this.cameraX * 0.12) % this.VIEW_W + this.VIEW_W) % this.VIEW_W;
      const sy = (i * 53) % 300;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Siluetas de montañas / estructuras digitales (Parallax 0.25)
    ctx.fillStyle = t.distantHills;
    for (let i = -1; i < 10; i++) {
      const bx = i * 220 - (this.cameraX * 0.25) % 220;
      const bh = 140 + ((i * 67) % 90);
      ctx.fillRect(bx, this.level.groundY - bh, 170, bh);
      // Líneas de circuito iluminadas en las estructuras de fondo
      ctx.strokeStyle = t.midCircuit;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 16, this.level.groundY - bh + 16, 138, bh - 16);
      ctx.globalAlpha = 1;
    }

    // 3. Capa Parallax Media: Nodos y pilares de datos (Parallax 0.5)
    for (let i = -1; i < 14; i++) {
      const px = i * 160 - (this.cameraX * 0.5) % 160;
      const ph = 70 + ((i * 43) % 60);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(px, this.level.groundY - ph, 48, ph);
      ctx.fillStyle = t.midCircuit;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(px + 20, this.level.groundY - ph + 10, 8, ph - 20);
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // 4. Dibujar Suelo, Plataformas y Tuberías Tecnológicas
    this.solids.forEach(s => {
      if (s.kind === 'ground') {
        ctx.fillStyle = t.groundFill;
        ctx.fillRect(s.x, s.y, s.w, s.h);

        // Textura de cuadrícula tecnológica en el suelo
        ctx.strokeStyle = t.groundGrid;
        ctx.lineWidth = 2;
        for (let gx = s.x; gx < s.x + s.w; gx += 32) {
          ctx.strokeRect(gx, s.y, 32, s.h);
        }

        // Borde superior de neón brillante
        ctx.fillStyle = t.groundTop;
        ctx.fillRect(s.x, s.y, s.w, 6);
      } else if (s.kind === 'platform') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = t.platformColor;
        ctx.fillRect(s.x, s.y, s.w, 5);
        for (let px = s.x + 8; px < s.x + s.w - 8; px += 16) {
          ctx.fillRect(px, s.y + 10, 8, 4);
        }
      } else if (s.kind === 'pipe') {
        // Tubería / Torre de Servidor Tecnológico
        ctx.fillStyle = '#091e26';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeStyle = t.pipeColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(s.x, s.y, s.w, s.h);
        // Cabeza de la tubería
        ctx.fillStyle = t.pipeColor;
        ctx.fillRect(s.x - 4, s.y, s.w + 8, 14);
        // Luces LED
        ctx.fillStyle = '#fee440';
        ctx.fillRect(s.x + 10, s.y + 24, 8, 6);
        ctx.fillRect(s.x + 34, s.y + 24, 8, 6);
      }
    });

    // 5. Plataformas Móviles
    this.movingPlatforms.forEach(mp => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
      ctx.fillStyle = '#fee440';
      ctx.fillRect(mp.x, mp.y, mp.w, 5);
      // Propulsor inferior animado
      ctx.fillStyle = this.tick % 6 < 3 ? '#00f5d4' : '#f15bb5';
      ctx.fillRect(mp.x + 12, mp.y + mp.h, 14, 5);
      ctx.fillRect(mp.x + mp.w - 26, mp.y + mp.h, 14, 5);
    });

    // 6. Bloques Golpeables y Bloques Sorpresa [?]
    this.blocks.forEach(b => {
      if (b.used) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      } else if (b.type === 'surprise') {
        const pulse = Math.sin(this.tick * 0.12) > 0 ? '#fee440' : '#f77f00';
        ctx.fillStyle = pulse;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
        ctx.fillStyle = '#050814';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText('?', b.x + 10, b.y + 22);
      } else {
        ctx.fillStyle = '#0b4f6c';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = '#00bbf9';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
        ctx.fillStyle = '#00f5d4';
        ctx.fillRect(b.x + 6, b.y + 6, 20, 4);
        ctx.fillRect(b.x + 6, b.y + 18, 20, 4);
      }
    });

    // 7. Obstáculos (Picos de Voltaje)
    this.level.hazards.forEach(haz => {
      const count = Math.floor(haz.w / 16);
      for (let i = 0; i < count; i++) {
        const hx = haz.x + i * 16;
        ctx.fillStyle = this.tick % 10 < 5 ? '#ff3366' : '#fee440';
        ctx.beginPath();
        ctx.moveTo(hx, haz.y + 16);
        ctx.lineTo(hx + 8, haz.y);
        ctx.lineTo(hx + 16, haz.y + 16);
        ctx.closePath();
        ctx.fill();
      }
    });

    // 8. Bytes Coleccionables
    const coinSprite = Math.floor(this.tick / 12) % 2 === 0
      ? this.sprites.byte_coin_1
      : this.sprites.byte_coin_2;

    this.bytes.forEach(b => {
      if (b.collected) return;
      const floatY = b.baseY + Math.sin(this.tick * 0.08 + b.x) * 4;
      ctx.drawImage(coinSprite, b.x - 4, floatY - 2);
    });

    // 9. Recompensas Emergidas (Corazones de Vida Extra)
    this.emergedRewards.forEach(item => {
      if (item.kind === 'heart') {
        ctx.drawImage(this.sprites.heart_item, item.x - 4, item.y - 2);
      }
    });

    // 10. Portal Cuántico de Salida
    const portal = this.level.portal;
    ctx.save();
    const portalGlow = ctx.createRadialGradient(
      portal.x + 32, portal.y + 48, 8,
      portal.x + 32, portal.y + 48, 56
    );
    portalGlow.addColorStop(0, '#ffffff');
    portalGlow.addColorStop(0.4, '#00f5d4');
    portalGlow.addColorStop(0.8, '#9b5de5');
    portalGlow.addColorStop(1, 'rgba(155, 93, 229, 0)');
    ctx.fillStyle = portalGlow;
    ctx.fillRect(portal.x - 24, portal.y - 16, 112, 128);

    // Base y arco del portal
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(portal.x + 8, portal.y, 48, 96);
    ctx.fillStyle = this.tick % 8 < 4 ? '#fee440' : '#00f5d4';
    ctx.font = 'bold 12px Courier New';
    ctx.fillText('EXIT', portal.x + 17, portal.y - 8);
    ctx.restore();

    // 11. Enemigos
    const animStep = Math.floor(this.tick / 10) % 2;
    this.enemies.forEach(e => {
      if (!e.alive) {
        if (e.squishTimer > 0) {
          ctx.fillStyle = '#f15bb5';
          ctx.fillRect(e.x, e.y + 20, e.w, 10);
        }
        return;
      }

      let sp = null;
      if (e.type === 'bug') {
        sp = animStep === 0 ? this.sprites.bug_1 : this.sprites.bug_2;
      } else if (e.type === 'virus') {
        sp = animStep === 0 ? this.sprites.virus_1 : this.sprites.virus_2;
      } else {
        sp = animStep === 0 ? this.sprites.glitch_1 : this.sprites.glitch_2;
      }

      ctx.save();
      if (e.phasedOut) ctx.globalAlpha = 0.25;
      ctx.drawImage(sp, e.x - 1, e.y - 2);
      ctx.restore();
    });

    // 12. Personaje Principal: BYTE
    const p = this.player;
    if (p.invulnTimer % 4 < 2) {
      let pSprite = this.sprites.byte_idle_1;
      switch (p.animState) {
        case 'idle':
          pSprite = p.animFrame === 0 ? this.sprites.byte_idle_1 : this.sprites.byte_idle_2;
          break;
        case 'walk':
          pSprite = p.animFrame === 0 ? this.sprites.byte_walk_1 : this.sprites.byte_walk_2;
          break;
        case 'run':
          pSprite = p.animFrame === 0 ? this.sprites.byte_run_1 : this.sprites.byte_run_2;
          break;
        case 'jump':
          pSprite = this.sprites.byte_jump;
          break;
        case 'fall':
          pSprite = this.sprites.byte_fall;
          break;
        case 'hurt':
          pSprite = this.sprites.byte_hurt;
          break;
        case 'dead':
          pSprite = this.sprites.byte_dead;
          break;
      }

      ctx.save();
      if (p.facing === -1) {
        ctx.translate(p.x + p.w / 2, p.y);
        ctx.scale(-1, 1);
        ctx.drawImage(pSprite, -16, -2);
      } else {
        ctx.drawImage(pSprite, p.x - 3, p.y - 2);
      }
      ctx.restore();
    }

    // 13. Partículas y Textos de Puntuación Flotantes
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    });

    this.floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px Courier New';
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore();
  }

  loop(now) {
    this.update();
    this.render();
    this.lastTime = now;
    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.superByteApp = new SuperByteGame();
});
