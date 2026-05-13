# Execution PC / GAI Handoff

Date: 2026-05-13
Project: Gorilla Gun: Survivor - PC Edition
Purpose: Give the execution computer and GAI agent a clear first-run procedure.

## Important Safety Rules

GAI must not edit original source materials unless Terry explicitly asks.

Readonly sources:

- Original Google Docs
- Original Google Sheets
- NotebookLM notebooks
- Jira issues
- Figma files
- Existing game source files, until a task is assigned

Allowed on first run:

- Download the GitHub repository.
- Read local working documents under `studio/`.
- Run local build checks.
- Create new local notes or reports.
- Create a new branch for proposed changes.
- Report missing access, missing folders, and blockers.

Not allowed on first run:

- Do not push directly to `main`.
- Do not overwrite original documents.
- Do not change Jira status or add Jira comments.
- Do not edit Figma.
- Do not delete files.

## GitHub Repository

Repository:

```text
https://github.com/terry12260201/gorilla-gun-survivor.git
```

Current intake branch:

```text
codex/pc-project-intake
```

Pull request page:

```text
https://github.com/terry12260201/gorilla-gun-survivor/pull/new/codex/pc-project-intake
```

## First Setup Commands

Run these on the execution PC:

```powershell
cd C:\Users\pumpkin018\Documents
git clone https://github.com/terry12260201/gorilla-gun-survivor.git
cd gorilla-gun-survivor
git fetch origin
git switch codex/pc-project-intake
npm install
npm run build
```

If the folder already exists:

```powershell
cd C:\Users\pumpkin018\Documents\gorilla-gun-survivor
git fetch origin
git switch codex/pc-project-intake
git pull
npm install
npm run build
```

## First Files GAI Should Read

Read in this order:

1. `studio/README.md`
2. `studio/briefs/virtual-team-kickoff-2026-05-13.md`
3. `studio/briefs/pc-migration-analysis-2026-05-13.md`
4. `studio/briefs/jira-figma-notebooklm-intake-2026-05-13.md`
5. `studio/briefs/jira-readonly-intake-2026-05-13.md`
6. `automation/workflows/daily-loop.md`
7. `studio/prompts/ceo-pumpkin-king.md`

Reference images:

1. `studio/figma-captures/figma-lobby-menu-node-1276-17979.png`
2. `studio/figma-captures/figma-ui-system-node-91-1557.png`
3. `qa/screenshots/gg_pc_0511_contact_sheet.png`
4. `qa/screenshots/screenshot-1778644145875.png`

## First Mission For GAI

GAI should produce a first-run report with:

1. Environment status:
   - Operating system
   - Node.js version
   - npm version
   - Git branch
   - Build result

2. Repository status:
   - Current branch
   - Whether there are uncommitted changes
   - Whether `npm run build` succeeds

3. Source intake status:
   - Which `studio/` documents were read
   - Which files are missing
   - Which source areas still need login or access

4. PC development readiness:
   - Can the current game be run locally?
   - What command starts the dev server?
   - What URL should QA open?
   - Does the repo match Terry's latest PC video or only the older prototype?

5. First recommended next step:
   - Do not implement yet unless Terry approves.
   - Recommend the smallest next action to turn the intake into PC v0.1 execution.

## Prompt To Give GAI

Copy this to GAI:

```text
你現在是 Gorilla Gun: Survivor PC 版的執行電腦 GAI。你的第一任務不是直接改遊戲，而是把 GitHub 上已整理好的專案資料下載、讀完、確認環境，然後回報目前是否可以開始自動化開發。

請遵守：
1. 不可以修改原始 Google Docs、Google Sheets、NotebookLM、Jira、Figma。
2. 不可以直接 push main。
3. 不可以刪除檔案。
4. 第一次只做環境確認、資料讀取、build 測試、缺口回報。
5. 如果需要修改，只能建立新分支並先提出計畫。

請先執行：

git clone https://github.com/terry12260201/gorilla-gun-survivor.git
cd gorilla-gun-survivor
git fetch origin
git switch codex/pc-project-intake
npm install
npm run build

如果 repo 已存在，就改成：

cd C:\Users\pumpkin018\Documents\gorilla-gun-survivor
git fetch origin
git switch codex/pc-project-intake
git pull
npm install
npm run build

然後依序閱讀：
- studio/README.md
- studio/briefs/virtual-team-kickoff-2026-05-13.md
- studio/briefs/pc-migration-analysis-2026-05-13.md
- studio/briefs/jira-figma-notebooklm-intake-2026-05-13.md
- studio/briefs/jira-readonly-intake-2026-05-13.md
- automation/workflows/daily-loop.md
- studio/prompts/ceo-pumpkin-king.md

請回報：
1. 你目前在哪個資料夾與 Git 分支。
2. npm install 是否成功。
3. npm run build 是否成功。
4. 你讀完哪些文件。
5. 你判斷目前 GitHub repo 是最新 PC 版，還是比較舊的 prototype。
6. 要讓無人虛擬團隊開始開發，還缺哪些資料。
7. 你建議第一個可執行任務是什麼。

請用繁體中文回報，不要改原始文件，不要碰 Jira/Figma/NotebookLM 的內容。
```

## What Terry Should Prepare On The Execution PC

Before asking GAI to run long-term:

- Git installed.
- Node.js LTS installed.
- Browser available for QA automation.
- GitHub access confirmed.
- If latest PC project is not this repo, provide the real local folder path.
- If using NotebookLM/Figma/Jira again, login in browser when requested.

## Recommended First Automation Loop

After GAI finishes first-run report:

1. Human confirms latest PC source path.
2. GAI creates a new branch, for example:

```powershell
git switch -c codex/pc-v01-backlog
```

3. GAI creates:
   - `studio/backlog/pc-v0.1-backlog.md`
   - `studio/decisions/pc-v0.1-finish-line.md`
   - `qa/reports/first-local-build-report.md`

4. GAI runs the dev server and captures browser QA evidence.
5. GAI reports blockers before implementation.

