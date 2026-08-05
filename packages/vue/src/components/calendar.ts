/**
 * Shared contract for the calendar surface (TREEUX-016 b/c/d).
 *
 * Domain-agnostic by design: an item is an id and an interval, and the product
 * renders its own content through the slots. The library never fetches, never
 * knows the entity, and never formats a date outside the active locale — every
 * `Intl` call happens at RENDER time, never at module scope, because a
 * formatter frozen at import freezes the language of the first page load.
 */
export interface TCalendarItem {
  id: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

export type TCalendarView = 'month' | 'week' | 'workweek' | 'day';

/**
 * Accessible names the product supplies. The library ships no user-facing
 * copy, and a calendar is mostly copy: "week of…", "all day", the name of a
 * cell a keyboard user has just landed on.
 */
export interface TCalendarLabels {
  /** Names a day cell. Receives the date so the product can format it. */
  day?: (date: Date) => string;
  /** Names a time slot. */
  slot?: (date: Date, minutes: number) => string;
  /** Names the all-day band of a column. */
  allDay?: (date: Date) => string;
  /** Marker announcing the current time. */
  now?: string;
}

/** Formatters built per render, memoised by locale — never at module scope. */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

export const calendarFormatter = (
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
};

/** Weekday headers for a grid starting on `weekStartsOn`, in the active locale. */
export const weekdayNames = (
  locale: string,
  weekStartsOn: number,
  weekday: 'short' | 'long' | 'narrow' = 'short',
): string[] => {
  const formatter = calendarFormatter(locale, { weekday });
  // 2024-01-07 is a Sunday, so index 0 lines up with day-of-week 0.
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(Date.UTC(2024, 0, 7 + ((weekStartsOn + index) % 7)))),
  );
};

/** Days a view covers, always derived from the same window the grid draws. */
export const workweekDays = (week: Date[]): Date[] =>
  week.filter((date) => date.getDay() >= 1 && date.getDay() <= 5);
