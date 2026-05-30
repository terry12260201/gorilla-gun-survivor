# Meta Track: 起始火力 (track_extra_starting_damage)

> **Claude 提案**，pending Terry signoff。

## Purpose
讓玩家「每次新 run 比上次稍微更兇」。早期擊殺速度提升 → 更早升等 → 更快滾雪球。是 retention 第二條核心 track（在 extra_starting_hp 之後最有感）。

## Data (待建：src/data/meta.json)

| 欄位 | 值 |
|---|---|
| id | track_extra_starting_damage |
| title | 起始火力 |
| desc | 每升 1 級，新 run 開始時 base projectile damage +3 |
| icon | ⚡ |
| max_level | 10 |
| cost_curve | [10, 22, 38, 58, 82, 110, 142, 178, 218, 262] |
| effect_per_level | { type: "projectile_damage_add_on_spawn", value: 3 } |

## Requirements

### Requirement: Base Damage Boost On Spawn
此 track 每升 1 級 SHALL 在 run spawn 時 `g.projectiles.damage` +3。

#### Scenario: 玩家持 track lv 5
- WHEN run 開始（spawn）
- THEN `g.projectiles.damage` 從 base 30 → 45

### Requirement: Stacks Additively With `damage` Card
此 META 效果 SHALL 與 run 內 `card_damage` 卡（+10 per stack）**加總**。

#### Scenario: META lv 5 + 抽到 3 張 damage 卡
- THEN damage = 30(base) + 15(META) + 30(cards) = 75

## Synergy / Conflict
- **Synergy**: 與所有武器、所有元素都協同
- **Conflict**: 無（純加值）

## Related Specs
- `cards/damage.md`
- `meta-progression/_PROPOSAL-README.md`

## Owner
- Spec: Balance Architect (T-D2)
- Final: CEO

## Changelog
- 2026-05-19: Claude 提案 baseline
