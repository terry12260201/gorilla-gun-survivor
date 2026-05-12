import type { Enemy } from '../enemy/Enemy.js';

export class BossBar {
  private root: HTMLDivElement;
  private fill: HTMLDivElement;
  private label: HTMLDivElement;
  private warning: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'boss-bar';
    this.root.classList.add('hidden');
    this.root.innerHTML = `
      <div class="label"></div>
      <div class="bar"><div class="fill"></div></div>
    `;
    this.warning = document.createElement('div');
    this.warning.id = 'boss-warning';
    this.warning.textContent = '⚠ MINI BOSS APPEARS';
    const style = document.createElement('style');
    style.textContent = `
      #boss-bar { position: fixed; top: 58px; left: 50%; transform: translateX(-50%);
        z-index: 5; font-family: system-ui, sans-serif; color: #fff; pointer-events: none;
        min-width: 420px; text-align: center; }
      #boss-bar.hidden { display: none; }
      #boss-bar .label { font-size: 12px; letter-spacing: 5px; font-weight: 700;
        color: #ff7b7b; text-shadow: 0 0 10px rgba(255,70,70,0.6); margin-bottom: 4px; }
      #boss-bar .bar { height: 14px; background: rgba(0,0,0,0.6);
        border: 1px solid rgba(255,120,120,0.4); border-radius: 3px; overflow: hidden; }
      #boss-bar .fill { height: 100%; width: 100%;
        background: linear-gradient(90deg, #ff3838, #a02020);
        transition: width 120ms linear; }
      #boss-warning { position: fixed; inset: 0; z-index: 11; pointer-events: none;
        display: flex; align-items: center; justify-content: center;
        color: #ff3838; font-family: system-ui, sans-serif; font-weight: 800;
        font-size: 42px; letter-spacing: 10px; text-shadow: 0 0 20px rgba(255,50,50,0.9);
        background: radial-gradient(ellipse at center, transparent 25%, rgba(180,10,10,0.55) 100%);
        opacity: 0; transition: opacity 180ms ease-out; }
      #boss-warning.show { opacity: 1; animation: boss-warning-pulse 0.3s ease-out 3; }
      @keyframes boss-warning-pulse {
        0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    parent.appendChild(this.root);
    parent.appendChild(this.warning);
    this.fill = this.root.querySelector('.fill') as HTMLDivElement;
    this.label = this.root.querySelector('.label') as HTMLDivElement;
  }

  flashWarning(): void {
    this.warning.classList.add('show');
    window.setTimeout(() => this.warning.classList.remove('show'), 1400);
  }

  update(boss: Enemy | null): void {
    if (!boss) { this.root.classList.add('hidden'); return; }
    this.root.classList.remove('hidden');
    const pct = (boss.hp / boss.maxHp) * 100;
    this.fill.style.width = `${Math.max(0, pct)}%`;
    this.label.textContent = `MINI BOSS  ${Math.ceil(boss.hp)} / ${boss.maxHp}`;
  }
}
