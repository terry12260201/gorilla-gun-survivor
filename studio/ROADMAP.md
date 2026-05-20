# Gorilla Gun Survivor Roadmap

Updated: 2026-05-18 10:22

## Operating Reality

Claude Code in VS Code is currently not a reliable runner. The active development system is:

- Terry/Codex as operator and integrator.
- Codex subagents for scoped review/research/implementation tasks.
- File-based studio records so Terry can see what happened even when terminals close.
- Terry Live Ops terminal for visible status only.

## Milestones

| Phase | Goal | Player-Test Moment | Status |
| --- | --- | --- | --- |
| P0 Ops | Make build/dev/log/testing visible and recoverable | Terry can open the app and inspect logs | Active |
| P1 Data Foundation | Move weapons/enemies/cards toward data files with validators | Terry sees same gameplay but data is safer to edit | Active |
| P2 Gameplay Content | Add new weapons, skills, enemies, and pickup pacing | Terry tests a named build with new content | Next |
| P3 Balance/QA | Record run metrics, tune numbers, validate 10-15 minute loop | Terry tests specific balance checklist | Planned |
| P4 Map/Art | Add new arena variations, props, mood, and readability passes | Terry tests visual/readability build | Planned |
| P5 Performance | Measure FPS, heap, draw calls, bundle size, and optimize | Terry tests stable FPS build | Planned |

## Content Backlog

| Track | Examples | First Deliverable |
| --- | --- | --- |
| New Weapons | shotgun, rocket launcher, holy crossbow, gatling-style weapon | Add 1 JSON weapon + validator + gameplay test |
| New Skills | dash burst, elemental overdrive, panic heal, chain lightning active | One active skill prototype behind a keybind |
| New Enemies | shield grunt, splitter, sniper caster, elite bomber | One new enemy type in data/code with spawn timing |
| New Map | arena variant with lanes, pillars, low-view cover | Map config prototype, no new art dependency |
| New Character | passive + starting weapon + active skill | Character data draft before implementation |
| Balance QA | HP curves, spawn rates, XP/card pacing, pickup rates | `qa/reports/run-balance-*.md` |
| Performance | bundle split, object pools, VFX budgets | `performance` baseline report |

## Next 3 Development Slices

1. Weapon data gate
   - Completed migration to `src/data/weapons.json`.
   - Add build gate validation.
   - Terry test: open game, confirm cards/weapon names still appear and runtime has no errors.

2. New weapon candidate
   - Add one new secondary weapon row using an existing asset.
   - Confirm validator catches bad assets and duplicate ids.
   - Terry test: level up until new weapon appears, pick it, verify it fires.

3. Run QA report
   - Add a manual test checklist and short run report template.
   - Terry test: play 3-5 minutes and report feel: too hard / too empty / too much damage / unclear visuals.
