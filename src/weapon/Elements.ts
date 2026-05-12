export type Element = 'fire' | 'ice' | 'poison' | 'lightning';
export const ELEMENTS: Element[] = ['fire', 'ice', 'poison', 'lightning'];

export interface ElementTierData {
  desc: string;
  // Fire
  burnDps?: number;
  burnDuration?: number;
  // Ice
  slowMul?: number;
  slowDuration?: number;
  // Poison
  cloudRadius?: number;
  cloudDps?: number;
  cloudDuration?: number;
  // Lightning
  chainTargets?: number;
  chainDamage?: number;
}

export interface ElementData {
  name: string;
  icon: string;
  color: [number, number, number]; // bullet tint
  tiers: ElementTierData[];
}

export const ELEMENT_DATA: Record<Element, ElementData> = {
  fire: {
    name: '灼傷', icon: '🔥', color: [1.0, 0.4, 0.1],
    tiers: [
      { desc: '命中時附加灼燒：每秒 5 傷，持續 3 秒', burnDps: 5, burnDuration: 3 },
      { desc: '灼燒升級：每秒 10 傷，持續 3 秒', burnDps: 10, burnDuration: 3 },
      { desc: '猛烈灼燒：每秒 18 傷，持續 4 秒', burnDps: 18, burnDuration: 4 },
    ],
  },
  ice: {
    name: '冰凍', icon: '❄️', color: [0.5, 0.9, 1.0],
    tiers: [
      { desc: '命中時減速目標 40%，持續 2 秒', slowMul: 0.6, slowDuration: 2 },
      { desc: '減速 55%，持續 2.5 秒', slowMul: 0.45, slowDuration: 2.5 },
      { desc: '嚴寒：減速 75%，持續 3.5 秒', slowMul: 0.25, slowDuration: 3.5 },
    ],
  },
  poison: {
    name: '毒霧', icon: '☠️', color: [0.4, 1.0, 0.3],
    tiers: [
      { desc: '命中處噴出 3m 毒雲：5 DPS × 3 秒', cloudRadius: 3, cloudDps: 5, cloudDuration: 3 },
      { desc: '4m 毒雲：10 DPS × 4 秒', cloudRadius: 4, cloudDps: 10, cloudDuration: 4 },
      { desc: '5m 劇毒雲：18 DPS × 5 秒', cloudRadius: 5, cloudDps: 18, cloudDuration: 5 },
    ],
  },
  lightning: {
    name: '雷擊', icon: '⚡', color: [0.85, 0.7, 1.0],
    tiers: [
      { desc: '命中時連鎖 2 隻敵人，各 12 傷', chainTargets: 2, chainDamage: 12 },
      { desc: '連鎖 3 隻敵人，各 20 傷', chainTargets: 3, chainDamage: 20 },
      { desc: '連鎖 5 隻敵人，各 30 傷', chainTargets: 5, chainDamage: 30 },
    ],
  },
};
