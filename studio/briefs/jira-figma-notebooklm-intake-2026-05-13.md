# Gorilla Gun: Survivor PC - Jira / Figma / NotebookLM Intake

Date: 2026-05-13
Owner: Codex virtual studio lead
Rule: This document is a new working copy. Do not modify original Google Docs, Google Sheets, Jira, Figma, or NotebookLM sources unless Terry explicitly asks.

## Current Access State

- Jira access: Available through Atlassian Rovo. Project key `DH`, project name `Gorilla Gun: Survivor`.
- Figma access: File links discovered, but browser is currently on Figma login. Jira notes say to use `Art@pumpkinvrar.com` for the Figma file.
- NotebookLM access: The notebook was reachable earlier after Terry logged in, but the automation browser is currently back on Google login. Need browser login again before querying the notebooks.

## Key Jira Sources

| Key | Title | Status | PC Relevance |
| --- | --- | --- | --- |
| DH-608 | Character energy and skill mechanics | In progress | Core PC resource system. Replaces ultimate bar with generic energy bar. |
| DH-542 | Character system | Open | Defines character passive, weapon mastery, active skill, and movement grading. |
| DH-548 | Biochemical Monkey | Open | Poison-specialist character spec. |
| DH-549 | Lightning Monkey | Open | Lightning-specialist character spec. |
| DH-550 | V0.07 UI/system/screen optimization | Open | Main UI/UX Figma reference. |
| DH-583 | Lobby settings menu | Open | Lobby menu Figma reference. |
| DH-539 | Blue monkey unlock sequence | Open | Strong lobby narrative/unlock beat. |
| DH-31 | Weapon system | Open | Main weapon + six secondary weapons; projectile behavior rules. |
| DH-384 | Automatic weapons | Done | Flame thrower, explosive crossbow, scatter crossbow, holy water launcher. |
| DH-525 | New maps/levels | Open | Level additions and stage planning. |
| DH-580 | Lobby deathmatch entrance | Done | Underground crypt deathmatch entrance in lobby. |
| DH-604 | Dynamic monster attack distance | In progress | Important combat readability and collision fix. |

## PC Design Conclusions From Jira

1. The PC version should treat energy as a universal action resource, not only an ultimate meter.
2. Movement must be character-dependent: dash, grapple, glide, and climb all consume energy and should have grades or tunable costs.
3. Characters are not just skins. Each character needs passive traits, weapon/element specialization, and an active skill.
4. The initial PC roster should prioritize specs already detailed in Jira:
   - Base/default monkey from existing PC build and VR data.
   - Biochemical Monkey: poison specialization, poison-only upgrade direction, poison buff skill.
   - Lightning Monkey: lightning specialization, lightning field active skill.
   - Blue/Rambo Monkey: unlock quest, mine skill, gatling/ultimate weapon direction.
5. The lobby should become a playable progression hub, not just a menu. Jira already defines unlock story moments, a deathmatch entrance, level selection, tavern presence, and menu UI.
6. Combat tuning must include monster scale-aware attack range. This is a known issue and should be part of PC QA automation.
7. Figma is the source of truth for UI direction, especially:
   - `eZLjTG2QTl11WBMFzcnBNA`, node `91:1557` for UI/system/screen optimization.
   - `eZLjTG2QTl11WBMFzcnBNA`, node `1276:17979` for lobby settings menu.

## Virtual Team Backlog Seeds

### CEO / Producer

- Convert Jira and VR-sheet sources into a PC-specific roadmap.
- Decide PC MVP finish line and release criteria.
- Watch blockers from every role and reassign stuck work.

### Game Director

- Rewrite PC core loop around keyboard/mouse survival shooter flow.
- Preserve the VR game's identity: gorilla movement, guns, cards, relics, escalating waves, lobby progression.
- Define what is kept from VR, what is adapted, and what is cut.

### System Designer

- Implement data tables for energy, movement costs, character growth, weapon slots, projectile rules, and elemental caps.
- Convert `DH-542`, `DH-548`, `DH-549`, `DH-608`, and VR sheets into PC tuning tables.

### Gameplay Engineer

- Build configurable energy system.
- Hook dash, grapple, climb, glide, and active skills into energy consumption.
- Support character-specific movement grades and skill costs.

### Combat Engineer

- Implement weapon slot model: one main weapon plus six secondary weapons.
- Implement projectile rules: count, range, speed, explosion radius, bounce, spread, pierce, and max range.
- Fix monster attack distance based on scale.

### UI/UX Designer

- Read Figma once authenticated.
- Produce PC HUD, pause/settings menu, upgrade choice UI, lobby interaction UI, minimap, damage text, rarity colors, and controller/keybinding mapping.

### Art Lead

- Extract Figma and Jira visual references.
- Define asset folders for characters, monsters, weapons, VFX, UI, lobby props, key art, and store art.

### QA Automation

- Use browser/Chrome automation for PC web builds.
- Autoplay smoke tests for lobby movement, menu opening, weapon switching, level start, combat HUD, minimap, enemy spawn, damage, and 15-minute survival loop.
- Report bugs as structured findings for the CEO role to triage.

## Open Items Requiring Login

- NotebookLM `GorillaGun:Survivor - 會議記錄2026`: logged in and read on 2026-05-13.
- NotebookLM art notebook: extract latest art direction and asset needs.
- Figma `Devil-Hunter`: capture UI frames from the two Jira-linked nodes.

## NotebookLM 2026 Meeting Sources Read

Notebook: `GorillaGun:Survivor - 會議記錄2026`

Source list visible in NotebookLM:

- `GG _例會_0402.m4a`
- `GG_UI_W姿瑀_0326.m4a`
- `GG_例會(版本更新內容）_0331.m4a`
- `GG_例會_0310_01.m4a`
- `GG_例會_0310_02.m4a`
- `GG_例會_0312.m4a`
- `GG_例會_0317.m4a`
- `GG_例會_0318-01.m4a`
- `GG_例會_0326.m4a`
- `GG_例會_會後會_0318.m4a`
- `GG_創意發想0318.m4a`
- `GG_小會議_0330.m4a`
- `GG_新版UI會議_0330.m4a`
- `GG_會議_討論武器_0324.m4a`
- `GG進度討論_0408.m4a`
- `文字`

## NotebookLM 2026 Meeting Decisions

### Core Gameplay

- Stage 1 should become a progressive 1-1, 1-2, 1-3 structure, ending in a Death/Reaper boss sequence after mid-boss progression such as demon and snail enemies.
- Add deathmatch mode as endless survival focused on score and survival time.
- Add parkour/challenge maps built around grapple and movement skill mastery.
- Consider a free demo containing the first stage to increase conversion into the full PC release.

### PC / VR Operation Split

- VR UI decisions are still useful as design reference, but PC should reinterpret them for keyboard/mouse and screen HUD instead of copying wrist-only UI.
- VR required wrist/hand information because body and hand occlusion made normal panels awkward.
- VR spatial awareness relied on directional audio because players cannot always see behind them. PC can use minimap, directional damage indicators, and audio together.
- VR terrain and climbing issues were tied to physical motion and collision. PC should keep the traversal fantasy, but implement deterministic keyboard/mouse movement, dash, double jump, grapple, climb, and glide.

### Character System

- Characters should be specialized by element or weapon direction to avoid an overly diluted card pool.
- Characters should enter a run with signature relic/cards, such as garlic or holy oil, and those starter cards can scale with character level.
- Role design should simplify ultimate/skill identity: movement skills and active skills can carry role traits, such as a fire dash dealing fire damage.
- This matches Jira `DH-542`, `DH-548`, `DH-549`, and `DH-608`: passive, mastery, active skill, movement grades, and universal energy.

### Companion System

- The companion animation direction is confirmed: when held, the companion is folded/small; when thrown or summoned forward, it flies out and unfolds, including wing animation.
- Long-term plan includes a companion farm/gallery. Players unlock companions through kill progress or collection goals, then bring selected companions into runs.

### Weapons / Cards / Items

- Flame thrower and holy water launcher should shoot chains of physical projectile-like bullets/water/fireballs, not just invisible hitscan beams.
- Two-handed weapons can occupy two inventory/backpack slots.
- Card ban logic: banning a card consumes the current upgrade choice and permanently removes that card from future upgrade pools in that run.
- Boss chest/relic pools should be diluted with lower-tier variants of similar relics so legendary relics are not too easy to complete.
- Bomb item behaviors:
  - Bouncy bomb ricochets.
  - Sticky/slime bomb attaches to walls or enemies.
  - Firework bomb triggers a 360-degree secondary explosion.

### Enemies / Bosses

- Gargoyle boss can be a stationary boss to reduce animation cost, using attacks such as laser, fireball, and large AOE.
- Death/Reaper boss drops a key unlock item, such as banana/chili, which is then delivered in the lobby to unlock Blue/Rambo Monkey.
- Deathmatch enemy spawning should remove strict timeline limits and use full-map random mass spawns to create pressure.

### Map / Lobby

- The lobby should expand into a real hub with weapon concentration area, companion/farm/gallery area, level portals, and unlock staging.
- Different modes and maps should be entered through physical entrances in the lobby, such as underground holes, wall openings, cave/waterfall style portals, or crypt entrances.
- A ship or time-space vessel was discussed as a result/intermission space after stage clear or death, where the player can choose next stage or return to lobby.

### UI / UX

- VR backpack/menu direction used a hybrid: 3D physical frame plus 2D internal grid, similar to Diablo-style inventory.
- Result screens should become physical interactions rather than flat popups where possible, such as striking a stone/tablet/object and having coins or result info appear.
- PC version should translate this idea into tactile, readable mouse/keyboard UI: compact HUD, strong pickup/upgrade readability, physical-feeling lobby interaction, and clear result ceremony.

### Audio / VFX

- Current visual feedback was described as too dry. AOE explosions and enemy death burst/gore/disassembly effects should be amplified.
- Bullets should get element-specific colored trails.
- Audio should support ducking: when the player fires, BGM lowers to emphasize shooting and hit feedback.
- Spatial warning audio is important for nearby monsters and surprise pressure.

### AI Tools / Automation

- Team discussed AI-assisted development using tools such as Cursor or VS Code plus Claude API for coding and testing support.
- There is a plan for a simple tuning webpage where designers select monsters, stages, and drop rates, then generate CSV files for direct game ingestion.
- AI-generated monster attack sounds, ambience, and support audio were considered to speed up SFX production.

### Risks

- Highest-risk technical issue is performance from excessive physics/tick/collision work across monsters, bullets, and terrain.
- VFX can cause crashes or severe frame drops if particle count, alpha blending, holy light, or multi-fireball effects are not optimized.
- Near-term version work referenced V0.05 bug fixes and V0.06 development items: deathmatch map, Blue/Rambo Monkey, and weapon system.

## PC Product Interpretation

For the PC web version, the goal should not be a literal VR port. It should be a PC-first survival shooter with the same franchise DNA:

- Movement fantasy: dash, double jump, grapple, climb, glide, parkour.
- Combat fantasy: guns, elemental projectile chaos, cards, relics, boss drops, dense waves.
- Meta fantasy: lobby hub, unlockable monkeys, companion farm/gallery, mode entrances.
- Production fantasy: a self-running AI studio with CEO, director, designers, engineers, art, QA, and automation agents continuously converting source material into playable increments.
