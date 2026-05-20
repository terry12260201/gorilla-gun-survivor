# Meta Track: 第二次機會 (track_revive_charge)

> **Claude 提案**，pending Terry signoff。**這條最有爭議**，請慎審。

## Purpose
給玩家「死了能撐一次」的高階保險。降低 run 中段意外死亡的挫折感（被 bomber 群秒等運氣 case）。

**但這條設計有破壞 roguelike「死了就重來」緊張感的風險** — 因此設計保守：max_level 10 才解鎖、極高 cost、每 run 最多 1 次復活。

## Data (待建：src/data/meta.json)

| 欄位 | 值 |
|---|---|
| id | track_revive_charge |
| title | 第二次機會 |
| desc | 升至 lv 10 解鎖；每 run 開始時獲得 1 次復活 charge（HP < 0 時自動觸發，回滿 HP）|
| icon | ❤️ |
| max_level | **10**（**前 9 級無效果**，是 cost gate） |
| cost_curve | [50, 80, 120, 170, 230, 300, 380, 470, 570, 700] — 總 cumulative 3070 currency（極高） |
| effect_per_level | level 1-9: { type: "no_effect" }; level 10: { type: "grant_revive_charge_on_spawn", value: 1 } |

## Requirements

### Requirement: Revive Charge On Spawn (Level 10 Only)
此 track 在 level < 10 時 SHALL NOT 提供任何效果。在 level = 10 時，run spawn 時 SHALL 給玩家 1 個 revive charge。

#### Scenario: 玩家持 track lv 10 + run 中 HP 變 0
- WHEN player.hp 即將 ≤ 0
- THEN revive charge 自動消耗：HP 回滿至 max、無敵 2 秒、charge -1
- AND 同一 run 不再復活（除非加新 charge 來源）

### Requirement: One Charge Per Run
此 track SHALL NOT 累積 charges（lv 10 就是 1，不會升到 lv 11）。
**未來如果想做「2 次復活」應該開新 track，不是疊本 track**。

### Requirement: Death With Charge Available Auto-Triggers
玩家 SHALL NOT 能選擇「保留 charge 而真的死」 — 觸發即用。

#### Scenario: 玩家想保留 charge 給 boss 戰
- WHEN HP 即將歸 0
- THEN charge 自動使用，無 opt-out

### Requirement: Visual / SFX Feedback
復活觸發時 SHALL 有明顯視聽回饋（金色閃光 + 響亮 stinger），讓玩家清楚知道「這次死了又活了」。

## Open Questions (給 CEO 拍板)

1. **整條 track 該不該存在？** 破壞 roguelike 緊張感 vs 降低挫折感的 tradeoff
2. **是否該加「不可選 boss 戰前回滿」之類的條件**？避免變成「攻略 miniboss 必備」
3. **Charge 是否該有冷卻 timer**？例：用完後 60 秒內不能再撿到場上 charge pickup（如果未來有）
4. **如果做了，是否該降到 max_level 5**？目前 lv 10 是「故意設高 gate」

## Risk
這條 track 觸碰 CEO 的「不可加復活機制」紅線邊緣（launch brief 提過）。需要 CEO 簽字「example 是可以做的，但有條件」。

## Related Specs
- `systems/combat-loop.md`（HP / death）
- `meta-progression/_PROPOSAL-README.md`

## Owner
- Spec: Systems Designer + Combat Designer
- **Final: CEO（紅線）**

## Changelog
- 2026-05-19: Claude 提案 baseline — flagged as high-risk
- 2026-05-19 (Terry decision): ✅ **APPROVED** — 按提案設計實作（max lv 10、極高 cost gate、每 run 1 charge、自動觸發）。CEO 紅線邊緣案例已被 Terry 親自簽字過。
  - 4 個 Open Questions 仍待後續迭代決定（建議實作後 playtest 再回頭看 #1 #2 #3 #4）
  - 實作優先順序：放到 META Phase 2（先做 hp / damage / xp_magnet 3 條基礎，第二次機會最後做以便先驗證 META 系統 plumbing）
