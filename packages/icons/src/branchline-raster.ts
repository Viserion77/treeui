/**
 * The two Branchline rules that cannot be decided from coordinates.
 *
 * "Every shape means something" and "legible at 16px" are claims about what a
 * person sees, so checking them needs a rasteriser rather than a bounding box.
 * Both rules reduce to the same measurement: render the glyph, and compare.
 *
 * `@resvg/resvg-js` is a dev-only dependency and this module is never imported
 * by `src/index.ts`, so nothing here reaches the published bundle.
 */

import { Resvg } from '@resvg/resvg-js';

import { BRANCHLINE, type TBranchlineViolation } from './branchline';
import type { TIconNodes } from './registry';

/** Per-pixel ink coverage, 0 (blank) to 255 (solid), row-major. */
export type TRaster = Uint8Array;

const toSvg = (nodes: TIconNodes, size: number) => {
  const body = nodes
    .map(
      ([tag, attrs]) =>
        `<${tag} ${Object.entries(attrs)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')}/>`,
    )
    .join('');

  // Mirrors what `createTreeIcon` emits, including the `absoluteStrokeWidth`
  // correction — the point is to measure what ships, not an idealised glyph.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BRANCHLINE.canvas} ${BRANCHLINE.canvas}" ` +
    `width="${size}" height="${size}" fill="none" stroke="black" ` +
    `stroke-width="${((BRANCHLINE.strokeWidth * BRANCHLINE.canvas) / size).toFixed(4)}" ` +
    `stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  );
};

/** Renders a glyph to an ink map at the given pixel size. */
export const rasterize = (nodes: TIconNodes, size: number): TRaster => {
  const rendered = new Resvg(toSvg(nodes, size), {
    fitTo: { mode: 'width', value: size },
    background: 'white',
  })
    .render()
    .pixels;
  const ink = new Uint8Array(size * size);

  // Rendered on white with a black stroke, so any channel carries coverage.
  for (let index = 0; index < ink.length; index += 1) {
    ink[index] = 255 - rendered[index * 4];
  }

  return ink;
};

const totalInk = (raster: TRaster) => {
  let sum = 0;

  for (const value of raster) sum += value;

  return sum;
};

const inkDelta = (left: TRaster, right: TRaster) => {
  let sum = 0;

  for (let index = 0; index < left.length; index += 1) {
    sum += Math.abs(left[index] - right[index]);
  }

  return sum;
};

/**
 * How different two glyphs look, as a share of the inkier one.
 *
 * 0 means the same picture. Normalising by the larger ink total keeps a sparse
 * glyph such as `minus` from scoring as "very different" from everything just
 * because it has little ink of its own.
 */
export const rasterDistance = (left: TRaster, right: TRaster) =>
  inkDelta(left, right) / Math.max(totalInk(left), totalInk(right), 1);

/**
 * Flags nodes that draw nothing the eye can find.
 *
 * Removing a node and re-rendering is the only honest way to ask whether it
 * earns its place: a dot sitting inside a stroke and a dot sitting beside one
 * have identical coordinates but very different answers.
 */
export const checkDeadNodes = (
  name: string,
  nodes: TIconNodes,
): TBranchlineViolation[] => {
  if (nodes.length < 2) return [];

  const size = BRANCHLINE.rasterSize.node;
  const full = rasterize(nodes, size);
  const ink = totalInk(full);

  if (ink === 0) {
    return [
      {
        subject: name,
        rule: 'toda-forma-significa-algo',
        severity: 'error',
        message: 'renders nothing at all',
      },
    ];
  }

  const violations: TBranchlineViolation[] = [];

  nodes.forEach((node, index) => {
    const without = rasterize(
      nodes.filter((_, other) => other !== index),
      size,
    );
    const share = inkDelta(full, without) / ink;

    if (share < BRANCHLINE.minInkShare) {
      violations.push({
        subject: name,
        rule: 'toda-forma-significa-algo',
        severity: 'error',
        message: `node ${index} <${node[0]}> changes only ${(share * 100).toFixed(2)}% of the glyph's ink; it is covered by the shapes around it`,
      });
    }
  });

  return violations;
};

/**
 * Flags icon pairs a person cannot tell apart at the smallest size they ship at.
 *
 * This replaces an earlier test that compared serialised geometry. That test
 * measured byte uniqueness, which geometry generated from a hash of the name
 * satisfies perfectly while drawing nothing — and which, in the other
 * direction, forbade true synonyms from sharing one drawing. Rendering asks the
 * question the contract actually cares about.
 */
export const checkDistinguishable = (
  icons: Record<string, TIconNodes>,
  options: { exempt?: ReadonlySet<string>; allowedPairs?: ReadonlySet<string> } = {},
): TBranchlineViolation[] => {
  const { exempt = new Set<string>(), allowedPairs = new Set<string>() } = options;
  const size = BRANCHLINE.rasterSize.pair;
  const names = Object.keys(icons).filter((name) => !exempt.has(name));
  const rasters = new Map(names.map((name) => [name, rasterize(icons[name], size)]));
  const violations: TBranchlineViolation[] = [];

  for (let left = 0; left < names.length; left += 1) {
    for (let right = left + 1; right < names.length; right += 1) {
      const pair = `${names[left]} ~ ${names[right]}`;

      if (allowedPairs.has(pair)) continue;

      const distance = rasterDistance(
        rasters.get(names[left]) as TRaster,
        rasters.get(names[right]) as TRaster,
      );

      if (distance < BRANCHLINE.minPairDistance) {
        violations.push({
          subject: pair,
          rule: 'legivel-a-16px',
          severity: 'error',
          message: `differ by only ${(distance * 100).toFixed(1)}% of their ink at ${size}px`,
        });
      }
    }
  }

  return violations;
};
