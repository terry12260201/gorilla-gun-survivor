# AGENTS.md — AI 工作流程（給所有 AI agent 必讀）

任何 AI 工具（Claude Code、Codex、Cursor、Copilot、Gemini CLI）進入 Gorilla Gun Survivor 專案，**第一件事讀這個檔案**，再讀 `project.md` 拿背景。

## 你會看到什麼

```
openspec/
  project.md                       # 專案背景、tech stack、紅線
  AGENTS.md                        # 本檔案（你正在讀）
  specs/                           # ✅ 真相來源 — 系統目前該長什麼樣
    weapons/wpn_*.md               # 8 把武器
    enemies/<type>.md              # 11 種敵人
    elements/<element>.md          # 4 種元素
    cards/<card>.md                # 18 張升級卡（待補）
    meta-progression/<track>.md    # 4 條 meta 升級（待補）
    systems/<system>.md            # 5+ 跨系統規格
    maps/<map>.md                  # 地圖規格
  roles/                           # 團隊成員 prompt（30+ 份）
    c-suite/                       # 4 位
    design/ art/ programming/      # 各部門
    audio/ marketing/ qa/
  changes/                         # 變更提案（OpenSpec 啟用後用，目前空）
    archive/                       # 歸檔
```

## 三種工作型態

### 型態 1：實作既有 spec（最常見）

讀對應 spec → 照 Requirements 實作 → 跑 build + validate → 寫 `studio/AGENT-RUNS.md`。
**不需要建提案。**

### 型態 2：改既有 spec（新增/修改/刪除 Requirement）

1. 在 `changes/` 下建 `<topic>/` 目錄
2. 寫 `proposal.md`（Why / What Changes / Impact）
3. 寫 `tasks.md`（待辦清單）
4. 寫 `specs/<area>/spec.md` Delta（`## ADDED` / `## MODIFIED` / `## REMOVED`）
5. 實作 → 跑驗證 → 寫 AGENT-RUNS
6. 完成後 archive 合併回 `specs/`

### 型態 3：不動 spec 的小事

直接改：bug fix、改錯字、調格式、改註解、升級依賴（非 breaking）、補測試。

## Spec 格式

**所有 spec 必須有：**

```markdown
# <Entity>: <名稱> (<id>)

## Purpose
一段話說明這個 entity 為什麼存在、解決什麼遊戲體驗問題。

## Data
數值來源（指向 `src/data/*.json` 或 `src/...Types.ts`）。

## Requirements

### Requirement: <Capability Name>
SHALL 或 MUST 開頭的規範性描述。

#### Scenario: <Case>
- WHEN <條件>
- THEN <結果>
- AND <附加條件>

### Requirement: ...

## Related Specs
- 其他 spec 連結

## Owner
- Spec / Code / VFX / Audio owner

## Changelog
- YYYY-MM-DD: 描述
```

**Scenario 是強制的** — 沒有 Scenario 的 Requirement 等於沒有驗收標準。

## RFC 2119 關鍵字

- **SHALL / MUST** — 必須做（規範性）
- **SHOULD** — 建議做（強烈建議但可有理由不做）
- **MAY** — 可以做（選用）

GGS 規格 90% 用 SHALL。

## 角色 prompt 格式

```markdown
# <Codename> — <Title>

## Mission
一句話使命。

## Operating Prompt
You are <Codename>, ... 給 AI 啟動時用的完整 prompt（200-400 字）。

## Authority
這個角色擁有什麼決策權 / 否決權。

## Decisions Owns
列點，明確列「不問人也能做」的決策。

## Decisions Escalates
列點，明確列「必須往上報」的決策。

## Hard Numbers
數字硬指標（FPS、預算、規模等）。

## Reports To
部門、上司、模型、Terminal ID。

## Linked Specs
這個角色擁有 / 簽字的 spec 連結。

## Changelog
雇用 / 變動歷史。
```

## 驗證（暫時手動）

OpenSpec npm 套件未來會啟用。目前手動驗證：

- Spec 必須有 Purpose + 至少 1 個 Requirement + 每個 Requirement 至少 1 個 Scenario
- Spec 改完跑 `npm run build` 看程式碼有沒有同步
- 角色 prompt 改完，CEO 或 CAO 在 changelog 簽字

## 與 Codex 桌面 app / Claude / 其他 AI 的協作

- **Codex 桌面 app**：用 Terry 的 ChatGPT 訂閱，可以讀寫本機檔案
- **Claude (Cowork mode)**：file tools + bash sandbox，可以讀寫但 git 不可信、npm 結果不可信
- **Codex Cloud (chatgpt.com/codex)**：需要 repo 連 GitHub，目前 yessen-guide 環境，GGS 尚未連接
- **Cursor / Copilot**：IDE 內，跟 Codex 桌面 app 等價

**衝突避免：** 一次只開一個 AI agent 改檔案。看 `studio/AGENT-RUNS.md` 最後一筆判斷上一個 agent 是誰。

## 不可變紅線（再次強調）

讀 `project.md` 的「紅線」段。任何違反 → 立刻停下，寫 `studio/mailbox/terry-inbox/`。
