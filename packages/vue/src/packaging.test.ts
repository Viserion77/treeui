// @vitest-environment node
//
// The augmentation in `global-components.ts` only takes effect once TypeScript
// LOADS that module. A bare `import './global-components'` in the barrel is
// elided from the emitted `index.d.ts` — it contributes no value — so the
// published `global-components.d.ts` sat in `dist/` referenced by nothing and
// the augmentation never reached a single consumer. Nothing else in the gates
// covers that: the source typechecks, the tests pass, the file is in the
// tarball, and it is inert (TREEUX-008).
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(fileURLToPath(new URL('./index.ts', import.meta.url)), 'utf8');
const distEntry = fileURLToPath(new URL('../dist/index.d.ts', import.meta.url));

describe('the global-components augmentation is reachable from the entry point', () => {
  it('is re-exported from the barrel, not merely imported for side effects', () => {
    expect(source).toMatch(/export type \{[^}]*\} from '\.\/global-components';/s);
  });

  it.runIf(existsSync(distEntry))('survives into the published declarations', () => {
    expect(readFileSync(distEntry, 'utf8')).toContain("from './global-components'");
  });
});
