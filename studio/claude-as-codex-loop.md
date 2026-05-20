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
last_run: 2026-05-20T07:30:00+08:00
current_task: ESCALATED (degraded + doc-only backlog **CLEARED**, pure-idle mode) — awaiting Terry git recovery + manual verify (29 tick blocked, reminder #9 sent tick #30, reminder #10 排 tick #33)
current_slice: "tick #30: 三條件檢查 → (a) automation/STOP.txt 不存在 ✓ (host Glob `**/STOP.txt` 0 match + Glob `automation/**/*.txt` 0 match，automation/ 仍只有 scripts/+workflows/)、(b) Terry verify entry 仍無 (grep `^## .*[Tt]erry.*[Vv]erify` AGENT-RUNS.md 0 match，sandbox `ls studio/mailbox/terry-outbox/` 唯一決策仍是 2026-05-19-1530-terry-direction.md，inbox 8 封 reminder 全是 Claude 自寫，無 Terry 回覆；沙盒實測 `head -c 4 .git/index | od -An -c` 仍 `\0 \0 \0 \0` 確認 index header corrupt，`.git/index` mtime May 19 04:00 未動 → ~6.5 小時未 recover)、(c) 觸發 → 依降載每 3 tick 規則 **寫 reminder #9** 至 `studio/mailbox/terry-inbox/2026-05-20-0730-claude-still-blocked-tick30.md`（沿用 reminder #8 三段結構：一句話結論 + 三條件檢查 + git corruption 時間軸 + 為什麼這封更急 + 累積 PENDING + 三選一請求 A/B/C 第 3 次重發 + 收尾腳本快捷 + 紅線檢查；更新數字 26→29 tick blocked / ~5→~6.5 小時 / 7→8 連續降載 tick；下一封 reminder #10 排 tick #33=#30+3）+ 更新 AGENT-RUNS entry + loop.md 狀態檔 + 寫 .ops/logs/claude-loop-20260520-0730.log。**未動 code/data/config/openspec/PENDING-CHANGES/art/qa/performance/sprint 表**。Doc-Only Backlog 9/9 仍全清，嚴守「不再挑 backlog、不開任何 code slice」規則。三選一請求 A/B/C (reminder #7/#8/#9) 第 3 次重發仍懸而未決，等 Terry 指示。降載序列：#6→#9→#12→#15→#18→#21→#24→#27→**#30**（9 封 reminder，每差 3 tick）。純 idle tick 序列仍 6 個 (#22 #23 #25 #26 #28 #29)，本 tick #30 屬 reminder tick 不算純 idle。"
next_slice: "tick #31 三條件檢查：(a) automation/STOP.txt 出現 → 退出 + 寫 idle entry；(b) AGENT-RUNS.md 出現 Terry verify entry 且 .git/index header 恢復 DIRC（head -c 4 .git/index | od -An -c 應顯示 'D   I   R   C'）→ 開 VFX-01 Slice 3（AutoWeaponSpec.ts signatureVFX?: 'electric' + WEAPON_SPEC_FIELDS + Projectile.ts ProjectileState 加 signatureVFX 欄位 + 子彈每幀微抖 ±5% scale ±3% emissive + AutoWeapon.ts fire() 傳遞 spec.signatureVFX → SpawnOptions → state）；(c) 都沒變 → 依降載每 3 tick 規則 **純 idle**（reminder #10 仍排 tick #33=#30+3，**本 tick #31 不寫信**），只更新 AGENT-RUNS entry + loop.md 狀態檔 + 寫 .ops/logs/claude-loop-20260520-0800.log。Backlog 已全清，**不再挑 backlog**，純 idle 模式。仍不開任何 code slice 直到 b 條件達成。若 outbox 出現新決策（比 2026-05-19-1530-terry-direction.md 更新）→ 必須先讀新決策再決定行動。"
vfx_01_progress: 2/6   # slice 1 + slice 2 寫完（slice 2 verify 仍待 Terry）
qa_03_progress: 0.5/3  # tick #3 寫了 run template，玩測 / 報告 / CAO 簽字仍未開始
perf_01_progress: 1/1  # tick #4 baseline 寫完，本 card 只需 baseline 文件（outbox 規定不做 optimization）→ 待 Terry verify 即 Done
spec_01_progress: 62/62 # Terry-in-conversation 18:40 + 19:10 兩 batch 寫完 62 個 openspec 檔（pending Terry git add）
dash_01_progress: 9/9   # Terry-in-conversation 20:45 batch 3 寫完 dashboard openspec panel + 8 個 cards/meta/maps 檔（pending Terry git add）
maps_backlog_progress: 3/3  # tick #12 完成 ruins/caverns/neon 3 張 proposal stub（pending Cartograph + CAO + CTO 三方簽字）
operator_backlog_progress: 1/1  # tick #13 完成 terry-operator-codex → openspec/roles/operator/claude-codex.md 搬家 + 舊檔 DEPRECATED stub
audio_backlog_progress: 1/1  # tick #14 完成 audio-system.md 4-channel 預算分配 + 9-track music + 10-bank SFX + polyphony + encoding + loading strategy
cards_synergy_progress: 1/1  # tick #15 完成 18 卡 _SYNERGY-MAP.md（10 build / 9 衝突 / 5 OPEN questions / Volt perf table）（pending Balance Architect + Combat Designer + Volt TA 三方簽字）
spawn_pool_progress: 1/1  # tick #16 完成 spawn-pool.md（11 隻 weight 表 + 三幕 pacing + Difficulty 6 函數 + QA mode + 5 OPEN questions）（pending T-D1 + T-D2 + T-D3 三方簽字）
drop_economy_progress: 1/1  # tick #17 完成 drop-economy.md（11 隻 heart/chest 表 + ambient/rescue heart 計時器 + XP orb 3 tier + 時間 bonus + 256 cap + magnet + META 4 軌 + 3 張 card + SFX + perf + QA + 5 OPEN questions）（pending T-D1 + T-D2 + T-D3 三方簽字）
enemies_owner_progress: 11/11  # tick #18 完成 11 隻 enemies/*.md ## Owner 段補完（Code T-P2 / Art T-A2 + T-A0 / Audio T-S3（miniboss + T-S2）/ QA T-Q1，每檔細化專屬職責句 + Changelog 補 tick #18 條目）
weapons_visual_progress: 8/8  # tick #19 完成 8 把 weapons/*.md ## Visual Identity 段補完（8 維度表 + Owner 補 CAO Raven T-A0 + T-A2 + T-A4 + 部分 T-P5 + 5 個待 CAO 仲裁色彩衝突集中列出）
build_pipeline_progress: 1/1  # tick #20 完成 systems/build-pipeline.md 審視 + 補強（Performance Budget Feedback Loop Requirement + Asset Conversion Workflow Requirement 含 3 階段 fallback + Owner 細化 + Changelog tick #20）→ **Doc-Only Backlog 9/9 全清**
sprint_hygiene: tick #5 完成；tick #6/#7/#8/#9/#10/#11/#12/#13/#14/#15/#16/#17/#18/#19/#20/#21/#22/#23/#24/#25/#26/#27/#28/#29/#30 未動 sprint 表
build_fail_streak: 0   # 沙盒測不出來，這欄已無意義
ticks_blocked_on_verify: 29  # tick #2–#30 都沒 Terry verify；hard rule 已於 tick #6 觸發 inbox escalate，tick #9 reminder #2，tick #12 reminder #3，tick #15 reminder #4，tick #18 reminder #5，tick #21 reminder #6，tick #24 reminder #7，tick #27 reminder #8，tick #30 reminder #9 sent；reminder #10 排 tick #33（tick #22 #23 #25 #26 #28 #29 純 idle 未寫信）
escalation_state: "ACTIVE (degraded + doc-only backlog **FULLY CLEARED + pure-idle mode**) — inbox letter sent tick #6 + reminder #2 sent tick #9 + reminder #3 sent tick #12 + reminder #4 sent tick #15 + reminder #5 sent tick #18 + reminder #6 sent tick #21 + reminder #7 sent tick #24 + reminder #8 sent tick #27 + reminder #9 sent tick #30；backlog 9/9 全完成（tick #12 #13 #14 #15 #16 #17 #18 #19 #20）；從 tick #21 起回到「純 idle + 每 3 tick reminder」標準降載模式；tick #22 #23 #25 #26 #28 #29 純 idle 無新 inbox；reminder #9 tick #30 已送（含三選一請求 A/B/C 第 3 次重發 + 29 tick blocked / ~6.5 小時 git corrupt 時間軸 + 沙盒實測 .git/index 仍 `\0 \0 \0 \0` 非 DIRC）；reminder #10 排 tick #33（若仍 blocked）；三選一請求仍懸而未決"
last_commit: "195a4b4 (slice 1 only; tick #2-#20 + 18:40 + 19:10 + 20:45 + 21:15 + 22:30 + 23:00 batch 全部 pending Terry git recovery + commit；tick #21 純 idle reminder #6 + 狀態檔；tick #22 #23 純 idle 狀態檔 + .ops log；tick #24 reminder #7 + 狀態檔；tick #25 #26 純 idle 狀態檔 + .ops log；tick #27 reminder #8 + 狀態檔 + .ops log；tick #28 純 idle 狀態檔 + .ops log；tick #29 純 idle 狀態檔 + .ops log；tick #30 reminder #9 + 狀態檔 + .ops log，無新 code/data commit 需求)"
last_push: "none"
key_files_found:
  - "src/weapon/LightningSystem.ts (已支援 chain() / strike() / storm())"
  - "src/fx/ImpactSparks.ts (已支援帶色 burst())"
  - "src/weapon/Elements.ts (lightning element 已定義)"
  - "src/weapon/Projectile.ts (ProjectileState 可加欄位)"
  - "src/weapon/AutoWeapon.ts (fire() 內呼叫 pool.spawn)"
key_unknowns:
  - "命中判定在哪檔案 — Slice 4 必須找到（猜 src/core/ 或 src/scene/Arena.ts）"
  - "Slice 2 改動是否真的通過 validate:weapons + build — 沙盒無法驗證，Terry 必須回來確認"
sandbox_health:
  - "git: 沙盒不能跑 (mount 拒絕 unlink → index corrupt)"
  - "host→sandbox file read: stale/truncated (tick #2 實測)"
  - "host→host Read/Write/Edit tool: 正常運作"
  - "結論: 沙盒只能 edit + 寫狀態，所有 verification 都要在 Windows 跑"
```

**Slice 路線圖**（每 slice ≤30 分鐘）：
- [x] Slice 1：寫 brief（tick #1）
- [x] Slice 2：weapons.json + validator + schema（tick #2，host-side edits 完成，verify-on-Windows 仍待 Terry — tick #3 確認 git 仍 corrupt）
- [ ] Slice 3：spec/state 加 signatureVFX + 子彈微抖 ← **blocked until Terry verifies Slice 2**
- [ ] Slice 4：找命中判定 + 加 1 跳鏈電 + 帶色 spark
- [ ] Slice 5：build + runtime check + AGENT-RUNS
- [ ] Slice 6：切換到 QA-03

**QA-03 並行 slice 路線**（不依賴 VFX-01 Slice 2，可在 VFX-01 blocked 時推進）：
- [x] tick #3：`qa/reports/run-template.md` v1.0（玩測填寫模板）
- [ ] tick #?：Terry 用模板跑一次 Checkpoint B 玩測 → 產 `qa/reports/run-bomber-readability-20260519.md`（Plasma Bomber v1 vs v2 視測）
- [ ] tick #?：CAO Raven 簽字段落補上

**PERF-01 並行 slice 路線**（不依賴 VFX-01，本 card 只需 baseline 文件，optimization 是後面的卡）：
- [x] tick #4：`performance/budgets/bundle-size-2026-05-19.md` v1.0（總 size / main chunk / three.js chunk 拆分建議 / top 5 大檔 / 度量方法 / pending Terry verify）
- [ ] Terry verify-on-Windows：重 `npm run build`、用檔內 §6 PowerShell 對 4 個關鍵數字 → 沒差就拿掉 `(pending Terry verify)` tag 並 commit

**SPRINT 表同步**（doc-only hygiene，不阻塞主線）：
- [x] tick #5：`studio/SPRINT-2026-05-18.md` 表格 status 列同步 — VFX-01 註明 Slice 2 pending verify + Slice 3 blocked、QA-TPL 改 In Progress、PERF-01 改 In Progress、QA-03 註明 template ready、新增 SPEC-01 列記錄 18:40 OpenSpec batch
- [ ] Terry 一鍵收尾把 `studio/SPRINT-2026-05-18.md` 一起 `git add` （已寫進 PENDING-CHANGES）

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

## Doc-Only Backlog (2026-05-19 22:45 新增 — 解決 idle 浪費)

之前 tick #6+ 進入 ESCALATE 後純 idle 浪費 30 分鐘一輪。改為：**code 改動仍 blocked，但純文件工作可以推進**。每 tick 喚醒時，如果三條件 (a/b/c) 都不變、且本 backlog 還有項目，挑一個做：

### Backlog 池（任何 tick 都可挑 1 個）

- [x] **Maps 3 張 spec stub**：`openspec/specs/maps/{ruins, caverns, neon}.md` ✅ tick #12 完成（皆標 PROPOSAL — pending Cartograph + CAO + CTO 三方簽字；含 30 秒週長計算、垂直層、秘密區 risk gate、主動環境、perf 預算、OPEN 問題清單）


- [x] 把 `studio/prompts/terry-operator-codex.md` 搬進 `openspec/roles/operator/claude-codex.md` ✅ tick #13 完成（新檔對齊 ceo-pumpkin-king.md 範本，含 Mission/Operating Prompt/Authority/Decision Classes/Mailbox Workflow/Hard Numbers/Wake Loop/Linked Specs/Red Lines/Changelog；舊檔改 DEPRECATED stub）
- [x] `openspec/specs/systems/audio-system.md` 補完 SFX/Music 預算具體分配 ✅ tick #14 完成（4 channel sub-budget Music 1.8/SFX 3.0/UI 0.3/Voice 0.3 MB + Music 9-track + SFX 10-bank ~41 件 + Polyphony 12/2/2 voices + Encoding OGG q4/q2/q1 + Loading 4 階段 + Cache 紀律 + Mute 控制 + 4 條 OPEN 問題給 Music Composer/Audio Director/CMO/Volt TA）
- [x] 為 18 張卡寫 `_SYNERGY-MAP.md`：列出「火焰流 / 鏈電流 / 狙擊流 / Tank 流」等 build 配方 ✅ tick #15 完成（10 個 build 提案 + 9 條 Cross-Build Conflict Matrix + 4 組元素配對 + 5 條 OPEN questions 給 Balance Architect/Combat Designer/Volt TA/Web Frontend + Volt Perf Sanity Table 抓出 Build 1 鏈電流必爆 PERF-02 30 arcs cap）
- [x] 寫 `openspec/specs/systems/spawn-pool.md`：把 `EnemyTypes.ts pickSpawnType()` 邏輯文件化 ✅ tick #16 完成（11 隻 weight + unlockAt 表 + 三幕 PvE pacing 區段 0–34s/35–89s/90s+ + Difficulty.ts 6 個函數曲線 + 10 個關鍵時間點 stat scaling 數值表 + QA mode ?qaBombers=1 deterministic round-robin + INITIAL_SPAWN_DELAY 3s + SPAWN_DISTANCE 24 + 與 XP/Drop/Card/Boss 接口 + Performance Budget + 5 個 OPEN questions 給 T-D1/T-D2/T-D3/Combat Designer/CMO + 8 個 Related Specs cross-reference）（pending T-D1 + T-D2 + T-D3 三方簽字）
- [x] 寫 `openspec/specs/systems/drop-economy.md`：heart / chest / XP orb 全套掉落經濟 ✅ tick #17 完成（11 隻 heartDropChance + chestDropChance + xpTier + xpCount 表 + ambient 38s + rescue 14s @ ≤40% HP heart 注入線 + HEART_LIFETIME 30s + MAX_FIELD_HEARTS 3 + heart heal 25 / chest pendingLevelUps+1 + XP orb 3 tier 數值 (1/5/15 XP) + enemyXpTierBonus 0–59s+0 / 60–119s+1 / 120s++2 + 256 orb cap + magnet 6m + xp_magnet upgrade +3m/stack + META 4 軌 hp/damage/xp/weapon 接口 + heal/max_hp/xp_magnet 3 張 common card 對照 + sfx.heartPickup/chestOpen/pickup + deathBurst 紅光通知 + Performance Budget + QA Hooks + 5 個 OPEN questions 給 Balance Architect (×2) / Combat Designer / Systems Designer / Volt TA / QA Analyst + 9 個 Related Specs cross-reference）（pending T-D1 + T-D2 + T-D3 三方簽字）
- [x] **為 `enemies/*.md` 11 隻補完 `## Owner` 段** ✅ tick #18 完成（11 個檔每個都補完 Code: Gameplay Programmer T-P2 / Art: 3D Specialist T-A2 + CAO Raven T-A0 + Concept Artist T-A1 where needed / Audio: SFX Designer T-S3（miniboss 另加 Music Composer T-S2 stinger 用）/ QA: QA Analyst T-Q1，每隻怪寫專屬職責 1-2 句說明 grunt/fast/scout/heavy/ranged/caster/brute/miniboss/rusher/bomber/plasma_bomber_v2）
- [x] **為 `weapons/*.md` 8 把補 `## Visual Identity` 段** ✅ tick #19 完成（8 個檔每個都加 8 維度表 Silhouette / Bullet color / Muzzle flash / Impact spark / Trail / Motion cue / Readability target / Performance budget + Owner 補 CAO Raven T-A0 + 3D Specialist T-A2 + VFX Artist T-A4 + 部分 Volt TA T-P5 + Related Specs 補 cross-ref + Changelog tick #19；集中列 5 個待 CAO Raven 仲裁色彩衝突：(1) 8L 紫 vs shock_baton 紫白 3 方案 (2) basegun_d 橘紅 vs flamethrower 橘黃 hue 距離 (3) 5l2 青 + Fire 附魔疊色 (4) flamethrower 火球 vs burn DPS 地圈層次 (5) flamethrower 預算 3 取捨）
- [x] 寫 `openspec/specs/systems/build-pipeline.md`：把 `npm run build` 含 validate:weapons + tsc + vite 流程文件化 ✅ tick #20 完成（檔已存在且大致完備，本 tick 補強 2 個 Requirement：`Performance Budget Feedback Loop`（對比 vite build vs baseline §4，偏離 ≥ 5% warning，含 2 個 Scenario）+ `Asset Conversion Workflow`（Blender 主路徑 → fbx2gltf fallback → 手動 3 階段，含 1 個 Scenario）+ Owner 細化（Spec=T-P4 / Authority=CTO Circuit+Volt TA / Asset=CAO Raven+T-A2 / Validator=T-P4+Combat Designer / Final=CEO Pumpkin King）+ Changelog tick #20）→ **Doc-Only Backlog 9/9 全清宣告**

### 規則

- ✅ **只動 `openspec/`、`studio/`、`art/*-briefs/`、`qa/reports/`、`performance/profiles/` 等純文件目錄**
- ❌ **絕對不動 `src/`、`tools/`、`public/assets/`、`package.json`** 等 code/config（這些需 verify-on-Windows）
- ✅ 每完成 1 個 backlog 項目，在 `CLAUDE-PENDING-CHANGES.md` 加 tick 段落 + 在 backlog 池上方加 ✅
- ✅ 每 tick 最多做 1 個 backlog 項目（避免 verify 工作量爆炸）
- ❌ 不開**新**的 backlog 項目（除非寫 inbox 請 Terry 加）
- ✅ Backlog 跑完之後 → 回到原本「純 idle + 每 3 tick 寫 reminder」模式

### 與三條件檢查的整合

- (a) STOP.txt 出現 → 退出
- (b) Terry verify entry 出現 → 開始 VFX-01 Slice 3+（**優先於 backlog**）
- (c) 都沒變 → **挑 backlog 1 項做**（之前是純 idle 寫 reminder）

---

## Git 政策（2026-05-19 17:25 最終版 — 沙盒不碰 git）

**重要：沙盒 git 在 Windows mount 上會把 repo 搞壞**（unlink 權限被擋 → lock files 殘留 → index corrupt）。**絕對不從沙盒跑 git 任何指令**。

替代機制：
- ❌ 不跑 `git add` / `git commit` / `git push` / `git status` / `git log` / `git fsck`
- ✅ 每個 slice 結束時，**只更新 `studio/CLAUDE-PENDING-CHANGES.md`** — 列出新動的檔案
- ✅ Terry 回 Windows 時讀 PENDING-CHANGES，自己 `git add <清單>` + commit + push

如果某個 tick 真的需要看 git 狀態（例如判斷有沒有 conflict）：**改成讀 `studio/CLAUDE-PENDING-CHANGES.md` 的最後狀態**，不要直接呼叫 git。

## NPM Verification 政策（2026-05-19 17:45 修正 — 沙盒 npm 結果不可信）

**tick #2 實測發現**：host-side Edit/Write tool 寫進 mount 的檔案，沙盒端 bash/node/wc/grep 讀到的是**截斷或舊版**的內容（mount 對 sandbox 讀者 cache 了 stale view）。例如本 tick 把 `tools/validate-weapons.mjs` 寫到 139 行，但沙盒看到只剩 118 行斷在 `if (!isNumber(cha` → `npm run validate:weapons` 拿到 SyntaxError，但其實 host 端檔案是好的。

因此：
- ❌ **不再用 `npm run build` / `npm run validate:weapons` 的結果判斷「本 tick 的改動是否通過」** — 結果不可信
- ❌ 不要看到 npm fail 就以為自己改壞了（會把好檔案當壞檔案重改、越改越亂）
- ✅ Slice 完成的判定改為：**host-side Read tool 看自己剛寫的檔案，邏輯/語法正確、跟 brief/spec 一致** → 就算完成
- ✅ 每個 tick 在 `CLAUDE-PENDING-CHANGES.md` 明確列「verify-on-Windows pending」清單給 Terry
- ✅ Terry 回 Windows 才是真正的 build/validate 把關者，他過了才算 Done
- ✅ 沙盒仍可跑 `npm run build` 做 baseline 健康度 sanity check（如果連 baseline 都壞了會抓到），但**只用來證明 baseline 沒壞，不證明本 tick 通過**

實作影響：5 步流程的 Step 4 改寫如下：
1. （如果動到武器資料）host Read 自己剛寫的 weapons.json，肉眼校對 JSON 合法、欄位齊全
2. host Read 自己剛寫的 .ts/.mjs，肉眼校對語法、import、export 正確
3. **跳過 `git add` / `git commit` / `git push`**
4. 在 `CLAUDE-PENDING-CHANGES.md` 加本 tick 的 verify-on-Windows 清單
5. 在 `AGENT-RUNS.md` 寫一筆，verification 欄寫「verify-on-Windows pending」

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
