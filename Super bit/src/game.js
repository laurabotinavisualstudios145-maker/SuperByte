(function () {
  window.SuperByte = window.SuperByte || {};

  const INTERNAL_W = 960;
  const INTERNAL_H = 540;

  function aabbOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  class SuperByteEngine {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.canvas.width = INTERNAL_W;
      this.canvas.height = INTERNAL_H;
      this.ctx.imageSmoothingEnabled = false;

      this.callbacks = callbacks || {};

      // Game session state
      this.state = "MENU"; // MENU, PLAYING, PAUSED, LEVEL_WIN, GAME_OVER
      this.currentLevelIndex = 0;
      this.lives = 3;
      this.maxLives = 5;
      this.bytesCollected = 0;
      this.score = 0;
      this.frameTick = 0;

      // Input state
      this.keys = {
        left: false,
        right: false,
        jump: false,
        jumpJustPressed: false,
        run: false
      };

      // Camera
      this.camera = { x: 0, y: 0 };

      // Decorative background stars/nodes
      this.bgNodes = [];
      for (let i = 0; i < 48; i++) {
        this.bgNodes.push({
          x: Math.random() * INTERNAL_W,
          y: Math.random() * (INTERNAL_H * 0.65),
          size: Math.random() > 0.6 ? 3 : 2,
          phase: Math.random() * Math.PI * 2
        });
      }

      this.particles = [];
      this.floatingTexts = [];

      this.loadLevel(0, true);
      this.bindKeyboard();

      this.lastTime = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    bindKeyboard() {
      window.addEventListener("keydown", (e) => {
        if (e.code === "Escape") {
          if (this.state === "PLAYING" || this.state === "PAUSED") {
            e.preventDefault();
            this.togglePause();
          }
          return;
        }

        if (e.code === "ArrowLeft" || e.code === "KeyA") {
          this.keys.left = true;
        }
        if (e.code === "ArrowRight" || e.code === "KeyD") {
          this.keys.right = true;
        }
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
          this.keys.run = true;
        }
        if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
          if (this.state === "PLAYING") {
            e.preventDefault();
          }
          if (!this.keys.jump) {
            this.keys.jumpJustPressed = true;
          }
          this.keys.jump = true;
        }
      });

      window.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft" || e.code === "KeyA") {
          this.keys.left = false;
        }
        if (e.code === "ArrowRight" || e.code === "KeyD") {
          this.keys.right = false;
        }
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
          this.keys.run = false;
        }
        if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
          this.keys.jump = false;
        }
      });
    }

    startNewGame(levelIndex = 0) {
      this.lives = 3;
      this.bytesCollected = 0;
      this.score = 0;
      this.loadLevel(levelIndex, false);
      this.state = "PLAYING";
      window.SuperByte.audio.startMusic(this.level.themeIndex);
      this.notifyHUD();
      if (this.callbacks.onLevelStart) {
        this.callbacks.onLevelStart(this.level);
      }
    }

    restartCurrentLevel() {
      this.loadLevel(this.currentLevelIndex, false);
      this.state = "PLAYING";
      window.SuperByte.audio.startMusic(this.level.themeIndex);
      this.notifyHUD();
      if (this.callbacks.onLevelStart) {
        this.callbacks.onLevelStart(this.level);
      }
    }

    nextLevel() {
      const nextIdx = (this.currentLevelIndex + 1) % window.SuperByte.LEVELS.length;
      this.loadLevel(nextIdx, false);
      this.state = "PLAYING";
      window.SuperByte.audio.startMusic(this.level.themeIndex);
      this.notifyHUD();
      if (this.callbacks.onLevelStart) {
        this.callbacks.onLevelStart(this.level);
      }
    }

    togglePause() {
      if (this.state === "PLAYING") {
        this.state = "PAUSED";
        window.SuperByte.audio.uiClick();
        if (this.callbacks.onPauseChange) this.callbacks.onPauseChange(true);
      } else if (this.state === "PAUSED") {
        this.state = "PLAYING";
        window.SuperByte.audio.uiClick();
        if (this.callbacks.onPauseChange) this.callbacks.onPauseChange(false);
      }
    }

    loadLevel(index, previewOnly = false) {
      this.currentLevelIndex = index;
      const template = window.SuperByte.LEVELS[index];
      // Deep clone level data so blocks/coins/enemies reset cleanly
      this.level = JSON.parse(JSON.stringify(template));

      this.player = {
        x: this.level.spawn.x,
        y: this.level.spawn.y,
        w: 34,
        h: 38,
        vx: 0,
        vy: 0,
        onGround: false,
        coyoteTimer: 0,
        jumpBuffer: 0,
        facingLeft: false,
        animState: "idle",
        invulnTimer: 0,
        hurtTimer: 0,
        dead: false,
        deadTimer: 0,
        ridingPlatform: null
      };

      // Initialize enemies
      this.enemies = this.level.enemies.map((e) => ({
        ...e,
        w: 36,
        h: 36,
        vx: e.speed,
        vy: 0,
        squished: false,
        removeTimer: 0,
        chasing: false,
        phasedIn: true,
        phaseTimer: Math.random() * 2
      }));

      this.particles = [];
      this.floatingTexts = [];
      this.camera.x = 0;
      this.camera.y = 0;

      if (!previewOnly) {
        this.notifyHUD();
      }
    }

    respawnPlayerAfterFallOrDeath() {
      this.player.x = this.level.spawn.x;
      this.player.y = this.level.spawn.y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.dead = false;
      this.player.hurtTimer = 0;
      this.player.invulnTimer = 1.6;
      this.player.animState = "idle";
      this.camera.x = 0;
    }

    notifyHUD() {
      if (this.callbacks.onHUDUpdate) {
        this.callbacks.onHUDUpdate({
          lives: this.lives,
          maxLives: this.maxLives,
          bytes: this.bytesCollected,
          score: this.score,
          levelNumber: this.level.id,
          levelName: this.level.name
        });
      }
    }

    spawnParticles(x, y, color, count = 10, speed = 160) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const mag = (0.3 + Math.random() * 0.7) * speed;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * mag,
          vy: Math.sin(angle) * mag - 40,
          size: 3 + Math.floor(Math.random() * 4),
          color,
          life: 0.45 + Math.random() * 0.3,
          maxLife: 0.75
        });
      }
    }

    spawnFloatingText(x, y, text, color = "#ffd166") {
      this.floatingTexts.push({
        x,
        y,
        text,
        color,
        life: 0.85
      });
    }

    getSolidColliders() {
      const solids = [...this.level.platforms];
      for (const b of this.level.blocks) {
        solids.push(b);
      }
      for (const mp of this.level.movingPlatforms) {
        solids.push(mp);
      }
      return solids;
    }

    triggerBlockHit(block) {
      block.bumpOffset = -8;
      block.bumpVel = 60;

      if (block.type === "surprise" && !block.used) {
        block.used = true;
        window.SuperByte.audio.spawnReward();

        if (block.reward === "heart") {
          // Spawn a collectible Extra Life Heart above the block
          this.level.bytes.push({
            x: block.x + 8,
            y: block.y - 32,
            w: 24,
            h: 24,
            kind: "heart",
            collected: false,
            phase: 0
          });
          this.spawnFloatingText(block.x + 6, block.y - 16, "¡VIDA +1!", "#ff2a85");
        } else {
          // Instant Byte reward + popup
          this.bytesCollected += 1;
          this.score += 150;
          window.SuperByte.audio.collectByte();
          this.spawnParticles(block.x + block.w / 2, block.y, "#ffd166", 12, 180);
          this.spawnFloatingText(block.x + 8, block.y - 14, "+1 BYTE", "#ffd166");
          this.notifyHUD();
        }
      } else {
        window.SuperByte.audio.hitBlock();
        this.spawnParticles(block.x + block.w / 2, block.y + block.h, "#00f5d4", 5, 90);
      }
    }

    damagePlayer(instantKill = false) {
      const p = this.player;
      if (p.dead) return;
      if (!instantKill && p.invulnTimer > 0) return;

      this.lives = Math.max(0, this.lives - 1);
      this.notifyHUD();
      this.spawnParticles(p.x + p.w / 2, p.y + p.h / 2, "#ff3355", 16, 200);

      if (this.lives <= 0 || instantKill) {
        p.dead = true;
        p.deadTimer = 1.15;
        p.vy = -420;
        p.vx = 0;
        p.animState = "dead";
        window.SuperByte.audio.playerDie();
      } else {
        p.hurtTimer = 0.35;
        p.invulnTimer = 1.75;
        p.vy = -340;
        p.vx = p.facingLeft ? 220 : -220;
        p.animState = "hurt";
        window.SuperByte.audio.playerHurt();
        this.spawnFloatingText(p.x, p.y - 10, "-1 VIDA", "#ff3355");
      }
    }

    update(dt) {
      this.frameTick++;

      // In MENU state, slowly pan camera across Level 1 as a live background demo
      if (this.state === "MENU") {
        this.camera.x = (Math.sin(this.frameTick * 0.004) * 0.5 + 0.5) * 900;
        return;
      }

      if (this.state !== "PLAYING") return;

      const p = this.player;

      // 1. Update Moving Platforms
      for (const mp of this.level.movingPlatforms) {
        const prevX = mp.x;
        const prevY = mp.y;
        mp.x += mp.vx * dt;
        mp.y += mp.vy * dt;

        if (mp.x < mp.minX) {
          mp.x = mp.minX;
          mp.vx = Math.abs(mp.vx);
        } else if (mp.x > mp.maxX) {
          mp.x = mp.maxX;
          mp.vx = -Math.abs(mp.vx);
        }

        if (mp.y < mp.minY) {
          mp.y = mp.minY;
          mp.vy = Math.abs(mp.vy);
        } else if (mp.y > mp.maxY) {
          mp.y = mp.maxY;
          mp.vy = -Math.abs(mp.vy);
        }

        mp.dx = mp.x - prevX;
        mp.dy = mp.y - prevY;
      }

      // 2. Update Block Bump Animations
      for (const b of this.level.blocks) {
        if (b.bumpOffset < 0) {
          b.bumpOffset += b.bumpVel * dt;
          if (b.bumpOffset >= 0) {
            b.bumpOffset = 0;
            b.bumpVel = 0;
          }
        }
      }

      // 3. Handle Player Death State
      if (p.dead) {
        p.vy += 1250 * dt;
        p.y += p.vy * dt;
        p.deadTimer -= dt;
        if (p.deadTimer <= 0) {
          if (this.lives > 0) {
            this.respawnPlayerAfterFallOrDeath();
          } else {
            this.state = "GAME_OVER";
            window.SuperByte.audio.stopMusic();
            if (this.callbacks.onGameOver) {
              this.callbacks.onGameOver({
                score: this.score,
                bytes: this.bytesCollected,
                levelName: this.level.name
              });
            }
          }
        }
        this.keys.jumpJustPressed = false;
        return;
      }

      // 4. Timers (Invulnerability, Hurt, Coyote, Jump Buffer)
      if (p.invulnTimer > 0) p.invulnTimer -= dt;
      if (p.hurtTimer > 0) p.hurtTimer -= dt;

      if (p.onGround) {
        p.coyoteTimer = 0.11;
      } else if (p.coyoteTimer > 0) {
        p.coyoteTimer -= dt;
      }

      if (this.keys.jumpJustPressed) {
        p.jumpBuffer = 0.12;
        this.keys.jumpJustPressed = false;
      } else if (p.jumpBuffer > 0) {
        p.jumpBuffer -= dt;
      }

      //Carry player with moving platform
      if (p.ridingPlatform) {
        p.x += p.ridingPlatform.dx || 0;
        p.y += p.ridingPlatform.dy || 0;
      }

      // 5. Horizontal Movement Physics
      const maxSpeed = this.keys.run ? 345 : 225;
      const accel = p.onGround ? 1850 : 1250;
      const friction = p.onGround ? 1650 : 450;

      if (p.hurtTimer <= 0) {
        if (this.keys.left && !this.keys.right) {
          p.vx -= accel * dt;
          p.facingLeft = true;
        } else if (this.keys.right && !this.keys.left) {
          p.vx += accel * dt;
          p.facingLeft = false;
        } else {
          if (p.vx > 0) {
            p.vx = Math.max(0, p.vx - friction * dt);
          } else if (p.vx < 0) {
            p.vx = Math.min(0, p.vx + friction * dt);
          }
        }
        p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
      }

      // Sprint dust particles
      if (p.onGround && this.keys.run && Math.abs(p.vx) > 260 && this.frameTick % 5 === 0) {
        this.spawnParticles(
          p.facingLeft ? p.x + p.w : p.x,
          p.y + p.h - 4,
          "#00f5d4",
          2,
          50
        );
      }

      // 6. Jump Execution & Variable Jump Height
      if (p.jumpBuffer > 0 && p.coyoteTimer > 0) {
        const runBoost = Math.abs(p.vx) > 260 ? -35 : 0;
        p.vy = -575 + runBoost;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        p.ridingPlatform = null;
        window.SuperByte.audio.jump();
        this.spawnParticles(p.x + p.w / 2, p.y + p.h, "#4cc9f0", 6, 95);
      }

      // Cut jump velocity when releasing spacebar early for precise platforming
      if (!this.keys.jump && p.vy < -220) {
        p.vy *= 0.85;
      }

      // Gravity
      p.vy += 1450 * dt;
      if (p.vy > 780) p.vy = 780;

      const solids = this.getSolidColliders();

      // 7. Horizontal Collision Resolution
      p.x += p.vx * dt;
      if (p.x < 0) {
        p.x = 0;
        p.vx = 0;
      }
      if (p.x + p.w > this.level.worldWidth) {
        p.x = this.level.worldWidth - p.w;
        p.vx = 0;
      }

      for (const s of solids) {
        if (aabbOverlap(p, s)) {
          if (p.vx > 0) {
            p.x = s.x - p.w;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = s.x + s.w;
            p.vx = 0;
          }
        }
      }

      // 8. Vertical Collision Resolution
      p.y += p.vy * dt;
      p.onGround = false;
      p.ridingPlatform = null;

      for (const s of solids) {
        if (aabbOverlap(p, s)) {
          if (p.vy > 0) {
            p.y = s.y - p.h;
            p.vy = 0;
            p.onGround = true;
            if (s.minX !== undefined) {
              p.ridingPlatform = s;
            }
          } else if (p.vy < 0) {
            p.y = s.y + s.h;
            p.vy = 40;
            if (s.type === "brick" || s.type === "surprise") {
              this.triggerBlockHit(s);
            } else {
              window.SuperByte.audio.hitBlock();
            }
          }
        }
      }

      // 9. Determine Player Animation State (7 distinct states)
      if (p.dead) {
        p.animState = "dead";
      } else if (p.hurtTimer > 0) {
        p.animState = "hurt";
      } else if (!p.onGround) {
        p.animState = p.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(p.vx) > 245 && this.keys.run) {
        p.animState = "run";
      } else if (Math.abs(p.vx) > 15) {
        p.animState = "walk";
      } else {
        p.animState = "idle";
      }

      // 10. Pit Fall Check
      if (p.y > this.level.worldHeight + 40) {
        this.damagePlayer(true);
        return;
      }

      // 11. Hazards Check (Lasers / Spikes)
      for (const hz of this.level.hazards) {
        if (aabbOverlap(p, hz)) {
          this.damagePlayer(false);
          break;
        }
      }

      // 12. Collectible Bytes & Hearts
      for (const item of this.level.bytes) {
        if (item.collected) continue;
        if (aabbOverlap(p, item)) {
          item.collected = true;
          if (item.kind === "heart") {
            this.lives = Math.min(this.maxLives, this.lives + 1);
            this.score += 500;
            window.SuperByte.audio.collectHeart();
            this.spawnParticles(item.x + 12, item.y + 12, "#ff2a85", 16, 180);
            this.spawnFloatingText(item.x, item.y - 8, "+1 VIDA", "#ff2a85");
          } else {
            this.bytesCollected += 1;
            this.score += 100;
            window.SuperByte.audio.collectByte();
            this.spawnParticles(item.x + 12, item.y + 12, "#ffd166", 10, 140);
            this.spawnFloatingText(item.x, item.y - 8, "+100", "#00f5d4");
          }
          this.notifyHUD();
        }
      }

      // 13. Update Enemies & Handle Stomp vs Lateral Damage
      for (const enemy of this.enemies) {
        if (enemy.squished) {
          enemy.removeTimer -= dt;
          continue;
        }

        if (enemy.type === "virus") {
          const distX = p.x + p.w / 2 - (enemy.x + enemy.w / 2);
          const distY = Math.abs(p.y - enemy.y);
          if (Math.abs(distX) < 230 && distY < 90) {
            enemy.chasing = true;
            enemy.vx = (distX > 0 ? 1 : -1) * (enemy.speed * 1.48);
          } else {
            enemy.chasing = false;
            if (Math.abs(enemy.vx) > enemy.speed) {
              enemy.vx = (enemy.vx > 0 ? 1 : -1) * enemy.speed;
            }
          }
        } else if (enemy.type === "glitch") {
          enemy.phaseTimer += dt;
          if (enemy.phaseTimer >= 2.1) {
            enemy.phaseTimer = 0;
            enemy.phasedIn = !enemy.phasedIn;
          }
        }

        enemy.x += enemy.vx * dt;
        if (enemy.x <= enemy.minX) {
          enemy.x = enemy.minX;
          enemy.vx = Math.abs(enemy.vx);
        } else if (enemy.x + enemy.w >= enemy.maxX) {
          enemy.x = enemy.maxX - enemy.w;
          enemy.vx = -Math.abs(enemy.vx);
        }

        // Check collision with Byte
        if (enemy.type === "glitch" && !enemy.phasedIn) {
          continue; // Intangible while phased out
        }

        if (aabbOverlap(p, enemy)) {
          const playerBottom = p.y + p.h;
          const enemyTop = enemy.y;
          const isStomp = p.vy > 0 && playerBottom - p.vy * dt <= enemyTop + 18;

          if (isStomp) {
            // Defeat enemy by stomping!
            enemy.squished = true;
            enemy.removeTimer = 0.45;
            p.vy = -440; // Rebound upward
            const pts = enemy.type === "glitch" ? 400 : enemy.type === "virus" ? 350 : 200;
            this.score += pts;
            window.SuperByte.audio.stompEnemy();
            this.spawnParticles(
              enemy.x + enemy.w / 2,
              enemy.y + enemy.h / 2,
              "#ff2a85",
              14,
              190
            );
            this.spawnFloatingText(enemy.x, enemy.y - 10, `+${pts}`, "#ffd166");
            this.notifyHUD();
          } else {
            this.damagePlayer(false);
          }
        }
      }

      this.enemies = this.enemies.filter((e) => !e.squished || e.removeTimer > 0);

      // 14. Exit Portal Check (Level Complete!)
      if (aabbOverlap(p, this.level.portal)) {
        this.state = "LEVEL_WIN";
        this.score += 1000;
        window.SuperByte.audio.stopMusic();
        window.SuperByte.audio.levelWin();
        this.notifyHUD();
        if (this.callbacks.onLevelWin) {
          this.callbacks.onLevelWin({
            levelId: this.level.id,
            levelName: this.level.name,
            bytes: this.bytesCollected,
            score: this.score,
            isFinalLevel: this.currentLevelIndex === window.SuperByte.LEVELS.length - 1
          });
        }
      }

      // 15. Smooth Camera Follow
      const targetCamX = p.x + p.w / 2 - INTERNAL_W * 0.36;
      const maxCamX = Math.max(0, this.level.worldWidth - INTERNAL_W);
      this.camera.x += (Math.max(0, Math.min(maxCamX, targetCamX)) - this.camera.x) * 0.14;

      // 16. Update Particles & Floating Texts
      for (const pt of this.particles) {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 380 * dt;
        pt.life -= dt;
      }
      this.particles = this.particles.filter((pt) => pt.life > 0);

      for (const ft of this.floatingTexts) {
        ft.y -= 42 * dt;
        ft.life -= dt;
      }
      this.floatingTexts = this.floatingTexts.filter((ft) => ft.life > 0);
    }

    // ==================== RENDER PIPELINE ====================

    drawParallaxBackground(ctx, pal) {
      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_H);
      skyGrad.addColorStop(0, pal.skyTop);
      skyGrad.addColorStop(1, pal.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);

      // Twinkling digital stars / nodes
      for (const node of this.bgNodes) {
        const alpha = 0.35 + 0.55 * Math.sin(this.frameTick * 0.05 + node.phase);
        ctx.fillStyle = `rgba(0, 245, 212, ${alpha.toFixed(2)})`;
        ctx.fillRect(node.x, node.y, node.size, node.size);
      }

      // Far Parallax Layer (0.18x camera speed): Cyber Peaks / Towers
      const farOffset = -(this.camera.x * 0.18) % 320;
      ctx.fillStyle = pal.farHills;
      for (let x = farOffset - 320; x < INTERNAL_W + 320; x += 320) {
        ctx.beginPath();
        ctx.moveTo(x, INTERNAL_H);
        ctx.lineTo(x + 60, 250);
        ctx.lineTo(x + 150, 310);
        ctx.lineTo(x + 240, 210);
        ctx.lineTo(x + 320, INTERNAL_H);
        ctx.closePath();
        ctx.fill();
      }

      // Mid Parallax Layer (0.42x camera speed): World-themed Silhouettes
      const midOffset = -(this.camera.x * 0.42) % 240;
      ctx.fillStyle = pal.nearHills;
      for (let x = midOffset - 240; x < INTERNAL_W + 240; x += 240) {
        // Stepped digital monoliths / cyber structures
        ctx.fillRect(x + 20, 310, 64, 230);
        ctx.fillRect(x + 36, 280, 32, 30);
        ctx.fillRect(x + 120, 345, 84, 195);

        // Glowing windows / circuit lines on monoliths
        ctx.fillStyle = pal.gridAccent;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(x + 48, 300, 8, 160);
        ctx.fillRect(x + 140, 365, 44, 6);
        ctx.fillRect(x + 140, 390, 44, 6);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = pal.nearHills;
      }
    }

    drawWorldElements(ctx, pal) {
      // 1. Draw Ground, Suspended Platforms, Pipes, and Steps
      for (const plat of this.level.platforms) {
        if (
          plat.x + plat.w < this.camera.x - 60 ||
          plat.x > this.camera.x + INTERNAL_W + 60
        ) {
          continue;
        }

        if (plat.kind === "ground") {
          ctx.fillStyle = pal.groundBody;
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          // Neon top crust
          ctx.fillStyle = pal.groundTop;
          ctx.fillRect(plat.x, plat.y, plat.w, 8);

          // Circuit grid pattern inside ground
          ctx.fillStyle = pal.groundDetail;
          for (let gx = plat.x + 12; gx < plat.x + plat.w - 16; gx += 40) {
            ctx.fillRect(gx, plat.y + 18, 22, 6);
            ctx.fillRect(gx + 8, plat.y + 24, 6, 28);
          }
        } else if (plat.kind === "platform") {
          ctx.fillStyle = pal.platformBody;
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = pal.platformTop;
          ctx.fillRect(plat.x, plat.y, plat.w, 6);
          ctx.strokeStyle = "#070913";
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
        } else if (plat.kind === "pipe") {
          // Technological Data Conduit / Pipe
          ctx.fillStyle = pal.pipeColor;
          ctx.fillRect(plat.x + 4, plat.y + 16, plat.w - 8, plat.h - 16);
          // Pipe Lip
          ctx.fillRect(plat.x, plat.y, plat.w, 18);
          // Highlights
          ctx.fillStyle = pal.pipeHighlight;
          ctx.fillRect(plat.x + 10, plat.y + 2, 8, plat.h - 4);
          ctx.strokeStyle = "#070913";
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x, plat.y, plat.w, 18);
          ctx.strokeRect(plat.x + 4, plat.y + 18, plat.w - 8, plat.h - 18);
        } else if (plat.kind === "step") {
          ctx.fillStyle = pal.platformBody;
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = pal.gridAccent;
          ctx.fillRect(plat.x, plat.y, plat.w, 5);
          ctx.strokeStyle = "#070913";
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
        }
      }

      // 2. Draw Moving Platforms
      for (const mp of this.level.movingPlatforms) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(mp.x, mp.y, mp.w, 6);
        // Thruster glow under moving platform
        ctx.fillStyle = "#00f5d4";
        ctx.fillRect(mp.x + 12, mp.y + mp.h, 16, 4);
        ctx.fillRect(mp.x + mp.w - 28, mp.y + mp.h, 16, 4);
      }

      // 3. Draw Interactive Blocks (Bricks & Surprise Reward Blocks)
      for (const b of this.level.blocks) {
        const by = b.y + (b.bumpOffset || 0);
        if (b.type === "surprise") {
          ctx.fillStyle = b.used ? "#334155" : "#ffd166";
          ctx.fillRect(b.x, by, b.w, b.h);
          ctx.strokeStyle = "#070913";
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x + 1, by + 1, b.w - 2, b.h - 2);

          if (!b.used) {
            ctx.fillStyle = "#070913";
            ctx.font = "900 20px 'Courier New', monospace";
            ctx.textAlign = "center";
            ctx.fillText("?", b.x + b.w / 2, by + 27);
          }
        } else {
          // Cyber Brick
          ctx.fillStyle = "#3a0ca3";
          ctx.fillRect(b.x, by, b.w, b.h);
          ctx.fillStyle = "#4cc9f0";
          ctx.fillRect(b.x + 4, by + 4, b.w - 8, 5);
          ctx.fillRect(b.x + 4, by + 20, (b.w - 12) / 2, 12);
          ctx.fillRect(b.x + b.w / 2 + 2, by + 20, (b.w - 12) / 2, 12);
          ctx.strokeStyle = "#070913";
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x + 1, by + 1, b.w - 2, b.h - 2);
        }
      }

      // 4. Draw Hazards (Laser Spikes)
      for (const hz of this.level.hazards) {
        ctx.fillStyle = "#ff2a85";
        const spikeCount = Math.floor(hz.w / 16);
        for (let i = 0; i < spikeCount; i++) {
          const sx = hz.x + i * 16;
          ctx.beginPath();
          ctx.moveTo(sx, hz.y + hz.h);
          ctx.lineTo(sx + 8, hz.y);
          ctx.lineTo(sx + 16, hz.y + hz.h);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 5. Draw Collectible Bytes & Hearts
      for (const item of this.level.bytes) {
        if (!item.collected) {
          window.SuperByte.sprites.drawByteCoin(ctx, item, this.frameTick);
        }
      }

      // 6. Draw Exit Portal
      window.SuperByte.sprites.drawPortal(ctx, this.level.portal, this.frameTick);

      // 7. Draw Enemies
      for (const enemy of this.enemies) {
        window.SuperByte.sprites.drawEnemy(ctx, enemy, this.frameTick);
      }

      // 8. Draw Byte (Main Character)
      const p = this.player;
      window.SuperByte.sprites.drawByte(
        ctx,
        p.x,
        p.y,
        p.w,
        p.h,
        p.animState,
        this.frameTick,
        p.facingLeft,
        p.invulnTimer > 0
      );

      // 9. Draw Particles
      for (const pt of this.particles) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }

      // 10. Draw Floating Score/Status Popups
      ctx.font = "900 15px 'Courier New', monospace";
      ctx.textAlign = "center";
      for (const ft of this.floatingTexts) {
        ctx.fillStyle = "#000000";
        ctx.fillText(ft.text, ft.x + 14, ft.y + 2);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x + 12, ft.y);
      }
    }

    render() {
      const ctx = this.ctx;
      const pal = this.level.palette;

      this.drawParallaxBackground(ctx, pal);

      ctx.save();
      ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));
      this.drawWorldElements(ctx, pal);
      ctx.restore();
    }

    loop(now) {
      const dt = Math.min(0.033, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;

      this.update(dt);
      this.render();

      requestAnimationFrame(this.loop);
    }
  }

  window.SuperByte.Engine = SuperByteEngine;
})();
