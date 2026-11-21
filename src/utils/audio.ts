// Procedural Web Audio API soundtrack and sound effects engine for Detective Academy
// Generates a moody noir ambient soundscape + crisp UI feedback without external audio files.

class DetectiveAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted = false;
  private isMusicPlaying = false;
  private loopTimer: number | null = null;
  private chordIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.22;
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.08);
    }
    if (!muted && !this.isMusicPlaying) {
      this.startSoundtrack();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startSoundtrack(): void {
    if (this.isMusicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    // Moody noir minor chords: Dm9, Bbmaj7, Gm7, A7alt
    const chords = [
      [146.83, 220.0, 261.63, 329.63], // Dm9
      [116.54, 174.61, 220.0, 293.66], // Bbmaj7
      [98.0, 146.83, 174.61, 233.08], // Gm7
      [110.0, 164.81, 196.0, 261.63], // Am7
    ];

    const playBar = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const chord = chords[this.chordIndex % chords.length];
      this.chordIndex += 1;

      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(idx === 0 ? 320 : 620, now);

        const peak = idx === 0 ? 0.16 : 0.065;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(peak, now + 0.9);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 3.9);
      });

      // Subtle mystery vibraphone pulse on beat 3
      const pulseFreq = chord[2] * 2;
      const pulseOsc = this.ctx.createOscillator();
      const pulseGain = this.ctx.createGain();
      pulseOsc.type = 'sine';
      pulseOsc.frequency.setValueAtTime(pulseFreq, now + 1.8);
      pulseGain.gain.setValueAtTime(0.0001, now + 1.8);
      pulseGain.gain.linearRampToValueAtTime(0.035, now + 1.85);
      pulseGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
      pulseOsc.connect(pulseGain);
      pulseGain.connect(this.musicGain);
      pulseOsc.start(now + 1.8);
      pulseOsc.stop(now + 3.5);
    };

    playBar();
    this.loopTimer = window.setInterval(playBar, 3800);
  }

  public stopSoundtrack(): void {
    this.isMusicPlaying = false;
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.18,
    delay = 0
  ): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(520, 0.07, 'triangle', 0.08);
  }

  public playClueDiscovered(): void {
    this.playTone(440, 0.18, 'sine', 0.14, 0);
    this.playTone(659.25, 0.28, 'sine', 0.14, 0.09);
  }

  public playHint(): void {
    this.playTone(587.33, 0.15, 'triangle', 0.12, 0);
    this.playTone(440, 0.22, 'triangle', 0.1, 0.1);
  }

  public playCorrect(): void {
    this.playTone(523.25, 0.16, 'triangle', 0.16, 0);
    this.playTone(659.25, 0.18, 'triangle', 0.16, 0.08);
    this.playTone(783.99, 0.3, 'sine', 0.18, 0.16);
  }

  public playWrong(): void {
    this.playTone(210, 0.18, 'sawtooth', 0.1, 0);
    this.playTone(165, 0.28, 'sawtooth', 0.1, 0.12);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.36, 'triangle', 0.18, idx * 0.11);
    });
  }

  public playGameOver(): void {
    const notes = [293.66, 261.63, 220.0, 174.61];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.35, 'sawtooth', 0.09, idx * 0.14);
    });
  }
}

export const audioEngine = new DetectiveAudioEngine();
