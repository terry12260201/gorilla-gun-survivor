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
  /** Optional signature visual identity for the weapon's projectiles. */
  signatureVFX?: 'electric';
}

// Keep this list in sync with tools/validate-weapons.mjs (weaponSpecFields).
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
  'signatureVFX',
] as const satisfies readonly (keyof WeaponSpec)[];

export const WEAPON_SPECS = weaponData as WeaponSpec[];
