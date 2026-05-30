# Map: Neon (neon)

> **Status**: 🚧 PROPOSAL — pending Cartograph (T-D5) + CAO Raven + CTO Circuit 三方簽字
> **Author**: Claude (Cowork loop tick #12, Cartograph voice)
> **Source**: Doc-Only Backlog #1（loop.md 22:45 規則）

## Purpose

GGS 第四張地圖原型。主題：**廢棄霓虹科技殖民站** — 古文明遺跡之上後人類嘗試殖民失敗的科技廢墟。地圖任務：**為核心循環加電子噪聲反差**（前 3 張都是自然環境）+ **首次引入「平台跳躍式」垂直性**（懸浮平台 / 廢棄電梯），但仍守 30 秒週長與純戰鬥。

> 設計動機：launch brief 寫的「90 年代街機 × 叢林廢墟」美術錨點允許局部反差。Neon 是叢林被霓虹覆蓋的版本，不是另一個遊戲。

## Theme (Visual Mood)

- **時代**：人類殖民失敗 30 年後（霓虹招牌仍閃 / 電線垂落 / 全息廣告殘片）
- **光照**：霓虹光招牌（高飽和洋紅 / 青藍 / 螢綠）+ 雨水反射地面
- **色彩錨點**：黑底 + 高飽和洋紅 / 青藍 / 螢綠（CAO Raven 待簽字 — 與 Arena/Ruins/Caverns 反差最大，CAO 可能 push back）
- **聲音**：電子嗡嗡 + 雨聲 + 偶發故障招牌爆閃 SFX

**OPEN（給 CAO）**: 霓虹色與玩家武器色衝突風險高（武器已用洋紅 / 紫 / 青）— 是否要降地圖飽和度給武器讓位？建議地圖色 saturate 0.5 / value 0.6 vs 武器 saturate 0.9 / value 1.0。

**OPEN（給 CEO）**: Neon 主題會不會破壞「叢林廢墟」核心美術錨點？建議用 CAO 仲裁 — 若 Raven 否決，本地圖改名為 `outpost` 並改用古代金屬科技風（非霓虹）。

## Data (擬定值，待 Cartograph 細化)

| 屬性 | 值 |
|---|---|
| shape | L 型不規則（街道 + 中庭）|
| size | 街道段 30m × 中庭段 25m × 25m → 周長 ~140m |
| theme | 廢棄霓虹殖民站（neon ruins） |
| obstacles | 殘破霓虹招牌 × 6 + 垂落電線（穿越觸電 debuff）× 3 + 自助販賣機殘骸 × 4 + 廢棄電梯井 × 1 |
| vertical | **3 層** — 1F 街道地面 + 2F 懸浮平台（跳躍式，3 塊各 4m × 4m）+ B1 維修通道（穿越用，無戰鬥）|
| floor transition | 2F 平台之間用斷裂橋（玩家可墜落回 1F，無傷）；B1 用廢棄電梯（≤ 2 秒，單向）|
| secret zone | **電梯井底部維修室**（B1 限定，需找到電梯啟動才能下去）|
| spawn boundary | L 型街道盡頭的故障屏障（不可見牆 + 視覺指示為靜電火花）|
| 30-second perimeter? | ⚠️ L 型周長 ~140m / 7m·s⁻¹ ≈ 20s 但 L 拐角影響 → 實測待玩測|
| **主動環境** | 電線可被擊斷（射 10 發）→ 對碰到的單位 +5 麻痺 debuff（含玩家自損）|

## Requirements

### Requirement: Bounded Combat Space
此地圖 SHALL 確保玩家無法離開 L 型戰場邊界。

### Requirement: 30-Second Perimeter Rule
此地圖 SHALL 全速跑一圈 ≤ 30 秒（Cartograph 鐵律）。
- L 型周長 ~140m，估 ≈ 20s，但實測拐角繞行可能 +5s → 玩測必驗

#### Scenario: 玩測 30 秒週長
- WHEN QA Glassmoth 跑 100 次計時
- THEN 95% 樣本 SHALL ≤ 30 秒
- IF 失敗 → Cartograph 縮短街道段至 25m

### Requirement: Triple Vertical Layer (Platform Jump Style)
此地圖 SHALL 提供 3 層：1F 街道 / 2F 懸浮平台（跳躍式）/ B1 維修通道（穿越用）。
- 1F：主戰場，大部分戰鬥發生這層
- 2F：3 塊獨立懸浮平台，各 4m × 4m，需從 1F 跳上去（大猩猩跳躍能力 OPEN — 待 Combat Designer 拍板跳躍機制）
- B1：純穿越通道（用於兩端街道快速切換 + 觸發秘密區）

**OPEN**: 大猩猩是否有跳躍能力？目前 wpn_shock_baton 文件未說明。若無 → 改為斷裂橋連接 2F 平台。Combat Designer 必須拍板。

### Requirement: Active Environment — Electric Wires
此地圖 SHALL 允許垂落電線被擊斷。
- 觸發：射 10 發任意武器子彈
- 效果：擊斷後 5 秒內，碰到電線的單位（含玩家）受 5 麻痺 debuff（移速 -50%、持續 2 秒）
- 自損：玩家若碰到自己擊斷的電線 → 受 debuff

#### Scenario: 玩家擊斷電線困住敵人
- WHEN 玩家對電線開火滿 10 發
- THEN 電線斷落
- AND 5 秒內任何穿越電線的單位受麻痺 debuff
- AND 5 秒後電線消失

### Requirement: Secret Zone — Maintenance Room
此地圖 SHALL 提供電梯井底部維修室為秘密區。
- 觸發：玩家找到 1F 角落的電梯啟動鈕 → 開電梯 → 下 B1 → 進維修室
- Risk Gate：啟動電梯需 3 秒（玩家無法移動 / 開火）
- 獎勵：1 張 Rare 卡 + 50 ✨ meta currency

## Limitations (Cartograph 領地的改進空間 / OPEN)

1. **跳躍機制存在嗎**：核心 OPEN 問題 — Combat Designer 必須拍板，影響 2F 設計
2. **電線自損**：與 Caverns 鐘乳石類似的自損決策 — 一致性要求 CEO 拍板（兩張地圖都自損 vs 都不自損）
3. **電梯動畫長度**：3 秒 vs 5 秒 — 待玩測（太短 risk gate 不夠強，太長煩躁）
4. **L 型 vs 8 邊形**：L 型雷區為 perf draw call 切割（不可一次看見全圖）— CTO 看可不可接受
5. **與 Caverns 主動環境衝突**：兩張都有主動環境 → 設計手法重複度高，可能要拉開差異

## Performance Budget (CTO 待簽字)

- 預估 mesh：obstacles 14 個（招牌 6 + 電線 3 + 販賣機 4 + 電梯井 1）+ 環境裝飾 ~40 個（霓虹光源裝飾、廣告殘片）→ 估 70 draw calls（比其他地圖高）
- VFX：環境粒子（雨 + 靜電火花 + 招牌爆閃）≤ 50 顆同時（並入 200 全局預算 — 最高的地圖）
- 動態光源：5-8 個霓虹光（CTO 評估 — 可能用 baked light + 偶發 emissive flicker animation 代替）
- 紋理預算：≤ 12 MB（最多，因為霓虹招牌字體紋理 + 殘破金屬紋理）

**警告**: Neon 是 4 張地圖中 perf 預算最緊的。CTO Circuit 必須評估是否要降低粒子數或合併 draw call。

## Related Specs

- `systems/combat-loop.md`（30 秒週長原則）
- `roles/design/cartograph.md`
- `specs/systems/vfx-system.md`（地圖環境粒子 50 顆 ≤ 全局 200 預算）
- `specs/systems/performance-budgets.md`（Volt TA FPS 命線）
- `specs/maps/ruins.md` + `specs/maps/caverns.md`（秘密區與主動環境設計手法）

## Owner

- Spec: Cartograph (T-D5)
- Code: Web Frontend Engineer (T-P3) — Neon.ts（含電線 debuff + 電梯邏輯）
- Art: Environment Artist (T-A6) — 招牌 / 電線 / 販賣機 / 電梯 3D + emissive material

## Changelog

- 2026-05-19 (tick #12): Proposal stub 寫成（Claude Cowork loop，Cartograph 角色代筆）
- 待 Combat Designer 拍板跳躍機制 → CAO 仲裁霓虹主題 → CTO 簽字 perf 預算 → CEO 簽字（含自損一致性）→ 進入實作 sprint
