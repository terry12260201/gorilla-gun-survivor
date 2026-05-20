# Card: 獵頭追蹤 (homing)

## Purpose
解鎖子彈追擊敵人功能。Rare rarity，**unique（同 run 只能抽到一次）**。組「追擊流」build 的入門卡。

## Data (源頭：`src/progression/UpgradeCards.ts` line 95-100)

| 欄位 | 值 |
|---|---|
| id | homing |
| rarity | rare |
| weight (RARITY_WEIGHT) | 0.35 |
| unique | true（隱含，因為效果只開關不疊加） |
| effect | `g.projectiles.homing = true; g.projectiles.homingStrength = max(current, 3.5)` |

## Requirements

### Requirement: Enable Homing
此卡 SHALL 將 `projectiles.homing` 設為 `true`，並確保 `homingStrength ≥ 3.5`。

#### Scenario: 玩家第一次抽到
- WHEN 選此卡
- THEN 所有子彈開始自動追擊敵人
- AND homingStrength = 3.5

#### Scenario: 玩家已抽過 `homing_up`，homingStrength 已 5.0
- WHEN 抽到此卡
- THEN homing = true（如果之前 false）
- AND homingStrength **不會下降**（max 邏輯：保留 5.0）

### Requirement: Affects All Projectiles
此卡 SHALL 影響主武器 + 副武器所有子彈。

## Related Specs
- `cards/homing_up.md`（升級追擊轉向速度）
- `weapons/*.md`

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/Projectile.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
