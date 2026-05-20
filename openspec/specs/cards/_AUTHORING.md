# Cards Authoring Guide — 給 Terry / Systems Designer

## 為什麼這個目錄是空的（目前）

Launch brief 提到 18 張升級卡已實作於 prototype，但**沒有 single source of truth**：
- 卡的數值散落在 prototype code 各處
- 沒有單一檔案紀錄「為什麼這張卡存在」、「跟哪些卡有 synergy / conflict」
- 結果：要 balance / 加新卡的時候，沒有規格可改

## 規劃（兩階段）

### Phase 1：先把 18 張既有卡文件化（需要 Terry 拍板設計意圖）

每張卡寫一份 `card_<id>.md`，照 `_TEMPLATE.md` 格式。

**Terry 要做的事**（一張卡 5-10 分鐘）：
1. 從現有 prototype code 抓出數值（或請 Claude 從 src 自動抓）
2. 寫一段 Purpose（為什麼這張卡存在 / 服務什麼 build）
3. 列出 Scenario（特別是和其他卡 / 元素的疊加邏輯）
4. 拍板 weight / repeatable / prerequisite

### Phase 2：搬到 src/data/cards.json + validator

跟武器的 weapons.json migration 同樣流程：
1. 全部 18 張卡 spec 完成
2. Claude / Systems Designer 把卡資料整合進 `src/data/cards.json`
3. 寫 `tools/validate-cards.mjs`（驗 id 唯一、effect type 合法、prerequisite 存在等）
4. 加入 `npm run build` gate

## 已有的 3 張範例

我（Claude）寫了 3 張**範例卡** 給 Terry 當填空參考。**這些不是最終 canon**，Terry 必須審過：

- `upgrade_damage_basic.md` — 全武器傷害 +20%
- `upgrade_max_hp.md` — 最大 HP +25
- `upgrade_xp_magnet.md` — XP 拾取範圍 +50%

## 卡片設計三大紀律（從 launch brief 推出來的）

1. **不能違反核心循環** — 卡只能強化 殺撿升抽撐 的某一步，不能加新步驟
2. **不能變探險獎勵** — 卡是「升等抽」的產物，不是「探索得到」的產物（這是地圖的領地）
3. **3 選 1 不能讓玩家後悔** — 任意三張卡組合都應該有意義，不能有「明顯廢卡」

## Build Synergy Map（規劃）

未來可以建 `_SYNERGY-MAP.md` 列：
- 「火焰流」build：wpn_flamethrower + Fire tier 3 + damage_mul × 3 + ...
- 「鏈電流」：wpn_shock_baton + Lightning tier 3 + ...
- 「狙擊流」：wpn_8l + range_mul × 2 + ...

讓 Balance Architect 看得到哪些 build 太強 / 哪些太弱。

## 下一步動作

Terry 看過此檔，告訴我（Claude）下面三選一：
1. **「全部 18 張卡你自己生骨架」** — 我從 prototype code 反推數值寫 18 份 stub，你後續審
2. **「我自己一張一張寫」** — 我準備工具讓你方便填（例如 form-style 模板）
3. **「先擱著做別的」** — 卡 spec 等專案到 50% 完成度再開
