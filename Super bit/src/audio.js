(function () {
  window.SuperByte = window.SuperByte || {};

  class RetroAudio {
    constructor() {
      this.ctx = null;
      this.sfxVolume = 0.7;
      this.musicVolume = 0.45;
      this.muted = false;
      this.musicPlaying = false;
      this.currentTheme = 0;
      this.stepIndex = 0;
      this.musicTimer = null;

      // Three original retro chiptune themes (MIDI-like frequencies in Hz)
      this.themes = [
        // World 1: Byte Valley (Upbeat heroic 8-bit adventure)
        {
          tempo: 155,
          lead: [
            523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 523.25,
            587.33, 698.46, 880.0, 698.46, 783.99, 659.25, 587.33, 523.25,
            523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 783.99,
            698.46, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25, 0
          ],
          bass: [
            130.81, 130.81, 196.0, 196.0, 220.0, 220.0, 164.81, 164.81,
            146.83, 146.83, 174.61, 174.61, 196.0, 196.0, 130.81, 196.0,
            130.81, 130.81, 196.0, 196.0, 164.81, 164.81, 220.0, 220.0,
            174.61, 196.0, 130.81, 130.81
          ]
        },
        // World 2: Cyber Forest (Mystical synth arpeggio in A minor)
        {
          tempo: 170,
          lead: [
            440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 659.25,
            392.0, 493.88, 587.33, 783.99, 659.25, 587.33, 493.88, 392.0,
            349.23, 440.0, 523.25, 698.46, 659.25, 523.25, 440.0, 523.25,
            329.63, 415.3, 493.88, 659.25, 587.33, 493.88, 440.0, 0
          ],
          bass: [
            110.0, 110.0, 164.81, 110.0, 98.0, 98.0, 146.83, 98.0,
            87.31, 87.31, 130.81, 87.31, 82.41, 82.41, 123.47, 164.81
          ]
        },
        // World 3: Neon Factory (High-energy industrial electro pulse)
        {
          tempo: 135,
          lead: [
            329.63, 329.63, 659.25, 493.88, 440.0, 392.0, 329.63, 493.88,
            329.63, 329.63, 783.99, 739.99, 659.25, 587.33, 493.88, 0,
            369.99, 369.99, 739.99, 659.25, 587.33, 493.88, 440.0, 392.0,
            329.63, 493.88, 659.25, 783.99, 987.77, 783.99, 659.25, 0
          ],
          bass: [
            82.41, 164.81, 82.41, 164.81, 98.0, 196.0, 110.0, 220.0,
            82.41, 164.81, 82.41, 164.81, 123.47, 110.0, 98.0, 82.41
          ]
        }
      ];
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    }

    playTone({
      freq = 440,
      endFreq = null,
      type = "square",
      duration = 0.12,
      volume = 0.25,
      delay = 0,
      isMusic = false
    }) {
      if (this.muted) return;
      const ctx = this.ensureContext();
      if (!ctx || freq <= 0) return;

      const masterVol = isMusic ? this.musicVolume : this.sfxVolume;
      if (masterVol <= 0.01) return;

      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, endFreq),
          startTime + duration
        );
      }

      const finalVol = Math.min(1, volume * masterVol);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(finalVol, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    }

    // ==================== SOUND EFFECTS ====================

    jump() {
      this.playTone({
        freq: 240,
        endFreq: 660,
        type: "square",
        duration: 0.16,
        volume: 0.28
      });
    }

    collectByte() {
      this.playTone({
        freq: 987.77, // B5
        type: "square",
        duration: 0.07,
        volume: 0.26,
        delay: 0
      });
      this.playTone({
        freq: 1318.51, // E6
        type: "square",
        duration: 0.18,
        volume: 0.28,
        delay: 0.065
      });
    }

    collectHeart() {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((n, idx) => {
        this.playTone({
          freq: n,
          type: "triangle",
          duration: 0.11,
          volume: 0.35,
          delay: idx * 0.06
        });
      });
    }

    stompEnemy() {
      this.playTone({
        freq: 180,
        endFreq: 520,
        type: "sawtooth",
        duration: 0.14,
        volume: 0.32
      });
      this.playTone({
        freq: 520,
        endFreq: 760,
        type: "square",
        duration: 0.1,
        volume: 0.22,
        delay: 0.06
      });
    }

    hitBlock() {
      this.playTone({
        freq: 190,
        endFreq: 95,
        type: "triangle",
        duration: 0.1,
        volume: 0.38
      });
    }

    spawnReward() {
      const notes = [392.0, 493.88, 587.33, 783.99];
      notes.forEach((n, i) => {
        this.playTone({
          freq: n,
          type: "square",
          duration: 0.08,
          volume: 0.24,
          delay: i * 0.055
        });
      });
    }

    playerHurt() {
      this.playTone({
        freq: 380,
        endFreq: 110,
        type: "sawtooth",
        duration: 0.26,
        volume: 0.36
      });
      this.playTone({
        freq: 260,
        endFreq: 85,
        type: "square",
        duration: 0.26,
        volume: 0.28,
        delay: 0.08
      });
    }

    playerDie() {
      const notes = [493.88, 466.16, 440.0, 392.0, 329.63, 261.63];
      notes.forEach((n, i) => {
        this.playTone({
          freq: n,
          type: "sawtooth",
          duration: 0.15,
          volume: 0.3,
          delay: i * 0.11
        });
      });
    }

    levelWin() {
      const fanfare = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.12, t: 0.24 },
        { f: 1046.5, d: 0.22, t: 0.36 },
        { f: 783.99, d: 0.12, t: 0.6 },
        { f: 1046.5, d: 0.42, t: 0.74 }
      ];
      fanfare.forEach((note) => {
        this.playTone({
          freq: note.f,
          type: "square",
          duration: note.d,
          volume: 0.3,
          delay: note.t
        });
      });
    }

    uiClick() {
      this.playTone({
        freq: 740,
        endFreq: 980,
        type: "square",
        duration: 0.055,
        volume: 0.2
      });
    }

    // ==================== CHIPTUNE MUSIC SEQUENCER ====================

    startMusic(themeIndex = 0) {
      this.currentTheme = themeIndex % this.themes.length;
      this.stopMusic();
      this.musicPlaying = true;
      this.stepIndex = 0;

      const theme = this.themes[this.currentTheme];
      const tickTime = theme.tempo;

      this.musicTimer = setInterval(() => {
        if (!this.musicPlaying || this.muted || this.musicVolume <= 0.01) return;
        const leadFreq = theme.lead[this.stepIndex % theme.lead.length];
        const bassFreq = theme.bass[this.stepIndex % theme.bass.length];

        if (leadFreq > 0) {
          this.playTone({
            freq: leadFreq,
            type: "square",
            duration: (tickTime / 1000) * 0.82,
            volume: 0.15,
            isMusic: true
          });
        }

        if (bassFreq > 0 && this.stepIndex % 2 === 0) {
          this.playTone({
            freq: bassFreq,
            type: "triangle",
            duration: (tickTime / 1000) * 1.5,
            volume: 0.22,
            isMusic: true
          });
        }

        this.stepIndex++;
      }, tickTime);
    }

    stopMusic() {
      this.musicPlaying = false;
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    }
  }

  window.SuperByte.audio = new RetroAudio();
})();
