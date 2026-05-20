# Enemy: Plasma Bomber V1 (bomber)

## Purpose
近接自爆敵人 — 進入 fuseRange 後停止移動、倒數 1.2 秒後爆炸 AoE。引入「不能讓敵人靠近 + 必須在引信內擊殺」的新緊張感。

## Data

| 欄位 | 值 |
|---|---|
| hp | 40 |
| speed | 2.0 |
| touchDamage | 0（純自爆） |
| radius | 0.5 |
| height | 1.3m |
| bomber.fuseRange | 3m |
| bomber.fuseTime | 1.2s |
| bomber.aoeRadius | 3.5m |
| bomber.aoeDamage | 25 |
| bomber.moveDuringFuse | 0（引信中停止） |
| weight | 0.4 |
| unlockAt | 45s |
| xpTier / xpCount | 2 / 1 |
| asset | `/assets/custom/plasma_bomber_v1.glb` |

## Requirements

### Requirement: Fuse Behavior
此敵人 SHALL 在玩家距離 ≤ fuseRange (3m) 時：
1. 停止移動（moveDuringFuse = 0）
2. 開始倒數 fuseTime (1.2s)
3. 倒數結束爆炸：以本體為圓心、aoeRadius (3.5m) 內所有單位受 aoeDamage (25)

#### Scenario: 玩家進入 fuseRange
- WHEN bomber 距離玩家 = 3m
- THEN bomber 停下，開始 1.2 秒倒數，視覺顯示引信警告
- AND 玩家有 1.2 秒可拉開或擊殺

#### Scenario: 玩家在引信內擊殺 bomber
- WHEN bomber HP 在引信中歸 0
- THEN bomber 死亡，**不爆炸**

#### Scenario: 倒數結束玩家未脫離
- WHEN 1.2 秒到、玩家仍在 3.5m 內
- THEN 玩家受 25 傷害

### Requirement: Custom GLB Model
此敵人 SHALL 使用 `/assets/custom/plasma_bomber_v1.glb`（從 GPT Image 2 概念 → Blender 製作）。

## Related Specs
- `enemies/plasma_bomber_v2.md`（強化變體）
- `art/model-briefs/plasma-bomber-v1.md`
- `systems/combat-loop.md`

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2) — fuse 狀態機 + AoE explosion damage + moveDuringFuse=0 邏輯
- Art: 3D Specialist (T-A2) — `/assets/custom/plasma_bomber_v1.glb`（GPT Image 2 → Blender）；CAO Raven (T-A0) 紅光引信警告 + 與 rusher 紅警示色彩區分審查
- Audio: SFX Designer (T-S3) — 引信倒數 tick / 1.2s 警告嗡鳴 / 爆炸 boom（與 plasma_bomber_v2 區隔：v1 比較鈍）
- QA: QA Analyst (T-Q1) — 45s unlock + 1.2s fuseTime 反應窗 + 3.5m aoeRadius 可閃避性 + 引信內擊殺取消爆炸邏輯回歸

## Changelog
- 2026-05-18: GLB 整合進遊戲
- 2026-05-19: 文件化
- 2026-05-19 tick #18: 補完 Owner 段 Code / Audio / QA owners（loop Doc-Only Backlog #7）
