# Card: 更重火力 (damage)

## Purpose
基礎傷害強化，與其他卡無互斥。Common rarity，玩家最常看到。

## Data (源頭：`src/progression/UpgradeCards.ts` line 30-35)

| 欄位 | 值 |
|---|---|
| id | damage |
| rarity | common |
| weight (RARITY_WEIGHT) | 1.0 |
| unique | false (可疊加) |
| effect | `g.projectiles.damage += 10` (flat) |

## Requirements

### Requirement: Flat Damage +10
此卡 SHALL 將 `ProjectilePool.damage` 加 10（不是乘）。

#### Scenario: 主武器當前 damage 30，玩家抽到此卡
- WHEN 玩家選此卡
- THEN `g.projectiles.damage` 變 40
- AND 副武器傷害間接受惠（副武器算 base × damageMul，base 是 pool.damage）

### Requirement: Stackable
此卡 SHALL 可在同一 run 多次抽到、多次選擇，每次累加 +10。

## Related Specs
- `systems/combat-loop.md`
- `weapons/*.md`（base damage 來源）

## Owner
- Code: `src/progression/UpgradeCards.ts`
- Balance: Balance Architect (T-D2)

## Changelog
- 2026-05-19: Reverse-engineered from code
