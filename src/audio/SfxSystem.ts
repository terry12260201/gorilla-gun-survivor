/** Procedural SFX via Web Audio — no external audio files. */
export class SfxSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  volume = 0.35;

  private lastPlay = new Map<string, number>();

  init(): void {
    if (this.ctx) return;
    const C = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext });
    const Ctor = C.AudioContext ?? C.webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
  }

  private throttle(id: string, intervalMs: number): boolean {
    const now = performance.now();
    const last = this.lastPlay.get(id) ?? 0;
    if (now - last < intervalMs) return false;
    this.lastPlay.set(id, now);
    return true;
  }

  private noiseBuffer(durationSec: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, Math.max(1, Math.floor(sr * durationSec)), sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Main gun fire — short punchy burst. */
  gunshot(): void {
    if (!this.ctx || !this.master) return;
    if (!this.throttle('gun', 30)) return;
    const t = this.ctx.currentTime;
    const buf = this.noiseBuffer(0.14);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t); src.stop(t + 0.15);
  }

  /** Auto weapon fire — slightly higher pitch, thinner. */
  autoFire(): void {
    if (!this.ctx || !this.master) return;
    if (!this.throttle('auto', 25)) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(g).connect(this.master);
    osc.start(t); osc.stop(t + 0.1);
  }

  /** Enemy death — thud + sweep. */
  enemyDeath(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g).connect(this.master);
    osc.start(t); osc.stop(t + 0.25);
  }

  /** Player hit — short red blip. */
  playerHit(): void {
    if (!this.ctx || !this.master) return;
    if (!this.throttle('playerHit', 200)) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.18);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g).connect(this.master);
    osc.start(t); osc.stop(t + 0.22);
  }

  /** Level up — upward arpeggio. */
  levelUp(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const steps = [523.25, 659.25, 783.99, 1046.5];
    steps.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.06);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.001, t + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.28, t + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.16);
      osc.connect(g).connect(this.master!);
      osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.2);
    });
  }

  /** Lightning crackle. */
  lightning(): void {
    if (!this.ctx || !this.master) return;
    if (!this.throttle('lightning', 50)) return;
    const t = this.ctx.currentTime;
    const buf = this.noiseBuffer(0.3);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t); src.stop(t + 0.3);
  }

  /** Bomber AOE explosion — deeper, longer sweep with wide noise tail. */
  bomberBoom(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.55);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(g).connect(this.master);
    osc.start(t); osc.stop(t + 0.62);

    const buf = this.noiseBuffer(0.4);
    if (buf) {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.35);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.55, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      src.connect(filter).connect(ng).connect(this.master);
      src.start(t); src.stop(t + 0.42);
    }
  }

  /** Rusher self-destruct boom — low sawtooth sweep + mid noise crack. */
  rusherBoom(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g).connect(this.master);
    osc.start(t); osc.stop(t + 0.42);

    const buf = this.noiseBuffer(0.2);
    if (buf) {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 600;
      filter.Q.value = 1.0;
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.6, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      src.connect(filter).connect(ng).connect(this.master);
      src.start(t); src.stop(t + 0.2);
    }
  }

  /** Rusher warning beep — short square blip, pitch/volume rise with urgencyK (0=far, 1=close). */
  rusherBeep(urgencyK: number): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    const freq = 700 + 800 * urgencyK;
    osc.frequency.setValueAtTime(freq, t);
    const g = this.ctx.createGain();
    const vol = 0.12 + 0.28 * urgencyK;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(g).connect(this.master);
    osc.start(t); osc.stop(t + 0.08);
  }

  /** Heart pickup — triangle triad 440→660→880Hz, uplifting. */
  heartPickup(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const steps = [440, 660, 880];
    steps.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.05);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.001, t + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.32, t + i * 0.05 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.14);
      osc.connect(g).connect(this.master!);
      osc.start(t + i * 0.05); osc.stop(t + i * 0.05 + 0.18);
    });
  }

  /** Chest open — square thunk + triangle arpeggio up. */
  chestOpen(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    // Metallic thunk
    const thunk = this.ctx.createOscillator();
    thunk.type = 'square';
    thunk.frequency.setValueAtTime(330, t);
    thunk.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    const tg = this.ctx.createGain();
    tg.gain.setValueAtTime(0.35, t);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    thunk.connect(tg).connect(this.master);
    thunk.start(t); thunk.stop(t + 0.12);
    // Rising golden arpeggio
    const notes = [523.25, 659.25, 880, 1174.66];
    notes.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + 0.08 + i * 0.06);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.001, t + 0.08 + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.28, t + 0.08 + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08 + i * 0.06 + 0.18);
      osc.connect(g).connect(this.master!);
      osc.start(t + 0.08 + i * 0.06); osc.stop(t + 0.08 + i * 0.06 + 0.22);
    });
  }

  /** XP orb pickup — tiny chirp. */
  pickup(): void {
    if (!this.ctx || !this.master) return;
    if (!this.throttle('pickup', 35)) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(g).connect(this.master);
    osc.start(t); osc.stop(t + 0.08);
  }
}
