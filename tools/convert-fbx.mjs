// Batch convert FBX assets in All_0417 to .glb for the web build.
//
// Input : F:/PumpkinCase_2026/Gorilla Gun Survivor/Model/All_0417/**/*.FBX
// Output: ./public/assets/{player|arms|monster}/<snake_case_name>.glb
//
// Usage: npm run convert:assets
//        npm run convert:assets -- --dry        (list what would be done)
//        npm run convert:assets -- --force      (overwrite existing .glb)

import { readdir, mkdir, access, copyFile } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { join, relative, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import convert from 'fbx2gltf';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const SRC_ROOT = 'F:/PumpkinCase_2026/Gorilla Gun Survivor/Model/All_0417';
const OUT_ROOT = join(PROJECT_ROOT, 'public', 'assets');

const CATEGORY_MAP = {
  Player: 'player',
  Arms: 'arms',
  Monster: 'monster',
};

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry');
const FORCE = args.has('--force');

function toSnakeCase(name) {
  return name
    .replace(/\.FBX$/i, '')
    .replace(/^SK_/i, '')
    .replace(/^SM_/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === '.fbx') out.push(full);
  }
  return out;
}

async function exists(p) {
  try { await access(p, FS.F_OK); return true; } catch { return false; }
}

async function findTextureFor(fbxPath) {
  const dir = dirname(fbxPath);
  for (const entry of await readdir(dir)) {
    if (/\.png$/i.test(entry)) return join(dir, entry);
  }
  return null;
}

async function main() {
  console.log(`[convert] source: ${SRC_ROOT}`);
  console.log(`[convert] output: ${OUT_ROOT}`);
  console.log(`[convert] mode  : ${DRY ? 'DRY' : 'REAL'}${FORCE ? ' (force)' : ''}\n`);

  const fbxFiles = await walk(SRC_ROOT);
  if (fbxFiles.length === 0) {
    console.error('No FBX files found.');
    process.exit(1);
  }

  const jobs = [];
  for (const src of fbxFiles) {
    const rel = relative(SRC_ROOT, src);
    const topFolder = rel.split(/[\\/]/)[0];
    const category = CATEGORY_MAP[topFolder];
    if (!category) {
      console.warn(`[skip ] unknown category: ${rel}`);
      continue;
    }
    const outName = toSnakeCase(basename(src));
    const outDir = join(OUT_ROOT, category);
    const outFile = join(outDir, `${outName}.glb`);
    jobs.push({ src, outDir, outFile, rel });
  }

  console.log(`[convert] ${jobs.length} FBX files queued\n`);

  let ok = 0, skipped = 0, failed = 0, texCopied = 0, texMissing = 0;
  for (const job of jobs) {
    const label = `${job.rel} -> ${relative(PROJECT_ROOT, job.outFile)}`;
    const glbExists = await exists(job.outFile);
    const skipConvert = !FORCE && glbExists;

    if (DRY) {
      console.log(`[dry  ] ${label}${skipConvert ? ' (convert: skip)' : ''}`);
      continue;
    }

    await mkdir(job.outDir, { recursive: true });

    if (skipConvert) {
      console.log(`[skip ] ${label}  (glb exists; use --force to re-convert)`);
      skipped++;
    } else {
      try {
        await convert(job.src, job.outFile, ['--binary', '--khr-materials-unlit']);
        console.log(`[ok   ] ${label}`);
        ok++;
      } catch (err) {
        console.error(`[FAIL ] ${label}\n        ${err?.message || err}`);
        failed++;
        continue;
      }
    }

    // Always (re)ensure the sibling texture file is copied next to the .glb.
    const texSrc = await findTextureFor(job.src);
    if (texSrc) {
      const outName = basename(job.outFile).replace(/\.glb$/i, '.png');
      const texOut = join(job.outDir, outName);
      await copyFile(texSrc, texOut);
      texCopied++;
    } else {
      console.warn(`[tex? ] no PNG found next to ${job.rel}`);
      texMissing++;
    }
  }

  console.log(`\n[done] glb: ok=${ok} skipped=${skipped} failed=${failed} | textures: copied=${texCopied} missing=${texMissing} | total=${jobs.length}`);
  if (failed > 0) process.exit(2);
}

main().catch((e) => { console.error(e); process.exit(1); });
