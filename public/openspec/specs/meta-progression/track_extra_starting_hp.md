# Meta Track: 鋼鐵之軀 (track_extra_starting_hp)

> **範例 META track** — Claude 寫的 baseline，Terry 必須審過才算 canon。

## Purpose
讓玩家每次新 run 都「比上次稍微更難死」，建立長期升級感。早期最有感（生存壓力大），後期 marginal。是 retention 第一條 track。

## Data (待建：src/data/meta.json)

| 欄位 | 值 |
|---|---|
| id | track_extra_starting_hp |
| title | 鋼鐵之軀 |
| desc | 每升 1 級，新 run 開始時最大 HP +10 |
| icon | 🛡️ |
| max_level | 10 |
| cost_curve | [10, 20, 35, 55, 80, 110, 145, 185, 230, 280] |
| effect_per_level | { type: "max_hp_add_on_spawn", value: 10 } |

## Requirements

### Requirement: HP Boost On Spawn
此 META track 每升 1 級 SHALL 在新 run spawn 時自動 +10 max HP。

#### Scenario: 玩家持 track level 5，開始新 run
- WHEN run 開始（玩家剛 spawn）
- THEN player.maxHp 從 base 100 → 100 + 5×10 = 150
- AND player.hp 補滿至新上限

#### Scenario: 玩家持 track level 10（滿級）
- WHEN run 開始
- THEN player.maxHp = 100 + 100 = 200

### Requirement: Stacks With Run-Time Cards
此 META 效果 SHALL 與 run 內升等卡（如 card_upgrade_max_hp）**加總**，不是相乘。

#### Scenario: 玩家持 META lv 5 + run 內抽到 3 次「鋼鐵體質」(card_upgrade_max_hp +25)
- WHEN
- THEN maxHp = 100（base） + 50（META） + 75（cards） = 225

## Cost Curve Rationale (Balance Architect 簽核)

```
Level 1: 10 currency （miniboss 2 隻 ≈ 10）
Level 2: 20 currency （cumulative 30）
Level 3: 35 currency （cumulative 65）
...
Level 10: 280 currency （cumulative 1150）
```

每升一級成本指數成長，避免玩家 grind 過快。

## Related Specs
- `meta-progression/_TEMPLATE.md`
- `systems/level-progression.md`
- `cards/upgrade_max_hp.md`（run-time 對應）

## Owner
- Spec: Balance Architect (T-D2)
- Final: CEO

## Changelog
- 2026-05-19: Claude 寫的 baseline 範例
