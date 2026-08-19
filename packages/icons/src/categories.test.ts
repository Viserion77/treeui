/// <reference types="vitest/globals" />
import {
  treeIconCategories,
  treeIconCategory,
  treeIconCategoryLabels,
  treeIconCategoryOrder,
} from './categories';
import { builtinTreeIconNodes } from './icons';

const names = Object.keys(builtinTreeIconNodes);
const placed = treeIconCategoryOrder.flatMap((category) => [
  ...treeIconCategories[category],
]);

describe('icon categories', () => {
  it('places every shipped icon in exactly one category', () => {
    // The two directions are different failures: a missing icon means a new
    // name shipped without a home, a duplicate means a name in two places.
    expect([...placed].sort()).toEqual([...names].sort());
    expect(new Set(placed).size).toBe(placed.length);
  });

  it('lists no name the catalog does not ship', () => {
    expect(placed.filter((name) => !names.includes(name))).toEqual([]);
  });

  it('keeps each category sorted, non-empty, and labelled', () => {
    for (const category of treeIconCategoryOrder) {
      const icons = treeIconCategories[category];

      expect(icons.length, `${category} should not be empty`).toBeGreaterThan(0);
      expect([...icons], `${category} should be sorted`).toEqual([...icons].sort());
      expect(treeIconCategoryLabels[category], `${category} needs a label`).toBeTruthy();
    }
  });

  it('resolves a name back to its category', () => {
    expect(treeIconCategory('trash-2')).toBe('actions');
    expect(treeIconCategory('shield-check')).toBe('security');
    expect(treeIconCategory('definitely-not-an-icon')).toBeUndefined();

    for (const name of names) {
      expect(treeIconCategory(name), `${name} should resolve`).toBeTruthy();
    }
  });
});
