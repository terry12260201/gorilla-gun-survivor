# Weapon: 雙管副槍 (wpn_basegun_b)

## Purpose
中等射速、中等傷害的「均衡型」副武器。新手第一把熟悉感的武器，黃色光彈視覺辨識度高，作為其他特殊武器的對比基準線。

## Data (源頭：src/data/weapons.json)

| 欄位 | 值 |
|---|---|
| damageMul | 0.8 |
| fireRate | 3.0/s |
| range | 15m |
| bulletColor | [1.0, 0.85, 0.25] 黃 |
| bulletSize | 1.0 |
| asset | `/assets/arms/basegun_b.glb` |

## Requirements

### Requirement: Balanced Baseline Auto-Fire
此武器 SHALL 作為其他副武器的均衡基準，所有數值維度（傷害 / 射速 / 射程 / 子彈大小）皆為「中等」，不偏特化。

#### Scenario: 玩家第一次抽到副武器
- WHEN 玩家在第一張升級卡看到此武器
- THEN 子彈為飽和黃光（color [1.0, 0.85, 0.25]）
- AND 命中後預設黃色 spark
- AND 射速 3 發/秒、射程 15m、傷害 0.8× base

### Requirement: Cone Targeting
此武器 SHALL 在玩家朝向錐角 ±22.5° 內、距離 15m 內的最近敵人自動鎖定發射。

#### Scenario: 多個敵人在範圍內
- WHEN 兩個敵人都在錐角內
- THEN 鎖定**最近**那個（不是先進入範圍那個）

## Visual Identity (PROPOSAL — pending CAO Raven 簽字)

| 維度 | 設計 |
|---|---|
| Silhouette | 雙管短身、橫向對稱、單手持感，給「親民／均衡／新手安全感」第一印象 |
| Bullet color | `[1.0, 0.85, 0.25]` 飽和黃 — 對應「未附魔／基準能量」語意 |
| Muzzle flash | 黃 4 粒 ImpactSparks burst()，0.08s fadeout，無 PointLight |
| Impact spark | 黃 `[1.0, 0.85, 0.25]` 6 粒，與 muzzle 同色保持識別連貫 |
| Trail | 無 trail，乾淨子彈（作為其他武器「有特效」的視覺對照基準） |
| Motion cue | 無微抖、無 wobble — 穩定直線飛行 |
| Readability target | 在 12 把同框時，「黃色 + 中等大小 + 無特效」=「baseline 武器」一眼可辨 |
| Performance budget | 3.0/s × (4 muzzle + 6 impact) = 30 粒/s peak，遠低於 200 cap |

CAO Raven 簽字後，本表進 `art/style-guides/weapon-color-system.md`（待建）。

## Related Specs
- `systems/combat-loop.md`（auto weapon 觸發機制）
- `weapons/wpn_basegun_c.md`（緊緻手槍 — 高射速對照）
- `weapons/wpn_basegun_d.md`（重型手砲 — 高傷對照）
- `systems/vfx-system.md`（粒子預算 200 上限）

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩簽字) + 3D Specialist (T-A2 silhouette)
- VFX: VFX Artist (T-A4)

## Changelog
- 2026-05-13: Migrated from inline TS to `src/data/weapons.json`
- 2026-05-19: Spec文件化 (Claude OpenSpec batch)
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，等 CAO Raven 簽字）
