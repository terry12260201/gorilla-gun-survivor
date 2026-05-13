# Pumpkin Virtual Team Kickoff

Date: 2026-05-13
Project: Gorilla Gun: Survivor - PC Edition

## Mission

Build a self-running virtual studio on one PC that can keep developing the PC edition while the human owner is not present.

The team does not rely on chat memory. It works through files, reports, prompts, task queues, QA evidence, and decision gates.

## Operating Model

Daily cycle:
1. CEO reads latest reports and source index.
2. Department leads split tasks into small executable tickets.
3. Role agents work in their allowed folders.
4. QA runs browser tests and creates reports.
5. Data Scientist summarizes run metrics.
6. CEO updates decisions and next tasks.
7. Human owner is asked only for gated decisions.

## Role Map

| Role | Terminal | Reports To | Main Output |
| --- | --- | --- | --- |
| Pumpkin King / CEO | T-CEO | Human owner | Sprint plan, decisions, escalation list |
| Circuit / CTO | T-CTO | CEO | Architecture, code task split, merge review |
| Raven / CAO | T-CAO | CEO | Visual bible, art approvals, style gates |
| Harvest / CMO | T-CMO | CEO | Store checklist, marketing schedule, promo tasks |
| Systems Designer | T-D1 | CEO | PC loop spec, milestone definitions |
| Balance Architect | T-D2 | CEO | Weapon/card/enemy tuning tables |
| Combat Designer | T-D3 | CEO | Movement and combat feel specs |
| Narrative Designer | T-D4 | CEO | World, naming, UI copy |
| Cartograph | T-D5 | CEO | PC arena/lobby/route designs |
| Lead Programmer | T-P1 | CTO | Integration branch and code reviews |
| Gameplay Programmer | T-P2 | CTO | Weapons, enemies, card logic |
| Web Frontend Engineer | T-P3 | CTO | Three.js, HUD, UI, browser runtime |
| Tools Programmer | T-P4 | CTO | Automation scripts, data import |
| Volt / TA | T-P5 | CTO | FPS budgets, profiling, asset constraints |
| QA Analyst | T-Q1 | CEO | Test reports, bug reproduction |
| Data Scientist | T-Q2 | CEO | Survival/kills/level/build usage summaries |
| UX Tester | T-Q3 | CEO | Fun/readability/friction report |
| Scarlet | T-M5 | CMO + CAO | Promo image prompts and asset drafts |

## Folder Ownership

| Folder | Primary Owner | Notes |
| --- | --- | --- |
| `studio/briefs/` | CEO | High-level briefs and intake summaries |
| `studio/prompts/` | CEO | Role prompts and operating instructions |
| `studio/decisions/` | CEO | Decision records |
| `design/` | Systems, Balance, Combat, Narrative, Cartograph | Game design working files |
| `src/` | CTO, Lead Programmer | Code changes only after task approval |
| `qa/` | QA Analyst, Data Scientist | Reports, bugs, test data |
| `performance/` | Volt | Budgets, benchmarks, profiles |
| `marketing/` | CMO, Scarlet | Store copy, social, Steam assets |
| `art/` | CAO | Visual bible and production art specs |
| `automation/` | Tools Programmer | Daily loops and browser automation |

## First Sprint

Sprint name: Day 0-3 Data Intake and PC v0.1 Direction Lock

Deliverables:
- Source index spreadsheet.
- PC migration analysis.
- NotebookLM 2026 decision summary.
- Jira/Figma/NotebookLM intake summary.
- Jira readonly intake and deep-read plan.
- Current PC build baseline report.
- First QA automation plan.
- PC v0.1 vertical slice backlog.

## Immediate Assignments

CEO:
- Maintain source truth and decision gates.
- Produce next sprint task list.

CTO:
- Verify current repo and newer PC build location.
- Define code ownership and branch rules.

Systems Designer:
- Convert VR loop into PC loop document.
- Define 5-minute and 15-minute run arcs.
- Convert NotebookLM decisions into PC-specific feature gates.

Balance Architect:
- Build migration tables for weapons, cards, effects, enemies.
- Mark each VR row as reuse, redesign, defer, or reject.
- Use Jira `DH-542`, `DH-548`, `DH-549`, and `DH-608` as character/energy source specs.

Combat Designer:
- Define PC movement values for sprint, dash, double jump, grapple, weapon switching.

QA:
- Create browser test checklist and report format.
- Verify console and FPS symptoms.
- Add performance watchpoints for physics/tick/collision and VFX particle/alpha cost.

Scarlet/CMO:
- Do not create final art yet.
- First build PC visual/marketing requirements and asset checklist.

## Blockers

- NotebookLM 2026 notebook is accessible and summarized. Remaining NotebookLM art notebooks still need extraction.
- Figma is accessible, but metadata calls time out on large nodes. Use screenshots and focused node captures.
- Jira full project is not fully reviewed yet. First pass found 37 epics and key PC-relevant systems, but all child issues still need systematic readonly classification.
- The actual latest PC repo/build path must be confirmed if different from the public GitHub clone.

## Jira Safety Rule

Jira is source reference only. Agents may read and summarize Jira, but may not edit issues, transition status, comment, create issues, delete issues, alter assignees, alter labels, or log work unless Terry explicitly asks.

Working copy:

- `studio/briefs/jira-readonly-intake-2026-05-13.md`

## Figma Intake

Captured local references:

- `studio/figma-captures/figma-lobby-menu-node-1276-17979.png`
- `studio/figma-captures/figma-ui-system-node-91-1557.png`

Observed pages in `Devil Hunter`:

- UI Summary / Overview
- Map & Ranking
- Skill Tree
- Character Select
- Weapon Select
- Lobby Menu
- HUD / In Game
- Card
- Bag System
- Guide
- Score Show
- Interaction Flow
- Color & Fonts
- AI Image

PC interpretation:

- Treat Figma as visual/source reference, not direct implementation because much of it was designed around VR interactions.
- Preserve the gritty stone/crypt UI identity and icon language.
- Rebuild layouts for PC readability: mouse navigation, keyboard/controller focus states, responsive HUD, clear combat readability.
- Lobby Menu and settings UI should be implemented early because the current PC build already has a settings interface and lobby interaction.
