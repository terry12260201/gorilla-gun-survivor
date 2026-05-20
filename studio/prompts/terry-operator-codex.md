# ⛔ DEPRECATED — Moved to OpenSpec

**This file is no longer the source of truth.**

The Terry Operator (Codex / Claude-as-Codex) role spec has moved to:

→ **`openspec/roles/operator/claude-codex.md`**

The new version includes:
- Full Operating Prompt（current embodiment = Claude Opus 4.7 via Cowork scheduled task）
- Authority / Decision Classes / Mailbox Workflow
- Hard Numbers（per-tick slice cap、build fail streak、escalation threshold、VFX 粒子預算 etc.）
- Wake Loop（5 步 + 連結 `studio/claude-as-codex-loop.md`）
- Linked Specs（包含 outbox 決策、HANDOFF、AGENT-RUNS、PENDING-CHANGES、AGENTS.md）
- Red Lines（與全 studio 紅線 enforcement 共用）
- Changelog

Reason for move: 2026-05-19 Terry approved OpenSpec architecture（見 `studio/mailbox/terry-outbox/2026-05-19-1530-terry-direction.md` 上下文）。All role prompts now live under `openspec/roles/<dept>/<codename>.md`。本檔 2026-05-19 backlog #2（Cowork loop tick #13）正式 deprecate。

**Action item for Terry：** 方便的時候用 `git rm studio/prompts/terry-operator-codex.md` 刪掉本檔。已列在 `studio/CLAUDE-PENDING-CHANGES.md` tick #13 段。

如果你是 AI agent 讀到這個檔案 → STOP。改讀 `openspec/roles/operator/claude-codex.md`。
