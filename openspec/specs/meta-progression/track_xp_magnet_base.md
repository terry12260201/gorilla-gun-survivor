# Meta Track: 磁場本能 (track_xp_magnet_base)

> **Claude 提案**，pending Terry signoff。

## Purpose
讓玩家每次新 run 一開始就有更大的 XP 拾取範圍，減少「跑來跑去撿 orb」的時間。提升「殺→撿→升」節奏密度。

## Data (待建：src/data/meta.json)

| 欄位 | 值 |
|---|---|
| id | track_xp_magnet_base |
| title | 磁場本能 |
| desc | 每升 1 級，新 run 開始時 XP 拾取範圍 +0.5m |
| icon | 🧲 |
| max_level | 8 |
| cost_curve | [8, 16, 28, 44, 64, 88, 116, 148] |
| effect_per_level | { type: "xp_magnet_add_on_spawn", value: 0.5 } |

## Requirements

### Requirement: Base XP Magnet Range +0.5m Per Level
此 track 每升 1 級 SHALL 在 run spawn 時 `xpOrbs.magnetRange` 從 base 加 0.5m。

#### Scenario: 玩家持 track lv 8（滿級）
- WHEN run 開始
- THEN magnetRange = base + 4m

### Requirement: Diminishing Cost But Capped Levels
此 track max_level 8（比其他短 2 級）— 因為過大磁場破壞「撿 XP」的微操作樂趣。

### Requirement: Stacks With `xp_magnet` Card
與 run 內 `xp_magnet` 卡（+3m per stack）**加總**。

#### Scenario: META lv 8 + 3 張 xp_magnet 卡
- THEN magnetRange = base + 4 + 9 = base + 13m（極端值）

## Synergy / Conflict
- **Conflict**: 無，但與「移動速度低」build 不協同（你已經夠快，不需要磁場）

## Related Specs
- `cards/xp_magnet.md`
- `systems/level-progression.md`

## Owner
- Spec: Systems Designer + Balance Architect
- Final: CEO

## Changelog
- 2026-05-19: Claude 提案 baseline
