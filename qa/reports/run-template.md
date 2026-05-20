# QA Playtest Run — &lt;FILL: build / checkpoint / date&gt;

> 模板版本：v1.0（2026-05-19）
> 用法：複製此檔為 `qa/reports/run-<目的>-YYYYMMDD.md`，把 `&lt;FILL: ...&gt;` 全部填掉。
> 一條 run = 一份檔。Checkpoint 玩測產出 `run-B-20260519.md` 這類具體檔名。

---

## 0. Header

| 欄位 | 值 |
|---|---|
| Run ID | &lt;FILL: 例 `run-B-20260519-01`&gt; |
| Date / Time | &lt;FILL: YYYY-MM-DD HH:MM 本機時間&gt; |
| Tester | &lt;FILL: Terry / 其他名字&gt; |
| Build / Commit | &lt;FILL: `git rev-parse --short HEAD` 結果&gt; |
| Checkpoint | &lt;FILL: A / B / C / 自由&gt; |
| Mode / URL flags | &lt;FILL: 例 `?qaBombers=1` / normal / 其他&gt; |
| Device | &lt;FILL: OS、瀏覽器、GPU 大概&gt; |
| Run duration (秒) | &lt;FILL: 從 spawn 到 GG 的實際存活秒數&gt; |
| End state | &lt;FILL: died / quit / cleared 目標&gt; |

---

## 1. Build 是否會起來

| 項目 | 結果 | 備註 |
|---|---|---|
| `npm run build` | pass / fail | &lt;FILL: 任何 warning 摘要&gt; |
| `npm run validate:weapons` | pass / fail / N/A | &lt;FILL&gt; |
| Browser 進場 | canvas=1 / 0 | &lt;FILL: console error 數&gt; |
| 第一發子彈 | 看到 / 沒看到 | &lt;FILL&gt; |

如果本欄任何一格 fail → 後面不用填，先回工程修。

---

## 2. 升級卡（Upgrade Cards）

照 wave 順序填，看不清楚就填「忘了」。

| Wave / 時間 | 出的 3 張選項 | 我選 | 理由 / 即時感 |
|---|---|---|---|
| W1 / 0:30 | &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; |
| W2 / 1:00 | &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; |
| W3 / 1:30 | &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; |
| W4 / 2:00 | &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; |
| W5 / 2:30 | &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; |

額外追加列即可。

---

## 3. 武器體感

| 武器 ID | 取得時間 | 爽度 1–5 | 一句話原因 |
|---|---|---|---|
| &lt;FILL: 例 `wpn_shock_baton`&gt; | &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; |
| &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; | &lt;FILL&gt; |

**最爽**：&lt;FILL: 武器 ID + 一句話&gt;
**最雞肋**：&lt;FILL: 武器 ID + 一句話&gt;

---

## 4. 卡頓 / 性能感

| 時間點 | 狀況 | 我猜原因 |
|---|---|---|
| &lt;FILL: 例 1:45&gt; | &lt;FILL: 大爆炸時掉 frame&gt; | &lt;FILL: bomber 群＋鏈電 spark&gt; |

**FPS 主觀印象**：流暢 / 偶頓 / 常頓 / 慘 — &lt;FILL: 哪個階段最差&gt;
**有沒有看到掉幀紅旗**（自己感覺）：&lt;FILL&gt;

---

## 5. 看不懂 / 認知卡點

| 時間點 | 看不懂什麼 | 期待怎樣 |
|---|---|---|
| &lt;FILL: 例 1:20&gt; | &lt;FILL: 紫色光球是引信還是子彈？&gt; | &lt;FILL: 引信改紅閃 + 1.5s 警示&gt; |

---

## 6. 兩句話總結

- **這一輪最爽的瞬間**：&lt;FILL&gt;
- **這一輪最該修的一個東西**：&lt;FILL&gt;

---

## 7. Action items（給工程 / 美術）

| ID | 任務 | Owner | 優先 |
|---|---|---|---|
| AR-1 | &lt;FILL&gt; | &lt;FILL: VFX / GAME / ART / QA&gt; | P0/P1/P2 |

> 模板使用備註：填完後在 `studio/AGENT-RUNS.md` 寫一筆「Terry: ran &lt;run id&gt;」並指向本檔。Checkpoint B 跑完要回 Terry 決定是否進 Checkpoint C（平衡 QA pass）。
