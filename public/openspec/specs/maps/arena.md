# Map: Arena (arena)

## Purpose
GGS 的**唯一現有地圖** — 圓形戰場 + 散落柱體 + 平坦地面。從 prototype 階段就有，是其他地圖的功能性 baseline。

## Data (源頭：src/scene/Arena.ts)

| 屬性 | 值 |
|---|---|
| shape | 圓形（radius ~40m） |
| theme | 中性灰白（未配主題） |
| obstacles | 散落柱體（cylinder × 8-12） |
| vertical | 純平面（無樓層） |
| spawn boundary | 玩家不可離開 arena 邊界 |
| 30-second perimeter? | ✅ 滿足 |

## Requirements

### Requirement: Bounded Combat Space
此地圖 SHALL 確保玩家無法離開戰場邊界。

#### Scenario: 玩家試圖跑出
- WHEN 玩家走到 arena 邊緣
- THEN（具體機制待 Cartograph 細化）— 可能是不可見牆 / 視覺指示 / 自動推回

### Requirement: 30-Second Perimeter Rule
此地圖 SHALL 全速跑一圈 ≤ 30 秒（Cartograph 鐵律）。

### Requirement: Pillars as Tactical Cover
此地圖 SHALL 提供 8-12 根柱體當作射線阻擋 / 視覺掩體。

#### Scenario: 玩家躲柱避 ranged 子彈
- WHEN ranged 敵人發射子彈，玩家移動至柱後
- THEN 子彈 SHALL 被柱體攔截（待驗證 — 目前可能子彈穿牆）
- **OPEN**: collision 詳情待 Web Frontend + Combat Designer 確認

### Requirement: Flat Ground
此地圖 SHALL 為平面地形，不含台階 / 樓層 / 高低差。

## Limitations (Cartograph 領地的改進空間)

1. **無樓層** — 未來 Ruins / Caverns 加垂直性
2. **無秘密區** — 純戰場、無探索獎勵
3. **無視覺主題** — 環境美術待 Environment Artist 加 Arena 的「叢林廢墟」配色

## Related Specs
- `systems/combat-loop.md`（30 秒週長原則）
- `roles/design/cartograph.md`（地圖紀律）

## Owner
- Spec: Cartograph (T-D5)
- Code: Web Frontend Engineer (T-P3)
- Art: Environment Artist (T-A6)

## Changelog
- 2026-05-13: 從 VR 版移植，prototype baseline 地圖
- 2026-05-19: 文件化
