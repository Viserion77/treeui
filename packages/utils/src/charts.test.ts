import {
  buildAreaPath,
  buildLinePath,
  donutSegments,
  linearScale,
  niceScale,
  polarToCartesian,
} from './charts';

describe('@treeui/utils charts', () => {
  it('rounds axis bounds to nice numbers with evenly spaced ticks', () => {
    const scale = niceScale(0, 87, 5);
    expect(scale.min).toBe(0);
    expect(scale.max).toBeGreaterThanOrEqual(87);
    expect(scale.ticks[0]).toBe(scale.min);
    expect(scale.ticks[scale.ticks.length - 1]).toBe(scale.max);
    // Ticks are evenly spaced by `step`.
    for (let index = 1; index < scale.ticks.length; index += 1) {
      expect(scale.ticks[index] - scale.ticks[index - 1]).toBeCloseTo(scale.step);
    }
  });

  it('keeps a flat series from collapsing to a zero-height axis', () => {
    const scale = niceScale(5, 5);
    expect(scale.max).toBeGreaterThan(scale.min);
  });

  it('maps a domain onto a pixel range, inverting for the y-axis', () => {
    const y = linearScale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(100)).toBe(0);
    expect(y(50)).toBe(100);
  });

  it('centers a degenerate (zero-width) domain', () => {
    const scale = linearScale([10, 10], [0, 100]);
    expect(scale(10)).toBe(50);
  });

  it('builds a straight polyline and a smooth curve for the same points', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 8 },
    ];
    const straight = buildLinePath(points);
    expect(straight.startsWith('M0,10')).toBe(true);
    expect(straight).toContain('L');
    expect(straight).not.toContain('C');

    const smooth = buildLinePath(points, true);
    expect(smooth.startsWith('M0,10')).toBe(true);
    expect(smooth).toContain('C');
  });

  it('closes an area path down to the baseline', () => {
    const path = buildAreaPath(
      [
        { x: 0, y: 10 },
        { x: 10, y: 4 },
      ],
      50,
    );
    expect(path.endsWith('Z')).toBe(true);
    expect(path).toContain(',50');
  });

  it('returns empty geometry for empty input', () => {
    expect(buildLinePath([])).toBe('');
    expect(buildAreaPath([], 0)).toBe('');
    expect(donutSegments([], { cx: 0, cy: 0, radius: 10 })).toEqual([]);
  });

  it('places polar coordinates with 0 degrees at the top', () => {
    const top = polarToCartesian(0, 0, 10, 0);
    expect(top.x).toBeCloseTo(0);
    expect(top.y).toBeCloseTo(-10);
  });

  it('splits values into donut segments whose fractions sum to one', () => {
    const segments = donutSegments([30, 50, 20], {
      cx: 50,
      cy: 50,
      radius: 40,
      innerRadius: 24,
    });
    expect(segments).toHaveLength(3);
    const totalFraction = segments.reduce((sum, segment) => sum + segment.fraction, 0);
    expect(totalFraction).toBeCloseTo(1);
    expect(segments[0].path.startsWith('M')).toBe(true);
    expect(segments[0].path.endsWith('Z')).toBe(true);
  });

  it('skips zero and negative values so they leave no slice', () => {
    const segments = donutSegments([10, 0, -5, 10], { cx: 0, cy: 0, radius: 10 });
    expect(segments).toHaveLength(2);
  });
});
