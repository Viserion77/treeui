import {
  canvasBackingSize,
  containPoint,
  fieldGrid,
  fieldNoise,
  springStep,
  waveAt,
} from './field';

describe('fieldNoise', () => {
  it('is deterministic, so a decoration survives hydration unchanged', () => {
    expect(fieldNoise(3, 7, 1)).toBe(fieldNoise(3, 7, 1));
    expect(fieldNoise(3, 7, 1)).not.toBe(fieldNoise(3, 7, 2));
  });

  it('stays in [0, 1)', () => {
    for (let i = 0; i < 50; i += 1) {
      const value = fieldNoise(i, i * 3, 5);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('fieldGrid', () => {
  it('covers the box', () => {
    const points = fieldGrid({ width: 100, height: 50, spacing: 25 });
    expect(points.length).toBeGreaterThan(0);
    expect(Math.max(...points.map((p) => p.x))).toBeGreaterThanOrEqual(100);
  });

  it('over-scans past the edges, so points do not pop in as the field moves', () => {
    const plain = fieldGrid({ width: 100, height: 50, spacing: 25 });
    const scanned = fieldGrid({ width: 100, height: 50, spacing: 25, overscan: 1 });
    expect(scanned.length).toBeGreaterThan(plain.length);
    expect(Math.min(...scanned.map((p) => p.x))).toBeLessThan(0);
  });

  it('keeps jitter inside its declared fraction of the spacing', () => {
    const spacing = 20;
    const jitter = 0.25;
    const points = fieldGrid({ width: 100, height: 100, spacing, jitter, seed: 3 });
    const plain = fieldGrid({ width: 100, height: 100, spacing, seed: 3 });
    points.forEach((point, index) => {
      expect(Math.abs(point.x - plain[index].x)).toBeLessThanOrEqual(spacing * jitter);
    });
  });

  it('returns nothing for a degenerate box instead of looping forever', () => {
    expect(fieldGrid({ width: 0, height: 10, spacing: 5 })).toEqual([]);
    expect(fieldGrid({ width: 10, height: 10, spacing: 0 })).toEqual([]);
  });
});

describe('waveAt', () => {
  it('stays within the amplitude', () => {
    for (let x = 0; x < 40; x += 1) {
      const y = waveAt(x, { time: x / 10, amplitude: 8, frequency: 0.3, beat: 1.7 });
      expect(Math.abs(y)).toBeLessThanOrEqual(8.0001);
    }
  });

  it('the beat makes it stop repeating on the primary period', () => {
    const options = { amplitude: 1, frequency: 1, speed: 0 } as const;
    const plainA = waveAt(0, { ...options, time: 0 });
    const plainB = waveAt(Math.PI * 2, { ...options, time: 0 });
    expect(plainB).toBeCloseTo(plainA, 6);

    const beatB = waveAt(Math.PI * 2, { ...options, time: 0, beat: 1.7 });
    expect(beatB).not.toBeCloseTo(waveAt(0, { ...options, time: 0, beat: 1.7 }), 3);
  });
});

describe('springStep', () => {
  it('settles on the target', () => {
    let state = { value: 0, velocity: 0 };
    for (let i = 0; i < 400; i += 1) state = springStep(state, 10);
    expect(state.value).toBeCloseTo(10, 1);
  });

  it('respects the velocity cap, so one fast gesture cannot fling it away', () => {
    const state = springStep({ value: 0, velocity: 0 }, 100000, { maxVelocity: 5 });
    expect(Math.abs(state.velocity)).toBeLessThanOrEqual(5);
  });

  it('clamps a huge delta, so a restored background tab does not explode', () => {
    const restored = springStep({ value: 0, velocity: 0 }, 10, { delta: 120 });
    const oneFrame = springStep({ value: 0, velocity: 0 }, 10, { delta: 1 / 30 });
    expect(restored.value).toBeCloseTo(oneFrame.value, 6);
  });
});

describe('containPoint / canvasBackingSize', () => {
  it('keeps a point inside its band', () => {
    expect(containPoint({ x: -5, y: 200 }, { width: 100, height: 50 })).toEqual({ x: 0, y: 50 });
    expect(containPoint({ x: 50, y: 25 }, { width: 100, height: 50, padding: 10 })).toEqual({
      x: 50,
      y: 25,
    });
  });

  it('scales the backing store to the element, with a ratio ceiling', () => {
    expect(canvasBackingSize(800, 227, 2)).toEqual({ ratio: 2, width: 1600, height: 454 });
    // A 3x display would allocate an enormous surface for an ornament.
    expect(canvasBackingSize(800, 227, 3).ratio).toBe(2);
    expect(canvasBackingSize(800, 227, 0).ratio).toBe(1);
  });
});
