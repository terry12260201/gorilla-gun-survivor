import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const studioDir = path.join(root, 'studio');
const outDir = path.join(studioDir, 'dashboard');
const outPath = path.join(outDir, 'terry-progress.html');

function findStudioFile(prefix) {
  try {
    return fs.readdirSync(studioDir).find((name) => name.startsWith(prefix)) ?? '';
  } catch {
    return '';
  }
}

const files = {
  sprint: path.join(studioDir, 'SPRINT-2026-05-18.md'),
  agentRuns: path.join(studioDir, 'AGENT-RUNS.md'),
  testing: path.join(studioDir, 'TESTING.md'),
  handoff: path.join(studioDir, 'HANDOFF-CURRENT.md'),
  artPipeline: path.join(studioDir, 'art-pipeline', 'ART-PIPELINE.md'),
  art01: path.join(studioDir, 'art-pipeline', 'ART-01-shock-baton.md'),
  worklog: path.join(root, '.ops', 'logs', 'terry-worklog-20260518.md'),
};

const openspecDir = path.join(root, 'openspec');

/**
 * OpenSpec helpers
 * scanSpecCounts: 計算 openspec/specs/<category>/ 各別檔案數
 * scanRoles:      讀 openspec/roles/<dept>/*.md 摘要為儀表板用
 * extractLatestChangelog: 從一份 spec 抽 Changelog 段最後一行的日期
 */
function listMd(dir) {
  try {
    return fs.readdirSync(dir)
      .filter((name) => name.endsWith('.md') && name !== 'README.md')
      .map((name) => path.join(dir, name));
  } catch {
    return [];
  }
}

function scanSpecCounts() {
  const base = path.join(openspecDir, 'specs');
  const cats = ['weapons', 'enemies', 'elements', 'systems', 'cards', 'meta-progression', 'maps'];
  return cats.map((c) => ({
    name: c,
    count: listMd(path.join(base, c)).length,
  }));
}

function scanRoleCounts() {
  const base = path.join(openspecDir, 'roles');
  const depts = ['c-suite', 'design', 'art', 'programming', 'audio', 'marketing', 'qa'];
  return depts.map((d) => ({
    name: d,
    count: listMd(path.join(base, d)).length,
    files: listMd(path.join(base, d)),
  }));
}

function extractLatestChangelog(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const lines = txt.split(/\r?\n/);
    const cIdx = lines.findIndex((l) => /^##\s+Changelog\s*$/i.test(l.trim()));
    if (cIdx === -1) return { date: '', note: '' };
    for (let i = lines.length - 1; i > cIdx; i -= 1) {
      const m = lines[i].match(/^-\s+(\d{4}-\d{2}-\d{2})[:\s]+(.+)$/);
      if (m) return { date: m[1], note: m[2].trim() };
    }
    return { date: '', note: '' };
  } catch {
    return { date: '', note: '' };
  }
}

function extractTitle(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const m = txt.match(/^#\s+(.+?)$/m);
    return m ? m[1].trim() : path.basename(filePath, '.md');
  } catch {
    return path.basename(filePath, '.md');
  }
}

function scanRecentSpecUpdates(limit = 6) {
  const all = [];
  const specsBase = path.join(openspecDir, 'specs');
  const rolesBase = path.join(openspecDir, 'roles');
  for (const dir of [specsBase, rolesBase]) {
    let subdirs = [];
    try { subdirs = fs.readdirSync(dir); } catch { /* skip */ }
    for (const sub of subdirs) {
      const subPath = path.join(dir, sub);
      let stat;
      try { stat = fs.statSync(subPath); } catch { continue; }
      if (!stat.isDirectory()) continue;
      for (const fp of listMd(subPath)) {
        const cl = extractLatestChangelog(fp);
        if (!cl.date) continue;
        const rel = path.relative(root, fp).replace(/\\/g, '/');
        all.push({
          path: rel,
          title: extractTitle(fp),
          date: cl.date,
          note: cl.note,
        });
      }
    }
  }
  all.sort((a, b) => b.date.localeCompare(a.date));
  return all.slice(0, limit);
}

function specHealthSummary() {
  const sc = scanSpecCounts();
  const rc = scanRoleCounts();
  const totalSpecs = sc.reduce((s, c) => s + c.count, 0);
  const totalRoles = rc.reduce((s, c) => s + c.count, 0);
  return {
    specCounts: sc,
    roleCounts: rc,
    totalSpecs,
    totalRoles,
    total: totalSpecs + totalRoles,
    recent: scanRecentSpecUpdates(6),
  };
}

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function clean(value) {
  return String(value)
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim();
}

function section(md, title) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${title}`);
  if (start === -1) return '';
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ')) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

function rowsFromTable(md, title) {
  const target = title ? section(md, title) : md;
  const rows = [];
  for (const line of target.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue;
    if (line.includes('---')) continue;
    const cols = line.split('|').slice(1, -1).map((cell) => clean(cell));
    if (cols.length > 1 && !/^(項目|階段|任務ID|測試點|角色|檔案|狀態|優先)$/.test(cols[0])) {
      rows.push(cols);
    }
  }
  return rows;
}

function listItems(md) {
  return md
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => clean(line.slice(2)));
}

function clampItems(items, count) {
  return items.filter(Boolean).slice(0, count);
}

function renderRows(rows, empty = '目前沒有可顯示資料') {
  if (rows.length === 0) return `<p class="empty">${escapeHtml(empty)}</p>`;
  return rows.map((row) => {
    const [lead, ...rest] = row;
    return `<div class="data-row">
      <div class="data-lead">${escapeHtml(lead)}</div>
      <div class="data-copy">${escapeHtml(rest.join(' ｜ '))}</div>
    </div>`;
  }).join('');
}

function renderList(items, empty = '目前沒有可顯示資料') {
  if (items.length === 0) return `<p class="empty">${escapeHtml(empty)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

const sprint = read(files.sprint);
const agentRuns = read(files.agentRuns);
const testing = read(files.testing);
const handoff = read(files.handoff);
const artPipeline = read(files.artPipeline);
const art01 = read(files.art01);
const worklog = read(files.worklog);

const testRows = [
  ['Checkpoint B', '進入遊戲後升級，確認武器卡是否出現「電弧短杖」'],
  ['新武器手感', '選到電弧短杖後，觀察它是否會發射、是否和原本武器有明顯差異'],
  ['掉血救援節奏', '故意讓血量降低，確認場上愛心掉落是否能救回玩家但不會太輕鬆'],
  ['基礎效能', '遊玩 2-3 分鐘，確認 FPS 沒有明顯卡頓或錯誤訊息'],
];

const completedRows = [
  ['QA-02 runtime', 'qaBombers mode verified both plasma_bomber_v1.glb and plasma_bomber_v2.glb load in-game with no console errors.'],
  ['ART-03 V2', 'User plasma_bomber_v2.blend exported to GLB and added as a stronger in-game bomber variant.'],
  ['ART-02 GLB', 'plasma_bomber_v1.glb exported from Blender and connected to the existing bomber enemy visual.'],
  ['ART-02 concept', 'plasma-bomber-v1 GPT Image 2 reference sheet generated at art/concepts/plasma-bomber-v1.concept.png'],
  ['部署與紀錄', '已建立 Terry Control / Live Ops 終端機，操作與輸出會寫入 .ops/logs'],
  ['武器資料化', 'auto weapon 已搬到 src/data/weapons.json，後續新增武器不用硬改主程式'],
  ['資料驗證', '新增 validate:weapons，build 前會檢查武器 JSON、GLB 路徑與數值格式'],
  ['新武器原型', '已加入 wpn_shock_baton「電弧短杖」與 Blender blockout GLB'],
  ['Dashboard', '已建立 Terry 中文進度網站，追蹤測試、事件腳本、AI 分工、美術流程與工作紀錄'],
  ['Obsidian', '重要部署、Dashboard、美術管線與 Blender MCP 策略已寫入南瓜虛擬科技筆記'],
];

const gapRows = [
  ['plasma bomber visual polish', 'Runtime loading is verified; next check is player-facing readability, fuse warning clarity, and top-down scale polish.'],
  ['GPT Image 2 概念圖', '目前已建立 art:concept 腳本與 shock-baton-v2 brief，等待 API key 後即可產出正式概念圖'],
  ['怪物差異', '需要新增至少 1 種新怪物，包含外型、速度、血量、攻擊節奏與測試目標'],
  ['關卡節奏', '目前場景與波次仍偏原型，需要新地圖或事件波次讓 3-5 分鐘遊玩更有變化'],
  ['特效回饋', '電弧、命中、危險提示、升級選卡的視覺回饋仍要加強'],
  ['平衡 QA', '需要建立 5/10/15 分鐘基準測試，校正傷害、掉落、怪物壓力與升級速度'],
  ['效能優化', '目前 build 有 chunk size warning，之後要做 lazy loading 或 manualChunks'],
];

const nextRows = [
  ['QA-03', 'Use visible playtest pass to judge bomber readability, fuse warning clarity, and whether v1/v2 need distinct silhouettes.'],
  ['ART-01', '用 GPT Image 2 先產電弧短杖 reference sheet，再讓 Blender 依圖製作 v3 模型與貼圖'],
  ['GAME-02', '接回 shock_baton_v2.glb，更新 weapons.json 並重新 build'],
  ['VFX-01', '補電弧短杖的彈道顏色、命中特效與發光回饋'],
  ['ENEMY-01', '規劃第一隻新怪物：輪廓、行為、數值、QA 測試條件'],
  ['QA-01', 'Terry 測試 Checkpoint B，回報新武器是否看得懂、是否好玩、是否太強或太弱'],
];
const sprintRows = rowsFromTable(sprint, 'Active Work Items');
const agentRows = rowsFromTable(agentRuns);
const testingItems = clampItems(listItems(testing), 10);
const handoffItems = clampItems(listItems(handoff), 8);
const artSteps = clampItems(listItems(artPipeline), 12);
const art01Items = clampItems(listItems(art01), 12);
const recentLog = worklog.split(/\r?\n/).filter(Boolean).slice(-12).join('\n');

// OpenSpec scan (新架構：openspec/ 下的所有 spec + role 檔案)
const openspec = specHealthSummary();
const specCategoryLabels = {
  weapons: '武器',
  enemies: '敵人',
  elements: '元素',
  systems: '系統',
  cards: '升級卡',
  'meta-progression': 'META 升級',
  maps: '地圖',
};
const deptLabels = {
  'c-suite': 'C-Suite',
  design: '企劃',
  art: '美術',
  programming: '程式',
  audio: '音效',
  marketing: '行銷',
  qa: 'QA',
};

const completed = sprintRows.filter((row) => /done|完成|已完成/i.test(row.join(' '))).length;
const total = Math.max(sprintRows.length, 1);
const progress = Math.round((completed / total) * 100);
const updated = new Date().toLocaleString('zh-TW', { hour12: false });

fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gorilla Gun Survivor｜Terry 製作中控台</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #1D2020;
      --purple: #5C2AC6;
      --lime: #C3FF3D;
      --paper: #F3F0E9;
      --white: #FFFFFF;
      --line: rgba(29, 32, 32, 0.16);
      --muted: rgba(29, 32, 32, 0.66);
      --shadow: 0 22px 60px rgba(29, 32, 32, 0.18);
      --radius: 8px;
      --gap: 16px;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at 12% 0%, rgba(195, 255, 61, 0.28), transparent 28%),
        linear-gradient(135deg, #2b105e 0%, var(--purple) 44%, #4616a8 100%);
      color: var(--ink);
      font-family: "Microsoft JhengHei", "Noto Sans TC", "Inter", system-ui, sans-serif;
      font-size: 15px;
      line-height: 1.65;
      letter-spacing: 0;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(180deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 72px 72px;
      mask-image: linear-gradient(180deg, black, transparent 62%);
    }

    .shell {
      width: min(1480px, calc(100% - 40px));
      margin: 0 auto;
      padding: 28px 0 44px;
      position: relative;
    }

    .hero {
      min-height: 360px;
      display: grid;
      grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);
      align-items: end;
      gap: 28px;
      color: var(--white);
      padding: 28px 0 18px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      min-height: 32px;
      padding: 4px 12px;
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      font-size: 13px;
      color: rgba(255, 255, 255, 0.86);
    }

    h1, h2, h3, p { margin-top: 0; }

    h1 {
      max-width: 920px;
      margin: 18px 0 16px;
      color: var(--lime);
      font-size: clamp(48px, 8vw, 118px);
      line-height: 0.95;
      font-weight: 900;
      letter-spacing: 0;
    }

    .hero-copy {
      max-width: 820px;
      margin: 0;
      font-size: clamp(18px, 2.1vw, 28px);
      color: rgba(255, 255, 255, 0.88);
    }

    .status-stack {
      display: grid;
      gap: var(--gap);
    }

    .status-card {
      background: var(--white);
      border: 1px solid rgba(255, 255, 255, 0.7);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: var(--shadow);
    }

    .status-card.dark {
      background: var(--ink);
      color: var(--white);
      border-color: rgba(195, 255, 61, 0.28);
    }

    .metric {
      font-size: 42px;
      line-height: 1;
      font-weight: 900;
      color: var(--purple);
    }

    .dark .metric { color: var(--lime); }

    .label {
      margin-bottom: 8px;
      color: var(--muted);
      font-weight: 800;
      font-size: 13px;
    }

    .dark .label { color: rgba(255, 255, 255, 0.68); }

    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: var(--gap);
      align-items: start;
    }

    .panel {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: var(--shadow);
      min-width: 0;
    }

    .panel.white { background: var(--white); }
    .panel.ink { background: var(--ink); color: var(--white); }
    .panel.lime { background: var(--lime); }

    .span-3 { grid-column: span 3; }
    .span-4 { grid-column: span 4; }
    .span-5 { grid-column: span 5; }
    .span-6 { grid-column: span 6; }
    .span-7 { grid-column: span 7; }
    .span-8 { grid-column: span 8; }
    .span-12 { grid-column: span 12; }

    .section-title {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    h2 {
      margin-bottom: 0;
      font-size: 24px;
      line-height: 1.2;
      font-weight: 900;
      color: inherit;
    }

    h3 {
      margin: 18px 0 8px;
      font-size: 16px;
      font-weight: 900;
      color: var(--purple);
    }

    .ink h3 { color: var(--lime); }

    .subtle {
      color: var(--muted);
      font-size: 13px;
    }

    .ink .subtle { color: rgba(255, 255, 255, 0.7); }

    .bar {
      height: 16px;
      overflow: hidden;
      border: 2px solid var(--ink);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.58);
    }

    .bar > div {
      width: ${progress}%;
      min-width: 8px;
      height: 100%;
      background: linear-gradient(90deg, var(--purple), var(--lime));
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 3px 10px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.5);
      color: var(--ink);
      font-size: 13px;
      font-weight: 800;
    }

    .chip.strong {
      background: var(--lime);
      border-color: var(--ink);
    }

    .data-row {
      display: grid;
      grid-template-columns: minmax(130px, 0.32fr) minmax(0, 1fr);
      gap: 14px;
      padding: 12px 0;
      border-top: 1px solid var(--line);
    }

    .data-row:first-child { border-top: 0; padding-top: 0; }

    .data-lead {
      font-weight: 900;
      color: var(--purple);
      overflow-wrap: anywhere;
    }

    .ink .data-lead { color: var(--lime); }

    .data-copy {
      color: var(--ink);
      overflow-wrap: anywhere;
    }

    .ink .data-copy { color: rgba(255, 255, 255, 0.86); }

    ul {
      margin: 0;
      padding-left: 18px;
    }

    li { margin: 8px 0; }

    .empty {
      margin: 0;
      color: var(--muted);
    }

    .pipeline {
      display: grid;
      grid-template-columns: repeat(7, minmax(130px, 1fr));
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 6px;
    }

    .step {
      min-height: 132px;
      padding: 14px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.08);
    }

    .step-num {
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      margin-bottom: 10px;
      border-radius: 999px;
      background: var(--lime);
      color: var(--ink);
      font-weight: 900;
    }

    .step-title {
      display: block;
      font-weight: 900;
      color: var(--white);
    }

    .step-copy {
      display: block;
      margin-top: 6px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
    }

    pre {
      max-height: 300px;
      margin: 0;
      padding: 14px;
      overflow: auto;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.54);
      color: var(--ink);
      font: 13px/1.6 "Cascadia Mono", Consolas, monospace;
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(5, minmax(90px, 1fr));
      gap: 10px;
    }

    /* OpenSpec health grid */
    .spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr;
      gap: 24px;
    }
    .spec-col h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 900;
      color: var(--ink);
      border-bottom: 2px solid var(--ink);
      padding-bottom: 6px;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px dashed rgba(29,32,32,0.2);
    }
    .spec-name {
      font-weight: 700;
      color: var(--ink);
    }
    .spec-count {
      font-weight: 900;
      font-size: 18px;
      color: var(--purple);
      background: rgba(255,255,255,0.5);
      padding: 2px 10px;
      border-radius: 999px;
      min-width: 36px;
      text-align: center;
    }
    .spec-count.empty {
      color: rgba(29,32,32,0.45);
      background: rgba(255,255,255,0.25);
    }
    .spec-col-wide .data-row {
      padding: 8px 0;
      border-top: 1px solid rgba(29,32,32,0.15);
    }
    @media (max-width: 1100px) {
      .spec-grid { grid-template-columns: 1fr; gap: 16px; }
    }

    .swatch {
      min-height: 104px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-weight: 900;
    }

    .swatch span {
      font-size: 13px;
      font-weight: 700;
    }

    footer {
      margin-top: var(--gap);
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
      text-align: center;
    }

    @media (max-width: 1100px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .span-3, .span-4, .span-5, .span-6, .span-7, .span-8 { grid-column: span 12; }
      .pipeline { grid-template-columns: repeat(4, minmax(150px, 1fr)); }
    }

    @media (max-width: 760px) {
      .shell { width: min(100% - 24px, 1480px); padding-top: 16px; }
      h1 { font-size: 46px; }
      .metric { font-size: 34px; }
      .data-row { grid-template-columns: 1fr; gap: 2px; }
      .pipeline { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
      .swatches { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="shell">
    <section class="hero">
      <div>
        <span class="eyebrow">Terry 製作中控台｜最後更新 ${escapeHtml(updated)}</span>
        <h1>Gorilla Gun Survivor</h1>
        <p class="hero-copy">這是 Gorilla Gun Survivor 的 Terry 製作中控台。這裡記錄目前已完成的開發、現在可以測試的內容、下一步事件腳本、AI 夥伴分工，以及美術資產從概念到 3D 匯入遊戲的進度。</p>
        <div class="chips">
          <span class="chip strong">現在可測：Checkpoint B</span>
          <span class="chip">新武器：電弧短杖</span>
          <span class="chip">美術流程：已建立</span>
          <span class="chip">部署：本機 Vite 運行中</span>
        </div>
      </div>
      <div class="status-stack">
        <div class="status-card dark">
          <div class="label">好玩原型完成度</div>
          <div class="metric">35-40%</div>
          <p class="subtle">核心循環存在，但仍需要更多武器差異、怪物壓力、關卡節奏與特效回饋。</p>
        </div>
        <div class="status-card">
          <div class="label">本輪 Sprint 完成度</div>
          <div class="metric">${completed}/${total}</div>
          <div class="bar" aria-label="Sprint 完成度"><div></div></div>
        </div>
      </div>
    </section>

    <section class="grid">
      <article class="panel lime span-4">
        <div class="section-title">
          <h2>你現在要測什麼</h2>
          <span class="subtle">玩家視角</span>
        </div>
        ${renderRows(testRows, '等下一次資料更新後會顯示測試項目。')}
      </article>

      <article class="panel white span-4">
        <div class="section-title">
          <h2>已經完成什麼</h2>
          <span class="subtle">交付清單</span>
        </div>
        ${renderRows(completedRows)}
      </article>

      <article class="panel white span-4">
        <div class="section-title">
          <h2>還差什麼</h2>
          <span class="subtle">缺口清單</span>
        </div>
        ${renderRows(gapRows)}
      </article>

      <article class="panel lime span-12">
        <div class="section-title">
          <h2>📐 規格健康度 · OpenSpec 架構</h2>
          <span class="subtle">${openspec.totalSpecs} 份規格 + ${openspec.totalRoles} 位角色 = ${openspec.total} 份 MD</span>
        </div>
        <div class="spec-grid">
          <div class="spec-col">
            <h3>規格類別</h3>
            ${openspec.specCounts.map((c) => `<div class="spec-row"><span class="spec-name">${escapeHtml(specCategoryLabels[c.name] || c.name)}</span><span class="spec-count ${c.count === 0 ? 'empty' : ''}">${c.count}</span></div>`).join('')}
          </div>
          <div class="spec-col">
            <h3>團隊編制</h3>
            ${openspec.roleCounts.map((c) => `<div class="spec-row"><span class="spec-name">${escapeHtml(deptLabels[c.name] || c.name)}</span><span class="spec-count ${c.count === 0 ? 'empty' : ''}">${c.count}</span></div>`).join('')}
          </div>
          <div class="spec-col spec-col-wide">
            <h3>最近更新的 spec</h3>
            ${openspec.recent.length === 0
              ? '<p class="empty">尚無 changelog 紀錄。openspec/ 可能還沒 commit。</p>'
              : openspec.recent.map((r) => `<div class="data-row"><div class="data-lead">${escapeHtml(r.date)}</div><div class="data-copy"><strong>${escapeHtml(r.title)}</strong> ｜ ${escapeHtml(r.note)} <br><code style="font-size:11px;opacity:0.7">${escapeHtml(r.path)}</code></div></div>`).join('')}
          </div>
        </div>
      </article>

      <article class="panel ink span-12">
        <div class="section-title">
          <h2>美術部到遊戲整合流程</h2>
          <span class="subtle">Concept → 3D → Animation → VFX → Gameplay → QA</span>
        </div>
        <div class="pipeline">
          <div class="step"><span class="step-num">1</span><span class="step-title">Concept Brief</span><span class="step-copy">先寫用途、玩法、輪廓、材質、禁忌項目。</span></div>
          <div class="step"><span class="step-num">2</span><span class="step-title">GPT Image 2</span><span class="step-copy">產出 reference sheet、貼圖方向與材質視覺。</span></div>
          <div class="step"><span class="step-num">3</span><span class="step-title">CAO 審稿</span><span class="step-copy">確認辨識度、俯視角可讀性與玩法需求。</span></div>
          <div class="step"><span class="step-num">4</span><span class="step-title">Blender 3D</span><span class="step-copy">用 MCP 或 Python 依圖建立模型、材質、GLB。</span></div>
          <div class="step"><span class="step-num">5</span><span class="step-title">VFX / Animation</span><span class="step-copy">補動作、彈道、命中特效與發光回饋。</span></div>
          <div class="step"><span class="step-num">6</span><span class="step-title">Game Integration</span><span class="step-copy">把 GLB、數值、特效接進遊戲邏輯。</span></div>
          <div class="step"><span class="step-num">7</span><span class="step-title">QA / Terry</span><span class="step-copy">測好不好玩、是否卡頓、是否看得懂。</span></div>
        </div>
      </article>

      <article class="panel white span-7">
        <div class="section-title">
          <h2>接下來事件腳本</h2>
          <span class="subtle">開發行程</span>
        </div>
        ${renderRows(nextRows)}
      </article>

      <article class="panel white span-5">
        <div class="section-title">
          <h2>AI 夥伴狀態</h2>
          <span class="subtle">Codex / Claude 分工</span>
        </div>
        ${renderRows(agentRows.slice(-6))}
      </article>

      <article class="panel white span-6">
        <div class="section-title">
          <h2>測試清單</h2>
          <span class="subtle">每次更新都照這裡測</span>
        </div>
        ${renderList(testingItems)}
      </article>

      <article class="panel white span-6">
        <div class="section-title">
          <h2>目前交接重點</h2>
          <span class="subtle">斷線可從這裡恢復</span>
        </div>
        ${renderList(handoffItems)}
      </article>

      <article class="panel ink span-6">
        <div class="section-title">
          <h2>美術管線筆記</h2>
          <span class="subtle">怎麼做得到</span>
        </div>
        ${renderList(artSteps)}
      </article>

      <article class="panel ink span-6">
        <div class="section-title">
          <h2>ART-01 電弧短杖</h2>
          <span class="subtle">第一個實作範例</span>
        </div>
        ${renderList(art01Items)}
      </article>

      <article class="panel white span-12">
        <div class="section-title">
          <h2>最近工作紀錄</h2>
          <span class="subtle">終端機關掉也不會消失</span>
        </div>
        <pre>${escapeHtml(recentLog || '目前沒有工作紀錄。')}</pre>
      </article>
    </section>

    <footer>
      這個 HTML 由 <code>npm run dashboard:update</code> 重新產生。後續每次完成新武器、新怪物、新關卡或 QA 結論，都會同步更新這頁。
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync(outPath, html, 'utf8');
console.log(`Updated ${outPath}`);
