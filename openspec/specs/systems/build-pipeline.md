# System: Build Pipeline（建置流程）

## Purpose
GGS 的 npm scripts、build gates、asset 轉檔、文件產出器整合規範。Tools Programmer 領地。本 spec 確保「Terry 跑 `npm run build` 跑出來的 dist/ 與 Claude / scheduled task 任何 tick 拍板的結果可信一致」。

## Tech Stack 邊界（CTO 簽字）

- **Bundler**: Vite 5（已選定，不準換）
- **TypeScript**: 5.4+，`tsc --noEmit` 模式（只型別檢查、不輸出 .js，由 Vite 編譯）
- **Three.js**: 0.163（純手刻 3D，不引入引擎）
- **Module type**: ESM（"type": "module"，所有 tools/*.mjs）
- **Asset conversion**: fbx2gltf（Blender 之外的 FBX → GLB 路徑，當前未啟用）

## Scripts (from package.json)

| Script | 指令 | 用途 | Phase |
|---|---|---|---|
| `dev` | `vite` | 本機開發 server（hot reload） | dev |
| `build` | `validate:weapons && tsc --noEmit && vite build` | Production 完整 build | ship |
| `preview` | `vite preview` | 預覽 production build | dev |
| `validate:weapons` | `node tools/validate-weapons.mjs` | 武器資料 schema 驗證 | gate |
| `art:concept` | `node tools/art/generate-gpt-image2-concept.mjs <brief.json>` | GPT Image 2 概念圖產出 | art |
| `convert:assets` | `node tools/convert-fbx.mjs` | FBX → GLB（fallback） | art |
| `dashboard:update` | `node tools/update-terry-dashboard.mjs` | 重新產 dashboard HTML | ops |

## Requirements

### Requirement: Build Gate Chain
`npm run build` SHALL 按以下順序執行，任何一步 fail 即整 build fail：

1. `validate:weapons` — 武器 JSON 結構檢查
2. `tsc --noEmit` — TypeScript 型別檢查
3. `vite build` — 實際打包

#### Scenario: weapons.json 缺欄位
- WHEN `npm run build` 開始
- THEN validate:weapons 偵測 → exit 1
- AND build 中止，dist/ 不會被更新
- AND Terry / CI 看到清楚錯誤訊息

#### Scenario: TypeScript 型別錯誤
- WHEN validate:weapons 過、但有 .ts 型別錯誤
- THEN tsc --noEmit fail → vite build 不執行

### Requirement: No Untyped Imports
所有 `.ts` 檔 SHALL 用 `.js` extension import（Vite + Node ESM 慣例），即使來源是 `.ts`：

```typescript
// 正確
import { WEAPON_SPECS } from '../weapon/AutoWeaponSpec.js';
// 錯誤
import { WEAPON_SPECS } from '../weapon/AutoWeaponSpec';
```

### Requirement: Tools Run As ESM .mjs
所有 `tools/*` 自動化腳本 SHALL：
- 副檔名 `.mjs`
- 用 ESM syntax（import / export）
- 入口直接執行（不需要包 main 函式）
- exit code：0 = pass, 1 = fail
- 錯誤訊息中文 + 英文混用（看 Terry / CI 都看得懂）

### Requirement: Validate-Weapons Schema
`validate:weapons` SHALL 驗證 `src/data/weapons.json`：
- 每 row 是 object
- 必填欄位齊全（id, title, desc, url, damageMul, fireRate, range, bulletColor, bulletSize）
- optional 欄位（signatureVFX）通過 enum 檢查
- id 以 `wpn_` 開頭、無重複
- url 以 `.glb` 結尾、且檔案實際存在於 `public/assets/`
- bulletColor 是 [r, g, b] 三元素陣列、各 ∈ [0, 1]
- 所有數值欄位 > 0
- 詳見 `studio/schemas/schema-weapons.md`

### Requirement: Dashboard Update Is Side-Effect-Free
`npm run dashboard:update` SHALL 只寫 `studio/dashboard/terry-progress.html`，不動其他檔案。

### Requirement: No Auto Commit / Push From Tools
所有 npm scripts SHALL NOT 觸發 `git commit` / `git push` / `git tag`。Git 動作由 Terry 手動或 CI 處理。

### Requirement: Performance Budget Feedback Loop
`npm run build` 完成後，Tools Programmer SHALL 提供（或保留可手動執行的）腳本路徑，將 `vite build` 產出的 bundle size 數值與 `performance/budgets/bundle-size-2026-05-19.md` 內 §4 「Key Numbers」段對比，並在偏離 ≥ 5% 時輸出 warning 給 Terry。

當前實作狀態：**手動**（Terry 跑 baseline 中 §6 PowerShell snippet）。自動化進 backlog（CTO Circuit + Volt TA 排序）。

#### Scenario: Bundle 突然胖了
- WHEN `vite build` 報主 chunk 從 baseline 550 kB 變 620 kB（+12.7%）
- THEN 對比腳本（或人工）SHALL 偵測 → 寫 `.ops/logs/perf-regression-<date>.log`
- AND Terry 收到 inbox 通知（或 dashboard 紅燈）
- AND PERF-02（lazy load / chunk split）卡片 SHALL 提到 backlog 前段

#### Scenario: Bundle 維持基準
- WHEN bundle size 在 baseline ±5% 內
- THEN 不輸出 warning，build 視為 perf-clean
- AND PENDING-CHANGES 段不需新增 perf entry

### Requirement: Asset Conversion Workflow
3D asset 進 `public/assets/custom/*.glb` SHALL 走以下路徑（依優先序）：

1. **Blender Python 主路徑**：CAO Raven / 3D Specialist T-A2 用 Blender → 透過 Blender MCP 或人工 export → 直接產 `.glb`
2. **fbx2gltf fallback**：若收到外部 .fbx asset，跑 `npm run convert:assets`（`tools/convert-fbx.mjs`）轉成 `.glb`
3. **手動最後線**：若 1 + 2 都不可行，T-A2 在 Blender 開啟原檔、人工調整、export `.glb`

統一輸出：`public/assets/custom/<weapon-or-enemy-id>.glb`，並更新 `src/data/weapons.json` 對應 `url` 欄位。

#### Scenario: 新武器 asset 進場
- WHEN 收到外部 shock_baton_v3.fbx
- THEN T-A2 先嘗試 Blender 直開 → export
- ELSE 跑 `node tools/convert-fbx.mjs shock_baton_v3.fbx`
- AND 輸出 `public/assets/custom/shock_baton_v3.glb`
- AND 改 `weapons.json` 的對應 row `url`
- AND `npm run validate:weapons` 通過（檔案存在 + 是 .glb）
- AND `npm run build` 通過

## Output / Build Artifacts

| 路徑 | 由誰產 | 進 git? | 用途 |
|---|---|---|---|
| `dist/` | vite build | ❌ (gitignore) | production deploy |
| `studio/dashboard/terry-progress.html` | dashboard:update | ✅ | Terry 看 |
| `art/concepts/*.concept.png` | art:concept | ✅ | concept reference |
| `art/concepts/*.concept.json` | art:concept | ✅ | metadata |
| `public/assets/custom/*.glb` | Blender Python | ✅ | gameplay asset |
| `.ops/logs/*.log` | manual / live-ops scripts | ✅（部份） | debug trail |

## Known Issues / Tech Debt

1. **chunk size warning** (PERF-01 baseline 已記錄)：Vite 報主 chunk > 500 kB
   - 對應 `performance/budgets/bundle-size-2026-05-19.md`
   - 修法待 Volt 簽核：lazy loading audio / dynamic import three.js examples
2. **Sandbox build 不可信**（Claude loop 紀錄）：mount filesystem stale read 導致 `npm run build` / `validate:weapons` 在 Cowork sandbox 跑可能拿到截斷檔
   - 政策：sandbox 不跑 build / validate 作為驗證；Terry Windows 側才是真實 build gate
   - 詳見 `studio/claude-as-codex-loop.md` 「NPM Verification 政策」段
3. **Validate 範圍只涵蓋 weapons**：cards.json / enemies / elements 還沒有 validator，未來需補

## CI 路線（規劃中）

當前無 CI（純本地 build + git push to GitHub Pages auto deploy）。未來規劃：

- GitHub Actions：push to main → run `npm ci && npm run build` → 失敗就阻擋 deploy
- 加 lint pass（eslint + prettier）
- 加 unit tests（Vitest 候選）
- 加 PR check（任何 PR 強制 build + lint pass）

## Related Specs
- `systems/performance-budgets.md`（bundle size 規範）
- `roles/programming/tools-programmer.md`（owner）
- `roles/programming/cto-circuit.md`（架構簽字）
- `studio/schemas/schema-weapons.md`（validator 規範）

## Owner
- Spec: Tools Programmer (T-P4)
- Authority: CTO Circuit（架構 / 新依賴 / tech stack 邊界）+ Volt TA（build 效能 / chunk 策略 / perf 預算回傳閾值）
- Asset workflow: CAO Raven + 3D Specialist T-A2（Blender 主路徑）
- Validator schema: Tools Programmer T-P4 + Combat Designer（武器欄位語意）
- Final: CEO Pumpkin King（換 stack / 換 bundler / 加 CI provider 之類）

## Changelog
- 2026-05-19: Initial documented from package.json + tools/ inspection
- 2026-05-20 02:30 (Cowork loop tick #20): 補完 perf 預算回傳 Requirement + asset 轉檔 workflow Requirement（3 階段 fallback：Blender 主 → fbx2gltf → 手動）；Owner 段細化（CTO Circuit / Volt TA / CAO Raven 多方簽字邊界明確化）；本 spec 視為**完備**，Doc-Only Backlog 全清
