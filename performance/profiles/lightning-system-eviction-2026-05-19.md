# PERF-02: LightningSystem 上限 + Eviction · Volt 簽核文件

Owner: Volt TA (T-P5)
Reviewer: Combat Designer (T-D3)
Date: 2026-05-19

## 問題 (從 cards/chain_arc.md 反推發現)

電擊 build 在 prototype 已可組出**單次命中 9+ 條弧**的組合：

```
shock_baton intrinsic 1 跳   = 1 條/命中
Lightning element tier 3     = 5 條/命中
chain_arc × 4 (100%)         = 3 條/命中
lightning_strike × 5 (100%)  = 1 strike/命中
lightning_storm × 7 (100%)   = 5 strikes/命中
                            = ~9 弧 + ~6 strikes / 命中
```

主武器 4-6 發/秒 × 9 弧 = **每秒 36-54 條弧同時可能存在**（單條弧壽命 0.32s 內）。

原 LightningSystem **沒有上限**，且 `arcs.push()` / `strikes.push()` 無 cap → draw call 爆炸 + GPU 記憶體洩漏。

## 修法

`src/weapon/LightningSystem.ts`：

| 改動 | 細節 |
|---|---|
| `MAX_ARCS = 30` | 與 spec 對齊；超過 → `arcs.shift()` 驅逐最舊弧（先 scene.remove + dispose） |
| `MAX_STRIKES = 20` | strike 有 delayed damage，驅逐會丟損失；改為新請求 early-return |
| `update()` cleanup 加 dispose | `line.geometry.dispose()` + `material.dispose()` 避免 GPU 洩漏 |
| 加 `arcCount` / `strikeCount` getter | 給未來 perf overlay / 測試用 |

## 預期效果（Terry verify-on-Windows 用）

- 桌面 GPU：60fps 不掉（即使極端電擊 build）
- 記憶體：< 300MB（爆雷前可能洩到 400MB+）
- LightningSystem.arcs.length 永遠 ≤ 30
- LightningSystem.strikes.length 永遠 ≤ 20

## 玩家體感影響

- **看不出來**：弧 0.32s 內消失，玩家眼睛追不到「最舊那條被截斷」
- **不影響傷害**：傷害在 push 前 apply，驅逐只影響視覺
- **strike 例外**：lightning_storm + lightning_strike 過量時新 strike 完全被丟，玩家會少看到落雷（但同時不會卡頓）

## Verify 步驟（Terry Windows）

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
npm run build                          # 應該 pass
npm run dev                            # 啟動
# 1. 開遊戲，盡量抽到：shock_baton + lightning_strike × 5 + chain_arc × 4
# 2. 觀察 FPS（Ctrl+Shift+I → Performance → record 5 秒）
# 3. 期待：穩定 60fps，無 frame spike > 100ms
# 4. 開 console，跑：window.game?.lightningSystem?.arcCount → 應永遠 ≤ 30
```

## Volt 簽核欄位

- [ ] FPS 桌面 60 ✓ ／ ⚠️ ／ ❌
- [ ] FPS 筆電內顯 45+ ✓ ／ ⚠️ ／ ❌
- [ ] arcCount ≤ 30 ✓ ／ ❌
- [ ] strikeCount ≤ 20 ✓ ／ ❌
- [ ] 記憶體 < 300MB ✓ ／ ❌
- [ ] 無 frame spike > 100ms ✓ ／ ❌

簽核人：__________ 日期：__________

## Changelog
- 2026-05-19: PERF-02 提案 by Claude，pending Volt verify-on-Windows
