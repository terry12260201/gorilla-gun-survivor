# Card: 雷霆 II · 雷暴 (lightning_storm)

## Purpose
命中時 15% 機率召喚 5 道連續落雷風暴。Rare rarity，雷霆 build 進階。

## Data (源頭：`src/progression/UpgradeCards.ts` line 123-128)

| 欄位 | 值 |
|---|---|
| id | lightning_storm |
| rarity | rare |
| weight | 0.35 |
| unique | false |
| effect | `g.lightningStormChance += 0.15` |

## Requirements

### Requirement: 15% Storm Chance Per Hit
此卡 SHALL 將 `g.lightningStormChance` 加 0.15。

#### Scenario: 玩家抽到 1 次
- WHEN 子彈命中敵人
- THEN 15% 機率觸發 `LightningSystem.storm(pos, 5, 0.7, 3.2, 22)`
- AND 5 道雷以 0.7s 間隔 stagger 連續落下
- AND 每道 3.2m radius、22 damage

### Requirement: Stackable
可疊加。

### Requirement: Performance Critical
storm 一次產生 5 strikes → 高射速時可能瞬間爆 LightningSystem 上限。Volt 必須監控 arcs / strikes 總數。

## Related Specs
- `cards/lightning_strike.md`（前置 baseline）
- `cards/chain_arc.md`（並行系統）
- `systems/vfx-system.md`

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/LightningSystem.ts`
- Balance: Balance Architect + Volt TA

## Changelog
- 2026-05-19: Reverse-engineered from code
