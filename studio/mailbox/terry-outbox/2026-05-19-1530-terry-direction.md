# Terry Decision - 2026-05-19-1530-terry-direction

From: Terry (人類老闆)
Via: Claude (Cowork mode, Terry 代理身份)
Time: 2026-05-19 15:30
Priority: P1
Scope: 下一輪 sprint 優先順序、Dashboard 修正、Mailbox 啟用

---

## Decision

### ✅ 同意 — 繼續維持的方向
1. **Plasma Bomber v1+v2 雙模整合** 與 `?qaBombers=1` URL QA mode 設計通過。未來新內容（武器 / 怪物 / 地圖）都照「URL flag 開 QA、normal gameplay 不變」這套規矩走。
2. **GLB loader 拿掉 `.png` auto-probe + DOM marker (`document.documentElement.dataset.plasmaAssets`)** 通過。後續所有自訂 GLB 都要照樣寫入 DOM marker，給 QA 一條機器可讀證據。
3. **AGENT-RUNS.md 紀律** 維持不變 — 每一個 subagent 跑完都要寫一筆，格式照現行模板。

### 🔁 重新排序 — 下一段 sprint 任務優先順序
**舊順序（Codex 原排）**：QA-03 → ART-01 → GAME-02 → VFX-01 → ENEMY-01
**新順序（Terry 拍板）**：

```
1. VFX-01     電弧短杖彈道 / 命中 / 發光特效
2. QA-03      Plasma Bomber 可讀性視測（引信、剪影、俯視比例）
3. ENEMY-01   第一隻「新行為」怪物（不是 bomber 換皮）
4. ART-01     GPT Image 2 → Blender v3 電弧短杖（等 OPENAI_API_KEY 環境理順再啟動）
5. GAME-02    接 shock_baton v3 GLB、更新 weapons.json、rebuild
```

### ❌ 不同意 / 必須在下一輪修
1. **Dashboard「AI 夥伴狀態」panel 不能顯示「目前沒有可顯示資料」** — 下一次 `npm run dashboard:update` 之前，把這格接上 `AGENT-RUNS.md` 最新 N 筆（建議 5 筆）。Terry 每天看的儀表板不能有空格。
2. **Vite chunk size warning 必須有人接** — 不用立刻做完整 lazy loading / manualChunks，但本週要產出 `performance/budgets/bundle-size-2026-05-19.md` 量出基準（總 size、main chunk、three.js chunk、largest module top 5）。否則 P5 永遠停在 Planned。
3. **Sprint table 狀態不要拖** — GAME-01（電弧短杖）已可遊玩、已通過 build，立刻標為 Done。VFX-01 開為新的 In Progress。

### 🆕 新增任務
1. **建立 `qa/reports/run-template.md`** — Terry 馬上要實測 Checkpoint B，需要固定表格紀錄：撐多久 / 選了哪些卡 / 最爽武器 / 哪裡頓 / 哪裡看不懂 / FPS 主觀印象。沒有模板 Terry 不寫。Codex 先生模板。
2. **啟用 `studio/mailbox/terry-outbox/`** — 本決策即為第一份正式 outbox。未來所有 Terry 對 Codex 的方向決策都進這裡，斷線可恢復。

---

## Reasoning

### 為什麼 VFX 比新模型優先
電弧短杖目前狀態：玩家「能選、能射」，但**沒有電弧感**。Roguelike survivor 的爽度核心是**回饋密度**（殺→撿→升→抽→撐的每一步都要有視聽刺激），不是 asset 精緻度。
- 命中有 spark、鏈電有 arc、撿到時有 pulse → 玩家立刻 Wow
- 把 blockout 模型換成 GPT Image 2 概念 → 玩家不會說「啊這把武器變漂亮了」，因為他根本沒空看
- VFX 是直接提升「prototype 完成度」的槓桿，模型升級是後期「產品完成度」的槓桿

當前完成度自評 35–40%（prototype），這個階段優先衝 prototype 槓桿。

### 為什麼 ENEMY-01 拉前面
Launch brief 要求 10 種怪物 → 15 種，重點是**新行為**：盾兵、分裂、狙擊、召喚、護衛、跳躍突進。
Plasma Bomber v2 嚴格說是 bomber 的數值強化變體（unlock 90s、用同樣 fuse/explosion 行為），這算「內容擴張」但不算「新行為」。
ENEMY-01 必須是**沒看過的 AI 模式**，不能讓 sprint 計數作弊。

### 為什麼 ART-01 不能繼續卡前面
- `OPENAI_API_KEY` 不在 Codex shell 環境（worklog 已紀錄 2 次嘗試）
- 強迫排前面 = 整個 pipeline 卡住
- 把它推後，等環境理順（Terry 那邊處理），不要當路障

---

## Action For Agent (Codex)

依序執行，每完成一項立刻在 `AGENT-RUNS.md` 寫一筆，並更新 `SPRINT-2026-05-18.md` 狀態欄。

| 順序 | 任務 ID | 內容 | 完成判定 |
| --- | --- | --- | --- |
| 1 | VFX-01 | 電弧短杖：彈道顏色 / 命中 spark / 發光 pulse / 鏈電（若範圍命中多目標）。粒子總預算 ≤ 200。 | Terry 玩 Checkpoint B 時能直觀看出「這把是電」。 |
| 2 | QA-03 | Plasma Bomber v1 vs v2 視測：剪影差異、引信警告辨識、俯視角比例。產出 `qa/reports/run-bomber-readability-20260519.md`。 | 結論列出「需修 / 不修」與理由，CAO Raven 簽字（文件中註明）。 |
| 3 | ENEMY-01 | 新行為怪物（建議：盾兵 / 分裂兵 / 狙擊召喚），先 placeholder 形狀（box / cone / capsule），數值與 AI 進 `src/enemy/EnemyTypes.ts`，unlock 時間建議 60s。 | Terry 在 `?qaEnemy01=1` URL 模式立刻看到並能擊殺。 |
| 4 | ART-01 | 等 Terry 確認 `OPENAI_API_KEY` 注入 Codex shell 後，跑 `npm run art:concept -- studio/art-pipeline/briefs/shock-baton-v2.json`。 | `art/concepts/shock-baton-v2.concept.png` 產出，CAO Raven 簽字。 |
| 5 | GAME-02 | Blender 依概念圖出 `shock_baton_v3.glb`，更新 `src/data/weapons.json` 中 `wpn_shock_baton.url`，build + runtime check。 | `npm run validate:weapons` 過、`npm run build` 過、runtime canvas=1、console error=0。 |

並行小事（不阻塞主線）：
- Dashboard：AI 夥伴狀態 panel 接 AGENT-RUNS.md（修 `tools/update-terry-dashboard.mjs`）
- Performance：產 `performance/budgets/bundle-size-2026-05-19.md`
- QA：產 `qa/reports/run-template.md`
- Sprint：GAME-01 改 Done、VFX-01 開為 In Progress

---

## Needs Terry

下列事項才需要再回來問 Terry：

1. **VFX-01 完成後** — Terry 要實測 Checkpoint B，產出 `qa/reports/run-B-20260519.md`，回報是否進 Checkpoint C（平衡 QA pass）。
2. **ENEMY-01 行為選擇** — 如果 Codex 想做的不是「盾兵 / 分裂 / 狙擊召喚」三選一，要先寫 inbox 提案。
3. **OPENAI_API_KEY 環境** — Terry 處理中，搞定後通知 Codex。
4. **任何違反 launch brief 紅線的提案**（地圖無限大 / 變探險 / 改核心循環 / 加付費依賴）：直接擋下，寫 inbox，不要先做。

---

## Safety Notes

- **不准 force-push、不准動 main、不准刪 `.ops/logs` 或 `studio/` 既有檔案。** 修檔走 Edit、新檔走 Write，不覆蓋。
- **OPENAI_API_KEY 永不寫進 repo、Dashboard、`.ops/logs`、Obsidian。** 只能透過環境變數讀。
- **VFX 粒子總預算 ≤ 200**（Volt TA 的硬指標）。超過要先 ping Volt。
- **新怪物 unlock 時間** 不能早於 60s，否則玩家還沒升等就被壓死，違反 launch brief 的難度曲線。
- **Sprint table 狀態** 改完要 commit 到 git（即使是 dirty working tree，也要存檔避免 Codex 重啟後失憶）。

---

## Stop Rule

完成 VFX-01 + QA-03 後**立刻停下**，回報 Terry，由 Terry 決定是否進 ENEMY-01 還是先做一輪 Checkpoint B 整體玩測。不要連跑 3 個 task 才停。

---

Signed: Terry
Acting Agent: Claude (Cowork mode)
Filed: `studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md`
