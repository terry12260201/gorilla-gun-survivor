# Map: Ruins (ruins)

> **Status**: 🚧 PROPOSAL — pending Cartograph (T-D5) + CAO Raven + CTO Circuit 三方簽字
> **Author**: Claude (Cowork loop tick #12, Cartograph voice)
> **Source**: Doc-Only Backlog #1（loop.md 22:45 規則）

## Purpose

GGS 第二張地圖原型（接續 Arena baseline）。主題：**叢林深處的古老廢墟** — 大猩猩低視角下的石柱、藤蔓、坍塌神殿。地圖任務：**第一次把「垂直性」與「秘密區」引入 GGS**，但不破壞 30 秒週長 + 純戰鬥節奏。

## Theme (Visual Mood)

- **時代**：被叢林吞噬的中美洲式古文明遺跡（石灰岩 + 苔蘚 + 殘破雕像）
- **光照**：頂光從碎裂屋頂落下 → 強光斑 + 深陰影 → 提升大猩猩低角剪影戲劇感
- **色彩錨點**：苔綠 + 砂黃 + 苔藍（CAO Raven 待簽字）
- **環境敵意**：不可破壞的倒柱 / 半倒牆 → 製造瓶頸 + 視野遮擋

**OPEN（給 CAO）**: 主色 vs Arena 的中性灰白要拉多開？建議 saturate 0.4–0.6（叢林感）但別太彩飽影響敵人剪影讀取性。

## Data (擬定值，待 Cartograph 細化)

| 屬性 | 值 |
|---|---|
| shape | 不規則 8 邊形（避免 Arena 圓形重複感）|
| size | 直徑 ~50m（仍滿足 30 秒週長：大猩猩 sprint ≈ 7m/s × 30s ≈ 210m 周長預算，8 邊形周長 ~200m ≤ 預算）|
| theme | 叢林廢墟（meso-american ruin）|
| obstacles | 倒柱 × 6 + 半倒牆 × 4 + 中央祭壇平台 × 1 |
| vertical | **2 層** — 1F 戰場地面 + 2F 祭壇平台（上去打 ranged 高地優勢、下來打白刃）|
| floor transition | 中央祭壇有 4 條 1.5m 寬斜坡（≤ 2 秒上下，無 loading）|
| secret zone | **1 個地下小室**（破其中一面半倒牆觸發，30 秒時間限制）|
| spawn boundary | 8 邊形外圍植被牆（不可見牆 + 視覺指示）|
| 30-second perimeter? | ✅ 滿足（8 邊形周長 ~200m / 7m·s⁻¹ ≈ 29s）|

## Requirements

### Requirement: Bounded Combat Space
此地圖 SHALL 確保玩家無法離開 8 邊形戰場邊界。

#### Scenario: 玩家試圖跑出
- WHEN 玩家走到植被牆
- THEN 不可見牆攔截 + 視覺指示（植被搖晃）

### Requirement: 30-Second Perimeter Rule
此地圖 SHALL 全速跑一圈 ≤ 30 秒（Cartograph 鐵律）。
- 8 邊形周長 ~200m / 7m·s⁻¹ ≈ 29s — 邊際符合

### Requirement: Vertical Layer Tactical Value
此地圖 SHALL 提供 2F 祭壇平台，且 1F vs 2F 各自有戰術價值。
- 2F：ranged 高地優勢、視野好但躲避空間小
- 1F：掩體多、白刃推進、躲 ranged 子彈

#### Scenario: 玩家上 2F 打 ranged
- WHEN 玩家走上祭壇斜坡
- THEN 玩家視野提升至 2F 高度（+1.5m）
- AND ranged 敵人子彈被 2F 平台邊緣阻擋（OPEN：collision 詳情待 Web Frontend 確認）

### Requirement: Secret Zone with Risk Gate
此地圖 SHALL 提供 1 個秘密區，獎勵 ≤ 1 張升級卡或 1 個 meta currency。
- 觸發：破其中一面半倒牆（隨機選 1 面，每次 run 不同）
- Risk Gate：破牆動畫 ~2 秒，玩家在此期間無法移動 / 開火
- 時間限制：秘密區開啟後 30 秒自動關閉（防止玩家進去躲怪）
- 獎勵：1 張 Rare 卡或 50 ✨ meta currency（OPEN：CEO 拍板，meta currency 命名見 `_PROPOSAL-README.md` OPEN #1）

#### Scenario: 玩家觸發秘密區
- WHEN 玩家對半倒牆按 E 鍵（或自動破壞 — 設計待定）
- AND 玩家在破牆動畫期間未被敵人打斷
- THEN 半倒牆崩塌 + 顯現地下小室
- AND 玩家有 30 秒進入領取獎勵
- AND 30 秒後地下小室入口自動坍塌封閉

### Requirement: Obstacle Tactical Use
此地圖 SHALL 提供 6 根倒柱 + 4 面半倒牆當作射線阻擋。
- 倒柱：完全阻擋子彈
- 半倒牆：可破壞（其中 1 面是秘密區門）

## Limitations (Cartograph 領地的改進空間 / OPEN)

1. **floor transition 詳情**：4 條斜坡是否該分散在祭壇 4 邊（對稱）vs 集中 2 邊（迫使玩家移動）— 待 Cartograph 拍板
2. **secret zone 觸發機制**：按 E 鍵 vs 子彈打破牆自動觸發 — 待 Combat Designer 拍板
3. **2F 平台大小**：太大 = 玩家上去打白賺，太小 = ranged 站不穩 — 建議 6m × 6m，待玩測
4. **植被牆視覺**：不可見牆 vs 物理藤蔓 — CAO 待簽字

## Performance Budget (CTO 待簽字)

- 預估 mesh：obstacles 11 個（柱 6 + 牆 4 + 祭壇 1）+ 植被 ~20 個 → 估 < 50 draw calls
- VFX：環境粒子（光斑 / 灰塵）≤ 30 顆同時（並入 vfx-system.md 全局 200 預算）
- 紋理預算：≤ 8 MB（CTO 待簽字）

## Related Specs

- `systems/combat-loop.md`（30 秒週長原則）
- `roles/design/cartograph.md`（地圖紀律 + 三方簽字流程）
- `specs/systems/vfx-system.md`（環境粒子納入 200 顆預算）

## Owner

- Spec: Cartograph (T-D5)
- Code: Web Frontend Engineer (T-P3) — 實作 Arena.ts 同等的 Ruins.ts
- Art: Environment Artist (T-A6) — 倒柱 / 半倒牆 / 祭壇 3D 模型 + 紋理

## Changelog

- 2026-05-19 (tick #12): Proposal stub 寫成（Claude Cowork loop，Cartograph 角色代筆）
- 待 Cartograph 細化 → 三方簽字 → 進入實作 sprint
