# Gorilla Gun Survivor — Web Edition

> 怪物從黑暗深處湧出。你是這片戰場上唯一還拿得起槍的大猩猩 —— **撐下去，殺出去，否則就被吃掉。**

**🎮 立刻試玩** → <https://terry12260201.github.io/gorilla-gun-survivor/>

---

## 這是什麼遊戲？

3D first-person **roguelike survivor**。是 Meta Quest 上同名 VR 遊戲 [**Gorilla Gun: SURVIVOR**](https://www.meta.com/zh-tw/experiences/gorilla-gun-survivor/25330246106588143/) 的 **PC 網頁版本**。

> ⚠️ 這版**不是 VR**，是 PC 鍵鼠操作。世界觀、節奏、調性沿用 VR 版本 — 換個輸入方式而已。

### 核心循環

```
進場 → 怪潮湧來 → 邊爬邊射 → 殺怪掉經驗 → 升等抽卡
   ↑                                              ↓
   └── 下次更猛 ← Essence 永久升級 ← 死掉 ← 火力疊到離譜
```

**一句話**：殺怪、撿經驗、升等、抽卡、組合越來越歪、撐到 boss、被輾、Essence 強化、再來。

### 為什麼這不是普通 FPS

- **貼地戰場感** — 視角不到 1.1m，武器掛在前肢，整個世界的尺度跟一般 FPS 不一樣
- **雙射擊系統並進** — 左鍵主武器靠瞄準（skill shot），副武器自動瞄敵開火（auto-fire），同時跑、不互搶
- **越打越歪** — 火 / 冰 / 毒 / 雷 四種元素 × 三階附魔，連鎖閃電可以一閃打 5 隻，build 組合空間很大
- **壓力會一直升** — 怪會嗶嗶警告衝來自爆、會讀秒在你腳邊炸 AOE、難度跟著時間指數成長，沒有 wave 喘息時間
- **撐到 120 秒**才會看到 **miniboss** 紅暈警告 — 那才算「入門」

### 目前內容

| 系統 | 量 |
| --- | --- |
| 副武器 | **7 把**（手槍、衝鋒、狙擊、火焰噴射、爆裂弩砲…） |
| 升級卡 | **18 張**（傷害 / 機制 / 元素 / 武器） |
| 元素附魔 | **4 種 × 3 階** |
| 怪物種類 | **10 種**（含 rusher 衝撞、bomber 自爆、miniboss） |
| Meta 永久升級 | **4 條**，最多 14 級 |
| BGM / 音效 | WebAudio 即時合成（無音檔） |

---

## 操作（PC 鍵鼠）

| 按鍵 | 動作 |
| --- | --- |
| **WASD** | 移動 |
| **Space** | 跳 |
| **滑鼠** | 轉視角 / 瞄準 |
| **左鍵** | 主武器射擊（副武器自動瞄準，不用顧） |
| **ESC** | 暫停 |
| **TAB（按住）** | 看本局已抽升級 |

第一次點畫面會鎖定滑鼠（pointer lock），ESC 解開。

---

## 本機開發

需要 Node.js 18+。

```bash
git clone https://github.com/terry12260201/gorilla-gun-survivor.git
cd gorilla-gun-survivor
npm install
npm run dev   # → http://127.0.0.1:5173/
```

### 其他指令

```bash
npm run build           # tsc 型別檢查 + Vite production build → dist/
npm run preview         # 用 build 結果在 5173 預覽
npm run convert:assets  # FBX → glTF（tools/convert-fbx.mjs）
```

---

## 部署（GitHub Pages 自動化）

push 到 `main` 分支會自動觸發 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，build + 部署一條龍，網址不變、自動覆蓋。

**第一次部署前必做**（已設過，後續不用再動）：repo 的 **Settings → Pages → Build and deployment → Source** 改成 **GitHub Actions**。

Vite `base` path 由 workflow 注入的 `VITE_BASE` 環境變數動態設定，AssetLoader 已套 `BASE_URL` — 本機跑 `/` / Pages 部署跑 `/gorilla-gun-survivor/`，**兩邊不用改 code**。

---

## 技術棧

**Vite + TypeScript + Three.js** — 純手刻，沒用遊戲引擎、沒用物理引擎、沒有音檔（所有音效都是 WebAudio 即時合成的低 / 高頻 sweep + 噪音 crack）。

```
src/
├── core/        Game / Input / Time（主迴圈、輸入、時間）
├── scene/       SceneRoot / Arena / Skybox
├── player/      PlayerController / PlayerHealth
├── weapon/      MainGun + 副武器系統 + 子彈池 + 元素 + 閃電 + 毒雲
├── enemy/       Enemy / EnemyManager / EnemyTypes / Difficulty
├── progression/ LevelSystem / Meta / Pickup / UpgradeCards / XpOrb
├── ui/          Hud / UpgradePanel / PausePanel / BossBar / MetaMenu
├── fx/          DeathBurst / ImpactSparks / ExplosionRing / CameraShake
└── audio/       SfxSystem（WebAudio 合成）
```

設計脈絡、系統表、武器 / 怪物 / 卡片完整資料、難度公式、Meta cost、路線圖、給接手 AI 的守則 → 看 [`DESIGN.md`](./DESIGN.md)。
歷次 session 修改紀錄 → 看 [`HANDOFF.md`](./HANDOFF.md)。

---

## License

未指定（私人 prototype）。
