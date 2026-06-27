// Assemble the deployed docs site from the landing app and both Storybooks:
//   site/            -> landing (apps/landing/dist) at the root
//   site/vue/        -> Vue Storybook   (apps/docs/storybook-static)
//   site/react/      -> React Storybook (apps/docs-react/storybook-static)
// Run the full pipeline with `pnpm build:site` (builds all three first).
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');

const landingDist = join(root, 'apps/landing/dist');
const vueStatic = join(root, 'apps/docs/storybook-static');
const reactStatic = join(root, 'apps/docs-react/storybook-static');

for (const [name, dir] of [
  ['Landing', landingDist],
  ['Vue Storybook', vueStatic],
  ['React Storybook', reactStatic],
]) {
  if (!existsSync(dir)) {
    throw new Error(`${name} not built (${dir}). Run \`pnpm build:site\`.`);
  }
}

rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });

// Landing app at the site root (includes its own logo assets from public/).
cpSync(landingDist, site, { recursive: true });

// The two Storybooks under their own paths.
cpSync(vueStatic, join(site, 'vue'), { recursive: true });
cpSync(reactStatic, join(site, 'react'), { recursive: true });

console.log('✓ site/ assembled: / (landing), /vue, /react');
