# Enemy: Grunt (grunt)

## Purpose
基礎雜兵 — 玩家從 0 秒就會遇到的對手。教學「移動接近 + 觸碰傷害」基礎機制，數值設計成新手熟悉武器的沙包。

## Data (源頭：src/enemy/EnemyTypes.ts)

| 欄位 | 值 |
|---|---|
| hp | 45 |
| speed | 2.0 |
| touchDamage | 5 |
| radius | 0.6 |
| height | 1.5m |
| weight (spawn) | 1.0 |
| unlockAt | 0s |
| xpTier / xpCount | 1 / 1 |
| heartDropChance | 3% |
| chestDropChance | 0.5% |
| asset | `/assets/monster/enemy_b_03.glb` |

## Requirements

### Requirement: Touch Damage Behavior
此敵人 SHALL 朝玩家直線移動，於 radius 接觸時造成 5 touchDamage（× difficulty）。

#### Scenario: 玩家被 grunt 接觸
- WHEN grunt 與玩家距離 ≤ radius (0.6m)
- THEN 玩家失去 5 HP（× difficulty multiplier）

### Requirement: From Spawn Available
此敵人 SHALL 從遊戲時間 0 秒即可生成（unlockAt = 0），weight 1.0 為最高。

### Requirement: Death Drops
此敵人 SHALL 死亡時掉落 1 顆 tier 1 XP orb，並以 3% 機率掉血、0.5% 機率掉寶箱。

## Related Specs
- `systems/level-progression.md`（XP 掉落系統）
- `systems/combat-loop.md`

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2)
- Art: 3D Specialist (T-A2) — `/assets/monster/enemy_b_03.glb` 既有資產維護；CAO Raven (T-A0) 美術一致性審查
- Audio: SFX Designer (T-S3) — grunt hit / death / footstep SFX（共用「basic melee」音池）
- QA: QA Analyst (T-Q1) — 0s spawn 與觸碰傷害基線回歸測試

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Art / Audio / QA owners（loop Doc-Only Backlog #7）
