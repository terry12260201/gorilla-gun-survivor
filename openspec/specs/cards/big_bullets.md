# Card: 巨彈 (big_bullets)

## Purpose
子彈體積放大，碰撞範圍也放大（baseHitRadius × bulletScale）。Common rarity，提升「擦邊命中率」。

## Data (源頭：`src/progression/UpgradeCards.ts` line 79-84)

| 欄位 | 值 |
|---|---|
| id | big_bullets |
| rarity | common |
| weight | 1.0 |
| unique | false |
| effect | `g.projectiles.bulletScale *= 1.7` |

## Requirements

### Requirement: Bullet Scale ×1.7 (Multiplicative)
此卡 SHALL 將 `ProjectilePool.bulletScale` 乘以 1.7。

#### Scenario: 抽到 2 次
- WHEN 抽 2 次
- THEN bulletScale 累積 1.7² = 2.89

### Requirement: Hit Radius Also Scales
碰撞半徑 SHALL 用 `BASE_RADIUS × bulletScale + 0.04` 公式（見 ProjectilePool.baseHitRadius）。

## Related Specs
- `weapons/*.md`（所有副武器的 bullet 大小）
- `systems/combat-loop.md`

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/Projectile.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
