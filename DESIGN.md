# Gorilla Gun Survivor — Design Document

> 給接手的開發者 / AI 看的設計脈絡。資料表的數值都從 `src/` 抽出來，會跟 code 漂移；要實際決策請以 code 為準。

---

## 1. 高層定位

| 維度 | 設定 |
| --- | --- |
| **類型** | 3D first-person roguelike survivor |
| **參考** | Vampire Survivors / Brotato 的核心 loop + Doom 那種貼地 FPS 感 |
| **世界觀** | 這個世界的居民都是用手爬行的大猩猩。怪潮從外湧入，玩家是站出來反擊的那一隻 |
| **賣點** | 視角極低（貼地 0.9–1.1m），武器掛前肢 — 體感跟一般 FPS 完全不同 |
| **平台** | Web（Three.js）。手機暫不支援 |
| **單局長度** | 目標 5–10 分鐘 |
| **狀態** | Prototype（Step 11 完成，見 §9 路線圖） |

---

## 2. 核心循環

```
單局內：移動 → 殺怪 → 撿經驗球 → 升等抽卡 → 變強 → 撐更久
       ↓ 死亡
跨局：     換 Essence → MetaMenu 永久升級 → 下次更強
```

- **時間就是難度**：無 wave 制，所有怪物 / 數值跟 `gameTime` 走（見 §6 Difficulty）
- **抽卡是火力主來源**：基礎武器很弱，靠抽卡組合堆出 build
- **Meta 是耐受度**：永久升級給你「不要每局都從零開始」的容錯

---

## 3. 世界 / 角色 / 視角

- **世界**：這個宇宙的智慧生命都是用手爬行的大猩猩，這是常態而非異象。怪潮從某處湧入，玩家是反擊的一份子
- **玩家**：一隻大猩猩 — 四肢著地、前肢握槍
- **相機**：第一人稱，眼睛高度 0.9–1.1m（貼地）
- **武器位置**：掛 `前肢` 上（不是肩膀也不是手腕），所以晃動感跟一般 FPS 不一樣
- **移動**：WASD + 滑鼠視角；Space 跳；無蹲、無衝刺
- **競技場**：80m 圓形開放場，邊界內隨機散落柱狀障礙物（`Arena.ts`）

---

## 4. 武器系統

### 4.1 主武器（`MainGun.ts`）
- 左鍵連發
- 升級卡可加：傷害、射速、子彈速度、單發子彈數、爆頭傷害…等
- 一定機率觸發雷擊連鎖 / 雷暴 / 額外鏈擊（升級卡解鎖）

### 4.2 副武器（Auto，`AutoWeapon*`）
- 自動瞄準範圍內最近敵人開火，不吃左鍵
- 最多同時 N 把（`AutoWeaponManager`）
- 抽到武器卡 = 多一把（unique，已持有不會再出）

**目前 7 把副武器**（`weapon/AutoWeaponSpec.ts`）：

| ID | 名字 | DMG mul | RoF (/s) | 射程 (m) | 風格 |
| --- | --- | --- | --- | --- | --- |
| `wpn_basegun_b` | 雙管副槍 | 0.8× | 3.0 | 15 | 黃色平均型 |
| `wpn_basegun_c` | 緊緻手槍 | 0.55× | 5.0 | 12 | 白色高射速 |
| `wpn_basegun_d` | 重型手砲 | 2.0× | 1.1 | 22 | 紅色高傷慢射 |
| `wpn_5l2` | 連發衝鋒 | 0.45× | 6.5 | 10 | 青色機槍 |
| `wpn_8l` | 長筒狙擊 | 3.0× | 0.75 | 30 | 紫色穿透 |
| `wpn_flamethrower` | 火焰噴射器 | 0.55× | 8.0 | 8 | 橘色貼臉 |
| `wpn_explosivecrossbow` | 爆裂弩砲 | 2.4× | 0.95 | 18 | 綠色重弩 |

### 4.3 元素系統（`weapon/Elements.ts`）
4 種元素 × 3 階，命中時觸發：

| 元素 | T1 | T2 | T3 |
| --- | --- | --- | --- |
| 🔥 灼傷 | 5 DPS × 3s | 10 DPS × 3s | 18 DPS × 4s |
| ❄️ 冰凍 | -40% × 2s | -55% × 2.5s | -75% × 3.5s |
| ☠️ 毒霧 | 3m / 5 DPS × 3s | 4m / 10 DPS × 4s | 5m / 18 DPS × 5s |
| ⚡ 雷擊 | 連鎖 2 / 12 傷 | 連鎖 3 / 20 傷 | 連鎖 5 / 30 傷 |

---

## 5. 升級卡池（`progression/UpgradeCards.ts`）

**目前 18 張卡**，分四種稀有度：

| 稀有度 | 數量 | 用途 |
| --- | --- | --- |
| `common` | 9 | 純數值（HP、傷害、移速、回血、雙連發…） |
| `rare` | 6 | 機制（連鎖閃電機率、雷暴、爆頭加倍…） |
| `weapon` | 7（動態生成） | 解新副武器（unique） |
| `attribute` | 1 | 元素附魔（觸發 §4.3 元素） |

**抽卡規則**（`pickThree`）：
- 升等時三選一
- `unique` 卡（武器、元素）持有後不會再抽到
- `canPick(game)` 過濾不適用情境（例：副武器已滿）

---

## 6. 怪物系統

### 6.1 怪物種類（`enemy/EnemyTypes.ts`）

10 種，依 `unlockAt` 解鎖時間進場：

| Type | HP | 速度 | 觸碰傷 | 解鎖 | 特性 |
| --- | --- | --- | --- | --- | --- |
| `grunt` | 45 | 2.0 | 5 | 0s | 入門小兵 |
| `fast` | 32 | 3.5 | 4 | 15s | 高速貼身 |
| `rusher` | 55 | 2.2→6.5 | 15 | 25s | **12m 內 homing 衝撞 + 自爆**，嗶嗶警告 |
| `scout` | 38 | 2.8 | 5 | 30s | 中速兵 |
| `ranged` | 60 | 1.2 | 0 | 35s | 紫彈遠程 14m，keep 9m |
| `bomber` | 40 | 2.0 | 0 | 45s | **3m 內讀秒 1.2s → AOE 3.5m / 25 傷**（脫離取消） |
| `heavy` | 130 | 1.5 | 10 | 50s | 厚血肉盾 |
| `caster` | 85 | 1.0 | 0 | 55s | 橘彈遠程 17m / 14 傷 |
| `brute` | 200 | 1.3 | 12 | 80s | 重砲手 |
| `miniboss` | 900 | 1.7 | 28 | 120s | **Boss bar + 紅染警告**，掉 50% 心 / 25% 寶箱 |

### 6.2 編號替身系統
- glb 缺失時可走 `placeholder: { geometry, color, emissive }` 生 primitive
- Rusher / Bomber 目前用 placeholder（cone / sphere），之後填 `url` 就能換 glb
- **無 silent fallback**：兩個都沒設 → throw（fail-loud）

### 6.3 難度成長（`enemy/Difficulty.ts`）

| 維度 | 公式 | 備註 |
| --- | --- | --- |
| 怪 HP | `1.18^(t/30)` | +18% / 30s，無上限 |
| 怪傷害 | `1.10^(t/45)` | +10% / 45s |
| 怪速度 | `min(1.5, 1 + 0.5·t/180)` | 線性，硬上限 1.5× |
| Spawn interval | `max(0.4, 1.8·0.9^(t/30))` | 1.8s → 最快 0.4s |
| 場上上限 | `min(80, 35 + ⌊t/60⌋·5)` | 35 起跳 → 80 封頂 |
| XP 球階加成 | `min(2, ⌊t/60⌋)` | 0–59s +0 / 60–119s +1 / 120s+ +2 |

### 6.4 掉落
- XP 球：每怪固定掉，數量看 `xpCount`，顏色看 `xpTier`（綠 1 / 藍 5 / 紫 15 XP）
- 心（補血 25 HP）：3–5% 機率
- 寶箱（觸發抽卡）：0.5–25% 機率（miniboss 25%）

---

## 7. Meta 系統（`progression/Meta.ts`）

**儲存**：`localStorage` key `gorilla-gun-survivor/meta/v2`

**永久升級**：

| ID | 名字 | 等級上限 | Cost 表 | 效果 |
| --- | --- | --- | --- | --- |
| `hp` | 🛡️ 肉身強化 | 5 | 8/16/28/46/72 | 起始 HP +15 / 級（總 +75） |
| `damage` | ⚔️ 基礎火力 | 5 | 8/16/28/46/72 | 子彈傷害 +3 / 級（總 +15） |
| `xp` | 📈 經驗加乘 | 3 | 18/40/90 | 每顆經驗球 +1 XP（總 +3） |
| `weapon` | 🔫 起始副武器 | 1 | 40 | 開局直接帶 1 把隨機副武器 |

**Essence 公式**（單局結算）：
```
essence = ⌊kills/3⌋ + max(0, level-1)·2 + ⌊time/30⌋
```

---

## 8. 技術架構

### 8.1 主迴圈（`core/Game.ts`）
- `requestAnimationFrame` → `time.update(dt)` → 所有系統 `update(dt)` → `cameraShake.apply` → `renderer.render`
- 暫停（`paused`）只凍結 `dt`，不停 raf
- 死亡（`dead`）凍結邏輯，仍渲染

### 8.2 命名規則 / 慣例
- TypeScript ESM，`import` 一律帶 `.js` 副檔名（Vite 要求）
- 系統 class 名 PascalCase，檔名跟 class 一致
- 純資料表（怪物、武器、卡）放 `export const XXX_DATA: Record<…>`
- 池化物件（Projectile / EnemyProjectile / XpOrb）走 `Pool` 後綴 class

### 8.3 已用 / 不用
- ✅ Three.js raw API、WebAudio（音效合成）、`localStorage`、GLTFLoader
- ❌ 無物理引擎（碰撞自手刻 circle vs circle / capsule vs cylinder）
- ❌ 無第三方 ECS / state management
- ❌ 無音檔（`SfxSystem` 全 WebAudio 合成）

### 8.4 已知技術債
- HUD 左上角文字 stuck 在 "Step 09 — …"，進度追上沒改
- Rusher / Bomber 還是 placeholder primitive，glb 沒接
- Miniboss spawn 沒接 CameraShake（只有 BossBar 警告）
- 元素持續粒子未做（fire / ice DoT 期間沒有持續粒子）
- ExplosionRing 只有單層環，可加第二層內緣 + 中心閃光

---

## 9. 路線圖（南瓜 2026-04-20 拍板）

### 優先 1 — 下個 session：**P2 掉落 / 寶箱深化**
- 補血道具 Heart pickup（恢復 25 HP）已實作，調整機率 / 視覺
- 隨機寶箱開啟觸發**選卡**（不是被動掉升級）
- 結算畫面增強：分數、擊殺、最長存活、武器清單

### 優先 2 — 下下個 session：**新武器卡池 + Step 10 剩下音訊**
- 新武器：霰彈槍（5 發扇形）/ 火箭筒（AOE）/ 手裡劍（多連發）/ 刀片（穿透迴旋）
- 連鎖閃電獨立成武器卡（目前是 rare 機率觸發）
- 子彈外型多樣化（geometry / trail）
- 3D 空間音（AudioListener + PannerNode）
- BGM（low drone + LFO filter + 2s 低鼓）

### 優先 3 — 效能優化
- Shadow / drawcall / instancing 盤點
- Light 數量、material 共享
- 粒子系統檢討

### 優先 4 — P3 長期
- 戰鬥地圖風格重做（地形 / 光照分區）
- 陷阱（火焰噴射、地刺、大鐮刀）
- Boss 招式擴充
- 玩家角色多選 / 大猩猩造型可解鎖

---

## 10. 接手 AI / 開發者守則

南瓜的工作偏好（**重要**）：

1. **繁體中文台灣用語**，保留專有名詞英文（HP、buff、spawn、AOE…等）
2. **「先設計後實作」** — 動工前先列數值 / FSM / 資料結構 / 開放選項讓南瓜裁決，**拍板才動 code**
3. **每做完一個可測單元就停下來讓南瓜測**，不要一次堆一大包
4. 工作夥伴語氣，不要官腔
5. 偏好條列、表格、可直接執行的步驟
6. Preview 驗證抓 console 錯誤就好，3D 場景截圖常 timeout

---

## 11. 版本快照

- `snapshots/v01_baseline/` — 難度系統完成 / miniboss 未強化 / XP 單色 的版本
- 還原方式：`rm -rf src && cp -r snapshots/v01_baseline/src src`
- 目前主版本已超越 v01：miniboss 強化 + XP 三階 + Rusher + Bomber + 編號替身

---

_文件最後同步：commit `7c045af`（trigger pages deploy）_
