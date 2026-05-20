import type { Game } from '../core/Game.js';
import { WEAPON_SPECS } from '../weapon/AutoWeaponSpec.js';
import { ELEMENTS, ELEMENT_DATA, type Element } from '../weapon/Elements.js';

export type Rarity = 'common' | 'rare' | 'weapon' | 'attribute';

export interface UpgradeCard {
  id: string;
  title: string;
  desc: string;
  rarity: Rarity;
  unique?: boolean;
  canPick?: (game: Game) => boolean;
  /**
   * Optional per-card weight override. If returned value is undefined, the
   * default `RARITY_WEIGHT[rarity]` is used. Returning 0 effectively filters
   * the card (same as canPick=false). Used for diminishing-returns cards like
   * `move_speed` that should taper at high stack counts before being fully
   * filtered.
   */
  getWeight?: (game: Game) => number | undefined;
  apply: (game: Game) => void;
}

const WEAPON_CARDS: UpgradeCard[] = WEAPON_SPECS.map((spec) => ({
  id: spec.id,
  title: `副武器：${spec.title}`,
  desc: `${spec.desc} · DMG ×${spec.damageMul} · RoF ${spec.fireRate}/s · 射程 ${spec.range}m`,
  rarity: 'weapon' as const,
  unique: true,
  canPick: (g: Game) => !g.weapons.isFull && !g.weapons.hasWeapon(spec.id),
  apply: (g: Game) => { g.weapons.addWeapon(spec); },
}));

export const CARDS: UpgradeCard[] = [
  // --- Common ---
  {
    id: 'damage',
    title: '更重火力',
    desc: '子彈傷害 +10',
    rarity: 'common',
    apply: (g) => { g.projectiles.damage += 10; },
  },
  {
    id: 'fire_rate',
    title: '扣扳機加速',
    desc: '主武器射速 +1.2 / 秒',
    rarity: 'common',
    apply: (g) => { g.gun.fireRate += 1.2; },
  },
  {
    id: 'move_speed',
    title: '靈敏爪掌',
    desc: '移動速度 +1.2 m/s',
    rarity: 'common',
    // Diminishing returns + hard cap per Terry decision (2026-05-19 OPEN-1):
    // - Picks 1-3: full weight (0.85)
    // - Picks 4-5: tapered weight (0.20) — still possible but unlikely
    // - Picks 6+: filtered out entirely (gameplay break: faster than all enemies)
    // Tracked via `pickedCards.get('move_speed').count` (incremented after apply).
    canPick: (g) => (g.pickedCards.get('move_speed')?.count ?? 0) < 6,
    getWeight: (g) => {
      const count = g.pickedCards.get('move_speed')?.count ?? 0;
      if (count >= 6) return 0;       // belt + suspenders with canPick
      if (count >= 4) return 0.2;     // tapered
      return 0.85;                    // baseline (slightly below other commons)
    },
    apply: (g) => { g.player.moveSpeed += 1.2; },
  },
  {
    id: 'max_hp',
    title: '厚實皮毛',
    desc: '最大 HP +25（回滿）',
    rarity: 'common',
    apply: (g) => { g.health.max += 25; g.health.hp = g.health.max; },
  },
  {
    id: 'bullet_speed',
    title: '加膛壓',
    desc: '子彈速度 +40%',
    rarity: 'common',
    apply: (g) => { g.projectiles.speedMultiplier *= 1.4; },
  },
  {
    id: 'heal',
    title: '喘口氣',
    desc: '立即回復 40 HP',
    rarity: 'common',
    // Gate: don't show heal card when player is already at full HP.
    // Avoids the "wasted draw" feel — at full HP this card has zero effect.
    // Closes openspec/specs/cards/heal.md "Open Questions" #1.
    canPick: (g) => g.health.hp < g.health.max,
    apply: (g) => { g.health.hp = Math.min(g.health.max, g.health.hp + 40); },
  },
  {
    id: 'double_shot',
    title: '雙連發',
    desc: '主武器每次多發 1 顆子彈（可疊加）',
    rarity: 'common',
    apply: (g) => { g.gun.bulletsPerShot += 1; },
  },
  {
    id: 'big_bullets',
    title: '巨彈',
    desc: '子彈體積 ×1.7（可疊加）',
    rarity: 'common',
    apply: (g) => { g.projectiles.bulletScale *= 1.7; },
  },
  {
    id: 'xp_magnet',
    title: '貪婪吸取',
    desc: '經驗球吸附範圍 +3m（可疊加）',
    rarity: 'common',
    apply: (g) => { g.xpOrbs.magnetRange += 3; },
  },

  // --- Rare ---
  {
    id: 'homing',
    title: '獵頭追蹤',
    desc: '子彈自動追擊敵人',
    rarity: 'rare',
    apply: (g) => { g.projectiles.homing = true; g.projectiles.homingStrength = Math.max(g.projectiles.homingStrength, 3.5); },
  },
  {
    id: 'homing_up',
    title: '追擊強化',
    desc: '追擊轉向速度 +1.5',
    rarity: 'rare',
    // Gate: only show this card if player has already enabled homing via the
    // `homing` card. Otherwise the +1.5 strength has no effect (homing=false
    // means projectiles ignore homingStrength entirely), which is a trap UX.
    // Closes openspec/specs/cards/homing_up.md "Open Questions" #1.
    canPick: (g) => g.projectiles.homing,
    apply: (g) => { g.projectiles.homingStrength += 1.5; },
  },
  {
    id: 'bounce',
    title: '彈跳彈',
    desc: '子彈擊中後彈到下個敵人（+2 彈跳）',
    rarity: 'rare',
    apply: (g) => { g.projectiles.bouncesOnHit += 2; },
  },
  {
    id: 'lightning_strike',
    title: '雷霆 I',
    desc: '命中時 20% 機率召喚閃電落下',
    rarity: 'rare',
    apply: (g) => { g.lightningChance += 0.2; },
  },
  {
    id: 'lightning_storm',
    title: '雷霆 II · 雷暴',
    desc: '命中時 15% 機率召喚 5 道連續落雷',
    rarity: 'rare',
    apply: (g) => { g.lightningStormChance += 0.15; },
  },
  {
    id: 'chain_arc',
    title: '閃電鞭',
    desc: '命中時 25% 機率觸發電弧，連鎖 3 隻敵人',
    rarity: 'rare',
    apply: (g) => { g.chainArcChance += 0.25; },
  },

  // --- Weapons ---
  ...WEAPON_CARDS,
];

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 1.0,
  rare: 0.35,
  weapon: 0.25,
  attribute: 0.55,
};

function generateAttributeCards(game: Game): UpgradeCard[] {
  const cards: UpgradeCard[] = [];
  for (const weapon of game.weapons.weapons) {
    for (const element of ELEMENTS) {
      const currentTier = weapon.attributes.get(element) ?? 0;
      const attrCount = weapon.attributes.size;
      if (currentTier >= 3) continue;
      if (currentTier === 0 && attrCount >= 2) continue;
      const nextTier = currentTier + 1;
      const data = ELEMENT_DATA[element];
      const info = data.tiers[nextTier - 1];
      const prefix = currentTier === 0
        ? `${data.icon} ${data.name} T1`
        : `${data.icon} ${data.name} T${currentTier}→T${nextTier}`;
      cards.push({
        id: `attr_${weapon.spec.id}_${element}_t${nextTier}`,
        title: `${prefix}`,
        desc: `【${weapon.spec.title}】${info.desc}`,
        rarity: 'attribute',
        unique: true,
        apply: () => { weapon.attributes.set(element as Element, nextTier); },
      });
    }
  }
  return cards;
}

export function pickThree(game: Game): UpgradeCard[] {
  const allCards = [...CARDS, ...generateAttributeCards(game)];
  const eligible = allCards.filter((c) => {
    if (c.unique && game.pickedCards.has(c.id)) return false;
    if (c.canPick && !c.canPick(game)) return false;
    return true;
  });
  const weighted = eligible
    .map((c) => {
      // Per-card override wins; fall back to rarity default.
      const overrideW = c.getWeight ? c.getWeight(game) : undefined;
      const w = overrideW !== undefined ? overrideW : RARITY_WEIGHT[c.rarity];
      return { card: c, w };
    })
    .filter((e) => e.w > 0); // belt-and-suspenders: 0-weight = filtered
  const out: UpgradeCard[] = [];
  while (out.length < 3 && weighted.length > 0) {
    const total = weighted.reduce((s, e) => s + e.w, 0);
    let roll = Math.random() * total;
    let idx = 0;
    for (; idx < weighted.length; idx++) {
      roll -= weighted[idx].w;
      if (roll <= 0) break;
    }
    if (idx >= weighted.length) idx = weighted.length - 1;
    out.push(weighted[idx].card);
    weighted.splice(idx, 1);
  }
  return out;
}
