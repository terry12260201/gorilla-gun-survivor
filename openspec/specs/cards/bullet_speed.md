# Card: 加膛壓 (bullet_speed)

## Purpose
子彈飛行速度強化。Common rarity，遠程 build / 對應移動敵人必備。

## Data (源頭：`src/progression/UpgradeCards.ts` line 58-63)

| 欄位 | 值 |
|---|---|
| id | bullet_speed |
| rarity | common |
| weight | 1.0 |
| unique | false |
| effect | `g.projectiles.speedMultiplier *= 1.4` |

## Requirements

### Requirement: Projectile Speed ×1.4 (Multiplicative)
此卡 SHALL 將 `ProjectilePool.speedMultiplier` 乘以 1.4。

#### Scenario: 抽到 2 次
- WHEN 抽到 2 次
- THEN speedMultiplier 累積為 1.4 × 1.4 = 1.96

### Requirement: Affects All Projectiles
此卡 SHALL 影響所有副武器子彈與主武器子彈（共用 ProjectilePool）。

## Related Specs
- `weapons/*.md`

## Owner
- Code: `src/progression/UpgradeCards.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
