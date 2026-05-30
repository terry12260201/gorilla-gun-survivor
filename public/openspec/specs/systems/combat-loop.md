# System: Combat Loop（核心循環）

## Purpose
定義 GGS 不可動搖的核心遊戲循環：**殺 → 撿 → 升 → 抽 → 撐**。所有 entity 設計都必須服務這個 loop，違反 → CEO 否決。

## Loop Definition

```
殺 (Kill) → 撿 (Pickup) → 升 (Level) → 抽 (Draw) → 撐 (Survive) → 殺...
```

1. **殺**：副武器自動射擊範圍內最近敵人；玩家主武器手動瞄準
2. **撿**：敵人死亡掉 XP orb / heart / chest；玩家走過自動撿
3. **升**：XP 累積達閾值升等
4. **抽**：升等開升級卡介面，3 選 1 強化（新武器 / 屬性 / Meta）
5. **撐**：選完繼續存活，難度持續上升

## Requirements

### Requirement: Loop Order Inviolate
此 5 步順序 SHALL 不可改變。任何提案要改順序或插入新步 → 需 CEO 簽字。

#### Scenario: 提案「擊殺後先強制看劇情再撿」
- WHEN agent 提出此提案
- THEN CEO 直接否決（違反 roguelike survivor 核心紀律）

### Requirement: Auto-Fire Secondary Weapons
副武器 SHALL 在玩家朝向錐角內、武器射程內的最近敵人自動發射。
詳見 `src/weapon/AutoWeapon.ts`。

### Requirement: Manual Main Weapon
主武器 SHALL 由玩家手動瞄準與射擊（skill shot）。

### Requirement: XP Magnet
當玩家距離 XP orb ≤ pickup radius 時，orb SHALL 自動朝玩家移動並消失。

### Requirement: Level-Up Modal Blocks Time
升等卡介面開啟時，遊戲時間 SHALL 暫停（不會被殺）。

#### Scenario: 玩家升等時被 grunt 包圍
- WHEN 升等卡彈出
- THEN 場上所有敵人凍結
- AND 玩家選完 3 選 1 後恢復

### Requirement: Difficulty Curve
敵人 spawn rate 與 HP SHALL 隨遊戲時間指數成長（具體曲線見 `level-progression.md`）。

## Hard Rules

- 不可加任何打斷此 loop 的機制（劇情強制播放、強制教學、強制 cutscene）
- 升等卡 3 選 1 → 不可改成「自動選最強」（玩家決策權神聖）
- 玩家死亡 → 直接 game over（不可加「復活」機制，除非 META 升級條提供）

## Related Specs
- `systems/level-progression.md`
- `systems/vfx-system.md`
- `weapons/*.md`（所有副武器）
- `meta-progression/*.md`（待補）

## Owner
- Spec: Systems Designer (T-D1)
- Final word: CEO Pumpkin King

## Changelog
- 2026-05-19: Initial documented
