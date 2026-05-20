# Weapon: 緊緻手槍 (wpn_basegun_c)

## Purpose
高射速、低單發傷害的「DPS 密度型」副武器。提供持續輸出體驗，與爆擊型武器形成節奏對比。

## Data (源頭：src/data/weapons.json)

| 欄位 | 值 |
|---|---|
| damageMul | 0.55 |
| fireRate | 5.0/s |
| range | 12m |
| bulletColor | [0.95, 0.95, 1.0] 白 |
| bulletSize | 0.75（小） |
| asset | `/assets/arms/basegun_c.glb` |

## Requirements

### Requirement: High-Cadence Light Fire
此武器 SHALL 以 5 發/秒射速發射小體積白色子彈，每發傷害為 0.55× base。

#### Scenario: 持續射擊 1 秒
- WHEN 鎖定一隻 grunt（45 HP）
- THEN 1 秒打出 5 發 × 0.55 × base damage
- AND 若 base damage = 30，則 1 秒造成 ~82 傷害，grunt 約 0.55 秒內擊殺

### Requirement: Light Bullet Visual
此武器 SHALL 以白色 (color [0.95, 0.95, 1.0])、體積 0.75× 的子彈呈現，與其他副武器明顯不同。

## Visual Identity (PROPOSAL — pending CAO Raven 簽字)

| 維度 | 設計 |
|---|---|
| Silhouette | 短管 / 細身 / 單手持，緊湊精巧；與 basegun_b 雙管刻意拉開 |
| Bullet color | `[0.95, 0.95, 1.0]` 冷白 — 中性、不爭色，讓高密度子彈雨不灼眼 |
| Muzzle flash | 白 2 粒 minimal pulse，0.05s fadeout — **故意小**以避免射速 5/s 撞 200 cap |
| Impact spark | 白 4 粒（低於 baseline 6 粒），維持密度時的預算 |
| Trail | 無 trail（保持「乾淨密集」視覺，trail 會疊成糊狀） |
| Motion cue | 無微抖；只看「白色雨點密集流」 |
| Readability target | 「冷白 + 小子彈 + 密集」=「機關連射」一眼可辨；與 5L2 青色密射 hue 互補 |
| Performance budget | 5.0/s × (2 + 4) = 30 粒/s，與其他武器同框不爆 |

⚠️ Volt TA 注意：本武器最容易被升級卡疊到 8 發/秒以上，需在 200 cap 內預留 headroom。

## Related Specs
- `systems/combat-loop.md`
- `weapons/wpn_5l2.md`（連發衝鋒 — 更極端的高射速）
- `systems/vfx-system.md`（粒子預算 200 上限）

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩簽字) + 3D Specialist (T-A2 silhouette)
- VFX: VFX Artist (T-A4) + Volt TA (T-P5 預算審)

## Changelog
- 2026-05-13: Migrated to data
- 2026-05-19: 文件化
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，等 CAO Raven + Volt TA 簽字）
