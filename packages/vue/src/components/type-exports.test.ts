import { describe, expect, it } from 'vitest';
// Types are erased before Vitest runs, so a plain `import type` here would pass
// even when the barrel drops an export. Read the barrel source instead and
// assert on the names it actually re-exports.
import barrelSource from './index.ts?raw';

/** Collects the public names from every `export type { ... }` block. */
const collectExportedTypeNames = (source: string): Set<string> => {
  const names = new Set<string>();
  for (const [, block] of source.matchAll(/export\s+type\s*\{([^}]*)\}/g)) {
    for (const entry of block.split(',')) {
      const specifier = entry.trim();
      if (!specifier) continue;
      // `Foo as TFoo` exposes `TFoo`; a bare `TFoo` exposes itself.
      const [, alias] = specifier.split(/\s+as\s+/);
      names.add((alias ?? specifier).trim());
    }
  }
  return names;
};

const exportedTypeNames = collectExportedTypeNames(barrelSource);

describe('component type exports', () => {
  // Regression guard: these were declared in their components but never reached
  // the package entry point, so `import type { X } from '@treeui/vue'` failed.
  it.each([
    'TAccordionType',
    'TAlertVariant',
    'TAvatarStatus',
    'TComboboxOption',
    'TContextMenuItem',
    'TPricingPlan',
    'TTabsActivationMode',
    'TTableColumn',
    'TTableSortDirection',
    'TTableSortState',
    'TTagVariant',
  ])('re-exports %s', (name) => {
    expect(exportedTypeNames).toContain(name);
  });

  it('keeps every exported type name on the T- prefix convention', () => {
    const offenders = [...exportedTypeNames].filter((name) => !/^T[A-Z]/.test(name));
    // `PricingFeature` and `AppShellSlotProps` predate the convention and cannot
    // be renamed without a breaking change; they are the only allowed offenders.
    expect(offenders.sort()).toEqual(['AppShellSlotProps', 'PricingFeature']);
  });

  // Injection contexts are wiring between a parent and its children, not values
  // a consumer ever constructs, so they stay off the public surface.
  it.each([
    'AccordionContext',
    'TabsContext',
    'TSidebarContext',
    'TTreeViewContext',
    'TTreeViewRecord',
  ])('keeps %s internal', (name) => {
    expect(exportedTypeNames).not.toContain(name);
  });
});
