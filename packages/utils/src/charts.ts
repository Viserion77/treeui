/**
 * Framework-agnostic chart geometry — pure math shared by the Vue components
 * (and ready for React). No DOM, no dependencies: it turns numbers into SVG
 * path strings, scales, and nice axis ticks so each framework only has to render.
 */

export interface ChartPoint {
  x: number;
  y: number;
}

/** A resolved linear axis: rounded bounds plus the ticks to draw. */
export interface NiceScale {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}

const roundNice = (range: number, round: boolean): number => {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;

  let niceFraction: number;

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) {
    niceFraction = 1;
  } else if (fraction <= 2) {
    niceFraction = 2;
  } else if (fraction <= 5) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }

  return niceFraction * 10 ** exponent;
};

/**
 * Compute rounded axis bounds and evenly spaced ticks ("nice numbers"), so the
 * y-axis lands on clean values like 0 / 250 / 500 instead of raw data extremes.
 */
export const niceScale = (min: number, max: number, maxTicks = 5): NiceScale => {
  const safeMax = max === min ? max + 1 : max;
  const range = roundNice(safeMax - min, false);
  const step = roundNice(range / Math.max(1, maxTicks - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(safeMax / step) * step;

  const ticks: number[] = [];
  // Guard against floating-point drift accumulating past the top tick.
  for (let value = niceMin; value <= niceMax + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }

  return { min: niceMin, max: niceMax, step, ticks };
};

/**
 * Build a linear mapping from a data domain to a pixel range.
 *
 * @example
 * const y = linearScale([0, 100], [200, 0]); // value 0 → 200px, 100 → 0px
 */
export const linearScale =
  (domain: [number, number], range: [number, number]) =>
  (value: number): number => {
    const [d0, d1] = domain;
    const [r0, r1] = range;

    if (d1 === d0) {
      return (r0 + r1) / 2;
    }

    return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
  };

const formatPoint = (point: ChartPoint) =>
  `${Number(point.x.toFixed(2))},${Number(point.y.toFixed(2))}`;

/**
 * Catmull-Rom control point for smooth cubic curves. Returns the control point
 * that sits between `current` and `target`, biased by the neighbour on `side`.
 */
const controlPoint = (
  current: ChartPoint,
  previous: ChartPoint,
  next: ChartPoint,
  reverse: boolean,
): ChartPoint => {
  const smoothing = 0.18;
  const dx = next.x - previous.x;
  const dy = next.y - previous.y;
  const direction = reverse ? -1 : 1;

  return {
    x: current.x + direction * dx * smoothing,
    y: current.y + direction * dy * smoothing,
  };
};

/**
 * Turn a series of points into an SVG polyline `d`. With `smooth`, adjacent
 * points are joined by Catmull-Rom-derived cubic béziers for a soft curve.
 */
export const buildLinePath = (points: ChartPoint[], smooth = false): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${formatPoint(points[0])}`;

  if (!smooth) {
    return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${formatPoint(point)}`).join('');
  }

  let path = `M${formatPoint(points[0])}`;

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index];
    const previous = points[index - 1];
    const beforePrevious = points[index - 2] ?? previous;
    const next = points[index + 1] ?? current;

    const control1 = controlPoint(previous, beforePrevious, current, false);
    const control2 = controlPoint(current, previous, next, true);

    path += `C${formatPoint(control1)} ${formatPoint(control2)} ${formatPoint(current)}`;
  }

  return path;
};

/**
 * Build a closed area path: the line across the top, dropped to `baselineY`
 * and back to the start. Shares the same smoothing as {@link buildLinePath}.
 */
export const buildAreaPath = (
  points: ChartPoint[],
  baselineY: number,
  smooth = false,
): string => {
  if (points.length === 0) return '';

  const line = buildLinePath(points, smooth);
  const last = points[points.length - 1];
  const first = points[0];

  return `${line}L${Number(last.x.toFixed(2))},${Number(baselineY.toFixed(2))}L${Number(
    first.x.toFixed(2),
  )},${Number(baselineY.toFixed(2))}Z`;
};

/** Convert a polar coordinate (angle in degrees, 0° at 12 o'clock) to x/y. */
export const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number,
): ChartPoint => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

/** A single donut/pie segment: the SVG path plus the numbers behind it. */
export interface ArcSegment {
  path: string;
  value: number;
  fraction: number;
  startAngle: number;
  endAngle: number;
}

export interface DonutOptions {
  cx: number;
  cy: number;
  radius: number;
  /** Inner radius; `0` (default) draws a full pie. */
  innerRadius?: number;
  /** Angular gap between segments, in degrees. */
  gap?: number;
  /** Angle the first segment starts at (0° = top). */
  startAngle?: number;
}

/**
 * Slice a list of values into donut (or pie) segments, each as a ready-to-render
 * SVG path. Zero/negative values are skipped so they leave no phantom slice.
 */
export const donutSegments = (values: number[], options: DonutOptions): ArcSegment[] => {
  const { cx, cy, radius, innerRadius = 0, gap = 0, startAngle = 0 } = options;
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);

  if (total <= 0) return [];

  const positives = values.filter((value) => value > 0).length;
  // Only insert gaps when there is more than one visible slice.
  const gapTotal = positives > 1 ? gap * positives : 0;
  const usableAngle = 360 - gapTotal;

  const segments: ArcSegment[] = [];
  let cursor = startAngle;

  for (const value of values) {
    if (value <= 0) continue;

    const fraction = value / total;
    const sweep = fraction * usableAngle;
    const segmentStart = cursor + (positives > 1 ? gap / 2 : 0);
    const segmentEnd = segmentStart + sweep;

    const outerStart = polarToCartesian(cx, cy, radius, segmentStart);
    const outerEnd = polarToCartesian(cx, cy, radius, segmentEnd);
    const largeArc = sweep > 180 ? 1 : 0;

    let path: string;

    if (innerRadius > 0) {
      const innerEnd = polarToCartesian(cx, cy, innerRadius, segmentEnd);
      const innerStart = polarToCartesian(cx, cy, innerRadius, segmentStart);
      path =
        `M${formatPoint(outerStart)}` +
        `A${radius},${radius} 0 ${largeArc} 1 ${formatPoint(outerEnd)}` +
        `L${formatPoint(innerEnd)}` +
        `A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${formatPoint(innerStart)}Z`;
    } else {
      path =
        `M${cx},${cy}` +
        `L${formatPoint(outerStart)}` +
        `A${radius},${radius} 0 ${largeArc} 1 ${formatPoint(outerEnd)}Z`;
    }

    segments.push({ path, value, fraction, startAngle: segmentStart, endAngle: segmentEnd });
    cursor = segmentEnd + (positives > 1 ? gap / 2 : 0);
  }

  return segments;
};
