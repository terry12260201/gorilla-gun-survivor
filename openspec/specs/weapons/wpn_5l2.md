# Weapon: 連發衝鋒 (wpn_5l2)

## Purpose
極限高射速、極短程的「Suppression DPS」副武器。鼓勵玩家近戰高 DPS build，與遠程精準型形成對比。

## Data (源頭：src/data/weapons.json)

| 欄位 | 值 |
|---|---|
| damageMul | 0.45 |
| fireRate | 6.5/s |
| range | 10m（短） |
| bulletColor | [0.35, 0.95, 1.0] 青 |
| bulletSize | 0.65（最小） |
| asset | `/assets/arms/5_l_2.glb` |

## Requirements

### Requirement: Extreme Cadence Short Range
此武器 SHALL 以 6.5 發/秒射速發射青色小型子彈，射程僅 10m。

#### Scenario: 近戰一群 grunt
- WHEN 玩家被 3 隻 grunt 圍住（< 10m）
- THEN 6.5 發/秒持續輸出能清完
- AND 但 14m 外的 ranged 敵人因射程不足無法擊殺

### Requirement: Cyan Bullet Identity
此武器 SHALL 使用青色 [0.35, 0.95, 1.0]，與「電弧短杖」的電光白心紫 [0.80, 0.75, 1.0] 明顯不同。

#### Scenario: 玩家同時持有兩把
- WHEN 玩家持有 wpn_5l2 + wpn_shock_baton
- THEN 兩種子彈飛行時可由視覺立即區分

## Visual Identity (PROPOSAL — pending CAO Raven 簽字)

| 維度 | 設計 |
|---|---|
| Silhouette | 短身 / 雙握把 / 抓握感重（衝鋒槍剪影），與 basegun_c 細身手槍刻意分流 |
| Bullet color | `[0.35, 0.95, 1.0]` 飽和青 — 冷色高彩，與 basegun_c 冷白拉開 hue（白偏中性，青偏冷艷） |
| Muzzle flash | 青 2 粒 minimal pulse，0.04s — **最小**配置以撐 6.5/s 射速 |
| Impact spark | 青 3 粒（全武器最少），靠射速密度撐視覺重量 |
| Trail | 0.05s 短 tracer (LineBasicMaterial, 0.6m) — 僅夠感知軌跡 |
| Motion cue | 無微抖；密集 tracer 流體本身即視覺特徵 |
| Readability target | 「青色 + 最小子彈 + 密集 + 短 tracer」=「衝鋒槍掃射」一眼可辨 |
| Performance budget | 6.5/s × (2 + 3) = ~33 粒/s + 6.5 tracers/s，預算需 Volt TA 監控（tracer LineBasicMaterial 不算粒子但算 draw call） |

⚠️ 與 wpn_shock_baton 的差異化檢查：
- 5L2 青 `[0.35, 0.95, 1.0]` vs shock_baton 電光白心紫 `[0.80, 0.75, 1.0]`
- Hue 距離夠遠（青 vs 紫白），同框可辨 ✓
- 但若玩家同時拿到「Fire 元素附魔 + 5L2」會出現青底火光衝突 → 待 Combat Designer 裁決

## Related Specs
- `systems/combat-loop.md`
- `weapons/wpn_shock_baton.md`（色彩差異化參考）
- `weapons/wpn_basegun_c.md`（同為高射速類別 hue 分流）
- `systems/vfx-system.md`（粒子預算）

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩簽字) + 3D Specialist (T-A2 silhouette)
- VFX: VFX Artist (T-A4) + Volt TA (T-P5 預算)

## Changelog
- 2026-05-13: Migrated to data
- 2026-05-19: 文件化（含與 shock_baton 色彩衝突檢查）
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，等 CAO Raven + Combat Designer 對 Fire 附魔疊色裁決）
