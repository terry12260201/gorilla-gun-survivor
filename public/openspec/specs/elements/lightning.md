# Element: Lightning (雷擊)

## Purpose
連鎖傷害元素 — 命中後跳到鄰近敵人。鼓勵「貼地引一群」build，與毒霧（站位）形成對比。

## Data (源頭：src/weapon/Elements.ts)

| 屬性 | 值 |
|---|---|
| icon | ⚡ |
| color | [0.85, 0.7, 1.0] |
| tier 1 | 連鎖 2 隻、每隻 12 傷 |
| tier 2 | 連鎖 3 隻、每隻 20 傷 |
| tier 3 | 連鎖 5 隻、每隻 30 傷 |

## Requirements

### Requirement: Chain On Hit
玩家擁有 Lightning 附魔時，每次命中 SHALL 觸發 `LightningSystem.chain()`，從命中點跳至 chainTargets 個鄰近敵人，每隻造成 chainDamage 傷害。

#### Scenario: Lightning tier 2 命中目標 A
- WHEN 玩家持 Lightning tier 2，命中目標 A
- THEN A 受到副武器本身傷害
- AND 系統找最近 3 隻敵人 B、C、D
- AND 每隻受 20 傷害，並繪製弧線

### Requirement: Stack With Shock Baton's Intrinsic Chain
此元素 SHALL 與 `wpn_shock_baton` 的內建 1 跳鏈電**疊加**，**不取代**。

#### Scenario: Shock Baton + Lightning tier 2
- WHEN 玩家持電弧短杖 + Lightning tier 2，命中 A
- THEN 內建 1 跳鏈電：A → B 受 30% 子彈傷
- AND 附魔 3 跳鏈電：A → 3 隻最近敵人，各 20 傷
- AND 視覺上看到「總計 4 條弧線」

### Requirement: Performance Cap
全場 `LightningSystem.arcs` 同時數 ≥ 30 時 SHALL early-return 後續 chain 呼叫。

## Synergies

- 與 `wpn_shock_baton`：唯一可疊加內建 + 附魔的武器
- 對成群敵人特別有用

## Related Specs
- `weapons/wpn_shock_baton.md`
- `systems/vfx-system.md`
- `systems/combat-loop.md`

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2)
- VFX: VFX Artist (T-A4)

## Changelog
- 2026-05-13: Initial data
- 2026-05-19: 文件化 + 標記與 shock baton 疊加邏輯
