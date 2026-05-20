# Card: 彈跳彈 (bounce)

## Purpose
子彈擊中敵人後彈到下一隻。Rare rarity。組「群戰穿透」build 用。

## Data (源頭：`src/progression/UpgradeCards.ts` line 109-114)

| 欄位 | 值 |
|---|---|
| id | bounce |
| rarity | rare |
| weight | 0.35 |
| unique | false |
| effect | `g.projectiles.bouncesOnHit += 2` (flat) |

## Requirements

### Requirement: Bounces On Hit +2
此卡 SHALL 將 `projectiles.bouncesOnHit` 加 2。

#### Scenario: 玩家抽到 1 次
- WHEN 選此卡
- THEN 每顆子彈擊中敵人後最多再彈 2 次（共擊中最多 3 隻敵人）

### Requirement: Stackable
可疊加，每次 +2。抽 3 次 → bouncesOnHit = 6 → 最多擊中 7 隻。

### Requirement: Targets Different Enemies
彈跳 SHALL 不會擊中同一隻敵人兩次（`hitIds: Set<number>`）。

## Related Specs
- `weapons/*.md`
- `enemies/*.md`（群戰場景）

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/Projectile.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
