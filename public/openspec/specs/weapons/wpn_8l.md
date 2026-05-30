# Weapon: 長筒狙擊 (wpn_8l)

## Purpose
極限高傷、極低射速、極遠射程的「Sniper」副武器。獎勵走位 + 預判，與群戰武器形成對比。

## Data (源頭：src/data/weapons.json)

| 欄位 | 值 |
|---|---|
| damageMul | 3.0 |
| fireRate | 0.75/s（約 1.33 秒一發） |
| range | 30m（最遠） |
| bulletColor | [0.7, 0.45, 1.0] 紫 |
| bulletSize | 1.25 |
| asset | `/assets/arms/8_l.glb` |

## Requirements

### Requirement: Sniper Profile
此武器 SHALL 以 0.75 發/秒射速、30m 射程、3.0× base 傷害發射紫色子彈。

#### Scenario: 遠距離擊殺 caster
- WHEN caster (85 HP) 在 17m 距離
- THEN 一發 90 傷害秒殺 caster

#### Scenario: 命中 miniboss
- WHEN miniboss (900 HP) 在範圍內
- THEN 一發造成 90 傷害（約 10 發擊殺），鼓勵走位輸出

### Requirement: Penetration (Future)
此武器 MAY 在未來支援穿透多隻敵人（current: 單一目標）。

## Visual Identity (PROPOSAL — pending CAO Raven 簽字)

| 維度 | 設計 |
|---|---|
| Silhouette | 長筒 + 槍托 + 瞄具突起（明顯狙擊輪廓），與其他副武器在 silhouette 一眼可分 |
| Bullet color | `[0.7, 0.45, 1.0]` 紫 — 冷紫；與 shock_baton 電光白心紫 `[0.80, 0.75, 1.0]` 刻意 hue 分流（8L 偏冷紫、shock 偏白心） |
| Muzzle flash | 紫白 12 粒 burst + 1 PointLight (intensity 1.5, 0.12s) — 全武器最強反差 |
| Impact spark | 紫 12 粒 + 0.4m 地面 crack decal (SpriteMaterial, 0.6s) — 最重的命中感 |
| Trail | **標誌性 tracer**：LineBasicMaterial, 30m 全長，0.18s 殘留 — 玩家看到「紫色長條 tracer」即知道是 8L 在射 |
| Motion cue | 無微抖；tracer 是視覺主角 |
| Readability target | 「紫色 + 大子彈 + 慢 + 30m 紫條 tracer」=「狙擊一發」全場可辨（含遠處隊友視角） |
| Performance budget | 0.75/s × (12 + 12 + 1 light + 1 tracer + 1 decal) = ~20 粒/s + 1 light + 1 line + 1 sprite，預算寬裕（射速低） |

⚠️ 與 wpn_shock_baton 紫白分流是 VFX-01 brief 的硬指標，CAO Raven 必須裁決：
- 方案 A（推薦）：8L 維持 `[0.7, 0.45, 1.0]` 冷紫；shock_baton 維持 `[0.80, 0.75, 1.0]` 白心紫 — hue 距離夠
- 方案 B：8L 改更冷藍 `[0.55, 0.4, 1.0]` 加大距離
- 方案 C：shock_baton 改另一色（會與 outbox 1530 決策衝突，**不推**）

## Related Specs
- `systems/combat-loop.md`
- `weapons/wpn_basegun_d.md`（次極端高傷）
- `weapons/wpn_shock_baton.md`（紫色衝突檢查）
- `systems/performance-budgets.md`（PointLight 配額）

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2)
- Art: CAO Raven (T-A0 色彩簽字 — **必須裁決紫色衝突**) + 3D Specialist (T-A2 silhouette)
- VFX: VFX Artist (T-A4) + Volt TA (T-P5 預算)

## Changelog
- 2026-05-13: Migrated to data
- 2026-05-19: 文件化
- 2026-05-20 tick #19: 補 `## Visual Identity` 段（PROPOSAL，3 方案請 CAO Raven 對 8L vs shock_baton 紫色衝突裁決，預設 A）
