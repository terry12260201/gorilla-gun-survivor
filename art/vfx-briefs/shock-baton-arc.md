# VFX Brief: 電弧短杖 (wpn_shock_baton)

Owner: VFX Artist (T-A4) · 代理執行：Claude (Cowork loop)
Approved by: Terry · 2026-05-19-1530 outbox decision
Performance budget reviewer: Volt TA (T-P5) — 粒子總預算 ≤ 200

---

## 問題陳述（Why）

`wpn_shock_baton` 名為「電弧短杖」，但目前的視覺與機械都跟其他副槍**沒有差異**：
- 子彈只是一顆紫色球體（color `[0.65, 0.45, 1.0]`）
- 命中只有預設黃色 spark（ImpactSparksSystem 預設色）
- **沒有任何「電」的感覺** —— 沒有電弧、沒有鏈電、沒有電光抖動
- 玩家必須抽到「雷擊」附魔卡才會有鏈電，但這條卡只在升級抽卡才出現

結果：玩家選了電弧短杖之後第一反應是「啊？這跟其他武器有什麼不一樣？」

## 設計目標（What）

**讓「電弧短杖」一拿到就有電感，不需要附魔。**

| 元素 | 規格 | 預算 |
|---|---|---|
| **子彈外觀** | 飽和電光紫白色（從 `[0.65, 0.45, 1.0]` 改為更亮 `[0.80, 0.75, 1.0]` 帶白心）+ 子彈每幀微抖（±5% 大小、±3% 亮度），模擬電流不穩 | 純色彩變化，0 粒子 |
| **命中 spark** | 用既有 `ImpactSparksSystem.burst()`，色彩傳 `[0.75, 0.85, 1.0]`（電光藍白），粒子數 6 | ≤6 粒子/hit |
| **內建迷你鏈電** | **不需要附魔** — 每次命中，自動找最近 1 個敵人（4m 內），用既有 `LightningSystem.chain()` 畫弧並打 30% 子彈傷害。**僅 1 跳**，避免和雷擊附魔 (2/3/5 跳) 衝突 | 1 條 line + 1 點光，瞬時 |
| **疊加雷擊附魔** | 玩家如果再抽到雷擊附魔，**附魔的鏈電照常觸發**（額外 2/3/5 跳） — 兩者疊加，不取代 | 既有系統 |
| **發射 muzzle 閃光** | 既有 `MuzzleFlash` 加色彩參數，傳電光藍白 | 既有系統，色彩參數 |
| **不做** | 不加新粒子發射器、不加新材質、不加新音效（本輪 SFX 不在 scope） | — |

**總粒子預算估算：** 6 spark/hit + 1 chain arc = **遠低於 200 上限** ✅

## 完成判定（DoD）

Terry 在 Checkpoint B 測試：
1. 選到電弧短杖時，子彈外觀**立刻看出「這把是電」**（白心紫光、微抖）
2. 命中敵人時看到電光藍白 spark
3. 即使沒抽雷擊附魔，命中時也會跳一道電弧到隔壁敵人
4. 如果有抽雷擊附魔，可以看到「原本 1 跳 + 附魔 N 跳」的疊加

## 實作清單（給下一個 slice）

需要改的檔案：

1. `src/data/weapons.json`
   - 把 `wpn_shock_baton.bulletColor` 從 `[0.65, 0.45, 1.0]` 改為 `[0.80, 0.75, 1.0]`
   - 新增欄位 `signatureVFX: "electric"`（並更新 `schema-weapons.md` + `tools/validate-weapons.mjs`）

2. `src/weapon/AutoWeaponSpec.ts`
   - `WeaponSpec` 介面加 `signatureVFX?: "electric"`
   - 加入 `WEAPON_SPEC_FIELDS` 名單

3. `src/weapon/AutoWeapon.ts`
   - `fire()` 在 `pool.spawn()` 之後保留 `target` 與 `muzzleWorld` 給「on hit 內建鏈電」hook
   - 或更乾淨：把 `signatureVFX` 一起塞進 `SpawnOptions` → `ProjectileState`

4. `src/weapon/Projectile.ts`
   - `ProjectileState` 加 `signatureVFX?: "electric"`
   - 子彈每幀微抖（render scale 加 `±5% sin(t * 30 + offset)`）

5. **命中邏輯（要找）：** 找 projectile vs enemy 撞擊判定的地方（猜 `src/core/` 或 `src/scene/Arena.ts`）。在撞擊成功的當下：
   - 取代既有 spark 為帶色 spark（傳 shock baton 電光色）
   - 如果 `state.signatureVFX === "electric"`，找 4m 內最近敵人（排除被擊中的那隻），呼叫 `LightningSystem.chain(hitPos, [nearby], state.damage * 0.3)`

6. `tools/validate-weapons.mjs`
   - 加 `signatureVFX` 為允許欄位
   - 驗證 enum 限制：`"electric" | undefined`

## 風險與護欄

- **鏈電濫用：** 必須限制 1 跳，否則和「雷擊附魔」邏輯重疊 → 平衡破壞
- **效能：** 高射速（4.2/s）× 多敵人 → 同時的弧線數要看 `LightningSystem.arcs.length` 上限。如果突破 30 條同時存在，應該 early-return
- **顏色衝突：** `wpn_5l2`（連發衝鋒，青色 `[0.35, 0.95, 1.0]`）外觀接近 → 必須讓 shock baton 帶白心更亮，避免混淆
- **動畫不穩：** 子彈微抖如果太誇張會像 bug → 限制在 ±5% scale、±3% emissive

## 階段切片（給 scheduled task 用）

- [x] **Slice 1：** 寫此 brief + commit + push（**本 tick 完成**）
- [ ] **Slice 2：** 改 weapons.json 顏色 + 加 `signatureVFX` 欄位 + 更新 validator + schema
- [ ] **Slice 3：** 改 AutoWeaponSpec 介面 + Projectile state 加欄位 + 子彈微抖
- [ ] **Slice 4：** 找命中判定 + 加內建 1 跳鏈電 + 帶色 spark
- [ ] **Slice 5：** Build + browser runtime check + AGENT-RUNS 記錄完成
- [ ] **Slice 6：** 跳到 QA-03（換 task）

每 slice 後：`npm run validate:weapons` + `npm run build` + commit + push。

---

簽核：CAO Raven 審美術一致性（電光白 vs wpn_5l2 青色差異）／ Volt TA 審效能預算 ／ Combat Designer T-D3 審「1 跳鏈電」對手感影響。本輪由 Claude 自主執行至 Slice 5，遇 sign-off blocker 寫 inbox。
