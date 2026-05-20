# 美術到 3D 管線

更新時間：2026-05-18

## 結論

可以做到，但要分成三個等級。

| 等級 | 現在能不能做 | 方法 | 產出 |
| --- | --- | --- | --- |
| Level 1：遊戲先有新內容 | 可以 | Three.js placeholder / procedural mesh | 新武器、新怪物、新特效先進遊戲測玩法 |
| Level 2：概念圖到規格 | 可以 | Concept prompt、參考圖、turnaround 規格、3D brief | 給 3D Specialist 或 Blender 使用的明確設計稿 |
| Level 3：Blender 自動建模/匯出 | 需要 Blender MCP 或 Blender Python | MCP 互動控制，或執行 `.py` 腳本輸出 `.glb` | 可匯入遊戲的模型資產 |

目前本環境沒有可用的 Blender MCP 工具。  
因此短期採用 Level 1 + Level 2，並建立 Level 3 的 fallback 腳本。

## 角色流程

```text
CEO / CTO / CAO 決定本輪主題
        ↓
Concept Artist 產出概念 prompt / 參考圖需求 / silhouette
        ↓
CAO Raven 審查風格是否符合世界觀
        ↓
3D Specialist 產出模型規格：尺寸、poly budget、材質、LOD、碰撞
        ↓
Blender MCP 或 Blender Python 產出 blockout / lowpoly GLB
        ↓
Animation Director 定義 idle / walk / attack / death / reload 等狀態
        ↓
VFX Artist 定義 muzzle / hit / death / elemental 特效
        ↓
Volt TA 做效能預算審查
        ↓
Gameplay Programmer 接進 `src/`
        ↓
QA / Terry 測試
```

## 資料夾

| 路徑 | 用途 |
| --- | --- |
| `art/concepts/` | 概念 prompt、AI 圖、草圖 |
| `art/references/` | 參考圖與風格資料 |
| `art/model-briefs/` | 給 3D Specialist 的模型規格 |
| `art/blockouts/` | Blender / procedural blockout |
| `art/animation-briefs/` | 動作列表與狀態機 |
| `art/vfx-briefs/` | 特效規格與粒子預算 |
| `tools/blender/` | Blender Python 腳本 |
| `public/assets/custom/` | 通過審核後匯入遊戲的自製資產 |

## 現在可做的美術內容

### 新武器

先做 gameplay prototype：

- 使用現有 GLB 或 primitive placeholder。
- 加入 `src/data/weapons.json`。
- 通過 `npm run validate:weapons`。
- 加入卡片池測試。

再做美術：

- Concept Artist 產 weapon sheet prompt。
- 3D Specialist 寫 model brief。
- Blender 產低模 `.glb`。
- 替換 JSON `url`。

### 新怪物

先做行為 prototype：

- 使用 `EnemyTypes.ts` placeholder：box / cone / sphere / capsule。
- 定義血量、速度、傷害、unlockAt、特殊行為。

再做美術：

- Concept Artist 產 monster bestiary prompt。
- 3D Specialist 定義比例、骨架需求、碰撞半徑。
- Animation Director 定義 idle / chase / attack / death。

### 新關卡

先做場景 prototype：

- 以 `Arena.ts` 加 arena variant。
- 先用柱子、牆、低矮掩體、路徑區做可玩布局。

再做美術：

- Environment Artist 定義地圖主題。
- 3D Specialist 做 modular pieces。
- Volt 檢查 draw call / triangle budget。

### 新特效

先做程式特效：

- Three.js particles / rings / trails。
- 限制粒子數與材質數。

再做美術：

- VFX Artist 定義色彩、壽命、大小、粒子預算。
- Volt 簽核。

## Blender MCP 解法

如果你要達到「3D Specialist 真的控制 Blender」的畫面，需要安裝/啟用 Blender MCP。

啟用後的理想流程：

1. Codex / Claude 寫 model brief。
2. Blender MCP 開啟 Blender scene。
3. 依 brief 建立 mesh / material / camera / light。
4. 匯出 `.glb` 到 `public/assets/custom/`。
5. Codex 更新 JSON / code。
6. Build + runtime test。

## 沒有 Blender MCP 的替代方案

使用 Blender Python 腳本：

```powershell
blender.exe --background --python tools/blender/create_blockout_weapon.py
```

優點：

- 可重跑。
- 可寫入 Git。
- 可保留紀錄。

限制：

- 不像 MCP 那樣互動。
- 需要本機 Blender path 正確。
- 複雜造型仍需要人工或 AI 圖輔助。

## 第一個可執行美術任務

`ART-01：Shock Baton 新武器概念與 blockout`

目的：

- 做第一個完整美術交接樣板。
- 不先追求漂亮，先驗證管線。

產出：

1. Concept prompt。
2. Model brief。
3. Blender blockout script。
4. Game weapon JSON row。
5. Runtime test。
