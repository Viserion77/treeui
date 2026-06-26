// Rasterize the TreeUI logo SVGs to PNG with correct alpha (no edge fringe).
// Source of truth is the .svg files in apps/docs/public; run after editing them:
//   pnpm render:logos
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'apps/docs/public');

const targets = [
  { svg: 'treeui-logo.svg', png: 'treeui-logo.png', width: 1024 },
  { svg: 'treeui-wordmark.svg', png: 'treeui-wordmark.png', width: 1056 },
  { svg: 'treeui-wordmark-dark.svg', png: 'treeui-wordmark-dark.png', width: 1056 },
];

for (const target of targets) {
  const svg = readFileSync(join(publicDir, target.svg), 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: target.width },
    font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(publicDir, target.png), png);
  console.log(`✓ ${target.png}  (${(png.length / 1024).toFixed(1)} kB)`);
}
