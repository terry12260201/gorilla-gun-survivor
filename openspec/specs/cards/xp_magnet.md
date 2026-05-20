# Card: 貪婪吸取 (xp_magnet)

## Purpose
XP orb 吸附範圍 +3m flat。Common rarity，提升「殺 → 撿 → 升」節奏。

## Data (源頭：`src/progression/UpgradeCards.ts` line 86-91)

| 欄位 | 值 |
|---|---|
| id | xp_magnet |
| rarity | common |
| weight | 1.0 |
| unique | false（可疊加） |
| effect | `g.xpOrbs.magnetRange += 3` (flat) |

## Requirements

### Requirement: XP Magnet Range +3m (Flat)
此卡 SHALL 將 `xpOrbs.magnetRange` 加 3。

#### Scenario: 抽到 3 次
- WHEN 抽 3 次
- THEN magnetRange 累積 base + 9m

### Requirement: Does Not Affect Hearts / Chests
此卡 SHALL 只影響 XP orb，不影響 heart / chest 的拾取半徑。

### Requirement: Stackable Without Diminishing
**Code 已拍板：每次 +3m flat，無遞減**。先前 OPEN 問題（「第二次減半嗎？」）答案：**否，維持 +3m**。

## Related Specs
- `systems/level-progression.md`（XP / magnet 系統）

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/progression/Pickup.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
