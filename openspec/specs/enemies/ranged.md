# Enemy: Ranged (ranged)

## Purpose
遠程射擊敵人 — 引入第二種威脅向量。玩家必須優先打掉牠或閃彈，不能無腦清地面。

## Data

| 欄位 | 值 |
|---|---|
| hp | 60 |
| speed | 1.2（接近停止） |
| touchDamage | 0（純遠程） |
| radius | 0.55 |
| ranged.cooldown | 2.5s |
| ranged.fireRange | 14m |
| ranged.keepDistance | 9m |
| ranged.projectileSpeed | 14 |
| ranged.projectileDamage | 10 |
| ranged.projectileColor | [0.9, 0.3, 1.0] 紫光 |
| unlockAt | 35s |
| asset | `/assets/monster/enemy_e_02.glb` |

## Requirements

### Requirement: Maintain Distance
此敵人 SHALL 嘗試與玩家保持 9m 距離（過近會後退，過遠會接近）。

### Requirement: Projectile Fire
此敵人 SHALL 每 2.5 秒朝玩家發射紫光子彈（damage 10、speed 14、color [0.9, 0.3, 1.0]）。

#### Scenario: 玩家進入 fireRange
- WHEN 玩家距離 ≤ 14m
- THEN ranged 開始發射子彈，每 2.5 秒一發

### Requirement: No Contact Damage
此敵人 SHALL 不造成接觸傷害（純遠程威脅）。

## Related Specs
- `enemies/caster.md`（更高階遠程）
- `systems/combat-loop.md`（敵人子彈系統）

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2) — ranged AI（keepDistance + projectile fire）+ 敵人子彈系統
- Art: 3D Specialist (T-A2) — `/assets/monster/enemy_e_02.glb` 既有資產維護；CAO Raven (T-A0) 紫光 projectile [0.9, 0.3, 1.0] 與玩家黃色 projectile 色彩衝突審查（避免子彈混淆）
- Audio: SFX Designer (T-S3) — ranged 紫光發射 / 飛彈呼嘯 / 命中三段音（與 caster 橘魔法區隔）
- QA: QA Analyst (T-Q1) — 35s unlock + 14m fireRange 是否能讓玩家有反應時間 + 紫光子彈可閃避性

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Art / Audio / QA owners（loop Doc-Only Backlog #7）
