# 南瓜任務控制台（Pumpkin PM）

> 解決的問題：**「我要很清楚知道我們有多少問題要解決、派給誰處理、怎麼處理、怎麼知道有這些問題。每次會議都可以很快速知道問題有哪些，然後記得派遣。」**

這不是另一套專案管理工具。這是一組讓 **Claude 當你的 AI 專案經理** 的操作手冊：Claude 直接連你們真實的 Jira 和 Google Drive，把「同步資訊、找出問題、追蹤卡點、準備派工建議」這些每天消耗你的工作自動化，你只做最後的**決策**。

---

## 系統架構（三層，各司其職）

| 層 | 工具 | 角色 |
| --- | --- | --- |
| **任務層** | Jira（pvrar.atlassian.net） | 唯一的任務事實來源。所有「要做的事」最後都必須變成一張 Jira 單，沒有例外。 |
| **文件層** | Google Drive / Google Docs | 企劃、規格、計畫書。Jira 單內文只放連結，不複製內容。 |
| **個人層** | Obsidian | 你的會議記錄和第二大腦。會議中只管「記」，會後由 Claude 把派工項變成 Jira 單。 |

**Claude = 三層之間的膠水。** 你不再自己當公司的 CPU。

---

## 四個指令（在這個 repo 開 Claude Code session 就能用）

| 指令 | 什麼時候用 | 產出 |
| --- | --- | --- |
| `/pm-radar` | 每天早上，或任何想掌握全局的時刻 | 問題雷達：過期、卡住、待驗收、未派工、負載，一頁看完 → 存到 `pm/reports/` |
| `/pm-brief` | **開會前 5 分鐘** | 會前簡報：這場會要決策的事、要驗收的事、誰快沒工作，帶著進會議室 |
| `/pm-dispatch` | **開會後** | 讀你的 Obsidian 會議記錄，把 `#派工` 項目自動建成 Jira 單（建單前會先列表跟你確認） |
| `/pm-capacity` | 每週一次（建議週四） | 未來兩週人力地圖：誰即將空出來、誰超載，提前三天派工而不是當天救火 |

---

## 標準節奏（建議）

```
每天早上   /pm-radar     → 3 分鐘看完全公司狀態，浮出今天要處理的 3 件事
會議前     /pm-brief     → 帶著問題清單進會議，不再花半場會議同步資訊
會議中     Obsidian 記錄  → 用範本（pm/obsidian/會議記錄範本.md），派工項寫成 #派工 行
會議後     /pm-dispatch  → Claude 把派工項建成 Jira 單，你確認一下就好
每週四     /pm-capacity  → 看未來兩週誰會空窗，提前準備下一份工作的需求和文件
```

---

## Jira 連線資訊（Claude 執行指令時使用）

- **站台**：`https://pvrar.atlassian.net`
- **cloudId**：`418b3b93-1cfe-4560-96cc-ad4ce60b04f8`
- 使用 Atlassian MCP 工具（`mcp__Atlassian_Rovo__*`）操作。

### 狀態語意（依 2026-07 實際盤點定義）

| Jira 狀態 | 意義 | 誰要動作 |
| --- | --- | --- |
| `開放` / `待辦事項` | 已建單但還沒開工（多半是「還沒真正派下去」） | 南瓜：確認派工與優先序 |
| `進行中` | 進行中；**超過 7 天沒更新 = 視為疑似卡住** | 負責人回報，PM 追問 |
| `pending` | 卡住，等某個東西（等美術／等程式／等客戶）。**進 pending 必須留言寫「在等什麼」** | 看留言，解卡 |
| `Waiting for QA` | 做完了，等驗收 | 南瓜／QA：**這是你的待辦** |
| `PR 併入支線` | 程式完成，等合併驗證 | 程式端合併＋驗證 |

### 常用 JQL

```
全公司未完成（近 45 天有動的）:  resolution = Unresolved AND updated >= -45d
卡住中:                        resolution = Unresolved AND status = pending
疑似卡住:                      resolution = Unresolved AND status = 進行中 AND updated <= -7d
等我驗收:                      resolution = Unresolved AND status = "Waiting for QA"
還沒派下去:                    resolution = Unresolved AND status in (開放, 待辦事項)
某人手上的活:                  resolution = Unresolved AND assignee = "顯示名稱"
```

## 團隊名冊（由工單內容推測，請南瓜修正）

| 成員 | 推測職能 | 備註 |
| --- | --- | --- |
| Idleman | 程式（消防主程式） | 目前負載最重 |
| 余峻毅 | 程式（第一課程流程） | |
| 薛欣華 | 程式（第四課程） | |
| 李孟庭 | 程式（第二課程） | |
| 程姿瑀 | UI／2D 美術 | 跨消防、宜蘭、AI Companion |
| 陳宇新 | 3D 美術（模型） | |
| 永晴 陳 | 特效／動畫 | |
| jeanjay | 場景美術 | 跨消防、TIFA |
| JingTony Chen | 音效（＋宜蘭玩法程式） | |
| chen yvette | 2D 繪製 | |
| Nanhung | 南瓜本人（企劃／美術總監／PM） | 掛在你名下的單多半是「待你決策或撰寫需求」 |

---

## 鐵律（讓系統不退化的三條規則）

1. **問題只能活在三個地方**：Jira 單、Obsidian 會議記錄的 `#派工` 行、Google Docs 的規格文件。LINE／Telegram／口頭講的事情，24 小時內必須落進其中一個，否則視為不存在。
2. **pending 必留言**。沒寫「在等什麼」的 pending 單，雷達會點名。
3. **報告是產出，不是維護對象**。`pm/reports/` 裡的報告每次由 Claude 重新生成，永遠不用手動更新——這就是 Google Sheet 總表跟 Jira 永遠不同步的問題的解法：不再手動維護第二份總表。

## Obsidian 整合

`pm/` 全部是純 Markdown：
- 最簡單：把這個 repo 資料夾直接加入 Obsidian vault（Obsidian vault 就是資料夾）。
- 或者：把 `pm/reports/` 的報告內容貼進 vault。
- 會議記錄範本在 `pm/obsidian/會議記錄範本.md`，複製到你的 vault 的 Templates 資料夾即可。
