# Element: Fire (灼傷)

## Purpose
持續傷害元素 — 命中後敵人持續燃燒掉血。鼓勵「打了就走」風格 build，與冰凍（控制）形成不同節奏。

## Data (源頭：src/weapon/Elements.ts)

| 屬性 | 值 |
|---|---|
| icon | 🔥 |
| color | [1.0, 0.4, 0.1] |
| tier 1 | 5 DPS × 3 秒 |
| tier 2 | 10 DPS × 3 秒 |
| tier 3 | 18 DPS × 4 秒 |

## Requirements

### Requirement: Burn DOT On Hit
玩家擁有 Fire 附魔時，每次副武器命中 SHALL 在敵人身上施加 burn 狀態：每秒造成 burnDps 傷害、持續 burnDuration 秒。

#### Scenario: Fire tier 1 命中 grunt
- WHEN 玩家持 Fire tier 1，副武器命中 grunt (45 HP)
- THEN grunt 立刻受到副武器本身傷害
- AND grunt 開始燃燒，每秒受 5 傷，共 3 秒（總計 15 額外傷害）

### Requirement: Refresh On New Hit
此元素的 burn 狀態 SHALL 在新的命中時**刷新時間**（不疊加 stack，只 refresh）。

#### Scenario: 高射速武器持續命中
- WHEN 火焰噴射器（8 發/秒）連續打同一隻敵人
- THEN burn 持續刷新，敵人持續每秒受傷

### Requirement: Tier Upgrade
玩家 SHALL 能升級此元素的階級（tier 1 → 2 → 3），每階提高 DPS 與持續時間。

## Synergies (規劃)

- `wpn_flamethrower` + Fire = 高密度灼燒（待 Combat Designer 簽核）
- 對 `enemies/heavy.md`、`enemies/brute.md` 等高 HP 敵人特別有用

## Related Specs
- `weapons/wpn_flamethrower.md`
- `systems/combat-loop.md`

## Owner
- Spec: Combat Designer (T-D3)

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
