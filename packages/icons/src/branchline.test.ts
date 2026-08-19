/// <reference types="vitest/globals" />
import {
  BRANCHLINE,
  checkCornerClearance,
  checkIconGeometry,
  checkNaming,
  flattenPath,
  iconBox,
  formatViolations,
  type TBranchlineViolation,
} from './branchline';
import { checkDeadNodes, checkDistinguishable, rasterize, rasterDistance } from './branchline-raster';
import { TREE_CORNER_MARKED, TREE_ICON_ALIASES, builtinTreeIconNodes } from './icons';
import type { TIconNodes } from './registry';

const catalog = builtinTreeIconNodes as Record<string, TIconNodes>;
const entries = Object.entries(catalog);

const errors = (violations: TBranchlineViolation[]) =>
  violations.filter((violation) => violation.severity === 'error');

/** Vitest prints the message, so a failure names the icon and the number. */
const expectClean = (violations: TBranchlineViolation[]) => {
  const failing = errors(violations);

  expect(failing.length === 0 || formatViolations(failing)).toBe(true);
};

describe('branchline geometry rules', () => {
  it('draws every built-in icon inside the trim area, on allowed primitives', () => {
    expectClean(entries.flatMap(([name, nodes]) => checkIconGeometry(name, nodes)));
  });

  it('gives every corner modifier its clearance', () => {
    expect(TREE_CORNER_MARKED.size).toBeGreaterThan(0);
    expectClean(
      [...TREE_CORNER_MARKED].flatMap((name) =>
        checkCornerClearance(name, catalog[name]),
      ),
    );
  });

  it('keeps one concept to one name and one drawing', () => {
    expectClean(checkNaming(catalog, TREE_ICON_ALIASES));
  });
});

describe('branchline raster rules', () => {
  // Rendering the catalog is the expensive part of the suite, so both raster
  // rules take the default timeout up rather than being split further.
  it(
    'gives every node in every icon something to draw',
    () => {
      expectClean(entries.flatMap(([name, nodes]) => checkDeadNodes(name, nodes)));
    },
    120_000,
  );

  it(
    'keeps every pair of canonical icons apart at 16px',
    () => {
      expectClean(
        checkDistinguishable(catalog, {
          exempt: new Set(Object.keys(TREE_ICON_ALIASES)),
        }),
      );
    },
    120_000,
  );
});

describe('branchline rule engine', () => {
  it('flattens each path command into points a bounding box can be read from', () => {
    // A quarter-circle arc from (10,12) to (12,10): the box is the two
    // endpoints plus the bulge, which only arc flattening reveals.
    const box = iconBox([['path', { d: 'M10 12A2 2 0 0 1 12 10' }]]);

    expect(box.x).toBeCloseTo(10, 1);
    expect(box.y).toBeCloseTo(10, 1);
    expect(box.width).toBeCloseTo(2, 1);
    expect(box.height).toBeCloseTo(2, 1);

    // Relative, shorthand and closepath commands all advance the cursor.
    expect(flattenPath('M4 4h6v6z').at(-1)).toEqual({ x: 4, y: 4 });
    expect(flattenPath('M4 4c2 0 4 2 4 4').at(-1)).toEqual({ x: 8, y: 8 });
  });

  it('rejects a glyph whose stroke would clip the canvas', () => {
    const violations = checkIconGeometry('over', [['circle', { cx: 12, cy: 12, r: 11.5 }]]);

    expect(errors(violations).map((violation) => violation.rule)).toContain(
      'grade-e-area-viva',
    );
  });

  it('rejects presentation a child element is not allowed to own', () => {
    const violations = checkIconGeometry('heavy', [
      ['line', { x1: 4, y1: 4, x2: 20, y2: 20, 'stroke-width': 4 }],
    ]);

    expect(errors(violations)).toHaveLength(1);
    expect(errors(violations)[0].rule).toBe('peso-unico');
  });

  it('rejects an alias that has drifted into its own drawing', () => {
    const violations = checkNaming(
      {
        real: [['circle', { cx: 12, cy: 12, r: 6 }]],
        copy: [['circle', { cx: 12, cy: 12, r: 7 }]],
      },
      { copy: 'real' },
    );

    expect(errors(violations)).toHaveLength(1);
    expect(errors(violations)[0].subject).toBe('copy');
  });

  it('rejects two canonical names that share one drawing', () => {
    const shape: TIconNodes = [['circle', { cx: 12, cy: 12, r: 6 }]];
    const violations = checkNaming({ one: shape, two: shape }, {});

    expect(errors(violations)).toHaveLength(1);
    expect(errors(violations)[0].subject).toBe('one ~ two');
  });

  it('measures a shape covered by its neighbours as drawing nothing', () => {
    const rule: TIconNodes = [['line', { x1: 4, y1: 12, x2: 20, y2: 12 }]];
    const hidden = checkDeadNodes('hidden', [
      ...rule,
      ['line', { x1: 10, y1: 12, x2: 14, y2: 12 }],
    ]);
    const beside = checkDeadNodes('beside', [
      ...rule,
      ['circle', { cx: 12, cy: 17, r: 1.5 }],
    ]);

    expect(errors(hidden)).toHaveLength(1);
    expect(errors(beside)).toHaveLength(0);
  });

  it('scores identical geometry as identical and different geometry as different', () => {
    const size = BRANCHLINE.rasterSize.pair;
    const circle = rasterize([['circle', { cx: 12, cy: 12, r: 7 }]], size);
    const same = rasterize([['circle', { cx: 12, cy: 12, r: 7 }]], size);
    const square = rasterize([['rect', { x: 5, y: 5, width: 14, height: 14, rx: 1 }]], size);

    expect(rasterDistance(circle, same)).toBe(0);
    expect(rasterDistance(circle, square)).toBeGreaterThan(BRANCHLINE.minPairDistance);
  });
});

describe('the modifier vocabulary', () => {
  const badgeLike = (nodes: TIconNodes) =>
    nodes.filter(
      ([tag, attrs]) =>
        tag === 'circle' &&
        Number(attrs.r) >= 2.5 &&
        Number(attrs.r) <= 4.5 &&
        Number(attrs.cx) > 15 &&
        Number(attrs.cy) > 15,
    );

  it('no longer ships the circled corner badge', () => {
    // The badge this replaced was a 6.7u circle holding a 1.2u mark, which put
    // roughly one pixel between `mail-check`, `mail-plus` and `mail-warning`.
    for (const name of ['mail-check', 'mail-plus', 'mail-warning', 'shield-check', 'user-plus']) {
      expect(badgeLike(catalog[name]), `${name} should not carry a badge circle`).toEqual([]);
    }
  });

  it('separates every variant of a modified family at 16px', () => {
    const size = BRANCHLINE.rasterSize.pair;

    for (const family of [
      ['mail-check', 'mail-plus', 'mail-warning'],
      ['shield-check', 'shield-lock', 'shield-x'],
      ['user-check', 'user-minus', 'user-plus', 'user-x'],
      ['folder-plus', 'folder-x'],
      ['calendar-plus', 'calendar-x'],
    ]) {
      for (let left = 0; left < family.length; left += 1) {
        for (let right = left + 1; right < family.length; right += 1) {
          const distance = rasterDistance(
            rasterize(catalog[family[left]], size),
            rasterize(catalog[family[right]], size),
          );

          expect(
            distance,
            `${family[left]} vs ${family[right]} measured ${distance.toFixed(3)}`,
          ).toBeGreaterThan(BRANCHLINE.minPairDistance);
        }
      }
    }
  });
});
