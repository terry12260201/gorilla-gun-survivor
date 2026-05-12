import type { UpgradeCard } from '../progression/UpgradeCards.js';

export class InventoryPanel {
  private root: HTMLDivElement;
  private listEl: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'inventory-panel';
    this.root.classList.add('hidden');
    this.root.innerHTML = `
      <div class="panel">
        <div class="title">已取得升級</div>
        <div class="hint">放開 TAB 關閉</div>
        <div class="list"></div>
      </div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      #inventory-panel { position: fixed; inset: 0; z-index: 17; background: rgba(6,8,14,0.55);
        display: flex; align-items: center; justify-content: center;
        color: #f4f4f8; font-family: system-ui, sans-serif; pointer-events: none; }
      #inventory-panel.hidden { display: none; }
      #inventory-panel .panel { background: #1a1d28; padding: 22px 28px; border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1); min-width: 360px; max-width: 560px;
        max-height: 70vh; overflow-y: auto; }
      #inventory-panel .title { font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #ffd14a;
        margin-bottom: 4px; }
      #inventory-panel .hint { font-size: 11px; opacity: 0.6; margin-bottom: 14px; letter-spacing: 0.5px; }
      #inventory-panel .list { display: flex; flex-direction: column; gap: 6px; }
      #inventory-panel .row { display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 6px; font-size: 13px; }
      #inventory-panel .row.rare { background: linear-gradient(90deg, rgba(170,90,230,0.18), rgba(170,90,230,0.05));
        border-left: 3px solid #a056e3; }
      #inventory-panel .row.weapon { background: linear-gradient(90deg, rgba(255,180,70,0.2), rgba(255,180,70,0.04));
        border-left: 3px solid #ffc55a; }
      #inventory-panel .row.weapon .name { color: #ffe7a8; }
      #inventory-panel .row.attribute { background: linear-gradient(90deg, rgba(90,220,210,0.18), rgba(90,220,210,0.04));
        border-left: 3px solid #5fddcc; }
      #inventory-panel .row.attribute .name { color: #a5f5ec; }
      #inventory-panel .row .name { flex: 1; }
      #inventory-panel .row .desc { opacity: 0.65; font-size: 12px; }
      #inventory-panel .row .count { background: #ffd14a; color: #20212b; font-weight: 700;
        padding: 2px 8px; border-radius: 3px; font-size: 11px; min-width: 28px; text-align: center; }
      #inventory-panel .empty { opacity: 0.6; font-size: 13px; padding: 8px 2px; }
    `;
    document.head.appendChild(style);
    parent.appendChild(this.root);
    this.listEl = this.root.querySelector('.list') as HTMLDivElement;
  }

  show(picked: Map<string, { card: UpgradeCard; count: number }>): void {
    this.listEl.innerHTML = '';
    if (picked.size === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = '尚未取得任何升級';
      this.listEl.appendChild(empty);
    } else {
      const rarityRank = { weapon: 0, attribute: 1, rare: 2, common: 3 } as const;
      const entries = Array.from(picked.values()).sort((a, b) =>
        rarityRank[a.card.rarity] - rarityRank[b.card.rarity],
      );
      for (const { card, count } of entries) {
        const row = document.createElement('div');
        row.className = `row ${card.rarity}`;
        row.innerHTML = `
          <div>
            <div class="name">${card.title}</div>
            <div class="desc">${card.desc}</div>
          </div>
          <div class="count">×${count}</div>
        `;
        // Use grid-like layout via class override
        (row.firstElementChild as HTMLDivElement).style.flex = '1';
        this.listEl.appendChild(row);
      }
    }
    this.root.classList.remove('hidden');
  }

  hide(): void { this.root.classList.add('hidden'); }
}
