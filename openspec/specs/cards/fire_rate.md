# Card: 扣扳機加速 (fire_rate)

## Purpose
主武器射速強化。Common rarity，DPS build 早期關鍵。

## Data (源頭：`src/progression/UpgradeCards.ts` line 37-42)

| 欄位 | 值 |
|---|---|
| id | fire_rate |
| rarity | common |
| weight | 1.0 |
| unique | false |
| effect | `g.gun.fireRate += 1.2` (flat) |

## Requirements

### Requirement: Flat MainGun Fire Rate +1.2/s
此卡 SHALL 將主武器（MainGun）射速加 1.2 發/秒。**不影響副武器**。

#### Scenario: 主武器當前 3.0 發/秒，玩家抽到此卡
- WHEN 選此卡
- THEN `g.gun.fireRate` 變 4.2

### Requirement: Stackable
可多次疊加，無上限。

## Related Specs
- `systems/combat-loop.md`（主武器 manual aim）

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/MainGun.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
