# Enemy: Heavy (heavy)

## Purpose
高 HP、低速、高接觸傷害的「沙包式威脅」。50 秒後加入，逼玩家不能只圍著一個目標打。

## Data

| 欄位 | 值 |
|---|---|
| hp | 130（× 3 grunt） |
| speed | 1.5（緩慢） |
| touchDamage | 10（× 2 grunt） |
| radius | 0.8 |
| height | 1.8m |
| weight | 0.4 |
| unlockAt | 50s |
| xpCount | 2 顆 |
| heartDropChance | 5% |
| chestDropChance | 2% |
| asset | `/assets/monster/enemy_c_03.glb` |

## Requirements

### Requirement: High HP Threat
此敵人 SHALL 以 130 HP 作為「需要持續輸出 2-4 秒才能擊殺」的中等沙包。

### Requirement: High Contact Damage
此敵人 SHALL 接觸時造成 10 傷害（× difficulty），鼓勵玩家保持距離。

### Requirement: Better Drops
此敵人 SHALL 死亡時掉 2 顆 tier 1 XP orb，並有更高 heart/chest 掉落率。

## Related Specs
- `enemies/brute.md`（更高階版本）

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2) — 通用 chase AI（緩慢變體）
- Art: 3D Specialist (T-A2) — `/assets/monster/enemy_c_03.glb` 既有資產維護；CAO Raven (T-A0) 1.8m 高 + 高 HP「沙包感」剪影審查（必須一眼辨識「打不動」）
- Audio: SFX Designer (T-S3) — heavy 緩慢沉重腳步 / 高血量被擊中悶聲 / 死亡爆裂（與 brute 區隔）
- QA: QA Analyst (T-Q1) — 50s unlock + 130 HP 是否需「持續輸出 2-4 秒」對應武器 DPS 目標

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Art / Audio / QA owners（loop Doc-Only Backlog #7）
