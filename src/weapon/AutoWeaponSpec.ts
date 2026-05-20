import weaponData from '../data/weapons.json';

export interface WeaponSpec {
  id: string;
  title: string;
  desc: string;
  url: string;
  damageMul: number;
  fireRate: number;
  range: number;
  bulletColor: [number, number, number];
  bulletSize: number;
}

// Keep this list in sync with tools/validate-weapons.mjs.
export const WEAPON_SPEC_FIELDS = [
  'id',
  'title',
  'desc',
  'url',
  'damageMul',
  'fireRate',
  'range',
  'bulletColor',
  'bulletSize',
] as const satisfies readonly (keyof WeaponSpec)[];

export const WEAPON_SPECS = weaponData as WeaponSpec[];
