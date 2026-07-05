---
description: 同步驗證——確認這台電腦的 PM 系統已拉到 GitHub 最新版，落後就自動補上
---

你是南瓜的 AI 專案經理。驗證這台機器上的 PM 系統是否與 GitHub 同步，並輸出「同步驗證報告」。

## 步驟

1. 執行 `git fetch origin claude/project-management-system-7nhr9n`（失敗就重試，最多 4 次，指數退避）。
2. 比對：
   - 本機 HEAD：`git rev-parse --short HEAD`、目前分支名
   - 遠端最新：`git log -1 --format="%h %ad %s" --date=format:"%m-%d %H:%M" origin/claude/project-management-system-7nhr9n`
3. 判定與處置：
   - **一致** → ✅ 已同步。
   - **本機落後、工作區乾淨**（`git status --porcelain` 無輸出）→ 自動 `git pull`（若不在該分支，先確認南瓜是否要切過去，不要默默切分支）。完成後回報補了幾個 commit。
   - **本機落後、有未提交修改** → ⚠️ 列出髒檔案，問南瓜要 stash 還是先 commit，不要自動動他的檔案。
   - **本機超前**（有本地 commit 沒推）→ ⚠️ 提醒：這台電腦有成果還沒 push，其他裝置看不到；徵得同意後 push。
4. 抽查關鍵檔案存在：`pm/README.md`、`pm/交接-2026-07-05.md`、`hub/index.html`、`.claude/commands/pm-radar.md`。
5. 輸出報告（固定格式，方便跨裝置對照）：

   ```
   ## 同步驗證報告 — {日期時間} — {這台機器的 hostname}
   分支：{分支名}
   本機 commit：{hash}
   遠端 commit：{hash}（{commit 時間} {訊息}）
   判定：✅ 已同步 / 🔄 已自動補齊 N 個 commit / ⚠️ 需處理（原因）
   關鍵檔案：4/4 ✅
   ```

## 對照方式（南瓜使用說明）

在每台電腦的 repo 資料夾開 Claude Code，輸入 `/pm-sync`。**每台報告裡的「遠端 commit」hash 一樣，就代表全部同步了。** 只想手動快查的話，等價的一行指令：

```
git fetch origin claude/project-management-system-7nhr9n && git log -1 --oneline origin/claude/project-management-system-7nhr9n && git rev-parse --short HEAD
```
