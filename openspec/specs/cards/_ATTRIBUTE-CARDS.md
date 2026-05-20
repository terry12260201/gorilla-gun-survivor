# Dynamic: Attribute Cards (動態生成 · 元素附魔)

## Purpose
**自動生成**的「給已有武器升元素 tier」卡。每張對應「武器 × 元素 × tier」組合。

## Generation Logic (源頭：`src/progression/UpgradeCards.ts` line 148-173)

```typescript
function generateAttributeCards(game: Game): UpgradeCard[] {
  const cards: UpgradeCard[] = [];
  for (const weapon of game.weapons.weapons) {
    for (const element of ELEMENTS) {
      const currentTier = weapon.attributes.get(element) ?? 0;
      const attrCount = weapon.attributes.size;
      if (currentTier >= 3) continue;                  // 滿級不再出
      if (currentTier === 0 && attrCount >= 2) continue; // 每武器最多 2 種元素
      const nextTier = currentTier + 1;
      // ... 產出 card with id `attr_${weapon.id}_${element}_t${nextTier}` ...
    }
  }
  return cards;
}
```

## Requirements

### Requirement: One Card Per (Weapon × Element × Next Tier)
此 generator SHALL 在升等開卡時動態產出所有可用元素升級組合：
- 玩家擁有 N 把武器 × 4 種元素 × ≤ 3 tier
- 但受限於規則（見下）

### Requirement: Max 2 Elements Per Weapon
單一武器 SHALL 最多附加 2 種元素。第 3 種元素卡被卡池過濾。

#### Scenario: 玩家持 wpn_shock_baton + Lightning tier 1 + Fire tier 0
- WHEN 升等抽卡
- THEN 可出現「shock_baton 升 Lightning T1→T2」、「shock_baton 升 Fire T1」、「shock_baton 升 Ice T1」、「shock_baton 升 Poison T1」
- BUT 不能同時抽到 4 種新元素（卡池會混入其他卡）

#### Scenario: 玩家持 wpn_shock_baton + Lightning tier 2 + Fire tier 1（已 2 種元素）
- WHEN 升等
- THEN 可升 Lightning T2→T3、Fire T1→T2
- BUT Ice / Poison 卡被過濾（武器已 2 元素）

### Requirement: Tier 3 Cap
任一元素 SHALL 最多到 tier 3。tier 3 之後此元素 + 此武器組合不再出卡。

### Requirement: Weight 0.55 (RARITY_WEIGHT 'attribute')
比 common (1.0) 低、比 rare (0.35) 高、比 weapon (0.25) 高。

## Card Title 格式

```
[icon] [元素中文] T1                     // 第一次加元素
[icon] [元素中文] T{current}→T{next}     // 升 tier
描述：【武器標題】[element data.tiers[nextTier-1].desc]
```

例：「⚡ 雷擊 T1→T2」「【電弧短杖】連鎖 3 隻敵人，各 20 傷」

## Potential Count

理論上限：8 武器 × 4 元素 × 3 tier = 96 張可能卡，但實際每次升等只看當前 game state 篩選。

## Related Specs
- `elements/*.md`（4 種元素）
- `weapons/*.md`（8 把武器）
- `systems/level-progression.md`

## Owner
- Code: `src/progression/UpgradeCards.ts`（generateAttributeCards）
- Spec: Combat Designer + Balance Architect

## Changelog
- 2026-05-19: Documented dynamic generation
