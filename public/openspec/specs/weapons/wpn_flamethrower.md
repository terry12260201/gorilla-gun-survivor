# Weapon: 火焰噴射器 (wpn_flamethrower)

## Purpose
極短程、超高射速的「Area Sweep」副武器。本武器與 Fire 元素附魔協同 build（灼燒疊加）。

## Data (源頭：src/data/weapons.json)

| 欄位 | 值 |
|---|---|
| damageMul | 0.55 |
| fireRate | 8.0/s（最高） |
| range | 8m（最短） |
| bulletColor | [1.0, 0.55, 0.15] 橘 |
| bulletSize | 0.9 |
| asset | `/assets/arms/flamethrower.glb` |

## Requirements

### Requirement: Hyper-Cadence Close Range
此武器 SHALL 以 8 發/秒射速、8m 射程、0.55× base 傷害發射橘色火球。

### Requirement: Fire Element Synergy (Future)
此武器 SHOULD 在玩家有 Fire 元素附魔時，疊加每發 burn DPS。

#### Scenario: 火焰噴射器 + Fire tier 1
- WHEN 玩家持有 wpn_flamethrower 並抽到 Fire tier 1（5 burn DPS × 3s）
- THEN 每秒 8 發都觸發 burn，導致敵人持續疊 burn 直到 8 秒不再命中
- **Note**: 此 synergy 目前**未實作**，待 Combat Designer 簽核疊加是否破壞平衡

## Visual Identity (PROPOSAL — pending CAO Raven + Volt TA 簽字)

| 維度 | 設計 |
|---|---|
| Silhouette | 雙管同心圓噴嘴 + 背載燃料筒 + 短身（典型火焰噴射器剪影） |
| Bullet color | `[1.0, 0.55, 0.15]` 飽和橘黃 — 與 basegun_d 橘紅 `[1.0, 0.35, 0.2]` 刻意分流（火焰偏黃、D 偏紅） |
| Muzzle flash | 橘黃 stream — 每幀延續火舌 0.3s LifetimeStream（**特例**，其他武器都是 burst()） |
| Impact spark | 橘 + 黑煙 mix 5 粒 + 0.4s 殘留（短暫，避免疊太多） |
| Trail | 子彈本身即 trail：每幀 `+5% scale + emissive boost`，飛 3 frame 後 burst — 模擬火球擴散 |
| Motion cue | 子彈擴散 + 衰減透明度（不是 wobble） |
| Readability target | 「短程橘黃火舌流 + 子彈會長大」=「火焰噴射器」一眼可辨；與 5L2 青色密射拉開冷暖 |
| Performance budget | ⚠️ 8/s × (stream + 5 impact + 3-frame trail) = **預估 ~60+ 粒/s peak**，可能撞 200 cap 的 30% |

⚠️ **Volt TA 硬警告**：
- 本武器是 8 把裡**最容易爆預算**的（射速 8/s × 多階段 trail）
- 若玩家同時持有 + flamethrower + 5L2 + shock_baton 鏈電，瞬時粒子數可能 → 250+ 超過 200 cap
- 必選一：(1) muzzle stream 降為 burst() 4 粒 (2) impact 從 5 降為 3 (3) 3-frame trail 改 2 frame
- CAO Raven 需與 Volt TA 共同裁決取捨

⚠️ Fire 元素附魔疊加時，burn DPS 視覺（地面火圈）會與本武器火球視覺重疊 → 需 CAO Raven 設計層次（建議：本武器子彈飽和、burn DPS 半透明地圈）

## Related Specs
- `elements/fire.md`
- `systems/combat-loop.md`
- `weapons/wpn_basegun_d.md`（橘色 hue 衝突檢查）
- `systems/vfx-system.md`（200 粒子上限）

## Owner
- Spec: Combat Designer (T-D3) + Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩簽字) + 3D Specialist (T-A2 silhouette)
- VFX: VFX Artist (T-A4) + Volt TA (T-P5 **必須裁決預算取捨**)

## Changelog
- 2026-05-13: Migrated to data
- 2026-05-19: 文件化 + 標記 Fire synergy 未實作
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，Volt TA 需裁決 stream/impact/trail 預算取捨；CAO 需裁決 burn DPS 層次）
