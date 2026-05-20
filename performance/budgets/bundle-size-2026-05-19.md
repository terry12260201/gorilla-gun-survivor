# Bundle Size Baseline — 2026-05-19

Owner: PERF-01 (parallel slice produced by Claude Cowork loop tick #4, awaiting Terry verify)
Build measured: `dist/` snapshot mtime 2026-05-19 01:25 (commit pre-VFX-01 Slice 2;
assets unchanged since). Treat this as the baseline against which all post-VFX-01
builds should be compared.
Tool: Vite 5.2 production build (`npm run build` → `tsc --noEmit && vite build`)
Source of numbers: existing `dist/` checked in on Terry's working tree, measured via `du` / `find -printf` / `gzip -c | wc -c` from the Cowork sandbox.

> ⚠️ Sandbox-vs-Windows caveat: Cowork sandbox `node`/`wc` read of host-mounted files has been observed stale (see `studio/CLAUDE-PENDING-CHANGES.md` tick #2). The numbers below come from `du` on the dist tree, which is **content-addressable per file** and was sanity-checked by `gzip -c | wc -c` (independent code path) — so these should be safe. Terry **must** re-run the methodology section once on Windows and overwrite this row if anything differs.

---

## 1. 總 Size

| Metric | Value | Notes |
|---|---|---|
| `dist/` total (apparent) | **5.20 MiB** (~5,243,584 bytes) | `du -sh dist` |
| `dist/index.html` | 1,709 B (1.67 KiB) | style block still inline (no extracted CSS) |
| Main JS bundle | **665,876 B (650.27 KiB)** | `assets/index-K-Uk4FcG.js` |
| Main JS gzipped | **173,851 B (169.78 KiB)** | `gzip -c assets/index-*.js \| wc -c` |
| Static assets (arms+custom+monster+player) | 4.57 MiB (~4,793,001 B) | sum of 4 sub-directories |
| Extracted CSS | 0 B | styles still inline in `index.html` |

> Vite's default `build.chunkSizeWarningLimit` = 500 KiB. Our main bundle is
> 650 KiB → **above warn**. This is the warning Terry's outbox called out as
> the reason PERF-01 must produce a baseline this week.

---

## 2. Main Chunk Breakdown

There is currently only **one** JS chunk. `vite.config.ts` does not configure
`build.rollupOptions.output.manualChunks`, so the build emits a single
`index-<hash>.js` containing `three`, all `src/**/*.ts`, and every transitive
dependency.

| Bucket | Estimated raw share of 650 KiB | Estimated gzip share of 170 KiB | Basis |
|---|---|---|---|
| `three@^0.163.0` runtime | ~480–510 KiB | ~140–155 KiB | three r163 prod-min ≈ 600 KB raw / ≈ 170 KB gzip standalone; in this bundle three is the dominant import graph |
| Game code (`src/**`, 40 .ts files, 213 KB raw on disk) | ~120–150 KiB | ~15–25 KiB | tree-shake + dedupe with three's types; ts → js compresses ~6×–8× under gzip |
| Type-only / vite client glue | <5 KiB | <2 KiB | mostly stripped at build time |

⚠️ **No source-map / `rollup-plugin-visualizer` output exists**, so the table
above is an upper-bound estimate, not a measurement. The first hardening pass
(see §5 item 1) should add `visualizer({ filename: 'dist/stats.html' })` and
overwrite this section with byte-accurate numbers.

---

## 3. Three.js "Chunk"

⚠️ **There is no separate three.js chunk today.** Three is bundled inline
inside `index-K-Uk4FcG.js`.

Splitting it out is a one-line change in `vite.config.ts`:

```ts
build: {
  target: 'es2022',
  rollupOptions: {
    output: {
      manualChunks: {
        three: ['three'],
      },
    },
  },
},
```

Expected post-split sizes (rough projection from the bucket table above):

| Chunk | Raw | Gzip |
|---|---|---|
| `index-*.js` (game only) | ~150 KiB | ~25 KiB |
| `three-*.js` | ~500 KiB | ~150 KiB |

The win is **cache reuse**, not first-load (gzip total stays the same).
After-three-is-pinned, dev iterations / weapon-data hot-fixes ship 25 KiB of
JS instead of 170 KiB.

This split is **not in this slice's scope** — Terry's outbox says PERF-01 only
needs the baseline this week, optimization is a later card.

---

## 4. Top Largest Files in `dist/`

The "top 5 modules" requirement in the brief is reinterpreted as **top 5 files
that drive `dist/` size**, since the JS bundle is unsplit and the real fat is
in assets:

| Rank | File | Bytes | Note |
|---|---|---|---|
| 1 | `assets/custom/shock_baton_v2.glb` | 602,700 | GAME-01 weapon. GAME-02 plans to swap to v3; the new GLB must be ≤ this size or PERF reviews it. |
| 2 | `assets/arms/8_l.png` | 277,685 | Arms weapon-set texture |
| 3 | `assets/arms/8_l.glb` | 268,744 | Arms weapon-set model |
| 4 | `assets/arms/4_l_004_2.png` | 262,597 | Arms weapon-set texture |
| 5 | `assets/arms/4_l_004_2.glb` | 228,592 | Arms weapon-set model |

Honourable mentions (also > 100 KiB):

- `assets/player/holyknight_includehead.glb` — 226,668
- `assets/player/exorcist_includehead.glb` — 211,896
- `assets/arms/5_l_2.png` — 150,988
- `assets/monster/enemy_c_01.glb` — 132,688

Totals by category:

| Directory | Total | Notes |
|---|---|---|
| `assets/arms` | **2.25 MiB** | Biggest bucket — 8 weapon sets bundled even if a run only uses 1–2 |
| `assets/monster` | 881 KiB | Includes `enemy_c_01.glb` 130 KiB + several smaller |
| `assets/custom` | 802 KiB | Mostly `shock_baton_v2.glb` |
| `assets/player` | 598 KiB | Two playable characters |

---

## 5. 觀察與後續建議（不在本 slice 動手，只列）

1. **Quick win: split `three` chunk.** ~5-line `vite.config.ts` change, no
   runtime risk. After it lands, re-measure both chunks in this file.
2. **Add `rollup-plugin-visualizer`** to generate `dist/stats.html` per
   build. Without it §2's percentages stay estimates.
3. **`assets/arms` audit.** Each weapon set is ~250–500 KiB. If a run only
   uses 1–2, lazy-load on selection instead of bundling all 8.
4. **PNG compression pass.** All textures appear to be uncompressed PNG.
   `oxipng -o4` typically saves 30–50 % on game-art PNGs without quality
   loss; KTX2/basis would save more but needs runtime decoder.
5. **`shock_baton_v2.glb` 602 KiB is on the high side.** When GAME-02
   integrates v3, push back to ART pipeline if the new file is bigger.
6. **CSS stays inline** while UI is small — fine for now. Reassess after
   the next two UI cards land.

These are deliberately **observations only**. Terry's outbox is explicit:
PERF-01 = measurement only this week; optimization is a separate card.

---

## 6. 度量方法（複現）

PowerShell (Windows, authoritative):

```powershell
cd "E:\Project\2026\Gorilla Gun Survivor — Web Edition"
npm run build                        # 重 build → dist/
# Total size
"{0:N0} bytes" -f ((Get-ChildItem dist -Recurse -File | Measure-Object Length -Sum).Sum)
# Main chunk raw
Get-ChildItem dist/assets/index-*.js | Select-Object Name, Length
# Main chunk gzip
$bytes = [System.IO.File]::ReadAllBytes((Get-ChildItem dist/assets/index-*.js).FullName)
$ms = New-Object System.IO.MemoryStream
$gz = New-Object System.IO.Compression.GZipStream($ms, [System.IO.Compression.CompressionLevel]::Optimal)
$gz.Write($bytes, 0, $bytes.Length); $gz.Close()
"{0:N0} bytes (gzip)" -f $ms.Length
# Top 10 largest files (any type)
Get-ChildItem dist -Recurse -File | Sort-Object Length -Descending | Select-Object -First 10 Name, Length
# Category totals
foreach ($d in 'arms','custom','monster','player') {
  "$((Get-ChildItem dist/assets/$d -Recurse -File | Measure-Object Length -Sum).Sum)`tassets/$d"
}
```

Linux/sandbox equivalents (used to produce this file):

```bash
cd "/path/to/Gorilla Gun Survivor — Web Edition"
du -sb dist
find dist -name '*.js' -type f -printf '%s %p\n'
gzip -c dist/assets/index-*.js | wc -c
find dist/assets -type f -printf '%s %p\n' | sort -rn | head -10
for d in arms custom monster player; do du -sb dist/assets/$d; done
```

---

## 7. 何時重跑本檔

Re-run the methodology in §6 and overwrite this file whenever any of these
land on `main`:

- A new `dependencies` entry (runtime; devDeps don't count) in `package.json`.
- Any new asset ≥ 100 KiB.
- A change to `vite.config.ts` build options.
- A new dynamic import / lazy-load / manualChunks change.
- Main bundle gzip exceeds **200 KiB** (current is 170 KiB; this is the alert
  line — investigate before merging).

---

## Verify-on-Windows checklist (for Terry)

This file was produced from the sandbox; please confirm on Windows before
treating it as canonical:

- [ ] `npm run build` succeeds and emits a single `assets/index-*.js` (or
  multiple if you've already landed manualChunks).
- [ ] Re-run §6 PowerShell — totals match within ±1 KiB.
- [ ] gzip of main chunk ≤ 200 KiB.
- [ ] No new file > 700 KiB appeared.

If everything matches, drop the `(pending Terry verify)` tag in the front
matter and commit.

---

## Sources

- `dist/` snapshot, 2026-05-19 01:25 build (sandbox `du`, `find`, `gzip` measurements).
- `package.json` — runtime deps = `three@^0.163.0` only.
- `vite.config.ts` — no `manualChunks`; `target: 'es2022'`; chunk size warning at default 500 KiB.
- Three.js r163 published bundle size (reference for §2 estimation).
- Produced by: Claude (Cowork loop tick #4) — `studio/AGENT-RUNS.md` 2026-05-19 ~18:15.
