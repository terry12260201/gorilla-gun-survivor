# Meta Track: <名稱> (<id>)

> **這是模板** — 複製此檔成 `track_<id>.md` 然後填空。

## Purpose
這條 META 升級條（玩家死後保留的永久升級）解決什麼長期 retention 問題？

## Data (待建：src/data/meta.json)

| 欄位 | 值 |
|---|---|
| id | track_<id> |
| title | <顯示名稱> |
| desc | <一句話> |
| icon | <emoji 或圖示路徑> |
| max_level | 5 / 10 / 20 |
| cost_curve | [10, 25, 50, 100, 200, ...] 每階花費 meta_currency |
| effect_per_level | <可累積效果> |

## Requirements

### Requirement: Persistent Effect
此 META 升級 SHALL 在每次新 run 開始時自動生效，並隨等級線性 / 指數累積。

#### Scenario: 玩家累積 50 meta currency，升至 level 3
- WHEN 玩家在 meta menu 升此 track 至 3 級
- THEN 下一個 run 開始時，<效果> 立即生效

### Requirement: Currency Source
此 track 升級需要 `meta_currency`，來源：
- Miniboss 擊殺 → 5 currency
- Chest 開啟 → 3-10 currency
- Run 結束（依存活時間） → max 20 currency

### Requirement: Reset Policy
此 track SHALL NOT 被任何單 run 內事件重置。死亡不影響 META 等級。

## Synergy / Conflict
- **Synergy**: 與 <其他 track>
- **Conflict**: <若有>

## Related Specs
- `systems/level-progression.md`
- `systems/combat-loop.md`

## Owner
- Spec: Systems Designer + Balance Architect
- Final: CEO（META 是 retention 核心）

## Changelog
- YYYY-MM-DD: Initial draft
