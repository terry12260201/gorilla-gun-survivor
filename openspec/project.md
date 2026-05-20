# Gorilla Gun Survivor · Project Spec Root

## 一句話定位

3D 第一人稱、貼地視角（1.1m 大猩猩高度）的 roguelike survivor，Web 平台優先，移植自 VR 版本，目標 $15 售價於 Steam + itch.io 雙軌上架。

## Tech Stack

- **Runtime:** Vite 5 + TypeScript 5 + Three.js (純手刻，無大引擎)
- **音效:** WebAudio API（目前 100% 合成，無音檔資源）
- **部署:** GitHub Pages（自動）+ Steam / itch.io（規劃中）
- **資料層:** `src/data/*.json`（武器、卡片等），由 `tools/validate-*.mjs` 驗證
- **資產:** GLB 模型放 `public/assets/`，內建 + 自製混用

## 核心紀律（CEO 拍板，不可動）

這是 **roguelike survivor**，**不是** 探險解謎、開放世界、metroidvania。玩家的主軸永遠是「殺、撿、升、抽、撐」。任何改動偏離這條軸線 → CEO 直接否決。

## 規格目錄

- `specs/weapons/` — 8 把副武器
- `specs/enemies/` — 11 種敵人
- `specs/elements/` — 4 種元素 × 3 階附魔系統
- `specs/cards/` — 18 張升級卡（待補）
- `specs/meta-progression/` — 4 條 META 永久升級（待補）
- `specs/systems/` — 5+ 個跨系統規格（combat-loop / vfx / performance / progression / audio）
- `specs/maps/` — 地圖規格（目前只有 Arena，廢墟 / 洞窟 / 霓虹規劃中）

## 團隊規格

- `roles/c-suite/` — 4 位 C 級主管
- `roles/design/` — 5 位企劃部
- `roles/art/` — 6 位美術部
- `roles/programming/` — 5 位程式部（含 Volt TA）
- `roles/audio/` — 3 位音效部
- `roles/marketing/` — 5 位行銷部（含 Scarlet）
- `roles/qa/` — 3 位 QA 部
- Owner（人類老闆）: Terry · nanhong@pumpkinvrar.com

## 紅線（任何角色違反 → CEO 否決）

1. 不准改核心循環順序（殺 → 撿 → 升 → 抽 → 撐）
2. 地圖永遠不能無限大（30 秒週長原則）
3. 不可變探險（探索是調味、殺怪是主菜）
4. 秘密區獎勵 ≤ 一次升級（不能放神器、永久 buff）
5. 不可加付費依賴（OPENAI_API_KEY 不算依賴，是工具）
6. 樓層切換 ≤ 2 秒，無 loading screen
7. VFX 粒子總預算 ≤ 200（Volt TA 硬指標）
8. ENEMY 新單位 unlock ≥ 60 秒（避免玩家來不及升等）
9. 桌面 60fps、第 15 分鐘不可掉幀（Volt TA 簽核）

## 規格驅動開發（SDD）流程

採用 OpenSpec 的 `specs/` + `changes/` 哲學，但**不裝 npm 套件**（等專案到 60-70% 完成度再 `openspec init`）。

- `specs/` = 真相來源（系統目前該長什麼樣）
- `changes/` = 提案（這次要改什麼）— 目前先空著，未來啟用
- Spec 格式：Purpose / Requirements (with SHALL/MUST) / Scenarios (####)
- Delta 格式：`## ADDED` / `## MODIFIED` / `## REMOVED` / `## RENAMED`

## 工具/AI 協作慣例

- 所有 AI agent（Claude / Codex / GPT / Cursor）都讀 `openspec/AGENTS.md` 取得 workflow
- Spec 變動 → 寫 `changes/<topic>/` 提案 → 完成後 `archive` 合併回 `specs/`
- Code 變動但不動 spec → 直接改（bug fix / refactor / 註解）
- 任何 senior agent 對 spec 有疑問 → 寫 `studio/mailbox/terry-inbox/`
- Terry 決策進 `studio/mailbox/terry-outbox/`

## Operating Status

- 當前階段：P0 Ops + P1 Data Foundation（active）+ P2 Gameplay Content（next）
- 當前 sprint：2026-05-18（VFX-01 / QA-03 / PERF-01 並行）
- Prototype 完成度：35-40%
- Product 完成度（$15 可賣）：30-40%

## 連結

- 啟動文件：`C:\Users\Pumpkin-C1-015\Downloads\gorilla-gun-survivor-launch-brief.html`
- 製作中控台：`studio/dashboard/terry-progress.html`
- 團隊清單：`C:\Users\Pumpkin-C1-015\Downloads\pumpkin-mission-control-v3.html`
- 當前決策：`studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md`
- Claude 自動循環：`studio/claude-as-codex-loop.md`
