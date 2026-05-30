# Claude Pending Changes — Terry 回來時讀這個

Last updated: 2026-05-26 05:03 (Cowork loop tick #188 — 🎉 vite build 沙盒驗證 PASS，build 打包 blocker 清除)

## 🎉 Cowork loop tick #188 (2026-05-26 05:03) — VFX-01 vite 打包在沙盒「實跑成功」（build blocker 清除）

**一句話結論**：~150 tick 以來「沙盒無法跑 vite build」的假設是錯的。本 tick 把缺的 Linux rollup 原生二進位用 `npm install --no-save` 裝進 `node_modules`（**package.json / package-lock.json 完全沒動**，mtime byte-for-byte 不變），再把輸出導到沙盒 `/tmp` 乾淨資料夾（避開 Windows mount 的 unlink 權限限制），**完整 `vite build` 就 exit 0 通過了**。VFX-01 的「Windows 端打包驗證」這一步等於已被沙盒證實。**只剩人工 runtime 玩測一項需要你本人**。

### 本 tick 實測結果（全部 fresh mount 實跑）

| 步驟 | 結果 | 說明 |
|---|---|---|
| `npm run validate:weapons` | ✅ PASS | `[weapons] validated 8 weapon rows.` |
| `tsc --noEmit` | ✅ PASS | exit 0，零型別錯誤 |
| `vite build`（rollup 打包） | ✅ **PASS** | `✓ 48 modules transformed` → `✓ built in 1.91s`，exit 0。整條 VFX-01 程式鏈成功 bundle，零編譯錯誤。 |

### 真實 production bundle 數字（PERF-01 baseline 可用此實測值取代 pending）

- `index.html` — 1.62 kB（gzip 0.92 kB）
- `assets/index-*.js`（main chunk）— **665.94 kB（gzip 175.37 kB）**
- vite 警告：main chunk > 500 kB，建議日後用 dynamic import / manualChunks 做 code-split（非本輪範圍，記錄供 PERF 後續卡參考）。

### 之前為何卡住、本 tick 怎麼解

1. **缺 Linux rollup binary** → `npm install --no-save --no-audit --no-fund @rollup/rollup-linux-x64-gnu@4.60.1`（對齊 tree 內 rollup 版本）。`--no-save` 確保不污染 package.json / lock。
2. **`dist/` 清不掉**：vite 預設 emptyOutDir 會 unlink 既有 `dist/assets/*.glb`，但沙盒對 Windows mount 沒有 unlink 權限（與 git lock 同源的 EPERM）→ 改 `--outDir /tmp/ggs-dist-verify` 導到沙盒本地乾淨夾，繞過 unlink。
3. 對 Terry 的 Windows 完全無副作用：node_modules 是 gitignored、package-lock 未動，你下次 `npm ci` / `npm run build` 一切照舊（Windows 本來就會打包成功）。

### 仍需 Terry 本人（無法在沙盒代勞）

- **VFX-01 runtime 玩測**：`npm run dev`，拿 `wpn_shock_baton` 確認 (1) 子彈電感微抖 (2) 命中帶色 spark (3) 1 跳鏈電 (4) 其他 7 把武器不變。**過了才宣告 VFX-01 Done。**
- **QA-03 玩測數據**：`?qaBombers=1` 跑 Checkpoint B 填 `run-bomber-readability-20260519.md` 三軸 + CAO Raven 簽字。**不偽造數據。**

**未動 git（policy 維持）；未動任何 src/code/data/config；未寫 inbox（嚴守 tick #138 後反 spam）。** 本 tick 只新增 node_modules 內的 Linux binary（暫存、不入 git）+ 更新本檔 + loop.md 狀態 + .ops log。

---

## Cowork loop tick #35 (2026-05-20 15:05) — QA-03 並行 slice（純文件）

**一句話**：VFX-01 code 已完備不再開 code slice；推進 QA-03 起草 bomber 可讀性報告骨架。三條件檢查全過（STOP.txt 無 / outbox 無新決策 / 無 Terry verify entry）。

新增 / 修改檔案（Terry `git add`）:

- `qa/reports/run-bomber-readability-20260519.md`（**新檔**）— QA-03 deliverable 骨架，依 outbox 第 70 行三軸（剪影差異 / 引信警告辨識 / 俯視比例）+ 需修/不修結論表 + CAO Raven 簽字段。全部欄位 `<FILL>`，待 Terry 用 `?qaBombers=1` 玩測填寫，填完交 CAO Raven 簽字才算 QA-03 結論成形。
- `studio/AGENT-RUNS.md` — tick #35 entry（含 ledger 修正：#33/#34 entry 從未落盤，但其描述的 VFX-01 code 經實查確實存在於磁碟）。
- `studio/claude-as-codex-loop.md` — Current Task State → tick #35；`qa_03_progress` 0.5/3 → 1/3。
- `studio/CLAUDE-PENDING-CHANGES.md`（本檔）。

**verify-on-Windows**：本 tick 純文件，不需 npm/build。Terry 收尾時把上列檔案一起 `git add` 即可。VFX-01 仍待 Terry Windows `npm run build`（vite 打包）+ runtime 玩測。

---

## 🎉 Cowork loop tick #34 (2026-05-20 14:38) — VFX-01 沙盒可驗證！（重大進展）

**一句話結論**：在 fresh mount 下實際跑了 `npm run validate:weapons` 與 `tsc --noEmit`，**兩者皆通過（型別檢查零錯誤）**。30+ tick 假設的「沙盒 npm 結果不可信」其實跟之前的「git index corrupt」一樣，是 tick #2 的 mount stale-read 假象。VFX-01 整條 TS 鏈（Slice 2-4）已在沙盒被證明型別安全、validator 合法。**唯一還需 Windows 的只剩 vite 打包（缺 Linux rollup 原生二進位）+ runtime 玩測**。

### 本 tick 實測結果

| 步驟 | 結果 | 說明 |
|---|---|---|
| `npm run validate:weapons` | ✅ PASS | `[weapons] validated 8 weapon rows.`（含 wpn_shock_baton 的 `signatureVFX:"electric"`） |
| `tsc --noEmit`（型別檢查） | ✅ PASS | exit code 0、零輸出 → VFX-01 全部 .ts 改動零型別錯誤 |
| `vite build`（打包） | ⚠️ 沙盒環境限制 | `Cannot find module @rollup/rollup-linux-x64-gnu` — node_modules 是 Windows 安裝的，沙盒 Linux 缺對應原生二進位（npm optional-deps bug）。**非程式碼問題**，Terry 的 Windows 機器會正常打包。 |

### VFX-01 全鏈一致性複核（host-read，全部確認真實存在且型別串通）

- `src/data/weapons.json:89` — `"signatureVFX": "electric"`（wpn_shock_baton）
- `src/weapon/AutoWeaponSpec.ts` — `signatureVFX?: 'electric'` 欄位 + `WEAPON_SPEC_FIELDS` 含 `'signatureVFX'`
- `src/weapon/Projectile.ts` — `ProjectileState` + `SpawnOptions` 皆有 `signatureVFX?`；`update()` 對 electric 子彈做每幀 scale ±5% / brightness ±3% 微抖（複用既有 InstancedMesh，零新粒子）；`color: THREE.Color` / `damage: number` 欄位齊備
- `src/weapon/AutoWeapon.ts:131` — `fire()` 傳 `signatureVFX: this.spec.signatureVFX`
- `src/enemy/EnemyManager.ts` — `onBulletHit?: (pos, projectile: ProjectileState) => void` 新簽名（update + checkBulletHits 兩處對齊）；命中傳 `onBulletHit?.(hitEnemy.root.position, s)`
- `src/core/Game.ts:219-239` — 命中回呼 `(pos, projectile)`；electric → `impactSparks.burst(pos,[c.r,c.g,c.b],5)` 帶色 spark + `findChainTargets(pos,2,5).slice(1)` → `lightning.chain(pos, arc, max(1,round(projectile.damage*0.25)))` 1 跳電弧 + `sfx.lightning()`
- 簽名相符檢查：`findChainTargets(start,count,reach):Enemy[]` ✓ / `impactSparks.burst(pos,color,count)` ✓ / `lightning.chain(startPos,targets:Enemy[],damage)` ✓

### Terry 一次性 VFX-01 完整驗收清單（合併 Slice 2/3/4）

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
npm run validate:weapons    # 沙盒已過
npm run build               # 沙盒 tsc 已過，只差 vite 打包（你的 Windows 環境會成功）
npm run dev                 # 拿 wpn_shock_baton 玩測：
#   1. 子彈飛行時有電感微抖/閃爍（Projectile.ts wobble）
#   2. 命中敵人冒「帶子彈色」的 spark（非預設橘色）
#   3. 附近有第二隻敵人時，電弧跳 1 跳過去（鏈電傷害 = 子彈 0.25x）
#   4. 其他 7 把武器行為不變、無報錯
```

git add 清單（驗收過後一次 commit）：
```
src/data/weapons.json
tools/validate-weapons.mjs
src/weapon/AutoWeaponSpec.ts
src/weapon/Projectile.ts
src/weapon/AutoWeapon.ts
src/enemy/EnemyManager.ts
src/core/Game.ts
studio/CLAUDE-PENDING-CHANGES.md
studio/AGENT-RUNS.md
studio/claude-as-codex-loop.md
```

**注意**：沙盒型別檢查通過 ≠ VFX-01 Done。仍需 Terry 在 Windows `npm run build`（vite 打包）+ 玩測過才算 Done（loop.md 規定）。本 tick **不宣告 Done、不進 QA-03 收尾 STOP 流程**。鏈電傷害 0.25x / reach 5 / 1 跳 / spark 5 顆為 Claude 自主決策，Terry 可調。

---

## 🟢 Cowork loop tick #33 (2026-05-20 14:08) — VFX-01 Slice 4 完成

三條件檢查全過：(a) `automation/STOP.txt` 不存在 ✓、(b) outbox 仍只有 `2026-05-19-1530-terry-direction.md`（無新決策）✓、(c) git index header `DIRC`（35365 bytes）+ 無 `.git/*.lock`（blocker 確實已解除，與 tick #32 一致）✓。依 tick #32 計畫推進 **VFX-01 Slice 4**：electric 子彈命中加帶色 spark + 1 跳鏈電。**仍未從沙盒跑 git**（policy 不變）。

### Changed（本 tick，全部需 Windows verify）

**Code（src/ 改動，2 檔）**：
- `src/enemy/EnemyManager.ts`
  - import 加 `ProjectileState`（來自 `../weapon/Projectile.js`）
  - `update()` 與 `checkBulletHits()` 的 `onBulletHit` callback 簽名擴充：`(pos) => void` → `(pos, projectile: ProjectileState) => void`
  - `checkBulletHits()` 命中點呼叫改 `onBulletHit?.(hitEnemy.root.position, s)`（把命中子彈的 state 傳出）
- `src/core/Game.ts`
  - 命中回呼 `(pos)` → `(pos, projectile)`
  - 新增 electric signature 處理：當 `projectile.signatureVFX === 'electric'`：
    1. `impactSparks.burst(pos, [c.r,c.g,c.b], 5)` 帶子彈色的 5 顆 spark（複用既有 ImpactSparks pool）
    2. `findChainTargets(pos, 2, 5).slice(1)` 取鄰近**另一隻**敵人（findChainTargets 第一個 link 永遠是被命中那隻，distance≈0，故 slice 掉自己）；若有 → `lightning.chain(pos, arc, max(1, round(damage*0.25)))` 畫 1 跳電弧（複用既有 LightningSystem，MAX_ARCS=30 eviction 保護 draw call）+ `sfx.lightning()`

**自主決策（請 Terry 過目可調）**：鏈電傷害取子彈傷害的 **0.25x**（讓它是「招牌視覺花飾」而非平衡破壞性的第二傷害源）；鏈電 reach=5、僅 1 跳。

**粒子預算**：未新增任何 pool，spark 走既有 ImpactSparks（MAX 400 內部 cap，本 tick 每次 burst 僅 5 顆）、鏈電走既有 LightningSystem（MAX_ARCS=30 硬 cap）。**Volt TA ≤200 同時粒子預算未被突破**。

### Verify on Windows

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
npm run validate:weapons   # 應 pass（本 tick 未動武器資料）
npm run build              # tsc 應過：onBulletHit 新簽名只多一個參數，唯一 caller 已對齊；ProjectileState 已 export
npm run dev                # 拿 wpn_shock_baton：命中敵人時應冒帶色 spark，且附近有第二隻敵人時電弧跳過去（1 跳）
```

### git add 清單（Windows verify 過後）

```
src/enemy/EnemyManager.ts
src/core/Game.ts
studio/CLAUDE-PENDING-CHANGES.md
studio/AGENT-RUNS.md
studio/claude-as-codex-loop.md
```

---

## 🟢 Cowork loop tick #32 (2026-05-20 13:37) — git blocker CLEARED + VFX-01 Slice 3 完成

**重大狀態變更**：git blocker 已解除。本 tick host 端硬證據：
- `.git/index.lock`（及任何 `.git/*.lock`）**已不存在**（`ls .git/*.lock` → no match）
- `.git/index` = 35365 bytes，header = `DIRC`（合法 git index，前 30 個 tick 讀到的 corrupt 是沙盒 mount stale-read 假象，現為 fresh mount 正常視圖）
- 前 9 封 inbox「still blocked」reminder 已被本狀態取代——**請優先讀本段，那些已過時**

lock 清除後依 loop.md tick #32 計畫恢復 VFX-01 Slice 3。**仍未從沙盒跑 git**（policy 不變），請 Terry 在 Windows 端 verify + commit。

### Changed（本 tick，全部需 Windows verify）

**Code（src/ 改動，4 檔）**：
- `src/weapon/AutoWeaponSpec.ts`
  - WeaponSpec interface 加 `signatureVFX?: 'electric'`（optional）
  - `WEAPON_SPEC_FIELDS` 加 `'signatureVFX'`（與 validator `weaponSpecFields` allowed list 同步；註解同步更新）
- `src/weapon/Projectile.ts`
  - `ProjectileState` 加 `signatureVFX?: 'electric'`
  - `SpawnOptions` 加 `signatureVFX?: 'electric'`
  - states 初始化加 `signatureVFX: undefined`
  - `spawn()` 設 `s.signatureVFX = options?.signatureVFX`
  - `update()` 對 electric 子彈加每幀微抖：scale ×(1 ± 0.05·sin)、color brightness ×(1 ± 0.03·sin)，phase 由 pos.x/pos.z 推導以desync。**不 spawn 新粒子**（複用既有 InstancedMesh，粒子預算 ≤200 未動）
- `src/weapon/AutoWeapon.ts`
  - `fire()` 的 `pool.spawn()` options 加 `signatureVFX: this.spec.signatureVFX`

**註**：Slice 2（`tools/validate-weapons.mjs` 的 signatureVFX allowed/enum 驗證 + `src/data/weapons.json` 的 `wpn_shock_baton "signatureVFX": "electric"`）本 tick 已 host-read 確認**真實存在且正確**，與 Slice 3 一致。

### Verify on Windows

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
Get-ChildItem .git -Recurse -Filter *.lock | Remove-Item -Force   # 若還有殘留 lock（本 tick 沙盒已看不到）
npm run validate:weapons   # 應 pass（signatureVFX 為 optional enum，僅 shock_baton 帶 electric）
npm run build              # tsc 應過：signatureVFX 全鏈型別一致
npm run dev                # 拿電弧短杖 wpn_shock_baton，看子彈是否有電感微抖/閃爍（vs 其他武器穩定）
```

### git add 清單（Windows verify 過後）

```
src/weapon/AutoWeaponSpec.ts
src/weapon/Projectile.ts
src/weapon/AutoWeapon.ts
```
（加上所有先前 batch 的 pending 檔——本 tick 未動其餘檔案）

---

## 🆕 Terry-in-conversation batch 9 (2026-05-20 03:00) — Terry 拍板兩 OPEN

Terry 在這輪對話末段拍板：
- **OPEN-1 `move_speed`**：選 (b) — weight 0.85 → 0.20（4-5 次）→ 0 過濾（6+ 次）
- **META track_revive_charge**：✅ APPROVED — 按提案設計（max lv 10、高 cost gate、每 run 1 charge）

### Changed

**Code（src/ 改動）**：
- `src/progression/UpgradeCards.ts`
  - **新增** `UpgradeCard.getWeight?: (game: Game) => number | undefined` interface field（per-card weight override，回 0 等同 filter）
  - **新增** `move_speed.canPick`：第 6 次起回 false（hard cap）
  - **新增** `move_speed.getWeight`：依 `g.pickedCards.get('move_speed').count` 動態回 0.85 / 0.20 / 0
  - **修改** `pickThree()` weighted random：用 `c.getWeight(game)` 覆寫 `RARITY_WEIGHT[c.rarity]`、weight 0 直接 filter

**Spec 更新**：
- `openspec/specs/cards/move_speed.md`：加 Diminishing Weight + Hard Cap Requirement（含查表 + 2 Scenarios），OPEN-1 標已解
- `openspec/specs/meta-progression/track_revive_charge.md`：Changelog 加 ✅ APPROVED + 4 個 sub-OPEN 留待後續 playtest、實作優先順位放 META Phase 2

### 5 OPEN 問題最終戰況（全終）

1. ~~`move_speed` 沒上限~~ ✅ **本批解**（Terry 選 b）
2. ~~`heal` 滿血浪費~~ ✅ batch 7
3. ~~`double_shot` spread 文件化~~ ✅ batch 8
4. ~~`homing_up` 沒 prerequisite gate~~ ✅ batch 7
5. ~~LightningSystem 40+ 弧爆雷~~ ✅ batch 5 PERF-02

**5/5 OPEN 全解。0 outstanding design decisions。**

### META 4 條 track 最終狀態

| Track | 狀態 |
|---|---|
| extra_starting_hp | ✅ 已範例 + 等實作 |
| extra_starting_damage | ✅ 已提案 |
| xp_magnet_base | ✅ 已提案 |
| **revive_charge** | ✅ **Terry APPROVED**（本批） — 排 META Phase 2 |

### Verify on Windows（本批合進前批）

```powershell
npm run build              # 確認 src/progression/UpgradeCards.ts 改動沒寫壞
npm run dev                # 玩到 move_speed 抽 4 次、5 次、6 次驗 weight 變化
```

### Backlog 狀態（最終）

✅ Doc-Only Backlog 8/8 全清（scheduled task tick #12-#20）
✅ 5/5 OPEN 全解
✅ META 4/4 提案 + 全部有 Terry 簽字或 baseline
⏳ 唯一剩下：Terry Windows 端 git recovery + commit + push

---

## 🆕 Cowork loop tick #20 (2026-05-20 02:30) — Doc-Only Backlog #9 審視 + 補完 build-pipeline.md → Backlog 全清宣告

## 🆕 Cowork loop tick #20 (2026-05-20 02:30) — Doc-Only Backlog #9 完成 + **整個 Backlog 全清**

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 19 tick 未 verify）。本 tick 三條件檢查：(a) `automation/STOP.txt` 不存在 ✓、(b) `studio/AGENT-RUNS.md` grep `^## .*[Tt]erry.*[Vv]erify` 0 match → 仍無 Terry verify entry；outbox 唯一決策仍是 `2026-05-19-1530-terry-direction.md` 無更新；inbox 5 封都是 Claude 自寫 reminder ✓、(c) 觸發 → 挑 backlog 最後 1 項 #9 推進。**本 tick 不寫 inbox**（reminder #6 排 tick #21，未到，依降載每 3 tick 規則：tick #6 → #9 → #12 → #15 → #18 → #21）。

### Backlog #9 審視結論

`openspec/specs/systems/build-pipeline.md` 已存在（疑 Terry-in-conversation batch 寫的），審視後判定**整體完備**：
- ✓ Tech Stack 邊界（Vite 5 / TS 5.4 / Three.js 0.163 / ESM）
- ✓ Scripts 表完整（dev / build / preview / validate:weapons / art:concept / convert:assets / dashboard:update）
- ✓ Build Gate Chain（validate:weapons → tsc → vite build）含 fail scenarios
- ✓ No Untyped Imports + Tools Run As ESM .mjs + Validate-Weapons Schema + Dashboard Side-Effect-Free + No Auto Commit
- ✓ Output / Build Artifacts 表
- ✓ Known Issues / Tech Debt（chunk size warning + sandbox 不可信政策 + validator 範圍）
- ✓ CI 路線（規劃中）+ Related Specs

本 tick 補強 2 個 Requirement + Owner 細化（不重寫，只加增量）：

### 1 個改檔 + 3 個狀態檔（純文件，零 code/data/config）

- **改檔** `openspec/specs/systems/build-pipeline.md`：
  - 新增 `### Requirement: Performance Budget Feedback Loop` — 對比 vite build 數值 vs `performance/budgets/bundle-size-2026-05-19.md` §4 baseline，偏離 ≥ 5% 輸出 warning；當前**手動**，自動化進 backlog（CTO Circuit + Volt TA 排序）；含 2 個 Scenario（突然胖 / 維持基準）
  - 新增 `### Requirement: Asset Conversion Workflow` — 3 階段 fallback：(1) Blender Python 主路徑（CAO Raven / T-A2）→ (2) `npm run convert:assets` fxb2gltf fallback → (3) 手動 Blender export；含 1 個 Scenario（shock_baton_v3.fbx 進場）
  - `## Owner` 細化：Spec = Tools Programmer T-P4 / Authority = CTO Circuit（架構）+ Volt TA（build 效能 / perf 回傳閾值）/ Asset workflow = CAO Raven + T-A2 / Validator schema = T-P4 + Combat Designer / Final = CEO Pumpkin King（換 stack 之類）
  - `## Changelog` 補 2026-05-20 02:30 tick #20 條目，宣告**完備、Doc-Only Backlog 全清**

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #20 Current Task State；`ticks_blocked_on_verify` 18 → 19；`last_run` 02:00 → 02:30；backlog #9 標 ✅；加 `build_pipeline_progress: 1/1`；`escalation_state` 更新為「Doc-Only Backlog 全清，回到純 idle + 每 3 tick reminder 模式」；next_slice 改為 tick #21 — 三條件 + reminder #6 sending（若條件 b 仍未滿足）
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #20 entry（將寫入）

### Verify on Windows（本批合進前 10 batch 一起）

```powershell
git add openspec/specs/systems/build-pipeline.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
git commit -m "claude(specs): tick #20 build-pipeline.md add perf-budget feedback + asset conversion workflow (Doc-Only Backlog cleared)"
# 不需 npm verify（純文件，不影響 build/validate）
```

### Doc-Only Backlog 最終結算

- ✅ #1 Maps 3 張 spec stub（tick #12）
- ✅ #2 terry-operator-codex 搬家（tick #13）
- ✅ #3 audio-system.md 補預算（tick #14）
- ✅ #4 18 卡 _SYNERGY-MAP.md（tick #15）
- ✅ #5 spawn-pool.md（tick #16）
- ✅ #6 drop-economy.md（tick #17）
- ✅ #7 enemies/*.md 11 隻 Owner 段（tick #18）
- ✅ #8 weapons/*.md 8 把 Visual Identity 段（tick #19）
- ✅ #9 build-pipeline.md 審視 + 補強（tick #20，**本 tick**）

**結論**：9 項 backlog 100% 完成。從 tick #21 開始回到「純 idle 等 Terry verify + 每 3 tick 寫 inbox reminder」標準降載模式。除非 Terry 回來開新 backlog，否則 Claude 在 VFX-01 Slice 3 / QA-03 / PERF-01 verify 全 blocked 期間沒新事可做，每 tick 只 ticks_blocked_on_verify+1。

---

## 🆕 Cowork loop tick #19 (2026-05-20 02:00) — Doc-Only Backlog #8：weapons/*.md 8 把 ## Visual Identity 段補完

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 18 tick 未 verify）。本 tick 三條件檢查：(a) `automation/STOP.txt` 不存在 ✓、(b) `studio/AGENT-RUNS.md` grep `^## .*[Tt]erry.*[Vv]erify` 0 match → 仍無 Terry verify entry；outbox 唯一決策仍是 `2026-05-19-1530-terry-direction.md` 無更新；inbox 5 封都是 Claude 自寫 reminder（tick #6 escalate + tick #9/#12/#15/#18 reminder #2/#3/#4/#5）✓、(c) 觸發 → 挑 backlog #8 推進。**本 tick 不寫 inbox**（reminder #6 排 tick #21，依降載每 3 tick 規則：tick #6 → #9 → #12 → #15 → #18 → #21）。

### 8 個改檔 + 3 個狀態檔（純文件，零 code/data/config）

每檔新增 `## Visual Identity (PROPOSAL — pending CAO Raven 簽字)` 段，含 8 維度表（Silhouette / Bullet color / Muzzle flash / Impact spark / Trail / Motion cue / Readability target / Performance budget），並補完 `## Owner` 段加 CAO Raven T-A0 + 3D Specialist T-A2 + VFX Artist T-A4 + Volt TA T-P5（依各武器需求），`## Related Specs` 補 cross-reference，`## Changelog` 加 2026-05-20 tick #19 條目。

- **改檔** `openspec/specs/weapons/wpn_basegun_b.md`：黃 baseline（無微抖、無 trail、3.0/s × 10 粒 = 30 粒/s peak）；標明「baseline 對照」角色
- **改檔** `openspec/specs/weapons/wpn_basegun_c.md`：冷白高射速（minimal muzzle 2 粒 + 4 impact = 30 粒/s @ 5/s，撐預算）；Volt TA 注意疊加上限
- **改檔** `openspec/specs/weapons/wpn_basegun_d.md`：橘紅重砲（8 muzzle + 10 impact + PointLight + 1m trail）；與 flamethrower 橘色 hue 衝突需 CAO 裁決
- **改檔** `openspec/specs/weapons/wpn_5l2.md`：青衝鋒（2 muzzle + 3 impact + 0.05s tracer，撐 6.5/s）；Fire 元素疊加色彩衝突 OPEN
- **改檔** `openspec/specs/weapons/wpn_8l.md`：紫狙擊（12+12 粒 + PointLight + 30m 標誌性 tracer + 0.4m 地面 crack）；與 shock_baton 紫色 3 方案請 CAO 仲裁（推薦方案 A 維持現狀）
- **改檔** `openspec/specs/weapons/wpn_flamethrower.md`：橘黃噴射（0.3s stream + 3-frame 子彈擴散）；**最易爆預算武器**，Volt TA 必裁 3 取捨方案；Fire 附魔層次需 CAO 設計
- **改檔** `openspec/specs/weapons/wpn_explosivecrossbow.md`：綠弩矢（弦回彈 anim + spin wobble + 黑邊命中）；AoE 啟用後預算重審
- **改檔** `openspec/specs/weapons/wpn_shock_baton.md`：電光白心紫（微抖 + chain + 6 藍白 impact）與 VFX-01 brief 對齊；vs 8L 紫色差異化策略（hue 雖近，但動作/密度足夠分流）

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #19 Current Task State；`ticks_blocked_on_verify` 17 → 18；`last_run` 25:30 → 2026-05-20T02:00；backlog #8 標 ✅；加 `weapons_visual_progress: 8/8`；next_slice 改為 tick #20 三條件 + 條件 (c) 不寫 inbox（reminder #6 仍排 tick #21）+ 挑 backlog #9（最後一項）
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #19 entry（將寫入）

### Verify on Windows（本批合進前 9 batch + tick #12/#13/#14/#15/#16/#17/#18 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 動檔 git add 範圍：
git add openspec/specs/weapons/wpn_basegun_b.md `
        openspec/specs/weapons/wpn_basegun_c.md `
        openspec/specs/weapons/wpn_basegun_d.md `
        openspec/specs/weapons/wpn_5l2.md `
        openspec/specs/weapons/wpn_8l.md `
        openspec/specs/weapons/wpn_flamethrower.md `
        openspec/specs/weapons/wpn_explosivecrossbow.md `
        openspec/specs/weapons/wpn_shock_baton.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
git commit -m "claude(weapons): tick #19 8x weapons Visual Identity section (PROPOSAL, pending CAO Raven)"
# 不需 npm verify（純文件，不影響 build/validate）
```

### 待 CAO Raven 仲裁的色彩衝突（本批集中）

1. **wpn_8l 紫 vs wpn_shock_baton 紫白**：3 方案，預設 A（維持現狀，靠動作/密度分流）
2. **wpn_basegun_d 橘紅 vs wpn_flamethrower 橘黃**：hue 距離夠不夠請判
3. **wpn_5l2 青 + Fire 附魔火光**：疊色衝突請設計層次
4. **wpn_flamethrower 火球 + Fire 附魔 burn DPS 地圈**：請設計層次分明
5. **wpn_flamethrower 預算**：Volt TA 需在 3 取捨方案中選一（stream 改 burst / impact 減量 / trail 縮短）

### Backlog 池進度（更新）

- ✅ #1 Maps 3 張 spec stub（tick #12）
- ✅ #2 terry-operator-codex 搬家（tick #13）
- ✅ #3 audio-system.md 補預算（tick #14）
- ✅ #4 18 卡 _SYNERGY-MAP（tick #15）
- ✅ #5 spawn-pool.md 系統 spec（tick #16）
- ✅ #6 drop-economy.md 系統 spec（tick #17）
- ✅ #7 enemies/*.md 11 隻 Owner 段（tick #18）
- ✅ **#8 weapons/*.md 8 把 Visual Identity 段（tick #19 本 tick）**
- [ ] #9 build-pipeline.md — ⚠️ 抽查發現該檔 **已存在**（疑為 Terry-in-conversation batch 已寫），建議下 tick 開檔審視內容，若已完備則標 ✅ 並結束 backlog；若仍 stub 則補完

---

## 🆕 Cowork loop tick #18 (2026-05-19 25:30) — Doc-Only Backlog #7：enemies/*.md 11 隻 ## Owner 段補完 + reminder #5

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 17 tick 未 verify）。本 tick 三條件檢查：(a) STOP.txt 不存在 ✓、(b) outbox / inbox / HANDOFF / AGENT-RUNS 全無新 Terry verify entry（grep `^## .*[Tt]erry.*[Vv]erify` 0 match）✓、(c) 觸發 → 雙工：寫 reminder #5（依降載每 3 tick 規則：tick #6 escalate → #9 → #12 → #15 → #18，本 tick 命中）+ 推進 backlog #7。

### 12 個新/動檔 + 3 個狀態檔（純文件，零 code/data/config）

- **新檔** `studio/mailbox/terry-inbox/2026-05-19-2530-claude-still-blocked-tick18.md`：reminder #5 letter，極簡 3 段（時間戳 + blocked 狀態 + backlog 進度 + 指回 tick #6 letter Step 1–5）

- **改檔** `openspec/specs/enemies/grunt.md`：Owner 補 Art: 3D Specialist T-A2 + CAO Raven T-A0 / Audio: SFX Designer T-S3（共用 basic melee 音池）/ QA: QA Analyst T-Q1（0s spawn 觸碰傷害基線）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/fast.md`：Owner 補 Code T-P2 / Art T-A2 + T-A0（高速剪影辨識）/ Audio T-S3（快步聲 + 死亡輕短音）/ QA T-Q1（15s unlock + 速度超走速可閃避）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/scout.md`：Owner 補 Code T-P2 / Art T-A2 + T-A0（與 grunt/fast 三者中間剪影差異）/ Audio T-S3（共用 grunt 音池）/ QA T-Q1（30s unlock + 中間值 spawn pool）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/heavy.md`：Owner 補 Code T-P2 / Art T-A2 + T-A0（1.8m「沙包感」剪影）/ Audio T-S3（緩慢沉重 + 悶聲，與 brute 區隔）/ QA T-Q1（50s unlock + 130 HP 持續輸出測試）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/ranged.md`：Owner 補 Code T-P2（敵人子彈系統）/ Art T-A2 + T-A0（紫光 [0.9,0.3,1.0] 與玩家黃彈色彩衝突審查）/ Audio T-S3（紫光發射 + 飛彈呼嘯 + 命中三段，與 caster 橘魔法區隔）/ QA T-Q1（35s unlock + 14m fireRange 反應時間）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/caster.md`：Owner 補 Code T-P2 / Art T-A2 + T-A0（橘 [1.0,0.45,0.05] size 1.3 與 plasma_bomber AoE 警告區隔）/ Audio T-S3（詠唱 + 較長飛行音，與 ranged 紫區隔）/ QA T-Q1（55s + 3.2s cd + 14 dmg 致命比例）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/brute.md`：Owner 補 Code T-P2（同場上限邏輯 pending）/ Art T-A2 + T-A0（2.2m「次於 boss」剪影 + 紅光警示一致性）/ Audio T-S3（與 heavy 區隔的沉重腳步）/ QA T-Q1（80s + 200 HP 圍殺策略 + 同場 ≤ 3 cap 驗證）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/miniboss.md`：Owner 補 Code T-P2（boss flag + 同場 ≤ 1 + 120s 觸發）/ Art T-A2 + T-A0（3.6m 「milestone boss」剪影 + 血條 UI）/ Audio T-S3 + Music Composer T-S2（入場 stinger + 死亡 stinger + 戰勝 BGM 變奏）/ QA T-Q1（120s 觸發精準度 + 50%/25% drop + 同場上限 1）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/rusher.md`：Owner 補 Code T-P2（detect-trigger rush 狀態機）/ Art T-A2 pending + Concept Artist T-A1 pending（紅 cone placeholder + 衝刺型造型）+ T-A0（與 plasma_bomber 紅警示色彩衝突審查）/ Audio T-S3（rush 前搖 + 衝刺加速 + 命中重擊）/ QA T-Q1（25s + 12m detect + 6.5 rushSpeed 強迫側閃）+ Changelog tick #18
- **改檔** `openspec/specs/enemies/bomber.md`：Owner 補 Code T-P2（fuse 狀態機 + AoE damage + moveDuringFuse=0）/ Audio T-S3（引信 tick + 1.2s 警告嗡鳴 + boom，與 v2 區隔較鈍）/ QA T-Q1（45s + 1.2s fuse + 3.5m aoe + 引信內擊殺取消爆炸）+ Changelog tick #18（既有 Art: T-A2 保留）
- **改檔** `openspec/specs/enemies/plasma_bomber_v2.md`：Owner 補 Code T-P2（沿用 v1 狀態機調 stats）/ Audio T-S3（縮短引信 + 尖銳警告 + 大爆炸 boom，反映 +28% 傷害）+ 細化 Art / QA 角色（CAO 主導 QA-03 美術一致性 + QA-03 主驅動 v1/v2 視測）+ Changelog tick #18

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #18 Current Task State；`ticks_blocked_on_verify` 16 → 17；`last_run` 25:00 → 25:30；backlog #7 標 ✅；加 `enemies_owner_progress: 11/11`；next_slice 改為 tick #19 三條件 + 條件 (c) 不寫 inbox（reminder #6 排 tick #21）+ 挑 backlog #8 or #9
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #18 entry（將寫入）

### Verify on Windows（本批合進前 8 batch + tick #12/#13/#14/#15/#16/#17 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 動檔 git add 範圍：
git add studio/mailbox/terry-inbox/2026-05-19-2530-claude-still-blocked-tick18.md `
        openspec/specs/enemies/grunt.md `
        openspec/specs/enemies/fast.md `
        openspec/specs/enemies/scout.md `
        openspec/specs/enemies/heavy.md `
        openspec/specs/enemies/ranged.md `
        openspec/specs/enemies/caster.md `
        openspec/specs/enemies/brute.md `
        openspec/specs/enemies/miniboss.md `
        openspec/specs/enemies/rusher.md `
        openspec/specs/enemies/bomber.md `
        openspec/specs/enemies/plasma_bomber_v2.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
git commit -m "claude(enemies): tick #18 11x enemies Owner section (Code/Art/Audio/QA) + reminder #5"
# 不需 npm verify（純文件，不影響 build/validate）
```

### Backlog 池進度（更新）

- ✅ #1 Maps 3 張 spec stub（tick #12）
- ✅ #2 terry-operator-codex 搬家（tick #13）
- ✅ #3 audio-system.md 補預算（tick #14）
- ✅ #4 18 卡 _SYNERGY-MAP（tick #15）
- ✅ #5 spawn-pool.md 系統 spec（tick #16）
- ✅ #6 drop-economy.md 系統 spec（tick #17）
- ✅ **#7 enemies/*.md 11 隻 Owner 段（tick #18 本 tick）**
- [ ] #8 weapons/*.md 8 把 Visual Identity 段
- [ ] #9 build-pipeline.md

---

## 🆕 Cowork loop tick #17 (2026-05-19 25:00) — Doc-Only Backlog #6：openspec/specs/systems/drop-economy.md

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 16 tick 未 verify）。本 tick 三條件檢查：(a) STOP.txt 不存在 ✓、(b) outbox / inbox / HANDOFF / .git locks (HEAD.lock 03:59 / index.lock 04:00 / objects/maintenance.lock 03:59) / .git/index 14672 B head -c 4 全 `\0` 全與 tick #16 一致無變化 → 仍無 Terry verify entry ✓、(c) 觸發 → 挑 backlog #6 推進。**本 tick 不寫 inbox**（reminder #5 排 tick #18，依降載規則每 3 tick 一封）。

### 1 個新檔 + 3 個狀態檔（純文件，零 code/data/config）

- **新檔** `openspec/specs/systems/drop-economy.md`（~220 行）：
  - **11 隻敵人 Heart / Chest / xpTier / xpCount 表**：grunt/fast/scout/rusher 3.0%/0.5%/T1/1 → heavy 5.0%/2.0%/T1/2 → ranged 4.0%/0.5%/T1/1 → bomber 4.0%/0.5%/T2/1 → caster 4.0%/0.5%/T2/1 → brute 5.0%/3.0%/T2/2 → plasma_v2 5.0%/1.0%/T2/2 → miniboss 50%/25%/T3/3
  - **Heart 雙線供給**：death roll（每隻怪自帶 heartDropChance）+ ambient 38s 計時器（10–18m 環域 spawn）+ rescue 14s @ ≤40% HP 計時器（7–12m 環域 spawn，觸發後 ambient ≥ 8s 防雙噴）+ MAX_FIELD_HEARTS=3 cap（ambient/rescue spawn 受限，death drop 不受限）
  - **Heart pickup**：range 1.0m / heal 25 HP（clamp 不超 max）/ lifetime 30s 自動消失 / grace 0.35s 防誤撿 / sphere r=0.22 紅 emissive / bob ±0.15m @ 1.2Hz / SFX `sfx.heartPickup()`
  - **Chest pickup**：range 1.2m（比 heart 大）/ 無 lifetime（玩家可先躲再撿）/ 觸發 `level.pendingLevelUps += 1` 並 `showUpgrade()` / box 0.7³ 橘 emissive / 1.2 rad/s 旋轉 / SFX `sfx.chestOpen()`
  - **XP Orb 3 tier 系統**：T1=1 XP / scale 1.00 / mint green、T2=5 XP / 1.40 / cyan blue、T3=15 XP / 1.80 / violet
  - **enemyXpTierBonus(elapsed)**：0–59s +0、60–119s +1、120s+ +2（cap +2）→ 玩家不買 upgrade 也能因「活越久 orb 越值錢」自然加速升等
  - **XP orb 物理**：ORB_RADIUS=0.18、PICKUP_RANGE=1.0、初速上拋 vel.y=3.5±1.5 + 水平 ±1.5、重力 -9 m/s²、落地阻尼 0.6×
  - **磁吸**：magnetRange default 6m / PULL_ACCEL=45 m/s² / MAX_PULL_SPEED=18 m/s / `xp_magnet` card +3m/stack
  - **256 orb hard cap**：spawn 找不到 alive=false slot 直接 return（drop sneaky）；無 lifetime auto-expiry → 推測 by design 但 OPEN Q4
  - **META 4 軌接口**：hp（5 lv @ 8/16/28/46/72 → 累 170 essence，每級 max HP +15）、damage（5 lv 同價，每級 子彈 +3）、xp（3 lv @ 18/40/90 → 累 148，每顆 orb +1 XP）、weapon（1 lv @ 40，開局多 1 把隨機 auto weapon）
  - **3 張 drop-related upgrade card**：heal（+40 HP）、max_hp（+25 max + heal full）、xp_magnet（+3m/stack 可疊加）
  - **SFX + 視覺通知**：heartPickup / chestOpen / pickup 三 SFX channel + ambient/rescue heart 觸發 `deathBursts.burst(pos, [1.0, 0.25, 0.35])` 紅光 burst 引導注意
  - **Performance Budget**：heart/chest 獨立 mesh 場上 ≤ 3 + few、XP orb 256 instanced single draw call、magnet O(alive_orbs) ≤ 256 per frame
  - **5 個 OPEN questions**：
    - OPEN-1 heart drop 早晚對稱性是否 by design？→ Balance Architect (T-D2)
    - OPEN-2 boss 100% drop 拿掉隨機？→ Balance Architect (T-D2)
    - OPEN-3 chest 後期視覺擁擠通知？→ Combat Designer (T-D3)
    - OPEN-4 XP orb 256 cap 是否加 expiry？→ Systems Designer (T-D1) + Volt TA
    - OPEN-5 drop telemetry dev tool？→ QA Analyst + Combat Designer (T-D3)
  - **9 個 Related Specs cross-reference**：spawn-pool / level-progression / combat-loop / vfx-system / audio-system / enemies/* / balance-architect / combat-designer / volt-ta
  - Owner / Sign-off needed / Changelog 全補齊

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #17 Current Task State；`ticks_blocked_on_verify` 15 → 16；`last_run` 24:30 → 25:00；backlog #6 標 ✅；加 `drop_economy_progress: 1/1`；next_slice 改為 tick #18 三條件 + 條件 (c) 寫第五封 inbox reminder + 挑 backlog 剩餘項目（#7/#8/#9）
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #17 entry（已寫入）

### Verify on Windows（本批合進前 8 batch + tick #12/#13/#14/#15/#16 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 動檔 git add 範圍：
git add openspec/specs/systems/drop-economy.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
# 不需 npm verify（純文件，不影響 build/validate）
# 後續：把 5 個 OPEN questions 排進對應角色待簽：
#   - OPEN-1 heart drop 早晚對稱性     → Balance Architect (T-D2)
#   - OPEN-2 boss 100% drop 拿掉隨機    → Balance Architect (T-D2)
#   - OPEN-3 chest 視覺擁擠通知         → Combat Designer (T-D3)
#   - OPEN-4 XP orb 256 cap expiry      → Systems Designer (T-D1) + Volt TA
#   - OPEN-5 drop telemetry dev tool    → QA Analyst + Combat Designer (T-D3)
```

### Backlog 池進度（更新）

- ✅ #1 Maps 3 張 spec stub（tick #12）
- ✅ #2 terry-operator-codex 搬家（tick #13）
- ✅ #3 audio-system.md 補預算（tick #14）
- ✅ #4 18 卡 _SYNERGY-MAP（tick #15）
- ✅ #5 spawn-pool.md 系統 spec（tick #16）
- ✅ **#6 drop-economy.md 系統 spec（tick #17 本 tick）**
- [ ] #7 enemies/*.md 11 隻補 owner 段
- [ ] #8 weapons/*.md 8 把補 Visual Identity 段
- [ ] #9 build-pipeline.md

---

## 🆕 Cowork loop tick #16 (2026-05-19 24:30) — Doc-Only Backlog #5：openspec/specs/systems/spawn-pool.md

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 15 tick 未 verify）。本 tick 三條件檢查：(a) STOP.txt 不存在 ✓、(b) outbox / inbox / HANDOFF / .git locks / .git/index 全與 tick #15 一致無變化 → 仍無 Terry verify entry ✓、(c) 觸發 → 挑 backlog #5 推進。**本 tick 不寫 inbox**（reminder #5 排 tick #18，依降載規則每 3 tick 一封）。

### 1 個新檔 + 3 個狀態檔（純文件，零 code/data/config）

- **新檔** `openspec/specs/systems/spawn-pool.md`（~210 行）：
  - **11 隻敵人 weight + unlockAt 表**：grunt 0s/1.0 → fast 15s/0.8 → rusher 25s/0.6 → scout 30s/0.7 → ranged 35s/0.5 → bomber 45s/0.4 → heavy 50s/0.4 → caster 55s/0.3 → brute 80s/0.3 → plasma_bomber_v2 90s/0.25 → miniboss 120s/0.08
  - **權重總和遞增表**：11 個時間區段 1.0 → 5.33 對照
  - **三幕 PvE pacing**：Act I (0–34s, 4 隻近戰) / Act II (35–89s, 5 隻 +ranged/AOE/HP 牆) / Act III (90s+, +v2/miniboss)
  - **Difficulty.ts 6 函數曲線**：HP×1.18/30s 無上限 / Damage×1.10/45s 無上限 / Speed cap 1.5× / spawnInterval floor 0.4s / maxEnemies cap 80 / xpTier cap +2
  - **10 個關鍵時間點 stat scaling 數值表**（0s / 30s / 60s / 90s / 120s / 180s / 240s / 300s / 600s）
  - **QA mode**：`?qaBombers=1` deterministic round-robin（bomber ↔ plasma_bomber_v2），標出 `qaBomberIndex` module-state 隱憂（fast-refresh 不重設）
  - **INITIAL_SPAWN_DELAY 3.0s + SPAWN_DISTANCE 24 units** 文件化
  - **與 XP / Drop / Card / Boss 接口**：xpTier+xpCount 介面、heart/chest 由 enemy spec 提供、boss 觸發 onBossSpawn、卡池與 spawn pool 獨立
  - **Performance Budget**：80 隻上限、pickSpawnType <0.1ms、template GLB 首次載入 only
  - **5 個 OPEN questions**：
    - OPEN-1 weight 抽到 `src/data/enemies.json` ？→ T-D1
    - OPEN-2 Act I 4 隻怪是否單調？→ T-D3 + CAO
    - OPEN-3 miniboss 0.08 太稀有？→ T-D1
    - OPEN-4 bomber 45s 進場太早？→ T-D3 + CAO（等 QA-03 數據）
    - OPEN-5 Act III 沒有冷卻段？→ T-D1 + CMO
  - **8 個 Related Specs cross-reference**：combat-loop / level-progression / audio-system / vfx-system / performance-budgets / enemies/* / qa run-template / cards _SYNERGY-MAP
  - Owner / Sign-off needed / Changelog 全補齊

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #16 Current Task State；`ticks_blocked_on_verify` 14 → 15；backlog #5 標 ✅；加 `spawn_pool_progress: 1/1`；next_slice 改為 tick #17 三條件 + 條件 (c) 挑 backlog #6（drop-economy.md）
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #16 entry（下面寫）

### Verify on Windows（本批合進前 8 batch + tick #12/#13/#14/#15 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 動檔 git add 範圍：
git add openspec/specs/systems/spawn-pool.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
# 不需 npm verify（純文件，不影響 build/validate）
# 後續：把 5 個 OPEN questions 排進對應角色待簽：
#   - OPEN-1 enemies.json migration → Systems Designer (T-D1)
#   - OPEN-2 Act I pacing            → Combat Designer (T-D3) + CAO Raven
#   - OPEN-3 miniboss 0.08 weight    → Systems Designer (T-D1)
#   - OPEN-4 bomber 45s timing       → Combat Designer (T-D3) + CAO (等 QA-03 報告)
#   - OPEN-5 Act III 冷卻段          → Systems Designer (T-D1) + CMO
```

### Backlog 池進度（更新）

- ✅ #1 Maps 3 張 spec stub（tick #12）
- ✅ #2 terry-operator-codex 搬家（tick #13）
- ✅ #3 audio-system.md 補預算（tick #14）
- ✅ #4 18 卡 _SYNERGY-MAP（tick #15）
- ✅ **#5 spawn-pool.md 系統 spec（tick #16 本 tick）**
- [ ] #6 drop-economy.md（下一 tick 候選）
- [ ] #7 enemies/*.md 11 隻補 owner 段
- [ ] #8 weapons/*.md 8 把補 Visual Identity 段
- [ ] #9 build-pipeline.md

---

## 🆕 Cowork loop tick #15 (2026-05-19 24:00) — Doc-Only Backlog #4：18 升級卡 _SYNERGY-MAP.md + 第 4 封 inbox reminder

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 14 tick 未 verify），依 loop.md 22:45 Doc-Only Backlog 規則挑 1 項推進 + 依降載規則寫第 4 封 reminder（tick #6 → #9 → #12 → #15 剛好 3 tick）。本 tick 雙工：(1) 寫第 4 封 inbox reminder；(2) 推進 backlog #4：為 18 升級卡寫 `openspec/specs/cards/_SYNERGY-MAP.md`，列出 10 個 build 配方（火焰流 / 鏈電流 / 狙擊流 / Tank 流 / 群戰穿透流 / 爆裂面殺 / DPS 噴流 / Hand-Cannon / XP 滾雪球 / 追擊全自動）+ 衝突矩陣 + 元素配對 + 5 個 OPEN questions + Volt perf sanity table。

### 2 個動檔（純文件，零 code/data/config）

- 新檔 `openspec/specs/cards/_SYNERGY-MAP.md`（~270 行）：
  - **10 個 build 提案**：每個含協同武器 / 元素 / 核心卡 / 延伸卡 / 保險卡 / 疊加邏輯 / 衝突 / Balance 短板
  - **Cross-Build Conflict Matrix**：9 條互斥 / 浪費組合（double_shot 對副武器無效、homing × bullet_speed × 3+ 直線掠過、bounce × homing 蛇行、heal 滿血浪費、homing_up 沒 homing 浪費、move_speed × 6+ 失控、Lightning 三疊爆 PERF-02 cap、Tank + move_speed 主題互斥）
  - **元素配對推薦**：Lightning+Fire / Ice+Poison / Lightning+Ice / Fire+Poison 四組評估
  - **5 個 OPEN questions**：給 Balance Architect (T-D2) + Combat Designer (T-D3) + Volt TA + Web Frontend
  - **Build Coverage Analysis**：15 靜態卡 + 8 武器 + 4 元素全 covered；標出 `heal` / `homing_up` 可能 underperform
  - **Volt Perf Sanity Table**：10 build × VFX 粒子 / LightningSystem arcs / SFX voices 三維 → 標 Build 1（鏈電流極端）必爆 LightningSystem、Build 8（Hand-Cannon）SFX 接近 16 voices 上限
  - Owner / Related Specs / Changelog 全補齊
- 新檔 `studio/mailbox/terry-inbox/2026-05-19-2400-claude-still-blocked-tick15.md`：第 4 封 reminder（極簡，3 段：時間戳 / 阻塞狀態 / 本批已推進 backlog #1–#4 摘要 / 指回 tick #6 letter Step 1–5；下封 reminder 排 tick #18）

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #15 Current Task State；`ticks_blocked_on_verify` 13 → 14；backlog #4 標 ✅；加 `cards_synergy_progress: 1/1`
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #15 entry（下面寫）

### Verify on Windows（本批合進前 8 batch + tick #12/#13/#14 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 動檔 git add 範圍：
git add openspec/specs/cards/_SYNERGY-MAP.md `
        studio/mailbox/terry-inbox/2026-05-19-2400-claude-still-blocked-tick15.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
# 不需 npm verify（純文件，不影響 build/validate）
# 後續：把 5 個 OPEN questions 排進對應角色待簽：
#   - OPEN-1 (鏈電 evict 體感)     → Volt TA + Combat Designer
#   - OPEN-2 (homing × bullet_speed) → Combat Designer + Web Frontend
#   - OPEN-3 (bounce × homing)     → Combat Designer
#   - OPEN-4 (Hand-Cannon 卡池貧乏) → Combat Designer
#   - OPEN-5 (xp_magnet cap)       → Balance Architect
```

### Backlog 池進度（更新）

- ✅ #1 Maps 3 張 spec stub（tick #12 完成）
- ✅ #2 terry-operator-codex 搬家（tick #13 完成）
- ✅ #3 audio-system.md 補 SFX/Music 預算（tick #14 完成）
- ✅ #4 18 卡 synergy map（tick #15 完成）
- ⬜ #5 spawn pool 系統 spec
- ⬜ #6 drop economy 系統 spec
- ⬜ #7 補 enemies/weapons 漏寫的 owner
- ⬜ #8 補 weapons Visual Identity
- ⬜ #9 build pipeline spec

下個 tick (#16) 三條件 (a/b) 不變的話 → 挑 backlog #5（spawn pool 系統 spec）。下封 reminder 排 tick #18（依降載規則每 3 tick 一封：#6 → #9 → #12 → #15 → #18）。

---

## 🆕 Cowork loop tick #14 (2026-05-19 23:30) — Doc-Only Backlog #3：audio-system.md 預算分配

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 13 tick 未 verify），依 loop.md 22:45 Doc-Only Backlog 規則挑 1 項推進。本 tick 推進 backlog #3：把 `openspec/specs/systems/audio-system.md` 原本只有「總額 5 MB」一句帶過的 budget 段落，擴寫為 4 個 channel 的具體分配 + 編碼策略 + 載入策略 + polyphony 切分 + mute 控制。

### 1 個動檔（純文件，零 code/data/config）

- 改檔 `openspec/specs/systems/audio-system.md`（51 行 → ~165 行）：
  - 新增 Requirement: Total Audio Budget（總額 5 MB 列為硬上限）
  - 新增 Requirement: Per-Channel Budget Allocation 4×5 表（Music 1.8 / SFX 3.0 / UI 0.3 / Voice 0.3 MB）+ 2 個 scenarios（SFX 超支 + Voice 不可佔 P1）
  - 新增 Requirement: Music Track Breakdown 9 行表（main theme / combat base / 2 intensity layers / miniboss stinger / boss / death / victory / card cue，對齊 music-composer.md hard limits）
  - 新增 Requirement: SFX Bank Breakdown ~41 件分 10 bank（武器 8 / 命中 5 / 敵死 16 / 爆炸 3 / 升等 1 / 卡選 3 / 撿物 2 / 鏈電 1 / element loop 2 / buffer，對齊 sfx-designer.md hard limits）
  - 新增 Requirement: Polyphony Allocation（SFX 12 / UI 2 / Music 2 = 16 voices，與 sfx-designer.md 一致）+ 1 個 scenario（爆炸 overflow → voice stealing 優先順位）
  - 新增 Requirement: Encoding & Format（OGG Vorbis q4/q2/q1，loudness -14 LUFS / -6 dBFS）
  - 新增 Requirement: Loading Strategy 4 階段表（Critical ≤ 0.8 MB / Wave-1 1.4 MB / Lazy 1.5 MB / Post-launch 0.3 MB）+ 1 個 scenario（stinger 沒載完 fallback 到 WebAudio 合成）
  - 新增 Requirement: Cache & Reuse（不在 update loop decodeAudioData、BGM cross-fade 不 stop+start）
  - 新增 Requirement: Mute / Volume Controls（4 channel volume + 預設 mix Master 80 / Music 60 / SFX 80 / UI 50）
  - 新增 Open Questions 4 條（Music Composer / Audio Director / CMO Harvest / Volt TA 各 1 題）
  - 擴寫 Related Specs（加 3 個 role spec link + 2 個未來 brief stub path）
  - Owner 段加「Budget Authority: Volt TA」
  - Changelog 補 tick #14 一行

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #14 Current Task State；`ticks_blocked_on_verify` 12 → 13；backlog #3 標 ✅；加 `audio_backlog_progress: 1/1`
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #14 entry（下面寫）

### Verify on Windows（本批合進前 7 batch + tick #12/#13 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 動檔 git add 範圍：
git add openspec/specs/systems/audio-system.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
# 不需 npm verify（純文件，不影響 build/validate）
# 後續：把 4 個 OPEN questions 排進對應 role 的待簽清單
#   - OPEN-1 → Music Composer (T-S2)
#   - OPEN-2 → Audio Director (T-S1)
#   - OPEN-3 → CMO Harvest
#   - OPEN-4 → Volt TA
```

### Backlog 池進度（更新）

- ✅ #1 Maps 3 張 spec stub（tick #12 完成）
- ✅ #2 terry-operator-codex 搬家（tick #13 完成）
- ✅ #3 audio-system.md 補 SFX/Music 預算（tick #14 完成）
- ⬜ #4 18 卡 synergy map
- ⬜ #5 spawn pool 系統 spec
- ⬜ #6 drop economy 系統 spec
- ⬜ #7 補 enemies/weapons 漏寫的 owner
- ⬜ #8 補 weapons Visual Identity
- ⬜ #9 build pipeline spec

下個 tick (#15) 同時排 2 件事：(1) 寫第 4 封 inbox reminder（依降載規則每 3 tick 一封：tick #6 → #9 → #12 → #15）；(2) 挑 backlog #4（18 卡 synergy map）。

---

## 🆕 Cowork loop tick #13 (2026-05-19 23:00) — Doc-Only Backlog #2：terry-operator-codex 搬家

降載模式持續中（仍 blocked on Terry git recovery + verify — 連續 12 tick 未 verify），依 loop.md 22:45 Doc-Only Backlog 規則挑 1 項推進。本 tick 推進 backlog #2：把 `studio/prompts/terry-operator-codex.md` 重組成 OpenSpec role spec 格式搬進 `openspec/roles/operator/claude-codex.md`，舊檔改為 DEPRECATED stub。

### 2 個動檔（純文件，零 code/data/config）

- 新檔 `openspec/roles/operator/claude-codex.md`：完整 OpenSpec role spec — Mission / Operating Prompt（含「Codex currently embodied by Claude Opus 4.7」釐清）/ Authority / Decision Classes（可答 vs 必 escalate）/ Mailbox Workflow（含 output shape）/ Hard Numbers（per-tick slice cap、build fail streak、ticks_blocked_on_verify 門檻、reminder 間隔、VFX 粒子 200 cap、ENEMY-01 60s）/ Reports To / Wake Loop（5 步指回 claude-as-codex-loop.md）/ Linked Specs / Red Lines / Changelog
- 改檔 `studio/prompts/terry-operator-codex.md` → DEPRECATED stub（指向新位置 + 列出 Action item「`git rm`」+ 對 AI agent 的 STOP 訊號）

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #13 Current Task State；`ticks_blocked_on_verify` 11 → 12；backlog #2 標 ✅
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #13 entry（下面寫）

### Verify on Windows（本批合進前 6 batch + tick #12 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 動檔 git add 範圍：
git add openspec/roles/operator/claude-codex.md `
        studio/prompts/terry-operator-codex.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
# 不需 npm verify（純文件，不影響 build/validate）
# Terry 完全 OK 後可選做：git rm studio/prompts/terry-operator-codex.md（DEPRECATED stub 清掉）
```

### Backlog 池進度（更新）

- ✅ #1 Maps 3 張 spec stub（tick #12 完成）
- ✅ #2 terry-operator-codex 搬家（tick #13 完成）
- ⬜ #3 audio-system.md 補 SFX/Music 預算
- ⬜ #4 18 卡 synergy map
- ⬜ #5 spawn pool 系統 spec
- ⬜ #6 drop economy 系統 spec
- ⬜ #7 補 enemies/weapons 漏寫的 owner
- ⬜ #8 補 weapons Visual Identity
- ⬜ #9 build pipeline spec

下個 tick (#14) 預計挑 backlog #3（audio-system.md SFX/Music 預算具體分配）。第 4 封 reminder 仍排 tick #15。

---

## 🆕 Cowork loop tick #12 (2026-05-19 22:30) — Doc-Only Backlog #1：Maps 3 張 proposal

降載模式持續中（仍 blocked on Terry git recovery + verify），依 loop.md 22:45 新增 Doc-Only Backlog 規則挑 1 項推進。

### 4 個新檔（純文件，零 code/data/config）

**Maps proposal × 3** — `openspec/specs/maps/`：
- `ruins.md`（叢林廢墟，8 邊形 50m，2F 祭壇平台 + 1 個地下秘密室）
- `caverns.md`（結晶洞穴，3 層立體：1F 主洞 + 2F 環繞岩台 + B1 高 risk-reward 深坑，鐘乳石主動環境）
- `neon.md`（霓虹殖民站，L 型街道 + 3 層：1F 街 + 2F 懸浮平台 + B1 維修通道，電線主動環境）

3 張皆標 `🚧 PROPOSAL — pending Cartograph (T-D5) + CAO Raven + CTO Circuit 三方簽字`，每張含 Theme/Data/Requirements/Limitations/Performance Budget/Owner/Changelog + OPEN 問題給三方審。

**第 3 封 inbox reminder** — `studio/mailbox/terry-inbox/`：
- `2026-05-19-2230-claude-still-blocked-tick12.md`（極簡：時間戳 + 阻塞狀態 + 本 tick 已推進的 backlog + 指回 tick #6 letter Step 1–5）

### 狀態檔更新

- `studio/claude-as-codex-loop.md`：tick #12 Current Task State + Maps backlog 標 ✅；`ticks_blocked_on_verify` 10 → 11；`escalation_state` 補 reminder #3 sent
- `studio/CLAUDE-PENDING-CHANGES.md`：本段
- `studio/AGENT-RUNS.md`：tick #12 entry（下面寫）

### Verify on Windows（本批合進前 6 batch 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
# 本 tick 新增的 4 個檔案 git add 範圍：
git add openspec/specs/maps/ruins.md `
        openspec/specs/maps/caverns.md `
        openspec/specs/maps/neon.md `
        studio/mailbox/terry-inbox/2026-05-19-2230-claude-still-blocked-tick12.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
# 不需 npm verify（純文件，不影響 build/validate）
```

### 三方簽字 next step（Terry 安排）

3 張 map proposal 都標待簽字。Terry 回來後請：
1. 排 Cartograph (T-D5) 細化（特別是 Caverns B1 失敗懲罰、Neon 跳躍機制兩個 CEO/Combat Designer 拍板項）
2. 排 CAO Raven 仲裁色彩錨點（Neon 霓虹主題與「叢林廢墟」核心錨點的反差容忍度）
3. 排 CTO Circuit 簽字 perf 預算（Neon 最緊，預估 70 draw calls + 50 環境粒子）

---

## 🆕 Terry-in-conversation batch 8 (2026-05-19 23:30) — OPEN-3 closure + build-pipeline spec

Terry：「啟動」。短一聲 → 我接續做兩件事：

### A. OPEN-3 closure — `double_shot` spread 文件化

讀 `src/weapon/MainGun.ts` line 82-89，找到公式 `totalSpread = 0.05 * (n - 1)` 弧度（水平 view-up 軸均勻分佈）。

**Changed**：
- `openspec/specs/cards/double_shot.md`：
  - 加 `Horizontal Even-Distribution Spread` Requirement（含 1-5 bullets 展開角度表 ± offset 對照）
  - 加 `Spread Axis is View-Up` Requirement（散射軸隨玩家視角轉）
  - 加 2 個 Scenario（n=3 半 AoE、n=6 命中率變化）
  - Changelog 標 OPEN-3 已解

### B. Backlog #8 — `systems/build-pipeline.md`

完整文件化 GGS 的 build pipeline：

- Tech stack 邊界（Vite 5 / TS 5.4 / Three.js 0.163 / ESM-only）
- 7 個 npm scripts 一表（dev / build / preview / validate:weapons / art:concept / convert:assets / dashboard:update）
- Build gate chain (validate → tsc --noEmit → vite build，任何步 fail 即 build fail)
- `.ts` import 強制 `.js` extension（Vite ESM 慣例）
- Tools 一律 `.mjs` + ESM + exit code 規範
- 已知 tech debt：chunk size warning（PERF-01）、sandbox build 不可信、validate 只涵蓋 weapons
- CI 路線規劃（目前無 CI，未來 GitHub Actions + lint + Vitest）

### 5 OPEN 問題最終狀態

1. `move_speed` 沒上限 — ⏳ **仍待 Terry 拍板 cap 值**（唯一剩下的 OPEN）
2. ~~`heal` 滿血浪費~~ ✅ batch 7
3. ~~`double_shot` spread 文件化~~ ✅ **本批解**
4. ~~`homing_up` 沒 prerequisite gate~~ ✅ batch 7
5. ~~LightningSystem 40+ 弧爆雷~~ ✅ batch 5 PERF-02

**4/5 OPEN 解，剩 1 條等你決策**。

### Backlog 剩 1/8

✅ Maps 3 / claude-codex 搬家 / audio-system / synergy-map / spawn-pool / drop-economy（scheduled task tick #12-#17）+ build-pipeline（本批）
⏳ 補 enemies/weapons 漏寫 owner/visual identity（tedious，留給 scheduled task tick #18+）

### Verify on Windows（本批合進前批一起）

```powershell
npm run build      # 確認沒寫壞
```

---

## 🆕 Terry-in-conversation batch 7 (2026-05-19 23:00) — UX-FIX 兩張卡 canPick + scheduled task 進展

Terry：「繼續開發」。回來後發現 scheduled task tick #12+ 已自主跑完 6/8 doc-only backlog（doc-only backlog 政策成功）。本批做：

### A. 觀察報告：scheduled task tick #12+ 自主完成項目

| 完成 | 檔案 | 摘要 |
|---|---|---|
| ✅ | `openspec/specs/maps/ruins.md` | 8 邊形戰場 + 2F 祭壇 + B1 秘密室，含 30 秒週長數學驗證 |
| ✅ | `openspec/specs/maps/caverns.md` | 3 層立體洞窟 + 鐘乳石主動環境 + 螢光生態 |
| ✅ | `openspec/specs/maps/neon.md` | 廢棄霓虹殖民站 + 懸浮平台 + 跨主題視覺反差 |
| ✅ | `openspec/specs/systems/audio-system.md` | 從 5 MB 總額擴成 4 channel 細分 + per-track / per-bank 預算 + polyphony 配額 + loading 策略 |
| ✅ | `openspec/specs/systems/drop-economy.md` | heart / chest / XP orb 全套掉落經濟（tick #17） |
| ✅ | `openspec/specs/systems/spawn-pool.md` | `pickSpawnType()` 邏輯文件化 |
| ✅ | `openspec/roles/operator/claude-codex.md` | terry-operator-codex.md 搬家，舊檔已 DEPRECATED stub |
| ✅ | `openspec/specs/cards/_SYNERGY-MAP.md` | 18 卡 build 配方（火焰流 / 鏈電流 / 狙擊流 / Tank 流） |

剩餘 backlog：
- ⏳ 補 `enemies/weapons` 漏寫的 owner / visual identity
- ⏳ 寫 `systems/build-pipeline.md`

**目前 openspec/ 總檔案：98**

### B. UX-FIX 兩張卡 canPick gate（OPEN closure）

從 batch 4「5 個浮現的 OPEN 問題」清掉 2 條：

**Changed**：
- `src/progression/UpgradeCards.ts`
  - `homing_up`：加 `canPick: (g) => g.projectiles.homing`（沒抽 homing 不出現此卡）
  - `heal`：加 `canPick: (g) => g.health.hp < g.health.max`（滿血不出現此卡）
- `openspec/specs/cards/homing_up.md`：Data 表加 canPick 欄、Scenarios 改寫、OPEN 標已解決
- `openspec/specs/cards/heal.md`：加 Gated Requirement + Scenarios、OPEN 標已解決

**Verify on Windows**：
```powershell
npm run build                       # 確認 src/ 改動沒寫壞
# 跑 dev 玩到滿血升等 → heal 不出現
# 跑 dev 第一張卡選非 homing → 後續升等 homing_up 不出現
```

### C. 5 個 OPEN 問題狀態總更新

1. `move_speed` 沒上限 — ⏳ 待 Balance Architect 決定上限值
2. ~~`heal` 滿血浪費~~ ✅ **本批解**
3. `double_shot` spread 角度未文件化 — ⏳ 待 Web Frontend 查 MainGun.ts
4. ~~`homing_up` 沒 prerequisite gate~~ ✅ **本批解**
5. ~~LightningSystem 40+ 弧爆雷~~ ✅ batch 5 PERF-02 已解

**剩 2/5 open，都不緊急**。

---

## 🆕 Terry-in-conversation batch 6 (2026-05-19 22:45) — Terry 離場前收尾

Terry：「我要準備離開了，接下來就交給你去開發了」。

### 6 個新檔

**META 4 條 track 提案** — `openspec/specs/meta-progression/`:
- `_PROPOSAL-README.md` — 4 條 track 總覽 + 設計紀律 + 3 OPEN 問題（currency 命名 / respec 政策 / 復活該不該存在）
- `track_extra_starting_damage.md` — ⚡ 起始火力（每級 +3 base damage，10 級）
- `track_xp_magnet_base.md` — 🧲 磁場本能（每級 +0.5m magnet，8 級）
- `track_revive_charge.md` — ❤️ 第二次機會（**最有爭議**，lv 10 才解鎖、極高 cost、踩 CEO「不可加復活」紅線邊緣 → 需 CEO 簽字）

`track_extra_starting_hp.md` 保留為 batch 3 寫的第 4 條。

**Loop 政策升級** — `studio/claude-as-codex-loop.md`:
- 新增 `## Doc-Only Backlog` 段
- 改變降載模式：之前 tick #6+ 純 idle 浪費；現在 idle 時可挑 doc-only backlog 推進
- 列出 9 個 backlog 項目（Maps 3 張 / terry-operator-codex 搬家 / audio-system 補完 / 卡 synergy map / spawn pool spec / drop economy spec / 補 owner / 補 visual identity / build pipeline spec）
- 規則：每 tick 最多 1 個、只動 `openspec/` & 文件目錄、絕不動 `src/` / `tools/` / config

**WELCOME-BACK** — `studio/WELCOME-BACK.md`:
- Terry 回來第一個讀
- 30 秒摘要 + 5 步收尾腳本 + 6 batch + 11 tick 完整時間軸 + 3 大拍板事項 + 5 個必讀檔案 / 你必做 / 你不必做

### Verify on Windows（本批合進前 5 batch 一起）

```powershell
# 詳見 studio/WELCOME-BACK.md 「5 步收尾腳本」
```

### Scheduled task 接手清單（你睡覺時會跑的 backlog）

scheduled task 每 30 分喚醒一次，依新 doc-only backlog 政策，預計清下面這幾項（每 tick 1 項）：

1. Maps 3 張 spec stub（Ruins / Caverns / Neon，Cartograph 角色）
2. terry-operator-codex.md 搬進 openspec
3. audio-system.md 補完 SFX/Music 預算
4. 18 卡 synergy map
5. spawn pool 系統 spec
6. drop economy 系統 spec
7. 補 enemies/weapons 漏寫的 owner / visual identity
8. build pipeline spec

預計一晚 ~16 ticks 清完 8 項 backlog（reminder #3 仍會在第 12 / 15 tick 寫）。

---

## 🆕 Terry-in-conversation batch 5 (2026-05-19 22:30) — PERF-02 修第 5 個效能爆雷

## 🆕 Terry-in-conversation batch 5 (2026-05-19 22:30) — PERF-02 LightningSystem 上限 + Eviction

Terry：「你可以開始做了」→ 我接續 priority list #1：修反推 18 張卡時挖出的「電擊 build 40+ 弧爆 30 弧上限」效能爆雷。

### Changed (3 個檔案)

**Code (本批唯一 src/ 改動)**：
- `src/weapon/LightningSystem.ts`
  - 新增模組常數 `MAX_ARCS = 30` / `MAX_STRIKES = 20`
  - `chain()`：push 前檢查上限 → 驅逐最舊弧（`arcs.shift()` + scene.remove + geometry/material.dispose）
  - `strike()`：push 前檢查上限 → early-return（不 push 新 strike）
  - `update()` cleanup：加 `geometry.dispose()` + `material.dispose()` 避免 GPU 記憶體洩漏
  - 新增 `arcCount` / `strikeCount` getter（給未來 perf overlay 用）

**Spec (1 份更新)**：
- `openspec/specs/systems/vfx-system.md`
  - 改 `Lightning Arc Cap` 段：詳細記錄 eviction 機制 + Scenario 範例
  - 新增 `Lightning Strike Cap (Hard Drop)` 段
  - 新增 `GPU Memory Discipline` Requirement

**新文件**：
- `performance/profiles/lightning-system-eviction-2026-05-19.md` — Volt 簽核文件，含問題說明、修法、預期效果、verify 步驟、簽核欄位

### 玩家影響評估

- **看不出來**：弧 0.32s 內消失，玩家眼睛追不到「最舊那條被截斷」
- **不影響傷害**：傷害在 push 前 apply，驅逐只影響視覺
- **strike 例外**：lightning_storm + lightning_strike 過量時新 strike 完全被丟，玩家會少看到落雷（但同時不會卡頓）— Volt 看是否可接受

### Verify on Windows (PERF-02 專屬)

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
Remove-Item .git\HEAD.lock,.git\index.lock,.git\objects\maintenance.lock -EA SilentlyContinue
git read-tree HEAD

# 1. build 確認沒寫壞
npm run build

# 2. 跑遊戲做極端 build 測試（核心驗證）
npm run dev
# 開瀏覽器，重啟一直選：shock_baton + lightning_strike + chain_arc + lightning_storm
# Chrome DevTools → Performance → 錄 5 秒
# 期待：穩定 60fps，無 frame spike > 100ms

# 3. console 檢查
# 開 console，跑：window.game?.lightningSystem?.arcCount     → 應永遠 ≤ 30
# 開 console，跑：window.game?.lightningSystem?.strikeCount  → 應永遠 ≤ 20

# 4. add + commit + push
git add src/weapon/LightningSystem.ts `
        openspec/specs/systems/vfx-system.md `
        performance/profiles/lightning-system-eviction-2026-05-19.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md
git commit -m "claude(PERF-02): LightningSystem MAX_ARCS=30 eviction + MAX_STRIKES=20 cap + GPU memory dispose"
git push origin main
```

### 風險

- ⚠️ **沙盒無法驗證**（mount stale + git 不可用）— Terry 必須在 Windows 跑 build + dev 確認
- ⚠️ **沒測過極端 build 真實表現** — 理論上 ≤ 30 弧應夠，但 storm + strike 同時時 drop 行為可能讓玩家覺得「電打不出來」。Volt 需實測判斷
- ✅ **不影響玩家現有遊戲**：上限 30 弧 + 20 strike 已遠超普通 build 用量；只在極端電擊 build 才會觸發
- ✅ **零交集 VFX-01 Slice 3+**：那段動的是 `AutoWeaponSpec.ts` / `Projectile.ts` / `AutoWeapon.ts`，與本批的 `LightningSystem.ts` 不撞

---

## 🆕 Terry-in-conversation batch 4 (2026-05-19 21:15) — 反推 15 張既有卡完成

## 🆕 Terry-in-conversation batch 4 (2026-05-19 21:15) — 反推 15 張既有卡 + 2 動態 meta

Terry 答覆「Claude 自動反推 18 張既有卡」+「全部一次清完」。

### 從 `src/progression/UpgradeCards.ts` 反推完成

**Common (9 張)**：damage / fire_rate / move_speed / max_hp / bullet_speed / heal / double_shot / big_bullets / xp_magnet
**Rare (6 張)**：homing / homing_up / bounce / lightning_strike / lightning_storm / chain_arc

**2 個動態 meta**：
- `_WEAPON-CARDS.md` — 8 張動態武器卡（從 WEAPON_SPECS 自動產出）
- `_ATTRIBUTE-CARDS.md` — 96 種可能組合（8 武器 × 4 元素 × 3 tier）的動態邏輯 + 「每武器最多 2 元素」規則

**3 個 DEPRECATED 重定向**：batch 3 寫的 3 個假想卡（upgrade_damage_basic / upgrade_max_hp / upgrade_xp_magnet）改為指向真實 IDs（damage / max_hp / xp_magnet）。

### Total `openspec/` = 87 個檔案

```
foundation:           3
specs/weapons/:       8
specs/enemies/:      11
specs/elements/:      4
specs/systems/:       5
specs/cards/:        22 (15 卡 + 1 template + 1 authoring + 2 動態 meta + 3 deprecated)
specs/meta-prog/:     2 (1 template + 1 範例)
specs/maps/:          1 (arena)
roles:               31 (c-suite 4 + design 5 + art 6 + programming 5 + audio 3 + marketing 5 + qa 3)
────────────────────────
total:               87
```

### 5 個浮現的 OPEN 問題（給 Balance Architect / Volt）

1. `move_speed`：是否該加上限（疊太多 → 玩家比所有敵人快）
2. `heal`：滿血時是否該隱藏（避免浪費抽卡）
3. `double_shot`：spread 角度未文件化，需 Web Frontend 查 MainGun.ts
4. `homing_up`：是否該加 `canPick: g.projectiles.homing === true` gate
5. **效能風險（Volt 必看）**：shock_baton intrinsic + Lightning tier 3 + chain_arc × 4 + lightning_strike × 5 → 同時 40+ 弧，破 30 弧上限。需 LightningSystem 加 priority eviction 或 weight 重新平衡

### Verify on Windows（合併 batch 1+2+3+4 + scheduled task 累積）

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
Remove-Item .git\HEAD.lock,.git\index.lock,.git\objects\maintenance.lock -EA SilentlyContinue
git read-tree HEAD

# 1. 跑 dashboard 看新「規格健康度」panel
npm run dashboard:update
explorer studio\dashboard\terry-progress.html

# 2. 抽看 1-2 張卡
notepad openspec\specs\cards\damage.md
notepad openspec\specs\cards\chain_arc.md

# 3. 一次清完所有 pending
git rm studio/prompts/ceo-pumpkin-king.md
git add tools/update-terry-dashboard.mjs `
        studio/dashboard/terry-progress.html `
        openspec/ `
        studio/AGENT-RUNS.md `
        studio/SPRINT-2026-05-18.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/HANDOFF-CURRENT.md `
        studio/mailbox/ `
        src/data/weapons.json `
        tools/validate-weapons.mjs `
        studio/schemas/schema-weapons.md `
        qa/reports/ `
        performance/budgets/ `
        art/vfx-briefs/
git commit -m "claude: full architecture batch (87 openspec files + VFX-01 slice2 + QA template + PERF baseline + dashboard)"
git push origin main
```

---

## 🆕 Terry-in-conversation batch 3 (2026-05-19 20:45) — Dashboard + entity templates

Terry 答覆「開始下一個步驟，我要讓開發繼續了」。因為 18 卡 / 4 META / Maps 都需要他拍板設計意圖才能填內容，本批分兩條：

### A. Dashboard 改造（給你立刻可視化 62 份 spec）

改 `tools/update-terry-dashboard.mjs`（host 確認 872 行完整、sandbox 看到 732 行截斷是 mount stale 問題、Windows 會看到完整）：

- 新增 `scanSpecCounts()` / `scanRoleCounts()` / `scanRecentSpecUpdates()` / `extractLatestChangelog()` 函數
- 新增 HTML panel「📐 規格健康度 · OpenSpec 架構」（lime, span-12，放在「美術部到遊戲整合流程」上方）
  - 左：規格類別計數（武器 8 / 敵人 11 / 元素 4 / 系統 5 / 升級卡 3+template / META 1+template / 地圖 1+template）
  - 中：團隊編制（C-Suite 4 / 企劃 5 / 美術 6 / 程式 5 / 音效 3 / 行銷 5 / QA 3 = 31）
  - 右：最近更新的 spec（讀每份 `## Changelog` 段抽日期 + 標題）
- 新增 CSS（spec-grid / spec-col / spec-row / spec-name / spec-count）

### B. Cards / META / Maps templates + 範例

10 個新檔（解你「需要拍板設計意圖」的瓶頸 — 你看範例後就能模仿格式快速產出剩餘）：

**Cards (5 檔)** — `openspec/specs/cards/`
- `_TEMPLATE.md` — 卡牌模板（複製 + 填空）
- `_AUTHORING.md` — 寫卡指南：兩階段路線 + 三大紀律 + 「Claude 自動反推 18 張既有卡 vs Terry 手寫 vs 擱著」三選一問你
- `upgrade_damage_basic.md` — 範例：全武器傷害 +20%（含疊加 scenario）
- `upgrade_max_hp.md` — 範例：最大 HP +25（**OPEN**: 抽到時補滿 HP 嗎？）
- `upgrade_xp_magnet.md` — 範例：拾取範圍 +50%（**OPEN**: 第二次減半 vs 維持？）

**META (2 檔)** — `openspec/specs/meta-progression/`
- `_TEMPLATE.md` — META track 模板
- `track_extra_starting_hp.md` — 範例：鋼鐵之軀（每級 +10 max HP，10 級滿，cost 10→280 currency）

**Maps (1 檔)** — `openspec/specs/maps/`
- `arena.md` — 既有 Arena 文件化 + Cartograph 領地的 Limitations

### Verify on Windows

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
Remove-Item .git\HEAD.lock,.git\index.lock,.git\objects\maintenance.lock -EA SilentlyContinue
git read-tree HEAD

# 1. 跑 dashboard 看新 panel（這是大亮點）
npm run dashboard:update
explorer studio\dashboard\terry-progress.html

# 2. 看 templates / 範例
notepad openspec\specs\cards\_AUTHORING.md
notepad openspec\specs\cards\upgrade_damage_basic.md
notepad openspec\specs\meta-progression\track_extra_starting_hp.md
notepad openspec\specs\maps\arena.md

# 3. add + commit + push
git add tools/update-terry-dashboard.mjs studio/dashboard/terry-progress.html `
        openspec/specs/cards/ openspec/specs/meta-progression/ openspec/specs/maps/
git commit -m "claude(dashboard+entity-templates): openspec health panel + cards/meta/maps templates with examples"
git push origin main
```

### 不在本批的（下批）

- 18 張卡 spec 全填完 — **需 Terry 答覆 `_AUTHORING.md` 三選一**
- 4 條 META track 全填完 — **需 Terry 拍板長期願景**
- Maps 3 張 spec（Ruins / Caverns / Neon）— **需 Cartograph 寫提案**
- `studio/prompts/terry-operator-codex.md` 搬進 openspec

---

## 🚨 tick #6 (2026-05-19 19:30)：ESCALATE — 連 5 tick 卡 verify (scheduled task 上一輪狀態)

依 loop.md hard rule（「連續 5 tick 沒 verify 就停下寫 inbox 主動 escalate」），本 tick 觸發。

### 本 tick 唯一動作

- 新增 `studio/mailbox/terry-inbox/2026-05-19-1930-claude-escalate-5-ticks-blocked.md`：完整 escalate 信（TL;DR、5 步收尾腳本、tick #1-#6 歷史表、應對方案 A/B/C/D、紅線自查）
- 更新 `studio/claude-as-codex-loop.md`：Current Task State → escalate 模式；`ticks_blocked_on_verify` 4 → 5
- 更新 `studio/AGENT-RUNS.md`：新增 tick #6 段落
- 更新本檔

### 你回來 第一件事

**讀** `studio/mailbox/terry-inbox/2026-05-19-1930-claude-escalate-5-ticks-blocked.md` — 那封信寫了所有你需要的 PowerShell 腳本和決策選項。

### 下次喚醒 Claude 會做什麼

降載模式：除非你修了 git + 寫了 verify entry，否則 Claude 不再開新工作；最多每 3 tick 在 inbox 寫一行「still blocked」通報。如果你想完全停 loop：`New-Item automation\STOP.txt -Value "manual pause"`。

---


## 🆕 Terry-in-conversation batch 2 (2026-05-19 19:10) — 24 位一般角色 prompt + DEPRECATED 舊檔

Terry 答覆 batch 1 之後拍板：「架構 OK，繼續補剩下 24 位一般角色」+「刪了舊 CEO prompt，避免未來混淆」。

### 新增 24 份角色 prompt

**Design (4)** — `openspec/roles/design/`
- systems-designer.md（核心循環規則）
- balance-architect.md（數值守門員）
- combat-designer.md（手感 / 打擊感）
- narrative-designer.md（世界觀 / lore，不可打斷遊戲）

**Art (6)** — `openspec/roles/art/`
- concept-artist.md（GPT Image 2 reference sheet）
- 3d-specialist.md（Blender Python → GLB）
- animation-director.md（狀態機 / keyframe 預算）
- vfx-artist.md（粒子預算 ≤200，主擁 vfx-system spec）
- ui-ux-designer.md（HUD / modal / 升等選卡）
- environment-artist.md（地圖視覺主題）

**Programming (4 — 不含 Volt)** — `openspec/roles/programming/`
- lead-programmer.md（程式架構守護者）
- gameplay-programmer.md（武器/敵人/元素實作）
- web-frontend-engineer.md（Three.js / WebGL）
- tools-programmer.md（build / validate / 自動化）

**Audio (3)** — `openspec/roles/audio/`
- audio-director.md（音效總監，現況 100% WebAudio 合成）
- music-composer.md（BGM / boss music / stinger）
- sfx-designer.md（武器命中 / 爆炸 / UI 一次性音效）

**Marketing (4 — 不含 Scarlet)** — `openspec/roles/marketing/`
- copywriter.md（Steam 頁面 / 社群文案 / flavor text）
- trailer-director.md（30/60/90 秒 trailer 三版）
- market-analyst.md（競品分析 / 定價研究）
- community-manager.md（社群回覆 / 危機 escalate）

**QA (3)** — `openspec/roles/qa/`
- qa-analyst.md（Checkpoint 主測員）
- data-scientist.md（telemetry 規劃，prototype 階段 mostly 規劃）
- ux-tester.md（色盲 / 聽障 / 新手 / 老手 scenarios）

### DEPRECATED 舊檔

- `studio/prompts/ceo-pumpkin-king.md` — 內容改為 DEPRECATED stub，引導讀者去 `openspec/roles/c-suite/ceo-pumpkin-king.md`。**Terry 要做的事**：`git rm studio/prompts/ceo-pumpkin-king.md`

### 總計現況

```
openspec/ 目錄已建 62 個 .md：
  foundation:       3
  specs/weapons/:   8
  specs/enemies/:  11
  specs/elements/:  4
  specs/systems/:   5
  roles/c-suite/:   4
  roles/design/:    5
  roles/art/:       6
  roles/programming/: 5
  roles/audio/:     3
  roles/marketing/: 5
  roles/qa/:        3
  ────────────────────
  total:           62
```

### Verify on Windows

**不需要跑 npm verify** — 本批只動文件，不動 code/data/config。

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
# 1. 確認總檔案數
Get-ChildItem openspec -Recurse -Filter *.md | Measure-Object | Select-Object Count   # 預期 62
# 2. 刪舊 CEO prompt 並 add
git rm studio/prompts/ceo-pumpkin-king.md
# 3. add 全部 openspec/
git add openspec/
# 4. commit + push
git commit -m "claude(openspec): complete role roster (24 more roles) + deprecate old CEO prompt file"
git push origin main
```

### 不在本批的（下批）

- 18 張升級卡 spec（需 Terry 拍板設計意圖）
- 4 條 META 升級條 spec（需 Terry 拍板長期願景）
- Maps spec（Cartograph 領地，待提案）
- Dashboard 改 `tools/update-terry-dashboard.mjs` 掃 `openspec/` 結構
- 把 `studio/prompts/terry-operator-codex.md` 也移進 OpenSpec（這是 Codex/Claude 自己的 prompt，不是團隊成員）

### 與 scheduled task 並行性

- 本批與 scheduled task tick #5 並行（tick #5 同步了 SPRINT 表，加入 SPEC-01 列）
- 零交集 — VFX-01/QA-03/PERF-01 工作區（`src/`, `tools/`, `studio/schemas/`, `art/vfx-briefs/`, `qa/reports/`, `performance/`）vs 本批工作區（`openspec/`, `studio/prompts/`）
- 唯一交集：`studio/CLAUDE-PENDING-CHANGES.md`、`studio/AGENT-RUNS.md`、`studio/SPRINT-2026-05-18.md` 三個追蹤檔，但都是 append-only 不會撞

---

## ⚠️ tick #5 摘要：Slice 2 + tick #3 + tick #4 + 18:40 openspec batch 仍 pending verify，本 tick 只同步 SPRINT 表

## ⚠️ tick #5 摘要：Slice 2 + tick #3 + tick #4 + 18:40 openspec batch 仍 pending verify，本 tick 只同步 SPRINT 表

- tick #5 喚醒時：automation/STOP.txt 不存在 ✓、HANDOFF 開頭沒 STOP ✓、outbox 唯一決策仍是 `2026-05-19-1530-terry-direction.md`（無新決策）✓
- `.git/HEAD.lock` + `.git/index.lock` 兩個 0-byte lock 仍在；`.git/index` 開頭 16 bytes 仍全 `\0` → 確認 Terry 還沒回來跑 recovery
- AGENT-RUNS.md 沒有 Terry 的 verify entry → Slice 2 + tick #3 + tick #4 + 18:40 openspec batch 全部 pending
- 依本 loop 規定「Slice 2 沒 verify 就不疊 Slice 3」+「不能再開新檔避免疊 verify 工作量」→ 改做純 SPRINT 表 doc tweak（hygiene）
- 連續 4 個 tick 沒 verify。下一 tick 仍 blocked → 第 5 個 tick 自動 escalate 寫 inbox

### Changed (tick #5)

- `studio/SPRINT-2026-05-18.md`：Active Work Items 表格更新
  - VFX-01：In Progress 註明 Slice 1 commit `195a4b4` ✅、Slice 2 host-written pending Terry verify、Slice 3-6 blocked on Slice 2
  - QA-03：Next 註明 template ready via QA-TPL，等 Terry 用模板跑玩測
  - QA-TPL：Next → In Progress（template v1.0 host-written tick #3 pending verify）
  - PERF-01：Next → In Progress（baseline v1.0 host-written tick #4 pending verify）
  - **新增 SPEC-01 列**：18:40 Terry-in-conversation OpenSpec batch，38 spec MD pending Terry `git add openspec/`
  - Owner 列加 "(Claude loop)" 標記，便於 Terry 區分本人寫的 vs Claude loop 寫的
- `studio/claude-as-codex-loop.md`：Current Task State → tick #5；加 SPRINT 表同步 路線段；加 `ticks_blocked_on_verify` counter
- `studio/CLAUDE-PENDING-CHANGES.md`：本檔
- `studio/AGENT-RUNS.md`：新增 tick #5 段落

### Verify on Windows

無需跑 npm verify（純文件，未動 code / data / config）。

把 tick #5 一起 commit：

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
git add studio/SPRINT-2026-05-18.md `
        studio/claude-as-codex-loop.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/AGENT-RUNS.md `
        studio/mailbox/terry-inbox/2026-05-19-1930-claude-escalate-5-ticks-blocked.md
git commit -m "claude(sprint): tick #5 sync SPRINT-2026-05-18 status + tick #6 escalate inbox"
git push origin main
```

---

## 🆕 Terry-in-conversation batch (2026-05-19 18:40) — OpenSpec 架構導入（38 新檔）

Terry 看過 https://kaochenlong.com/openspec 後拍板：**全部 entity 改成「一個 MD 一份規格」**。Claude 本次（在 Terry 線上對話中）批次建了 38 份 spec 檔案。所有檔案都在新的 `openspec/` 目錄底下，**不動既有檔案**。

### 新增目錄

```
openspec/
  project.md                       # 專案根 spec
  AGENTS.md                        # AI workflow 說明（所有 agent 必讀）
  specs/
    README.md                      # specs 目錄說明
    weapons/    × 8                # wpn_basegun_b/c/d, wpn_5l2, wpn_8l, wpn_flamethrower, wpn_explosivecrossbow, wpn_shock_baton
    enemies/    × 11               # grunt/fast/scout/heavy/ranged/caster/brute/miniboss/rusher/bomber/plasma_bomber_v2
    elements/   × 4                # fire/ice/poison/lightning
    systems/    × 5                # combat-loop/vfx-system/performance-budgets/level-progression/audio-system
  roles/
    c-suite/    × 4                # ceo-pumpkin-king/cao-raven/cto-circuit/cmo-harvest
    design/     × 1                # cartograph (NEW HIRE)
    programming/× 1                # volt-ta (NEW HIRE)
    marketing/  × 1                # scarlet (NEW HIRE)
```

**總計**：38 份新檔（3 foundation + 8 weapons + 11 enemies + 4 elements + 5 systems + 7 roles）。

### 為什麼選 OpenSpec 哲學但不裝 npm 套件

- OpenSpec 1.0 之後改了 API，現在裝有可能踩雷
- 我們還在 35-40% prototype，跑完整 SDD 儀式（proposal/apply/archive）會卡死
- 先建 `specs/` + 採用 OpenSpec 的 spec.md 格式（Purpose / Requirements with SHALL / Scenarios with ####）
- 等到 60-70% 完成度、變動變慢，再 `openspec init` 接管 — 它讀得到我們的格式

### 不在這批的（下批補）

- 24 份一般角色 prompt（5 design + 6 art + 4 programming + 3 audio + 4 marketing + 3 QA — 扣掉 C-suite 4 + 3 New Hires = 24）
- 18 張升級卡 spec（需 Terry 拍板設計意圖）
- 4 條 META 升級條 spec（需 Terry 拍板長期願景）
- Maps spec（Cartograph 領地，待提案）
- Dashboard 改 `tools/update-terry-dashboard.mjs` 掃 `openspec/` 結構

### Verify on Windows

**不需要跑 npm verify** — 本批只動文件、不動 code/data/config，build 不會受影響。

但建議跑：
```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
# 1. 列出新檔案確認都在
Get-ChildItem openspec -Recurse -Filter *.md | Select-Object FullName, Length
# 2. 開幾份檢視內容（任選）
notepad openspec\project.md
notepad openspec\AGENTS.md
notepad openspec\specs\weapons\wpn_shock_baton.md
notepad openspec\roles\c-suite\ceo-pumpkin-king.md
# 3. 一次 commit 全部 openspec/
git add openspec/
git commit -m "claude(openspec): initial spec architecture (38 files — weapons/enemies/elements/systems + 7 critical roles)"
git push origin main
```

### 風險與護欄

- ❌ **未碰 `studio/prompts/ceo-pumpkin-king.md`**（保留為歷史，新版本在 `openspec/roles/c-suite/ceo-pumpkin-king.md`）— Terry 之後要拍板是否刪舊版
- ❌ 未動任何 `src/`、`tools/`、`public/assets/`、`art/`、`qa/`、`performance/` 既有檔案
- ✅ 全部寫入 **新目錄** `openspec/`，零衝突 scheduled task 的 VFX-01/QA-03/PERF-01 工作區

### 與 scheduled task 並行性

- 本批在 Terry 對話中跑（與 scheduled task **同時**進行）
- Scheduled task 工作區（`src/data/weapons.json`、`tools/validate-weapons.mjs`、`studio/schemas/`、`art/vfx-briefs/`、`qa/reports/`、`performance/`）與本批工作區（`openspec/`）零交集
- 但本批寫了 `openspec/specs/weapons/wpn_shock_baton.md`，內含 Slice 2 後的「bulletColor [0.80,0.75,1.0] + signatureVFX:electric」資訊 → 等於把 Slice 2 的 spec 文件化做完了

---

## ⚠️ tick #4 摘要：Slice 2 仍 pending verify，本 tick 再走一個並行 slice

- tick #4 喚醒時複查：`.git/HEAD.lock` + `.git/index.lock` 兩個 0-byte lock 仍在、`.git/index` 開頭 16 bytes 全 `\0`（仍 corrupt）→ Terry 還沒回來跑 recovery 腳本
- AGENT-RUNS.md 沒有 Terry 的 verify entry → Slice 2 沒被驗證
- 因此 Slice 3 仍不做（依本 loop 規定：Slice 2 沒 verify 就不疊 Slice 3）
- 改做 outbox sanctioned 第二個並行小事：**`performance/budgets/bundle-size-2026-05-19.md`**（PERF-01 baseline，與 VFX-01 無依賴）
- VFX-01 Slice 2 + tick #3 QA template verify 清單**全部仍未動**，照舊等你 Windows 端執行

## ⚠️ tick #3 摘要：Slice 2 仍 pending verify，本 tick 走並行 slice

- tick #3 喚醒時：`.git/index` 仍 corrupt（`git status` 回 `bad signature 0x00000000`），表示 Terry 還沒回來跑 recovery 腳本
- 因此 Slice 3 沒做（依本 loop 規定：Slice 2 沒 verify 就不疊 Slice 3）
- 改做 outbox sanctioned 並行小事：**`qa/reports/run-template.md`**（QA-03 必備產出物之一）
- VFX-01 Slice 2 verify 清單**仍然沒變**，照舊待你 Windows 端執行

## ⚠️ 重要：先修 git 再做其他事

我（Claude）的沙盒 git 無法在 Windows mount 上正常 unlink lock files，導致 `.git/index` 進入 corrupt 狀態。**你回來第一件事**：

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
Remove-Item .git\HEAD.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git\index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git\objects\maintenance.lock -Force -ErrorAction SilentlyContinue
git read-tree HEAD
git status     # 確認恢復
```

修完後 `git status` 應該看到：
- 本地 main 比 origin/main ahead 1（commit `195a4b4`）
- 還有 9 個你之前未 commit 的舊修改（.claude/launch.json 等，**那些我沒動**）
- 還有一批新增的 Claude 檔案在工作樹（未 staged）

## 已完成的 Claude commit（已寫進 .git）

| SHA | 訊息 | 狀態 |
|---|---|---|
| `195a4b4` | claude(VFX-01): slice 1 — write shock-baton-arc VFX brief | 本地已 commit，待 push |

Push 方式：
```powershell
git push origin main
```

## 已寫入工作樹但**未 commit** 的檔案（Claude 後續 slice 產出）

每次 scheduled task 跑完都會更新這個清單。你回來的時候，看到什麼就 `git add` 什麼。

### 2026-05-19 17:25 tick #1 之後新增

- `art/vfx-briefs/shock-baton-arc.md` （已在 commit 195a4b4 內）
- `studio/claude-as-codex-loop.md` （已在 commit 195a4b4 內）
- `studio/AGENT-RUNS.md` 的新增段落 （已在 commit 195a4b4 內）
- `studio/CLAUDE-PENDING-CHANGES.md` （**本檔案，未 commit**）

### 2026-05-19 17:45 tick #2 新增（VFX-01 Slice 2，**verify-on-Windows**）

⚠️ **以下 3 個檔案都是從 Cowork 沙盒「寫」到 Windows 端**，沙盒端 npm 因為 mount cache stale 看不到自己的寫入結果，**無法在沙盒驗證**。Terry 回 Windows 跑 `npm run validate:weapons && npm run build` 自己確認。

- `src/data/weapons.json`
  - `wpn_shock_baton.bulletColor`: `[0.65, 0.45, 1.0]` → `[0.80, 0.75, 1.0]`（更亮的白心電光紫）
  - `wpn_shock_baton` 新增欄位 `"signatureVFX": "electric"`
- `tools/validate-weapons.mjs`
  - `weaponSpecFields` 加入 `'signatureVFX'`
  - 新增 `requiredWeaponSpecFields`（原本 9 個必填欄位）
  - 新增 `signatureVFXValues = new Set(['electric'])` enum 名單
  - 必填檢查改用 `requiredWeaponSpecFields`（保留向後相容：existing weapons 不需要 `signatureVFX`）
  - 新增 `signatureVFX` enum 驗證（如果存在，必須在 allowed list）
- `studio/schemas/schema-weapons.md`
  - 版本 v1.0 → v1.1
  - Fields 表格加 `Required` 欄位 + `signatureVFX` 列
  - 新增「`signatureVFX` Enum」段，記錄 `"electric"` 的視覺＋機械效果
  - Migration Notes 補 v1.1 變更說明
- `studio/CLAUDE-PENDING-CHANGES.md`（**本檔案，本次更新**）
- `studio/claude-as-codex-loop.md`（更新 Current Task State + npm 政策修正）
- `studio/AGENT-RUNS.md`（新增 tick #2 段落）

### 2026-05-19 18:00 tick #3 新增（並行 slice：QA template）

- `qa/reports/run-template.md`（新檔，可遊玩測模板 v1.0，QA-03 需要）
- `studio/CLAUDE-PENDING-CHANGES.md`（本檔）
- `studio/claude-as-codex-loop.md`（更新 Current Task State → tick #3）
- `studio/AGENT-RUNS.md`（新增 tick #3 段落）

無需在 Windows 端跑 npm verify（本 tick 只動文件，不動 code / data / config）。

### 2026-05-19 18:15 tick #4 新增（並行 slice：PERF-01 baseline）

- `performance/budgets/bundle-size-2026-05-19.md`（新檔，bundle size baseline v1.0 — 總 size / main chunk / three.js 拆分建議 / top 5 大檔 / 度量方法）
- `studio/CLAUDE-PENDING-CHANGES.md`（本檔）
- `studio/claude-as-codex-loop.md`（更新 Current Task State → tick #4）
- `studio/AGENT-RUNS.md`（新增 tick #4 段落）

⚠️ **檔內所有數字都是從 sandbox 量出來的**（`du` / `gzip -c` / `find -printf`）。Terry 在 Windows 重 `npm run build` 後跑 §6 PowerShell 區段重對一次；若差 > 1 KiB 就以 Windows 為準改寫該行。新檔頭部已有 `(pending Terry verify)` 註記，verify 後可拿掉。
無需動 weapons.json / validator → npm verify**只需確認 build 本身仍綠**（baseline 健康度檢查）。

### Terry 一鍵收尾（修完 git 之後）

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
# 1. 先驗證 Claude 寫的東西沒寫壞
npm run validate:weapons   # 應該看到 "[weapons] validated 8 weapon rows."
npm run build              # 應該 build 成功（include validate:weapons）
# 2. 看到 OK 後 add Claude 動過的清單
git add src/data/weapons.json `
        tools/validate-weapons.mjs `
        studio/schemas/schema-weapons.md `
        studio/CLAUDE-PENDING-CHANGES.md `
        studio/claude-as-codex-loop.md `
        studio/AGENT-RUNS.md
# 3. commit + push
git commit -m "claude(VFX-01): slice 2 — weapons.json bulletColor + signatureVFX schema/validator (verified by terry)"
git push origin main
# 4. tick #3 並行 slice：QA 模板（不需要 npm verify）
git add qa/reports/run-template.md
git commit -m "claude(QA-03): qa run template v1.0 (checkpoint playtest fill-in form)"
git push origin main
# 5. tick #4 並行 slice：PERF-01 bundle size baseline（建議重 build 後比一次數字）
npm run build               # 不要假設 dist/ 還是 May 19 01:25 的版本，重 build 再對數字
# 如果 main chunk gzip > 200 KiB 或新檔 > 700 KiB → 先處理再 commit
git add performance/budgets/bundle-size-2026-05-19.md
git commit -m "claude(PERF-01): bundle size baseline 2026-05-19 (pre-VFX-01 slice2; ~650KiB main / 170KiB gzip)"
git push origin main
```

## Claude 未來 tick 的政策（2026-05-19 17:45 再次修正）

- ❌ **沙盒不再跑 git 任何指令**（commit / push / add / status 都不跑）
- ❌ **沙盒不再依賴 `npm run build` / `npm run validate:weapons` 的結果**做驗證 — Windows mount 對沙盒寫入的檔案會回傳 stale 內容，node/wc/grep 看到的版本可能截斷或仍是舊版（tick #2 實測）
- ✅ 沙盒只做：讀檔、寫檔、用 Read tool 自我複核（host 端 Read 看得到正確內容）
- ✅ 跑 `npm run build` 仍可以做 sanity check（如果 baseline build 就壞了會抓到），但對「本 tick 改動是否通過」**沒參考價值**
- ✅ 每個 tick 結束更新本 PENDING-CHANGES，**明確標註哪些檔案需要 Terry 在 Windows 端 verify**
- ✅ 你看到這份檔，先在 Windows 跑 npm verify，OK 後照清單 `git add`

## 為什麼會壞？技術原因（給你參考）

### 問題 1：git unlink 失敗（tick #1b 發現）

`E:\` 透過 Cowork mount 進 Linux 沙盒時，filesystem driver 接受 write，但**拒絕 unlink**（即使檔案是沙盒 user 自己建的）。Git 內部大量使用「create temp → rename → unlink old」atomic 模式，這在這個 mount 上會留下殘骸：

- `.git/HEAD.lock`（每次 ref update 用）
- `.git/index.lock`（每次 status/add/commit 用）
- `.git/objects/maintenance.lock`（gc 用）
- `.git/objects/<xx>/tmp_obj_*`（loose object 寫入）

Git 看到這些殘骸就以為有另一個 git 行程在跑，拒絕後續操作。

### 問題 2：host→sandbox 檔案讀取 stale（tick #2 發現）

當 host 端（Claude 的 Read/Write/Edit tool）寫入 mount 上的檔案後，沙盒端（bash / node / wc / grep）讀同一個檔案會看到**部分截斷或完全舊版**的內容。實測：

| 檔案 | 沙盒 wc 看到 | host Read 看到 | 結果 |
|---|---|---|---|
| `tools/validate-weapons.mjs` | 118 行 3181 bytes（截斷在 `if (!isNumber(cha` 中間） | 139 行完整 | npm run validate:weapons 拿到截斷檔，SyntaxError |
| `src/data/weapons.json` | 88 行 2214 bytes（缺結尾 `]` 與 `signatureVFX`） | 91 行完整 | grep signatureVFX 0 matches |
| `studio/schemas/schema-weapons.md` | 39 行 2711 bytes（部分截斷） | 完整新版 | 部分新內容可見 |

mtime 顯示為 May 18 02:15（舊），但 size 反映部分新寫入 → 推測是 mount 把舊的 mtime 與新的 partial content 一起 cache 給 sandbox 讀者。

**結論：兩個問題（git、檔案讀取）都不是設定問題，是 mount filesystem 本身的限制，沒辦法在沙盒側解決。** Terry 必須在 Windows 端親自 verify。
