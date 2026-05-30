# Enemy: Scout (scout)

## Purpose
中速中血，介於 grunt 與 fast 之間的「填空型」敵人。30 秒後加入，讓 spawn pool 更豐富。

## Data

| 欄位 | 值 |
|---|---|
| hp | 38 |
| speed | 2.8 |
| touchDamage | 5 |
| radius | 0.5 |
| height | 1.3m |
| weight | 0.7 |
| unlockAt | 30s |
| asset | `/assets/monster/enemy_c_02.glb` |

## Requirements

### Requirement: Mid-Range Stats
此敵人的所有屬性 SHALL 介於 grunt 與 fast 之間，作為 30s+ 的填空 spawn pool 多樣性。

### Requirement: Unlock At 30s
此敵人 SHALL 在 ≥ 30s 才 spawnable。

## Related Specs
- `enemies/grunt.md`
- `enemies/fast.md`

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2) — 通用 chase AI
- Art: 3D Specialist (T-A2) — `/assets/monster/enemy_c_02.glb` 既有資產維護；CAO Raven (T-A0) 與 grunt / fast 三者之間中間填空型剪影差異審查
- Audio: SFX Designer (T-S3) — scout 與 grunt 共用 basic melee 音池（避免 30s+ 後音場擁擠）
- QA: QA Analyst (T-Q1) — 30s unlock + 中間值 spawn pool 多樣性驗證

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Art / Audio / QA owners（loop Doc-Only Backlog #7）
