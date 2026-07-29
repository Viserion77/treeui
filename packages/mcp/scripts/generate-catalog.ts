import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalogFromRepo, getRepoRootFromPackageRoot } from '../src/catalog-source';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = getRepoRootFromPackageRoot(packageRoot);
const catalog = buildCatalogFromRepo(repoRoot);

// The serialized catalog must stay byte-for-byte stable when the contract data is
// unchanged, otherwise every build dirties the tracked copy with nothing but a clock
// reading. So `generatedAt` carries the source package version instead of a timestamp.
const serializableCatalog = { ...catalog, generatedAt: catalog.packageVersion };
const serialized = `${JSON.stringify(serializableCatalog, null, 2)}\n`;

const targets = [
  path.join(repoRoot, 'docs/ai/treeui.catalog.json'),
  path.join(packageRoot, 'src/generated/treeui.catalog.json'),
];

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, serialized);
}

console.log(`Generated TreeUI AI catalog in ${targets.length} locations.`);
