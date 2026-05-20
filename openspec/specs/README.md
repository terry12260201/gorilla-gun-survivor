# Specs — 真相來源

這裡的每一份 `.md` 都是「**系統目前該長什麼樣**」的單一真相來源（Single Source of Truth）。

如果要改某個 entity 的行為：
1. 先讀對應 spec
2. 動 spec（如果是 breaking change，走 `changes/` 提案流程）
3. 再動 code

如果發現 code 跟 spec 不一致：那是 bug — 修 code 讓它符合 spec。如果 spec 寫錯了 — 也是 bug，修 spec。但不要兩邊各做各的，永遠以 spec 為準。

## 目錄

| 目錄 | 數量 | 對應資料 |
|---|---|---|
| `weapons/` | 8 | `src/data/weapons.json` |
| `enemies/` | 11 | `src/enemy/EnemyTypes.ts` |
| `elements/` | 4 | `src/weapon/Elements.ts` |
| `cards/` | 0 / 18 | `src/data/cards.json`（規劃） |
| `meta-progression/` | 0 / 4 | `src/data/meta.json`（規劃） |
| `systems/` | 5 | 跨系統規格 |
| `maps/` | 0 / 4 | `src/scene/Arena.ts` 等 |

## 待補（next batch）

- 18 張升級卡的 spec（需 Terry 拍板設計意圖）
- 4 條 META 升級條的長期願景
- Maps（Cartograph 領地）— Arena 既有、廢墟 / 洞窟 / 霓虹 提案中
