# [ESCALATE] Claude scheduled loop 連 5 tick 卡 verify — 暫停喚醒、Terry 回手動 reset

From: Claude (Cowork scheduled loop, tick #6 wake)
To: Terry (nanhong@pumpkinvrar.com)
When: 2026-05-19 ~19:30 TPE（server UTC 06:03，scheduled task 喚醒）
Severity: Escalate — 主動暫停，等你回來決策
Inbox 規則：你回來看到本檔就先讀，再決定下一步

---

## TL;DR（先給結論）

1. **連 5 個 tick 卡在「Terry verify」**（tick #2 / #3 / #4 / #5 / 本 tick #6 都沒被 verify）。
2. 根源：**`.git/index` 仍 corrupt**（16 bytes 全 `\0`）+ **`.git/HEAD.lock` / `index.lock` 兩個 0-byte lock 仍在**。沙盒不能修 git（mount 拒絕 unlink），只能等你在 Windows 跑 recovery 腳本。
3. 依本 loop 的 hard rule（連續 5 tick 沒 verify → escalate 寫 inbox），本 tick **不做新工作**，只寫這封信並建議你做 **一件事**：跑 recovery → verify 全部 host-written changes → commit + push。
4. 不建 `automation/STOP.txt`（VFX-01 + QA-03 還沒 Done，不是「本輪終點停車」場景）。如果你想完全停 scheduled task，自己 `New-Item automation\STOP.txt` 即可。
5. 沒有觸發任何紅線、沒有違反 outbox 決策、沒有 force-push、沒有改 main 政策、沒有寫 token、粒子預算未動。

---

## 你回來只需做這 5 步（10–15 分鐘）

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"

# Step 1：修 git（清 lock + 重建 index）
Remove-Item .git\HEAD.lock,.git\index.lock,.git\objects\maintenance.lock -Force -ErrorAction SilentlyContinue
git read-tree HEAD
git status   # 應該活了，看得到 ahead origin 1 + 一堆 untracked

# Step 2：驗 VFX-01 Slice 2（weapons.json + validator + schema）
npm run validate:weapons   # 應印 "[weapons] validated 8 weapon rows."
npm run build              # 應該綠

# Step 3：驗 PERF-01 baseline（重 build 後對 4 個數字）
# 看 performance/budgets/bundle-size-2026-05-19.md §6 PowerShell
# 對得上就拿掉檔頭 "(pending Terry verify)" tag

# Step 4：一次 commit 5 個 batch（Slice 2 + QA template + PERF baseline + SPRINT sync + OpenSpec）
git add src/data/weapons.json `
        tools/validate-weapons.mjs `
        studio/schemas/schema-weapons.md `
        qa/reports/run-template.md `
        performance/budgets/bundle-size-2026-05-19.md `
        studio/SPRINT-2026-05-18.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/claude-as-codex-loop.md `
        studio/AGENT-RUNS.md `
        studio/mailbox/terry-inbox/2026-05-19-1930-claude-escalate-5-ticks-blocked.md
git commit -m "claude(loop tick #2-#6): vfx-01 slice 2 + qa-03 template + perf-01 baseline + sprint sync + escalate inbox"

git add openspec/
git rm studio/prompts/ceo-pumpkin-king.md
git commit -m "claude(openspec): initial spec architecture + 24 role prompts (62 files)"

git push origin main

# Step 5：在 AGENT-RUNS.md 補一筆 Terry verify entry（讓下一 tick 看得到），格式：
# ## 2026-05-19 HH:MM Terry verify (manual)
# - Slice 2: pass / fail
# - tick #3 QA template: pass
# - tick #4 PERF baseline: pass / 差異 X KiB（如果 > 1 KiB 註明）
# - tick #5 SPRINT sync: applied
# - openspec batch: applied
# - 結論：Slice 3 可開始 / Slice 2 需重做
```

---

## 為什麼要 escalate

`studio/claude-as-codex-loop.md` Hard Rule：
> ⚠️ Hard rule: 下一 tick 仍 blocked 就只能 edit existing — 連續 5 個 tick 沒 verify 就停下寫 inbox 主動 escalate

歷史：

| Tick | 時間 (TPE) | 動作 | Verify 狀態 |
|---|---|---|---|
| #1 | 17:15 | VFX-01 Slice 1 brief | git commit 195a4b4 ✅（git push 失敗，沙盒無 auth）|
| #1b | 17:25 | 政策修正：沙盒不再碰 git | N/A（純文件）|
| #2 | 17:45 | VFX-01 Slice 2（weapons.json + validator + schema）| **pending**（沙盒 mount stale → 沙盒 npm 拿截斷檔 SyntaxError，host Read 看到正確版）|
| #3 | 18:00 | QA-03 並行：qa/reports/run-template.md | **pending**（純文件）|
| #4 | 18:15 | PERF-01 並行：bundle-size-2026-05-19.md | **pending**（純文件，但數字要對 Windows build）|
| #5 | 18:55 | SPRINT 表 status sync（純 doc hygiene）| **pending**（純文件）|
| #6 | 19:30 | **本封信** — escalate | — |

5 個 tick 都沒進 git history，原因都是 `.git/index` corrupt → 本機 git 任何指令都會回 `bad signature 0x00000000`。

我 tick #1 嘗試在沙盒跑 git，發生了把 index 寫壞的事；tick #1b 改政策禁止沙盒碰 git；tick #2 起就再沒碰過 git。所以**這個 corrupt 是 tick #1 留下來的後果，我自己沒辦法修**。

---

## 沙盒側現況（你回 Windows 前的 snapshot）

- `automation/STOP.txt`：不存在
- `studio/HANDOFF-CURRENT.md`：開頭沒 STOP，仍指向 1530 outbox 決策
- `studio/mailbox/terry-outbox/`：仍只有 `2026-05-19-1530-terry-direction.md`（無更新決策）
- `.git/HEAD.lock`：0 bytes，2026-05-19 03:59 UTC（tick #1 留下）
- `.git/index.lock`：0 bytes，2026-05-19 04:00 UTC
- `.git/objects/maintenance.lock`：存在
- `.git/index`：開頭 32 bytes 全 `\0`（仍 corrupt）

VFX-01 進度：**2/6 slice**（Slice 1 in commit 195a4b4 / Slice 2 host-written pending）
QA-03 進度：**0.5/3**（template ready / 玩測未跑 / CAO 簽字未寫）
PERF-01 進度：**1/1**（baseline 寫完，本 card 只要 baseline）
SPEC-01（OpenSpec batch）：**62/62**（在 Terry-in-conversation batch 寫完，pending git add）

---

## 我下一 tick 喚醒會做什麼

依本 loop Step 1-2 流程：

1. **先看你有沒有在 AGENT-RUNS.md 寫 verify entry**
   - 有 → 開 VFX-01 Slice 3（AutoWeaponSpec.ts signatureVFX 欄位 + Projectile.ts state 微抖 + AutoWeapon.ts fire() 傳遞）
   - 沒有 → 再寫一封 inbox 信告知（不會再做新工作；hard rule 已觸發 → 自動「降載」到純通報）

2. **特殊情況**
   - 看到 `automation/STOP.txt` → 立刻寫一筆 AGENT-RUNS.md 然後退出
   - 看到新 outbox 決策檔（比 1530 還新）→ 先讀新決策再判斷
   - 看到 `studio/mailbox/terry-inbox/` 出現你的回信 → 依你的指示走

---

## 你可以選的應對方案（自己決定）

| 方案 | 動作 | 適合什麼狀況 |
|---|---|---|
| A. 收尾 + 繼續 loop | 跑上面 5 步，loop 繼續推 Slice 3 | 你今晚還在、想看 Slice 3 進度 |
| B. 收尾 + 暫停 loop | 跑 5 步 + `New-Item automation\STOP.txt -Value "manual pause"` | 你今晚要睡了、明天再決定 |
| C. 不收尾、暫停 loop | 只跑 `New-Item automation\STOP.txt` | 你想之後一次性處理，先讓 loop 別再寫 inbox |
| D. 完全 revert tick #1-#6 | `git stash` + 自己決定 | 你覺得 loop 方向錯了（極端方案，不建議；所有 work 都還在工作樹）|

我建議 A 或 B。**沒有任何 commit 風險**：所有 host-written changes 都還在工作樹，沒 push 任何錯東西，最壞情況也就是 `git checkout .` 還原。

---

## 紅線檢查（escalate 前最後一次自查）

- ❌ 力 push：沒做（沒有 push 過任何東西）
- ❌ 動 main 政策：沒做
- ❌ OPENAI_API_KEY 進 repo：沒做
- ❌ 改 launch brief 紅線（核心循環 / 地圖無限大 / 變探險 / 加付費依賴）：沒做
- ❌ VFX 粒子超 200：N/A（Slice 2 還沒到實作粒子）
- ❌ ENEMY-01 提早 unlock：沒做
- ❌ 偏離 outbox 決策：沒做（5 個 tick 都在 outbox 點名的 VFX-01 / QA-03 / PERF-01 / 並行小事 範圍內）
- ❌ Senior agent disagreement：N/A

—— Claude
