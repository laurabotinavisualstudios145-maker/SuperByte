(function () {
  window.SuperByte = window.SuperByte || {};

  // Curated + procedural algebra question bank scaled across the 3 worlds
  const QUESTION_BANK = {
    // World 1: Byte Valley — Basic Linear Equations (ax + b = c, ax - b = c, x/a + b = c)
    1: [
      {
        category: "Ecuaciones Lineales Simples",
        prompt: "Encuentra el valor de x que equilibra el circuito:",
        expression: "2x + 4 = 10",
        answer: "x = 3",
        distractors: ["x = 2", "x = 4", "x = 7"],
        hint: "Resta 4 en ambos lados (2x = 6) y luego divide entre 2.",
        explanation: "2x = 10 - 4  →  2x = 6  →  x = 6 / 2 = 3."
      },
      {
        category: "Ecuaciones Lineales Simples",
        prompt: "Despeja la incógnita x para estabilizar el núcleo:",
        expression: "3x - 5 = 16",
        answer: "x = 7",
        distractors: ["x = 5", "x = 6", "x = 8"],
        hint: "Suma 5 en ambos lados (3x = 21) y divide entre 3.",
        explanation: "3x = 16 + 5  →  3x = 21  →  x = 21 / 3 = 7."
      },
      {
        category: "Ecuaciones Lineales Simples",
        prompt: "Calcula el valor de x en la siguiente ecuación:",
        expression: "4x + 7 = 27",
        answer: "x = 5",
        distractors: ["x = 4", "x = 6", "x = 8"],
        hint: "Pasa el 7 restando al lado derecho y divide el resultado por 4.",
        explanation: "4x = 27 - 7  →  4x = 20  →  x = 20 / 4 = 5."
      },
      {
        category: "Ecuaciones Lineales Simples",
        prompt: "Resuelve para x:",
        expression: "5x - 10 = 15",
        answer: "x = 5",
        distractors: ["x = 1", "x = 3", "x = 6"],
        hint: "Suma 10 a 15 y luego divide entre 5.",
        explanation: "5x = 15 + 10  →  5x = 25  →  x = 25 / 5 = 5."
      },
      {
        category: "Ecuaciones con Fracciones",
        prompt: "Halla el valor de x que cumple la igualdad:",
        expression: "x / 2 + 3 = 8",
        answer: "x = 10",
        distractors: ["x = 5", "x = 8", "x = 12"],
        hint: "Primero resta 3 en ambos lados (x / 2 = 5) y luego multiplica por 2.",
        explanation: "x / 2 = 8 - 3  →  x / 2 = 5  →  x = 5 · 2 = 10."
      },
      {
        category: "Ecuaciones Lineales Simples",
        prompt: "Encuentra el valor de x:",
        expression: "6x + 2 = 26",
        answer: "x = 4",
        distractors: ["x = 3", "x = 5", "x = 6"],
        hint: "Resta 2 a 26 y divide el resultado entre 6.",
        explanation: "6x = 26 - 2  →  6x = 24  →  x = 24 / 6 = 4."
      },
      {
        category: "Valor Numérico Algebraico",
        prompt: "Si a = 4, ¿cuál es el valor de la expresión?",
        expression: "3a + 5",
        answer: "17",
        distractors: ["12", "15", "19"],
        hint: "Sustituye la letra a por 4: multiplica 3 por 4 y suma 5.",
        explanation: "3(4) + 5 = 12 + 5 = 17."
      },
      {
        category: "Reducción de Términos",
        prompt: "Simplifica y resuelve para x:",
        expression: "2x + 3x = 35",
        answer: "x = 7",
        distractors: ["x = 5", "x = 6", "x = 8"],
        hint: "Suma los términos semejantes (2x + 3x = 5x) y divide 35 entre 5.",
        explanation: "5x = 35  →  x = 35 / 5 = 7."
      }
    ],

    // World 2: Cyber Forest — Equations with Parentheses & Variables on Both Sides
    2: [
      {
        category: "Incógnitas en Ambos Lados",
        prompt: "Agrupa las incógnitas y encuentra el valor de x:",
        expression: "5x - 2 = 3x + 10",
        answer: "x = 6",
        distractors: ["x = 4", "x = 5", "x = 8"],
        hint: "Resta 3x en ambos lados (2x - 2 = 10) y suma 2 en ambos lados.",
        explanation: "5x - 3x = 10 + 2  →  2x = 12  →  x = 6."
      },
      {
        category: "Ecuaciones con Paréntesis",
        prompt: "Aplica propiedad distributiva o despeja para hallar x:",
        expression: "2(x + 3) = 18",
        answer: "x = 6",
        distractors: ["x = 5", "x = 7", "x = 9"],
        hint: "Divide ambos lados entre 2 (x + 3 = 9) o multiplica 2x + 6 = 18.",
        explanation: "x + 3 = 18 / 2  →  x + 3 = 9  →  x = 6."
      },
      {
        category: "Ecuaciones con Paréntesis",
        prompt: "Resuelve la ecuación para x:",
        expression: "3(2x - 1) = 21",
        answer: "x = 4",
        distractors: ["x = 3", "x = 5", "x = 6"],
        hint: "6x - 3 = 21. Suma 3 y luego divide entre 6.",
        explanation: "6x - 3 = 21  →  6x = 24  →  x = 4."
      },
      {
        category: "Incógnitas en Ambos Lados",
        prompt: "Halla el valor de x que satisface la igualdad:",
        expression: "7x + 4 = 4x + 25",
        answer: "x = 7",
        distractors: ["x = 5", "x = 6", "x = 9"],
        hint: "Pasa 4x restando a la izquierda (3x) y 4 restando a la derecha (21).",
        explanation: "7x - 4x = 25 - 4  →  3x = 21  →  x = 7."
      },
      {
        category: "Paréntesis e Incógnitas",
        prompt: "Despeja x en la siguiente ecuación:",
        expression: "2(x - 3) = x + 4",
        answer: "x = 10",
        distractors: ["x = 7", "x = 8", "x = 12"],
        hint: "Expande el paréntesis: 2x - 6 = x + 4.",
        explanation: "2x - 6 = x + 4  →  2x - x = 4 + 6  →  x = 10."
      },
      {
        category: "Productos Notables",
        prompt: "¿Cuál es el desarrollo correcto del binomio al cuadrado?",
        expression: "(x + 3)²",
        answer: "x² + 6x + 9",
        distractors: ["x² + 9", "x² + 3x + 9", "x² + 6x + 6"],
        hint: "Recuerda: (a + b)² = a² + 2ab + b².",
        explanation: "(x + 3)² = x² + 2(x)(3) + 3² = x² + 6x + 9."
      },
      {
        category: "Diferencia de Cuadrados",
        prompt: "Desarrolla el siguiente producto notable:",
        expression: "(x - 5)(x + 5)",
        answer: "x² - 25",
        distractors: ["x² + 25", "x² - 10x + 25", "x² - 5"],
        hint: "Suma por diferencia es diferencia de cuadrados: (a - b)(a + b) = a² - b².",
        explanation: "(x - 5)(x + 5) = x² - 5² = x² - 25."
      },
      {
        category: "Incógnitas en Ambos Lados",
        prompt: "Encuentra el valor de x:",
        expression: "4(x + 2) = 2x + 20",
        answer: "x = 6",
        distractors: ["x = 4", "x = 5", "x = 8"],
        hint: "4x + 8 = 2x + 20. Resta 2x y resta 8.",
        explanation: "4x - 2x = 20 - 8  →  2x = 12  →  x = 6."
      }
    ],

    // World 3: Neon Factory — Factoring, Quadratics & Systems
    3: [
      {
        category: "Ecuaciones Cuadráticas",
        prompt: "¿Cuáles son las soluciones reales de la ecuación?",
        expression: "x² - 9 = 0",
        answer: "x = 3 y x = -3",
        distractors: ["Solo x = 9", "x = 3 y x = 0", "x = 9 y x = -9"],
        hint: "Despeja x² = 9 o factoriza como (x - 3)(x + 3) = 0.",
        explanation: "x² = 9  →  x = ±√9  →  x = 3 y x = -3."
      },
      {
        category: "Ecuaciones Cuadráticas Factorizadas",
        prompt: "Encuentra las raíces que hacen cero el producto:",
        expression: "(x - 4)(x + 2) = 0",
        answer: "x = 4 y x = -2",
        distractors: ["x = -4 y x = 2", "x = 4 y x = 2", "x = 8 y x = -2"],
        hint: "Para que un producto sea 0, al menos uno de los factores debe valer 0.",
        explanation: "x - 4 = 0 → x = 4;  x + 2 = 0 → x = -2."
      },
      {
        category: "Factorización de Trinomios",
        prompt: "Factoriza completamente el siguiente trinomio:",
        expression: "x² - 5x + 6",
        answer: "(x - 2)(x - 3)",
        distractors: ["(x + 2)(x + 3)", "(x - 6)(x + 1)", "(x - 5)(x + 6)"],
        hint: "Busca dos números que multiplicados den +6 y sumados den -5.",
        explanation: "(-2) · (-3) = +6 y (-2) + (-3) = -5  →  (x - 2)(x - 3)."
      },
      {
        category: "Trinomio Cuadrado Perfecto",
        prompt: "Factoriza la siguiente expresión cuadrática:",
        expression: "x² + 8x + 16",
        answer: "(x + 4)²",
        distractors: ["(x + 8)²", "(x - 4)²", "(x + 4)(x - 4)"],
        hint: "Observa que 16 = 4² y el término central 8x = 2 · 4 · x.",
        explanation: "x² + 2(4)x + 4² = (x + 4)²."
      },
      {
        category: "Ecuaciones Cuadráticas",
        prompt: "Halla la solución positiva (x > 0) de la ecuación:",
        expression: "2x² - 32 = 0",
        answer: "x = 4",
        distractors: ["x = 2", "x = 8", "x = 16"],
        hint: "Suma 32, divide entre 2 (x² = 16) y calcula la raíz cuadrada positiva.",
        explanation: "2x² = 32  →  x² = 16  →  x = 4 (para x > 0)."
      },
      {
        category: "Factor Común",
        prompt: "Extrae el factor común de la expresión:",
        expression: "4x² + 12x",
        answer: "4x(x + 3)",
        distractors: ["4(x² + 3)", "4x(x + 12)", "2x(2x + 3)"],
        hint: "Tanto 4x² como 12x son divisibles entre 4x.",
        explanation: "4x² + 12x = 4x · x + 4x · 3 = 4x(x + 3)."
      },
      {
        category: "Ecuaciones Cuadráticas",
        prompt: "Resuelve para hallar las dos raíces de la ecuación:",
        expression: "x² - 7x + 10 = 0",
        answer: "x = 2 y x = 5",
        distractors: ["x = -2 y x = -5", "x = 1 y x = 10", "x = -2 y x = 5"],
        hint: "Factoriza buscando dos números que sumen -7 y multipliquen +10.",
        explanation: "(x - 2)(x - 5) = 0  →  x = 2 y x = 5."
      },
      {
        category: "Sistemas de Ecuaciones",
        prompt: "Si x + y = 10  y  x - y = 4, ¿cuánto vale x?",
        answer: "x = 7",
        distractors: ["x = 3", "x = 5", "x = 6"],
        hint: "Suma ambas ecuaciones miembro a miembro: (x + y) + (x - y) = 10 + 4.",
        explanation: "2x = 14  →  x = 7 (y por tanto y = 3)."
      }
    ]
  };

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  class AlgebraChallengeManager {
    constructor() {
      this.usedIndicesByLevel = { 1: [], 2: [], 3: [] };
      this.stats = {
        attempted: 0,
        solved: 0
      };
    }

    resetSessionStats() {
      this.stats.attempted = 0;
      this.stats.solved = 0;
    }

    getQuestionForLevel(levelId = 1) {
      const tier = QUESTION_BANK[levelId] ? levelId : 1;
      const pool = QUESTION_BANK[tier];
      let used = this.usedIndicesByLevel[tier] || [];

      if (used.length >= pool.length) {
        used = [];
        this.usedIndicesByLevel[tier] = used;
      }

      const availableIndices = [];
      for (let i = 0; i < pool.length; i++) {
        if (!used.includes(i)) {
          availableIndices.push(i);
        }
      }

      const chosenIdx =
        availableIndices[Math.floor(Math.random() * availableIndices.length)];
      used.push(chosenIdx);

      const raw = pool[chosenIdx];
      const options = shuffleArray([raw.answer, ...raw.distractors]);
      const correctIndex = options.indexOf(raw.answer);

      return {
        levelId: tier,
        category: raw.category,
        prompt: raw.prompt,
        expression: raw.expression,
        options,
        correctIndex,
        answer: raw.answer,
        hint: raw.hint,
        explanation: raw.explanation
      };
    }

    recordResult(isCorrect) {
      this.stats.attempted += 1;
      if (isCorrect) {
        this.stats.solved += 1;
      }
    }
  }

  window.SuperByte.algebra = new AlgebraChallengeManager();
})();
