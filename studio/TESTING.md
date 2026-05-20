# Terry Testing Guide

## Current Test Build

URL: `http://127.0.0.1:5174/`

Current checkpoint: **Checkpoint A - Data Foundation Stable**

## What Changed In This Checkpoint

- Auto-weapon data moved to `src/data/weapons.json`.
- Weapon schema documented in `studio/schemas/schema-weapons.md`.
- Weapon data validator added at `tools/validate-weapons.mjs`.
- `npm run build` now runs `npm run validate:weapons` first.
- Rescue/ambient heart pickup behavior was added earlier in this session.

## Terry Test Checklist - Checkpoint A

1. Open `http://127.0.0.1:5174/`.
2. Start a run.
3. Confirm the game does not freeze on start.
4. Kill enemies until XP level-up appears.
5. Confirm weapon cards can still appear with Chinese weapon names.
6. Pick a weapon card if available.
7. Confirm the selected auto weapon appears around the player and fires.
8. Watch for console/runtime errors if visible.
9. Report feel in one sentence:
   - `startup ok / broken`
   - `weapon card ok / missing`
   - `weapon firing ok / broken`
   - `healing too much / too little / not noticed`

## When Not To Test Yet

Do not spend time testing new character, new map, or new monster content yet. Those are not implemented in the current checkpoint.

## Next Test Checkpoint

Checkpoint B - New Weapon Candidate

Terry should test after:

- One new weapon row is added.
- Validator passes.
- Build passes.
- Runtime check passes.
