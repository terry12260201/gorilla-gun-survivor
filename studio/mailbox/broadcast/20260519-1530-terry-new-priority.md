# 📢 BROADCAST — Terry 新優先順序（所有終端必讀）

Time: 2026-05-19 15:30
From: Terry (via Claude Cowork mode 代理)
Priority: P1
Full decision: `studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md`

## 新順序（Codex 立即生效）

```
1. VFX-01     電弧短杖彈道 / 命中 / 發光特效   [In Progress]
2. QA-03      Plasma Bomber 可讀性視測          [Next]
3. STOP — 回報 Terry
4. ENEMY-01   新行為怪物（盾兵 / 分裂 / 狙擊召喚）[Blocked]
5. ART-01     GPT Image 2 v3 概念圖             [Blocked: API key]
6. GAME-02    接 v3 GLB                         [Blocked]
```

## 必修小事（並行）

- DASH-01：Dashboard AI 夥伴狀態面板接 AGENT-RUNS.md 最新 5 筆
- PERF-01：產 `performance/budgets/bundle-size-2026-05-19.md`
- QA-TPL：產 `qa/reports/run-template.md`
- Sprint table：GAME-01 已標 Done、VFX-01 已標 In Progress

## 硬指標 / 紅線

- VFX 粒子總預算 ≤ 200（Volt TA 簽核線）
- ENEMY-01 unlock ≥ 60s（避免玩家還沒升等就被壓死）
- OPENAI_API_KEY 永不寫進 repo / Dashboard / .ops/logs / Obsidian
- 不准 force-push、不准動 main、不准刪 .ops/logs
- 完成 VFX-01 + QA-03 後**立刻停下回報 Terry**，不要連跑 3 個 task

## 給每個 Agent 角色的提示

- **VFX Artist (T-A4)**：你是 VFX-01 主責，產 `art/vfx-briefs/shock-baton-arc.md` 並把粒子數寫進去
- **Volt TA (T-P5)**：審查 VFX-01 粒子預算，否決權生效
- **QA Analyst (T-Q1)**：QA-03 主責，照 `qa/reports/run-template.md`（要先建好）填
- **Combat Designer (T-D3)** + **Systems Designer (T-D1)**：ENEMY-01 行為選擇要先寫 inbox 提案
- **CAO Raven (T-A0)**：QA-03 視測結論需要你簽字
- **CMO Harvest (T-M0)** + **Scarlet (T-M5)**：先暫緩等遊戲端產出可宣傳的爽感片段，再排素材

## 不在這輪的事（不要做）

- 不做：地圖擴張、新角色、Steam 頁面、Trailer 拍攝、Meta 升級條改動
- 不做：核心循環任何改動（殺撿升抽撐順序不可動）
- 不做：拉新付費依賴（OpenAI 以外的 SaaS / API）

---

Codex：讀完這份請在 AGENT-RUNS.md 補一筆 ACK，格式：

```markdown
## 2026-05-19 Codex ACK / Terry Direction Received

Status: Acknowledged
Task: 接收 Terry 2026-05-19-1530 新順序
Changed: HANDOFF-CURRENT.md, SPRINT-2026-05-18.md
Next: 開始 VFX-01
```
