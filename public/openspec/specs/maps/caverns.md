# Map: Caverns (caverns)

> **Status**: 🚧 PROPOSAL — pending Cartograph (T-D5) + CAO Raven + CTO Circuit 三方簽字
> **Author**: Claude (Cowork loop tick #12, Cartograph voice)
> **Source**: Doc-Only Backlog #1（loop.md 22:45 規則）

## Purpose

GGS 第三張地圖原型。主題：**地下洞穴系統** — 大猩猩深入岩穴探索古文明遺物。地圖任務：**把垂直性推到極致**（3 層立體）+ **首次引入「主動環境」**（鐘乳石可墜落造成戰術變因），但仍守 30 秒週長與純戰鬥節奏。

## Theme (Visual Mood)

- **時代**：火山岩 / 結晶洞穴（呼應 Ruins 同文明 — 古老採礦遺跡）
- **光照**：玩家自帶光（大猩猩肩燈或火把）+ 結晶自發光 → 強烈明暗對比
- **色彩錨點**：深藍黑（岩石）+ 青綠結晶光 + 暖橘玩家光 → 高對比剪影
- **聲音**：滴水 / 回音（音設 Volt + 音效 Designer 待補）

**OPEN（給 CAO）**: 玩家光源是否要 dynamic（會影響 perf 預算 — 多 light source 燒 draw call）vs static lightmap？CTO Circuit 必審。

## Data (擬定值，待 Cartograph 細化)

| 屬性 | 值 |
|---|---|
| shape | 不規則橢圓（短軸 35m / 長軸 50m）|
| size | 長軸 50m × 短軸 35m，周長 ~135m（短於 Arena/Ruins）|
| theme | 結晶洞穴（crystal cavern）|
| obstacles | 鐘乳石柱 × 8 + 結晶簇 × 5 + 中央深坑 × 1 |
| vertical | **3 層** — 1F 主洞 + 2F 岩台（環繞主洞 1/3）+ 地下深坑（B1，risk-reward 區域）|
| floor transition | 2F 用 4 條岩階（≤ 2 秒）；B1 用滑降坡道（單向，回 1F 需找上升路徑）|
| secret zone | **B1 深坑本身就是秘密區**（risk gate = 進去後 60 秒回不來，獎勵高）|
| spawn boundary | 洞穴牆（不可見牆 + 視覺指示為岩石遮蔽）|
| 30-second perimeter? | ✅ 滿足（周長 ~135m / 7m·s⁻¹ ≈ 19s — 遠低於 30s）|
| **主動環境** | 鐘乳石柱可被擊落（射 30 發或被特定敵人撞擊）→ 範圍傷害 + 阻路 |

## Requirements

### Requirement: Bounded Combat Space
此地圖 SHALL 確保玩家無法離開洞穴邊界。

### Requirement: 30-Second Perimeter Rule
此地圖 SHALL 全速跑一圈 ≤ 30 秒（Cartograph 鐵律）。
- 橢圓周長 ~135m / 7m·s⁻¹ ≈ 19s — 充分滿足

### Requirement: Triple Vertical Layer
此地圖 SHALL 提供 3 層立體戰場：1F（主戰場）/ 2F（環繞岩台 1/3 覆蓋）/ B1（深坑秘密區）。
- 1F：洞穴底部，主戰場
- 2F：環繞 1F 約 1/3 周長的岩台，提供 ranged 高地（但只覆蓋部分洞穴，不可繞圈白賺）
- B1：中央深坑，單向滑降進入，需從岩壁手腳並用回 1F

#### Scenario: 玩家滑降進 B1
- WHEN 玩家走到中央深坑邊緣
- THEN 提示「按 E 跳入（60 秒後深坑自動封閉）」
- AND 玩家跳入後播 1 秒墜落動畫（無法被打斷）
- AND B1 內生成 1-2 隻精英怪 + 1 個獎勵箱
- AND 60 秒後 B1 入口塌方，玩家被傳送回 1F（OPEN：是否該死人 — Cartograph + CEO 待拍板）

### Requirement: Active Environment — Stalactite Drops
此地圖 SHALL 允許鐘乳石柱被擊落。
- 觸發：射 30 發任意武器子彈 OR 被 Heavy / Brute 敵人撞擊 OR 玩家觸發特殊互動
- 效果：墜落點 5m 半徑造成 50 HP 範圍傷害（敵人 + 玩家共用，自損機制）
- 副作用：地面留下 5 秒障礙物（阻路）

#### Scenario: 玩家擊落鐘乳石殺敵
- WHEN 玩家對鐘乳石柱開火滿 30 發
- THEN 鐘乳石播 0.5 秒搖晃動畫（警告）
- AND 0.5 秒後墜落
- AND 墜落點 5m 半徑所有單位（含玩家）受 50 HP 傷害

**OPEN**: 自損機制是「故意設計困難」還是「應該排除玩家」？Combat Designer + CEO 待拍板。建議保留自損 — 增加風險決策深度。

### Requirement: Secret Zone in B1
此地圖 SHALL 提供 B1 深坑為高 risk-reward 秘密區。
- 獎勵：2 張 Rare 卡 或 100 ✨ meta currency 或 1 個 chest（OPEN：CEO 拍板）
- Risk Gate：60 秒內逃出 + 擊敗精英怪
- 失敗懲罰：（OPEN — 待 CEO 拍板，建議扣 30% HP 但不死）

## Limitations (Cartograph 領地的改進空間 / OPEN)

1. **B1 失敗懲罰**：強制扣 HP vs 強制觀看坍塌動畫 vs 直接死亡 — CEO 必須拍板
2. **2F 覆蓋比例**：1/3 周長 vs 1/2 — 太多 ranged 會白賺，太少又沒用
3. **鐘乳石擊落判定**：30 發是否合適 — 待玩測
4. **玩家動態光源**：dynamic point light 燒 perf vs static lightmap 失去氣氛 — CTO Circuit 必審
5. **回音 / 空間音效**：是否要 ConvolutionReverb（CPU 重）vs 簡單 IIR 模擬 — Volt + 音效 Designer

## Performance Budget (CTO 待簽字)

- 預估 mesh：obstacles 14 個（鐘乳石 8 + 結晶 5 + 深坑邊緣 1）+ 環境裝飾 ~30 個 → 估 60 draw calls
- VFX：環境粒子（滴水 / 結晶閃光）≤ 40 顆（並入 200 全局預算 — 比 Ruins 高 10 因為 active environment）
- 動態光源：1 個（玩家光） + 結晶 emissive material → CTO 評估
- 紋理預算：≤ 10 MB（結晶法線貼圖較重）

## Related Specs

- `systems/combat-loop.md`（30 秒週長原則）
- `roles/design/cartograph.md`
- `specs/systems/vfx-system.md`（環境粒子納入 200 顆預算 + 主動環境影響粒子峰值）
- `specs/maps/ruins.md`（秘密區設計手法可參考）

## Owner

- Spec: Cartograph (T-D5)
- Code: Web Frontend Engineer (T-P3) — Caverns.ts（含主動環境邏輯）
- Art: Environment Artist (T-A6) — 鐘乳石 / 結晶 / 岩階 3D + 法線貼圖

## Changelog

- 2026-05-19 (tick #12): Proposal stub 寫成（Claude Cowork loop，Cartograph 角色代筆）
- 待 Cartograph 細化 → CEO 仲裁 B1 失敗懲罰 → 三方簽字 → 進入實作 sprint
