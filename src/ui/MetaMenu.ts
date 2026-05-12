import { META_UPGRADES, nextCost, saveMeta, type MetaData } from '../progression/Meta.js';

export class MetaMenu {
  private root: HTMLDivElement;
  private onPlay: () => void = () => {};

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'meta-menu';
    this.root.classList.add('hidden');
    const style = document.createElement('style');
    style.textContent = `
      #meta-menu { position: fixed; inset: 0; z-index: 14; background: rgba(4,6,12,0.88);
        display: flex; align-items: center; justify-content: center;
        color: #f4f4f8; font-family: system-ui, sans-serif; }
      #meta-menu.hidden { display: none; }
      #meta-menu .panel { background: #16181f; padding: 26px 36px; border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08); width: 640px; max-width: 92vw; max-height: 86vh;
        overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
      #meta-menu h1 { margin: 0; letter-spacing: 4px; font-size: 22px; color: #ffd14a;
        text-shadow: 0 0 10px rgba(255,210,80,0.4); text-align: center; }
      #meta-menu .sub { font-size: 12px; opacity: 0.7; text-align: center; margin-top: -8px; letter-spacing: 1px; }
      #meta-menu .essence-line { display: flex; align-items: center; justify-content: center;
        gap: 10px; font-size: 18px; background: linear-gradient(90deg, rgba(255,210,80,0.08), rgba(255,210,80,0.18), rgba(255,210,80,0.08));
        padding: 8px; border-radius: 6px; }
      #meta-menu .essence-line .num { color: #ffd14a; font-weight: 700; font-variant-numeric: tabular-nums; }
      #meta-menu .upgrades { display: flex; flex-direction: column; gap: 8px; }
      #meta-menu .upgrade { display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; align-items: center;
        background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 6px;
        border-left: 3px solid #4a5; }
      #meta-menu .upgrade.maxed { border-left-color: #ffd14a; opacity: 0.75; }
      #meta-menu .upgrade.locked { border-left-color: #555; opacity: 0.55; }
      #meta-menu .upgrade .icon { font-size: 24px; text-align: center; }
      #meta-menu .upgrade .info { display: flex; flex-direction: column; gap: 2px; }
      #meta-menu .upgrade .name { font-weight: 700; }
      #meta-menu .upgrade .desc { font-size: 12px; opacity: 0.75; }
      #meta-menu .upgrade .level { font-size: 11px; opacity: 0.6; letter-spacing: 0.5px; }
      #meta-menu .upgrade .buy { background: #2bb158; color: #fff; border: 0; padding: 8px 14px;
        border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 700; min-width: 74px; }
      #meta-menu .upgrade .buy:hover:not(:disabled) { background: #3ce06a; }
      #meta-menu .upgrade .buy:disabled { background: #3a3a44; color: #888; cursor: not-allowed; }
      #meta-menu .stats { display: flex; justify-content: space-around; font-size: 12px; opacity: 0.72;
        padding: 8px; border-top: 1px solid rgba(255,255,255,0.08); }
      #meta-menu .play { background: linear-gradient(90deg, #ffb74a, #ff7a3a);
        color: #1a1d28; border: 0; padding: 14px; border-radius: 6px; font-size: 18px; font-weight: 800;
        letter-spacing: 6px; cursor: pointer; text-transform: uppercase; }
      #meta-menu .play:hover { filter: brightness(1.1); transform: translateY(-1px); }
    `;
    document.head.appendChild(style);
    parent.appendChild(this.root);
  }

  show(meta: MetaData, onPlay: () => void): void {
    this.onPlay = onPlay;
    this.render(meta);
    this.root.classList.remove('hidden');
  }

  hide(): void { this.root.classList.add('hidden'); }

  private render(meta: MetaData): void {
    this.root.innerHTML = `
      <div class="panel">
        <h1>GORILLA GUN SURVIVOR</h1>
        <div class="sub">花 Essence 永久強化起始狀態</div>
        <div class="essence-line">💎 Essence <span class="num">${meta.essence}</span></div>
        <div class="upgrades"></div>
        <div class="stats">
          <div>Runs: <b>${meta.runsCompleted}</b></div>
          <div>Best Time: <b>${Math.floor(meta.bestTimeSec)}s</b></div>
          <div>Best Kills: <b>${meta.bestKills}</b></div>
        </div>
        <button class="play">PLAY</button>
      </div>
    `;
    const list = this.root.querySelector('.upgrades') as HTMLDivElement;
    for (const def of META_UPGRADES) {
      const lvl = meta.upgrades[def.id];
      const cost = nextCost(def, lvl);
      const row = document.createElement('div');
      row.className = 'upgrade';
      if (cost === null) row.classList.add('maxed');
      else if (cost > meta.essence) row.classList.add('locked');
      row.innerHTML = `
        <div class="icon">${def.icon}</div>
        <div class="info">
          <div class="name">${def.name} <span class="level">Lv ${lvl} / ${def.maxLevel}</span></div>
          <div class="desc">${def.desc}</div>
        </div>
        <button class="buy">${cost === null ? 'MAX' : `${cost} 💎`}</button>
      `;
      const btn = row.querySelector('.buy') as HTMLButtonElement;
      btn.disabled = cost === null || cost > meta.essence;
      btn.addEventListener('click', () => {
        if (cost === null || cost > meta.essence) return;
        meta.essence -= cost;
        meta.upgrades[def.id] = lvl + 1;
        saveMeta(meta);
        this.render(meta);
      });
      list.appendChild(row);
    }
    (this.root.querySelector('.play') as HTMLButtonElement).addEventListener('click', () => {
      this.hide();
      this.onPlay();
    });
  }
}
