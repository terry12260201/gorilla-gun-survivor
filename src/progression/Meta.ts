const KEY = 'gorilla-gun-survivor/meta/v2';

export type MetaUpgradeId = 'hp' | 'damage' | 'xp' | 'weapon';

export interface MetaData {
  essence: number;
  runsCompleted: number;
  bestTimeSec: number;
  bestKills: number;
  upgrades: Record<MetaUpgradeId, number>;
}

export interface MetaUpgradeDef {
  id: MetaUpgradeId;
  name: string;
  desc: string;
  icon: string;
  maxLevel: number;
  costs: number[]; // cost[i] is essence to buy level i+1
  effect: string;
}

export const META_UPGRADES: MetaUpgradeDef[] = [
  { id: 'hp', name: '肉身強化', icon: '🛡️', maxLevel: 5, costs: [8, 16, 28, 46, 72],
    desc: '每級起始 HP +15（總 +75）', effect: '起始 HP +15 / 級' },
  { id: 'damage', name: '基礎火力', icon: '⚔️', maxLevel: 5, costs: [8, 16, 28, 46, 72],
    desc: '每級子彈傷害 +3（總 +15）', effect: '子彈傷害 +3 / 級' },
  { id: 'xp', name: '經驗加乘', icon: '📈', maxLevel: 3, costs: [18, 40, 90],
    desc: '每顆經驗球 +1 XP（總 +3）', effect: '經驗球 +1 XP / 級' },
  { id: 'weapon', name: '起始副武器', icon: '🔫', maxLevel: 1, costs: [40],
    desc: '開局直接帶 1 把自動副武器（隨機）', effect: '隨機初始副武器' },
];

const defaults = (): MetaData => ({
  essence: 0,
  runsCompleted: 0,
  bestTimeSec: 0,
  bestKills: 0,
  upgrades: { hp: 0, damage: 0, xp: 0, weapon: 0 },
});

export function loadMeta(): MetaData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<MetaData>;
    const d = defaults();
    return {
      ...d,
      ...parsed,
      upgrades: { ...d.upgrades, ...(parsed.upgrades ?? {}) },
    };
  } catch { return defaults(); }
}

export function saveMeta(data: MetaData): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* quota / privacy */ }
}

export function nextCost(def: MetaUpgradeDef, currentLevel: number): number | null {
  if (currentLevel >= def.maxLevel) return null;
  return def.costs[currentLevel] ?? null;
}

export function computeRunEssence(kills: number, level: number, timeSec: number): number {
  return Math.floor(kills / 3) + Math.max(0, level - 1) * 2 + Math.floor(timeSec / 30);
}
