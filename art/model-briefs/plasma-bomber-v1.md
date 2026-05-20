# Plasma Bomber V1 Model Brief

## Source

- Concept image: `art/concepts/plasma-bomber-v1.concept.png`
- Concept metadata: `art/concepts/plasma-bomber-v1.concept.json`
- Source GPT Image 2 brief: `studio/art-pipeline/briefs/plasma-bomber-v1.json`

## Goal

Create a low-poly WebGL enemy model for the existing `bomber` behavior. The asset must read as an unstable explosive unit in a top-down survivor shooter at small screen size.

## Output Targets

- GLB: `public/assets/custom/plasma_bomber_v1.glb`
- Blender file: `art/blockouts/plasma_bomber_v1.blend`
- Preview: `art/previews/plasma_bomber_v1.png`

## Silhouette

- Round squat body, about 1.3 Blender units tall.
- Dark segmented armor shell around a bright orange plasma core.
- Four short pointed legs, planted wide enough to read from top-down view.
- Curved segmented fuse tail rising from the back, with a small flame/emissive tip.
- Front warning triangle plate or triangular inset. Use geometry, not text.

## Materials

- Shell: dark charcoal metal, low roughness variation, chipped edges.
- Core: orange/yellow emissive material, visible through shell gaps.
- Warning nodes: small red-orange emissive discs on side plates and legs.
- Fuse flame: emissive orange/yellow with simple cone or clustered low-poly shards.
- Scorch detail: optional dark decal-like patches or vertex-colored cracks.

## Geometry Budget

- Target triangles: 2,000-4,000.
- No high-poly bevel spam; use faceted planes and clear shape language.
- Prefer separate named meshes:
  - `BodyShell`
  - `PlasmaCore`
  - `Leg_FL`, `Leg_FR`, `Leg_BL`, `Leg_BR`
  - `FuseTail`
  - `FuseFlame`
  - `WarningNodes`

## Game Integration Notes

- Existing gameplay data lives in `src/enemy/EnemyTypes.ts` under `bomber`.
- Current placeholder is a sphere with orange emissive color.
- Keep gameplay unchanged for first integration; only swap visual `url`.
- Collision radius should remain near `0.5`.
- Target height should remain near `1.3`.

## QA Checks

- At camera distance, player should instantly read this as an explosive enemy.
- The fuse/flame should be visible from top-down and 3/4 angles.
- The model should not look like a normal ranged unit or pickup.
- Emissive core should remain visible without relying on dynamic lights.
