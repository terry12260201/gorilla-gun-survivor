# System: Performance Budgets（效能預算）

## Purpose
Volt TA 守的命線 — 玩家在第 5 分鐘和第 15 分鐘的幀數**不可有差異**。

## Requirements

### Requirement: FPS Targets (Hard)
此遊戲的 FPS 表現 SHALL 達到下列基準：

| 平台 | 最低 FPS | 第 15 分鐘 |
|---|---|---|
| 桌面（高階 GPU） | 60 | 不掉 |
| 桌面（筆電內顯） | 45+ | 不掉 |
| 手機瀏覽器（旗艦） | 30 | 可玩 |

#### Scenario: 第 15 分鐘 FPS 掉到 40（桌面高階 GPU）
- WHEN profiler 顯示桌面高階 GPU 在第 15 分鐘 FPS 40
- THEN 此 build SHALL NOT ship
- AND Volt 必須產出效能分析報告找出元兇

### Requirement: Memory Cap
記憶體使用 SHALL < 300MB。

### Requirement: Initial Load Time
初始載入 SHALL < 5 秒（從 click 到可玩）。

### Requirement: No Frame Spikes
SHALL NOT 出現 > 100ms 的 frame spike（jank）。

### Requirement: Bundle Size Discipline
打包 chunk size SHALL 控管。當前狀態（待 Terry verify）：
- Vite 報告 chunk size warning > 500kB
- PERF-01 baseline：見 `performance/budgets/bundle-size-2026-05-19.md`

## Pool Strategies

所有「會大量產生 + 銷毀」的物件 SHALL 用 object pool：
- ProjectilePool（武器子彈）
- EnemyPool（敵人）
- 粒子（ImpactSparks、PoisonCloud、Lightning arcs）

### Requirement: Object Reuse
SHALL NOT 在 update loop 內 `new` 任何 Three.js 物件（會觸發 GC pause）。

## LOD Strategy（規劃）

遠距離（> 20m）敵人 MAY 切換簡模 / 不顯示動畫，降低 draw call。

## Browser Compatibility

SHALL 通過下列瀏覽器測試：
- Chrome（最新 + 前 2 版）
- Firefox（最新）
- Safari（最新）
- 行動 Chrome / Safari（旗艦機）

## Related Specs
- `systems/vfx-system.md`

## Owner
- Authority: Volt TA (T-P5) — **所有 PR 必須他簽字**
- Code Reviewer: CTO Circuit (T-T0)

## Changelog
- 2026-05-19: Initial documented + 對應 PERF-01 baseline 進度
