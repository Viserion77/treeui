import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalogFromRepo, getRepoRootFromPackageRoot } from '../src/catalog-source';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = getRepoRootFromPackageRoot(packageRoot);
const catalog = buildCatalogFromRepo(repoRoot);
const serialized = `${JSON.stringify(catalog, null, 2)}\n`;

const targets = [
  path.join(repoRoot, 'docs/ai/treeui.catalog.json'),
  path.join(packageRoot, 'src/generated/treeui.catalog.json'),
];

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, serialized);
}

console.log(`Generated TreeUI AI catalog in ${targets.length} locations.`);
