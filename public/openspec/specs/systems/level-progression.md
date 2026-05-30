# System: Level Progression（升等系統）

## Purpose
玩家 → 殺 → 撿 XP → 升等 → 抽卡的循環支撐。本系統定義 XP 曲線、卡片池規則、難度成長。

## Requirements

### Requirement: XP Orb Tiers
XP orb SHALL 分 3 個 tier，每 tier 提供不同經驗值：
- Tier 1：基礎敵（grunt / fast / scout / heavy / ranged / rusher / bomber）
- Tier 2：強化敵（caster / brute / plasma_bomber_v2）
- Tier 3：boss（miniboss）

具體 XP 數值由 `src/data/xp.json`（待建）控管。

### Requirement: Auto-Pickup Magnet
玩家 SHALL 在距離 XP orb ≤ magnet radius 時自動吸取。Magnet radius 為 META 升級可強化項目。

### Requirement: Level Up Modal
玩家累積 XP 達當前等級閾值時 SHALL 觸發升等：
1. 暫停遊戲時間
2. 開啟 3 選 1 升級卡介面
3. 玩家選完恢復遊戲

#### Scenario: 玩家升等時被包圍
- WHEN 升等彈出
- THEN 全場敵人凍結
- AND UI 不受任何 input 干擾

### Requirement: Card Pool Rules
3 張卡 SHALL 從卡池抽取，遵守：
1. **不重複**：3 張不能完全相同
2. **過濾已滿級**：玩家已 tier 3 的元素不再出現
3. **新武器優先**：如果玩家武器槽未滿，可選新武器
4. **附魔次序**：每階只能升 1 tier（不能直接跳 tier 3）

#### Scenario: 玩家持 Fire tier 2、其他武器都未滿
- WHEN 升等
- THEN 抽卡池排除 Fire tier 1，可能出現 Fire tier 3
- AND 可能出現新武器卡

### Requirement: Difficulty Curve
敵人 spawn rate × HP SHALL 隨遊戲時間指數成長。具體曲線：
- 0-60s：難度 1.0×
- 60-120s：難度 1.3×
- 120-180s：難度 1.7×（miniboss 觸發）
- 180s+：難度持續 +0.4 每 60 秒

## Heart / Chest Drops

詳見各 `enemies/*.md` 的 heartDropChance 與 chestDropChance。

## Related Specs
- `systems/combat-loop.md`
- `enemies/*.md`（所有敵人 drop 設定）
- `meta-progression/*.md`（待補）

## Owner
- Spec: Systems Designer (T-D1) + Balance Architect (T-D2)

## Changelog
- 2026-05-19: Initial documented
