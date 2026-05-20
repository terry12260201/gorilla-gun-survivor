# GPT Image 2 → Blender → Game 美術管線

## 原則

之後每個新武器、新怪物、新角色、新關卡物件與重要特效，都先經過 `GPT Image 2` 產出概念圖，再交給 Blender 做 3D 模型、材質與貼圖，最後才進遊戲。

這條流程的目的不是讓圖片自動完美變成模型，而是讓 3D 端有穩定參考：

1. 先確認外型、輪廓、色彩與材質方向。
2. 再拆成 front / side / 3/4 view、貼圖與材質需求。
3. Blender 依概念圖建低面數模型。
4. 需要貼圖時，由概念圖或額外 texture prompt 產出 base color / emissive / roughness 方向。
5. 匯出 GLB，接進 `public/assets/custom/`。

## 官方 API 判斷

- 使用模型名稱：`gpt-image-2`。
- 單張圖片生成適合走 Image API：`/v1/images/generations`。
- 需要多輪修改時，可走 Responses API 的 image generation tool。
- 生成結果預設可拿到 base64 圖片資料，專案腳本會存成 PNG。
- 使用前可能需要 OpenAI API Organization Verification。

參考：

- https://developers.openai.com/api/docs/models/gpt-image-2
- https://developers.openai.com/api/docs/guides/image-generation

## 資料夾規範

| 位置 | 用途 |
| --- | --- |
| `studio/art-pipeline/briefs/` | GPT Image 2 產圖 brief |
| `art/concepts/` | 產出的概念圖、prompt、metadata |
| `art/model-briefs/` | 給 Blender / Claude MCP / 3D Specialist 的建模規格 |
| `art/textures/` | 產出或加工後的貼圖 |
| `art/blockouts/` | Blender 原始檔與 blockout |
| `public/assets/custom/` | 遊戲實際讀取的 GLB |

## 每個設計的固定流程

1. `Concept Brief`
   - Codex / Terry 寫出用途、玩法、風格、輪廓、色彩、材質、禁忌項目。
2. `GPT Image 2`
   - 產出概念圖，至少一張 reference sheet。
3. `CAO Review`
   - 確認是否看得懂、是否適合俯視角、是否符合玩法。
4. `Model Brief`
   - 將圖片拆成 Blender 可執行規格：尺寸、primitive、材質、貼圖、骨架需求、poly budget。
5. `Blender`
   - 優先使用 Claude + Blender MCP；若 MCP 不穩，用 Blender Python background script。
6. `Texture / Material`
   - 需要貼圖時產生 base color、emissive、roughness 或用 Blender procedural material。
7. `GLB Export`
   - 匯出到 `public/assets/custom/`。
8. `Game Integration`
   - 更新 JSON 或程式引用，執行 validate/build。
9. `Terry QA`
   - 在遊戲內測辨識度、效能、手感與趣味。

## 指令

```powershell
npm run art:concept -- studio/art-pipeline/briefs/shock-baton-v2.json
```

需要環境變數：

```powershell
$env:OPENAI_API_KEY="你的 key"
```

## 圖片轉 3D 的現實限制

GPT Image 2 會產生圖片，不會直接產生可用 GLB。圖片轉模型需要中間步驟：

- 人工或 AI 讀圖後寫 Blender Python。
- Claude + Blender MCP 根據圖片與 model brief 建模。
- 需要更高級的 image-to-3D 時，另接 Rodin / Tripo / Meshy / Hunyuan3D 這類 3D 生成服務，再由 Blender 清理與降面。

本專案目前採用穩定方案：

- 概念圖：GPT Image 2。
- 模型：Claude + Blender MCP 或 Codex Blender Python。
- 貼圖：GPT Image 2 產 texture reference，Blender 製作 procedural / baked material。
- 匯入遊戲：GLB + JSON / Three.js。
