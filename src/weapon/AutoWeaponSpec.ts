export interface WeaponSpec {
  id: string;
  title: string;
  desc: string;
  url: string;
  damageMul: number;     // multiplier over ProjectilePool.damage
  fireRate: number;      // shots / sec
  range: number;         // meters — detection radius
  bulletColor: [number, number, number]; // RGB 0..1
  bulletSize: number;    // multiplier on base radius
}

export const WEAPON_SPECS: WeaponSpec[] = [
  {
    id: 'wpn_basegun_b',
    title: '雙管副槍',
    desc: '中等射速、黃色光彈',
    url: '/assets/arms/basegun_b.glb',
    damageMul: 0.8, fireRate: 3.0, range: 15,
    bulletColor: [1.0, 0.85, 0.25], bulletSize: 1.0,
  },
  {
    id: 'wpn_basegun_c',
    title: '緊緻手槍',
    desc: '高射速、輕快白彈',
    url: '/assets/arms/basegun_c.glb',
    damageMul: 0.55, fireRate: 5.0, range: 12,
    bulletColor: [0.95, 0.95, 1.0], bulletSize: 0.75,
  },
  {
    id: 'wpn_basegun_d',
    title: '重型手砲',
    desc: '高傷、慢射、紅色重彈',
    url: '/assets/arms/basegun_d.glb',
    damageMul: 2.0, fireRate: 1.1, range: 22,
    bulletColor: [1.0, 0.35, 0.2], bulletSize: 1.8,
  },
  {
    id: 'wpn_5l2',
    title: '連發衝鋒',
    desc: '極高射速、青色小彈',
    url: '/assets/arms/5_l_2.glb',
    damageMul: 0.45, fireRate: 6.5, range: 10,
    bulletColor: [0.35, 0.95, 1.0], bulletSize: 0.65,
  },
  {
    id: 'wpn_8l',
    title: '長筒狙擊',
    desc: '巨傷、極慢、紫色穿透彈',
    url: '/assets/arms/8_l.glb',
    damageMul: 3.0, fireRate: 0.75, range: 30,
    bulletColor: [0.7, 0.45, 1.0], bulletSize: 1.25,
  },
  {
    id: 'wpn_flamethrower',
    title: '火焰噴射器',
    desc: '噴射、短程、橘色火球',
    url: '/assets/arms/flamethrower.glb',
    damageMul: 0.55, fireRate: 8.0, range: 8,
    bulletColor: [1.0, 0.55, 0.15], bulletSize: 0.9,
  },
  {
    id: 'wpn_explosivecrossbow',
    title: '爆裂弩砲',
    desc: '重彈爆擊、綠色弩矢',
    url: '/assets/arms/explosivecrossbow.glb',
    damageMul: 2.4, fireRate: 0.95, range: 18,
    bulletColor: [0.35, 1.0, 0.45], bulletSize: 1.5,
  },
];
