# META Progression — Claude 提案版本

> ⚠️ **這 4 條 META track 是 Claude 寫的提案**，Terry 必須過目才算 canon。

Launch brief 提到 GGS 有「4 條 META 永久升級條」但沒有具體內容。Claude 依 roguelike survivor 慣例 + GGS 既有 entity 提出 4 條提案。

## 4 條 track 一覽

| Track | id | 解決什麼問題 |
|---|---|---|
| 🛡️ 鋼鐵之軀 | `track_extra_starting_hp` | 早期生存壓力（已有範例檔，留用） |
| ⚡ 起始火力 | `track_extra_starting_damage` | 早期 DPS 不足、滾雪球啟動 |
| 🧲 磁場本能 | `track_xp_magnet_base` | 撿 XP 太累、節奏感不夠 |
| ❤️ 第二次機會 | `track_revive_charge` | run 中段意外死亡的挫折（高風險 META） |

## 設計紀律（從 launch brief 推）

1. **每條 track 線性 / 半指數成長** — 不能讓 lv 10 比 lv 1 強 ×100
2. **不可破壞核心循環** — META 只強化「殺撿升抽撐」每一步，不加新步驟
3. **不可彼此互斥** — 玩家可同時升 4 條，不強迫專精
4. **Currency 來源統一** — miniboss 擊殺 / chest / run 結束依存活時間
5. **天花板有限** — max_level 5-10，避免無限疊到玩法崩壞

## 待 Terry 決定的 3 個 OPEN 問題

1. **Currency 命名**：`meta_currency` / `pumpkin_seed` / `gorilla_bone` / ?
2. **重置政策**：META 可不可以 respec（玩家後悔換點數）？建議 NO（增加每次選擇的份量）
3. **第二次機會 track 是否該存在**：強復活機制有破壞 roguelike「死了就重來」的爽感風險。建議**做但藏深**（max_level 10 才解鎖、cost 極高）

## 與 cards 系統的關係

META 是「run 開始前就有的 base buff」，cards 是「run 進行中的選擇」。同類效果（如 max_hp）兩邊都可以堆，**加總**不是相乘。

例：META `extra_starting_hp` lv 5 (+50) + 3 張 `max_hp` 卡 (+25 × 3) = base 100 + 50 + 75 = 225 max HP
