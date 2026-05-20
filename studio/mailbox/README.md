# Studio Mailbox Protocol

This project uses files as shared memory between Claude terminals, Codex, and Terry.

## Folders

- `terry-inbox/` - questions that need Terry/Codex judgment.
- `terry-outbox/` - answers from Terry/Codex for agents to read.
- `blocked/` - blocked tasks that cannot proceed without a decision.
- `broadcast/` - messages every terminal should read.
- `archive/` - resolved mailbox items.

## When An Agent Must Write Terry

Write to `studio/mailbox/terry-inbox/` when:

- You need product owner approval.
- You want to change scope, pricing, publishing, access, core loop, or repo safety rules.
- You are blocked by missing source material.
- You disagree with another senior agent.
- You are about to touch original external documents or secrets.

## File Name

Use:

```text
YYYYMMDD-HHMM-agent-topic.md
```

Example:

```text
20260515-1730-cto-dependency-choice.md
```

## Request Template

```markdown
# Terry Request - short topic

From:
Agent:
Time:
Priority: P0/P1/P2/P3

Question:

Context:

Options:
1.
2.
3.

Recommendation:

Risk If Wrong:

Deadline:
```

## Reading Answers

Agents should check `studio/mailbox/terry-outbox/` before asking Terry again. If the answer resolves the item, move the original request and answer to `studio/mailbox/archive/`.

