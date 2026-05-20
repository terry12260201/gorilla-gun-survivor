# Claude + Blender MCP Task 01：電弧短杖升級版

## 目標

請使用 Blender 5.1 建立 `電弧短杖` 的遊戲用 3D 模型，作為目前 `shock_baton_blockout.glb` 的美術升級版。模型需要能在俯視角射擊遊戲中被辨識，不追求高面數寫實，優先追求清楚輪廓、螢光電弧感、低成本渲染。

## 輸出位置

- Blender 原始檔：`art/blockouts/shock_baton_v2.blend`
- GLB 輸出：`public/assets/custom/shock_baton_v2.glb`
- 截圖預覽：`art/previews/shock_baton_v2.png`

## 視覺規格

- 主體：短杖 / 電擊棒 / 近未來巡邏武器。
- 輪廓：中間握把明確，兩端有金屬電極，頂端有發光核心。
- 色彩：深色金屬、紫色能量槽、螢光綠或藍紫電弧。
- 可讀性：在小尺寸遊戲畫面中仍能看出「這是一把電擊短杖」。
- 風格：不要過度寫實，偏向低面數乾淨造型，能配合 WebGL 即時顯示。

## 技術規格

- 格式：GLB。
- 建議面數：低到中等，不超過 8k tris。
- 原點：模型中心放在世界原點。
- 尺寸：長度約 1.8 Blender units。
- 材質：至少 3 個命名材質：
  - `mat_dark_metal`
  - `mat_purple_energy`
  - `mat_lime_emissive`
- 若可建立骨架，先建立簡單 2-bone 或 3-bone rig 即可；此任務不要求完整角色動畫。

## 驗收條件

1. `public/assets/custom/shock_baton_v2.glb` 可被 Three.js 載入。
2. 模型沒有遺失材質或破面。
3. 在遊戲的武器卡或場景預覽中，外型比 `shock_baton_blockout.glb` 更容易辨識。
4. 檔案大小合理，避免超大型貼圖。
5. 完成後請回報：輸出檔案、面數、材質清單、是否含骨架。

## 給 Terry / Codex 的接回步驟

1. 確認 GLB 存在於 `public/assets/custom/shock_baton_v2.glb`。
2. 將 `src/data/weapons.json` 的 `wpn_shock_baton.url` 從 `/assets/custom/shock_baton_blockout.glb` 改成 `/assets/custom/shock_baton_v2.glb`。
3. 執行 `npm run validate:weapons`。
4. 執行 `npm run build`。
5. 更新 `studio/dashboard/terry-progress.html` 與 Obsidian 筆記。
