// Assemble the deployed docs site from the landing app, both Storybooks, and examples:
//   site/                          -> landing (apps/landing/dist) at the root
//   site/vue/                      -> Vue Storybook   (apps/docs/storybook-static)
//   site/react/                    -> React Storybook (apps/docs-react/storybook-static)
//   site/examples/dashboard-vue/   -> Vue dashboard example   (examples/dashboard-vue/dist)
//   site/examples/dashboard-react/ -> React dashboard example (examples/dashboard-react/dist)
// Run the full pipeline with `pnpm build:site` (builds everything first).
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');

const landingDist = join(root, 'apps/landing/dist');
const vueStatic = join(root, 'apps/docs/storybook-static');
const reactStatic = join(root, 'apps/docs-react/storybook-static');
const vueExampleDist = join(root, 'examples/dashboard-vue/dist');
const reactExampleDist = join(root, 'examples/dashboard-react/dist');

for (const [name, dir] of [
  ['Landing', landingDist],
  ['Vue Storybook', vueStatic],
  ['React Storybook', reactStatic],
  ['Vue dashboard example', vueExampleDist],
  ['React dashboard example', reactExampleDist],
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

// The runnable examples.
cpSync(vueExampleDist, join(site, 'examples/dashboard-vue'), { recursive: true });
cpSync(reactExampleDist, join(site, 'examples/dashboard-react'), { recursive: true });

console.log(
  '✓ site/ assembled: / (landing), /vue, /react, /examples/dashboard-vue, /examples/dashboard-react',
);
