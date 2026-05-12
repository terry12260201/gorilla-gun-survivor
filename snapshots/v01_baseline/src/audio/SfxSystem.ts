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
