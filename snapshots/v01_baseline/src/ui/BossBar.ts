import type { Enemy } from '../enemy/Enemy.js';

export class BossBar {
  private root: HTMLDivElement;
  private fill: HTMLDivElement;
  private label: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'boss-bar';
    this.root.classList.add('hidden');
    this.root.innerHTML = `
      <div class="label"></div>
      <div class="bar"><div class="fill"></div></div>
    `;
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
    `;
    document.head.appendChild(style);
    parent.appendChild(this.root);
    this.fill = this.root.querySelector('.fill') as HTMLDivElement;
    this.label = this.root.querySelector('.label') as HTMLDivElement;
  }

  update(boss: Enemy | null): void {
    if (!boss) { this.root.classList.add('hidden'); return; }
    this.root.classList.remove('hidden');
    const pct = (boss.hp / boss.maxHp) * 100;
    this.fill.style.width = `${Math.max(0, pct)}%`;
    this.label.textContent = `MINI BOSS  ${Math.ceil(boss.hp)} / ${boss.maxHp}`;
  }
}
