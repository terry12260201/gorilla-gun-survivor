# Enemy: Plasma Bomber V2 (plasma_bomber_v2)

## Purpose
plasma_bomber_v1 的強化變體 — 更高 HP、更大爆炸半徑、更高傷害、更短引信。90 秒後加入，與 v1 形成階層差異。

## Data

| 欄位 | 值 | 對比 v1 |
|---|---|---|
| hp | 58 | +45% |
| speed | 1.8 | -10% |
| touchDamage | 0 | = |
| radius | 0.55 | +10% |
| height | 1.35m | +4% |
| bomber.fuseRange | 3.2m | +7% |
| bomber.fuseTime | 1.0s | **-17%（更短引信、更難閃）** |
| bomber.aoeRadius | 4.0m | +14% |
| bomber.aoeDamage | 32 | +28% |
| bomber.moveDuringFuse | 0 | = |
| weight | 0.25 | -38%（更少 spawn） |
| unlockAt | 90s | +45s |
| xpTier / xpCount | 2 / 2 | +1 顆 |
| asset | `/assets/custom/plasma_bomber_v2.glb` |

## Requirements

### Requirement: Stronger Variant Profile
此敵人 SHALL 在 90s 後加入 spawn pool，全數值均強化於 v1。

### Requirement: Shorter Fuse Pressure
此敵人 SHALL 將引信時間縮短至 1.0s（vs v1 的 1.2s），逼玩家更快反應。

#### Scenario: QA 模式對比
- WHEN `?qaBombers=1` URL 啟用
- THEN v1 與 v2 交替 spawn，便於 QA 視測剪影 / 引信差異

### Requirement: Custom GLB Model
此敵人 SHALL 使用 `/assets/custom/plasma_bomber_v2.glb`（Terry 提供 .blend、Claude 自動 export）。

## QA Pending
- **QA-03**：v1 vs v2 剪影差異、引信警告辨識度、俯視角比例 — 報告路徑 `qa/reports/run-bomber-readability-20260519.md`（template 已備）
- **CAO 簽字**：v1 / v2 美術一致性審查待 Raven 確認

## Related Specs
- `enemies/bomber.md`（v1 基礎）
- `art/model-briefs/plasma-bomber-v1.md`
- `qa/reports/run-template.md`

## Owner
- Spec: Combat Designer (T-D3)
- Code: Gameplay Programmer (T-P2) — 沿用 bomber v1 fuse 狀態機，調整 stats（fuseTime 1.0s / aoeRadius 4.0m / aoeDamage 32）
- Art: 3D Specialist (T-A2) + CAO Raven (T-A0) — Terry 提供 .blend → Claude 自動 export 腳本 → `/assets/custom/plasma_bomber_v2.glb`；CAO 主導 QA-03 v1 vs v2 美術一致性審查
- Audio: SFX Designer (T-S3) — 縮短引信對應「更急促」倒數 tick / 更尖銳警告（與 v1 區隔）/ 更大爆炸 boom 反映 +28% 傷害
- QA: QA Analyst (T-Q1) — **QA-03 主驅動**：v1 vs v2 剪影 / 引信警告 / 俯視角比例視測，產 `qa/reports/run-bomber-readability-20260519.md`（template 已備）；90s unlock + 1.0s fuse 縮短反應窗驗證

## Changelog
- 2026-05-18: User 提供 .blend，Claude 寫 export 腳本，整合進 spawn pool
- 2026-05-19: 文件化 + QA-03 進行中
- 2026-05-19 tick #18: 補完 Owner 段 Code / Audio owners + 細化 Art / QA 角色分工（loop Doc-Only Backlog #7）
