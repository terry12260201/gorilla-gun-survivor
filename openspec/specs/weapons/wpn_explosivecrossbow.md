# Weapon: 爆裂弩砲 (wpn_explosivecrossbow)

## Purpose
中遠程、高傷、AoE（規劃中）的「重型 Burst」副武器。綠色弩矢視覺識別獨特，作為「爆擊」build 的核心。

## Data (源頭：src/data/weapons.json)

| 欄位 | 值 |
|---|---|
| damageMul | 2.4 |
| fireRate | 0.95/s |
| range | 18m |
| bulletColor | [0.35, 1.0, 0.45] 綠 |
| bulletSize | 1.5 |
| asset | `/assets/arms/explosivecrossbow.glb` |

## Requirements

### Requirement: Burst Crossbow Profile
此武器 SHALL 以 0.95 發/秒射速、18m 射程、2.4× base 傷害發射綠色弩矢。

### Requirement: Explosive On Hit (Planned)
此武器 SHOULD 在命中時觸發小範圍 AoE（規劃，未實作）。

#### Scenario: 一發命中 grunt 群
- WHEN 弩矢命中第一隻 grunt
- THEN（未實作）爆炸範圍 2m 內的其他敵人也受傷害
- **Note**: 目前是單體傷害；AoE 功能在 backlog

## Visual Identity (PROPOSAL — pending CAO Raven 簽字)

| 維度 | 設計 |
|---|---|
| Silhouette | 弩臂 X 形 + 弦 + 短託 + 機械瞄具（明顯弩剪影，與其他槍械分流） |
| Bullet color | `[0.35, 1.0, 0.45]` 飽和綠 — 8 把武器中唯一綠系，無 hue 衝突 |
| Muzzle flash | 綠 1 粒微小 + 弦回彈短 anim（**靠模型動畫，非粒子**） — 弩的「機械感」 |
| Impact spark | 綠 8 粒 + 黑色 outline (Sprite, 0.2s) — 給「爆裂」感；未來 AoE 啟用後升級為 12 粒 + ring expansion |
| Trail | 無 trail（弩矢不該有 trail，否則破壞「實體箭矢」感） |
| Motion cue | 飛行有微微 wobble (`±2% scale, 0.2 Hz`) — 模擬弩矢 spin 旋轉 |
| Readability target | 「綠色 + 最大 + 中速 + spin wobble + 黑邊命中」=「爆裂弩」一眼可辨 |
| Performance budget | 0.95/s × (1 muzzle + 8 impact + 1 sprite) = ~10 粒/s + 0.95 sprite/s，預算寬裕 |

⚠️ AoE 啟用時的視覺加碼：
- ring expansion (Sprite, 2m 半徑, 0.3s fadeout) — 預算 1 sprite/shot
- ring 內 4 隻敵人即觸發 4 × 6 impact = 24 粒（單發）
- 0.95/s × 24 = ~23 粒/s peak，仍在預算內

## Related Specs
- `systems/combat-loop.md`
- `weapons/wpn_basegun_d.md`
- `systems/vfx-system.md`（粒子預算）

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩簽字) + 3D Specialist (T-A2 弩 silhouette)
- VFX: VFX Artist (T-A4) + Volt TA (T-P5 AoE 啟用後重審預算)

## Changelog
- 2026-05-13: Migrated to data
- 2026-05-19: 文件化 + 標記 AoE 未實作
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，含 AoE 啟用後的視覺加碼預估）
