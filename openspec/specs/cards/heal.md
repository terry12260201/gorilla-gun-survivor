# Card: 喘口氣 (heal)

## Purpose
立即回 40 HP，不加上限。緊急救援卡。

## Data (源頭：`src/progression/UpgradeCards.ts` line 65-70)

| 欄位 | 值 |
|---|---|
| id | heal |
| rarity | common |
| weight | 1.0 |
| unique | false |
| effect | `g.health.hp = Math.min(g.health.max, g.health.hp + 40)` |

## Requirements

### Requirement: Instant +40 HP, Capped at Max
此卡 SHALL 立即補 40 HP，但不可超過 `health.max`。

#### Scenario: 50/100 HP
- WHEN 選此卡
- THEN HP 變 90/100

#### Scenario: 80/100 HP（接近滿血）
- WHEN 選此卡
- THEN HP 變 100/100（不超 max）

### Requirement: No Cap on Max HP
此卡 SHALL NOT 改 health.max。

### Requirement: Gated by HP < Max（2026-05-19 修補）
此卡 SHALL 在玩家 HP 已滿時**被卡池過濾**（不出現於 3 選 1 介面）。
- 實作：`canPick: (g) => g.health.hp < g.health.max`
- 詳見 `src/progression/UpgradeCards.ts`

#### Scenario: 玩家滿血升等
- WHEN player.hp == player.max
- THEN 升等卡池 SHALL 過濾 heal
- AND 玩家不會看到此卡（節省 1 個 slot 給其他卡）

### Requirement: Stackable When HP < Max
HP 未滿時可重複抽到（多次回血）。

## Related Specs
- `cards/max_hp.md`（搭配組合）

## Owner
- Code: `src/progression/UpgradeCards.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
- ~~OPEN: 滿血時隱藏此卡~~ **已解決** 2026-05-19 — 加入 `canPick: (g) => g.health.hp < g.health.max`
