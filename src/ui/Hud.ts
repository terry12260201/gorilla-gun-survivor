import type { PlayerHealth } from '../player/PlayerHealth.js';
import type { EnemyManager } from '../enemy/EnemyManager.js';
import type { LevelSystem } from '../progression/LevelSystem.js';
import type { MetaData } from '../progression/Meta.js';
import type { AutoWeaponManager } from '../weapon/AutoWeaponManager.js';
import type { UpgradeCard } from '../progression/UpgradeCards.js';

export interface GameOverSummary {
  kills: number;
  elapsed: number;
  level: number;
  essenceEarned: number;
  meta: MetaData;
  weapons: AutoWeaponManager;
  pickedCards: Map<string, { card: UpgradeCard; count: number }>;
  prevBestTime: number;
  prevBestKills: number;
}

const HIT_FLASH_DURATION = 0.25;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export class Hud {
  private root: HTMLDivElement;
  private hpFill: HTMLDivElement;
  private shieldFill: HTMLDivElement;
  private hpText: HTMLDivElement;
  private xpFill: HTMLDivElement;
  private xpText: HTMLDivElement;
  private levelBadge: HTMLDivElement;
  private stats: HTMLDivElement;
  private damageVignette: HTMLDivElement;
  private hitFlashTimer = 0;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'game-hud';
    this.root.innerHTML = `
      <div class="xp-row">
        <div class="level-badge"></div>
        <div class="xp-bar"><div class="xp-fill"></div></div>
        <div class="xp-text"></div>
      </div>
      <div class="hp-wrap">
        <div class="hp-bar">
          <div class="hp-fill"></div>
          <div class="shield-fill"></div>
        </div>
        <div class="hp-text"></div>
      </div>
      <div class="stats"></div>
    `;
    this.damageVignette = document.createElement('div');
    this.damageVignette.id = 'damage-vignette';
    const style = document.createElement('style');
    style.textContent = `
      #game-hud { position: fixed; left: 16px; bottom: 16px; z-index: 6;
        font-family: system-ui, sans-serif; color: #eee; pointer-events: none;
        display: flex; flex-direction: column; gap: 6px; }
      #game-hud .xp-row { display: flex; align-items: center; gap: 10px; }
      #game-hud .level-badge { background: #ffd14a; color: #20212b; font-weight: 700;
        font-size: 12px; padding: 2px 8px; border-radius: 3px; min-width: 48px; text-align: center;
        font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }
      #game-hud .xp-bar { width: 220px; height: 10px; background: rgba(0,0,0,0.55);
        border: 1px solid rgba(255,255,255,0.25); border-radius: 3px; overflow: hidden; }
      #game-hud .xp-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #66ff99, #3ec97a);
        transition: width 140ms linear; }
      #game-hud .xp-text { font-size: 12px; font-variant-numeric: tabular-nums; opacity: 0.85; }
      #game-hud .hp-wrap { display: flex; align-items: center; gap: 10px; }
      #game-hud .hp-bar { position: relative; width: 220px; height: 14px; background: rgba(0,0,0,0.55);
        border: 1px solid rgba(255,255,255,0.25); border-radius: 3px; overflow: hidden; }
      #game-hud .hp-fill { position: absolute; inset: 0; height: 100%; width: 100%;
        background: linear-gradient(90deg, #3ce06a, #2bb158); transition: width 120ms linear; }
      #game-hud .shield-fill { position: absolute; top: 0; left: 0; height: 100%; width: 0%;
        background: linear-gradient(90deg, rgba(255,255,255,0.95), rgba(210,230,255,0.8));
        border-right: 1px solid rgba(255,255,255,0.7); transition: width 100ms linear, left 100ms linear; }
      #game-hud .hp-text { font-size: 13px; font-variant-numeric: tabular-nums; }
      #game-hud .stats { font-size: 13px; opacity: 0.85; font-variant-numeric: tabular-nums;
        background: rgba(0,0,0,0.35); padding: 4px 8px; border-radius: 4px; width: fit-content; }
      #damage-vignette { position: fixed; inset: 0; z-index: 4; pointer-events: none; opacity: 0;
        background: radial-gradient(ellipse at center, transparent 40%, rgba(220,20,20,0.85) 100%); }
    `;
    document.head.appendChild(style);
    parent.appendChild(this.damageVignette);
    parent.appendChild(this.root);

    this.levelBadge = this.root.querySelector('.level-badge') as HTMLDivElement;
    this.xpFill = this.root.querySelector('.xp-fill') as HTMLDivElement;
    this.xpText = this.root.querySelector('.xp-text') as HTMLDivElement;
    this.hpFill = this.root.querySelector('.hp-fill') as HTMLDivElement;
    this.shieldFill = this.root.querySelector('.shield-fill') as HTMLDivElement;
    this.hpText = this.root.querySelector('.hp-text') as HTMLDivElement;
    this.stats = this.root.querySelector('.stats') as HTMLDivElement;
  }

  flashHit(): void { this.hitFlashTimer = HIT_FLASH_DURATION; }

  update(
    health: PlayerHealth,
    enemies: EnemyManager,
    level: LevelSystem,
    elapsed: number,
    dt: number,
  ): void {
    const hpPct = (health.hp / health.max) * 100;
    this.hpFill.style.width = `${hpPct}%`;
    this.hpFill.style.background = hpPct > 35
      ? 'linear-gradient(90deg, #3ce06a, #2bb158)'
      : 'linear-gradient(90deg, #ff5252, #b53030)';
    // Shield bar overlays the HP bar (bar width is fraction of total health+shield relative scale)
    const shieldPct = health.shieldMax > 0
      ? (health.shield / (health.max + health.shieldMax)) * 100
      : 0;
    const hpTotalPct = (health.hp / (health.max + health.shieldMax)) * 100;
    this.hpFill.style.width = `${hpTotalPct}%`;
    this.shieldFill.style.width = `${shieldPct}%`;
    this.shieldFill.style.left = `${hpTotalPct}%`;
    this.hpText.textContent = `HP ${Math.ceil(health.hp)} / ${health.max}  ·  Shield ${Math.ceil(health.shield)}`;

    const xpNext = level.toNext();
    this.xpFill.style.width = `${(level.xp / xpNext) * 100}%`;
    this.xpText.textContent = `${level.xp} / ${xpNext}`;
    this.levelBadge.textContent = `LV ${level.level}`;

    const mm = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const ss = Math.floor(elapsed % 60).toString().padStart(2, '0');
    const wpnCount = (window as unknown as { __game?: { weapons?: { count: number; max: number } } }).__game?.weapons;
    const wpnTxt = wpnCount ? `  ·  Wpns ${wpnCount.count}/${wpnCount.max}` : '';
    this.stats.textContent = `Time ${mm}:${ss}  ·  Kills ${enemies.kills}  ·  Enemies ${enemies.count}${wpnTxt}`;

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
      this.damageVignette.style.opacity = String(this.hitFlashTimer / HIT_FLASH_DURATION);
    }
  }

  showGameOver(s: GameOverSummary): void {
    const mm = Math.floor(s.elapsed / 60).toString().padStart(2, '0');
    const ss = Math.floor(s.elapsed % 60).toString().padStart(2, '0');
    const bmm = Math.floor(s.prevBestTime / 60).toString().padStart(2, '0');
    const bss = Math.floor(s.prevBestTime % 60).toString().padStart(2, '0');
    const newBestTime = s.elapsed > s.prevBestTime;
    const newBestKills = s.kills > s.prevBestKills;

    // Weapons: Main Gun (always) + auto weapons
    const weaponRows: string[] = ['<li><span class="wep-ico">●</span>Main Gun</li>'];
    for (const w of s.weapons.weapons) {
      weaponRows.push(`<li><span class="wep-ico">◆</span>${escapeHtml(w.spec.title)}</li>`);
    }

    // Upgrades: pickedCards minus weapon-rarity cards
    const upgradeRows: string[] = [];
    for (const { card, count } of s.pickedCards.values()) {
      if (card.rarity === 'weapon') continue;
      const x = count > 1 ? ` <span class="x">×${count}</span>` : '';
      upgradeRows.push(`<li>${escapeHtml(card.title)}${x}</li>`);
    }
    if (upgradeRows.length === 0) upgradeRows.push('<li class="empty">（無）</li>');

    const starTime = newBestTime ? ' ⭐' : '';
    const starKills = newBestKills ? ' ⭐' : '';

    const end = document.createElement('div');
    end.id = 'game-over';
    end.innerHTML = `
      <div class="panel">
        <h1>You Died</h1>
        <div class="row">
          <span>Time <b>${mm}:${ss}</b></span>
          <span class="sep">·</span>
          <span>Kills <b>${s.kills}</b></span>
          <span class="sep">·</span>
          <span>Level <b>${s.level}</b></span>
        </div>
        <div class="essence">+${s.essenceEarned} Essence</div>

        <div class="best">
          <div class="best-col">
            <div class="best-label">This Run</div>
            <div class="best-row ${newBestTime ? 'new-best' : ''}">Time <b>${mm}:${ss}</b>${starTime}</div>
            <div class="best-row ${newBestKills ? 'new-best' : ''}">Kills <b>${s.kills}</b>${starKills}</div>
          </div>
          <div class="best-col">
            <div class="best-label">Best Ever</div>
            <div class="best-row">Time <b>${bmm}:${bss}</b></div>
            <div class="best-row">Kills <b>${s.prevBestKills}</b></div>
          </div>
        </div>

        <div class="lists">
          <div class="list-col">
            <div class="list-title">Weapons</div>
            <ul>${weaponRows.join('')}</ul>
          </div>
          <div class="list-col">
            <div class="list-title">Upgrades</div>
            <ul>${upgradeRows.join('')}</ul>
          </div>
        </div>

        <div class="meta">
          <div>Total Essence: <b>${s.meta.essence}</b> &nbsp; Runs: <b>${s.meta.runsCompleted}</b></div>
        </div>
        <button id="restart">Restart</button>
      </div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      #game-over { position: fixed; inset: 0; z-index: 20; background: rgba(0,0,0,0.78);
        display: flex; align-items: center; justify-content: center; color: #eee;
        font-family: system-ui, sans-serif; }
      #game-over .panel { background: #1a1d28; padding: 26px 40px; border-radius: 10px;
        text-align: center; border: 1px solid rgba(255,255,255,0.1);
        min-width: 600px; max-width: 720px; }
      #game-over h1 { margin: 0 0 12px 0; color: #ff6363; letter-spacing: 2px; }
      #game-over .row { margin: 4px 0 10px 0; opacity: 0.92; font-size: 14px;
        display: flex; justify-content: center; align-items: center; gap: 10px; }
      #game-over .row .sep { opacity: 0.4; }
      #game-over .row b { color: #f4f4f8; font-variant-numeric: tabular-nums; }
      #game-over .essence { color: #ffd14a; font-size: 20px; font-weight: 700; margin: 6px 0 16px 0;
        text-shadow: 0 0 10px rgba(255,210,80,0.5); }
      #game-over .best { display: flex; justify-content: center; gap: 28px; margin: 0 0 18px 0;
        background: rgba(0,0,0,0.3); padding: 10px 16px; border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.08); }
      #game-over .best-col { min-width: 160px; }
      #game-over .best-label { font-size: 11px; letter-spacing: 2px; opacity: 0.55; margin-bottom: 4px; }
      #game-over .best-row { font-size: 13px; opacity: 0.88; line-height: 1.5;
        font-variant-numeric: tabular-nums; }
      #game-over .best-row b { color: #f4f4f8; }
      #game-over .best-row.new-best { color: #66ff99; font-weight: 700; opacity: 1; }
      #game-over .best-row.new-best b { color: #66ff99; }
      #game-over .lists { display: flex; gap: 22px; margin: 0 0 16px 0;
        text-align: left; }
      #game-over .list-col { flex: 1; background: rgba(0,0,0,0.28);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px 14px;
        min-height: 110px; }
      #game-over .list-title { font-size: 11px; letter-spacing: 2px; opacity: 0.55;
        margin-bottom: 6px; text-align: center; }
      #game-over ul { list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 1.55;
        max-height: 160px; overflow-y: auto; }
      #game-over li { opacity: 0.92; }
      #game-over li.empty { opacity: 0.35; font-style: italic; }
      #game-over li .x { color: #ffd14a; font-variant-numeric: tabular-nums; margin-left: 4px; }
      #game-over .wep-ico { display: inline-block; width: 14px; opacity: 0.7; color: #7ecaff;
        margin-right: 4px; }
      #game-over .meta { font-size: 12px; opacity: 0.7; line-height: 1.6; margin-bottom: 16px; }
      #game-over .meta b { color: #f4f4f8; }
      #game-over button { background: #2bb158; color: #fff; border: 0; padding: 10px 28px;
        border-radius: 4px; font-size: 15px; cursor: pointer; letter-spacing: 2px; }
      #game-over button:hover { background: #3ce06a; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(end);
    end.querySelector('#restart')?.addEventListener('click', () => location.reload());
  }
}
