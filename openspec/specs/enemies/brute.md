# Enemy: Brute (brute)

## Purpose
最高 HP 非 boss 敵人（200 HP）。80 秒後加入，作為「需要組好 build 才能順處理」的壓力源。

## Data

| 欄位 | 值 |
|---|---|
| hp | 200（最高非 boss） |
| speed | 1.3 |
| touchDamage | 12 |
| radius | 0.9 |
| height | 2.2m（最高非 boss） |
| weight | 0.3 |
| unlockAt | 80s |
| xpTier / xpCount | 2 / 2 |
| heartDropChance | 5% |
| chestDropChance | 3% |
| asset | `/assets/monster/enemy_f_01.glb` |

## Requirements

### Requirement: Sub-Boss Tank
此敵人 SHALL 以 200 HP + 12 touchDamage 作為次於 miniboss 的最高威脅單位。

### Requirement: Limited Concurrent Count
此敵人 SHALL 限制同時場上數量（具體上限待 SystemsDesigner 簽核），避免太多 brute 同時出現玩家無解。

#### Scenario: 場上已有 3 隻 brute
- WHEN spawn 邏輯抽到 brute
- THEN（待實作）改抽其他類型

## Related Specs
- `enemies/heavy.md`（前置）
- `enemies/miniboss.md`（更高階）

## Owner
- Spec: Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2) — 通用 chase AI + 同場上限邏輯（pending Systems Designer 簽核）
- Art: 3D Specialist (T-A2) — `/assets/monster/enemy_f_01.glb` 既有資產維護；CAO Raven (T-A0) 2.2m「次於 boss 最高」剪影 + 紅光警示一致性審查
- Audio: SFX Designer (T-S3) — brute 沉重腳步（與 heavy 區隔）/ 高血扛擊聲 / 死亡爆裂大聲
- QA: QA Analyst (T-Q1) — 80s unlock + 200 HP 圍殺策略 + 是否需要「同場 ≤ 3 隻」cap 驗證

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化 + 標記「同時上限」未實作
- 2026-05-19 tick #18: 補完 Owner 段 Art / Audio / QA owners（loop Doc-Only Backlog #7）
