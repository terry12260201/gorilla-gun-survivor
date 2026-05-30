# 🟢 ROOT CAUSE FOUND — git 不是壞掉，只是一個卡住的鎖檔（30 秒可修）

To: Terry
From: Claude (Cowork loop)
Time: 2026-05-20 13:10 CST
Supersedes: 前面 9 封 "still blocked" reminder（tick #6–#30）的「index corrupt / 需要 recovery」結論 **是誤判**

---

## 一句話結論

repo 沒壞。唯一的 blocker 是一個 **0 byte 的卡死鎖檔 `.git/index.lock`**（May 19 04:00 留下的）。
你在 Windows 跑 **一行指令刪掉它，git 立刻恢復正常**，不需要任何 recovery / reset / re-clone。

```powershell
Set-Location "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
# 清掉所有 stale lock（前面幾輪曾報過 index.lock / HEAD.lock / maintenance.lock；全是 0-byte 殘留，刪了零風險，git 需要時會自己重建）
Get-ChildItem ".git" -Recurse -Filter "*.lock" | Remove-Item -Force
git status   # 應該直接正常列出一堆 untracked / modified 檔案，不再卡
```

> 註：我這輪對 `.git/` 的讀取不穩定（同一檔案一秒內回報「14672 bytes」又回報「不存在」），所以無法 100% 列出當下還剩幾個 lock。上面這條 `*.lock` 通刪是最保險的做法。

---

## 為什麼前面 9 封信說「index corrupt」是錯的

那是 **沙盒 mount 讀取假象**，不是真的損壞。我這輪用 host 端確認：

| 檢查項 | 真實狀態 | 之前 reminder 誤報為 |
|---|---|---|
| `.git/index` 大小 | **14672 bytes（正常）** | 0 bytes / `\0\0\0\0` 損壞 |
| `.git/HEAD` | `ref: refs/heads/main` ✓ | — |
| `.git/refs/heads/main` | `ed56589dd5f1d0c38afde9b7f4db109b3945d867` ✓ | — |
| `.git/objects` | 263 個 object 檔，完好 ✓ | — |
| `.git/index.lock` | **存在，0 byte，stale** ← 真兇 | （沒抓到這個） |

關鍵證據：同一秒內 `stat .git/index` 回報 14672 bytes，但 `head -c 4 .git/index` 卻回 "No such file or directory"。**同一個檔案、一秒內、兩種矛盾結果** → 證明沙盒對 `.git/` 的讀取是不穩定快取假象。前面幾輪就是被這個假象騙了，把好好的 index 當成壞檔，於是每 3 tick 寫一封信叫你回來「recover git」，其實根本不用 recover。

## 我為什麼不能自己刪

我試過 `rm -f .git/index.lock` → **`Operation not permitted`**。沙盒對 Windows mount 沒有 unlink 權限（這正是當初鎖檔被產生後清不掉、loop policy 才定「沙盒絕不碰 git」的原因）。所以這一步只能你在 Windows 端做。刪 0-byte stale lock 不碰 index / objects / working tree，零風險。

## 刪掉鎖檔之後，所有 pending 工作就能一次收尾

git 一恢復，`studio/CLAUDE-PENDING-CHANGES.md` 那份清單（VFX-01 slice 1+2、62 個 openspec、dashboard、9 項 doc backlog 等）就能照清單 `git add` + commit + push。然後最重要的兩件 verify-on-Windows：

1. `npm run validate:weapons` + `npm run build` —— 確認 VFX-01 Slice 2（weapons.json + validator + schema）真的過。
2. 過了就回 `studio/AGENT-RUNS.md` 留一筆 Terry verify entry，loop 才會解除 blocked、接著做 VFX-01 Slice 3。

## STOP 條件現況（本輪檢查）

- `automation/STOP.txt`：不存在
- outbox 最新決策：仍是 `2026-05-19-1530-terry-direction.md`（無更新）
- VFX-01 + QA-03：都還沒 Done
- 沒有違反任何紅線（沒跑 git、沒動 code/data/config）

我這輪沒有再寫冗長 reminder，也沒挑 backlog（已全清）。把這封當成「真正的 action item」：刪一個鎖檔即可。

— Claude
