import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const briefPath = process.argv[2];

if (!briefPath) {
  console.error('Usage: npm run art:concept -- <brief.json>');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required to generate concept images.');
  process.exit(1);
}

const absoluteBrief = path.resolve(root, briefPath);
const brief = JSON.parse(fs.readFileSync(absoluteBrief, 'utf8'));
const slug = brief.slug ?? path.basename(briefPath, path.extname(briefPath));
const outDir = path.resolve(root, brief.outputDir ?? 'art/concepts');
const promptPath = path.join(outDir, `${slug}.prompt.txt`);
const imagePath = path.join(outDir, `${slug}.concept.png`);
const metaPath = path.join(outDir, `${slug}.concept.json`);

fs.mkdirSync(outDir, { recursive: true });

const prompt = [
  brief.prompt,
  '',
  'Game production reference sheet requirements:',
  '- single asset only, centered, isolated on a plain neutral background',
  '- include front view, side view, and 3/4 view when possible',
  '- clear silhouette readable at small size',
  '- material callouts for Blender modeling and texture work',
  '- no logos, no UI, no text labels unless requested',
  '- stylized low-poly friendly form suitable for WebGL game assets',
  brief.negativePrompt ? `Avoid: ${brief.negativePrompt}` : '',
].filter(Boolean).join('\n');

fs.writeFileSync(promptPath, prompt, 'utf8');

const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: brief.model ?? 'gpt-image-2',
    prompt,
    size: brief.size ?? '1536x1024',
    quality: brief.quality ?? 'medium',
    output_format: brief.outputFormat ?? 'png',
  }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`OpenAI image generation failed: ${response.status} ${body}`);
}

const result = await response.json();
const imageBase64 = result.data?.[0]?.b64_json;

if (!imageBase64) {
  throw new Error('OpenAI image generation returned no image data.');
}

fs.writeFileSync(imagePath, Buffer.from(imageBase64, 'base64'));
fs.writeFileSync(metaPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  model: brief.model ?? 'gpt-image-2',
  sourceBrief: path.relative(root, absoluteBrief),
  promptPath: path.relative(root, promptPath),
  imagePath: path.relative(root, imagePath),
  revisedPrompt: result.data?.[0]?.revised_prompt ?? null,
}, null, 2), 'utf8');

console.log(`Concept image saved: ${imagePath}`);
console.log(`Prompt saved: ${promptPath}`);
