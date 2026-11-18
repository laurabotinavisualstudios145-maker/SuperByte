(function () {
  window.SuperByte = window.SuperByte || {};

  const TILE = 40; // Base tile size in world pixels (canvas internal resolution 960x540)

  // Helper to build horizontal ground or platform segments
  function rectTiles(tx, ty, tw, th, kind = "ground") {
    return {
      x: tx * TILE,
      y: ty * TILE,
      w: tw * TILE,
      h: th * TILE,
      kind
    };
  }

  // Helper to build a row of interactive blocks (bricks & surprise blocks)
  function makeBlockRow(startTx, ty, pattern) {
    // pattern string: 'B' = hitable cyber brick, '?' = surprise byte block, 'H' = surprise extra life heart block
    const blocks = [];
    for (let i = 0; i < pattern.length; i++) {
      const ch = pattern[i];
      if (ch === " ") continue;
      blocks.push({
        x: (startTx + i) * TILE,
        y: ty * TILE,
        w: TILE,
        h: TILE,
        type: ch === "B" ? "brick" : "surprise",
        reward: ch === "H" ? "heart" : ch === "?" ? "byte" : null,
        used: false,
        bumpOffset: 0,
        bumpVel: 0
      });
    }
    return blocks;
  }

  // Helper to place a line or arc of collectible Bytes
  function byteLine(startTx, ty, count, stepTx = 1, stepTy = 0) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: (startTx + i * stepTx) * TILE + 8,
        y: (ty + i * stepTy) * TILE + 8,
        w: 24,
        h: 24,
        kind: "byte",
        collected: false,
        phase: i * 0.6
      });
    }
    return list;
  }

  const LEVELS = [
    // =========================================================================
    // NIVEL 1: BYTE VALLEY (Introductory Tech Valley)
    // =========================================================================
    {
      id: 1,
      name: "Nivel 1: Byte Valley",
      subtitle: "Valle de Circuitos — Aprende a saltar, correr y golpear bloques",
      difficulty: "Fácil",
      themeIndex: 0,
      worldWidth: 92 * TILE,
      worldHeight: 14 * TILE,
      palette: {
        skyTop: "#09102c",
        skyBottom: "#172a5a",
        farHills: "#122347",
        nearHills: "#1b3b6f",
        gridAccent: "#00f5d4",
        groundTop: "#00f5d4",
        groundBody: "#162447",
        groundDetail: "#1f4068",
        platformTop: "#4cc9f0",
        platformBody: "#1b263b",
        pipeColor: "#00a896",
        pipeHighlight: "#00f5d4"
      },
      spawn: { x: 2.5 * TILE, y: 9 * TILE },
      platforms: [
        // Main ground segments with small pits
        rectTiles(0, 12, 22, 3, "ground"),
        rectTiles(24, 12, 20, 3, "ground"),
        rectTiles(46, 12, 24, 3, "ground"),
        rectTiles(72, 12, 20, 3, "ground"),

        // Suspended platforms
        rectTiles(14, 9, 4, 0.6, "platform"),
        rectTiles(28, 8.5, 4, 0.6, "platform"),
        rectTiles(35, 6.5, 5, 0.6, "platform"),
        rectTiles(54, 9, 4, 0.6, "platform"),
        rectTiles(60, 7, 4, 0.6, "platform"),
        rectTiles(66, 5.5, 4, 0.6, "platform"),

        // Tech Pipes / Data Conduits
        rectTiles(11, 10, 2, 2, "pipe"),
        rectTiles(19, 9, 2, 3, "pipe"),
        rectTiles(40, 9, 2, 3, "pipe"),
        rectTiles(50, 10, 2, 2, "pipe"),
        rectTiles(74, 10, 2, 2, "pipe"),

        // Plataformas de Rebote (Trampolines Cibernéticos)
        rectTiles(17.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(24.0, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(32.8, 11.5, 1.4, 0.5, "bounce"),
        rectTiles(38.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(52.3, 11.5, 1.4, 0.5, "bounce"),

        // Final staircase before the exit portal
        rectTiles(78, 11, 4, 1, "step"),
        rectTiles(79, 10, 3, 1, "step"),
        rectTiles(80, 9, 2, 1, "step"),
        rectTiles(81, 8, 1, 1, "step")
      ],
      movingPlatforms: [
        {
          x: 43.5 * TILE,
          y: 10.5 * TILE,
          w: 3 * TILE,
          h: 22,
          minX: 43 * TILE,
          maxX: 46 * TILE,
          minY: 10.5 * TILE,
          maxY: 10.5 * TILE,
          vx: 70,
          vy: 0
        }
      ],
      blocks: [
        ...makeBlockRow(5, 8.5, "B?B?B"),
        ...makeBlockRow(7, 5, "?"),
        ...makeBlockRow(25, 8.5, "B?HB"),
        ...makeBlockRow(48, 8.5, "?B?"),
        ...makeBlockRow(61, 4, "?")
      ],
      hazards: [],
      bytes: [
        ...byteLine(6, 10.5, 3, 1, 0),
        ...byteLine(14.5, 7.5, 3, 1, 0),
        ...byteLine(22, 9.5, 2, 1, 0),
        ...byteLine(28.5, 7, 3, 1, 0),
        ...byteLine(35.5, 5, 4, 1, 0),
        ...byteLine(54.5, 7.5, 3, 1, 0),
        ...byteLine(60.5, 5.5, 3, 1, 0),
        ...byteLine(66.5, 4, 3, 1, 0),
        ...byteLine(75, 8.5, 3, 1, 0)
      ],
      enemies: [
        { type: "bug", x: 15 * TILE, y: 11 * TILE, minX: 13 * TILE, maxX: 18.5 * TILE, speed: 68 },
        { type: "bug", x: 30 * TILE, y: 11 * TILE, minX: 25 * TILE, maxX: 39 * TILE, speed: 75 },
        { type: "bug", x: 36 * TILE, y: 5.5 * TILE, minX: 35 * TILE, maxX: 39.5 * TILE, speed: 62 },
        { type: "bug", x: 55 * TILE, y: 11 * TILE, minX: 52.2 * TILE, maxX: 68 * TILE, speed: 80 },
        { type: "virus", x: 63 * TILE, y: 11 * TILE, minX: 53 * TILE, maxX: 69 * TILE, speed: 85 }
      ],
      portal: {
        x: 86 * TILE,
        y: 9.2 * TILE,
        w: 1.6 * TILE,
        h: 2.8 * TILE
      }
    },

    // =========================================================================
    // NIVEL 2: CYBER FOREST (Bioluminescent Digital Woods)
    // =========================================================================
    {
      id: 2,
      name: "Nivel 2: Cyber Forest",
      subtitle: "Bosque Digital — Plataformas móviles, Virus Bots y Glitches",
      difficulty: "Media",
      themeIndex: 1,
      worldWidth: 100 * TILE,
      worldHeight: 14 * TILE,
      palette: {
        skyTop: "#051923",
        skyBottom: "#0a3641",
        farHills: "#0d4a4d",
        nearHills: "#126e63",
        gridAccent: "#52b788",
        groundTop: "#38b000",
        groundBody: "#0b2b26",
        groundDetail: "#164a41",
        platformTop: "#70e000",
        platformBody: "#14362b",
        pipeColor: "#2d6a4f",
        pipeHighlight: "#74c69d"
      },
      spawn: { x: 2.5 * TILE, y: 9 * TILE },
      platforms: [
        rectTiles(0, 12, 16, 3, "ground"),
        rectTiles(22, 12, 16, 3, "ground"),
        rectTiles(45, 12, 15, 3, "ground"),
        rectTiles(68, 12, 12, 3, "ground"),
        rectTiles(84, 12, 16, 3, "ground"),

        // Forest canopy suspended platforms
        rectTiles(8, 8.8, 4, 0.6, "platform"),
        rectTiles(13, 6.8, 3, 0.6, "platform"),
        rectTiles(26, 8.5, 4, 0.6, "platform"),
        rectTiles(32, 6.2, 4, 0.6, "platform"),
        rectTiles(48, 8.8, 4, 0.6, "platform"),
        rectTiles(54, 6.5, 4, 0.6, "platform"),
        rectTiles(71, 8.5, 5, 0.6, "platform"),

        // Data Tree Conduits (Pipes)
        rectTiles(23, 10, 2, 2, "pipe"),
        rectTiles(36, 9, 2, 3, "pipe"),
        rectTiles(58, 9, 2, 3, "pipe"),
        rectTiles(85, 10, 2, 2, "pipe"),

        // Plataformas de Rebote (Trampolines Cibernéticos)
        rectTiles(6.5, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(25.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(34.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(46.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(56.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(69.2, 11.5, 1.3, 0.5, "bounce"),

        // Exit steps
        rectTiles(89, 11, 3, 1, "step"),
        rectTiles(90, 10, 2, 1, "step"),
        rectTiles(91, 9, 1, 1, "step")
      ],
      movingPlatforms: [
        {
          x: 16.5 * TILE,
          y: 10.5 * TILE,
          w: 3.2 * TILE,
          h: 22,
          minX: 16.2 * TILE,
          maxX: 21.2 * TILE,
          minY: 10.5 * TILE,
          maxY: 10.5 * TILE,
          vx: 95,
          vy: 0
        },
        {
          x: 39 * TILE,
          y: 10 * TILE,
          w: 3.2 * TILE,
          h: 22,
          minX: 38.5 * TILE,
          maxX: 44 * TILE,
          minY: 7.5 * TILE,
          maxY: 11 * TILE,
          vx: 80,
          vy: 55
        },
        {
          x: 61 * TILE,
          y: 9.5 * TILE,
          w: 3 * TILE,
          h: 22,
          minX: 60.5 * TILE,
          maxX: 67 * TILE,
          minY: 9.5 * TILE,
          maxY: 9.5 * TILE,
          vx: 110,
          vy: 0
        },
        {
          x: 80.5 * TILE,
          y: 10 * TILE,
          w: 2.8 * TILE,
          h: 22,
          minX: 80.5 * TILE,
          maxX: 80.5 * TILE,
          minY: 6.5 * TILE,
          maxY: 11 * TILE,
          vx: 0,
          vy: 85
        }
      ],
      blocks: [
        ...makeBlockRow(4, 8.5, "?B?"),
        ...makeBlockRow(27, 5.2, "B?HB"),
        ...makeBlockRow(49, 5.5, "?B?"),
        ...makeBlockRow(72, 5.2, "B?B")
      ],
      hazards: [
        // Thorny data spikes on ground
        { x: 30 * TILE, y: 11.4 * TILE, w: 2 * TILE, h: 0.6 * TILE, kind: "laser" },
        { x: 52 * TILE, y: 11.4 * TILE, w: 2 * TILE, h: 0.6 * TILE, kind: "laser" }
      ],
      bytes: [
        ...byteLine(8.5, 7.3, 3, 1, 0),
        ...byteLine(13.5, 5.3, 2, 1, 0),
        ...byteLine(17.5, 8.5, 3, 1, 0),
        ...byteLine(32.5, 4.7, 3, 1, 0),
        ...byteLine(40, 6.5, 3, 1, 0),
        ...byteLine(54.5, 5, 3, 1, 0),
        ...byteLine(62, 7.5, 4, 1, 0),
        ...byteLine(72, 7, 3, 1, 0),
        ...byteLine(80.8, 5.5, 2, 1, 0)
      ],
      enemies: [
        { type: "bug", x: 11 * TILE, y: 11 * TILE, minX: 6 * TILE, maxX: 15 * TILE, speed: 80 },
        { type: "virus", x: 28 * TILE, y: 11 * TILE, minX: 25.2 * TILE, maxX: 29.6 * TILE, speed: 95 },
        { type: "glitch", x: 33.5 * TILE, y: 5.2 * TILE, minX: 32 * TILE, maxX: 35.5 * TILE, speed: 55 },
        { type: "virus", x: 48 * TILE, y: 11 * TILE, minX: 45.5 * TILE, maxX: 51.5 * TILE, speed: 100 },
        { type: "bug", x: 55 * TILE, y: 5.5 * TILE, minX: 54 * TILE, maxX: 57.5 * TILE, speed: 78 },
        { type: "glitch", x: 73 * TILE, y: 11 * TILE, minX: 68.5 * TILE, maxX: 79 * TILE, speed: 75 },
        { type: "virus", x: 75 * TILE, y: 7.5 * TILE, minX: 71 * TILE, maxX: 75.5 * TILE, speed: 90 }
      ],
      portal: {
        x: 95 * TILE,
        y: 9.2 * TILE,
        w: 1.6 * TILE,
        h: 2.8 * TILE
      }
    },

    // =========================================================================
    // NIVEL 3: NEON FACTORY (High-Voltage Cybernetic Core)
    // =========================================================================
    {
      id: 3,
      name: "Nivel 3: Neon Factory",
      subtitle: "Fábrica Neón — Trampas láser, saltos extremos y el núcleo final",
      difficulty: "Difícil",
      themeIndex: 2,
      worldWidth: 108 * TILE,
      worldHeight: 14 * TILE,
      palette: {
        skyTop: "#120428",
        skyBottom: "#2b0948",
        farHills: "#3c096c",
        nearHills: "#5a189a",
        gridAccent: "#ff2a85",
        groundTop: "#ff2a85",
        groundBody: "#190a28",
        groundDetail: "#3c096c",
        platformTop: "#ffd166",
        platformBody: "#240046",
        pipeColor: "#7209b7",
        pipeHighlight: "#f72585"
      },
      spawn: { x: 2.5 * TILE, y: 9 * TILE },
      platforms: [
        rectTiles(0, 12, 14, 3, "ground"),
        rectTiles(20, 12, 14, 3, "ground"),
        rectTiles(42, 12, 14, 3, "ground"),
        rectTiles(64, 12, 14, 3, "ground"),
        rectTiles(88, 12, 20, 3, "ground"),

        // Factory catwalks
        rectTiles(9, 8.8, 3, 0.6, "platform"),
        rectTiles(23, 8.5, 3, 0.6, "platform"),
        rectTiles(29, 6.2, 4, 0.6, "platform"),
        rectTiles(45, 8.5, 3, 0.6, "platform"),
        rectTiles(50, 6, 4, 0.6, "platform"),
        rectTiles(67, 8.5, 4, 0.6, "platform"),
        rectTiles(73, 6, 4, 0.6, "platform"),

        // Industrial Reactor Pipes (alturas ajustadas: 52px y 64px)
        rectTiles(12, 10.7, 2, 1.3, "pipe"),
        rectTiles(32, 10.4, 2, 1.6, "pipe"),
        rectTiles(54, 10.4, 2, 1.6, "pipe"),
        rectTiles(76, 10.4, 2, 1.6, "pipe"),
        rectTiles(90, 10.4, 2, 1.6, "pipe"),

        // Plataformas de Rebote (Trampolines Cibernéticos)
        rectTiles(7.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(21.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(43.2, 11.5, 1.3, 0.5, "bounce"),
        rectTiles(65.2, 11.5, 1.3, 0.5, "bounce"),

        // Final Victory Ascent
        rectTiles(94, 11, 5, 1, "step"),
        rectTiles(95, 10, 4, 1, "step"),
        rectTiles(96, 9, 3, 1, "step"),
        rectTiles(97, 8, 2, 1, "step"),
        rectTiles(98, 7, 1, 1, "step")
      ],
      movingPlatforms: [
        {
          x: 15 * TILE,
          y: 10.2 * TILE,
          w: 2.8 * TILE,
          h: 22,
          minX: 14.5 * TILE,
          maxX: 19.2 * TILE,
          minY: 10.2 * TILE,
          maxY: 10.2 * TILE,
          vx: 115,
          vy: 0
        },
        {
          x: 35 * TILE,
          y: 9.5 * TILE,
          w: 2.8 * TILE,
          h: 22,
          minX: 34.5 * TILE,
          maxX: 41 * TILE,
          minY: 7 * TILE,
          maxY: 10.8 * TILE,
          vx: 95,
          vy: 75
        },
        {
          x: 57 * TILE,
          y: 10 * TILE,
          w: 2.8 * TILE,
          h: 22,
          minX: 56.5 * TILE,
          maxX: 63 * TILE,
          minY: 10 * TILE,
          maxY: 10 * TILE,
          vx: 130,
          vy: 0
        },
        {
          x: 79 * TILE,
          y: 9.5 * TILE,
          w: 2.6 * TILE,
          h: 22,
          minX: 78.5 * TILE,
          maxX: 83 * TILE,
          minY: 6.5 * TILE,
          maxY: 10.5 * TILE,
          vx: 95,
          vy: -80
        },
        {
          x: 84 * TILE,
          y: 8.5 * TILE,
          w: 2.6 * TILE,
          h: 22,
          minX: 83.2 * TILE,
          maxX: 87.2 * TILE,
          minY: 8.5 * TILE,
          maxY: 8.5 * TILE,
          vx: 120,
          vy: 0
        }
      ],
      blocks: [
        ...makeBlockRow(4, 8.5, "B?B"),
        ...makeBlockRow(24, 5.2, "?H?"),
        ...makeBlockRow(46, 5.2, "B?B"),
        ...makeBlockRow(68, 5, "?H?")
      ],
      hazards: [
        { x: 25 * TILE, y: 11.4 * TILE, w: 2 * TILE, h: 0.6 * TILE, kind: "laser" },
        { x: 47 * TILE, y: 11.4 * TILE, w: 2.5 * TILE, h: 0.6 * TILE, kind: "laser" },
        { x: 69 * TILE, y: 11.4 * TILE, w: 2.5 * TILE, h: 0.6 * TILE, kind: "laser" }
      ],
      bytes: [
        ...byteLine(9.3, 7.2, 3, 0.9, 0),
        ...byteLine(15.5, 8.2, 3, 1, 0),
        ...byteLine(29.5, 4.7, 3, 1, 0),
        ...byteLine(36.5, 6.2, 3, 1, 0),
        ...byteLine(50.5, 4.5, 3, 1, 0),
        ...byteLine(58, 8, 4, 1, 0),
        ...byteLine(73.5, 4.5, 3, 1, 0),
        ...byteLine(80, 6, 3, 1, 0),
        ...byteLine(84.5, 6.8, 3, 1, 0),
        ...byteLine(94.5, 6, 4, 1, -0.5)
      ],
      enemies: [
        { type: "virus", x: 8 * TILE, y: 11 * TILE, minX: 4 * TILE, maxX: 11.5 * TILE, speed: 100 },
        { type: "glitch", x: 22 * TILE, y: 11 * TILE, minX: 20.5 * TILE, maxX: 24.5 * TILE, speed: 80 },
        { type: "bug", x: 29.5 * TILE, y: 5.2 * TILE, minX: 29 * TILE, maxX: 32.5 * TILE, speed: 90 },
        { type: "virus", x: 44 * TILE, y: 11 * TILE, minX: 42.2 * TILE, maxX: 46.5 * TILE, speed: 110 },
        { type: "glitch", x: 51 * TILE, y: 11 * TILE, minX: 49.8 * TILE, maxX: 53.5 * TILE, speed: 85 },
        { type: "virus", x: 66 * TILE, y: 11 * TILE, minX: 64.2 * TILE, maxX: 68.5 * TILE, speed: 115 },
        { type: "glitch", x: 73.5 * TILE, y: 5 * TILE, minX: 73 * TILE, maxX: 76.5 * TILE, speed: 85 },
        { type: "virus", x: 92.5 * TILE, y: 11 * TILE, minX: 92.1 * TILE, maxX: 93.8 * TILE, speed: 95 }
      ],
      portal: {
        x: 102 * TILE,
        y: 9.2 * TILE,
        w: 1.6 * TILE,
        h: 2.8 * TILE
      }
    }
  ];

  window.SuperByte.TILE_SIZE = TILE;
  window.SuperByte.LEVELS = LEVELS;
})();
