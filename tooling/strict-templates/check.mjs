// Quality gate for the typed global-component surface.
//
// The GlobalComponents augmentation only reports a wrong prop when a consumer
// turns on `vueCompilerOptions.strictTemplates` — and the first version of it
// made that switch unusable: turning it on produced 87 errors from legitimate
// code (`aria-label` on a component that forwards attrs, `v-model.trim`) for 2
// real ones. So the gate has two halves, and both have to hold:
//
//   probe/  — a template written the way a consumer writes one MUST compile.
//   bad/    — the six props a consumer audit found dead MUST still error.
//
// Checking only the first would let the library "fix" the noise by allowing
// everything, which is the failure mode this whole item exists to avoid.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

// The fixtures import `@treeui/vue` from `dist`, not from `src`, because that is
// what a consumer installs — checking the source would not exercise the emitted
// declarations, and the last defect this gate covers was precisely one that
// existed in the source and never reached the tarball. So the built package is a
// precondition, not something to build from here: building it in isolation fails
// without its own dependencies' `dist` (the stylesheet `@import`s
// `@treeui/tokens/styles.css`).
const entry = fileURLToPath(new URL('../../packages/vue/dist/index.d.ts', import.meta.url));

if (!existsSync(entry)) {
  console.error(
    '\n[strict-templates] packages/vue/dist is missing.\n' +
      'This check reads the BUILT package. Run `pnpm build:packages` first.\n',
  );
  process.exit(1);
}

const run = (project) => {
  try {
    execFileSync('npx', ['vue-tsc', '--noEmit', '-p', project], {
      cwd: here,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return [];
  } catch (error) {
    return `${error.stdout ?? ''}${error.stderr ?? ''}`
      .split('\n')
      .filter((line) => line.includes('error TS'));
  }
};

// The augmentation only takes effect once TypeScript LOADS the module that
// declares it, and a bare side-effect import is elided from the emitted
// declarations — which is exactly how it once shipped in `dist/` referenced by
// nothing, and inert. Asserted here because this is the first gate that sees a
// built package.
const declarations = readFileSync(entry, 'utf8');

if (!declarations.includes("from './global-components'")) {
  console.error(
    '\n[strict-templates] dist/index.d.ts does not reference ./global-components.\n' +
      'The GlobalComponents augmentation ships but never loads, so every prop check ' +
      'silently disappears for consumers.\n',
  );
  process.exit(1);
}

const legitimate = run('tsconfig.json');
const wrong = run('tsconfig.bad.json');

let failed = false;

if (legitimate.length > 0) {
  failed = true;
  console.error(
    `\n[strict-templates] ${legitimate.length} error(s) on a template that must compile.\n` +
      'A consumer cannot turn strictTemplates on while these exist:\n',
  );
  console.error(legitimate.join('\n'));
}

if (wrong.length === 0) {
  failed = true;
  console.error(
    '\n[strict-templates] the known-bad template compiled clean.\n' +
      'The passthrough surface has been widened until it accepts anything, which ' +
      'defeats the point: a prop that does not exist must still be an error.\n',
  );
}

if (!failed) {
  console.log(
    `[strict-templates] ok — legitimate template compiles, ${wrong.length} wrong props still rejected.`,
  );
}

process.exit(failed ? 1 : 0);
