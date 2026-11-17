(function () {
  window.SuperByte = window.SuperByte || {};

  // Helper to draw a 2D pixel matrix onto a canvas context
  function drawPixelMatrix(ctx, matrix, palette, x, y, pixelSize = 2, flipX = false) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    ctx.save();
    if (flipX) {
      ctx.translate(x + cols * pixelSize, y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x, y);
    }

    for (let r = 0; r < rows; r++) {
      const rowStr = matrix[r];
      for (let c = 0; c < cols; c++) {
        const ch = rowStr[c];
        if (ch !== "." && palette[ch]) {
          ctx.fillStyle = palette[ch];
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    ctx.restore();
  }

  const BYTE_PALETTE = {
    "K": "#080b1a", // dark outline
    "B": "#1e64ff", // cobalt cyber helmet/suit
    "L": "#4cc9f0", // light cyan armor highlight
    "C": "#00f5d4", // neon cyan visor / core
    "W": "#ffffff", // white specular shine
    "Y": "#ffd166", // gold antenna tip / belt buckle
    "M": "#ff2a85", // magenta scarf / boots
    "D": "#14213d", // dark visor interior
    "R": "#ff3355", // damage / thruster flame
    "O": "#ff9f1c"  // thruster orange core
  };

  // 16x16 Pixel Art Frames for BYTE (7 distinct animation states)
  const BYTE_FRAMES = {
    idle1: [
      ".......YY.......",
      ".......CC.......",
      "....KKKKKKKK....",
      "...KLLLLBBBBK...",
      "..KLBBBBBBBBBK..",
      "..KBDDDDDDDDBK..",
      "..KBDCCWWCCDBK..",
      "..KBDDDDDDDDBK..",
      "...KKKKKKKKKK...",
      "...KMMMMMMMMK...",
      "..KLBBBBYCBBBK..",
      "..K.KBBBBBBK.K..",
      "....KBBBBBBK....",
      "....KMM..MMK....",
      "...KMMK..KMMK...",
      "...KKKK..KKKK..."
    ],
    idle2: [
      ".......WW.......",
      ".......YY.......",
      ".......CC.......",
      "....KKKKKKKK....",
      "...KLLLLBBBBK...",
      "..KLBBBBBBBBBK..",
      "..KBDDDDDDDDBK..",
      "..KBDCCWWCCDBK..",
      "..KBDDDDDDDDBK..",
      "...KKKKKKKKKK...",
      "..KMMMMMMMMMMK..",
      "..KLBBBBYCBBBK..",
      "....KBBBBBBK....",
      "....KMM..MMK....",
      "...KMMK..KMMK...",
      "...KKKK..KKKK..."
    ],
    walk1: [
      ".......YY.......",
      ".......CC.......",
      "....KKKKKKKK....",
      "...KLLLLBBBBK...",
      "..KLBBBBBBBBBK..",
      "..KBDDDDDDDDBK..",
      "..KBDCCWWCCDBK..",
      "..KBDDDDDDDDBK..",
      "...KKKKKKKKKK...",
      "..MMKMMMMMMK....",
      "...KLBBBYCBBK...",
      "...K.KBBBBK.K...",
      "....KMM..MMK....",
      "...KMMK...KMMK..",
      "..KKKK....KKKK..",
      "................"
    ],
    walk2: [
      ".......YY.......",
      ".......CC.......",
      "....KKKKKKKK....",
      "...KLLLLBBBBK...",
      "..KLBBBBBBBBBK..",
      "..KBDDDDDDDDBK..",
      "..KBDCCWWCCDBK..",
      "..KBDDDDDDDDBK..",
      "...KKKKKKKKKK...",
      "...KMMMMMMMMK...",
      "...KLBBBYCBBK...",
      "....KBBBBBBK....",
      "....KBBBBBBK....",
      "....KMM..MMK....",
      "....KMMK.KMMK...",
      "....KKKK.KKKK..."
    ],
    run1: [
      "........YY......",
      "........CC......",
      ".....KKKKKKKK...",
      "....KLLLLBBBBK..",
      "...KLBBBBBBBBBK.",
      "...KBDDDDDDDDBK.",
      "...KBDCCWWCCDBK.",
      "...KBDDDDDDDDBK.",
      ".MMMKKKKKKKKKK..",
      "MMM.KMMMMMMMMK..",
      "....KLBBBYCBBBK.",
      "...K..KBBBBBBK..",
      ".....KMM...MMK..",
      "...KMMK.....KMMK",
      "...KKKK.....KKKK",
      "................"
    ],
    run2: [
      "........WW......",
      "........CC......",
      ".....KKKKKKKK...",
      "....KLLLLBBBBK..",
      "...KLBBBBBBBBBK.",
      "...KBDDDDDDDDBK.",
      "...KBDCCWWCCDBK.",
      "...KBDDDDDDDDBK.",
      "MMMMKKKKKKKKKK..",
      ".MM.KMMMMMMMMK..",
      "...K.KLBBYCBBK..",
      ".....KBBBBBBK...",
      "....KMM..KMMK...",
      "...KMMK...KKKK..",
      "...KKKK.........",
      "................"
    ],
    jump: [
      ".......YY.......",
      ".......CC.......",
      "....KKKKKKKK....",
      "...KLLLLBBBBK...",
      "..KLBBBBBBBBBK..",
      "..KBDDDDDDDDBK..",
      "..KBDCCWWCCDBK..",
      "..KBDDDDDDDDBK..",
      "..K.KKKKKKKK.K..",
      ".KLKMMMMMMMMKLK.",
      "..KKLBBBYCBBKK..",
      "....KBBBBBBK....",
      "...KMMK..KMMK...",
      "...KKKK..KKKK...",
      "...ROO....OOR...",
      "....R......R...."
    ],
    fall: [
      ".......YY.......",
      ".......CC.......",
      ".MM.KKKKKKKK.MM.",
      "..MKLLLLBBBBKM..",
      "..KLBBBBBBBBBK..",
      "..KBDDDDDDDDBK..",
      "..KBDCCWWCCDBK..",
      "..KBDDDDDDDDBK..",
      ".KL.KKKKKKKK.LK.",
      ".K..KMMMMMMK..K.",
      "....KLBBYCBBK...",
      "....KBBBBBBK....",
      "...KMMK..KMMK...",
      "..KKKK....KKKK..",
      "................",
      "................"
    ],
    hurt: [
      ".......RR.......",
      "....R..WW..R....",
      "....KKKKKKKK....",
      "...KRRRRWWWWK...",
      "..KRWWWWWWWWRK..",
      "..KRDDDDDDDDRK..",
      "..KRDWW..WWDRK..",
      "..KRDDDDDDDDRK..",
      "..R.KKKKKKKK.R..",
      "...KRRRRRRRRK...",
      "..KRWWWWYRWWWK..",
      "....KRRRRRRK....",
      "...KRRK..KRRK...",
      "..KKKK....KKKK..",
      "................",
      "................"
    ],
    dead: [
      "..R....YY....R..",
      "...C...RR...C...",
      "....KKKKKKKK....",
      "...KRRRRRRRRK...",
      "..KRDDDDDDDDRK..",
      "..KRDXX..XXDRK..",
      "..KRDDDDDDDDRK..",
      "...KKKKKKKKKK...",
      "..R.KMMMMMMK.R..",
      "....KRRRRRRK....",
      "...KRR....RRK...",
      "..C..........C..",
      "....R......R....",
      "................",
      "................",
      "................"
    ]
  };

  // Enemy 1: Bug Walker (Cyber Beetle)
  const BUG_PALETTE = {
    "K": "#070913",
    "R": "#ff2a85",
    "P": "#b5179e",
    "C": "#00f5d4",
    "Y": "#ffd166",
    "W": "#ffffff"
  };

  const BUG_FRAMES = {
    walk1: [
      "................",
      "................",
      "....YY....YY....",
      ".....K....K.....",
      "....KKKKKKKK....",
      "...KRRRRRRRRK...",
      "..KRRPPRRPPRRK..",
      ".KRPPKKKKKKPPRK.",
      ".KRPKCCWWCCKPRK.",
      ".KRRRRRRRRRRRRK.",
      "..KKKKKKKKKKKK..",
      "...K.K....K.K...",
      "..K..K....K..K..",
      ".K...K....K...K.",
      "................",
      "................"
    ],
    walk2: [
      "................",
      "................",
      "....YY....YY....",
      ".....K....K.....",
      "....KKKKKKKK....",
      "...KRRRRRRRRK...",
      "..KRRPPRRPPRRK..",
      ".KRPPKKKKKKPPRK.",
      ".KRPKCCWWCCKPRK.",
      ".KRRRRRRRRRRRRK.",
      "..KKKKKKKKKKKK..",
      "..K..K....K..K..",
      "...K..K..K..K...",
      "....K..KK..K....",
      "................",
      "................"
    ],
    squished: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "....KKKKKKKK....",
      "..KKRRRRRRRRKK..",
      ".KRRKCCWWCCKRRK.",
      ".KKKKKKKKKKKKKK.",
      ".K.K........K.K.",
      "................",
      "................",
      "................"
    ]
  };

  // Enemy 2: Virus Bot (Pursuer Drone)
  const VIRUS_PALETTE = {
    "K": "#070913",
    "S": "#4361ee",
    "L": "#4cc9f0",
    "R": "#ff3355",
    "Y": "#ffd166",
    "W": "#ffffff"
  };

  const VIRUS_FRAMES = {
    hover1: [
      ".......RR.......",
      "......KRRK......",
      "....KKKKKKKK....",
      "...KLLLLSSSSK...",
      "..KLSSSSSSSSSK..",
      ".KLSKKKKKKKKSLK.",
      ".KLSKRRWWRRKSLK.",
      ".KLSKKKKKKKKSLK.",
      "..KLSSSSSSSSSK..",
      "...KKKKKKKKKK...",
      "..K.KYYYYYYK.K..",
      ".K...KRRRRK...K.",
      "......R..R......",
      "................",
      "................",
      "................"
    ],
    hover2: [
      ".......WW.......",
      "......KRRK......",
      "....KKKKKKKK....",
      "...KLLLLSSSSK...",
      "..KLSSSSSSSSSK..",
      ".KLSKKKKKKKKSLK.",
      ".KLSKWRRRRwkSLK.".replace("wk", "WK"),
      ".KLSKKKKKKKKSLK.",
      "..KLSSSSSSSSSK..",
      "...KKKKKKKKKK...",
      ".K..KYYYYYYK..K.",
      ".....KRRRRK.....",
      ".....R.YY.R.....",
      ".......RR.......",
      "................",
      "................"
    ]
  };

  // Enemy 3: Glitch (Phasing digital anomaly)
  const GLITCH_PALETTE = {
    "K": "#070913",
    "M": "#ff2a85",
    "C": "#00f5d4",
    "Y": "#ffd166",
    "W": "#ffffff",
    "P": "#7209b7"
  };

  const GLITCH_FRAMES = {
    solid1: [
      "..CC..MMMM..CC..",
      ".C..MMMMMMMM..C.",
      "...MMPPPPPPMM...",
      "..MPPKKKKKKPPM..",
      ".MPPKWW..WWKPPM.",
      ".MPPKCC..CCKPPM.",
      "..MPPPPPPPPPPM..",
      "...MMPPKKPPMM...",
      "..CC.MPPPPM.CC..",
      "...MM.PPPP.MM...",
      "..C..M.PP.M..C..",
      "....M..C...M....",
      "...C........C...",
      "................",
      "................",
      "................"
    ],
    solid2: [
      ".MM...CCCC...MM.",
      "...CCCCCCCCCC...",
      "..CCPPPPPPPPCC..",
      ".CPPKKKKKKKKPPC.",
      "..PPKMM..MMKPP..",
      "..PPKWW..WWKPP..",
      ".CPPPPPPPPPPPPC.",
      "..CCPPKKKKPPCC..",
      ".MM..CPPPPC..MM.",
      "..CC..PPPP..CC..",
      "....C..PP..C....",
      "...M....M...C...",
      "................",
      "................",
      "................",
      "................"
    ]
  };

  const SpriteRenderer = {
    drawByte(ctx, x, y, width, height, state, frameTick, facingLeft, invulnerable) {
      if (invulnerable && Math.floor(frameTick / 4) % 2 === 0 && state !== "hurt") {
        ctx.save();
        ctx.globalAlpha = 0.45;
      }

      let matrix = BYTE_FRAMES.idle1;
      if (state === "dead") {
        matrix = BYTE_FRAMES.dead;
      } else if (state === "hurt") {
        matrix = BYTE_FRAMES.hurt;
      } else if (state === "jump") {
        matrix = BYTE_FRAMES.jump;
      } else if (state === "fall") {
        matrix = BYTE_FRAMES.fall;
      } else if (state === "run") {
        matrix = Math.floor(frameTick / 5) % 2 === 0 ? BYTE_FRAMES.run1 : BYTE_FRAMES.run2;
      } else if (state === "walk") {
        matrix = Math.floor(frameTick / 8) % 2 === 0 ? BYTE_FRAMES.walk1 : BYTE_FRAMES.walk2;
      } else {
        matrix = Math.floor(frameTick / 24) % 2 === 0 ? BYTE_FRAMES.idle1 : BYTE_FRAMES.idle2;
      }

      const pixelSize = width / 16;
      drawPixelMatrix(ctx, matrix, BYTE_PALETTE, Math.round(x), Math.round(y), pixelSize, facingLeft);

      if (invulnerable && Math.floor(frameTick / 4) % 2 === 0 && state !== "hurt") {
        ctx.restore();
      }
    },

    drawEnemy(ctx, enemy, frameTick) {
      const pixelSize = enemy.w / 16;
      const x = Math.round(enemy.x);
      const y = Math.round(enemy.y);

      if (enemy.type === "bug") {
        const mat = enemy.squished
          ? BUG_FRAMES.squished
          : Math.floor(frameTick / 10) % 2 === 0
          ? BUG_FRAMES.walk1
          : BUG_FRAMES.walk2;
        drawPixelMatrix(ctx, mat, BUG_PALETTE, x, y, pixelSize, enemy.vx > 0);
      } else if (enemy.type === "virus") {
        const mat =
          Math.floor(frameTick / 7) % 2 === 0
            ? VIRUS_FRAMES.hover1
            : VIRUS_FRAMES.hover2;
        drawPixelMatrix(ctx, mat, VIRUS_PALETTE, x, y, pixelSize, enemy.vx > 0);

        // Detection aura when chasing player
        if (enemy.chasing && !enemy.squished) {
          ctx.save();
          ctx.strokeStyle = "rgba(255, 51, 85, 0.55)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x + enemy.w / 2, y + enemy.h / 2, enemy.w * 0.68, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else if (enemy.type === "glitch") {
        ctx.save();
        if (!enemy.phasedIn) {
          ctx.globalAlpha = 0.26;
        }
        const jitterX = enemy.phasedIn ? (Math.random() < 0.3 ? (Math.random() > 0.5 ? 2 : -2) : 0) : 0;
        const mat =
          Math.floor(frameTick / 6) % 2 === 0
            ? GLITCH_FRAMES.solid1
            : GLITCH_FRAMES.solid2;
        drawPixelMatrix(ctx, mat, GLITCH_PALETTE, x + jitterX, y, pixelSize, false);
        ctx.restore();
      }
    },

    drawByteCoin(ctx, coin, frameTick) {
      const bob = Math.sin(frameTick * 0.1 + coin.phase) * 3;
      const cx = Math.round(coin.x + coin.w / 2);
      const cy = Math.round(coin.y + coin.h / 2 + bob);
      const scaleX = Math.abs(Math.cos(frameTick * 0.08 + coin.phase));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(Math.max(0.25, scaleX), 1);

      if (coin.kind === "heart") {
        // Extra life Core Heart crystal
        ctx.fillStyle = "#ff2a85";
        ctx.fillRect(-9, -7, 7, 7);
        ctx.fillRect(2, -7, 7, 7);
        ctx.fillRect(-11, -3, 22, 8);
        ctx.fillRect(-8, 5, 16, 4);
        ctx.fillRect(-4, 9, 8, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-6, -4, 3, 3);
      } else {
        // Golden/Cyan Glowing Byte Chip
        ctx.fillStyle = "#00f5d4";
        ctx.fillRect(-9, -11, 18, 22);
        ctx.fillStyle = "#070913";
        ctx.fillRect(-7, -9, 14, 18);
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(-5, -7, 10, 14);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-2, -4, 4, 8);
      }
      ctx.restore();
    },

    drawPortal(ctx, portal, frameTick) {
      const cx = portal.x + portal.w / 2;
      const cy = portal.y + portal.h / 2;

      ctx.save();
      // Pedestal
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(portal.x - 4, portal.y + portal.h - 10, portal.w + 8, 10);
      ctx.fillStyle = "#00f5d4";
      ctx.fillRect(portal.x, portal.y + portal.h - 8, portal.w, 4);

      // Outer Energy Ring
      const pulse = Math.sin(frameTick * 0.12) * 4;
      const grad = ctx.createRadialGradient(
        cx,
        cy - 4,
        4,
        cx,
        cy - 4,
        portal.w * 0.75 + pulse
      );
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.35, "#00f5d4");
      grad.addColorStop(0.7, "#7209b7");
      grad.addColorStop(1, "rgba(114, 9, 183, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy - 4,
        portal.w * 0.58 + pulse * 0.5,
        portal.h * 0.48 + pulse * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Rotating inner digital rings
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy - 4,
        portal.w * 0.3,
        portal.h * 0.32,
        frameTick * 0.05,
        0,
        Math.PI * 1.5
      );
      ctx.stroke();

      ctx.restore();
    }
  };

  window.SuperByte.sprites = SpriteRenderer;
})();
