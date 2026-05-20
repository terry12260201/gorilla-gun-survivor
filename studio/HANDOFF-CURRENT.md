# Current Handoff

Updated: 2026-05-19 15:30

## 🔴 Terry 最新方向：2026-05-19-1530-terry-direction

- 決策檔：`studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md`
- 新任務順序：VFX-01 → QA-03 → ENEMY-01 → ART-01 → GAME-02
- 完成 VFX-01 + QA-03 後必須停下回報，不要連跑 3 個 task
- GAME-01（電弧短杖）已標為 Done，VFX-01 為 In Progress
- Dashboard「AI 夥伴狀態」面板要接 AGENT-RUNS.md 最新 5 筆，不能再顯示空白
- 並行小事：產 `qa/reports/run-template.md`、`performance/budgets/bundle-size-2026-05-19.md`
- 紅線：不准 force-push、不准動 main、OPENAI_API_KEY 永不寫進 repo

## If Codex Stops Or Token Context Is Lost

Resume from this file first，然後讀 `studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md` 取得完整決策。

## Current Truth

- VS Code Claude is not the active runner.
- Terry/Codex is active.
- Codex subagents may be used for scoped tasks, but every run must be summarized in `studio/AGENT-RUNS.md`.
- Project workspace: `E:\Project\2026\Gorilla Gun Survivor — Web Edition`
- Dev server: `http://127.0.0.1:5174/`
- Logs: `.ops/logs`

## Completed

- Project dev server moved to Project workspace.
- Durable scripts added under `automation/scripts`.
- Terry Live Ops terminal added.
- `src/data/weapons.json` added.
- `AutoWeaponSpec.ts` now loads weapon JSON.
- `tools/validate-weapons.mjs` added and strengthened.
- `npm run build` now includes `validate:weapons`.
- `studio/ROADMAP.md`, `studio/SPRINT-2026-05-18.md`, `studio/AGENT-RUNS.md`, `studio/TESTING.md` added.
- GAME-01 電弧短杖 wpn_shock_baton 已可遊玩、build 通過、Terry 標為 Done。

## Commands

```powershell
Set-Location "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
npm run validate:weapons
npm run build
npm run dashboard:update
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\scripts\status-dev.ps1
```

## Next Recommended Work

依 Terry 2026-05-19-1530 決策，順序執行：

1. VFX-01：電弧短杖彈道顏色 / 命中 spark / 發光 pulse / 鏈電。粒子總預算 ≤ 200。
2. QA-03：Plasma Bomber v1 vs v2 可讀性視測，產 `qa/reports/run-bomber-readability-20260519.md`。
3. STOP — 回報 Terry，等指示再進 ENEMY-01。
4. ENEMY-01：新行為怪物（盾兵 / 分裂 / 狙擊召喚三選一），placeholder 形狀，unlock ≥ 60s。
5. ART-01：等 OPENAI_API_KEY 注入後跑 `npm run art:concept`。
6. GAME-02：接 shock_baton_v3.glb，更新 weapons.json，build。

## Stop Rule

- 完成 VFX-01 + QA-03 後立刻停下回報 Terry。
- Before starting a major new content track，update this file and report Terry。
- 任何違反 launch brief 紅線（地圖無限大 / 變探險 / 改核心循環 / 加付費依賴）→ 寫 inbox，不要先做。
