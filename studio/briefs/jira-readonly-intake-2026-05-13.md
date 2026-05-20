# Gorilla Gun: Survivor - Jira Readonly Intake

Date: 2026-05-13
Project: `DH / Gorilla Gun: Survivor`
Access mode: Readonly only.

## Safety Rule

Do not modify original Jira data.

Allowed:

- Read issues.
- Summarize issues into local working documents.
- Use issue keys as references.
- Build separate PC-edition backlog proposals in local files or new user-approved documents.

Not allowed unless Terry explicitly asks:

- Edit Jira issue fields.
- Transition issue status.
- Add comments.
- Create or delete Jira issues.
- Change assignees, labels, priorities, descriptions, links, or worklogs.

## What Has Been Read So Far

This is not yet a complete full-project Jira review. It is the first structured pass.

### Project Structure

- Jira project key: `DH`
- Project name: `Gorilla Gun: Survivor`
- Issue types visible:
  - Epic / `大型工作`
  - Story / `故事`
  - Task / `任務`
  - Sub-task / `子任務`
  - Bug / `漏洞`
- Epic count found by JQL: 37.

## High-Value Jira Issues Already Inspected

| Key | Title | Why It Matters For PC |
| --- | --- | --- |
| DH-25 | Early Access | Original milestone logic and release expectations. |
| DH-26 | 大廳系統 | Lobby hub structure: bar, weapon room, tech tree, level select, ranking, codex, training. |
| DH-31 | 武器系統 | Core weapon model: one main weapon, six secondary weapons, projectile parameters. |
| DH-32 | 音樂音效 | Music identity: heavy metal/classical mix; 8-bit sound direction. |
| DH-33 | 關卡系統 | Stage loop, random card upgrades, enemy time curve, boss AI, chest/relic logic. |
| DH-38 | 角色系統 | Character-system umbrella. |
| DH-55 | 選單系統 | In-game menu: weapons, relics, character stats, settings, keybinds, quit/return. |
| DH-101 | Lobby progression / tutorial flow | Detailed hub unlock flow: tutorial, lobby entry, weapon room, bar, tech tree, rankings, second-stage entrance. |
| DH-102 | 遊戲中 UI 顯示修正 | UI hierarchy and run-state freeze behavior. |
| DH-103 | UI 結算 UI 調整 | Result screen should show current weapons, relics, attributes. |
| DH-104 | 程式 結算 UI 調整 | Death/clear result transitions and result UI requirements. |
| DH-384 | 自動武器 | Automatic weapons: flame thrower, explosive crossbow, scatter crossbow, holy water launcher. |
| DH-433 | 藍波猴地雷 | Blue/Rambo monkey mine gameplay behavior. |
| DH-476 | 藍波猴奧義武器 - 加特林機槍 | Character-specific gatling weapon rules and visual behavior. |
| DH-539 | 藍波猴解鎖動態 | Lobby unlock sequence and narrative beat. |
| DH-542 | 角色系統 | Detailed role rules: passive, mastery, active skill, movement grades. |
| DH-548 | 角色設計 - 生化猴 | Poison-specialist character source spec. |
| DH-549 | 角色設計 - 雷精猴 | Lightning-specialist character source spec. |
| DH-550 | V0.07 UI / 系統 / 畫面優化 | Main Figma UI reference node. |
| DH-558 | 新增 - 掉落物及道具系統 | Data architecture for loot table, item registry, item data assets. |
| DH-563 | V0.08 新增角色 | New-character epic. |
| DH-580 | 大廳新增 - 地下墓穴死鬥位置 | Lobby entrance concept for deathmatch/crypt. |
| DH-583 | Lobby Menu / 大廳設定選單 | Figma reference for lobby settings menu. |
| DH-593 | V0.08 新增地圖關卡 | New-map epic. |
| DH-599 | 核心架構與系統設定說明 | Technical guide epic, needs separate deep read. |
| DH-602 | V0.07 系統優化與 BUG 修正 | Optimization/bugfix umbrella. |
| DH-604 | 動態調整攻擊距離 | Monster scale-aware attack-distance fix. |
| DH-605 | V0.07 優化修正 | Monster attack distance and death VFX recovery. |
| DH-608 | 角色能量與技能機制 | Universal energy system and movement/skill energy costs. |

## PC-Relevant Conclusions From Jira

### Lobby

Jira treats the lobby as a progression hub, not a static menu. The PC version should preserve this:

- Bar: character switching.
- Weapon room: weapon selection/unlocks.
- Tech tree: character/meta upgrades.
- Level select: stage entrance.
- Ranking: per-stage ranking display.
- Codex and training room: learning/replay/reference systems.
- Unlock sequence: rooms and systems open after run milestones.

PC interpretation:

- Keep the hub as first-person playable space.
- Use clear keyboard/mouse interactions instead of VR physical-only affordances.
- Build unlock beats as staged events: weapon room opens, bar opens, tech tree opens, rankings appear, second-stage entrance opens.

### Weapon System

Jira defines the weapon model:

- Player can hold one main weapon and six secondary weapons.
- Weapon data includes traits, damage, attack speed, magazine size, reload time.
- Projectile data includes projectile count, explosion radius, bounce, spread/aim offset, pierce, and max range.
- Bounce and pierce should not reset max range.

PC interpretation:

- This should become a data schema before adding more weapons.
- Existing PC prototype weapons should be mapped into this schema.
- VR weapon rows can be imported gradually.

### Level / Run System

Jira `DH-33` confirms:

- Random card upgrades are used for weapon upgrades, relics, and attribute strengthening.
- Monsters follow a time table and strengthen over time.
- Normal and elite monsters can share core AI patterns.
- Bosses have independent AI and attack patterns.
- Chest/relic rewards are part of the run.
- Run-earned weapon upgrades and run weapons reset after each stage.

PC interpretation:

- Good fit for PC survivor loop.
- Need a `run reset contract`: what persists, what resets, what becomes meta progression.

### Menu / UI

Jira `DH-55`, `DH-102`, `DH-103`, `DH-104`, and Figma together define:

- In-game menu includes weapon area, relic area, character stat area, settings, quit, return.
- Settings include movement, display comfort, audio, and key binding.
- UI hierarchy matters: menu > result > card draw.
- Result UI should show current weapons, relics, and attributes.
- Death and clear states should have distinct transition feedback.

PC interpretation:

- Replace VR comfort/movement settings with PC equivalents:
  - mouse sensitivity
  - FOV
  - camera shake
  - sprint toggle/hold
  - dash/grapple/keybinds
  - audio sliders
  - accessibility/readability options

### Character / Energy

Jira `DH-542` and `DH-608` are the foundation:

- Characters have passive, mastery, active skill.
- Movement skills are graded: dash, grapple, glide.
- Energy replaces ultimate-only meter.
- Energy costs apply to active skills, dash, grapple, climb, and glide.

PC interpretation:

- Implement energy as a generic resource early.
- Character skills can roll out later, but the energy system should be ready.

### Loot / Item Data Architecture

Jira `DH-558` defines a strong data architecture:

- Loot Table maps enemy/map to drop item weights.
- Item Registry maps item IDs to name, description, category, tier, and asset reference.
- Item Data Asset stores visual resources, UI icon, modifier/stats, and special ability data.

PC interpretation:

- For web/Three.js, translate Unreal Data Asset terms into JSON modules:
  - `lootTables`
  - `itemRegistry`
  - `itemDefinitions`
  - `modifiers`
  - `icons/assets`

### Known Technical Risks

- Physics/tick/collision overhead from monsters, bullets, terrain, and VFX.
- Monster scale/pivot attack-distance issues.
- VFX overload from alpha/particle-heavy effects.
- UI state conflicts when menu/result/card selection overlap.

## Still Needs Deep Jira Reading

The following areas still need a focused pass:

- All 37 Epics and their child issues, grouped by milestone.
- Bugs / `漏洞` only.
- All open issues updated after 2026-03-01.
- All issues containing Figma links.
- All issues containing Google Sheet/Doc links.
- Character-related issues beyond Biochemical, Lightning, and Blue/Rambo monkey.
- Map and level issues, especially V0.07/V0.08.
- Art production issues for monsters, weapons, lobby props, VFX, and UI.
- Technical architecture guide `DH-599`.

## Recommended Jira Review Plan

1. Epic scan: list all 37 epics with status, priority, date, and PC relevance.
2. Open-work scan: list all open/in-progress issues and classify into PC reuse, VR-only, reference-only, or unknown.
3. System scan: read lobby, weapon, run, character, energy, loot, UI, audio, VFX.
4. Asset scan: read all art/model/VFX/UI issues and build PC asset registry.
5. QA scan: read bug/test issues and convert into PC automated QA checks.
6. Backlog conversion: create a separate PC-only backlog proposal without editing Jira.

