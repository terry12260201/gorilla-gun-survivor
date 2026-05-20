# System: VFX System（視覺效果系統）

## Purpose
定義所有粒子、特效、發光元素的預算與管控。Volt TA 擁有此 spec 的否決權。

## Subsystems (源頭：src/fx/)

| 模組 | 用途 |
|---|---|
| `CameraShake.ts` | 鏡頭震動（爆炸 / 命中） |
| `DeathBurst.ts` | 敵人死亡時的爆裂特效 |
| `ExplosionRing.ts` | 爆炸環視效（bomber） |
| `ImpactSparks.ts` | 命中 spark 系統（帶色） |
| `LightningSystem.ts` | 鏈電 + 直擊 + 風暴 |
| `MuzzleFlash.ts` | 武器槍口閃光 |
| `PoisonCloud.ts` | 毒雲（範圍 DOT 可視化） |

## Requirements

### Requirement: Total Particle Budget
**全場同時粒子總數 SHALL ≤ 200**。這是 Volt TA 的硬指標、不容妥協。

#### Scenario: 高射速武器 + 群戰
- WHEN wpn_5l2 (6.5 發/秒) × 30 隻敵人 + lightning chain × 5 + impact spark × 6/hit
- THEN 系統 SHALL 在達上限時 early-return 後續粒子生成
- AND 優先保留：玩家命中回饋 > 鏈電 > 死亡爆裂

### Requirement: Lightning Arc Cap (Hard Eviction)
場上同時 `LightningSystem.arcs` 數 SHALL ≤ **30**。實作：

- `chain()` 在 push 新弧前檢查；如已達上限 → 驅逐最舊弧（`arcs.shift()`），並 `dispose()` 其 geometry + material
- **重要**：傷害已在 push 前計算並 apply，所以驅逐只影響視覺、不影響遊戲邏輯
- 玩家體感：新命中保證有弧、最舊弧被截斷飛太快看不出來
- 詳見 `src/weapon/LightningSystem.ts` `MAX_ARCS` 常數

#### Scenario: shock_baton 4.2/s + Lightning t3 + chain_arc × 4 同時觸發
- WHEN 在 1 秒內觸發 32 次 chain 呼叫
- THEN 前 30 次的弧顯示，31/32 次的新弧 push 前會驅逐 30/31 號舊弧
- AND 玩家看到「永遠最多 30 條弧」、不會 draw call 爆炸

### Requirement: Lightning Strike Cap (Hard Drop)
場上同時 `LightningSystem.strikes` 數 SHALL ≤ **20**。實作：

- `strike()` 在 push 前檢查；如已達上限 → **early-return**（不 push，**新 strike 完全捨棄**）
- 與 chain 不同：strike 有 delayed damage，驅逐 mid-flash 會丟失傷害 → 不適合 eviction，改為 drop new
- 詳見 `src/weapon/LightningSystem.ts` `MAX_STRIKES` 常數

#### Scenario: lightning_storm × 5（共產生 25 次 strike() 呼叫）+ lightning_strike × 3 同時觸發
- WHEN 場上已有 20 次 strikes，新增 8 次 storm strike + 3 次 strike() 呼叫
- THEN 全部新呼叫直接 early-return，不增加 strikes 列表
- AND 玩家損失 11 次落雷，但 FPS 不受影響

### Requirement: GPU Memory Discipline
所有 LightningSystem 的 `THREE.Line` / `THREE.Mesh` 在生命結束時 SHALL：
1. `scene.remove()`
2. `geometry.dispose()`
3. `material.dispose()`

避免 GPU 記憶體洩漏。 詳見 `update()` 內 lifetime cleanup。

### Requirement: Death Burst Reuse
所有敵人死亡 SHALL 重用 `DeathBurst` 系統（不為每隻敵人建立獨立發射器）。

### Requirement: Color Differentiation Rule
不同武器/元素的子彈與特效色彩 SHALL 容易區分（CAO Raven 審核）：
- 黃 → wpn_basegun_b（一般）
- 白 → wpn_basegun_c（手槍）
- 紅 → wpn_basegun_d（重砲）
- 青 → wpn_5l2（連發）
- 紫 → wpn_8l（狙擊）
- 橘 → wpn_flamethrower / Fire 元素
- 綠 → wpn_explosivecrossbow / Poison 元素
- 電光白心紫 → wpn_shock_baton / Lightning 元素
- 淡藍 → Ice 元素

色彩衝突 → 寫 inbox 給 CAO 仲裁。

### Requirement: Performance Profiling
每次新增 VFX 系統 SHALL 通過 Volt TA profiling，產出 `performance/profiles/vfx-<feature>.md`。

## Related Specs
- `systems/performance-budgets.md`
- 所有 `weapons/*.md` 與 `elements/*.md`

## Owner
- Spec: VFX Artist (T-A4)
- Authority: Volt TA (T-P5) — 預算否決權
- Color: CAO Raven (T-A0)

## Changelog
- 2026-05-19: Initial documented
