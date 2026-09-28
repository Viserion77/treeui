/**
 * Write the generated token source into the Kotlin and Rust ports.
 *
 * The native sibling of `build-css.ts`. Unlike that one it writes OUTSIDE this
 * package, because the artefacts are Gradle and Cargo sources rather than a
 * bundle — the emitters live here, next to the model they render, and the files
 * land where their compilers expect them.
 *
 *   pnpm codegen:native           write the files
 *   pnpm codegen:native --check   fail if what is committed is not what the
 *                                 model would emit right now
 *
 * `--check` is the staleness gate. Without it, editing `tokens.ts` and
 * forgetting to regenerate ships a Compose or egui package that silently paints
 * the previous release's colours.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { createKotlinTokens } from './kotlin';
import { createRustTokens } from './rust';

/** This script runs with the package as its cwd, the way `build-css.ts` does. */
const repoRoot = resolve(process.cwd(), '../..');

const targets = [
  {
    path: resolve(repoRoot, 'packages/compose/treeui-tokens/src/main/kotlin/treeui/tokens/Generated.kt'),
    contents: createKotlinTokens(),
  },
  {
    path: resolve(repoRoot, 'packages/egui/crates/treeui-tokens/src/generated.rs'),
    contents: createRustTokens(),
  },
];

const check = process.argv.includes('--check');
const stale: string[] = [];

for (const target of targets) {
  const name = relative(repoRoot, target.path);

  if (check) {
    const committed = await readFile(target.path, 'utf8').catch(() => null);

    if (committed !== target.contents) {
      stale.push(committed === null ? `${name} (missing)` : name);
    }

    continue;
  }

  await writeFile(target.path, target.contents);
  console.log(`wrote ${name}`);
}

if (check) {
  if (stale.length) {
    console.error(
      `These generated files are out of date with @treeui/tokens:\n${stale
        .map((name) => `  - ${name}`)
        .join('\n')}\n\nRun \`pnpm codegen:native\` and commit the result.`,
    );
    process.exit(1);
  }

  console.log(`${targets.length} generated files are up to date.`);
}
