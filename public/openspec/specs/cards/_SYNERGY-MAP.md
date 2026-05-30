# Build Synergy Map (18 升級卡 × 8 副武器 × 4 元素)

Status: PROPOSAL — pending Balance Architect (T-D2) + Combat Designer (T-D3) + Volt TA 三方簽字
Owner draft: Claude (Cowork loop tick #15, Doc-Only Backlog #4)
Last updated: 2026-05-19

## Purpose

把散落在 15 張靜態卡 + 8 張武器卡 + 96 張動態屬性卡的「build 配方」整理成單一文件，回答三個問題：

1. **玩家視角**：抽到 X 卡時，下一張該追什麼？
2. **Balance 視角**：哪些 build 太強 / 太弱 / 沒人用？
3. **效能視角**：哪些 build 會撞 VFX 200 粒子上限 / LightningSystem 30 arcs / 16 SFX voices？

本檔不是 canon —— 數值待 Balance Architect 玩測簽字。

## Glossary

- **核心卡**（core）：定義 build 主軸的卡，缺它 build 就不成立
- **延伸卡**（scale）：放大 build 效果但不改方向的卡
- **保險卡**（safety）：補生存 / 經濟 / 操作短板的卡（通常跨 build 共用）
- **協同武器**（synergy weapon）：副武器 8 把中與本 build 高契合的
- **協同元素**（synergy element）：4 元素中與本 build 共振的

## Top-Level Build Roster (10 個提案 build)

### Build 1 — 鏈電流 ⚡ (Chain Lightning)

**主題**：每次命中觸發 1 + N 條鏈電，全螢幕電網

| 槽位 | 內容 |
|---|---|
| 協同武器 | `wpn_shock_baton`（內建 1 跳鏈電） |
| 協同元素 | Lightning tier 3（疊加 2/3/5 跳） |
| 核心卡 | `chain_arc` × 3-4（每張 +25%，4 張達 100% 必觸 3 跳） |
| 延伸卡 | `lightning_strike`（20% 單道直擊雷）/ `lightning_storm`（15% 5 道風暴） |
| 保險卡 | `move_speed` × 2（kite 起手）/ `xp_magnet` ×1（撿 orb） |

**極端疊加**：`shock_baton` + Lightning T3 + `chain_arc` × 4（100%）+ `lightning_strike` × 5（100%）+ `lightning_storm` × 3（45%）= 每次命中保證 1 + 5 + 3 = 9 條 chain + 必觸 strike + 45% storm（5 道）。

**效能風險（Volt 必須監控）**：
- 上述極端 build 在 4 發/秒 × 命中 5 隻敵人時 = **每秒約 200 弧線** → 已遠超 PERF-02 設定的 `MAX_ARCS = 30` 上限 → LightningSystem 會 evict 最舊弧
- 觀感影響：玩家可能少看到大部分鏈電視覺效果
- 對應 OPEN-1（見最底）

**Balance 短板**：對單一 Tank（heavy）效率低（鏈電靠群戰才有 spread），對 fast/dispersed 怪也較差

---

### Build 2 — 火焰流 🔥 (Burn Stream)

**主題**：高頻命中 + 多重燃燒疊加，靠 DoT 化敵

| 槽位 | 內容 |
|---|---|
| 協同武器 | `wpn_flamethrower`（短距高頻噴射，每秒多次命中觸發 burn） |
| 協同元素 | Fire tier 3（單擊 burn → 6s burn → 大範圍燃燒） |
| 核心卡 | `damage` × N（base damage 拉高 burn tick）/ `fire_rate` × N（主武器 stack burn refresh） |
| 延伸卡 | `bullet_speed` × 1-2（彌補 flamethrower 短距）/ `big_bullets` × 2（擴大命中半徑） |
| 保險卡 | `max_hp` × 2 / `heal` × 1（火焰流要近戰，吃傷害） |

**疊加邏輯**：Fire 元素的 burn DoT 在每次新命中時 refresh。`flamethrower` 內建超高 RoF → burn 永遠不會脫落 → 配 `damage` flat +10 × 5 (= +50) 可把每 tick burn 拉到極端值。

**效能風險**：`flamethrower` 粒子量本身高（VFX system 應該已限預算），疊 `big_bullets × 2`（bulletScale = 2.89）會放大 collision box，間接讓粒子產出頻率上升。Volt 須測在 30 怪同框 + flamethrower + big_bullets × 2 下 FPS。

**Balance 短板**：對遠距怪（ranged / caster）需配近身手段；對 brute（高 HP）的 DPS 不見得贏 Tank build

---

### Build 3 — 狙擊流 🎯 (Sniper)

**主題**：單發超高傷 + 自動追蹤，每秒 1-2 槍但秒人

| 槽位 | 內容 |
|---|---|
| 協同武器 | `wpn_8l`（長筒狙擊，1 顆/射、damageMul 大） |
| 協同元素 | Lightning（命中接 chain）或 Fire（命中接 burn）— 二選一 |
| 核心卡 | `bullet_speed` × 3（穿屏速度）/ `damage` × 3-5（+30 ~ +50 flat） |
| 延伸卡 | `homing` ×1（解鎖追蹤）/ `homing_up` × 2（穩定追擊）/ `bounce` × 1（次要目標延伸） |
| 保險卡 | `move_speed` × 2 / `xp_magnet` × 2 |

**疊加邏輯**：8l 本身發射慢（低 fireRate）但 damageMul 高 → flat damage 卡（每張 +10）等於 +10 × damageMul 的最終命中值，bonus 比例最大。`homing` × 1 把 1 發狙擊變制導，大幅提升命中率。

**衝突**：
- `double_shot` 對 8l 無效（只影響主武器，副武器 8l 不受惠）— 抽到請丟
- `fire_rate` 對 8l 無效（同上，只影響主武器射速）
- `bullet_speed × 3+` 配 `homing` 時，子彈飛太快可能掠過 homing 範圍 → OPEN-2

**Balance 短板**：早期（前 60s）抽不到 8l 武器卡會卡住

---

### Build 4 — 群戰穿透流 🌀 (Crowd Penetration)

**主題**：1 顆子彈打多隻敵人，靠 bounce / 追擊處理 wave

| 槽位 | 內容 |
|---|---|
| 協同武器 | 任何高 RoF 副武器（`wpn_basegun_b` 雙管 / `wpn_5l2` 衝鋒 / `wpn_basegun_c` 緊緻手槍） |
| 協同元素 | Ice（slow + chain freeze）或 Poison（DoT 疊加） |
| 核心卡 | `bounce` × 2-3（+2 ~ +6 bounces 每彈擊 3-7 隻）/ `big_bullets` × 2（擴 hit radius） |
| 延伸卡 | `homing` ×1（補命中）/ `chain_arc`（補疊加觸發） |
| 保險卡 | `move_speed` ×1 / `max_hp` ×1 |

**疊加邏輯**：`bounce × 3` = bouncesOnHit = 6 → 1 顆彈最多打 7 隻不同敵人。配高 RoF 副武器 → 每秒打中數十隻敵人 → wave clear。

**衝突**：`bounce` 與 `homing` 高疊時，子彈彈到下一目標後 homing 會立刻拉回 → 觀感和效率怪異 → OPEN-3（Combat Designer 測）

**Balance 短板**：對單一 boss / heavy 沒幫助；只在 wave 場景強

---

### Build 5 — Tank Survivor 🛡️ (Tank)

**主題**：吃傷不死、慢慢清

| 槽位 | 內容 |
|---|---|
| 協同武器 | `wpn_basegun_d`（重型手砲，單發傷高）或 `wpn_explosivecrossbow`（爆裂弩，AoE） |
| 協同元素 | 任何 — 不依賴元素 |
| 核心卡 | `max_hp` × 4-5（base 100 → 200-225 + 每次抽都回滿）/ `heal` ×1-2 |
| 延伸卡 | `damage` × N（保 DPS）/ `move_speed` × 1（最小機動性） |
| 保險卡 | `xp_magnet` × 1（站定撿 orb） |

**疊加邏輯**：`max_hp` 每張 +25 max + 補滿 → 抽 4 張 = +100 max + 等於回 4 × (max - current) 的累積 HP（最低保證 4 次回滿）。配 `heal` 緊急用。

**衝突**：
- `move_speed × N` 與 Tank 主題反 — Tank 玩法是站定吃傷
- `heal` 滿血時無效（已寫進 heal.md OPEN）

**Balance 短板**：late game（90s+）的 brute + miniboss DPS 可能還是穿透 Tank build → 需 Balance 測

---

### Build 6 — 爆裂面殺 💥 (AoE Burst)

**主題**：彈著點爆炸 + 元素 DoT 範圍

| 槽位 | 內容 |
|---|---|
| 協同武器 | `wpn_explosivecrossbow`（爆裂弩，hitscan 範圍傷害） |
| 協同元素 | Fire tier 3（爆 + burn 兩段） |
| 核心卡 | `damage` × N（爆心 + 圈外都受惠）/ `bullet_speed` ×2（縮拋物線時間） |
| 延伸卡 | `big_bullets` × 2（擴 hit radius，雖然爆炸範圍 code-side 寫死，但 collision box 變大誘發更多命中） |
| 保險卡 | `move_speed` × 1 / `max_hp` × 1 |

**衝突**：
- `bounce` 對 explosive 武器無意義（已爆 = 已消耗）
- `homing` 對 explosive 也少互動（彈道目標已寫死）

**Balance 短板**：射速低、近戰危險；對快 fast/scout 命中率不穩

---

### Build 7 — DPS 噴流 💨 (Stream DPS)

**主題**：最高每秒輸出 — 速攻 boss / miniboss

| 槽位 | 內容 |
|---|---|
| 協同武器 | `wpn_5l2`（連發衝鋒，base RoF 高） |
| 協同元素 | Lightning（小機率 chain 加成）或 Fire（refresh burn） |
| 核心卡 | `damage` × 5+（總 base +50）/ `bullet_speed` × 2（補射程） |
| 延伸卡 | `homing` × 1（補命中率）/ `chain_arc` × 2（群戰補貼） |
| 保險卡 | `max_hp` × 2 / `move_speed` × 1 |

**衝突**：
- `fire_rate` 對 5l2 副武器無效 — 想拉射速請改 main gun build（見 Build 8）

**Balance 短板**：彈藥消耗大（如果未來加重 reload／cooldown 機制會塌）；目前 code 沒 reload，本 build 無風險

---

### Build 8 — Hand-Cannon (主武器 max DPS) 🔫

**主題**：放棄副武器、把主武器堆到最強

| 槽位 | 內容 |
|---|---|
| 協同武器 | 主武器（MainGun，玩家 manual aim） |
| 協同元素 | Lightning（玩家手動瞄頭觸發 chain） |
| 核心卡 | `double_shot` × 3-4（base 1 → 4-5 顆/扣扳機）/ `fire_rate` × 3+（每張 +1.2/s） |
| 延伸卡 | `damage` × N / `big_bullets` × 2 / `bullet_speed` × 2 |
| 保險卡 | `move_speed` × 2（manual aim 要會 kite） |

**疊加邏輯**：`double_shot × 3` × `fire_rate × 3` = 主武器每秒可發出 (1 + 3) × (base + 3.6) ≈ 25-30 子彈。配 `big_bullets × 2` 擴 hit radius → 主武器變掃射機關槍。

**衝突**：
- `double_shot` / `fire_rate` 都只影響主武器，請**不要碰副武器卡**（會分散）
- 不抽副武器卡會少很多 weapon-card 卡池選項 → 玩家可能感覺「沒新東西可拿」→ OPEN-4

**Balance 短板**：要求玩家瞄準技術；對「躺著玩」玩家不友善

---

### Build 9 — XP 滾雪球 📈 (XP Snowball)

**主題**：靠 magnet + 速度快速升等抽更多卡 → 雪球

| 槽位 | 內容 |
|---|---|
| 協同武器 | 任何 — 不依賴武器 |
| 協同元素 | 任何 |
| 核心卡 | `xp_magnet` × 3-4（每張 +3m，4 張達 +12m magnet）/ `move_speed` × 2-3（撿得快） |
| 延伸卡 | `damage` × N（保最低 kill 速度）/ `fire_rate`（主武器補貼） |
| 保險卡 | `max_hp` × 1（不能死） |

**疊加邏輯**：xp_magnet `+3m flat` × 4 = +12m 拾取半徑（base 約 2-3m？code 沒寫死）→ 整螢幕 orb 自動飛來 → 升等速度 +30~50%

**衝突**：
- `xp_magnet × 4+` 會讓玩家完全不用走位撿 orb → 玩法淡化（OPEN-5）

**Balance 短板**：早期（前 30s）卡池不夠多 → magnet 卡 weight 1.0 抽不到 4 張機率不高 → 此 build 多半要 90s+ 才成型

---

### Build 10 — 追擊全自動 🎯 (Auto-Homing)

**主題**：玩家只負責跑位 + 升等，子彈全自動追

| 槽位 | 內容 |
|---|---|
| 協同武器 | 任何（但配 `wpn_5l2` 衝鋒效果最好） |
| 協同元素 | Poison（命中疊 DoT，homing 保持 DoT refresh） |
| 核心卡 | `homing` × 1（unique，啟動）/ `homing_up` × 2-3（每張 +1.5，總 strength 3.5 + 4.5 = 8） |
| 延伸卡 | `bounce` × 2（每命中多 2 跳，配 homing 全自動鎖目標） |
| 保險卡 | `move_speed` × 3（kite + 撿 orb 雙用） |

**衝突**：
- 先抽 `homing_up` 但沒 `homing` → 浪費（homing_up.md 已 OPEN gate 問題）
- `bullet_speed × 3+` 子彈太快超出 homing 轉向半徑 → 子彈直線飛出（OPEN-2）

**Balance 短板**：homing 是 rare（weight 0.35）+ unique，要抽到才成立；前 30s 沒 homing 玩家會苦戰

---

## Cross-Build Conflict Matrix

| 卡 / 元素 | 與下列搭配反效果 |
|---|---|
| `double_shot` | 副武器 build 全部（只影響主武器） |
| `fire_rate` | 副武器 build 全部（只影響主武器） |
| `homing` + `bullet_speed × 3+` | 子彈速度超出追蹤轉向能力 → 直線掠過（OPEN-2） |
| `bounce` + `homing` | 彈跳到下一目標後立刻被 homing 拉回 → 觀感怪 → 命中第三個目標前可能掉 |
| `heal` + 滿血 | 完全浪費（heal.md 已 OPEN canPick gate） |
| `homing_up` 沒 `homing` | 完全浪費（homing_up.md 已 OPEN gate） |
| `move_speed × 6+` | 玩家比所有敵人快 → 失控（move_speed.md 已 OPEN cap） |
| Lightning 三疊（shock_baton + Lightning T3 + chain_arc/strike/storm 全堆） | 弧線 / 落雷數爆 PERF-02 cap → evict | 觀感掉幀 |
| Tank build + `move_speed × N` | 玩法主題互斥（一個是站定吃傷、一個是 kite） |

## 元素疊加重點（給 Combat Designer 校對）

每把武器最多帶 2 種元素（_ATTRIBUTE-CARDS.md 已寫死規則）。各元素角色：

| 元素 | 特色 | 與哪個 build 共振 |
|---|---|---|
| Lightning | Chain（2/3/5 跳） | Build 1, 3 (sniper), 8 (hand-cannon)|
| Fire | Burn DoT (refresh on hit) | Build 2, 3 (sniper alt), 6 (爆裂) |
| Ice | Slow + freeze | Build 4 (群戰), Tank 補貼 |
| Poison | DoT 累計 + 不可清除 | Build 10 (auto-homing), Build 4 alt |

「2 元素」配對推薦：
- Lightning + Fire（即時 + 持續）= 對 brute 最強
- Ice + Poison（slow + DoT）= 群戰最久（適合 caster heavy 場景）
- Lightning + Ice（chain + slow）= 鏈條鎖死 fast 怪
- Fire + Poison（雙 DoT）= 不衝突，但收益 marginal

## Open Questions (給三方審字)

### OPEN-1 — LightningSystem 弧線 evict 是否影響玩家體感
- 對誰：**Volt TA + Combat Designer**
- 內容：Build 1 極端疊加下，每秒可能產出 200+ 弧線，已遠超 `MAX_ARCS = 30` 上限 → 弧線會被 evict 掉。玩家視覺上是「看到一堆閃光但少一半」還是「看起來流暢」？需玩測。
- 影響：如果體感差 → Build 1 失敗 → chain_arc 卡需要 nerf 或加 hard rule（每秒上限）

### OPEN-2 — homing + bullet_speed × 3+ 直線掠過 bug 或 feature
- 對誰：**Combat Designer + Web Frontend (gameplay-programmer)**
- 內容：homing 轉向速度有限，子彈速度疊到一定值後會超出追蹤能力。是該寫成「homing 子彈 bypass speedMultiplier」還是接受「玩家自己選錯卡」？
- 影響：若選前者 → Projectile.ts 需加邏輯；若選後者 → tooltip 提示

### OPEN-3 — bounce + homing 互動是 bug 還是 feature
- 對誰：**Combat Designer**
- 內容：bounce 把子彈彈到下一目標時，homing 邏輯會立刻把子彈拉回原方向 → 子彈在兩目標間蛇行。是 cool 還是 broken？
- 影響：若 broken → 加 hitIds 邏輯讓 homing 自動跳過已命中目標

### OPEN-4 — Hand-Cannon Build（Build 8）的卡池貧乏問題
- 對誰：**Combat Designer**
- 內容：玩家堆主武器流 → 副武器卡 + 屬性卡（要先有副武器）全部變垃圾 → 卡池有效選項只剩 ~5 張 → 3 選 1 卡卡都重複
- 影響：可能要加「主武器專屬卡池」或 dynamic weight 調整

### OPEN-5 — xp_magnet × 4+ 是否該加 cap
- 對誰：**Balance Architect**
- 內容：4+ 張後 magnet > 螢幕半徑 → 完全不用走位 → 「殺 → 撿」步驟 collapse 成「殺」
- 影響：違反 launch brief 核心循環紀律 → 是否該設 magnet cap = 螢幕 60%？

## Build Coverage Analysis

10 個 build 對 18 張卡 + 8 武器 + 4 元素的覆蓋率：

- **所有 15 張靜態卡**至少出現在 1 個 build 中 ✓
- `homing` / `homing_up` / `bounce` / `chain_arc` / `lightning_strike` / `lightning_storm` 都是 build-defining（rare 卡都有對應 build）✓
- `xp_magnet` 有專屬 build (Build 9) ✓
- `heal` 只在 Build 5 + Build 7 出現 → marginal 卡，未來可考慮 buff 或 nerf weight
- **8 把武器都有對應 build**（basegun_b/c → Build 4, basegun_d → Build 5, 5l2 → Build 7, 8l → Build 3, flamethrower → Build 2, explosivecrossbow → Build 6, shock_baton → Build 1, main → Build 8）✓
- **4 元素都有共振 build** ✓

「沒人選」的潛在卡：
- `heal`：滿血時無用 → 已 OPEN canPick gate
- `homing_up`（沒 homing 時）：已 OPEN gate

## Performance Sanity Check (給 Volt TA)

| Build | 預估 VFX 粒子峰值 | 預估 LightningSystem arcs 峰值 | 預估 SFX voices 峰值 | 對應 cap |
|---|---|---|---|---|
| 1 鏈電流 (極端) | ~180 / 200 cap | 200+ / 30 cap → evict | 8+ / 16 cap | ⚠️ LightningSystem 必爆 |
| 2 火焰流 | ~150 / 200 | 0 | 6 / 16 | OK |
| 3 狙擊流 | ~80 / 200 | 5 / 30 | 4 / 16 | OK |
| 4 群戰穿透 | ~120 / 200 | 0-2 / 30 | 8 / 16 | OK |
| 5 Tank | ~80 / 200 | 0 | 4 / 16 | OK |
| 6 爆裂面殺 | ~160 / 200 | 0 | 6 / 16 | OK |
| 7 DPS 噴流 | ~140 / 200 | 8-15 / 30 | 10 / 16 | OK |
| 8 Hand-Cannon | ~180 / 200 | 5 / 30 | 12 / 16 | ⚠️ SFX 接近上限 |
| 9 XP 滾雪球 | ~80 / 200 | 0 | 5 / 16 | OK |
| 10 追擊全自動 | ~140 / 200 | 0 | 8 / 16 | OK |

→ Build 1 需 Volt 玩測；Build 8 需 SFX Designer 確認 polyphony 配置不會在 30 怪同框 + 主武器爆射時撞 16 voices。

## Related Specs

- `cards/_TEMPLATE.md`（單卡 spec 範本）
- `cards/_AUTHORING.md`（卡片三大紀律）
- `cards/_WEAPON-CARDS.md`（8 張動態武器卡）
- `cards/_ATTRIBUTE-CARDS.md`（96 張動態屬性卡）
- `weapons/*.md`（8 武器 spec）
- `elements/*.md`（4 元素 spec）
- `systems/level-progression.md`（卡池 weight 規則）
- `systems/vfx-system.md`（粒子 200 cap + LightningSystem 30 arcs cap）
- `systems/combat-loop.md`（核心循環紀律）
- `performance/profiles/lightning-system-eviction-2026-05-19.md`（PERF-02 evict 機制）

## Owner

- Draft: Claude (loop tick #15, doc-only backlog #4)
- Sign-off needed: Balance Architect (T-D2) + Combat Designer (T-D3) + Volt TA（效能）
- 三方任一不簽 → 標 BLOCKED 並寫 inbox 給 Terry

## Changelog

- 2026-05-19 (tick #15): 初版提案，10 個 build / 衝突矩陣 / 5 個 OPEN questions / Volt perf sanity table
