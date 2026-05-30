# QA Readability Run — Plasma Bomber v1 vs v2 (Checkpoint B)

> 報告版本：v0.1 骨架（2026-05-20，Claude loop tick #35 起草）
> 來源任務：QA-03（`studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md` 第 70 行）
> 範圍：Plasma Bomber **v1 vs v2** 三軸視測 — 剪影差異、引信警告辨識、俯視角比例。
> 狀態：**待玩測** — 所有 `<FILL: ...>` 由 Terry 跑一次 `?qaBombers=1` 玩測後填入；填完交 CAO Raven 簽字。
> 一條 run = 一份檔。本檔對應 Checkpoint B 的 bomber 可讀性專測（非完整 build 玩測）。

---

## 0. Header

| 欄位 | 值 |
|---|---|
| Run ID | <FILL: 例 `run-bomber-readability-20260519-01`> |
| Date / Time | <FILL: YYYY-MM-DD HH:MM 本機時間> |
| Tester | <FILL: Terry / 其他名字> |
| Build / Commit | <FILL: `git rev-parse --short HEAD` 結果> |
| Mode / URL flags | `?qaBombers=1`（必開；強制 v1 + v2 同時出場供對照） |
| Device | <FILL: OS、瀏覽器、GPU 大概> |
| Camera | 俯視角（top-down，預設遊戲視角） |
| Observation duration (秒) | <FILL: 實際盯著 bomber 觀測的秒數> |

---

## 1. Build / 進場 sanity（fail 就停）

| 項目 | 結果 | 備註 |
|---|---|---|
| `npm run build` | pass / fail | <FILL: 任何 warning 摘要> |
| `npm run validate:weapons` | pass / fail / N/A | <FILL> |
| Browser 進場 canvas | 1 / 0 | <FILL: console error 數> |
| `?qaBombers=1` 是否生效 | v1+v2 都看到 / 否 | <FILL: 兩種 bomber 是否各至少出現一隻> |
| DOM marker `dataset.plasmaAssets` | 有 / 無 | <FILL: 確認自訂 GLB marker 寫入> |

> 本欄任何一格 fail → 後面不用填，先回工程修。

---

## 2. 軸 A — 剪影差異（Silhouette）

目標：玩家在**不看血條、不看顏色**的情況下，能從輪廓一眼分出 v1 與 v2。

| 觀測項 | v1 | v2 | 備註 |
|---|---|---|---|
| 整體輪廓描述 | <FILL> | <FILL> | <FILL> |
| 體型大小（相對玩家） | <FILL> | <FILL> | <FILL> |
| 最明顯的形狀特徵 | <FILL> | <FILL> | <FILL> |
| 灰階測試：去色後仍可分辨？ | — | — | <FILL: 可 / 勉強 / 不可> |

**剪影辨識度評分（1–5，5=一眼可分）**：<FILL>
**一句話**：<FILL: 兩者剪影差異夠不夠>

---

## 3. 軸 B — 引信警告辨識（Fuse Warning）

目標：bomber 進入引爆倒數時，玩家能在**爆炸前**清楚意識到「要炸了，該閃」。

| 觀測項 | v1 | v2 | 備註 |
|---|---|---|---|
| 引信視覺提示是什麼 | <FILL: 例 紫光球閃爍> | <FILL> | <FILL> |
| 提示出現到爆炸的提前量（秒） | <FILL> | <FILL> | 目標 ≥ 1.5s 警示窗 |
| 提示在混戰中是否被淹沒 | <FILL> | <FILL> | <FILL: 多敵同框時可見度> |
| 是否誤認引信為子彈/掉落物 | <FILL> | <FILL> | <FILL> |
| 有無音效輔助（如有） | <FILL> | <FILL> | <FILL> |

**引信警告辨識度評分（1–5，5=必反應得過來）**：<FILL>
**一句話**：<FILL: 警告窗夠不夠、有沒有想閃但來不及的瞬間>

---

## 4. 軸 C — 俯視角比例（Top-down Proportion）

目標：在俯視角下，bomber 的比例 / 高度 / 投影不會被誤判（太扁看不出、太高遮視線、影子誤導落點）。

| 觀測項 | v1 | v2 | 備註 |
|---|---|---|---|
| 俯視下可辨識度 | <FILL> | <FILL> | <FILL> |
| 與其他怪（grunt/heavy 等）比例是否協調 | <FILL> | <FILL> | <FILL> |
| 高度是否遮擋玩家/子彈視線 | <FILL> | <FILL> | <FILL> |
| 爆炸範圍是否與模型視覺一致 | <FILL> | <FILL> | <FILL: 視覺半徑 vs 實際傷害半徑> |

**俯視比例評分（1–5，5=完全不違和）**：<FILL>
**一句話**：<FILL>

---

## 5. 結論：需修 / 不修

> 每一條觀測收斂成一個明確判斷。「需修」必須給理由 + 建議方向；「不修」也要寫為什麼可接受。

| # | 軸 | 觀測到的問題 | 判斷 | 理由 / 建議 | 建議 Owner | 優先 |
|---|---|---|---|---|---|---|
| BR-1 | A 剪影 | <FILL> | 需修 / 不修 | <FILL> | <FILL: ART / VFX / GAME> | P0/P1/P2 |
| BR-2 | B 引信 | <FILL> | 需修 / 不修 | <FILL> | <FILL> | <FILL> |
| BR-3 | C 比例 | <FILL> | 需修 / 不修 | <FILL> | <FILL> | <FILL> |

**整體結論（兩句話）**：
- v1 vs v2 可讀性目前狀態：<FILL>
- Checkpoint B 可否放行 / 要先修哪一條：<FILL>

---

## 6. CAO Raven 簽字

> QA-03 驗收條件：結論列出「需修 / 不修」與理由後，由 CAO Raven 在此簽字確認。
> 未簽字前本報告視為 draft，QA-03 不算 Done。

| 欄位 | 值 |
|---|---|
| 審閱人 | CAO Raven (T-A0) |
| 審閱日期 | <FILL> |
| 對第 5 節結論是否同意 | 同意 / 有異議（見備註） |
| 補充意見 | <FILL> |
| 簽字 | <FILL: Raven 名字 / 縮寫> |

---

## 7. 備註

- 本檔由 Claude loop tick #35（2026-05-20）依 `qa/reports/run-template.md` v1.0 結構起草，聚焦三軸可讀性，移除了完整玩測模板中與本測無關的升級卡 / 武器體感欄位。
- 填完後在 `studio/AGENT-RUNS.md` 寫一筆「Terry: ran run-bomber-readability-20260519」並指向本檔。
- v2 為 v1 的數值強化變體（unlock 90s，同 fuse/explosion 行為），故本測重點在「玩家能否區分兩者 + 引信是否讀得出」，非行為差異。
