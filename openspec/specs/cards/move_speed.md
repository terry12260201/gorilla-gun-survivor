# Card: 靈敏爪掌 (move_speed)

## Purpose
玩家移動速度強化。Common rarity，閃避 build 與「kite」build 必選。

## Data (源頭：`src/progression/UpgradeCards.ts` line 44-49)

| 欄位 | 值 |
|---|---|
| id | move_speed |
| rarity | common |
| weight | 1.0 |
| unique | false |
| effect | `g.player.moveSpeed += 1.2` (flat m/s) |

## Requirements

### Requirement: Flat Player Move Speed +1.2 m/s
此卡 SHALL 將 `player.moveSpeed` 加 1.2 m/s。

#### Scenario: 玩家 base speed ~5 m/s
- WHEN 選此卡 1 次
- THEN player.moveSpeed 變 ~6.2 m/s
- AND 玩家可以擺脫 `fast` 敵人 (3.5 速度)

### Requirement: Diminishing Weight + Hard Cap at 6（2026-05-19 Terry 拍板 OPEN-1）

此卡 SHALL 依玩家已抽次數調整 weight，並在第 6 次後完全過濾：

| 已抽次數 | weight | 行為 |
|---:|---:|---|
| 0 | 0.85 | baseline（略低於其他 common 的 1.0） |
| 1-3 | 0.85 | 不變（鼓勵堆 3 次） |
| 4-5 | 0.20 | tapered（仍可抽，但機率明顯下降） |
| 6+ | 0（過濾） | canPick = false，卡池不顯示 |

實作見 `src/progression/UpgradeCards.ts` `move_speed` 的 `canPick` + `getWeight` 雙重防線。

#### Scenario: 玩家已抽 4 次 move_speed
- WHEN 升等抽卡
- THEN 此卡仍在 eligible 池，但 weight 0.20（vs 其他 common 1.0）
- AND 出現機率約 1/5 of baseline

#### Scenario: 玩家已抽 6 次
- WHEN 升等抽卡
- THEN canPick 回 false → 此卡完全不出現
- AND 玩家當前 moveSpeed ≈ base + 7.2 m/s（已接近 fast 敵人 3.5 速度的 3 倍）

## Related Specs
- `enemies/fast.md`（速度對照）
- `systems/combat-loop.md`

## Owner
- Code: `src/progression/UpgradeCards.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
- 2026-05-19 (Terry decision): ~~OPEN: 上限~~ ✅ **已解** — 採 (b) 方案：weight 0.85（1-3 次）→ 0.20（4-5 次）→ 0（6+ 次過濾）。Code 已加 `canPick` + `getWeight` 雙重防線。Pickle 引擎 `pickThree` 加 `getWeight` callback 支援（per-card override RARITY_WEIGHT）。
