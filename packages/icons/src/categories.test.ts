/// <reference types="vitest/globals" />
import {
  treeIconAliases,
  treeIconCategories,
  treeIconCategory,
  treeIconCategoryLabels,
  treeIconCategoryOrder,
  treeIconFamilies,
  treeIconFamily,
} from './categories';
import { builtinTreeIconNodes } from './icons';

const shipped = Object.keys(builtinTreeIconNodes);
const canonical = shipped.filter((name) => !(name in treeIconAliases));
const placed = treeIconCategoryOrder.flatMap((category) =>
  treeIconFamilies[category].flatMap((family) => [...family.icons]),
);

describe('icon categories', () => {
  it('places every canonical icon in exactly one family', () => {
    // The two directions are different failures: a missing icon means a new
    // name shipped without a home, a duplicate means a name in two places.
    expect([...placed].sort()).toEqual([...canonical].sort());
    expect(new Set(placed).size).toBe(placed.length);
  });

  it('leaves aliases out of the catalog, so one drawing is listed once', () => {
    // `close` and `x` are the same geometry. Listing both puts the same picture
    // on screen twice and makes the catalog look bigger than it is.
    for (const alias of Object.keys(treeIconAliases)) {
      expect(placed, `${alias} is an alias and should not be listed`).not.toContain(alias);
    }

    expect(placed).toHaveLength(shipped.length - Object.keys(treeIconAliases).length);
  });

  it('points every alias at a canonical name that exists', () => {
    for (const [alias, target] of Object.entries(treeIconAliases)) {
      expect(shipped, `${alias} should be a shipped name`).toContain(alias);
      expect(canonical, `${alias} should target a canonical name`).toContain(target);
    }
  });

  it('keeps categories sorted by family, non-empty, and labelled', () => {
    for (const category of treeIconCategoryOrder) {
      const families = treeIconFamilies[category];
      const ids = families.map((family) => family.id);

      expect(families.length, `${category} should not be empty`).toBeGreaterThan(0);
      expect(ids, `${category} families should be sorted`).toEqual([...ids].sort());
      expect(treeIconCategoryLabels[category], `${category} needs a label`).toBeTruthy();

      for (const family of families) {
        expect(family.icons.length, `${family.id} should not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it('names a family after its base, and a family of one after its icon', () => {
    for (const category of treeIconCategoryOrder) {
      for (const { id, icons } of treeIconFamilies[category]) {
        if (icons.length === 1) {
          expect(id).toBe(icons[0]);

          continue;
        }

        for (const icon of icons) {
          expect(
            icon === id || icon.startsWith(id),
            `${icon} does not belong to the "${id}" family`,
          ).toBe(true);
        }
      }
    }
  });

  it('orders a family by meaning, not alphabetically', () => {
    // The point of the ordering: a strength scale that reads high, low, medium,
    // off is sorted, and useless.
    const family = (category: 'status' | 'navigation', id: string) =>
      treeIconFamilies[category].find((entry) => entry.id === id)?.icons;

    expect(family('status', 'signal')).toEqual([
      'signal',
      'signal-off',
      'signal-low',
      'signal-medium',
      'signal-high',
    ]);
    expect(family('status', 'gauge')).toEqual([
      'gauge',
      'gauge-low',
      'gauge-medium',
      'gauge-high',
    ]);
    expect(family('navigation', 'chevron')).toEqual([
      'chevron-up',
      'chevron-down',
      'chevron-left',
      'chevron-right',
      'chevrons-up-down',
    ]);
  });

  it('flattens families into the category list, in the same order', () => {
    for (const category of treeIconCategoryOrder) {
      expect(treeIconCategories[category]).toEqual(
        treeIconFamilies[category].flatMap((family) => [...family.icons]),
      );
    }
  });

  it('resolves a name, and an alias, back to its category and family', () => {
    expect(treeIconCategory('trash-2')).toBe('actions');
    expect(treeIconFamily('signal-low')).toBe('signal');

    // An alias is the same concept, so it lands where its target lands.
    expect(treeIconCategory('close')).toBe(treeIconCategory('x'));
    expect(treeIconCategory('house')).toBe(treeIconCategory('home'));
    expect(treeIconFamily('chevron-updown')).toBe('chevron');

    expect(treeIconCategory('definitely-not-an-icon')).toBeUndefined();
    expect(treeIconFamily('definitely-not-an-icon')).toBeUndefined();

    for (const name of shipped) {
      expect(treeIconCategory(name), `${name} should resolve`).toBeTruthy();
    }
  });
});
