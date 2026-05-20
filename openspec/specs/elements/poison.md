# Element: Poison (毒霧)

## Purpose
範圍持續傷害元素 — 命中處生成毒雲，雲內所有敵人持續掉血。鼓勵「站位 + 引怪進雲」build。

## Data (源頭：src/weapon/Elements.ts)

| 屬性 | 值 |
|---|---|
| icon | ☠️ |
| color | [0.4, 1.0, 0.3] |
| tier 1 | 3m 毒雲 × 5 DPS × 3 秒 |
| tier 2 | 4m 毒雲 × 10 DPS × 4 秒 |
| tier 3 | 5m 劇毒雲 × 18 DPS × 5 秒 |

## Requirements

### Requirement: Cloud Spawn On Hit
玩家擁有 Poison 附魔時，每次命中 SHALL 在命中位置生成毒雲：半徑 cloudRadius、持續 cloudDuration 秒、雲內所有敵人每秒受 cloudDps 傷害。

#### Scenario: 一群 grunt 走進毒雲
- WHEN 玩家持 Poison tier 2，命中後生成 4m 毒雲
- THEN 雲內每隻敵人每秒受 10 傷害
- AND 持續 4 秒（總可能 40 傷害/隻）

### Requirement: Use PoisonCloud System
此元素 SHALL 透過既有 `src/weapon/PoisonCloud.ts` 系統實作（不新增模組）。

### Requirement: Cloud Overlap
多個毒雲 MAY 重疊，但同一敵人在同一 tick **不會被多重 dps 計算**（避免疊到無限）。

## Synergies

- 與 `wpn_5l2` 高射速武器：每發都生成雲 → 範圍封鎖
- 與 `enemies/bomber.md`：毒雲剛好覆蓋 fuse 區可逼退

## Related Specs
- `systems/combat-loop.md`
- `systems/vfx-system.md`（毒雲粒子預算）

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2)

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化
