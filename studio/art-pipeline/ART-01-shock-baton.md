# ART-01 Shock Baton 新武器美術任務

Status: Draft

## Goal

建立第一條可追蹤的美術管線：Concept → 3D Brief → Blender Blockout → Game Integration。

## Concept Artist

輸出：

- 一張武器概念 prompt。
- 一張三視圖 / 轉面圖 prompt。
- 色彩與元素方向。

Prompt 草稿：

```text
Shock Baton weapon for Gorilla Gun Survivor, compact brutal sci-fi baton pistol hybrid,
low-angle gorilla scale, dark fantasy crypt metal, purple lightning core, worn iron,
oversized muzzle coil, readable silhouette, game-ready concept sheet, front side back views,
clean neutral background, high detail, no human hands
```

## CAO Review

檢查：

- 是否符合暗黑石窟 / 猩猩低視角 / 武器誇張比例。
- 是否和現有武器有差異。
- 是否適合做低模。

## 3D Specialist

Model brief：

- 類型：短柄電擊槍 / baton pistol hybrid。
- 大小：遊戲內目標最大邊約 0.55m。
- 形狀：短握把 + 電圈槍口 + 兩側導電片。
- 預算：低模 800 到 1500 tris。
- 材質：深鐵、紫色 emissive core。
- LOD：先不做，第一版 blockout。
- 碰撞：不需要精準碰撞，auto weapon 視覺模型。

## Animation Director

第一版不做骨架動畫。

狀態：

- orbit idle：由 AutoWeaponManager 繞玩家。
- aim：沿用 AutoWeapon rotation。
- fire：由 muzzle flash / projectile 表現。

## VFX Artist

效果：

- 紫色短電弧。
- 命中時小型 lightning spark。
- 不做全螢幕 alpha 大爆炸。

## Gameplay

暫定數值：

- id：`wpn_shock_baton`
- damageMul：0.65
- fireRate：4.2
- range：13
- bulletColor：`[0.65, 0.45, 1.0]`
- bulletSize：0.8

## Terry Test

Checkpoint B：

1. 升級時看是否出現 Shock Baton。
2. 選擇後確認武器繞玩家。
3. 確認能開火。
4. 確認視覺和舊武器有差異。
