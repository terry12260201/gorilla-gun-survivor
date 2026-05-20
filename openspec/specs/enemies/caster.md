# Enemy: Caster (caster)

## Purpose
更高 HP、更慢、更遠射程、更高傷害的「資深遠程」。55 秒後加入，與 ranged 形成階層。

## Data

| 欄位 | 值 |
|---|---|
| hp | 85 |
| speed | 1.0 |
| touchDamage | 0 |
| radius | 0.55 |
| ranged.cooldown | 3.2s（較慢） |
| ranged.fireRange | 17m（較遠） |
| ranged.keepDistance | 11m |
| ranged.projectileSpeed | 10（較慢但避免不掉） |
| ranged.projectileDamage | 14（最高） |
| ranged.projectileColor | [1.0, 0.45, 0.05] 橘 |
| ranged.projectileSize | 1.3（較大） |
| unlockAt | 55s |
| xpTier | 2 |
| asset | `/assets/monster/enemy_e_03.glb` |

## Requirements

### Requirement: Heavier Spell Profile
此敵人 SHALL 以更慢的射速（3.2s）發射更大、更慢、更高傷害（14）的橘色魔法彈。

### Requirement: Tier 2 XP
此敵人 SHALL 死亡時掉落 tier 2 XP orb（更高經驗值）。

## Related Specs
- `enemies/ranged.md`（前置）
- `systems/level-progression.md`

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2) — 沿用 ranged AI（不同 stats）
- Art: 3D Specialist (T-A2) — `/assets/monster/enemy_e_03.glb` 既有資產維護；CAO Raven (T-A0) 橘魔法彈 [1.0, 0.45, 0.05] size 1.3 大彈體可讀性審查（避免和 plasma_bomber AoE 警告混淆）
- Audio: SFX Designer (T-S3) — caster 詠唱前搖 / 橘魔法發射 / 較長飛行音（與 ranged 紫光區隔）
- QA: QA Analyst (T-Q1) — 55s unlock + 3.2s cooldown + projectileSpeed 10 是否「慢但避無可避」，14 傷害是否致命比例正確

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Art / Audio / QA owners（loop Doc-Only Backlog #7）
