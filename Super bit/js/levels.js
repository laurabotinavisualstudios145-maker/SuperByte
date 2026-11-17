/**
 * SUPER BYTE - Diseño de Mundos y Niveles (Byte Valley, Cyber Forest, Neon Factory)
 * Coordenadas basadas en bloques de 32x32 px. Altura base del escenario: 18 bloques (576 px), suelo base en Y=15 (480 px).
 */
window.SUPER_BYTE_LEVELS = {
  1: {
    id: 1,
    name: "NIVEL 1: BYTE VALLEY",
    subtitle: "El Valle de los Circuitos Iniciales",
    width: 3400,
    height: 576,
    groundY: 480,
    theme: {
      skyTop: "#081c24",
      skyBottom: "#1b4332",
      distantHills: "#143628",
      midCircuit: "#00f5d4",
      groundTop: "#00f5d4",
      groundFill: "#0f291e",
      groundGrid: "#1b4d3e",
      platformColor: "#00bbf9",
      pipeColor: "#00c49a"
    },
    playerStart: { x: 96, y: 410 },
    // Segmentos de suelo [inicioX, finX] en píxeles
    groundSegments: [
      [0, 1050],
      [1160, 2100],
      [2220, 3400]
    ],
    // Plataformas estáticas suspendidas { x, y, w }
    platforms: [
      { x: 540, y: 360, w: 128 },
      { x: 920, y: 330, w: 96 },
      { x: 1240, y: 370, w: 128 },
      { x: 1620, y: 290, w: 160 },
      { x: 1850, y: 230, w: 128 },
      { x: 2560, y: 360, w: 128 },
      { x: 2740, y: 290, w: 128 },
      { x: 2920, y: 220, w: 128 }
    ],
    // Plataformas móviles { x, y, w, dx, dy, speed }
    movingPlatforms: [
      { x: 1065, y: 410, w: 80, dx: 0, dy: -90, speed: 1.2 },
      { x: 2110, y: 400, w: 96, dx: 85, dy: 0, speed: 1.4 }
    ],
    // Bloques golpeables desde abajo: type 'brick' o 'surprise', reward: 'byte' | 'heart' | 'multibyte'
    blocks: [
      { x: 288, y: 352, type: 'surprise', reward: 'byte' },
      { x: 320, y: 352, type: 'brick', reward: null },
      { x: 352, y: 352, type: 'surprise', reward: 'multibyte' },
      { x: 384, y: 352, type: 'brick', reward: null },
      { x: 336, y: 236, type: 'surprise', reward: 'heart' },

      { x: 1380, y: 352, type: 'brick', reward: null },
      { x: 1412, y: 352, type: 'surprise', reward: 'byte' },
      { x: 1444, y: 352, type: 'brick', reward: null },

      { x: 2350, y: 352, type: 'surprise', reward: 'byte' },
      { x: 2382, y: 352, type: 'surprise', reward: 'heart' }
    ],
    // Tuberías / Estructuras tecnológicas { x, h } (apoyadas sobre el suelo)
    pipes: [
      { x: 460, h: 64 },
      { x: 760, h: 96 },
      { x: 1520, h: 80 },
      { x: 2000, h: 96 },
      { x: 2480, h: 64 }
    ],
    // Obstáculos de picos láser { x, y, w }
    hazards: [
      { x: 820, y: 464, w: 64 },
      { x: 1740, y: 464, w: 64 }
    ],
    // Bytes coleccionables { x, y }
    bytes: [
      { x: 220, y: 430 }, { x: 255, y: 430 },
      { x: 560, y: 320 }, { x: 600, y: 320 }, { x: 640, y: 320 },
      { x: 775, y: 340 }, { x: 950, y: 290 }, { x: 985, y: 290 },
      { x: 1260, y: 330 }, { x: 1300, y: 330 }, { x: 1340, y: 330 },
      { x: 1645, y: 250 }, { x: 1685, y: 250 }, { x: 1725, y: 250 },
      { x: 1875, y: 190 }, { x: 1915, y: 190 },
      { x: 2580, y: 320 }, { x: 2620, y: 320 },
      { x: 2760, y: 250 }, { x: 2800, y: 250 },
      { x: 2945, y: 180 }, { x: 2985, y: 180 }
    ],
    // Enemigos { type: 'bug' | 'virus' | 'glitch', x, y, minX, maxX }
    enemies: [
      { type: 'bug', x: 620, y: 448, minX: 500, maxX: 730 },
      { type: 'bug', x: 960, y: 448, minX: 895, maxX: 1030 },
      { type: 'bug', x: 1320, y: 448, minX: 1180, maxX: 1490 },
      { type: 'virus', x: 1680, y: 258, minX: 1620, maxX: 1765 },
      { type: 'bug', x: 1900, y: 448, minX: 1810, maxX: 1980 },
      { type: 'bug', x: 2380, y: 448, minX: 2250, maxX: 2450 },
      { type: 'virus', x: 2780, y: 448, minX: 2580, maxX: 2980 }
    ],
    portal: { x: 3200, y: 384 }
  },

  2: {
    id: 2,
    name: "NIVEL 2: CYBER FOREST",
    subtitle: "Bosque Bioluminiscente de Datos",
    width: 3800,
    height: 576,
    groundY: 480,
    theme: {
      skyTop: "#0d0221",
      skyBottom: "#240046",
      distantHills: "#190033",
      midCircuit: "#9b5de5",
      groundTop: "#9b5de5",
      groundFill: "#150529",
      groundGrid: "#3c096c",
      platformColor: "#f15bb5",
      pipeColor: "#7209b7"
    },
    playerStart: { x: 90, y: 410 },
    groundSegments: [
      [0, 680],
      [960, 1560],
      [1880, 2500],
      [2880, 3800]
    ],
    platforms: [
      { x: 350, y: 370, w: 128 },
      { x: 1040, y: 350, w: 128 },
      { x: 1220, y: 270, w: 160 },
      { x: 1980, y: 340, w: 128 },
      { x: 2180, y: 250, w: 128 },
      { x: 3000, y: 360, w: 128 },
      { x: 3180, y: 280, w: 128 },
      { x: 3360, y: 200, w: 128 }
    ],
    movingPlatforms: [
      { x: 710, y: 410, w: 96, dx: 130, dy: 0, speed: 1.8 },
      { x: 1600, y: 390, w: 96, dx: 150, dy: -60, speed: 1.7 },
      { x: 2530, y: 400, w: 96, dx: 130, dy: 0, speed: 2.0 },
      { x: 2700, y: 310, w: 96, dx: 0, dy: 110, speed: 1.9 }
    ],
    blocks: [
      { x: 240, y: 352, type: 'surprise', reward: 'byte' },
      { x: 272, y: 352, type: 'surprise', reward: 'multibyte' },
      { x: 1100, y: 220, type: 'surprise', reward: 'heart' },
      { x: 1420, y: 352, type: 'brick', reward: null },
      { x: 1452, y: 352, type: 'surprise', reward: 'byte' },
      { x: 2040, y: 210, type: 'surprise', reward: 'heart' },
      { x: 2360, y: 352, type: 'surprise', reward: 'multibyte' }
    ],
    pipes: [
      { x: 540, h: 80 },
      { x: 1490, h: 96 },
      { x: 2410, h: 96 },
      { x: 2920, h: 64 }
    ],
    hazards: [
      { x: 420, y: 464, w: 64 },
      { x: 1160, y: 464, w: 96 },
      { x: 2120, y: 464, w: 96 },
      { x: 3120, y: 464, w: 96 }
    ],
    bytes: [
      { x: 370, y: 330 }, { x: 410, y: 330 },
      { x: 750, y: 350 }, { x: 790, y: 350 }, { x: 830, y: 350 },
      { x: 1060, y: 310 }, { x: 1100, y: 310 },
      { x: 1245, y: 230 }, { x: 1285, y: 230 }, { x: 1325, y: 230 },
      { x: 1650, y: 310 }, { x: 1700, y: 290 },
      { x: 2000, y: 300 }, { x: 2040, y: 300 },
      { x: 2200, y: 210 }, { x: 2240, y: 210 },
      { x: 2580, y: 340 }, { x: 2620, y: 340 },
      { x: 3030, y: 320 }, { x: 3210, y: 240 }, { x: 3390, y: 160 }
    ],
    enemies: [
      { type: 'bug', x: 300, y: 448, minX: 180, maxX: 400 },
      { type: 'virus', x: 1080, y: 448, minX: 970, maxX: 1140 },
      { type: 'glitch', x: 1290, y: 238, minX: 1225, maxX: 1365 },
      { type: 'virus', x: 1380, y: 448, minX: 1270, maxX: 1470 },
      { type: 'bug', x: 1990, y: 448, minX: 1890, maxX: 2100 },
      { type: 'glitch', x: 2230, y: 218, minX: 2185, maxX: 2295 },
      { type: 'virus', x: 2320, y: 448, minX: 2230, maxX: 2395 },
      { type: 'glitch', x: 3280, y: 448, minX: 3220, maxX: 3480 }
    ],
    portal: { x: 3620, y: 384 }
  },

  3: {
    id: 3,
    name: "NIVEL 3: NEON FACTORY",
    subtitle: "Fábrica Central de Alto Voltaje",
    width: 4200,
    height: 576,
    groundY: 480,
    theme: {
      skyTop: "#140308",
      skyBottom: "#3d0814",
      distantHills: "#28050d",
      midCircuit: "#ff3366",
      groundTop: "#fee440",
      groundFill: "#1a0d12",
      groundGrid: "#4f1224",
      platformColor: "#00f5d4",
      pipeColor: "#ff3366"
    },
    playerStart: { x: 84, y: 410 },
    groundSegments: [
      [0, 560],
      [880, 1380],
      [1760, 2240],
      [2680, 3160],
      [3520, 4200]
    ],
    platforms: [
      { x: 260, y: 370, w: 96 },
      { x: 400, y: 290, w: 96 },
      { x: 960, y: 340, w: 128 },
      { x: 1140, y: 250, w: 128 },
      { x: 1840, y: 340, w: 96 },
      { x: 2000, y: 250, w: 128 },
      { x: 2780, y: 330, w: 128 },
      { x: 2960, y: 240, w: 128 },
      { x: 3650, y: 350, w: 128 },
      { x: 3820, y: 260, w: 128 }
    ],
    movingPlatforms: [
      { x: 600, y: 380, w: 88, dx: 160, dy: 0, speed: 2.3 },
      { x: 1420, y: 360, w: 88, dx: 200, dy: -70, speed: 2.2 },
      { x: 2280, y: 410, w: 88, dx: 140, dy: -110, speed: 2.4 },
      { x: 2490, y: 290, w: 88, dx: 110, dy: 80, speed: 2.3 },
      { x: 3200, y: 390, w: 88, dx: 200, dy: -60, speed: 2.5 }
    ],
    blocks: [
      { x: 190, y: 352, type: 'surprise', reward: 'byte' },
      { x: 1010, y: 210, type: 'surprise', reward: 'heart' },
      { x: 1900, y: 210, type: 'surprise', reward: 'multibyte' },
      { x: 2830, y: 200, type: 'surprise', reward: 'heart' },
      { x: 3600, y: 352, type: 'surprise', reward: 'multibyte' }
    ],
    pipes: [
      { x: 490, h: 80 },
      { x: 1300, h: 96 },
      { x: 2150, h: 96 },
      { x: 3080, h: 96 }
    ],
    hazards: [
      { x: 300, y: 464, w: 96 },
      { x: 1020, y: 464, w: 128 },
      { x: 1920, y: 464, w: 128 },
      { x: 2840, y: 464, w: 128 },
      { x: 3720, y: 464, w: 128 }
    ],
    bytes: [
      { x: 280, y: 330 }, { x: 425, y: 250 }, { x: 460, y: 250 },
      { x: 660, y: 320 }, { x: 700, y: 320 }, { x: 740, y: 320 },
      { x: 990, y: 300 }, { x: 1170, y: 210 }, { x: 1210, y: 210 },
      { x: 1490, y: 290 }, { x: 1540, y: 270 },
      { x: 1865, y: 300 }, { x: 2030, y: 210 }, { x: 2070, y: 210 },
      { x: 2340, y: 320 }, { x: 2540, y: 240 },
      { x: 2810, y: 290 }, { x: 2990, y: 200 }, { x: 3030, y: 200 },
      { x: 3280, y: 310 }, { x: 3330, y: 290 },
      { x: 3680, y: 310 }, { x: 3850, y: 220 }, { x: 3890, y: 220 }
    ],
    enemies: [
      { type: 'virus', x: 210, y: 448, minX: 140, maxX: 285 },
      { type: 'glitch', x: 995, y: 308, minX: 960, maxX: 1075 },
      { type: 'virus', x: 1200, y: 448, minX: 1155, maxX: 1285 },
      { type: 'glitch', x: 1190, y: 218, minX: 1140, maxX: 1255 },
      { type: 'virus', x: 1820, y: 448, minX: 1770, maxX: 1905 },
      { type: 'glitch', x: 2050, y: 218, minX: 2000, maxX: 2115 },
      { type: 'virus', x: 2740, y: 448, minX: 2690, maxX: 2825 },
      { type: 'glitch', x: 3000, y: 208, minX: 2960, maxX: 3075 },
      { type: 'virus', x: 3610, y: 448, minX: 3540, maxX: 3705 },
      { type: 'glitch', x: 3920, y: 448, minX: 3855, maxX: 3985 }
    ],
    portal: { x: 4030, y: 384 }
  }
};
