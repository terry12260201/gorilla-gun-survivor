# Weapon: 電弧短杖 (wpn_shock_baton)

## Purpose
中近距離、內建電屬性的「電擊」副武器。本武器主打「拿到就有電感」 — 不靠雷擊附魔也能有 1 跳鏈電 + 電光視覺，並可與雷擊附魔疊加成最強鏈電 build。

## Data (源頭：src/data/weapons.json，verify-on-Windows pending)

| 欄位 | 值 |
|---|---|
| damageMul | 0.65 |
| fireRate | 4.2/s |
| range | 13m |
| bulletColor | [0.80, 0.75, 1.0] 電光白心紫（從 [0.65, 0.45, 1.0] 改） |
| bulletSize | 0.8 |
| signatureVFX | "electric" |
| asset | `/assets/custom/shock_baton_v2.glb`（v3 待 GPT Image 2 重做） |

## Requirements

### Requirement: Intrinsic Electric Bullet Visual
此武器 SHALL 在發射時呈現飽和電光紫白色子彈，並每幀 ±5% scale + ±3% emissive 微抖，模擬電流不穩。

#### Scenario: 玩家選到電弧短杖
- WHEN 玩家從升級卡選到 `wpn_shock_baton`
- THEN 子彈視覺與其他武器明顯不同（飽和度高、有微抖、白心紫光）
- AND 不需任何附魔即生效

### Requirement: Intrinsic 1-Hop Chain Lightning On Hit
此武器 SHALL 在每次命中時自動觸發 1 跳鏈電到 4m 內最近的另一隻敵人，造成本擊傷害 30%，呼叫既有 `LightningSystem.chain()`。

#### Scenario: 沒有雷擊附魔
- WHEN 命中目標 A，4m 內有目標 B
- THEN 目標 B 受到 30% × 本擊傷害並出現電弧
- AND 粒子預算：1 條 LineBasicMaterial + 1 點 PointLight = 瞬時，不影響 200 粒子上限

#### Scenario: 4m 內無其他敵人
- WHEN 命中目標 A，4m 內沒有其他敵人
- THEN 不觸發鏈電（不顯示空弧）

### Requirement: Stack With Lightning Element
此武器 SHALL 在玩家擁有雷擊附魔時，內建鏈電與附魔鏈電**疊加觸發**，不取代。

#### Scenario: 玩家持電弧短杖 + 雷擊 tier 2（3 跳）
- WHEN 命中目標 A
- THEN 內建 1 跳鏈電觸發（目標 B 受 30% 傷害）
- AND 附魔 3 跳鏈電獨立觸發（B/C/D 各受 20 傷害）
- AND 視覺上看到「總計 4 條弧線」

### Requirement: Electric Blue-White Spark On Hit
此武器 SHALL 在命中時呼叫 `ImpactSparksSystem.burst()` 並傳入 [0.75, 0.85, 1.0] 電光藍白色、6 粒子。

### Requirement: Performance Cap
此武器的內建鏈電 SHALL 在場上同時 LightningSystem.arcs 數 ≥ 30 時 early-return，避免高射速 × 多敵人造成爆炸。

## Visual Identity (PROPOSAL — pending CAO Raven 簽字；與 VFX-01 brief 對齊)

| 維度 | 設計 |
|---|---|
| Silhouette | 短杖 + 雙叉電極頭 + Tesla coil 螺旋纏繞（電屬性視覺語言，非槍械） |
| Bullet color | `[0.80, 0.75, 1.0]` 電光白心紫（VFX-01 Slice 2 改定）— 與 8L `[0.7, 0.45, 1.0]` 冷紫 hue 分流 |
| Muzzle flash | 白心紫 6 粒 + 雷電拼花 LineBasicMaterial 2-fork (0.05s) — 「電不穩」啟動 |
| Impact spark | 電光藍白 `[0.75, 0.85, 1.0]` 6 粒（per shock-baton-arc brief） |
| Trail | 無 trail；改用「子彈本身發光 + 微抖」傳達電屬性 |
| Motion cue | **子彈每幀 ±5% scale + ±3% emissive 微抖** — 全武器唯一微抖，是電屬性標誌 |
| 內建特效 | 命中時 1 跳鏈電（LightningSystem.chain(), 4m, 30% 傷害）+ PointLight 0.05s 瞬閃 |
| Readability target | 「白心紫子彈 + 微抖 + 命中跳弧」=「電弧短杖」一眼可辨；與 5L2 青、8L 冷紫均有分流 |
| Performance budget | 4.2/s × (6 muzzle + 6 impact + 1 chain line + 1 light) = ~50 粒/s + 4.2 line/s + 4.2 light/s — 預算需 Volt TA 確認 |

⚠️ 與 8L 紫色衝突的差異化策略（CAO 必裁）：
- 本武器：白心紫 + 微抖 + 跳弧
- 8L：冷紫 + 大子彈 + 30m tracer + 慢
- 即使 hue 相近，動作（微抖 vs tracer）與密度（4.2/s vs 0.75/s）已足夠區分

⚠️ Performance Cap（已寫入本 spec Requirement）：場上 LightningSystem.arcs ≥ 30 時 early-return

## Related Specs
- `elements/lightning.md`（疊加邏輯）
- `systems/vfx-system.md`（粒子預算）
- `systems/combat-loop.md`（命中判定鉤子）
- `weapons/wpn_8l.md`（紫色衝突檢查）

## Linked Briefs
- `art/vfx-briefs/shock-baton-arc.md`（VFX 設計細節）
- `art/model-briefs/shock-baton-v3.md`（模型 v3，待 ART-01 完成）

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩 + 紫色衝突仲裁) + 3D Specialist (T-A2 Tesla coil silhouette)
- VFX: VFX Artist (T-A4) + Volt TA (T-P5 預算審)

## Changelog
- 2026-05-18: Initial blockout, color [0.65, 0.45, 1.0]
- 2026-05-19: VFX-01 brief — 改用內建電屬性 + 1 跳鏈電
- 2026-05-19 Slice 2: bulletColor 改 [0.80, 0.75, 1.0]、加 signatureVFX:"electric"（verify-on-Windows pending）
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，與 VFX-01 brief 對齊；含 vs 8L 紫色差異化策略）
