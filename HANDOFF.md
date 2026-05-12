# Gorilla Gun Survivor Web — Handoff

**最後更新：2026-04-20**

---

## 專案基本資訊

- **路徑**：`F:\PumpkinCase_2026\Gorilla Gun Survivor\gorilla-gun-survivor-web\`
- **技術棧**：Vite + TypeScript + Three.js
- **啟動**：`npm run dev`（Vite preview 預設 port 5173）
- **玩家角色**：大猩猩（無腿、以手爬行），視角低 0.9~1.1m，武器掛「前肢」位置
- **素材**：`F:\PumpkinCase_2026\Gorilla Gun Survivor\Model\All_0417\`（glb）

---

## 上個 session（Step 10）完成的內容

- **Meta 升級系統**（MetaMenu、4 項升級、essence 累積）
- **P0 難度成長系統**（Difficulty.ts，HP/傷害/速度/spawn 隨時間拉升）
- **P0 Miniboss 威嚇感**（HP 900、紅染、出場紅暈警告）
- **XP 三階系統**（綠 1 / 藍 5 / 紫 15）
- **Caster 彈改橘色、pickup grace 0.35s**

---

## 這個 session（Step 11）完成的內容 — P2 怪物種類擴充

### 編號替身系統（#12）
- `EnemyTypeData` 新增 `url?` / `modelId?` / `placeholder?` / `rusher?` / `bomber?` 欄位
- `EnemyManager.ensureTemplate` 分支：有 `url` 走 glb；否則走 `placeholder` 生 primitive（box/cone/cylinder/sphere/capsule）；都沒有則 throw（fail-loud）
- `buildPlaceholder`：primitive + MeshStandardMaterial，保留現成的 hit flash / burn / slow 染色邏輯
- 未來換 glb：填 `url` 即可，`placeholder` 可留可刪

### 衝鋒怪 Rusher（#10）
- 紅色 cone placeholder；hp 55 / touchDamage 15 / base 2.2 / rushSpeed 6.5 / detectRange 12m
- 進偵測距離觸發 rush（**持續追蹤玩家 homing**），撞到玩家 **自毀**
- **嗶嗶聲警告**：`SfxSystem.rusherBeep(urgencyK)`，間隔隨距離動態（12m→0.4s / 0m→0.1s），音高 700→1500Hz
- **撞擊自爆**：雙層 ImpactSparks + DeathBurst 橘紅 + `rusherBoom`（低 sawtooth sweep + 600Hz bandpass 噪音 crack）+ CameraShake 0.15s amp 0.15

### 自爆怪 Bomber（#11）
- 橘色 sphere placeholder；hp 40 / touchDamage 0 / fuseRange 3m / fuseTime 1.2s / aoeRadius 3.5m / aoeDamage 25
- FSM：chase → fuse（進 3m 停下讀秒，`moveDuringFuse=0`）→ explode（時間到 / 被打死都觸發）
- 脫離 4.5m（fuseRange × 1.5）**取消 fuse 回 chase**
- **fuse 視覺**：emissive 紅脈動 + 體積 ±14% 脈動，頻率 6Hz→20Hz 隨讀秒進度加倍
- **fuse 音**：共用 `rusherBeep` callback（間隔 0.35s→0.13s）
- **爆炸效果**：`ExplosionRing` 擴張橘環 + 雙層 ImpactSparks + DeathBurst + `bomberBoom`（140→28Hz sawtooth + 1800→200Hz lowpass 噪音 tail，~0.6s）
- **CameraShake 兩檔**：範圍內 0.28s/amp 0.22；邊緣 1.8× 半徑內 0.15s/amp 0.08
- **AOE 只傷害玩家**，不傷害其他怪（避免連鎖）
- **Q-rules 記錄**：Rusher 持續追蹤（非鎖定直線）/ Bomber fuse 完全停下 / 脫離取消 fuse / url 缺失時明確走 placeholder（不 silent fallback）

### 基礎設施新檔
- `src/fx/CameraShake.ts`：獨立衰減式 shake，強震覆蓋弱震，`apply(dt, camera)` 在 render 前疊加 offset
- `src/fx/ExplosionRing.ts`：地面擴張橘環 VFX，0.5s 生命週期，scale 從 10% 擴到 100% AOE 半徑

### EnemyManager 新增 callback
- `onRusherBeep(urgencyK)` — Rusher / Bomber fuse 共用
- `onRusherContact(pos)` — Rusher 撞擊自毀事件
- `onEnemyExplosion({ pos, radius, damage })` — Bomber 爆炸事件

### Enemy.pendingExplosion
- 不論爆炸從哪條路徑觸發（fuse 時間到 / bullet hit 死 / burn DoT 死），都透過 `pendingExplosion` payload 統一派發
- EnemyManager 每 frame 在所有死亡判定後 sweep，先派發再 cleanup

---

## v01 baseline 備份

**位置**：`snapshots/v01_baseline/`（含 src + 設定檔）

**還原方式**（僅在需要時）：
```bash
cd "F:\PumpkinCase_2026\Gorilla Gun Survivor\gorilla-gun-survivor-web"
rm -rf src
cp -r snapshots/v01_baseline/src src
```

> 注意：v01 是「難度系統完成、miniboss 未強化、XP 還是單色」的版本。目前主專案已經超越 v01 完成 miniboss + XP 三階 + P2 怪物種類擴充（Rusher / Bomber / 編號替身）。

---

## Pending Roadmap（南瓜 2026-04-20 更新的路線）

### 優先 1 — 下個 session 接著做：P2 掉落 / 寶箱
- **補血道具 Heart pickup**（恢復 25 HP，低機率怪物掉落）
- **隨機寶箱**（低機率怪物掉落，開啟觸發選卡）
- **結算畫面增強**（分數、擊殺、最長存活、武器清單 — 目前有陽春版可加強）

### 優先 2 — 下下個 session：新武器卡池 + Step 10 剩下音訊
- **新武器卡**：
  - 霰彈槍（5 發扇形）
  - 火箭筒（AOE 爆炸）
  - 手裡劍 / 大手裡劍（升級多連發）
  - 刀片（穿透迴旋）
  - 連鎖閃電獨立成武器卡
  - 子彈外型多樣化（geometry / trail）
- **3D 空間音**（SfxSystem 加 AudioListener + PannerNode；enemyDeath / autoFire / lightning / rusherBoom / bomberBoom / rusherBeep 走空間化）
- **BGM**（low drone + LFO filter + 2s 一次低鼓）

### 優先 3 — 效能深入優化
- Shadow / drawcall / instancing 盤點
- Light 數量、material 分享
- 粒子系統檢討

### 優先 4 — P3（長期）
- 戰鬥地圖風格重做（地形 / 光照分區）
- 陷阱（火焰噴射、地刺、大鐮刀）
- Boss 招式擴充

---

## 南瓜偏好提醒

- **繁中台灣用語**，保留專有名詞英文
- 優先條列、表格、可直接執行的步驟
- **「先設計後實作」**—— 動工前先對齊細節、列數值 / FSM / 資料結構 / 開放選項給南瓜裁決，得到拍板才動程式
- **每做完一個可測單元就停下來讓南瓜測**，不要一次堆一大包
- 工作夥伴語氣，不要官腔
- Preview 驗證抓 console 錯誤即可，3D 場景截圖常 timeout

---

## 已知小問題 / 技術債（非阻塞）

- **Hud 左上角說明文字過時**（還是「Step 09 — …」），進度追上再改
- **Rusher / Bomber 用 placeholder primitive**，之後可換 glb（透過 `EnemyTypeData.url` 欄位直接填路徑，placeholder 可留可刪）
- **Miniboss 出場還沒接 CameraShake**（現在只有 BossBar 紅暈警告；CameraShake 系統已存在，只需在 `onBossSpawn` handler 呼叫 `cameraShake.trigger` 即可補上臨場感）
- **Bomber fuse tint 優先度**：fuseTint 蓋過 burn / slow tint，flash（被打中）仍優先（順序：flash > fuseTint > burn > slow > default）
- **元素持續粒子未做**（燒中每 0.15s 冒橘煙、凍結每 0.2s 放藍晶）— 目前 Game.onElementHit 只噴一次性 ImpactSparks；若要補 DoT 期間持續粒子，要在 Enemy.update burn/slow timer tick 時呼叫粒子 spawn
- **ExplosionRing** 目前只有一層環；若覺得氣勢不夠可加第二層延遲 0.1s 的環（內緣）或中心閃光 sprite
