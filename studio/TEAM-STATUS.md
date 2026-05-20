# Terry Team Status

Updated: 2026-05-18 10:08

## Active Mode

VS Code / Claude terminal is treated as stalled. Terry/Codex is operating from the Project workspace and keeping visible status through Terry Live Ops.

## Visible Terminals

| Terminal | Purpose | Status | Durable Log |
| --- | --- | --- | --- |
| Terry Live Ops | Continuously refreshes server, git, and worklog status | Running | `.ops/logs/terry-live-ops-*.transcript.log` |
| Terry Control | Manual commands: `status`, `build`, `restart`, `logs`, `git` | Idle by design | `.ops/logs/terry-terminal-*.transcript.log` |
| VS Code Claude | Prior AI team UI | Stalled / not trusted as primary runner | VS Code scrollback only |

## Work Ownership

| Owner | Current Task | Status |
| --- | --- | --- |
| Terry/Codex | Keep deployment alive, run builds, verify browser, write records | Active |
| T6 Gameplay | `weapons.json` migration | Taken over and completed by Terry/Codex |
| T5 Review | Review T6 weapon data migration | Next |
| Claude UI | Do not block on it | Stalled |

## Completed Since Takeover

- Switched dev server to the Project workspace.
- Added durable deployment scripts under `automation/scripts`.
- Added `src/data/weapons.json`.
- Migrated `AutoWeaponSpec.ts` to load weapon data from JSON.
- Added `studio/schemas/schema-weapons.md`.
- Added rescue/ambient heart pickup behavior.
- Build and runtime checks passed.

## Current Runtime

- URL: `http://127.0.0.1:5174/`
- Logs: `.ops/logs`
- Browser check: canvas present, console error count 0.

## Current Action

T5-style review pass for the weapons JSON migration:

- Validate JSON row shape.
- Confirm no duplicate weapon IDs.
- Confirm weapon asset URLs exist under `public/assets/arms`.
- Add a repeatable validation script if missing.
