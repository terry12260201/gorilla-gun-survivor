# Gorilla Gun: Survivor PC Migration Analysis

Date: 2026-05-13
Owner: Pumpkin Virtual / CEO kickoff
Rule: This file is a new PC-edition working document. Do not edit the original VR Google Sheet, NotebookLM notebooks, or source planning files.

## Source Materials Reviewed

| Source | Status | Notes |
| --- | --- | --- |
| `[Terry]pumpkin-virtual-project-brief.md` Google Doc | Reviewed | Defines Pumpkin Virtual, 28-agent studio, $15 target, PC web goal. |
| `Gorilla Gun: Survivor資料表` Google Sheet | Reviewed | 18 tabs: links, balance simulation, status/effects, upgrades, level events, roles, cards, weapons, maps, lobby, probability, sound, UI, movement. |
| Meta / Quest store public listing | Reviewed through public index | Confirms live VR product identity, early-access positioning, Quest support, $9.99 listing, 4.5 rating snapshot from Quest Store DB. |
| Marketing schedule sheet | Partially reviewed | Store checklist tabs for Meta and Steam are useful for PC release preparation. |
| `GG_PC_0511.mp4` | Visually reviewed | Browser playback/contact sheet confirms current PC lobby, portal/ranking area, tavern/interior props, interaction moments, loading, minimap, and combat HUD. |
| NotebookLM meeting records | 2026 notebook reviewed | `GorillaGun:Survivor - 會議記錄2026` was read through authenticated browser access. Decisions are summarized in `jira-figma-notebooklm-intake-2026-05-13.md`. |
| Figma `Devil Hunter` | Partially reviewed | Browser and node screenshots captured for UI overview and Lobby Menu. Metadata calls timed out because nodes are large. |
| Public GitHub PC prototype | Cloned for analysis | Vite + TypeScript + Three.js prototype with 7 auto weapons, 10 enemy types, 18 cards, meta upgrades, HUD, pickup, boss bar. |

## Product Translation

The PC version should not be a direct VR port. It should preserve the content vocabulary and survivor loop, while rebuilding moment-to-moment control for keyboard/mouse.

VR pillars:
- Arm-swing locomotion, climbing, hand-driven momentum.
- Physical weapon feel and body motion.
- VR arena pressure and high-intensity movement.

PC pillars:
- Keyboard/mouse combat readability.
- Low gorilla-eye first-person view as identity.
- Fast traversal through sprint, dash, double jump, grapple, and arena routing.
- Auto-fire secondary weapons plus skill-shot main weapon.
- Data-driven survivor loop: kill, XP, level, card, weapon/effect synergy, boss pressure, meta progression.

## Already Implemented In Current Public PC Prototype

Codebase path: `F:\claude\Terry.Agent\gorilla-gun-survivor`

Confirmed from README, DESIGN, HANDOFF, and source:
- Vite + TypeScript + Three.js.
- First-person low camera prototype.
- WASD, mouse look, jump, left-click main weapon.
- Seven auto secondary weapons.
- Eighteen upgrade cards.
- Four element families in simplified 3-tier form.
- Ten enemy types including rusher, bomber, ranged/caster, brute, miniboss.
- XP orbs, level-up card selection, pickups, treasure/chest hook.
- Meta progression via localStorage.
- HUD, pause panel, inventory panel, boss bar, upgrade panel, meta menu.
- WebAudio synthetic SFX.

## Current PC Build Information From User

User reports a newer PC version/video has:
- Lobby movement.
- Sprint.
- Double jump.
- Dash.
- Grapple hook.
- Weapon switching.
- Interactive poster.
- Interactive glass.
- Settings UI.
- Minimap.
- Combat HUD.

This newer state is not fully represented in the public GitHub clone reviewed here. Treat the clone as a public/prototype baseline, not the definitive current working build.

Video review confirms the newer PC build has a darker underground/lobby hub, ranking/portal elements, interactable props, and a combat scene with minimap/HUD. The lobby direction aligns with NotebookLM and Jira: the lobby should become a playable hub containing map entrances, unlock moments, props, NPC/character staging, and settings/menu surfaces.

## VR Data That Should Be Reused

Use directly as design source:
- Weapon identities, weapon levels, weapon unlock types, weapon families.
- Card rarity, relic system, boss chest rules, pity rules.
- Status/effect taxonomy.
- Element combination/evolution logic.
- 15-minute event pressure curve.
- Boss/miniboss timing.
- Lobby progression idea, NPC unlocks, playful secrets.
- Sound asset checklist and missing sound list.
- UI rarity color rules.
- Store page checklist and marketing asset needs.

Needs PC redesign:
- VR arm locomotion.
- Manual/hand weapon physical handling.
- VR inventory/bag interactions.
- VR comfort rules.
- Any feature relying on spatial hand gestures.

Needs simplification before PC implementation:
- Some VR formulas are too granular for a first PC playable milestone.
- Weapon list is large; import in waves.
- Character/ultimate system should be implemented as data-driven energy/skill foundations first, with full roster rollout in waves.

## PC Design North Star

"A 10-15 minute keyboard/mouse survivor FPS where a low-view gorilla uses ridiculous weapons, grapple movement, and escalating card synergies to survive a monster tide."

The PC edition must keep:
- Survivor rhythm.
- Gorilla traversal identity.
- Weapon/card build chaos.
- Boss escalation.
- Meta progression.

It must avoid:
- Becoming a pure arena FPS.
- Becoming a puzzle/exploration game.
- Overbuilding the lobby before combat retention is proven.
- Copying VR controls when PC needs a different feel.

## First PC Milestone Definition

Milestone: PC Vertical Slice v0.1

Pass conditions:
- Player can move, sprint, double jump, dash, grapple, switch weapons.
- One combat arena loads from lobby.
- At least 7 current weapons remain playable.
- At least 3 VR weapons are converted into PC data format.
- At least 12 VR relic/cards are converted into PC data format.
- At least 4 enemy archetypes are mapped to PC behavior.
- 5-minute loop has XP, card select, boss/miniboss, death, summary.
- QA automation can run 10 simulated sessions and output survival time, kills, level, FPS notes.

## Priority Backlog

P0 - Data consolidation:
- Create PC source index and migration matrix.
- Continue extracting NotebookLM meeting records into local working docs.
- Identify actual current PC repo/video build source.

P0 - Runtime baseline:
- Run the current PC build locally.
- Verify console, FPS, input, HUD, lobby, combat transition.
- Add a simple QA run report template.

P1 - PC controls:
- Formalize sprint, dash, double jump, grapple, weapon switching values.
- Define energy costs using Jira `DH-608`: dash, grapple, climb, glide, active skills.
- Ensure movement supports survivor pressure without causing motion sickness-like screen noise.

P1 - Combat data import:
- Build `design/pc-data/weapons.md`.
- Convert VR weapon rows into PC weapon candidates.
- Choose first 10 PC weapons: current 7 plus shotgun, rocket launcher, holy crossbow or SMG from VR table.

P1 - Cards/effects:
- Convert the element evolution table into a PC-friendly data schema.
- Keep base four elements first: lightning, fire, water/slow, toxin.
- Add evolved effects only after base effects are visible and performant.

P1 - QA automation:
- Browser agent opens localhost.
- Starts a run.
- Captures survival time, level, kills, FPS symptoms, console errors, screenshots.
- Writes `qa/reports/YYYY-MM-DD-run-N.md`.

P2 - Lobby:
- Keep lobby as retention wrapper, not production sink.
- NPC unlocks and secrets can exist, but combat loop drives priority.
- Implement lobby UI and settings direction from Figma `Lobby Menu`, while adapting VR-style stone/physical panels into clean PC mouse/keyboard panels.

P2 - Marketing:
- Build PC Steam checklist from VR marketing sheet.
- Generate key art/capsule prompts after the PC visual bible is approved.

## Decision Gates

Ask human owner before:
- Changing core loop.
- Removing VR content permanently.
- Recruiting new virtual roles.
- Publishing, deleting, or modifying original source docs.
- Creating paid store assets for final use.
- Choosing final PC price.

CEO can auto-approve:
- Local copies of reference docs.
- PC migration tables.
- QA reports.
- Prototype-only implementation branches.
- Non-destructive asset prompt drafts.
