# Enemy: Rusher (rusher)

## Purpose
偵測到玩家就「衝刺攻擊」的特殊行為敵人。引入新的威脅向量 — 高接觸傷害 + 直線衝刺 = 玩家必須側閃。

## Data

| 欄位 | 值 |
|---|---|
| hp | 55 |
| speed | 2.2（巡邏） |
| touchDamage | 15（高） |
| radius | 0.55 |
| height | 1.4m |
| rusher.detectRange | 12m |
| rusher.rushSpeed | 6.5（衝刺時最快） |
| rusher.lockDirection | false（追蹤型） |
| weight | 0.6 |
| unlockAt | 25s |
| placeholder | cone, color 0xcc2222（紅）, emissive 0x440000 |

## Requirements

### Requirement: Detect-Trigger Rush
此敵人 SHALL 在玩家進入 detectRange (12m) 時切換為 rush 狀態，以 rushSpeed (6.5) 移動。

#### Scenario: 玩家從 15m 接近
- WHEN 玩家距離 ≤ 12m
- THEN rusher 進入衝刺模式
- AND 速度從 2.2 跳到 6.5

### Requirement: Tracking Rush (not Ballistic)
此敵人的衝刺 SHALL 持續追蹤玩家（lockDirection = false）。

### Requirement: Placeholder Visual
此敵人**目前無 GLB 模型**，使用紅色 cone placeholder（color 0xcc2222、emissive 0x440000）。

- **規劃**：3D Specialist + Concept Artist 為 rusher 設計正式模型

## Related Specs
- `enemies/grunt.md`（行為對照）
- `systems/combat-loop.md`

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2) — detect-trigger rush 狀態機 + tracking rush（非 ballistic）
- Art: 3D Specialist (T-A2)（pending — 目前紅 cone placeholder 0xcc2222 / emissive 0x440000）+ Concept Artist (T-A1)（pending — 設計衝刺型怪物造型）；CAO Raven (T-A0) 紅光警示與 plasma_bomber 紅警示色彩衝突審查（避免兩種紅都觸發「自爆危險」誤判）
- Audio: SFX Designer (T-S3) — rush 進入狀態前搖 / 衝刺加速音 / 命中重擊（與 fast 區隔：更暴力）
- QA: QA Analyst (T-Q1) — 25s unlock + detectRange 12m + rushSpeed 6.5 是否強迫玩家側閃（不能直線後退）

## Changelog
- 2026-05-13: Initial data with placeholder
- 2026-05-19: 文件化 + 標記正式模型 pending
- 2026-05-19 tick #18: 補完 Owner 段 Code / Art / Audio / QA owners（loop Doc-Only Backlog #7）
