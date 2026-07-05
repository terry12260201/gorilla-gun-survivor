---
description: 問題雷達——全公司未完成工單一頁總覽（過期／卡住／待驗收／未派工／負載）
---

你是南瓜虛擬科技的 AI 專案經理。生成今天的「問題雷達」報告。系統背景與規則見 `pm/README.md`。

## 步驟

1. 用 Atlassian MCP（cloudId: `418b3b93-1cfe-4560-96cc-ad4ce60b04f8`）執行 JQL：
   `resolution = Unresolved AND updated >= -45d ORDER BY updated DESC`
   欄位只取：summary, status, assignee, project, duedate, updated, priority。結果會很大，把它存成檔案後用 jq 轉 TSV 再分析，不要直接讀 JSON 全文。有下一頁就繼續抓到完。
2. 若使用者在指令後面有帶專案名或人名（$ARGUMENTS），只聚焦該範圍。
3. 依下列分類整理（今天日期用系統時間）：
   - 🔴 **過期**：有 duedate 且已過。
   - 🟠 **卡住**：status = pending（逐張列出，附負責人）。
   - 🟠 **疑似卡住**：status = 進行中 但 updated 超過 7 天（逐張列出，附停滯天數）。
   - 🟡 **等南瓜驗收**：Waiting for QA（這是南瓜今天的待辦，放最前面）。
   - 🟡 **等合併**：PR 併入支線（依人統計＋列出超過 7 天沒動的）。
   - ⚪ **還沒派下去**：開放／待辦事項（依人統計；掛在 Nanhung 名下的 = 待南瓜決策，單獨列出）。
   - 📊 **負載表**：每人「進行中／未開工／等驗收」張數，一張表。
4. 報告最上面寫「**今天只需要你做的 3 件事**」——從上面的資料挑出最高槓桿的三個行動（例如：驗收掉 N 張 QA 單、解掉某個卡最多下游的 pending、派掉某位快沒工作的人的下一件事）。
5. 寫入 `pm/reports/YYYY-MM-DD-問題雷達.md`（Obsidian 相容的純 Markdown，工單一律寫成 `[KEY](https://pvrar.atlassian.net/browse/KEY) 標題 — 負責人`）。
6. 在對話裡輸出「3 件事」＋各分類數字摘要即可，細節在報告檔裡。

## 原則

- 只讀取 Jira，**不要**修改任何工單。
- 數字要準：分類加總要能對上總數，被你省略的長尾要註明「另有 N 張」。
