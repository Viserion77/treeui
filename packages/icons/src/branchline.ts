/**
 * Branchline — the drawing contract behind every TreeUI icon.
 *
 * This module is the machine-readable half of the named practices in
 * `docs/ai/practices.json`. It turns icon geometry into a list of violations so
 * a rule can be *checked* rather than remembered: `branchline.test.ts` runs it
 * as a gate over the built-in catalog, and `scripts/branchline.ts` runs it as a
 * report over the catalog or over icons an application registers itself.
 *
 * It is deliberately dependency-free and never imported by `src/index.ts`, so
 * none of it reaches the published bundle — `tsup` only follows the entry point.
 *
 * Two rules in the contract cannot be decided from coordinates alone — whether
 * a node earns its place, and whether two icons are distinguishable at 16px.
 * Both need a rasteriser, so they live in `branchline-raster.ts` and run only in
 * dev. Everything here is pure geometry.
 */

import type { TIconNode, TIconNodes } from './registry';

/**
 * The numbers the contract is written in. Every one of them was measured off
 * the shipped catalog rather than chosen up front — see the `docs/ai` practice
 * entry `branchline-grid` for the derivation.
 */
export const BRANCHLINE = {
  /** Every icon is drawn on this grid. */
  canvas: 24,
  /** Coordinates land on quarter units; 91.5% of the catalog already did. */
  gridStep: 0.25,
  /** Nominal stroke, in grid units, at the default 20px render. */
  strokeWidth: 2,

  /**
   * The hard bound: geometry plus its stroke must stay inside the canvas.
   *
   * A 2u stroke straddles the path, so a glyph reaching 22.5 paints out to
   * 23.5 and still clears the edge. This is the rule that prevents clipping;
   * the keylines below are the rule that makes icons feel like a set.
   */
  trim: { min: 1.5, max: 22.5 },

  /**
   * The four shapes an icon should fill, and nothing else. A square reads
   * larger than a circle of the same measure, so the square keyline is the
   * smaller of the two — that difference is the optical correction, not an
   * inconsistency.
   */
  keyline: {
    square: 17.5,
    circle: 18.5,
    wide: { width: 18, height: 14 },
    tall: { width: 14, height: 18 },
  },
  /** How far a glyph may sit off its nearest keyline before it looks off-set. */
  keylineTolerance: 1.5,

  /**
   * Corner-modifier territory. The badge is not a sticker: the base glyph opens
   * a hole for it, so the two never share a stroke.
   */
  badge: {
    center: 17.4,
    radius: 3.75,
    /** The mark inside the badge, e.g. the bar of a plus. */
    minMarkSize: 3,
    /** Gap knocked out of the base glyph around the badge. */
    clearance: 1,
  },

  /** Corner radii come from a short scale so frames feel related. */
  radiusScale: [1, 1.5, 2, 2.5, 4] as readonly number[],

  /** Primitives that scale and theme correctly. Anything else is rejected. */
  tags: [
    'path',
    'circle',
    'rect',
    'line',
    'polyline',
    'polygon',
    'ellipse',
  ] as readonly string[],

  /**
   * Presentation the root `<svg>` owns. A child that sets these breaks
   * `absoluteStrokeWidth`, so the glyph changes weight when it is resized.
   */
  rootOnlyAttrs: [
    'stroke-width',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke',
    'fill',
  ] as readonly string[],

  /**
   * Raster thresholds, applied by `branchline-raster.ts`.
   *
   * `minInkShare` — a node that changes less than 1% of the icon's ink is not
   * drawing anything; it is padding.
   *
   * `minPairDistance` — two icons must differ by 5% of their ink at 16px. The
   * badge collisions in the pre-Branchline catalog measured 0.000–0.002 here,
   * while genuinely close neighbours such as `list` and `list-rule` measured
   * 0.045, so the threshold separates "same picture" from "same family".
   */
  minInkShare: 0.01,
  minPairDistance: 0.05,
  /** Sizes the raster rules judge at: the smallest real use, and a working size. */
  rasterSize: { pair: 16, node: 32 },
} as const;

/** Severity of a finding. Errors fail the gate; warnings are reported only. */
export type TBranchlineSeverity = 'error' | 'warn';

export interface TBranchlineViolation {
  /** The icon the finding belongs to, or a `a ~ b` pair for collisions. */
  subject: string;
  /** Which rule fired, matching a principle id in `practices.json`. */
  rule: string;
  severity: TBranchlineSeverity;
  message: string;
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                    */
/* -------------------------------------------------------------------------- */

export interface TPoint {
  x: number;
  y: number;
}

export interface TBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Samples per curve segment. Enough that a bounding box is exact to ~0.01u. */
const CURVE_STEPS = 24;

const num = (value: string | number) =>
  typeof value === 'number' ? value : Number.parseFloat(value);

const cubicAt = (
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
) => {
  const u = 1 - t;

  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

const quadraticAt = (t: number, p0: number, p1: number, p2: number) => {
  const u = 1 - t;

  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
};

/**
 * Endpoint-parameterised elliptical arc, flattened to points.
 *
 * Implements the conversion in the SVG spec (F.6.5): the endpoint form the path
 * grammar uses has to become a centre, two angles and a sweep before it can be
 * sampled.
 */
const sampleArc = (
  from: TPoint,
  rx: number,
  ry: number,
  rotation: number,
  largeArc: boolean,
  sweep: boolean,
  to: TPoint,
): TPoint[] => {
  if (rx === 0 || ry === 0) return [to];

  const phi = (rotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx = (from.x - to.x) / 2;
  const dy = (from.y - to.y) / 2;
  const x1 = cosPhi * dx + sinPhi * dy;
  const y1 = -sinPhi * dx + cosPhi * dy;

  let radiusX = Math.abs(rx);
  let radiusY = Math.abs(ry);

  // An arc whose radii are too small to span the chord is scaled up until it
  // just reaches, exactly as the spec requires.
  const lambda = (x1 * x1) / (radiusX * radiusX) + (y1 * y1) / (radiusY * radiusY);

  if (lambda > 1) {
    const scale = Math.sqrt(lambda);

    radiusX *= scale;
    radiusY *= scale;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const numerator =
    radiusX * radiusX * radiusY * radiusY -
    radiusX * radiusX * y1 * y1 -
    radiusY * radiusY * x1 * x1;
  const denominator =
    radiusX * radiusX * y1 * y1 + radiusY * radiusY * x1 * x1;
  const coefficient =
    sign * Math.sqrt(Math.max(0, numerator) / (denominator || 1));
  const cx1 = (coefficient * radiusX * y1) / radiusY;
  const cy1 = (-coefficient * radiusY * x1) / radiusX;
  const cx = cosPhi * cx1 - sinPhi * cy1 + (from.x + to.x) / 2;
  const cy = sinPhi * cx1 + cosPhi * cy1 + (from.y + to.y) / 2;

  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const dot = ux * vx + uy * vy;
    const length = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
    const value = Math.acos(Math.min(1, Math.max(-1, dot / (length || 1))));

    return ux * vy - uy * vx < 0 ? -value : value;
  };

  const start = angle(1, 0, (x1 - cx1) / radiusX, (y1 - cy1) / radiusY);
  let sweepAngle = angle(
    (x1 - cx1) / radiusX,
    (y1 - cy1) / radiusY,
    (-x1 - cx1) / radiusX,
    (-y1 - cy1) / radiusY,
  );

  if (!sweep && sweepAngle > 0) sweepAngle -= 2 * Math.PI;
  if (sweep && sweepAngle < 0) sweepAngle += 2 * Math.PI;

  const points: TPoint[] = [];

  for (let step = 1; step <= CURVE_STEPS; step += 1) {
    const theta = start + (sweepAngle * step) / CURVE_STEPS;
    const px = Math.cos(theta) * radiusX;
    const py = Math.sin(theta) * radiusY;

    points.push({
      x: cosPhi * px - sinPhi * py + cx,
      y: sinPhi * px + cosPhi * py + cy,
    });
  }

  return points;
};

/**
 * Flattens path data to points.
 *
 * Only the commands the catalog actually uses need to be exact, but the whole
 * grammar is covered so an icon an application registers is measured the same
 * way as a built-in one.
 */
export const flattenPath = (d: string): TPoint[] => {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const points: TPoint[] = [];
  let cursor: TPoint = { x: 0, y: 0 };
  let start: TPoint = { x: 0, y: 0 };
  let previousControl: TPoint | undefined;
  let command = '';
  let index = 0;

  const next = () => Number(tokens[index++]);
  const push = (point: TPoint) => {
    points.push(point);
    cursor = point;
  };

  while (index < tokens.length) {
    const token = tokens[index];

    if (/[a-zA-Z]/.test(token)) {
      command = token;
      index += 1;
    } else if (command === 'M') {
      // A repeated coordinate pair after a moveto is an implicit lineto.
      command = 'L';
    } else if (command === 'm') {
      command = 'l';
    }

    const relative = command === command.toLowerCase();
    const originX = relative ? cursor.x : 0;
    const originY = relative ? cursor.y : 0;

    switch (command.toLowerCase()) {
      case 'm': {
        const point = { x: next() + originX, y: next() + originY };

        push(point);
        start = point;
        previousControl = undefined;
        break;
      }
      case 'l': {
        push({ x: next() + originX, y: next() + originY });
        previousControl = undefined;
        break;
      }
      case 'h': {
        push({ x: next() + originX, y: cursor.y });
        previousControl = undefined;
        break;
      }
      case 'v': {
        push({ x: cursor.x, y: next() + originY });
        previousControl = undefined;
        break;
      }
      case 'c':
      case 's': {
        const from = cursor;
        const control1 =
          command.toLowerCase() === 'c'
            ? { x: next() + originX, y: next() + originY }
            : {
                // A smooth curve reflects the previous control point; with no
                // previous curve the reflection is the current point itself.
                x: 2 * from.x - (previousControl?.x ?? from.x),
                y: 2 * from.y - (previousControl?.y ?? from.y),
              };
        const control2 = { x: next() + originX, y: next() + originY };
        const end = { x: next() + originX, y: next() + originY };

        for (let step = 1; step <= CURVE_STEPS; step += 1) {
          const t = step / CURVE_STEPS;

          points.push({
            x: cubicAt(t, from.x, control1.x, control2.x, end.x),
            y: cubicAt(t, from.y, control1.y, control2.y, end.y),
          });
        }

        cursor = end;
        previousControl = control2;
        break;
      }
      case 'q':
      case 't': {
        const from = cursor;
        const control =
          command.toLowerCase() === 'q'
            ? { x: next() + originX, y: next() + originY }
            : {
                x: 2 * from.x - (previousControl?.x ?? from.x),
                y: 2 * from.y - (previousControl?.y ?? from.y),
              };
        const end = { x: next() + originX, y: next() + originY };

        for (let step = 1; step <= CURVE_STEPS; step += 1) {
          const t = step / CURVE_STEPS;

          points.push({
            x: quadraticAt(t, from.x, control.x, end.x),
            y: quadraticAt(t, from.y, control.y, end.y),
          });
        }

        cursor = end;
        previousControl = control;
        break;
      }
      case 'a': {
        const rx = next();
        const ry = next();
        const rotation = next();
        const largeArc = next() !== 0;
        const sweep = next() !== 0;
        const end = { x: next() + originX, y: next() + originY };

        for (const point of sampleArc(
          cursor,
          rx,
          ry,
          rotation,
          largeArc,
          sweep,
          end,
        )) {
          points.push(point);
        }

        cursor = end;
        previousControl = undefined;
        break;
      }
      case 'z': {
        points.push(start);
        cursor = start;
        previousControl = undefined;
        break;
      }
      default:
        // An unknown command would otherwise spin the loop forever.
        index += 1;
    }
  }

  return points;
};

const parsePoints = (value: string): TPoint[] => {
  const numbers = (value.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const points: TPoint[] = [];

  for (let i = 0; i + 1 < numbers.length; i += 2) {
    points.push({ x: numbers[i], y: numbers[i + 1] });
  }

  return points;
};

/** Every point a node touches, in grid units, ignoring stroke width. */
export const nodePoints = ([tag, attrs]: TIconNode): TPoint[] => {
  const value = (key: string) => num(attrs[key] as string | number);

  switch (tag) {
    case 'path':
      return flattenPath(String(attrs.d ?? ''));
    case 'polyline':
    case 'polygon':
      return parsePoints(String(attrs.points ?? ''));
    case 'line':
      return [
        { x: value('x1'), y: value('y1') },
        { x: value('x2'), y: value('y2') },
      ];
    case 'rect': {
      const x = value('x');
      const y = value('y');

      return [
        { x, y },
        { x: x + value('width'), y: y + value('height') },
      ];
    }
    case 'circle':
      return [
        { x: value('cx') - value('r'), y: value('cy') - value('r') },
        { x: value('cx') + value('r'), y: value('cy') + value('r') },
      ];
    case 'ellipse':
      return [
        { x: value('cx') - value('rx'), y: value('cy') - value('ry') },
        { x: value('cx') + value('rx'), y: value('cy') + value('ry') },
      ];
    default:
      return [];
  }
};

/** Bounding box of a whole glyph, ignoring stroke width. */
export const iconBox = (nodes: TIconNodes): TBox => {
  const points = nodes.flatMap((node) => nodePoints(node));

  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  };
};

/** Attributes that place a shape. These are what the grid governs. */
const POSITION_ATTRS = new Set([
  'x',
  'y',
  'cx',
  'cy',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
]);

/**
 * Every coordinate that positions something, for the grid check.
 *
 * Radii are deliberately excluded. The grid is about where a shape sits, not
 * how big it is: a dot is sized against the stroke it sits next to, and
 * rounding its radius to a quarter unit changes how it reads for no gain.
 * Arc flags and rotations inside path data are grammar rather than geometry,
 * but they are all whole numbers, so they pass the check either way.
 */
const positionNumbers = ([, attrs]: TIconNode): number[] => {
  const numbers: number[] = [];

  for (const [key, raw] of Object.entries(attrs)) {
    if (key === 'd' || key === 'points') {
      for (const match of String(raw).match(/-?\d*\.?\d+/g) ?? []) {
        numbers.push(Number(match));
      }

      continue;
    }

    if (!POSITION_ATTRS.has(key)) continue;

    const parsed = num(raw);

    if (Number.isFinite(parsed)) numbers.push(parsed);
  }

  return numbers;
};

const onGrid = (value: number) => {
  const steps = value / BRANCHLINE.gridStep;

  return Math.abs(steps - Math.round(steps)) < 1e-6;
};

/** Distance from the glyph's box to the nearest keyline, in grid units. */
export const keylineDeviation = (box: TBox) => {
  const { square, circle, wide, tall } = BRANCHLINE.keyline;
  const candidates: { name: string; width: number; height: number }[] = [
    { name: 'square', width: square, height: square },
    { name: 'circle', width: circle, height: circle },
    { name: 'wide', width: wide.width, height: wide.height },
    { name: 'tall', width: tall.width, height: tall.height },
  ];

  let best = { name: 'square', distance: Number.POSITIVE_INFINITY };

  for (const candidate of candidates) {
    // The long side is what the eye compares between neighbouring icons, so a
    // glyph is measured against the keyline it fills, not both axes equally.
    const distance = Math.max(
      Math.abs(box.width - candidate.width),
      Math.abs(box.height - candidate.height),
    );

    if (distance < best.distance) best = { name: candidate.name, distance };
  }

  return best;
};

/* -------------------------------------------------------------------------- */
/* Rules                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Checks one glyph against every rule that can be decided from its coordinates.
 *
 * The two raster rules — dead nodes and pair collisions — are in
 * `branchline-raster.ts`, because they need something to draw with.
 */
export const checkIconGeometry = (
  name: string,
  nodes: TIconNodes,
): TBranchlineViolation[] => {
  const violations: TBranchlineViolation[] = [];
  const fail = (
    rule: string,
    severity: TBranchlineSeverity,
    message: string,
  ) => violations.push({ subject: name, rule, severity, message });

  if (nodes.length === 0) {
    fail('toda-forma-significa-algo', 'error', 'has no geometry');

    return violations;
  }

  for (const node of nodes) {
    const [tag, attrs] = node;

    if (!BRANCHLINE.tags.includes(tag)) {
      fail(
        'peso-unico',
        'error',
        `uses <${tag}>, which is not one of ${BRANCHLINE.tags.join(', ')}`,
      );
    }

    for (const attr of BRANCHLINE.rootOnlyAttrs) {
      if (attr in attrs) {
        fail(
          'peso-unico',
          'error',
          `sets "${attr}" on <${tag}>; the root <svg> owns it, and overriding it breaks absoluteStrokeWidth`,
        );
      }
    }

    // Guidance, not a gate. The catalog sits at ~92% conformance, and the
    // remaining coordinates are inside hand-drawn curves where snapping would
    // redraw the glyph rather than tidy it. The rule marks the target; it does
    // not hold the build hostage to a mass edit.
    for (const value of positionNumbers(node)) {
      if (!onGrid(value)) {
        fail(
          'grade-e-area-viva',
          'warn',
          `<${tag}> is placed at ${value}, which is off the ${BRANCHLINE.gridStep}u grid`,
        );
      }
    }

    if (tag === 'rect' && attrs.rx !== undefined) {
      const radius = num(attrs.rx as string | number);

      if (!BRANCHLINE.radiusScale.includes(radius)) {
        fail(
          'grade-e-area-viva',
          'warn',
          `<rect> has rx=${radius}, which is off the radius scale (${BRANCHLINE.radiusScale.join(', ')})`,
        );
      }
    }
  }

  const box = iconBox(nodes);
  const { min, max } = BRANCHLINE.trim;

  if (
    box.x < min ||
    box.y < min ||
    box.x + box.width > max ||
    box.y + box.height > max
  ) {
    fail(
      'grade-e-area-viva',
      'error',
      `reaches [${box.x.toFixed(2)}, ${box.y.toFixed(2)}]–[${(box.x + box.width).toFixed(2)}, ${(box.y + box.height).toFixed(2)}], outside the ${min}–${max} trim area, so its stroke clips the canvas`,
    );
  }

  const keyline = keylineDeviation(box);

  if (keyline.distance > BRANCHLINE.keylineTolerance) {
    fail(
      'grade-e-area-viva',
      'warn',
      `is ${box.width.toFixed(2)}×${box.height.toFixed(2)}, ${keyline.distance.toFixed(2)}u off its nearest keyline (${keyline.name})`,
    );
  }

  return violations;
};

/**
 * Checks that a set of icons keeps one concept to one geometry.
 *
 * An alias must share its target's geometry exactly. Two canonical names that
 * happen to share geometry are the same failure seen from the other side: one
 * of them should have been an alias.
 */
export const checkNaming = (
  icons: Record<string, TIconNodes>,
  aliases: Record<string, string>,
): TBranchlineViolation[] => {
  const violations: TBranchlineViolation[] = [];
  const print = (nodes: TIconNodes) => JSON.stringify(nodes);

  for (const [alias, target] of Object.entries(aliases)) {
    const from = icons[alias];
    const to = icons[target];

    if (!from || !to) {
      violations.push({
        subject: alias,
        rule: 'um-conceito-um-nome',
        severity: 'error',
        message: `aliases "${target}", which is not in the catalog`,
      });

      continue;
    }

    if (print(from) !== print(to)) {
      violations.push({
        subject: alias,
        rule: 'um-conceito-um-nome',
        severity: 'error',
        message: `aliases "${target}" but does not share its geometry; an alias is the same drawing under a second name`,
      });
    }
  }

  const byGeometry = new Map<string, string[]>();

  for (const [name, nodes] of Object.entries(icons)) {
    if (name in aliases) continue;

    const key = print(nodes);

    byGeometry.set(key, [...(byGeometry.get(key) ?? []), name]);
  }

  for (const names of byGeometry.values()) {
    if (names.length < 2) continue;

    violations.push({
      subject: names.join(' ~ '),
      rule: 'um-conceito-um-nome',
      severity: 'error',
      message:
        'are separate canonical names sharing one drawing; make all but one an alias',
    });
  }

  return violations;
};

/** Formats findings for a terminal report. */
export const formatViolations = (violations: TBranchlineViolation[]) =>
  violations
    .map(
      ({ subject, rule, severity, message }) =>
        `${severity === 'error' ? '✗' : '!'} ${subject} — ${message} [${rule}]`,
    )
    .join('\n');
