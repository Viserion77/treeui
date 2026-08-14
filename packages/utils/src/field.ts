/**
 * Decorative-field arithmetic.
 *
 * Pure functions behind a canvas ornament — a hero wave, a presence orb. Two
 * independent decorations in one repository converged on the same four shapes,
 * which is the bar for lifting maths into the library. No DOM, no timers: the
 * caller owns the frame loop (see `useDecorativeCanvas` in `@treeui/vue`) and
 * these answer "where is everything, at time t".
 */

export interface FieldPoint {
  x: number;
  y: number;
}

export interface GridOptions {
  width: number;
  height: number;
  /** Distance between neighbours, in the same units as width/height. */
  spacing: number;
  /**
   * How far a point may sit from its lattice position, as a fraction of
   * `spacing`. A perfect lattice reads as a texture bug; a little jitter reads
   * as a field. Deterministic — see `seed`.
   */
  jitter?: number;
  /**
   * Extra rings of points beyond the box, in units of `spacing`. Without it,
   * points visibly pop in and out at the edges as the field moves.
   */
  overscan?: number;
  /** Any integer. The same seed always produces the same field. */
  seed?: number;
}

/**
 * Deterministic value in [0, 1) from three integers. A decoration must look the
 * same on the server and after hydration, and must not change on every render,
 * so `Math.random()` is not an option.
 */
export const fieldNoise = (x: number, y: number, seed = 0): number => {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
};

/** Jittered, over-scanned lattice of points covering the box. */
export const fieldGrid = ({
  width,
  height,
  spacing,
  jitter = 0,
  overscan = 0,
  seed = 0,
}: GridOptions): FieldPoint[] => {
  if (spacing <= 0 || width <= 0 || height <= 0) return [];

  const points: FieldPoint[] = [];
  const margin = overscan * spacing;
  const columns = Math.ceil((width + margin * 2) / spacing);
  const rows = Math.ceil((height + margin * 2) / spacing);

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      const baseX = column * spacing - margin;
      const baseY = row * spacing - margin;
      const offsetX = (fieldNoise(column, row, seed) - 0.5) * 2 * jitter * spacing;
      const offsetY = (fieldNoise(row, column, seed + 1) - 0.5) * 2 * jitter * spacing;
      points.push({ x: baseX + offsetX, y: baseY + offsetY });
    }
  }

  return points;
};

export interface WaveOptions {
  /** Seconds since the animation started. */
  time: number;
  amplitude: number;
  /** Cycles per unit of `x`. */
  frequency: number;
  speed?: number;
  /**
   * Second frequency, beaten against the first. One sine is a metronome and
   * reads as mechanical; two close frequencies never quite repeat, which is
   * what makes the motion look organic without any randomness.
   */
  beat?: number;
  phase?: number;
}

/** Vertical offset of the wave at `x`. */
export const waveAt = (
  x: number,
  { time, amplitude, frequency, speed = 1, beat = 0, phase = 0 }: WaveOptions,
): number => {
  const primary = Math.sin(x * frequency + time * speed + phase);
  if (!beat) return primary * amplitude;

  const secondary = Math.sin(x * frequency * beat + time * speed * beat + phase);
  // Averaged, so the amplitude stays the amplitude regardless of the beat.
  return ((primary + secondary) / 2) * amplitude;
};

export interface SpringState {
  value: number;
  velocity: number;
}

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  /**
   * Cap on |velocity|. A spring driven by pointer input can be handed a huge
   * delta by one fast gesture and then overshoot far outside its box; the cap
   * is what keeps a decoration decorative.
   */
  maxVelocity?: number;
  /** Seconds since the last step. Clamped, so a backgrounded tab cannot explode it. */
  delta?: number;
}

/** One step of a damped spring toward `target`. */
export const springStep = (
  state: SpringState,
  target: number,
  { stiffness = 120, damping = 14, maxVelocity = Infinity, delta = 1 / 60 }: SpringOptions = {},
): SpringState => {
  // A tab restored after minutes hands the loop one enormous delta; without the
  // clamp the spring integrates it in a single step and leaves the canvas.
  const dt = Math.min(Math.max(delta, 0), 1 / 30);
  const acceleration = (target - state.value) * stiffness - state.velocity * damping;
  const velocity = clampMagnitude(state.velocity + acceleration * dt, maxVelocity);

  return { value: state.value + velocity * dt, velocity };
};

const clampMagnitude = (value: number, max: number) =>
  Math.max(-max, Math.min(max, value));

export interface ContainmentBox {
  width: number;
  height: number;
  /** Inset from the edges the point may not cross. */
  padding?: number;
}

/** Keep a point inside the box, so a decoration never wanders off its band. */
export const containPoint = (
  point: FieldPoint,
  { width, height, padding = 0 }: ContainmentBox,
): FieldPoint => ({
  x: Math.max(padding, Math.min(width - padding, point.x)),
  y: Math.max(padding, Math.min(height - padding, point.y)),
});

/**
 * Backing-store size for a canvas, with a ceiling on the pixel ratio.
 *
 * A fixed backing store stretched to fit squashes every point into a smear —
 * one consumer measured a 900×520 buffer inside an 800×227 box before fixing
 * it. The ceiling matters just as much: a 3x display on a full-width hero
 * allocates an enormous surface for an ornament nobody is looking at.
 */
export const canvasBackingSize = (
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio = 1,
  maxRatio = 2,
) => {
  const ratio = Math.max(1, Math.min(devicePixelRatio || 1, maxRatio));
  return {
    ratio,
    width: Math.max(1, Math.round(cssWidth * ratio)),
    height: Math.max(1, Math.round(cssHeight * ratio)),
  };
};
