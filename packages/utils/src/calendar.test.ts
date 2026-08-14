import { describe, expect, it } from 'vitest';
import { getMonthMatrix, layoutDayColumns, placeInDay, weekStartForLocale } from './calendar';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);

describe('weekStartForLocale', () => {
  it('maps the platform locale week start to a JS getDay value', () => {
    // Intl reports Sunday as 7; we normalise to 0.
    expect(weekStartForLocale('en-US')).toBe(0);
    expect(weekStartForLocale('pt-BR')).toBe(0);
    expect(weekStartForLocale('es-ES')).toBe(1);
    expect(weekStartForLocale('en-GB')).toBe(1);
  });

  it('falls back to Monday by default for a nonsense locale', () => {
    expect(weekStartForLocale('zz-nonsense-tag')).toBe(1);
  });

  it('honours a caller-supplied fallback when week info is unavailable', () => {
    // A Sunday-first product passes 0 so an unknown tag never silently
    // becomes Monday.
    expect(weekStartForLocale('zz-nonsense-tag', 0)).toBe(0);
    // A valid locale still wins over the fallback.
    expect(weekStartForLocale('es-ES', 0)).toBe(1);
  });
});

describe('getMonthMatrix', () => {
  it('returns complete weeks covering the month, padded from adjacent months', () => {
    // July 2026: the 1st is a Wednesday; Sunday-start grid begins 2026-06-28.
    const weeks = getMonthMatrix(at(2026, 7, 15), 0);
    expect(weeks.length).toBe(5);
    weeks.forEach((week) => expect(week).toHaveLength(7));
    expect(weeks[0][0]).toEqual(at(2026, 6, 28));
    expect(weeks[4][6]).toEqual(at(2026, 8, 1));

    // Every day of July is present exactly once.
    const july = weeks.flat().filter((d) => d.getMonth() === 6);
    expect(july).toHaveLength(31);
  });

  it('honours a Monday week start', () => {
    const weeks = getMonthMatrix(at(2026, 7, 15), 1);
    expect(weeks[0][0].getDay()).toBe(1); // Monday
    expect(weeks[0][0]).toEqual(at(2026, 6, 29)); // Monday before Jul 1
  });
});

describe('placeInDay', () => {
  it('positions an event by start/end against the hour height', () => {
    const { top, height } = placeInDay(
      { start: at(2026, 7, 15, 9, 0), end: at(2026, 7, 15, 10, 30) },
      at(2026, 7, 15),
      { hourHeight: 48 },
    );
    expect(top).toBe(9 * 48); // 09:00 → 9 hours down
    expect(height).toBe(1.5 * 48); // 90 min
  });

  it('clamps an event crossing midnight to the day edge', () => {
    const { top, height } = placeInDay(
      { start: at(2026, 7, 15, 23, 0), end: at(2026, 7, 16, 1, 0) },
      at(2026, 7, 15),
      { hourHeight: 48 },
    );
    expect(top).toBe(23 * 48);
    expect(height).toBe(1 * 48); // clamped to 24:00, so only the 23:00–24:00 hour
  });

  it('applies the minimum height to a very short event', () => {
    const { height } = placeInDay(
      { start: at(2026, 7, 15, 9, 0), end: at(2026, 7, 15, 9, 5) },
      at(2026, 7, 15),
      { hourHeight: 48, minHeight: 16 },
    );
    expect(height).toBe(16);
  });

  it('never lets a floored short event overflow the day near midnight', () => {
    // Percent-of-day units: a 3-minute event at 23:55 with a 15-minute floor
    // used to return top 99.65% + height 1.04% = 100.69%, spilling below the
    // column. It must shrink so top + height stays within the day.
    const hourHeight = 100 / 24;
    const { top, height } = placeInDay(
      { start: at(2026, 7, 15, 23, 55), end: at(2026, 7, 15, 23, 58) },
      at(2026, 7, 15),
      { hourHeight, minHeight: 15 * (hourHeight / 60) },
    );
    expect(top + height).toBeLessThanOrEqual(100 + 1e-9);
    expect(height).toBeGreaterThan(0);
  });
});

describe('layoutDayColumns', () => {
  it('places two overlapping events in adjacent columns', () => {
    const layout = layoutDayColumns([
      { id: 'a', start: at(2026, 7, 15, 9, 0), end: at(2026, 7, 15, 10, 0) },
      { id: 'b', start: at(2026, 7, 15, 9, 30), end: at(2026, 7, 15, 10, 30) },
    ]);
    expect(layout.get('a')).toEqual({ columnIndex: 0, columnCount: 2 });
    expect(layout.get('b')).toEqual({ columnIndex: 1, columnCount: 2 });
  });

  it('gives non-overlapping events their own single-column clusters', () => {
    const layout = layoutDayColumns([
      { id: 'a', start: at(2026, 7, 15, 9, 0), end: at(2026, 7, 15, 10, 0) },
      { id: 'c', start: at(2026, 7, 15, 11, 0), end: at(2026, 7, 15, 12, 0) },
    ]);
    expect(layout.get('a')).toEqual({ columnIndex: 0, columnCount: 1 });
    expect(layout.get('c')).toEqual({ columnIndex: 0, columnCount: 1 });
  });

  it('reuses a freed column and shares the cluster column count transitively', () => {
    const layout = layoutDayColumns([
      { id: 'a', start: at(2026, 7, 15, 9, 0), end: at(2026, 7, 15, 11, 0) },
      { id: 'b', start: at(2026, 7, 15, 9, 30), end: at(2026, 7, 15, 10, 0) },
      { id: 'c', start: at(2026, 7, 15, 10, 30), end: at(2026, 7, 15, 11, 30) },
    ]);
    // a↔b overlap, a↔c overlap → one transitive cluster of width 2.
    expect(layout.get('a')).toEqual({ columnIndex: 0, columnCount: 2 });
    expect(layout.get('b')).toEqual({ columnIndex: 1, columnCount: 2 });
    // c starts after b ends, so it reuses column 1.
    expect(layout.get('c')).toEqual({ columnIndex: 1, columnCount: 2 });
  });
});
