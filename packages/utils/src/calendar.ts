import { addDays, startOfDay, startOfMonth, startOfWeek } from './index';

/**
 * Framework-agnostic calendar math for month grids and day/week time-grids
 * (TREEUX-016). Pure: dates and numbers in, structure out — no DOM, no Vue, no
 * locale dataset. `TCalendar` (and any future framework port) composes these.
 */

const MINUTES_PER_DAY = 24 * 60;
const MS_PER_MINUTE = 60_000;

/**
 * The first day of the week for a locale, as a JS `getDay()` value
 * (0 = Sunday … 6 = Saturday). Uses the platform's own locale database via
 * `Intl.Locale.prototype.getWeekInfo` (native, not a bundled dataset). On
 * engines without it, falls back to Monday — the ISO/ international default —
 * so consumers that need another start pass `weekStartsOn` explicitly.
 */
export const weekStartForLocale = (locale: string): number => {
  try {
    const info = (
      new Intl.Locale(locale) as Intl.Locale & {
        getWeekInfo?: () => { firstDay: number };
        weekInfo?: { firstDay: number };
      }
    );
    const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
    // Intl reports 1 = Monday … 7 = Sunday; map Sunday (7) to JS's 0.
    if (typeof firstDay === 'number') return firstDay === 7 ? 0 : firstDay;
  } catch {
    // Invalid locale tag — fall through to the default.
  }
  return 1;
};

/**
 * The month of `anchor` as a matrix of complete weeks (each row is 7 days),
 * including the leading/trailing days of the adjacent months so every row is
 * full. `weekStartsOn` is a JS `getDay()` value (0 = Sunday).
 */
export const getMonthMatrix = (anchor: Date, weekStartsOn = 0): Date[][] => {
  const gridStart = startOfWeek(startOfMonth(anchor), weekStartsOn);
  const lastOfMonth = startOfDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0));

  const weeks: Date[][] = [];
  let cursor = gridStart;
  // Emit a week while its first day still falls on or before the month's end;
  // this yields the 5 or 6 complete weeks that cover the month.
  while (cursor.getTime() <= lastOfMonth.getTime()) {
    const week: Date[] = [];
    for (let day = 0; day < 7; day += 1) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
};

/**
 * Pixel position of a timed event within a single day column of a time-grid.
 * Start/end are clamped to the day (so an event crossing midnight fills to the
 * edge), and the height honours `minHeight`. Returns offsets in the same unit
 * as `hourHeight`.
 */
export const placeInDay = (
  item: { start: Date; end: Date },
  day: Date,
  options: { hourHeight: number; minHeight?: number },
): { top: number; height: number } => {
  const { hourHeight, minHeight = 0 } = options;
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);

  const clampedStart = Math.max(item.start.getTime(), dayStart.getTime());
  const clampedEnd = Math.min(item.end.getTime(), dayEnd.getTime());

  const pxPerMinute = hourHeight / 60;
  const startMinutes = (clampedStart - dayStart.getTime()) / MS_PER_MINUTE;
  const endMinutes = Math.min(
    MINUTES_PER_DAY,
    (clampedEnd - dayStart.getTime()) / MS_PER_MINUTE,
  );

  const top = Math.max(0, startMinutes) * pxPerMinute;
  const height = Math.max(minHeight, Math.max(0, endMinutes - startMinutes) * pxPerMinute);
  return { top, height };
};

export interface TCalendarColumnPlacement {
  /** 0-based column this event occupies within its overlap cluster. */
  columnIndex: number;
  /** Total columns in the cluster, so the consumer decides the actual width. */
  columnCount: number;
}

/**
 * Side-by-side column placement for overlapping timed events (interval-graph
 * greedy coloring). Events that transitively overlap form a cluster; each gets
 * a `columnIndex` and the cluster's `columnCount`. Returns index + count — not a
 * width — so the consumer/component owns the measurement.
 */
export const layoutDayColumns = (
  items: Array<{ id: string; start: Date; end: Date }>,
): Map<string, TCalendarColumnPlacement> => {
  const result = new Map<string, TCalendarColumnPlacement>();
  const sorted = [...items].sort(
    (a, b) => a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime(),
  );

  let cluster: Array<{ id: string; start: Date; end: Date }> = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (!cluster.length) return;
    const columnEnds: number[] = []; // last end time placed in each column
    for (const event of cluster) {
      let column = columnEnds.findIndex((end) => end <= event.start.getTime());
      if (column === -1) column = columnEnds.length;
      columnEnds[column] = event.end.getTime();
      result.set(event.id, { columnIndex: column, columnCount: 0 });
    }
    const columnCount = columnEnds.length;
    for (const event of cluster) {
      const placement = result.get(event.id);
      if (placement) placement.columnCount = columnCount;
    }
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const event of sorted) {
    // A gap (no overlap with the cluster's running span) closes the cluster.
    if (cluster.length && event.start.getTime() >= clusterEnd) flush();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.end.getTime());
  }
  flush();

  return result;
};
