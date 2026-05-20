# Element: Ice (冰凍)

## Purpose
控制元素 — 命中後敵人減速。提供「拉開距離」策略，與火焰（DPS）形成對比 build。

## Data (源頭：src/weapon/Elements.ts)

| 屬性 | 值 |
|---|---|
| icon | ❄️ |
| color | [0.5, 0.9, 1.0] |
| tier 1 | 減速 40%（speed × 0.6）× 2 秒 |
| tier 2 | 減速 55%（speed × 0.45）× 2.5 秒 |
| tier 3 | 嚴寒：減速 75%（× 0.25）× 3.5 秒 |

## Requirements

### Requirement: Slow Debuff On Hit
玩家擁有 Ice 附魔時，每次命中 SHALL 將敵人 speed 乘以 slowMul，持續 slowDuration 秒。

#### Scenario: Ice tier 2 命中 fast
- WHEN 玩家持 Ice tier 2，命中 fast 敵人（原速 3.5）
- THEN fast 速度變 3.5 × 0.45 = 1.575（接近 grunt 速度）
- AND 持續 2.5 秒

### Requirement: Refresh On New Hit
與 Fire 相同：新命中 SHALL refresh，不疊 stack。

### Requirement: Tier 3 Near-Stop
tier 3 嚴寒 SHALL 將速度降至 25%（× 0.25），實質讓 fast 變最慢於 grunt（grunt 2.0 × 0.25 = 0.5）。

## Synergies

- 對 `enemies/rusher.md` 特別有用（破壞衝刺壓力）
- 對 `enemies/bomber.md` 重要（延長玩家反應時間）

## Related Specs
- `systems/combat-loop.md`
- `enemies/rusher.md`

## Owner
- Spec: Combat Designer (T-D3)

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
