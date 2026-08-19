/**
 * Branchline report — checks icon geometry against the drawing contract.
 *
 *   pnpm --filter @treeui/icons branchline           # the shipped catalog
 *   pnpm --filter @treeui/icons branchline --warn    # include guidance
 *   pnpm --filter @treeui/icons branchline mail user # only these names
 *
 * The same rules run as a gate in `src/branchline.test.ts`. This script exists
 * for the other half of the loop: seeing *what* is wrong while drawing, with
 * the numbers attached, instead of a pass/fail.
 */

import {
  BRANCHLINE,
  checkIconGeometry,
  checkNaming,
  iconBox,
  keylineDeviation,
  type TBranchlineViolation,
} from '../src/branchline';
import {
  checkDeadNodes,
  checkDistinguishable,
} from '../src/branchline-raster';
import { TREE_ICON_ALIASES, builtinTreeIconNodes } from '../src/icons';
import type { TIconNodes } from '../src/registry';

const args = process.argv.slice(2);
const showWarnings = args.includes('--warn');
const filters = args.filter((arg) => !arg.startsWith('--'));

const catalog = builtinTreeIconNodes as Record<string, TIconNodes>;
const selected = Object.keys(catalog).filter(
  (name) => filters.length === 0 || filters.some((filter) => name.includes(filter)),
);

if (selected.length === 0) {
  console.error(`No icon matches ${filters.join(', ')}.`);
  process.exit(1);
}

const bold = (text: string) => `[1m${text}[0m`;
const dim = (text: string) => `[2m${text}[0m`;
const red = (text: string) => `[31m${text}[0m`;
const yellow = (text: string) => `[33m${text}[0m`;
const green = (text: string) => `[32m${text}[0m`;

const violations: TBranchlineViolation[] = [];

for (const name of selected) {
  violations.push(...checkIconGeometry(name, catalog[name]));
  violations.push(...checkDeadNodes(name, catalog[name]));
}

// Naming and collisions are properties of the set, so they only make sense over
// the whole catalog; a filtered run reports on the glyphs themselves.
if (filters.length === 0) {
  violations.push(...checkNaming(catalog, TREE_ICON_ALIASES));
  violations.push(
    ...checkDistinguishable(catalog, {
      exempt: new Set(Object.keys(TREE_ICON_ALIASES)),
    }),
  );
}

const errors = violations.filter((violation) => violation.severity === 'error');
const warnings = violations.filter((violation) => violation.severity === 'warn');

const byRule = (list: TBranchlineViolation[]) => {
  const groups = new Map<string, TBranchlineViolation[]>();

  for (const violation of list) {
    groups.set(violation.rule, [...(groups.get(violation.rule) ?? []), violation]);
  }

  return [...groups.entries()].sort((left, right) => right[1].length - left[1].length);
};

const report = (
  title: string,
  list: TBranchlineViolation[],
  paint: (text: string) => string,
) => {
  if (list.length === 0) return;

  console.log(`\n${bold(paint(title))}`);

  for (const [rule, group] of byRule(list)) {
    console.log(`\n  ${bold(rule)} ${dim(`(${group.length})`)}`);

    for (const violation of group) {
      console.log(`    ${paint('•')} ${violation.subject} — ${violation.message}`);
    }
  }
};

console.log(
  bold(`\nBranchline — ${selected.length} icon${selected.length === 1 ? '' : 's'} checked`),
);

report('Errors', errors, red);

if (showWarnings) {
  report('Guidance', warnings, yellow);
}

// A keyline census makes the set legible at a glance: it says whether the
// catalog is built on four shapes or on four hundred.
if (showWarnings && filters.length === 0) {
  const census = new Map<string, number>();

  for (const name of selected) {
    const { name: keyline, distance } = keylineDeviation(iconBox(catalog[name]));
    const key = distance > BRANCHLINE.keylineTolerance ? 'off-keyline' : keyline;

    census.set(key, (census.get(key) ?? 0) + 1);
  }

  console.log(`\n${bold('Keyline census')}`);

  for (const [keyline, count] of [...census].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${keyline.padEnd(12)} ${count}`);
  }
}

console.log(
  `\n${errors.length === 0 ? green('✓ no errors') : red(`✗ ${errors.length} error${errors.length === 1 ? '' : 's'}`)}` +
    dim(
      `  ·  ${warnings.length} guidance note${warnings.length === 1 ? '' : 's'}${showWarnings ? '' : ' (run with --warn)'}\n`,
    ),
);

process.exit(errors.length === 0 ? 0 : 1);
