import type { UpgradeCard } from '../progression/UpgradeCards.js';

export class UpgradePanel {
  private root: HTMLDivElement;
  private cardsEl: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'upgrade-panel';
    this.root.classList.add('hidden');
    this.root.innerHTML = `
      <div class="level-up-label">LEVEL UP</div>
      <div class="prompt">選擇一張升級</div>
      <div class="cards"></div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      #upgrade-panel { position: fixed; inset: 0; z-index: 15; background: rgba(8,10,18,0.82);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: #f4f4f8; font-family: system-ui, sans-serif; gap: 14px; }
      #upgrade-panel.hidden { display: none; }
      #upgrade-panel .level-up-label { font-size: 34px; letter-spacing: 8px; font-weight: 700;
        color: #ffd14a; text-shadow: 0 0 18px rgba(255,210,80,0.5); }
      #upgrade-panel .prompt { font-size: 14px; opacity: 0.75; margin-bottom: 8px; }
      #upgrade-panel .cards { display: flex; gap: 16px; }
      #upgrade-panel .card { position: relative; width: 200px; padding: 22px 18px 20px 18px;
        background: linear-gradient(180deg, #262a3b 0%, #1a1d2b 100%);
        border: 1px solid rgba(255,255,255,0.14); border-radius: 10px; cursor: pointer;
        display: flex; flex-direction: column; gap: 10px;
        transition: transform 100ms, border-color 100ms, box-shadow 100ms; }
      #upgrade-panel .card:hover { transform: translateY(-4px); border-color: #ffd14a;
        box-shadow: 0 6px 22px rgba(255,210,80,0.25); }
      #upgrade-panel .card .title { font-size: 17px; font-weight: 600; }
      #upgrade-panel .card .desc { font-size: 13px; opacity: 0.82; line-height: 1.4; }
      #upgrade-panel .card .tag { position: absolute; top: 8px; right: 10px;
        font-size: 10px; letter-spacing: 1.5px; padding: 2px 6px; border-radius: 3px; font-weight: 700; }

      #upgrade-panel .card.rare {
        background: linear-gradient(180deg, #3c2a55 0%, #1c1530 100%);
        border-color: rgba(200, 130, 255, 0.55);
        box-shadow: 0 0 18px rgba(170, 90, 230, 0.28) inset, 0 0 12px rgba(170, 90, 230, 0.18); }
      #upgrade-panel .card.rare:hover {
        transform: translateY(-4px); border-color: #d5a6ff;
        box-shadow: 0 6px 22px rgba(200, 130, 255, 0.45), 0 0 18px rgba(170, 90, 230, 0.4) inset; }
      #upgrade-panel .card.rare .title { color: #e8c7ff; }
      #upgrade-panel .card.rare .tag { background: #a056e3; color: #fff; }

      #upgrade-panel .card.weapon {
        background: linear-gradient(180deg, #4d3a1a 0%, #271b08 100%);
        border-color: rgba(255, 200, 90, 0.7);
        box-shadow: 0 0 22px rgba(255, 180, 70, 0.3) inset, 0 0 16px rgba(255, 180, 70, 0.25); }
      #upgrade-panel .card.weapon:hover {
        transform: translateY(-4px); border-color: #ffd773;
        box-shadow: 0 6px 26px rgba(255, 210, 100, 0.55), 0 0 22px rgba(255, 180, 70, 0.5) inset; }
      #upgrade-panel .card.weapon .title { color: #ffe7a8; text-shadow: 0 0 8px rgba(255, 200, 90, 0.35); }
      #upgrade-panel .card.weapon .tag { background: linear-gradient(90deg, #ffc55a, #ff9c3d); color: #2a1d05; }

      #upgrade-panel .card.attribute {
        background: linear-gradient(180deg, #1a3f4a 0%, #0d2129 100%);
        border-color: rgba(120, 220, 220, 0.6);
        box-shadow: 0 0 16px rgba(90, 210, 210, 0.22) inset, 0 0 10px rgba(90, 210, 210, 0.15); }
      #upgrade-panel .card.attribute:hover {
        transform: translateY(-4px); border-color: #8af3e7;
        box-shadow: 0 6px 22px rgba(120, 230, 230, 0.45), 0 0 18px rgba(90, 210, 210, 0.4) inset; }
      #upgrade-panel .card.attribute .title { color: #a5f5ec; }
      #upgrade-panel .card.attribute .tag { background: #1d8f86; color: #e8fffc; }

      #upgrade-panel .card.common .tag { background: #445; color: #bfc3d5; }
    `;
    document.head.appendChild(style);
    parent.appendChild(this.root);
    this.cardsEl = this.root.querySelector('.cards') as HTMLDivElement;
  }

  show(cards: UpgradeCard[], onPick: (card: UpgradeCard) => void): void {
    this.cardsEl.innerHTML = '';
    for (const card of cards) {
      const el = document.createElement('div');
      el.className = `card ${card.rarity}`;
      const label =
        card.rarity === 'weapon' ? 'WEAPON' :
        card.rarity === 'attribute' ? 'ATTR' :
        card.rarity === 'rare' ? 'RARE' : 'COMMON';
      // Strip leading rarity tag in title (legacy text ⟨稀有⟩ prefix) since we now use a proper tag.
      const cleanTitle = card.title.replace(/^⟨稀有⟩\s*/, '');
      el.innerHTML = `
        <div class="tag">${label}</div>
        <div class="title">${cleanTitle}</div>
        <div class="desc">${card.desc}</div>
      `;
      el.addEventListener('click', () => onPick(card));
      this.cardsEl.appendChild(el);
    }
    this.root.classList.remove('hidden');
  }

  hide(): void { this.root.classList.add('hidden'); }
}
