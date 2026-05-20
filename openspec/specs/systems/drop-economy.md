# System: Drop Economy（Heart / Chest / XP Orb 掉落經濟）

> Status: **PROPOSAL** — initial documentation of existing drop / pickup / XP orb code.
> 等 Systems Designer (T-D1) + Balance Architect (T-D2) + Combat Designer (T-D3) 三方簽字後改 ACTIVE。

## Purpose

把 GGS 既有的三條掉落線（heart 回血 / chest 升級 / XP orb 等級）邏輯文件化，
讓設計師調生存節奏、命中-獎勵循環、META progression 不用再翻 source code：

1. **11 種敵人**的 heart / chest 掉落機率表（包含 ambient + rescue heart 額外注入線）
2. **XP orb 三層 tier 系統**：tier 值 / 顏色 / 時間 bonus、磁吸物理與 cap、與 META `xp` upgrade 接口
3. **三種獎勵的 cooldown / 上限 / lifetime**：MAX_FIELD_HEARTS 3、HEART_LIFETIME 30s、ambient 38s、rescue 14s @ ≤40% HP
4. **upgrade card 與 META interplay**：`xp_magnet`、`heal`、`max_hp`、META `hp / damage / xp / weapon`
5. **UI / SFX 通知**：heartPickup / chestOpen / xpOrb pickup、deathBurst 紅光提示
6. 與其他 systems spec（`level-progression.md` / `spawn-pool.md` / `combat-loop.md`）的交接點

本 spec documentation-only：**不改任何數值**，只把現狀寫下來，讓往後調掉率有 baseline 可對。
任何**修改**機率 / 上限 / lifetime / META 倍率必須開新 OpenSpec proposal。

---

## Source of Truth

- Code：`src/enemy/EnemyTypes.ts`（每隻怪 heartDropChance + chestDropChance + xpTier + xpCount）
- Code：`src/core/Game.ts`（onEnemyKill drop check + ambient/rescue heart timer + applyMetaUpgrades）
- Code：`src/progression/Pickup.ts`（heart + chest 統一池 + range/grace/lifetime）
- Code：`src/progression/XpOrb.ts`（256 orb instanced pool + magnet 物理）
- Code：`src/progression/UpgradeCards.ts`（heal / max_hp / xp_magnet card 定義）
- Code：`src/progression/Meta.ts`（META_UPGRADES def + persistence）
- Code：`src/enemy/Difficulty.ts`（enemyXpTierBonus 時間 bonus）
- 上層 spec：`systems/combat-loop.md`（殺→撿→升→抽→撐）+ `systems/spawn-pool.md`（敵人權重）+ `systems/level-progression.md`（XP / 升等 / 卡池）

---

## Requirements

### Requirement: Heart 掉落由「敵人死亡 roll + ambient/rescue 注入」雙線供給

Heart drop SHALL 由兩個獨立來源：

1. **Death roll**：敵人死亡時 `Math.random() < type.heartDropChance` 過則 spawn heart in enemy position
2. **Ambient heart**：`AMBIENT_HEART_INTERVAL = 38s` 計時器，每滿 38s 在玩家 10–18m 環域內 spawn 1 顆
3. **Rescue heart**：玩家 HP ≤ `RESCUE_HEART_HP_PCT = 40%` 時，`RESCUE_HEART_INTERVAL = 14s` 計時器允許在 7–12m 環域加 spawn 1 顆。觸發 rescue 後 ambient timer 被推至 ≥ 8s（避免雙倍噴湧）

`MAX_FIELD_HEARTS = 3`：場上 heart 數量達 3 即所有 ambient / rescue 注入暫停（death roll 仍可超出，因為 cap check 只擋 spawnHeartNearPlayer，不擋 EnemyManager death drop）。

#### Scenario: 玩家滿血、ambient timer 到

- WHEN `ambientHeartTimer <= 0` AND `health.hp / health.max > 0.4` AND `pickups.count('heart') < 3`
- THEN spawn heart 在玩家 10–18m 環域內隨機點（受 arena 邊界 clamp `arena.size/2 - 3`）
- AND `ambientHeartTimer = 38`

#### Scenario: 玩家受傷 ≤ 40% HP

- WHEN `health.hp / health.max <= 0.4` AND `rescueHeartTimer <= 0` AND `pickups.count('heart') < 3`
- THEN spawn heart 在玩家 7–12m 環域內隨機點
- AND `rescueHeartTimer = 14`
- AND `ambientHeartTimer = max(ambientHeartTimer, 8)`

#### Scenario: 場上已有 3 顆 heart

- WHEN `pickups.count('heart') >= 3`
- THEN ambient + rescue spawn 全部 skip（早 return）
- BUT 敵人死亡 death roll 仍可 spawn（場上會短暫 > 3 顆，靠 30s lifetime 自然回落）

### Requirement: 11 隻敵人 Heart / Chest 掉落表（Source = EnemyTypes.ts 2026-05-19 snapshot）

| Enemy            | heart% | chest% | xpTier | xpCount | 備註                |
|------------------|-------:|-------:|-------:|--------:|---------------------|
| grunt            |  3.0%  |  0.5%  | 1      | 1       | 開場主力，最普通     |
| fast             |  3.0%  |  0.5%  | 1      | 1       | 同 grunt             |
| scout            |  3.0%  |  0.5%  | 1      | 1       | 同 grunt             |
| rusher           |  3.0%  |  0.5%  | 1      | 1       | 同 grunt             |
| heavy            |  5.0%  |  2.0%  | 1      | 2       | tank 怪，chest 升幅顯著 |
| ranged           |  4.0%  |  0.5%  | 1      | 1       | 後排，輕度 heart 補貼 |
| bomber           |  4.0%  |  0.5%  | 2      | 1       | T2 xpTier 但 heart 機率比 grunt 高一階 |
| caster           |  4.0%  |  0.5%  | 2      | 1       | 同 bomber            |
| brute            |  5.0%  |  3.0%  | 2      | 2       | tank 後段，chest 6 倍 grunt |
| plasma_bomber_v2 |  5.0%  |  1.0%  | 2      | 2       | QA 對照組（v1 vs v2）|
| miniboss         | 50.0%  | 25.0%  | 3      | 3       | boss 必爆，明顯獎勵   |

**設計觀察**（給 Balance Architect）：

- Heart drop 範圍 3.0%–5.0%（boss 50% 例外）：平均 ~3.6%，10 隻 spawn 約 0.36 顆 heart
- 純 death drop 在 0–34s（只有 grunt available）= 3% / kill，配 spawn rate 應該不太夠 → ambient 38s timer 才是早期主回血源
- Chest 範圍 0.5%–3.0%（boss 25% 例外）：除了 heavy/brute/miniboss 之外幾乎全部 0.5%（200 殺 = 1 chest），主升級必須靠 XP 升等抽卡
- Boss heart 50% / chest 25%：每 120s+ 一隻，是大幅度的「打 boss 換補給」設計

### Requirement: Heart pickup 行為（range / heal / lifetime）

- `HEART_PICKUP_RANGE = 1.0m`（玩家中心到 heart 中心）
- `HEART_LIFETIME = 30s`：heart 在場 30 秒後自動消失（chest 無 lifetime，會永遠在）
- `PICKUP_GRACE = 0.35s`：spawn 後 0.35s 內不可拾取（防止「殺敵爆 heart 同時撞上」誤撿）
- Heal amount = **25 HP**（不超過 health.max，會 clamp）
- 視覺：sphere geometry r=0.22、紅色 emissive、bob ±0.15m @ 1.2Hz
- SFX：`sfx.heartPickup()`

#### Scenario: 玩家碰到剛 spawn 0.2s 的 heart

- WHEN `bornDt < 0.35` AND distance(player, heart) < 1.0
- THEN 不觸發 collect（grace 期）

#### Scenario: heart 在場 30 秒沒被撿

- WHEN `bornDt > 30`
- THEN heart 自動 dispose，不觸發任何 callback

### Requirement: Chest pickup 行為（range / trigger / persistence）

- `CHEST_PICKUP_RANGE = 1.2m`（比 heart 稍大，避免錯過珍稀掉落）
- Chest **無 lifetime**：spawn 後場上一直在直到被撿（玩家可以「先躲再撿」）
- 觸發效果：`level.pendingLevelUps += 1` 並立即呼叫 `showUpgrade()` 開卡牌選單
- 視覺：box geometry 0.7³、橘色 emissive、bob + 1.2 rad/s 旋轉
- SFX：`sfx.chestOpen()`

#### Scenario: 玩家滿血碰 chest

- WHEN distance(player, chest) < 1.2 AND `bornDt > 0.35`
- THEN trigger upgrade card selection（不論 HP 狀態）
- AND chest 從場上移除

### Requirement: XP Orb 三 tier 系統 + 時間 bonus

XP orb 採 **InstancedMesh** pool（`MAX = 256`），三層 tier：

| Tier | XP value | scale | RGB color           | 視覺名稱 |
|-----:|---------:|------:|---------------------|---------|
| 1    | 1        | 1.00  | `[0.40, 1.00, 0.60]` | mint green |
| 2    | 5        | 1.40  | `[0.30, 0.72, 1.00]` | cyan blue  |
| 3    | 15       | 1.80  | `[0.78, 0.49, 1.00]` | violet     |

每隻敵人 spawn 時 tier = `min(3, baseXpTier + enemyXpTierBonus(elapsed))`：

- `enemyXpTierBonus(elapsed)`：0–59s +0、60–119s +1、120s+ +2（cap +2）
- 等於玩家不買 upgrade card 也能因為「活越久 orb 越值錢」自然加速升等

**xpCount**：每殺死一隻敵人 spawn `data.xpCount` 顆 orb，全部同 tier（heavy = 2 顆 T1、brute = 2 顆 T2、miniboss = 3 顆 T3）。

#### Scenario: 玩家 65 秒殺 1 隻 grunt（base xpTier=1, xpCount=1）

- WHEN elapsed = 65 AND kill grunt
- THEN tier = min(3, 1 + 1) = 2
- AND spawn 1 顆 cyan orb（5 XP）

#### Scenario: 玩家 130 秒殺 1 隻 brute（base xpTier=2, xpCount=2）

- WHEN elapsed = 130 AND kill brute
- THEN tier = min(3, 2 + 2) = 3
- AND spawn 2 顆 violet orb（共 30 XP）

#### Scenario: 玩家 5 秒殺 1 隻 grunt

- WHEN elapsed = 5 AND kill grunt
- THEN tier = min(3, 1 + 0) = 1
- AND spawn 1 顆 mint green orb（1 XP）

### Requirement: XP Orb 物理與磁吸

- `ORB_RADIUS = 0.18m`（碰撞半徑）
- `PICKUP_RANGE = 1.0m`（玩家中心到 orb 中心觸發拾取距離）
- Spawn 初速：上拋（`vel.y = 3.5 + Math.random() * 1.5`）+ ±1.5 m/s 隨機水平噴濺
- 重力：`vel.y -= 9 * dt`
- 落地阻尼：撞 y ≤ 0.25 時 `vel.x/z *= 0.6`
- **磁吸**：當玩家在 `xpOrbs.magnetRange`（default 6m，受 `xp_magnet` upgrade +3m/stack）以內：
  - 加速朝玩家：`PULL_ACCEL = 45 m/s²`
  - 最大吸附速度：`MAX_PULL_SPEED = 18 m/s`
- `MAX = 256`：256 顆 orb 同時在場上限。超出無法 spawn（早 return）

**設計觀察**（給 Volt TA）：

- 256 orb pool 是 hard cap，XpOrbPool.spawn 找不到 alive=false 的 slot 就直接 return（drop sneaky）
- 後期 brute / miniboss 多殺一次 spawn 2–3 顆，若玩家不收集會塞滿
- 建議 Combat Designer 留意「不撿 orb」的玩法不會 brick

### Requirement: META progression 接口

META data 持久於 localStorage（`KEY = ggs.meta.v1`），跨 run 留存。
4 條 upgrade track 影響 drop economy：

| MetaUpgradeId | 名稱       | 每級效果                       | 最大 lv | 累計 essence cost          |
|---------------|-----------|--------------------------------|--------:|----------------------------|
| `hp`          | 肉身強化   | 起始 max HP +15（hp 補滿）     | 5       | 8 / 16 / 28 / 46 / 72 → 170 |
| `damage`      | 基礎火力   | 子彈傷害 +3                    | 5       | 8 / 16 / 28 / 46 / 72 → 170 |
| `xp`          | 經驗加乘   | 每顆 orb 額外 +1 XP            | 3       | 18 / 40 / 90 → 148          |
| `weapon`      | 起始副武器 | 開局多帶 1 把隨機 auto weapon   | 1       | 40                          |

`applyMetaUpgrades(meta)` 在 run 開始時呼叫：
- `lv.hp > 0` → `health.max += 15 * lv.hp; health.hp = health.max`
- `lv.damage > 0` → `projectiles.damage += 3 * lv.damage`
- `lv.xp > 0` → `xpBonusPerOrb = lv.xp`（注意：是固定值不是累加 → 多次呼叫 idempotent）
- `lv.weapon > 0` → 從 `WEAPON_SPECS` 隨機抽 1 把加進 `weapons.addWeapon`

#### Scenario: meta xp lv 3 玩家撿 T2 orb

- WHEN `meta.upgrades.xp = 3` AND collect orb tier 2 (value=5)
- THEN `xpBonusPerOrb = 3` → `level.addXp(5 + 3) = 8 XP`

#### Scenario: meta 全 0 玩家 200 秒收 100 顆 T1 orb

- WHEN `meta.upgrades.xp = 0`
- THEN 每顆 = 1 XP，total 100 XP

### Requirement: Upgrade Cards 與 Drop Economy 直接相關的 3 張

從 `UpgradeCards.ts` 列出與本系統直接相關的 card（common 級）：

| Card id     | 名稱       | 描述                                  | apply                                                |
|-------------|-----------|---------------------------------------|------------------------------------------------------|
| `heal`      | 喘口氣     | 立即回復 40 HP                          | `g.health.hp = min(max, hp + 40)`                    |
| `max_hp`    | 厚實皮毛   | 最大 HP +25（並回滿）                  | `g.health.max += 25; g.health.hp = g.health.max`     |
| `xp_magnet` | 貪婪吸取   | 經驗球吸附範圍 +3m（可疊加）            | `g.xpOrbs.magnetRange += 3`                          |

#### Scenario: 玩家連續抽 3 次 `xp_magnet`

- WHEN 起始 `magnetRange = 6` AND 抽到 `xp_magnet` 3 次
- THEN `magnetRange = 6 + 3*3 = 15m`（與 256 orb cap 共同決定後期「不太需要主動撿 orb」的拐點）

### Requirement: UI / SFX 通知模型

每種 pickup 觸發獨立 SFX channel，全部用 WebAudio 合成（無外部 sample）：

| Pickup | SFX function       | 描述                                  |
|--------|--------------------|---------------------------------------|
| heart  | `sfx.heartPickup()` | 短亮 chime（高頻 sine + 包絡 decay）   |
| chest  | `sfx.chestOpen()`   | square thunk + triangle arpeggio up   |
| xp orb | `sfx.pickup()`      | 低能耗 click（適合 256 顆 cap 場景）    |

**視覺通知補強**：
- Rescue / ambient heart spawn 時觸發 `deathBursts.burst(pos, [1.0, 0.25, 0.35])`：紅光 burst 引導玩家注意
- Chest 持續旋轉 + 橘 emissive bob → 在視覺擁擠的後期容易被忽略，現階段沒有 minimap 標示（OPEN Q3）

---

## Performance Budget

- Heart / chest 用獨立 mesh（不 instanced），場上同時 ≤ 3 顆 heart + 任意 chest（chest 不限制但實際 < 10）→ 對 Volt TA 60 FPS budget 影響可忽略
- XP orb 256 instanced cap，single InstancedMesh + InstancedBufferAttribute color → 1 draw call 處理全部 orb
- magnet 物理 per-frame O(alive_orbs) `≤ 256` 次 hypot + vel update → 沒有 spatial partitioning 但 256 是硬上限
- ⚠️ 沒有「orb 壽命過期」機制 → 玩家完全不收集會永遠塞住 256 cap
  - **推測這是 by design**（玩家不收集 = 不升等，自己選的）但 OPEN Q4 應問 Combat Designer

---

## QA Hooks

- 沒有 `?qaDrops=1` 之類的 deterministic mode（不像 `spawn-pool` 的 qaBombers）
- QA 必須靠多場次重複玩測抓平均 drop rate
- 建議 QA 加 dev tool console command `window.__ggs_dumpDrops?.()` 列印當局累積 heart / chest / orb 數量 + kill count（OPEN Q5）

---

## OPEN Questions（送 Balance Architect / Combat Designer / Systems Designer / Volt TA）

1. **(T-D2 Balance Architect)** Heart / chest 機率表是否要改成「按 spawn rate 反比加權」？例如 grunt 在 0–34s 是 100% spawn → 3% heart rate 配 ~30 隻 kill = 0.9 heart，但 60s+ grunt 只佔 18.8% → kill / 時間少很多 → 早期 vs 晚期回血手感差異是否 by design？
2. **(T-D2 Balance Architect)** Boss heart 50% / chest 25% 是「保證至少能拿一個」的設計（25% 沒掉 = 玩家認為被坑），是否該改成 boss heart 100% / chest 100%（拿掉隨機性）？
3. **(T-D3 Combat Designer)** Chest 沒有 lifetime + 無 minimap 通知 → 後期視覺擁擠時容易被忽略。是否要加 5 秒紅光 pulse + 偶爾 ping？或維持「不去撿是玩家責任」？
4. **(T-D1 Systems Designer + Volt TA)** XP orb 256 cap 沒有 expiry → 不收集 = 永遠塞住 + 不升等。是否要加 60 秒 lifetime auto-collect（半額 XP）？還是保持現狀（玩家自選）？
5. **(QA Analyst + T-D3)** QA 需要 `window.__ggs_dumpDrops?.()` 之類 telemetry 才能驗收 drop rate。是否要 dev-only console command 或 dashboard panel 顯示「本場 heart / chest / orb 累積」？

---

## Acceptance Scenarios（Spec 文件化品質指標）

- [ ] 完整列出 11 種敵人 heart / chest 機率（已含本檔表格）
- [ ] 完整列出 XP orb 3 層 tier 數值 + 時間 bonus 邏輯
- [ ] 完整列出 ambient + rescue heart 計時器規則
- [ ] META 4 條 upgrade track + 3 張 drop-related upgrade card 對照
- [ ] 與 spawn-pool.md / level-progression.md / combat-loop.md cross-reference
- [ ] 5 條 OPEN questions 各指名 owner（Balance Architect / Combat Designer / Systems Designer / Volt TA / QA Analyst）

---

## Changelog

- 2026-05-19 tick #16 後跑出本 spec：documentation-only，無 code change（Cowork loop tick #17 by Claude）

## Related Specs

- `systems/spawn-pool.md` — 提供敵人權重 / unlock / xpTier baseline，跟本檔接 `EnemyTypes.ts` 同一張表
- `systems/level-progression.md` — XP orb 收完後升等 + 卡池
- `systems/combat-loop.md` — 殺→撿→升→抽→撐 的「撿」+「升」段
- `systems/vfx-system.md` — death burst 紅光 + chest emissive 視覺
- `systems/audio-system.md` — SFX bank: heartPickup / chestOpen / pickup 三個 channel
- `enemies/*.md` — 個別敵人 owner brief，跟本檔的機率表保持同步
- `roles/design/balance-architect.md` — heart/chest 機率調整的最終 owner
- `roles/design/combat-designer.md` — chest 通知 / orb expiry 設計拍板
- `roles/programming/volt-ta.md` — 256 orb cap + magnet 物理 perf 命線

## Owner

- Primary: Systems Designer (T-D1) — spec 主筆，整合 3 條線
- Co-owner: Balance Architect (T-D2) — 數值最終拍板
- Co-owner: Combat Designer (T-D3) — pickup 手感 / 通知 / 視覺擁擠權衡
- Reviewer: Volt TA — 256 orb cap + magnet 物理 perf 命線
- Reviewer: QA Analyst — drop telemetry / dev tool hook
