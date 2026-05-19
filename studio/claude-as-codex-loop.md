# Claude-as-Codex Loop Instructions

每次 scheduled task 喚醒 Claude，**第一件事讀這個檔案**。

Owner: Terry (nanhong@pumpkinvrar.com)
Started: 2026-05-19 ~17:00 local
Mode: Unattended autonomous, Claude Opus 直接執行 Codex 工作

---

## 你是誰、在做什麼

你是 Terry 的虛擬工程師（取代原本的 Codex 桌面 app）。
你直接讀寫 `E:\Project\2026\Gorilla Gun Survivor — Web Edition\` 的檔案。
你跑 bash 沙盒指令（npm / git / node）。
你的目標：按 Terry 在 outbox 拍板的順序推進遊戲開發，**Terry 不在場也不中斷**。

完整決策來源：`studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md`

---

## 每次喚醒固定流程（5 步）

### Step 1：讀狀態（3 個檔案）
1. `studio/HANDOFF-CURRENT.md` — Terry 最新方向、stop rule
2. `studio/AGENT-RUNS.md` — 上一次 Claude 跑到哪、有沒有寫 ACK
3. 這個檔案（claude-as-codex-loop.md）的「Current Task State」段（在下面）

### Step 2：檢查 STOP 條件
如果以下任何一條為真，**立刻寫 AGENT-RUNS.md 記錄並停下**，不要做任何修改：
- `automation/STOP.txt` 存在（Terry 緊急停車）
- `studio/HANDOFF-CURRENT.md` 開頭有 `STOP` 字樣
- VFX-01 + QA-03 兩個都已 Done（達成本輪目標）
- 連續 3 次 build fail（看 `.ops/logs/build.latest.log`）
- Git working tree 有未推送的衝突
- Outbox 出現比 `2026-05-19-1530-terry-direction.md` 更新的決策檔 — 必須先讀新決策

### Step 3：判斷當前 task
從 SPRINT-2026-05-18.md 的 Active Work Items 表找 status = "In Progress" 的任務。
本輪預設順序：**VFX-01 → QA-03 → STOP**

### Step 4：推進一個 slice（≤30 分鐘工作量）
- 不要試圖在一次喚醒裡做完整個 task
- 一次只做一個小步驟（例：「寫 VFX brief」、「實作 spark 粒子」、「驗證 build」）
- 完成 slice 後立刻：
  1. `npm run validate:weapons`（如果動到武器資料）
  2. `npm run build`
  3. `git add -A && git commit -m "claude(<task-id>): <slice 描述>"`
  4. `git push`（policy 已確認 auto push）
- 在 `AGENT-RUNS.md` 寫一筆，格式見下方

### Step 5：更新狀態並結束
- 把 Current Task State（下方）更新成下一個要做的 slice
- 寫 `.ops/logs/claude-loop-YYYYMMDD-HHMM.log`
- 退出，等下次喚醒

---

## Current Task State（每次喚醒由上一次的 Claude 維護）

```yaml
last_run: 2026-05-19T17:15:00+08:00
current_task: VFX-01
current_slice: "Slice 1 完成 — brief 已寫 art/vfx-briefs/shock-baton-arc.md"
next_slice: "Slice 2 — 改 weapons.json 顏色（[0.65,0.45,1.0] → [0.80,0.75,1.0]）、加 signatureVFX:electric 欄位、更新 tools/validate-weapons.mjs 與 studio/schemas/schema-weapons.md"
vfx_01_progress: 1/6   # slice 1 完成
qa_03_progress: 0/3    # 玩測 / 寫報告 / CAO 簽字
build_fail_streak: 0
last_commit: ""    # 等下一個 batch 補
last_push: ""
key_files_found:
  - "src/weapon/LightningSystem.ts (已支援 chain() / strike() / storm())"
  - "src/fx/ImpactSparks.ts (已支援帶色 burst())"
  - "src/weapon/Elements.ts (lightning element 已定義)"
  - "src/weapon/Projectile.ts (ProjectileState 可加欄位)"
  - "src/weapon/AutoWeapon.ts (fire() 內呼叫 pool.spawn)"
key_unknowns:
  - "命中判定在哪檔案 — 下個 slice 必須找到（猜 src/core/ 或 src/scene/Arena.ts）"
```

**Slice 路線圖**（每 slice ≤30 分鐘）：
- [x] Slice 1：寫 brief（**done this tick**）
- [ ] Slice 2：weapons.json + validator + schema
- [ ] Slice 3：spec/state 加 signatureVFX + 子彈微抖
- [ ] Slice 4：找命中判定 + 加 1 跳鏈電 + 帶色 spark
- [ ] Slice 5：build + runtime check + AGENT-RUNS
- [ ] Slice 6：切換到 QA-03

---

## AGENT-RUNS 寫法（每次喚醒必寫）

```markdown
## YYYY-MM-DD HH:MM Claude (Cowork loop tick #N)

Status: Running / Completed slice / Blocked / STOPPED
Task: VFX-01 / QA-03
Slice: <一句話描述這次做了什麼>

Changed:
- file1: 改了什麼
- file2: 改了什麼

Verification:
- npm run validate:weapons: pass / fail / N/A
- npm run build: pass / fail
- git commit: <sha> / N/A
- git push: pushed / skipped

Next Slice: <下次喚醒要做什麼>
```

---

## 紅線（違反就立刻停 + 寫 inbox 問 Terry）

- 不准 force-push、不准動 main 以外的分支政策
- 不准刪除 `.ops/logs/`、`studio/`、`art/`、`public/assets/custom/` 既有檔案
- 不准把 OPENAI_API_KEY / 任何 token 寫進 repo / dashboard / logs / obsidian
- 不准改 launch brief 紅線：核心循環、地圖無限大、變探險、加付費依賴
- VFX 粒子總預算 ≤ 200（Volt TA 硬指標）
- ENEMY-01 unlock 不能早於 60s（這輪根本不到 ENEMY-01，但記著）
- 任何改動偏離 outbox 決策 → 停下，寫 inbox 問 Terry
- 任何 senior agent disagreement → 停下，寫 inbox

---

## Git 政策（Terry 已確認）

- Auto commit：✅
- Auto push：✅
- Commit message 格式：`claude(<task-id>): <slice 描述>`
- 不准 force-push
- 不准動分支結構（不開新 branch、不 merge、不 rebase）
- 每個 commit 必須先過 `npm run build`

---

## 關鍵檔案路徑速查

| 用途 | Windows 路徑 | Bash 路徑 |
|---|---|---|
| 專案根目錄 | `E:\Project\2026\Gorilla Gun Survivor — Web Edition\` | `/sessions/<id>/mnt/Gorilla Gun Survivor — Web Edition/` |
| 決策正本 | `studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md` | 同上 |
| 廣播 | `studio/mailbox/broadcast/20260519-1530-terry-new-priority.md` | 同上 |
| Sprint 表 | `studio/SPRINT-2026-05-18.md` | 同上 |
| Agent runs | `studio/AGENT-RUNS.md` | 同上 |
| 武器資料 | `src/data/weapons.json` | 同上 |
| 武器規格 | `src/weapon/AutoWeaponSpec.ts` | 同上 |
| 敵人資料 | `src/enemy/EnemyTypes.ts` | 同上 |
| VFX 既有 | `src/fx/` | 同上 |
| Dashboard 更新 | `npm run dashboard:update` | 同 |
| Build | `npm run build` | 同 |
| Validate | `npm run validate:weapons` | 同 |

---

## 本輪終點

當你寫 AGENT-RUNS.md 時，VFX-01 和 QA-03 都標為 Completed slice 且 SPRINT 表的兩個 task 都改成 Done，**這時立刻**：

1. 把 Current Task State 的 `current_task` 改成 `STOPPED — awaiting Terry review`
2. 寫一份 `studio/mailbox/terry-inbox/<timestamp>-claude-vfx-qa-done.md` 通知 Terry 回來
3. 在 `automation/STOP.txt` 建一個檔案內容 "VFX-01 + QA-03 done, awaiting Terry"
4. 不要再開 ENEMY-01。違反者 = 違反 outbox stop rule。
