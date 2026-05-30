# Card: 雙連發 (double_shot)

## Purpose
主武器每次發射多 1 顆子彈。Common rarity，**只影響主武器**（不影響 8 把副武器）。

## Data (源頭：`src/progression/UpgradeCards.ts` line 72-77)

| 欄位 | 值 |
|---|---|
| id | double_shot |
| rarity | common |
| weight | 1.0 |
| unique | false（可疊加） |
| effect | `g.gun.bulletsPerShot += 1` |

## Requirements

### Requirement: MainGun Bullets Per Shot +1
此卡 SHALL 將 `MainGun.bulletsPerShot` 加 1。

#### Scenario: 抽到 3 次
- WHEN 抽過 3 次
- THEN 主武器每次射擊發 4 顆子彈（base 1 + 3）

### Requirement: Does Not Affect Auto Weapons
此卡 SHALL NOT 影響副武器。

### Requirement: Horizontal Even-Distribution Spread
多顆子彈 SHALL 沿玩家 view-up 軸（水平面）均勻散射。**展開公式**（已查 `src/weapon/MainGun.ts` line 82-89）：

```
totalSpread = 0.05 * (n - 1)   // 弧度
each bullet angle: t = (i / (n-1)) - 0.5; angle = t * totalSpread
```

| bulletsPerShot (n) | totalSpread (弧度) | 約度數 | 每發 offset |
|---:|---:|---:|---|
| 1 | 0 | 0° | 直線（無 spread） |
| 2 | 0.05 | ~2.86° | ±1.43° |
| 3 | 0.10 | ~5.73° | -2.86° / 0° / +2.86° |
| 4 | 0.15 | ~8.60° | -4.30° / -1.43° / +1.43° / +4.30° |
| 5 | 0.20 | ~11.5° | -5.73° / -2.86° / 0° / +2.86° / +5.73° |

#### Scenario: 玩家持 bulletsPerShot = 3，瞄準前方 grunt
- WHEN 開火
- THEN 3 顆子彈水平展開 ±2.86°，中間 1 顆直擊 grunt
- AND 兩側 2 顆可能擊中 grunt 的鄰兵（如果有）→ 半 AoE 效果

#### Scenario: 玩家堆 5 次此卡（bulletsPerShot = 6）
- WHEN 開火
- THEN 6 顆子彈水平展開 ~14.3°（每發 offset ±1.43° 起步）
- AND 對單一遠距 target 命中率下降（最外側兩發容易擦過）
- AND 對近距 / 群戰命中率上升

### Requirement: Spread Axis is View-Up (水平)
散射軸 SHALL 是 `camera up` 向量（即玩家視線水平面），不是相機正上方。意義：玩家轉視角時 spread 方向跟著轉。

## Related Specs
- `weapons/wpn_*.md`（不受影響）
- `systems/combat-loop.md`（主武器手動射擊）

## Owner
- Code: `src/progression/UpgradeCards.ts`、`src/weapon/MainGun.ts`
- Balance: Balance Architect

## Changelog
- 2026-05-19: Reverse-engineered from code
- 2026-05-19: ~~OPEN: spread 角度未文件化~~ **已解決** — 查 `src/weapon/MainGun.ts` line 82-89，公式 `totalSpread = 0.05 * (n - 1)` 弧度，水平 view-up 軸均勻分佈。展開表已加入此 spec。
