export type EnemyType =
  | 'grunt' | 'fast' | 'scout' | 'heavy'
  | 'ranged' | 'caster' | 'brute' | 'miniboss';

export interface RangedConfig {
  cooldown: number;        // seconds between shots
  fireRange: number;       // max distance to fire
  keepDistance: number;    // preferred distance from player
  projectileSpeed: number;
  projectileDamage: number;
  projectileColor: [number, number, number];
  projectileSize: number;  // visual scale
}

export interface EnemyTypeData {
  type: EnemyType;
  url: string;
  hp: number;
  speed: number;
  touchDamage: number;     // 0 for pure ranged units
  radius: number;
  height: number;          // target scale height
  ranged?: RangedConfig;
  weight: number;          // spawn probability weight
  unlockAt: number;        // seconds of game time before spawnable
  boss?: boolean;          // mini-boss flagged for special rules / fewer instances
  xpOrbs: number;          // base XP orbs dropped on kill
}

export const ENEMY_TYPES: Record<EnemyType, EnemyTypeData> = {
  grunt: {
    type: 'grunt',
    url: '/assets/monster/enemy_b_03.glb',
    hp: 45, speed: 2.0, touchDamage: 5, radius: 0.6, height: 1.5,
    weight: 1.0, unlockAt: 0, xpOrbs: 1,
  },
  fast: {
    type: 'fast',
    url: '/assets/monster/enemy_c_01.glb',
    hp: 32, speed: 3.5, touchDamage: 4, radius: 0.45, height: 1.2,
    weight: 0.8, unlockAt: 15, xpOrbs: 1,
  },
  scout: {
    type: 'scout',
    url: '/assets/monster/enemy_c_02.glb',
    hp: 38, speed: 2.8, touchDamage: 5, radius: 0.5, height: 1.3,
    weight: 0.7, unlockAt: 30, xpOrbs: 1,
  },
  heavy: {
    type: 'heavy',
    url: '/assets/monster/enemy_c_03.glb',
    hp: 130, speed: 1.5, touchDamage: 10, radius: 0.8, height: 1.8,
    weight: 0.4, unlockAt: 50, xpOrbs: 2,
  },
  ranged: {
    type: 'ranged',
    url: '/assets/monster/enemy_e_02.glb',
    hp: 60, speed: 1.2, touchDamage: 0, radius: 0.55, height: 1.5,
    ranged: {
      cooldown: 2.5, fireRange: 14, keepDistance: 9,
      projectileSpeed: 14, projectileDamage: 10,
      projectileColor: [0.9, 0.3, 1.0], projectileSize: 1.0,
    },
    weight: 0.5, unlockAt: 35, xpOrbs: 2,
  },
  caster: {
    type: 'caster',
    url: '/assets/monster/enemy_e_03.glb',
    hp: 85, speed: 1.0, touchDamage: 0, radius: 0.55, height: 1.6,
    ranged: {
      cooldown: 3.2, fireRange: 17, keepDistance: 11,
      projectileSpeed: 10, projectileDamage: 14,
      projectileColor: [1.0, 0.45, 0.05], projectileSize: 1.3,
    },
    weight: 0.3, unlockAt: 55, xpOrbs: 2,
  },
  brute: {
    type: 'brute',
    url: '/assets/monster/enemy_f_01.glb',
    hp: 200, speed: 1.3, touchDamage: 12, radius: 0.9, height: 2.2,
    weight: 0.3, unlockAt: 80, xpOrbs: 3,
  },
  miniboss: {
    type: 'miniboss',
    url: '/assets/monster/enemy_f_02.glb',
    hp: 550, speed: 1.6, touchDamage: 18, radius: 1.1, height: 2.8,
    weight: 0.08, unlockAt: 120, boss: true, xpOrbs: 6,
  },
};

export function pickSpawnType(elapsed: number): EnemyTypeData {
  const available = Object.values(ENEMY_TYPES).filter((t) => elapsed >= t.unlockAt);
  const totalW = available.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * totalW;
  for (const t of available) {
    roll -= t.weight;
    if (roll <= 0) return t;
  }
  return available[available.length - 1];
}
