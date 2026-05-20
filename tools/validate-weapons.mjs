import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const weaponsPath = path.join(root, 'src', 'data', 'weapons.json');
// Keep this schema in sync with src/weapon/AutoWeaponSpec.ts.
const weaponSpecFields = [
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
];
const requiredWeaponSpecFields = [
  'id',
  'title',
  'desc',
  'url',
  'damageMul',
  'fireRate',
  'range',
  'bulletColor',
  'bulletSize',
];
const stringFields = ['id', 'title', 'desc', 'url'];
const positiveNumberFields = ['damageMul', 'fireRate', 'range', 'bulletSize'];
const weaponSpecFieldSet = new Set(weaponSpecFields);
// signatureVFX is an optional enum. Add new variants here as new signature VFX are designed.
const signatureVFXValues = new Set(['electric']);

function fail(message) {
  console.error(`[weapons] ${message}`);
  process.exitCode = 1;
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

let weapons;
try {
  weapons = JSON.parse(fs.readFileSync(weaponsPath, 'utf8'));
} catch (error) {
  fail(`weapons.json must be valid JSON: ${error.message}`);
  process.exit();
}

if (!Array.isArray(weapons)) {
  fail('weapons.json must be an array.');
  process.exit();
}

if (weapons.length === 0) {
  fail('weapons.json must include at least one weapon.');
}

const ids = new Set();

for (const [index, weapon] of weapons.entries()) {
  const label = weapon?.id ?? `row ${index}`;

  if (!isPlainObject(weapon)) {
    fail(`${label}: weapon row must be an object.`);
    continue;
  }

  for (const key of requiredWeaponSpecFields) {
    if (!(key in weapon)) {
      fail(`${label}: missing ${key}.`);
    }
  }

  for (const key of Object.keys(weapon)) {
    if (!weaponSpecFieldSet.has(key)) {
      fail(`${label}: unknown field ${key}.`);
    }
  }

  if ('signatureVFX' in weapon) {
    if (typeof weapon.signatureVFX !== 'string' || !signatureVFXValues.has(weapon.signatureVFX)) {
      const allowed = Array.from(signatureVFXValues).join(' | ');
      fail(`${label}: signatureVFX must be one of ${allowed} (or omitted).`);
    }
  }

  for (const key of stringFields) {
    if (typeof weapon[key] !== 'string' || weapon[key].trim() === '') {
      fail(`${label}: ${key} must be a non-empty string.`);
    }
  }

  if (typeof weapon.id === 'string' && !/^wpn_[a-z0-9_]+$/.test(weapon.id)) {
    fail(`${label}: id must match wpn_[a-z0-9_]+.`);
  }

  if (ids.has(weapon.id)) fail(`${label}: duplicate weapon id.`);
  ids.add(weapon.id);

  for (const key of positiveNumberFields) {
    if (!isNumber(weapon[key]) || weapon[key] <= 0) {
      fail(`${label}: ${key} must be a positive number.`);
    }
  }

  if (!Array.isArray(weapon.bulletColor) || weapon.bulletColor.length !== 3) {
    fail(`${label}: bulletColor must be [r, g, b].`);
  } else {
    for (const channel of weapon.bulletColor) {
      if (!isNumber(channel) || channel < 0 || channel > 1) {
        fail(`${label}: bulletColor values must be between 0 and 1.`);
      }
    }
  }

  if (!weapon.url.startsWith('/assets/')) {
    fail(`${label}: url must start with /assets/.`);
  } else if (!weapon.url.endsWith('.glb')) {
    fail(`${label}: url must point to a .glb asset.`);
  } else {
    const assetPath = path.join(root, 'public', weapon.url);
    if (!fs.existsSync(assetPath)) {
      fail(`${label}: asset missing at public${weapon.url}.`);
    }
  }
}

if (!process.exitCode) {
  console.log(`[weapons] validated ${weapons.length} weapon rows.`);
}
