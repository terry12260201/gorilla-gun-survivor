# Weapon: 重型手砲 (wpn_basegun_d)

## Purpose
高傷、低射速的「Alpha Strike」副武器。一發解決重型敵的設計，與高射速武器形成 build 多樣性。

## Data (源頭：src/data/weapons.json)

| 欄位 | 值 |
|---|---|
| damageMul | 2.0 |
| fireRate | 1.1/s |
| range | 22m |
| bulletColor | [1.0, 0.35, 0.2] 紅 |
| bulletSize | 1.8（大） |
| asset | `/assets/arms/basegun_d.glb` |

## Requirements

### Requirement: Heavy Alpha Damage
此武器 SHALL 以 1.1 發/秒射速發射紅色大型子彈，每發傷害為 2.0× base。

#### Scenario: 命中 grunt
- WHEN 一發命中 grunt (45 HP)
- THEN 若 base damage = 30，造成 60 傷害 → 一發秒殺

#### Scenario: 命中 heavy
- WHEN 一發命中 heavy (130 HP)
- THEN 造成 60 傷害 → 三發擊殺（~2.7 秒）

### Requirement: Long Range
此武器 SHALL 擁有 22m 射程，比一般副武器（12-15m）更遠。

## Visual Identity (PROPOSAL — pending CAO Raven 簽字)

| 維度 | 設計 |
|---|---|
| Silhouette | 粗管 / 重身 / 雙手持感，槍口擴口 → 第一印象「重量／後座力」 |
| Bullet color | `[1.0, 0.35, 0.2]` 飽和橘紅 — 與 flamethrower 橘色刻意分流（D 偏紅、火焰偏黃橘），避免衝突 |
| Muzzle flash | 橘紅 8 粒 burst + 1 PointLight (intensity 1.2, 0.08s fadeout)，傳達「重」 |
| Impact spark | 橘紅 10 粒 + 0.15s 殘影（用 Sprite tail，非粒子）— 衝擊感最重的副武器 |
| Trail | 短 trail (LineBasicMaterial, 1m 長, 0.06s 殘留)，傳達「子彈帶重量」 |
| Motion cue | 無微抖；trail 提供視覺重量感 |
| Readability target | 「橘紅 + 最大子彈 + 慢 + trail + PointLight」=「重砲一發解決」 |
| Performance budget | 1.1/s × (8 muzzle + 10 impact + 1 PointLight + trail) = ~20 粒/s + 1 light，預算寬裕 |

PointLight 數量上限見 `systems/performance-budgets.md`，本武器佔用全場 PointLight 配額 1/N。

## Related Specs
- `systems/combat-loop.md`
- `weapons/wpn_8l.md`（長筒狙擊 — 更極端的高傷低射速）
- `weapons/wpn_flamethrower.md`（橘色 hue 衝突檢查）
- `systems/performance-budgets.md`（PointLight 配額）

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩簽字) + 3D Specialist (T-A2 silhouette)
- VFX: VFX Artist (T-A4) + Volt TA (T-P5 PointLight 配額)

## Changelog
- 2026-05-13: Migrated to data
- 2026-05-19: 文件化
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，等 CAO Raven 對 D 橘紅 vs flamethrower 橘黃 hue 衝突裁決）
