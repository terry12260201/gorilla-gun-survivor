# Card: 厚實皮毛 (max_hp)

## Purpose
最大 HP 強化 + 立即回滿。Common rarity，tank build / 緊急救援用。

## Data (源頭：`src/progression/UpgradeCards.ts` line 51-56)

| 欄位 | 值 |
|---|---|
| id | max_hp |
| rarity | common |
| weight | 1.0 |
| unique | false |
| effect | `g.health.max += 25; g.health.hp = g.health.max` |

## Requirements

### Requirement: Max HP +25 AND Heal To Full
此卡 SHALL 同時做兩件事：
1. 將 `health.max` +25
2. 將 `health.hp` 設為 `health.max`（補滿）

#### Scenario: 玩家 80/100 HP 抽到此卡
- WHEN 選此卡
- THEN `health.max` = 125
- AND `health.hp` = 125（從 80 補到 125 = 等於回 45 HP + 上限 +25）

### Requirement: Stackable
可疊加，每次 +25 max + 回滿。

## 設計含意

每次選此卡同時等於「+25 max + 回 (max - current) HP」。低血時抽到是大救援，滿血時純擴上限。**這是 code 已經拍板的設計**，先前 OPEN 問題（「抽到時補滿嗎？」）答案：**YES**。

## Related Specs
- `systems/combat-loop.md`（HP / death）

## Owner
- Code: `src/progression/UpgradeCards.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
