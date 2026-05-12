export type EnemyType =
  | 'grunt' | 'fast' | 'scout' | 'heavy'
  | 'ranged' | 'caster' | 'brute' | 'miniboss'
  | 'rusher' | 'bomber';

export interface RangedConfig {
  cooldown: number;        // seconds between shots
  fireRange: number;       // max distance to fire
  keepDistance: number;    // preferred distance from player
  projectileSpeed: number;
  projectileDamage: number;
  projectileColor: [number, number, number];
  projectileSize: number;  // visual scale
}

export interface PlaceholderConfig {
  geometry: 'box' | 'cone' | 'cylinder' | 'sphere' | 'capsule';
  color: number;           // hex 0xRRGGBB
  emissive?: number;       // optional base emissive tint
}

export interface RusherConfig {
  detectRange: number;     // distance that triggers rush
  rushSpeed: number;       // speed while rushing
  lockDirection: boolean;  // false = homing track; true = ballistic straight-line
}

export interface BomberConfig {
  fuseRange: number;       // distance that starts the fuse countdown
  fuseTime: number;        // seconds before explosion
  aoeRadius: number;       // explosion radius
  aoeDamage: number;       // explosion damage (pre difficulty mul)
  moveDuringFuse: number;  // speed multiplier during fuse (0 = stop)
}

export interface EnemyTypeData {
  type: EnemyType;
  url?: string;            // glb path; if absent, placeholder is used
  modelId?: string;        // reserved: future glb-catalog key for swap-in
  placeholder?: PlaceholderConfig; // required when url is absent
  hp: number;
  speed: number;
  touchDamage: number;     // 0 for pure ranged units
  radius: number;
  height: number;          // target scale height
  ranged?: RangedConfig;
  rusher?: RusherConfig;
  bomber?: BomberConfig;
  weight: number;          // spawn probability weight
  unlockAt: number;        // seconds of game time before spawnable
  boss?: boolean;          // mini-boss flagged for special rules / fewer instances
  xpTier: 1 | 2 | 3;       // base XP orb tier (before time bonus)
  xpCount: number;         // number of orbs dropped per kill
  heartDropChance?: number;  // 0..1 probability to drop a Heart on death
  chestDropChance?: number;  // 0..1 probability to drop a Chest on death
}

export const ENEMY_TYPES: Record<EnemyType, EnemyTypeData> = {
  grunt: {
    type: 'grunt',
    url: '/assets/monster/enemy_b_03.glb',
    hp: 45, speed: 2.0, touchDamage: 5, radius: 0.6, height: 1.5,
    weight: 1.0, unlockAt: 0, xpTier: 1, xpCount: 1,
    heartDropChance: 0.03, chestDropChance: 0.005,
  },
  fast: {
    type: 'fast',
    url: '/assets/monster/enemy_c_01.glb',
    hp: 32, speed: 3.5, touchDamage: 4, radius: 0.45, height: 1.2,
    weight: 0.8, unlockAt: 15, xpTier: 1, xpCount: 1,
    heartDropChance: 0.03, chestDropChance: 0.005,
  },
  scout: {
    type: 'scout',
    url: '/assets/monster/enemy_c_02.glb',
    hp: 38, speed: 2.8, touchDamage: 5, radius: 0.5, height: 1.3,
    weight: 0.7, unlockAt: 30, xpTier: 1, xpCount: 1,
    heartDropChance: 0.03, chestDropChance: 0.005,
  },
  heavy: {
    type: 'heavy',
    url: '/assets/monster/enemy_c_03.glb',
    hp: 130, speed: 1.5, touchDamage: 10, radius: 0.8, height: 1.8,
    weight: 0.4, unlockAt: 50, xpTier: 1, xpCount: 2,
    heartDropChance: 0.05, chestDropChance: 0.02,
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
    weight: 0.5, unlockAt: 35, xpTier: 1, xpCount: 1,
    heartDropChance: 0.04, chestDropChance: 0.005,
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
    weight: 0.3, unlockAt: 55, xpTier: 2, xpCount: 1,
    heartDropChance: 0.04, chestDropChance: 0.005,
  },
  brute: {
    type: 'brute',
    url: '/assets/monster/enemy_f_01.glb',
    hp: 200, speed: 1.3, touchDamage: 12, radius: 0.9, height: 2.2,
    weight: 0.3, unlockAt: 80, xpTier: 2, xpCount: 2,
    heartDropChance: 0.05, chestDropChance: 0.03,
  },
  miniboss: {
    type: 'miniboss',
    url: '/assets/monster/enemy_f_02.glb',
    hp: 900, speed: 1.7, touchDamage: 28, radius: 1.4, height: 3.6,
    weight: 0.08, unlockAt: 120, boss: true, xpTier: 3, xpCount: 3,
    heartDropChance: 0.50, chestDropChance: 0.25,
  },
  rusher: {
    type: 'rusher',
    placeholder: { geometry: 'cone', color: 0xcc2222, emissive: 0x440000 },
    hp: 55, speed: 2.2, touchDamage: 15, radius: 0.55, height: 1.4,
    rusher: { detectRange: 12, rushSpeed: 6.5, lockDirection: false },
    weight: 0.6, unlockAt: 25, xpTier: 1, xpCount: 1,
    heartDropChance: 0.03, chestDropChance: 0.005,
  },
  bomber: {
    type: 'bomber',
    placeholder: { geometry: 'sphere', color: 0xff8822, emissive: 0x331100 },
    hp: 40, speed: 2.0, touchDamage: 0, radius: 0.5, height: 1.3,
    bomber: { fuseRange: 3, fuseTime: 1.2, aoeRadius: 3.5, aoeDamage: 25, moveDuringFuse: 0 },
    weight: 0.4, unlockAt: 45, xpTier: 2, xpCount: 1,
    heartDropChance: 0.04, chestDropChance: 0.005,
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
