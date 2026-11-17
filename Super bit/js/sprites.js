/**
 * SUPER BYTE - Generador de Sprites Pixel Art Originales (16x16 / 32x32)
 * Crea texturas pixel art originales para Byte, enemigos, bloques, portales y coleccionables.
 */
class PixelSpriteBank {
  constructor() {
    this.cache = {};
  }

  /**
   * Convierte una matriz ASCII en un HTMLCanvasElement escalado con pixel art nítido
   */
  createMatrixCanvas(matrix, palette, scale = 2) {
    const h = matrix.length;
    const w = matrix[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < h; y++) {
      const row = matrix[y];
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        if (ch !== '.' && palette[ch]) {
          ctx.fillStyle = palette[ch];
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    return canvas;
  }

  initAll() {
    if (this.initialized) return this.cache;

    // Paleta original del héroe tecnológico "BYTE"
    const bytePalette = {
      'C': '#00f5d4', // Antena / Visor brillante cian
      'B': '#00bbf9', // Casco azul eléctrico
      'D': '#0b4f6c', // Sombra de armadura
      'W': '#ffffff', // Brillo ocular
      'K': '#091526', // Pantalla facial oscura
      'Y': '#fee440', // Núcleo de pecho dorado / hebilla
      'R': '#f15bb5', // Bufanda / propulsor magenta
      'S': '#38b000'  // Chispa de energía
    };

    // 1. IDLE 1
    const byteIdle1 = [
      ".......CC.......",
      ".......CC.......",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBKKKKKKBBB..",
      "..BBKCWWWWCKBB..",
      "..BBKCCCCCCKBB..",
      "...BBBBBBBBBB...",
      "..RRRDDDDDDRRR..",
      ".RRRDBBYYBBDRRR.",
      "....DBBYYBBD....",
      "....DDDDDDDD....",
      "....DDD..DDD....",
      "...DDDD..DDDD...",
      "...CCC....CCC...",
      "................"
    ];

    // 2. IDLE 2 (Respiración + antena brillante)
    const byteIdle2 = [
      "......CCCC......",
      ".......CC.......",
      "................",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBKKKKKKBBB..",
      "..BBKCWWWWCKBB..",
      "..BBKCCCCCCKBB..",
      "...BBBBBBBBBB...",
      ".RRRRDDDDDDRRRR.",
      "..RRDBBYYBBDRR..",
      "....DBBYYBBD....",
      "....DDDDDDDD....",
      "....DDD..DDD....",
      "...DDDD..DDDD...",
      "...CCC....CCC..."
    ];

    // 3. WALK 1
    const byteWalk1 = [
      ".......CC.......",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBKKKKKKBBB..",
      "..BBKKCWWWCKBB..",
      "..BBKCCCCCCKBB..",
      "...BBBBBBBBBB...",
      ".RRRRDDDDDD.....",
      "....DBBYYBBD....",
      "...DDBBYYBBDD...",
      "...DDDDDDDDDD...",
      "....DDD...DDD...",
      "...DDD.....DDD..",
      "..CCC.......CCC.",
      "................",
      "................"
    ];

    // 4. WALK 2
    const byteWalk2 = [
      ".......CC.......",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBKKKKKKBBB..",
      "..BBKKCWWWCKBB..",
      "..BBKCCCCCCKBB..",
      "...BBBBBBBBBB...",
      "..RRRDDDDDD.....",
      "....DBBYYBBD....",
      "....DBBYYBBD....",
      "....DDDDDDDD....",
      ".....DDDDDD.....",
      ".....DDD.DDD....",
      "....CCC...CCC...",
      "................",
      "................"
    ];

    // 5. RUN 1 (Inclinado con estela turbo)
    const byteRun1 = [
      "........CC......",
      ".....BBBBBBBB...",
      "....BBBBBBBBBB..",
      "...BBBKKKKKKBBB.",
      "...BBKKCWWWCKBB.",
      "RRRRBKCCCCCCKBB.",
      ".RRRRBBBBBBBB...",
      "..RRRDDDDDDD....",
      "....DDBBYYBBDD..",
      "...DDDBBYYBBDDD.",
      ".....DDDDDDDD...",
      "....DDD....DDD..",
      "..CCCC......CCC.",
      "................",
      "................",
      "................"
    ];

    // 6. RUN 2
    const byteRun2 = [
      "........CC......",
      ".....BBBBBBBB...",
      "....BBBBBBBBBB..",
      "...BBBKKKKKKBBB.",
      "RRRRBBKCWWWCKBB.",
      ".RRRBBKCCCCCCKBB",
      ".....BBBBBBBB...",
      "....DDDDDDDD....",
      "....DDBBYYBBDD..",
      ".....DBBYYBBD...",
      ".....DDDDDDDD...",
      "......DDDDDD....",
      "....CCC...CCCC..",
      "................",
      "................",
      "................"
    ];

    // 7. JUMP (Brazos arriba y propulsores en botas)
    const byteJump = [
      ".......CC.......",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBKKKKKKBBB..",
      "..BBKCWWWWCKBB..",
      "..BBKCCCCCCKBB..",
      ".DD.BBBBBBBB.DD.",
      ".DDD.DDDDDD.DDD.",
      "..RRDBBYYBBDRR..",
      "....DBBYYBBD....",
      "....DDDDDDDD....",
      "...DDD....DDD...",
      "...CCC....CCC...",
      "...YYY....YYY...",
      "....R......R....",
      "................"
    ];

    // 8. FALL (Caída controlada)
    const byteFall = [
      "..RRR..CC..RRR..",
      "...RBBBBBBBBR...",
      "...BBBBBBBBBB...",
      "..BBBKKKKKKBBB..",
      "..BBKCWWWWCKBB..",
      "..BBKCCCCCCKBB..",
      ".DDD.BBBBBB.DDD.",
      "....DDDDDDDD....",
      "....DBBYYBBD....",
      "....DBBYYBBD....",
      "....DDDDDDDD....",
      "...DDD....DDD...",
      "..CCC......CCC..",
      "................",
      "................",
      "................"
    ];

    // 9. HURT (Recibiendo daño eléctrico)
    const byteHurt = [
      "..Y....CC....Y..",
      "...YBBBBBBBBY...",
      "...BBBBBBBBBB...",
      "..BBBRRRRRRBBB..",
      "..BBRWWRRWWRBB..",
      "..BBRRRRRRRRBB..",
      ".Y..BBBBBBBB..Y.",
      "....DDDDDDDD....",
      "..Y.DRRYYRRD.Y..",
      "....DDDDDDDD....",
      "...DDD....DDD...",
      "..CCC......CCC..",
      "................",
      "................",
      "................",
      "................"
    ];

    // 10. DEAD (Desconexión del sistema)
    const byteDead = [
      "................",
      "................",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBKKKKKKBBB..",
      "..BBKR.K..RKBB..",
      "..BBK.R..R.KBB..",
      "..BBKR.K..RKBB..",
      "...BBBBBBBBBB...",
      "....DDDDDDDD....",
      "...DDDDDDDDDD...",
      "..CCC......CCC..",
      "................",
      "................",
      "................",
      "................"
    ];

    this.cache.byte_idle_1 = this.createMatrixCanvas(byteIdle1, bytePalette, 2);
    this.cache.byte_idle_2 = this.createMatrixCanvas(byteIdle2, bytePalette, 2);
    this.cache.byte_walk_1 = this.createMatrixCanvas(byteWalk1, bytePalette, 2);
    this.cache.byte_walk_2 = this.createMatrixCanvas(byteWalk2, bytePalette, 2);
    this.cache.byte_run_1 = this.createMatrixCanvas(byteRun1, bytePalette, 2);
    this.cache.byte_run_2 = this.createMatrixCanvas(byteRun2, bytePalette, 2);
    this.cache.byte_jump = this.createMatrixCanvas(byteJump, bytePalette, 2);
    this.cache.byte_fall = this.createMatrixCanvas(byteFall, bytePalette, 2);
    this.cache.byte_hurt = this.createMatrixCanvas(byteHurt, bytePalette, 2);
    this.cache.byte_dead = this.createMatrixCanvas(byteDead, bytePalette, 2);

    // ==================== ENEMIGO 1: BUG WALKER ====================
    const bugPalette = {
      'R': '#ff3366',
      'D': '#9e0031',
      'Y': '#fee440',
      'W': '#ffffff',
      'K': '#111122'
    };
    const bug1 = [
      "................",
      "....Y......Y....",
      ".....Y....Y.....",
      "....RRRRRRRR....",
      "...RRRRRRRRRR...",
      "..RRKWRRRRWRKR..",
      "..RRKKRRRRKKRR..",
      "..RRRRRRRRRRRR..",
      ".DDDDDDDDDDDDDD.",
      "..DDDDDDDDDDDD..",
      "...DD..DD..DD...",
      "..DD...DD...DD..",
      ".KK....KK....KK.",
      "................",
      "................",
      "................"
    ];
    const bug2 = [
      "................",
      "...Y........Y...",
      "....Y......Y....",
      "....RRRRRRRR....",
      "...RRRRRRRRRR...",
      "..RRKWRRRRWRKR..",
      "..RRKKRRRRKKRR..",
      "..RRRRRRRRRRRR..",
      ".DDDDDDDDDDDDDD.",
      "..DDDDDDDDDDDD..",
      "..DD...DD...DD..",
      "...DD..DD..DD...",
      "...KK..KK..KK...",
      "................",
      "................",
      "................"
    ];
    this.cache.bug_1 = this.createMatrixCanvas(bug1, bugPalette, 2);
    this.cache.bug_2 = this.createMatrixCanvas(bug2, bugPalette, 2);

    // ==================== ENEMIGO 2: VIRUS BOT (Persigue al jugador) ====================
    const virusPalette = {
      'P': '#9b5de5',
      'D': '#5a189a',
      'G': '#00f5d4',
      'R': '#ff0055',
      'W': '#ffffff'
    };
    const virus1 = [
      ".......RR.......",
      "......RRRR......",
      ".......PP.......",
      "....PPPPPPPP....",
      "...PPPPPPPPPP...",
      "..PPDDDDDDDDPP..",
      "..PPDRRWWWRRDP..",
      "..PPDDDDDDDDPP..",
      "...PPPPPPPPPP...",
      "..GGGPPPPPPGGG..",
      ".GG..DDDDDD..GG.",
      "....DDD..DDD....",
      "...RRR....RRR...",
      "................",
      "................",
      "................"
    ];
    const virus2 = [
      "......WWWW......",
      "......RRRR......",
      ".......PP.......",
      "....PPPPPPPP....",
      "...PPPPPPPPPP...",
      "..PPDDDDDDDDPP..",
      "..PPDWWWRRRRDP..",
      "..PPDDDDDDDDPP..",
      "...PPPPPPPPPP...",
      ".GGG.PPPPPP.GGG.",
      "....DDDDDDDD....",
      "...DDD....DDD...",
      "..GGGG....GGGG..",
      "................",
      "................",
      "................"
    ];
    this.cache.virus_1 = this.createMatrixCanvas(virus1, virusPalette, 2);
    this.cache.virus_2 = this.createMatrixCanvas(virus2, virusPalette, 2);

    // ==================== ENEMIGO 3: GLITCH (Aparece y desaparece) ====================
    const glitchPalette = {
      'M': '#f15bb5',
      'C': '#00f5d4',
      'Y': '#fee440',
      'W': '#ffffff',
      'K': '#090c15'
    };
    const glitch1 = [
      "..CCC......MMM..",
      ".MMMMMCCCCMMMMM.",
      "..MMMMMMMMMMMM..",
      ".MMKKWMMMMWKKMM.",
      ".MMKKWMMMMWKKMM.",
      "..MMMMMMMMMMMM..",
      "CCC..MMMMMM..CCC",
      "..MMMMMMMMMMMM..",
      ".MM.MM.MM.MM.MM.",
      ".CC....YY....MM.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ];
    const glitch2 = [
      ".....CCCCCC.....",
      "..CCCYYYYYYMMM..",
      ".MMMMMCCCCMMMMM.",
      "..MWWKKKKKKWWM..",
      "...MMMMMMMMMM...",
      ".MMM.MMMMMM.CCC.",
      "...MMMMMMMMMM...",
      "..CC..MMMM..MM..",
      ".MM....CC....YY.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ];
    this.cache.glitch_1 = this.createMatrixCanvas(glitch1, glitchPalette, 2);
    this.cache.glitch_2 = this.createMatrixCanvas(glitch2, glitchPalette, 2);

    // ==================== COLECCIONABLES: BYTE Y CORAZÓN ====================
    const itemPalette = {
      'Y': '#fee440',
      'O': '#f77f00',
      'C': '#00f5d4',
      'W': '#ffffff',
      'R': '#ff3366',
      'D': '#a4133c'
    };
    const byteCoin1 = [
      ".....YYYYYY.....",
      "...YYOOOOOOYY...",
      "..YOOCCCCCCOOY..",
      ".YOOCWWWWWWCOOY.",
      ".YOOCWYYYYWCOOY.",
      ".YOOCWYYYYWCOOY.",
      ".YOOCWWWWWWCOOY.",
      "..YOOCCCCCCOOY..",
      "...YYOOOOOOYY...",
      ".....YYYYYY.....",
      "................",
      "................"
    ];
    const byteCoin2 = [
      "......YYYY......",
      "....YYOOOOYY....",
      "...YOCCCCCCOY...",
      "...YOCWWWWCOY...",
      "...YOCWYYWCOY...",
      "...YOCWYYWCOY...",
      "...YOCWWWWCOY...",
      "...YOCCCCCCOY...",
      "....YYOOOOYY....",
      "......YYYY......",
      "................",
      "................"
    ];
    const heartMatrix = [
      "..RRRR....RRRR..",
      ".RRRRRR..RRRRRR.",
      "RRRRWWWWRRRRRRRR",
      "RRRRWWWRRRRRRRRR",
      "RRRRRRRRRRRRRRRR",
      ".RRRRRRRRRRRRRR.",
      "..RRRRRRRRRRRR..",
      "...RRRRRRRRRR...",
      "....RRRRRRRR....",
      ".....DDDDDD.....",
      "......DDDD......",
      ".......DD......."
    ];

    this.cache.byte_coin_1 = this.createMatrixCanvas(byteCoin1, itemPalette, 2);
    this.cache.byte_coin_2 = this.createMatrixCanvas(byteCoin2, itemPalette, 2);
    this.cache.heart_item = this.createMatrixCanvas(heartMatrix, itemPalette, 2);

    this.initialized = true;
    return this.cache;
  }
}

window.spriteBank = new PixelSpriteBank();
