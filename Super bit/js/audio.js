/**
 * SUPER BYTE - Sistema de Audio Retro Chiptune (Web Audio API)
 * Genera música de fondo estilo 8/16 bits y efectos de sonido originales sin archivos externos.
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.volume = 0.75;
    this.bgmTimer = null;
    this.currentTheme = 1;
    this.stepIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  playTone(freq, duration, type = 'square', slideFreq = null, gainScale = 0.18) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), now + duration);
    }

    const finalGain = gainScale * this.volume;
    gain.gain.setValueAtTime(finalGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Efectos de sonido requeridos
  jump() {
    this.playTone(240, 0.16, 'square', 620, 0.15);
  }

  collectByte() {
    if (!this.sfxEnabled) return;
    this.init();
    this.playTone(987.77, 0.07, 'square', null, 0.14); // B5
    setTimeout(() => this.playTone(1318.51, 0.22, 'square', null, 0.14), 65); // E6
  }

  collectHeart() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 0.12, 'triangle', null, 0.2), idx * 65);
    });
  }

  blockHit() {
    this.playTone(150, 0.09, 'triangle', 90, 0.22);
  }

  blockReward() {
    if (!this.sfxEnabled) return;
    const notes = [392, 440, 493.88, 587.33, 659.25, 783.99];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 0.08, 'square', null, 0.13), idx * 45);
    });
  }

  enemyDefeat() {
    this.playTone(480, 0.15, 'sawtooth', 140, 0.18);
    setTimeout(() => this.playTone(720, 0.1, 'square', 960, 0.14), 50);
  }

  playerDamage() {
    if (!this.sfxEnabled) return;
    this.playTone(220, 0.22, 'sawtooth', 75, 0.24);
    setTimeout(() => this.playTone(160, 0.25, 'sawtooth', 55, 0.24), 90);
  }

  playerDeath() {
    if (!this.sfxEnabled) return;
    const notes = [493.88, 698.46, 659.25, 587.33, 523.25, 392.0, 261.63];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 0.14, 'square', null, 0.18), idx * 100);
    });
  }

  levelVictory() {
    if (!this.sfxEnabled) return;
    const fanfare = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 120 },
      { f: 783.99, d: 0.12, t: 240 },
      { f: 1046.5, d: 0.28, t: 360 },
      { f: 783.99, d: 0.14, t: 660 },
      { f: 1046.5, d: 0.45, t: 820 }
    ];
    fanfare.forEach(note => {
      setTimeout(() => this.playTone(note.f, note.d, 'square', null, 0.18), note.t);
    });
  }

  // Música de fondo procedural Chiptune por mundo
  startMusic(worldIndex = 1) {
    this.stopMusic();
    this.currentTheme = worldIndex;
    if (!this.musicEnabled) return;
    this.init();

    // Melodías chiptune originales para cada mundo
    const themes = {
      // Mundo 1: Byte Valley (Alegre, heroico, aventura 8-bit)
      1: {
        tempo: 170,
        lead: [
          523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 523.25,
          587.33, 698.46, 880.0, 698.46, 783.99, 659.25, 587.33, 493.88
        ],
        bass: [
          130.81, 130.81, 196.0, 196.0, 220.0, 220.0, 164.81, 164.81,
          146.83, 146.83, 174.61, 174.61, 196.0, 196.0, 146.83, 196.0
        ]
      },
      // Mundo 2: Cyber Forest (Misterioso, sintético, arpegios digitales)
      2: {
        tempo: 185,
        lead: [
          440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 440.0,
          392.0, 493.88, 587.33, 783.99, 659.25, 587.33, 493.88, 392.0
        ],
        bass: [
          110.0, 164.81, 110.0, 164.81, 130.81, 196.0, 130.81, 196.0,
          98.0, 146.83, 98.0, 146.83, 123.47, 164.81, 110.0, 110.0
        ]
      },
      // Mundo 3: Neon Factory (Rápido, industrial, energético)
      3: {
        tempo: 145,
        lead: [
          329.63, 329.63, 659.25, 493.88, 466.16, 440.0, 392.0, 329.63,
          349.23, 349.23, 698.46, 523.25, 493.88, 466.16, 440.0, 493.88
        ],
        bass: [
          82.41, 164.81, 82.41, 164.81, 92.5, 185.0, 82.41, 164.81,
          87.31, 174.61, 87.31, 174.61, 98.0, 196.0, 123.47, 123.47
        ]
      }
    };

    const track = themes[worldIndex] || themes[1];
    this.stepIndex = 0;

    this.bgmTimer = setInterval(() => {
      if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const idx = this.stepIndex % track.lead.length;
      const leadFreq = track.lead[idx];
      const bassFreq = track.bass[idx];

      // Canal Lead
      this.playMusicNote(leadFreq, 0.11, 'square', 0.045);
      // Canal Bajo
      this.playMusicNote(bassFreq, 0.14, 'triangle', 0.065);

      this.stepIndex++;
    }, track.tempo);
  }

  playMusicNote(freq, duration, type, baseGain) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const g = baseGain * this.volume;
    gain.gain.setValueAtTime(g, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  stopMusic() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.soundFX = new SoundManager();
