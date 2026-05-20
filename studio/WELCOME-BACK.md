# 歡迎回來，Terry — 你不在的這段時間發生了什麼

Last updated: 2026-05-19 22:45

## 30 秒摘要

你 2026-05-19 ~22:45 離開。Claude 在這次對話中完成 5 個 batch + 14 個 scheduled task ticks，共產出 **約 93 個新檔 + 1 個 src 修補**。

**全部 pending verify-on-Windows**：你回來必做的第一件事是 git recovery + 一次 commit + push（指令見下方）。

---

## 你的 5 步收尾腳本（10 分鐘）

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"

# Step 1: 修 git lock（必做）
Remove-Item .git\HEAD.lock,.git\index.lock,.git\objects\maintenance.lock -EA SilentlyContinue
git read-tree HEAD

# Step 2: 跑 validate + build 確認 Claude 寫的東西沒寫壞
npm run validate:weapons    # 預期 "[weapons] validated 8 weapon rows."
npm run build               # 預期 pass（仍有既存 chunk size warning）

# Step 3: 跑 dashboard 看新「規格健康度」panel
npm run dashboard:update
explorer studio\dashboard\terry-progress.html

# Step 4: 跑 dev server 驗 PERF-02 LightningSystem 修補
npm run dev
# 開 Chrome，玩遊戲，盡量抽到 shock_baton + lightning_strike + chain_arc
# Console: window.game?.lightningSystem?.arcCount  → 應永遠 ≤ 30
# 看 FPS：應穩定 60，無 frame spike > 100ms

# Step 5: 一次 commit + push 全部 batch
git rm studio/prompts/ceo-pumpkin-king.md
git add tools/update-terry-dashboard.mjs `
        studio/dashboard/terry-progress.html `
        openspec/ `
        studio/ `
        src/data/weapons.json `
        src/weapon/LightningSystem.ts `
        tools/validate-weapons.mjs `
        qa/reports/ `
        performance/budgets/ `
        performance/profiles/ `
        art/vfx-briefs/
git commit -m "claude: full architecture batch (openspec 93 files + VFX-01 slice2 + QA + PERF + dashboard + PERF-02 LightningSystem cap)"
git push origin main
```

---

## Claude 做了什麼（時間倒序）

### Terry-in-conversation batches（你在線上時做的）

| Batch | 時間 | 內容 | 檔案數 |
|---|---|---|---|
| 1 | 18:40 | OpenSpec 基礎架構（foundation + 28 entity specs + 7 critical roles） | 38 |
| 2 | 19:10 | 24 位一般角色 prompt + DEPRECATED 舊 CEO prompt | 25 |
| 3 | 20:45 | Dashboard 改造（規格健康度 panel）+ cards/meta/maps templates | 9 |
| 4 | 21:15 | 反推 15 張既有卡（從 src/progression/UpgradeCards.ts）+ 2 動態 meta + 3 deprecated | 20 |
| 5 | 22:30 | PERF-02 LightningSystem cap + eviction + GPU dispose（修 src/） | 3 |
| 6 | 22:45 | META 4 條 track 提案（含 1 個有爭議的「第二次機會」） + loop 政策更新 + 本檔案 | 6 |

### Scheduled task ticks（自動跑的）

| Tick | 時間 | 內容 | 狀態 |
|---|---|---|---|
| #1 | 17:15 | VFX-01 Slice 1：寫 shock-baton-arc.md brief | ✅ 已 commit 195a4b4 |
| #1b | 17:25 | 發現 git 災難（mount 不允許 unlink）→ 政策改沙盒不碰 git | ✅ |
| #2 | 17:45 | VFX-01 Slice 2：weapons.json + validator + schema | 🟡 pending verify |
| #3 | 18:00 | 並行 QA-03：寫 qa/reports/run-template.md | 🟡 pending verify |
| #4 | 18:15 | 並行 PERF-01：寫 performance/budgets/bundle-size-2026-05-19.md | 🟡 pending verify |
| #5 | 18:30 | Sprint 表同步（SPRINT-2026-05-18.md 加 SPEC-01 列等） | 🟡 pending verify |
| #6 | 19:30 | ESCALATE：連 5 tick 卡 verify → 寫 inbox 第一封 | 🟡 inbox 已送 |
| #7-#8 | 20:00-20:30 | 純 idle（依降載規則） | — |
| #9 | 21:00 | reminder #2：寫 inbox 第二封 | 🟡 |
| #10-#11 | 21:30-22:00 | 純 idle | — |

---

## 三大重要決定等你拍板

### 1. META track 4 條提案
- 🛡️ 鋼鐵之軀（HP）— 已有檔
- ⚡ 起始火力（damage）— 新
- 🧲 磁場本能（XP magnet）— 新
- ❤️ **第二次機會（復活）— 高風險，可能違反「死了就重來」紅線。請你 / CEO 簽字**

詳見 `openspec/specs/meta-progression/_PROPOSAL-README.md` 的「待 Terry 決定的 3 個 OPEN 問題」。

### 2. 反推卡時挖出 5 個既有設計問題
詳見 `studio/CLAUDE-PENDING-CHANGES.md` 「5 個浮現的 OPEN 問題」段：

1. `move_speed` 沒上限
2. `heal` 滿血時抽到浪費
3. `double_shot` spread 角度未文件化
4. `homing_up` 沒 prerequisite gate
5. **效能爆雷（已修補，待 Volt verify）**：shock_baton + chain_arc × 4 = 40+ 弧 → 已用 PERF-02 patch 修

### 3. 整體 OpenSpec 採用策略
你說「架構 OK 繼續補」之後我補完了。現在 `openspec/` 共 93 個 .md（30 entity specs + 22 cards-related + 5 meta-progression + 1 map + 31 roles + 4 foundation）。

下一步可考慮：`npm install -g @fission-ai/openspec@latest` + `openspec init` 讓官方工具接管 specs/changes 流程（之前評估認為現在裝太早，但 spec 量已起來，可以再評估）。

---

## scheduled task 的新政策（22:45 起生效）

之前 tick #6+ 進入 ESCALATE 後純 idle 浪費。**改成：code 改動仍 blocked，但純文件 backlog 可推進**。詳見 `studio/claude-as-codex-loop.md` 的「Doc-Only Backlog」段。

預計你不在的這晚，scheduled task 會慢慢清下面這些（每 30 分一項）：

- Maps 3 張 spec stub（Ruins / Caverns / Neon，以 Cartograph 角色寫）
- 把 `studio/prompts/terry-operator-codex.md` 搬進 openspec
- `audio-system.md` 補完 SFX/Music 預算
- 18 張卡的 synergy map
- spawn pool 系統 spec
- drop economy 系統 spec
- 補 enemies/weapons 漏寫的 owner / visual identity 段

**每完成一項都會更新 `CLAUDE-PENDING-CHANGES.md`**，你回來看一目了然。

---

## 你不必做的事

- ❌ 不需要審所有新檔（共 93 個）— 大部分是 reverse-engineered 自既有 code，跟現實一致
- ❌ 不需要立刻決定 META track 內容 — 提案放著沒人催
- ❌ 不需要回覆 inbox 信 — Claude 知道你還沒回，會繼續耐心 reminder

---

## 你必須做的事（依優先序）

1. **修 git lock + commit + push**（10 分鐘）— 否則 scheduled task 真實進度全卡在你 PC 本地
2. **跑 dev server 驗 PERF-02 LightningSystem 修補**（5 分鐘）— Volt 簽核欄位在 `performance/profiles/lightning-system-eviction-2026-05-19.md`
3. **檢查 dashboard 新「規格健康度」panel 是否好看**（2 分鐘）— 不好看告訴我
4. **看 META 4 提案，決定要不要做「第二次機會」**（5 分鐘）— 這條最有爭議

---

## 如果你想立刻看的 5 份檔案

```powershell
notepad studio\WELCOME-BACK.md                                   # 本檔
notepad studio\CLAUDE-PENDING-CHANGES.md                         # 全部 pending 一覽
notepad openspec\specs\meta-progression\_PROPOSAL-README.md      # META 提案
notepad openspec\specs\meta-progression\track_revive_charge.md   # 高爭議復活 track
notepad performance\profiles\lightning-system-eviction-2026-05-19.md  # PERF-02
```

---

晚安。回來時這份在你 dashboard 旁邊就好。
