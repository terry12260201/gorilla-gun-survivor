# Card: 追擊強化 (homing_up)

## Purpose
增強追擊轉向速度。Rare rarity。**通常需要先抽 `homing` 才有意義**（但 code 沒有 prerequisite gate）。

## Data (源頭：`src/progression/UpgradeCards.ts` line 102-107)

| 欄位 | 值 |
|---|---|
| id | homing_up |
| rarity | rare |
| weight | 0.35 |
| unique | false（可疊加） |
| effect | `g.projectiles.homingStrength += 1.5` (flat) |
| canPick | **`g.projectiles.homing`** （只在 homing 已開啟時出現，2026-05-19 修補） |

## Requirements

### Requirement: Homing Strength +1.5 (Flat)
此卡 SHALL 將 `projectiles.homingStrength` 加 1.5。

#### Scenario: 玩家未抽過 homing，看到升等卡池
- WHEN 升等開卡
- THEN 此卡 SHALL 不在卡池中（被 `canPick` 過濾）
- AND 玩家不會誤抽到「空效果卡」

#### Scenario: 玩家已抽過 homing（projectiles.homing = true）
- WHEN 升等開卡
- THEN 此卡進入卡池正常抽

### Requirement: Stackable
可疊加，無上限（前提：homing 仍開啟）。

## Open Questions

- ~~OPEN: 此卡是否該加 `canPick` 條件~~ **已解決** 2026-05-19 — 加入 `canPick: (g) => g.projectiles.homing`，詳見 `src/progression/UpgradeCards.ts`

## Related Specs
- `cards/homing.md`（前置）

## Owner
- Code: `src/progression/UpgradeCards.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
