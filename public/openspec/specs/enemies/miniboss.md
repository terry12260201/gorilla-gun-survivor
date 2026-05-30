# Enemy: Miniboss (miniboss)

## Purpose
120 秒觸發的「milestone boss」。讓玩家有個「我活過第二分鐘」的成就點，並重置壓力曲線（殺完後爆 XP / heart / chest）。

## Data

| 欄位 | 值 |
|---|---|
| hp | 900（最高） |
| speed | 1.7 |
| touchDamage | 28（最高） |
| radius | 1.4 |
| height | 3.6m（最高） |
| weight | 0.08（低，但 unlockAt 觸發） |
| unlockAt | 120s |
| boss | true |
| xpTier / xpCount | 3 / 3 顆 |
| heartDropChance | 50% |
| chestDropChance | 25% |

## Requirements

### Requirement: Boss Flag Behavior
此敵人 SHALL 帶 `boss: true`，spawn 邏輯 SHALL 限制同時 ≤ 1 隻。

### Requirement: Milestone Spawn At 120s
此敵人 SHALL 在遊戲時間 120 秒（2 分鐘）觸發第一隻 spawn。

### Requirement: High-Value Drops
此敵人 SHALL 死亡時：
- 掉 3 顆 tier 3 XP orb
- 50% 機率掉 heart
- 25% 機率掉 chest

#### Scenario: 玩家擊殺第一隻 miniboss
- WHEN miniboss 死亡
- THEN 玩家獲得 3 顆高階 XP（通常足以升 1-2 等）
- AND 高機率回血 + 解鎖更多 build 選擇

## Related Specs
- `systems/level-progression.md`
- `enemies/brute.md`（次階）

## Owner
- Spec: Systems Designer (T-D1) + Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2) — boss flag + 同場 ≤ 1 限制 + 120s unlockAt 觸發
- Art: 3D Specialist (T-A2) — miniboss 3.6m 模型製作（pending — 目前可能仍 placeholder）；CAO Raven (T-A0) 「milestone boss」剪影 + 史詩感色彩 + 血條 UI 一致性
- Audio: SFX Designer (T-S3) + Music Composer (T-S2) — 入場 stinger（120s milestone moment）/ boss-roar / 死亡 stinger + 戰勝小段 BGM 變奏
- QA: QA Analyst (T-Q1) — 120s 觸發精準度 + 50%/25% drop 高機率正確 + boss 同場上限 1 隻邏輯回歸

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Code / Art / Audio / QA owners（loop Doc-Only Backlog #7）
