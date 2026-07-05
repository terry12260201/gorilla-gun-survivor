# 南瓜中控（個人版）

一個可以不斷延伸的「痛點工具站」。`index.html` 用瀏覽器直接開就能用，不需要伺服器。

## 擴充迴圈（這個站怎麼長大）

```
遇到痛點 → 跟 Claude 說「幫我做一個 XX 工具」
        → 小工具：做成 Claude 指令（.claude/commands/xx.md）→ 卡片標指令名
        → 網頁工具：做成 hub/apps/xx.html → 卡片連過去
        → 外部服務：直接放連結卡片
        → 在 index.html 的 TOOLS 陣列加一筆 → 完成
```

三種工具型態：

| 型態 | 適合 | 成本 |
| --- | --- | --- |
| `claude` 指令 | 需要讀寫 Jira／Drive／判斷的智能工作（雷達、派工） | 最低，一個 md 檔 |
| 網頁小工具 | 要給團隊用、不需要 AI 的（報價計算機、儀表板） | 一個 html 檔 |
| 外部連結 | 現成服務（Jira、Sheet、Meta 廣告） | 一筆設定 |

## 之後想上線（像 pumpkin-control-center.vercel.app 那樣）

這個資料夾是純靜態網頁，丟到 Vercel／GitHub Pages 就是一個網址；要加登入、團隊權限時再升級成 Next.js 專案即可，卡片資料（TOOLS 陣列）原封不動搬過去。
