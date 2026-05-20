# System: Spawn Pool（敵人 spawn 權重與 unlock 控管）

> Status: **PROPOSAL** — initial documentation of existing `pickSpawnType()` logic.
> 等 Systems Designer (T-D1) + Balance Architect (T-D2) + Combat Designer (T-D3) 三方簽字後改 ACTIVE。

## Purpose

把 `src/enemy/EnemyTypes.ts` 內現有的 `pickSpawnType(elapsed)` 邏輯文件化，讓設計師調 PvE pacing 時不用看 code：

1. 11 種敵人在各時間階段的 **spawn 權重表**
2. **Unlock 時間軸**（每隻怪可在第幾秒登場）
3. 與 `Difficulty.ts` 配套的 **PvE pacing curve**（spawn interval、HP/Damage/Speed scaling、max enemies）
4. **QA mode**（`?qaBombers=1`）的特例路徑
5. 與 `level-progression.md` 的交集（XP tier、miniboss 觸發點、卡池 unlock）

本 spec 是 documentation-only：不改 code、不改 weights，只把現狀寫下來，讓往後調整有 baseline 可對。任何**修改**權重 / unlock / curve 必須開 OpenSpec proposal。

---

## Source of Truth

- Code：`src/enemy/EnemyTypes.ts`（ENEMY_TYPES record + `pickSpawnType()` + QA mode）
- Code：`src/enemy/Difficulty.ts`（spawnIntervalSec / maxEnemiesAt / enemyHpMul / enemyDamageMul / enemySpeedMul / enemyXpTierBonus）
- Code：`src/enemy/EnemyManager.ts`（INITIAL_SPAWN_DELAY = 3.0s、SPAWN_DISTANCE = 24）
- 上層 spec：`systems/combat-loop.md`（殺→撿→升→抽→撐）+ `systems/level-progression.md`（XP / difficulty）+ `enemies/*.md`（每隻怪個別檔）

---

## Requirements

### Requirement: Spawn 算法為「unlock 過濾 + 權重抽樣」

`pickSpawnType(elapsed)` SHALL 用以下兩步：

1. **Unlock 過濾**：從 `ENEMY_TYPES` 取出所有 `elapsed >= type.unlockAt` 的敵人，組成 `available` 陣列
2. **權重抽樣**：用每隻怪的 `weight` 欄位做加權隨機抽樣（accumulator 法），落點 ≤ 0 即返回

如果遍歷完還沒命中（浮點誤差 / 空陣列保險），SHALL 回傳 `available[available.length - 1]`。

#### Scenario: elapsed = 0s 開局

- WHEN `pickSpawnType(0)`
- THEN 唯一 available 是 `grunt`（其他全 `unlockAt > 0`）
- AND 100% spawn grunt

#### Scenario: elapsed = 200s 後期

- WHEN `pickSpawnType(200)`
- THEN available 為 11 隻全開
- AND 權重總和 = 1.0 + 0.8 + 0.6 + 0.7 + 0.5 + 0.4 + 0.4 + 0.3 + 0.3 + 0.25 + 0.08 = **5.33**
- AND grunt spawn 機率 ≈ 18.8%、miniboss ≈ 1.5%

### Requirement: 11 隻敵人權重表（Source = EnemyTypes.ts 2026-05-19 snapshot）

| Enemy            | unlockAt | weight | xpTier | xpCount | heart% | chest% | url / placeholder       | 備註                |
|------------------|---------:|-------:|-------:|--------:|-------:|-------:|-------------------------|---------------------|
| grunt            |     0s   | 1.00   | 1      | 1       | 3.0%   | 0.5%   | enemy_b_03.glb          | 開場主力             |
| fast             |    15s   | 0.80   | 1      | 1       | 3.0%   | 0.5%   | enemy_c_01.glb          | 快但低血             |
| rusher           |    25s   | 0.60   | 1      | 1       | 3.0%   | 0.5%   | cone placeholder        | detectRange 12 衝刺  |
| scout            |    30s   | 0.70   | 1      | 1       | 3.0%   | 0.5%   | enemy_c_02.glb          | 中型遊擊             |
| ranged           |    35s   | 0.50   | 1      | 1       | 4.0%   | 0.5%   | enemy_e_02.glb          | cooldown 2.5s        |
| bomber           |    45s   | 0.40   | 2      | 1       | 4.0%   | 0.5%   | plasma_bomber_v1.glb    | fuseTime 1.2 / AOE 3.5 / 25 dmg |
| heavy            |    50s   | 0.40   | 1      | 2       | 5.0%   | 2.0%   | enemy_c_03.glb          | 130 HP / 1.5 speed   |
| caster           |    55s   | 0.30   | 2      | 1       | 4.0%   | 0.5%   | enemy_e_03.glb          | cooldown 3.2 / 14 dmg|
| brute            |    80s   | 0.30   | 2      | 2       | 5.0%   | 3.0%   | enemy_f_01.glb          | 200 HP / 12 dmg      |
| plasma_bomber_v2 |    90s   | 0.25   | 2      | 2       | 5.0%   | 1.0%   | plasma_bomber_v2.glb    | QA 視測對照組（v1 vs v2）|
| miniboss         |   120s   | 0.08   | 3      | 3       | 50.0%  | 25.0%  | enemy_f_02.glb (boss)   | 900 HP / 28 dmg / 觸發 onBossSpawn |

**權重和（隨 unlock 階段遞增）**：

| 時間區段        | available 隻數 | 權重總和 |
|----------------|---------------:|---------:|
| 0–14s          | 1 (grunt)      | 1.00     |
| 15–24s         | 2              | 1.80     |
| 25–29s         | 3              | 2.40     |
| 30–34s         | 4              | 3.10     |
| 35–44s         | 5              | 3.60     |
| 45–49s         | 6              | 4.00     |
| 50–54s         | 7              | 4.40     |
| 55–79s         | 8              | 4.70     |
| 80–89s         | 9              | 5.00     |
| 90–119s        | 10             | 5.25     |
| 120s+          | 11             | 5.33     |

### Requirement: Unlock 時間軸 SHALL 對應「PvE pacing 三幕」

11 個 `unlockAt` 不是隨機數字，符合三幕設計（與 `level-progression.md` 的難度區段一致）：

#### Act I — Tutorial / Pure Survival（0–34s）

- 0s grunt → 15s fast → 25s rusher → 30s scout
- 玩家**只**面對近戰直線怪（grunt / fast / scout / rusher），讓玩家熟悉移動 + 副武器自動射擊
- 還沒 ranged → 玩家不用學「躲彈幕」
- 還沒 bomber → 玩家不用學「踢開區域怪」
- **設計意圖**：建立 baseline 安全感、學射擊角度

#### Act II — Skill Test / Ranged + AOE 加入（35–89s）

- 35s ranged（彈幕） → 45s bomber（區域威脅）→ 50s heavy（HP 牆）→ 55s caster（高傷彈幕）→ 80s brute（雙重 HP 牆）
- 玩家**被迫**學「打側面」「踢開 bomber」「先解 ranged」三件事
- HP/Damage scale 已 ramp 起來（45s 時 hp×1.3, dmg×1.10）→ 不能再 face tank
- **設計意圖**：升級卡選擇權重提高（移速 / DPS / 護甲），玩家分流

#### Act III — Boss Rush / Survival Mode（90s+）

- 90s plasma_bomber_v2（QA 視測對照）→ 120s miniboss（boss 觸發 onBossSpawn）
- spawnInterval 已 floor 在 ~0.65s（30s × 6 iter），maxEnemies 已 = 65
- 玩家**必須**已有穩定 DPS build 才能撐
- **設計意圖**：分流玩家 build 強度（強 build → 撐到 180s+；弱 build → 90–120s 死）

### Requirement: Difficulty 曲線（與 spawn pool 配套，source = Difficulty.ts）

每幀 spawn / enemy stat scaling 由 `Difficulty.ts` 5 個 function 決定：

| Function              | 公式                                       | 上限 / 下限          |
|-----------------------|--------------------------------------------|----------------------|
| `enemyHpMul(t)`       | `1.18^(t/30)`                              | **無上限**           |
| `enemyDamageMul(t)`   | `1.10^(t/45)`                              | **無上限**           |
| `enemySpeedMul(t)`    | `1 + (t/180) * 0.5`                        | cap **1.5×** (180s+) |
| `spawnIntervalSec(t)` | `1.8 * 0.9^(t/30)`                         | floor **0.4s**       |
| `maxEnemiesAt(t)`     | `35 + floor(t/60) * 5`                     | cap **80**           |
| `enemyXpTierBonus(t)` | `floor(t/60)`                              | cap **+2** (120s+)   |

**關鍵時間點對照**（spawn interval × HP mul × max enemies × xp tier bonus）：

| 時間 | spawnIntervalSec | enemyHpMul | enemyDamageMul | enemySpeedMul | maxEnemies | xpTierBonus |
|-----:|-----------------:|-----------:|---------------:|--------------:|-----------:|------------:|
|   0s |  1.80s           | 1.00×      | 1.00×          | 1.00×         | 35         | +0          |
|  30s |  1.62s           | 1.18×      | 1.07×          | 1.08×         | 35         | +0          |
|  60s |  1.46s           | 1.39×      | 1.14×          | 1.17×         | 40         | +1          |
|  90s |  1.31s           | 1.64×      | 1.22×          | 1.25×         | 45         | +1          |
| 120s |  1.18s           | 1.94×      | 1.31×          | 1.33×         | 50         | +2          |
| 180s |  0.96s           | 2.70×      | 1.50×          | 1.50× (cap)   | 60         | +2          |
| 240s |  0.78s           | 3.76×      | 1.71×          | 1.50×         | 65         | +2          |
| 300s |  0.63s           | 5.23×      | 1.96×          | 1.50×         | 70         | +2          |
| 600s |  0.40s (floor)   | 27.3×      | 4.21×          | 1.50×         | 80 (cap)   | +2          |

**設計後果**：
- 300s 後 spawn interval 在 floor 附近 → 玩家壓力主要來自 maxEnemies + HP 牆，不是「更頻繁」
- HP mul 沒上限是 **intentional**（讓玩家最終必死）→ Combat Loop 紅線
- xpTier bonus 在 120s 後封頂 → XP 數值不會無限通膨

### Requirement: Initial Spawn Delay = 3.0s（保護開場）

`EnemyManager` SHALL 在 game start 後等 **3.0s** 才開始 spawn 第一隻敵人（`INITIAL_SPAWN_DELAY = 3.0`）。
這個 grace 期讓玩家有時間看清場景、確認 HUD、無敵移動 1–2 步。

### Requirement: Spawn Distance = 24 units（不從玩家身上長出來）

`SPAWN_DISTANCE = 24` SHALL 是 spawn 點到玩家的最小距離（隨機方向）。
這個距離大約是 1.5 個視野半徑 → 怪會從畫面邊緣外走進來，不會憑空在玩家面前出現。

### Requirement: QA Mode — `?qaBombers=1` 旁路權重抽樣

當 `globalThis.location.search` 含 `qaBombers=1` 時，`pickSpawnType()` SHALL：
- **完全旁路**標準 unlock + weight 抽樣邏輯
- 在 `bomber` 與 `plasma_bomber_v2` 之間 **deterministic round-robin**（用全域 `qaBomberIndex` 累加）
- 用途：QA-03 視測（v1 vs v2 readability）— 詳見 `qa/reports/run-template.md`

#### Scenario: QA 跑 4 隻 bomber 序列
- WHEN URL = `index.html?qaBombers=1`
- AND 觸發 4 次 `pickSpawnType()`
- THEN 順序回 `bomber`, `plasma_bomber_v2`, `bomber`, `plasma_bomber_v2`
- AND `qaBomberIndex` 在模組 scope 不重設（reload 才歸零）

⚠️ **隱憂**：`qaBomberIndex` 是模組級 mutable state，**fast-refresh / soft reload** 可能不重設 → QA 報告必須註明「測試前硬刷新」。已在 `qa/reports/run-template.md` Header「測試前準備」段點出。

### Requirement: 與 Card / XP / Drop 系統的接口

- **XP**：`xpTier` 與 `xpCount` 由 spawn pool 提供；`enemyXpTierBonus(elapsed)` 在 `Game.ts` 撿 orb 時加上去（不在 spawn pool 階段）。詳 `systems/level-progression.md`
- **Heart / Chest**：`heartDropChance` / `chestDropChance` 由 enemy spec 提供，spawn pool 只負責挑誰登場。詳 `systems/drop-economy.md`（待寫，已列 doc-only backlog）
- **Card Pool**：升級卡 unlock 與 spawn pool **獨立**（卡片由玩家武器槽 + 元素附魔決定，不看 spawn）— 但 `lightning_storm` 等 boss 用卡的解鎖意義要在玩家撐過 miniboss（120s）時才明顯
- **Boss 觸發**：`miniboss` 進場時 `EnemyManager.onBossSpawn` 觸發，遊戲層處理 BGM 切換 + boss UI（spawn pool 不負責 UI）

---

## Performance Budget

| 預算項目                    | 上限       | 監控位置                  |
|----------------------------|------------|---------------------------|
| 同時場上敵人               | 80 (hard)  | `maxEnemiesAt()` cap      |
| pickSpawnType 每次 cost    | < 0.1ms    | 11 隻過濾 + accumulator，無分支熱點 |
| Template 載入（GLB）       | first-spawn time only | `EnemyManager.ensureTemplate` cache |
| Placeholder 幾何體         | rusher 1 種（cone）   | 不影響 budget          |

`pickSpawnType()` 本身 O(N=11) 線性掃描，每次 spawn 呼叫一次（spawn interval 最快 0.4s）→ 不需要優化。
真正昂貴的是 GLB **首次載入**（10 個 .glb，total ~3 MB），但 `ensureTemplate` cache 後幾乎零成本。

---

## Open Questions（pending sign-off）

### OPEN-1 — 權重表的「設計感」 vs 「程式硬編碼」

當前 11 個 weight 全寫死在 `EnemyTypes.ts`。要不要把 weight + unlockAt 抽到 `src/data/enemies.json`，與 `weapons.json` 對稱？
- **Pros**：設計師可改數值不用碰 code；可加 validator（類似 `validate-weapons.mjs`）；可塞進 PROPOSAL 流程
- **Cons**：要寫 schema + validator + migration test；short-term 拖慢 Slice 進度
- **Owner**：Systems Designer (T-D1) — 等他簽 (a)「保留 code-side」或 (b)「規劃 EnemyMigration epic」

### OPEN-2 — Act I 4 隻怪是不是太少

0–34s 玩家只看到 grunt / fast / rusher / scout 四種近戰怪，pacing 是否單調？
- **論點 A**：fine，新手第一次玩才需要慢學
- **論點 B**：第 N 次玩同一個玩家覺得 Act I 是「等到 35s 才好玩」 → 可考慮把 ranged unlockAt 從 35s 提前到 20–25s
- **Owner**：Combat Designer (T-D3) + CAO Raven（玩測簽字）— 等 QA-03 + 後續玩測 run 報告數據

### OPEN-3 — miniboss 0.08 權重是否太低

120s 後權重 0.08 / 5.33 = 1.5% → 一隻 miniboss 大約每 67 隻怪才出一隻 → spawn interval ~0.7s → 約 47s 才見一隻 boss。
是不是太稀有了？設計上應該每 60s 強制一隻？
- **Pros 強制**：節奏可預期、boss 是 build 試金石
- **Cons 強制**：失去抽到 boss 的驚喜感
- **Owner**：Systems Designer (T-D1)

### OPEN-4 — bomber 進場太早

bomber 在 45s unlockAt、AOE 25 damage、玩家此時 HP 已可能因為 grunt / rusher 觸碰掉到 70%。
QA-03 玩測必須抓「bomber 第一次出現 → 玩家是否來得及學踢開」這個學習曲線。
- **Owner**：Combat Designer (T-D3) + CAO Raven（玩測）— 等 `qa/reports/run-bomber-readability-20260519.md` 數據

### OPEN-5 — Act III 沒有「冷卻」段

90s 起一路 ramp 到玩家死。沒有設計性的「鬆口段」（例如每 60s 給 5s 空場讓玩家撿掉地上的 XP）。
是不是要加？survivor like 同類遊戲多半也沒給冷卻段，但 GGS 可能要差異化。
- **Owner**：Systems Designer (T-D1) + CMO（市場差異化）

---

## Related Specs

- `systems/combat-loop.md`（核心循環，spawn 服務於這個 loop）
- `systems/level-progression.md`（XP tier 與 difficulty 區段）
- `systems/audio-system.md`（boss 觸發 BGM 切換、SFX voices 預算）
- `systems/vfx-system.md`（bomber 爆炸 / rusher 自爆 VFX，與 spawn rate 互動）
- `systems/performance-budgets.md`（80 隻 enemy 上限對 frame budget 的影響）
- `enemies/*.md`（11 隻個別 spec，待補 owner 段 — doc-only backlog #7）
- `qa/reports/run-template.md`（QA 視測模板）
- `cards/_SYNERGY-MAP.md`（10 build × spawn pool 互動，tick #15 寫）

## Owner

- Spec: Systems Designer (T-D1) + Balance Architect (T-D2)
- Implementation: Web Frontend / Gameplay Programmer
- QA: CAO Raven（玩測 pacing 簽字）
- Sign-off needed: T-D1 + T-D2 + T-D3 三方

## Changelog

- 2026-05-19 (tick #16 doc-only backlog #5): Initial documentation of existing `pickSpawnType()` logic. Source = `src/enemy/EnemyTypes.ts` + `src/enemy/Difficulty.ts` 2026-05-19 snapshot. Status PROPOSAL — pending T-D1 + T-D2 + T-D3 sign-off.
