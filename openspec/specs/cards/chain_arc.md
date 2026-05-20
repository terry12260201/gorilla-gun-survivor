# Card: 閃電鞭 (chain_arc)

## Purpose
命中時 25% 機率觸發鏈電，連鎖 3 隻敵人。Rare rarity，雷霆 build 的「群戰版」。

## Data (源頭：`src/progression/UpgradeCards.ts` line 130-135)

| 欄位 | 值 |
|---|---|
| id | chain_arc |
| rarity | rare |
| weight | 0.35 |
| unique | false |
| effect | `g.chainArcChance += 0.25` |

## Requirements

### Requirement: 25% Chain Chance Per Hit
此卡 SHALL 將 `g.chainArcChance` 加 0.25。

#### Scenario: 玩家抽到 1 次
- WHEN 子彈命中敵人
- THEN 25% 機率觸發 `LightningSystem.chain(hitPos, [up to 3 nearby enemies])`
- AND 每隻受 15 damage（chain 預設）

### Requirement: Stackable
可疊加，每次 +25%。

### Requirement: Stacks With Shock Baton's Intrinsic + Lightning Element
此卡與下列效果**全部獨立觸發、可同時跳弧**：
- `wpn_shock_baton` 內建 1 跳鏈電（每次命中觸發）
- Lightning 元素附魔（每次命中觸發 2/3/5 跳）
- 本卡 25% 機率 3 跳

**極端組合**：shock_baton + Lightning tier 3 + chain_arc × 4（100%）= 每次命中保證 1 + 5 + 3 = 9 條弧線（×4 命中 → 36 弧）。**Volt 必須追蹤是否爆 30 弧上限**。

## Related Specs
- `weapons/wpn_shock_baton.md`（疊加邏輯）
- `elements/lightning.md`
- `cards/lightning_strike.md`、`cards/lightning_storm.md`
- `systems/vfx-system.md`

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/LightningSystem.ts`
- Balance: Combat Designer (T-D3) + Volt TA

## Changelog
- 2026-05-19: Reverse-engineered from code
