# Dynamic: Weapon Cards (動態生成)

## Purpose
8 張**自動生成**的「給玩家新副武器」卡，每張對應一把 `WEAPON_SPECS` 武器。

## Generation Logic (源頭：`src/progression/UpgradeCards.ts` line 17-25)

```typescript
const WEAPON_CARDS: UpgradeCard[] = WEAPON_SPECS.map((spec) => ({
  id: spec.id,                                  // e.g. wpn_shock_baton
  title: `副武器：${spec.title}`,                // e.g. 副武器：電弧短杖
  desc: `${spec.desc} · DMG ×${spec.damageMul} · RoF ${spec.fireRate}/s · 射程 ${spec.range}m`,
  rarity: 'weapon',
  unique: true,
  canPick: (g) => !g.weapons.isFull && !g.weapons.hasWeapon(spec.id),
  apply: (g) => { g.weapons.addWeapon(spec); },
}));
```

## Requirements

### Requirement: One Card Per Weapon Spec
此 generator SHALL 為每把 `WEAPON_SPECS` 武器產 1 張卡。

### Requirement: Filter When Owned Or Slot Full
此卡 SHALL 在以下情況被卡池過濾：
1. 玩家武器槽已滿（`weapons.isFull`）
2. 玩家已擁有此武器（`weapons.hasWeapon(spec.id)`）

### Requirement: Weight 0.25 (RARITY_WEIGHT)
此 rarity 在 weighted random 時 weight = 0.25（比 common 1.0 / rare 0.35 都低）。

## Currently Generated Cards (8 張)

依 `src/data/weapons.json`：
1. wpn_basegun_b — 副武器：雙管副槍
2. wpn_basegun_c — 副武器：緊緻手槍
3. wpn_basegun_d — 副武器：重型手砲
4. wpn_5l2 — 副武器：連發衝鋒
5. wpn_8l — 副武器：長筒狙擊
6. wpn_flamethrower — 副武器：火焰噴射器
7. wpn_explosivecrossbow — 副武器：爆裂弩砲
8. wpn_shock_baton — 副武器：電弧短杖

## Related Specs
- `weapons/*.md`（8 把對應）
- `systems/level-progression.md`（卡池規則）

## Owner
- Code: `src/progression/UpgradeCards.ts`
- Spec: 武器 spec 各自的 owner

## Changelog
- 2026-05-19: Documented dynamic generation
