# Card: 雷霆 I (lightning_strike)

## Purpose
命中時 20% 機率召喚單道雷擊。Rare rarity，跟 Lightning 元素附魔不同（這是「武器命中觸發」，非「元素附魔附加」）。

## Data (源頭：`src/progression/UpgradeCards.ts` line 116-121)

| 欄位 | 值 |
|---|---|
| id | lightning_strike |
| rarity | rare |
| weight | 0.35 |
| unique | false（可疊加） |
| effect | `g.lightningChance += 0.2` |

## Requirements

### Requirement: 20% Strike Chance Per Hit
此卡 SHALL 將 `g.lightningChance` 加 0.2。

#### Scenario: 玩家抽到 1 次
- WHEN 子彈命中敵人
- THEN 20% 機率觸發 `LightningSystem.strike()`（單道直擊雷）

### Requirement: Stackable Up To 1.0
可疊加，第 5 次達 100%（必觸發）。**注意效能**：100% × 高射速可能爆 LightningSystem.arcs 上限 → Volt 監控。

### Requirement: Independent From Lightning Element
此卡 SHALL NOT 取代 Lightning element 附魔。如果玩家同時有 Lightning element，兩者**獨立判定**。

## Related Specs
- `cards/lightning_storm.md`（高階）
- `cards/chain_arc.md`（鏈電）
- `elements/lightning.md`
- `systems/vfx-system.md`（粒子預算）

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/LightningSystem.ts`
- Balance: Balance Architect + Volt TA（效能）

## Changelog
- 2026-05-19: Reverse-engineered from code
