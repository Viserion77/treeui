// Quality gate for TREEUX-008/011.
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
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

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
