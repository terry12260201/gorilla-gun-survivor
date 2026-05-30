# Enemy: Fast (fast)

## Purpose
高速、低 HP 的「閃避測試」敵人。15 秒後解鎖，逼玩家在熟悉 grunt 後學會走位與面向。

## Data (源頭：src/enemy/EnemyTypes.ts)

| 欄位 | 值 |
|---|---|
| hp | 32 |
| speed | 3.5（最高之一） |
| touchDamage | 4 |
| radius | 0.45 |
| height | 1.2m |
| weight | 0.8 |
| unlockAt | 15s |
| xpTier / xpCount | 1 / 1 |
| asset | `/assets/monster/enemy_c_01.glb` |

## Requirements

### Requirement: Higher Speed Than Player
此敵人 SHALL 以 3.5 速度移動（高於玩家走速）。

#### Scenario: 玩家試圖跑開
- WHEN 玩家直線後退
- THEN fast 在 3-4 秒內追上並接觸傷害

### Requirement: Spawnable From 15s
此敵人 SHALL 在遊戲時間 ≥ 15 秒才開始 spawn，避免太早讓新手挫敗。

## Related Specs
- `systems/level-progression.md`
- `enemies/grunt.md`（對照組）

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2) — sharing 通用 chase AI 與 grunt
- Art: 3D Specialist (T-A2) — `/assets/monster/enemy_c_01.glb` 既有資產維護；CAO Raven (T-A0) 高速剪影辨識度審查（與 grunt 的對比）
- Audio: SFX Designer (T-S3) — fast attack「快」步聲 / 死亡輕短音（避免和 grunt 混淆）
- QA: QA Analyst (T-Q1) — 15s unlock 觸發 + 速度超過玩家走速可閃避性驗證

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Art / Audio / QA owners（loop Doc-Only Backlog #7）
