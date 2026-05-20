# Weapons Data Schema v1.1

Source file: `src/data/weapons.json`

The weapons table drives secondary auto-weapon cards and meta-starting weapons. Keep balance data in JSON so gameplay tuning does not require TypeScript edits.

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | Stable unique id. Do not rename once released. Must match `wpn_[a-z0-9_]+`. |
| `title` | string | ✅ | Player-facing weapon name. |
| `desc` | string | ✅ | Short card/result-screen description. |
| `url` | string | ✅ | Public GLB asset path. Must start with `/assets/` and end in `.glb`. |
| `damageMul` | number | ✅ | Multiplier over `ProjectilePool.damage`. Must be > 0. |
| `fireRate` | number | ✅ | Shots per second. Must be > 0. |
| `range` | number | ✅ | Target detection radius in meters. Must be > 0. |
| `bulletColor` | `[number, number, number]` | ✅ | RGB values from 0 to 1. |
| `bulletSize` | number | ✅ | Projectile visual size multiplier. Must be > 0. |
| `signatureVFX` | enum string | optional | Built-in signature VFX hook. Omit for default weapons. Allowed values: `"electric"`. |

## `signatureVFX` Enum

Added in schema v1.1 (2026-05-19, VFX-01 Slice 2).

Marks a weapon as having a built-in signature VFX behavior that triggers without any upgrade card. Each value implies both a visual and a small mechanical effect; full behavior is implemented in `src/weapon/AutoWeapon.ts` / `src/weapon/Projectile.ts` and the corresponding `src/fx/` / `src/weapon/` systems.

| Value | Visual | Mechanical | Owner brief |
| --- | --- | --- | --- |
| `"electric"` | Bullet has pale electric-white core, micro-jitter (±5% scale, ±3% emissive); hit spark recolored to electric blue-white; muzzle flash tinted electric blue-white. | On hit, automatically chains 1 jump to the nearest enemy within 4m for 30% bullet damage. Stacks additively with the "雷擊附魔" upgrade card (2/3/5 jumps). | `art/vfx-briefs/shock-baton-arc.md` |

**Adding a new value:** update this table, the enum in `tools/validate-weapons.mjs` (`signatureVFXValues`), and the TypeScript union in `src/weapon/AutoWeaponSpec.ts` together — they must stay in sync. Add a VFX brief under `art/vfx-briefs/`.

## Migration Notes

- Current eight prototype weapons were migrated from `src/weapon/AutoWeaponSpec.ts`.
- Code still imports `WEAPON_SPECS` from `AutoWeaponSpec.ts`; that module now acts as the typed bridge to JSON data.
- Add future PC or VR-migrated weapons by appending rows to `src/data/weapons.json`.
- Schema v1.1 adds the optional `signatureVFX` field (enum, currently `"electric"`). Existing weapons may omit it; rows that include it must use one of the allowed enum values.
