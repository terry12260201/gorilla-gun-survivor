# Card: <名稱> (<id>)

> **這是模板** — 複製此檔成 `card_<id>.md` 然後填空。完成後刪除這段 blockquote。

## Purpose
一段話：這張卡解決什麼玩家體驗 / build 多樣性問題？

## Data (待建：src/data/cards.json)

| 欄位 | 值 |
|---|---|
| id | card_<id> |
| title | <顯示名稱> |
| desc | <選卡介面顯示的一句話> |
| tier | 1 / 2 / 3 |
| weight | 0.0-1.0（抽到機率權重） |
| repeatable | true / false（同一 run 可重抽幾次） |
| prerequisite | <必須先抽到的卡 id，可省略> |
| effect | <type+params 物件，見下方> |

### Effect Types
- `damage_mul`: { value: number } — 全部武器傷害 ×
- `fire_rate_mul`: { value: number } — 全部武器射速 ×
- `range_mul`: { value: number } — 全部武器射程 ×
- `max_hp_add`: { value: number } — 最大 HP +
- `move_speed_mul`: { value: number } — 移動速度 ×
- `xp_magnet_mul`: { value: number } — 拾取範圍 ×
- `pickup_radius_add`: { value: number } — 拾取半徑 +
- `add_weapon`: { weaponId: string } — 給新副武器
- `element_tier`: { element: Element, tier: 1|2|3 } — 升元素
- `unlock_main_skill`: { skillId: string } — 解鎖主動技

## Requirements

### Requirement: <效果描述>
此卡 SHALL <做什麼>。

#### Scenario: 玩家在升等選到此卡
- WHEN <條件>
- THEN <立即效果>
- AND <持續效果>

#### Scenario: 與其他卡疊加
- WHEN 玩家已持有 <某張卡>
- THEN <疊加邏輯：相加 / 相乘 / 取代 / 無效>

## Related Specs
- `systems/level-progression.md`（card pool rules）
- `weapons/*.md`（如果效果牽涉武器）
- `elements/*.md`（如果效果牽涉元素）

## Owner
- Spec: Systems Designer (T-D1) + Balance Architect (T-D2)
- Code: Gameplay Programmer (T-P2)

## Changelog
- YYYY-MM-DD: Initial draft
