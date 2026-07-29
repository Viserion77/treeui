---
"@treeui/utils": minor
---

Add framework-agnostic calendar math for the upcoming `TCalendar` (TREEUX-016, step a).

New pure functions in `@treeui/utils` (no DOM, no Vue, no bundled locale data): `getMonthMatrix(anchor, weekStartsOn)` (complete-week month grid, padded from adjacent months), `placeInDay(item, day, { hourHeight, minHeight })` (time-grid top/height with midnight clamp + min height), `layoutDayColumns(items)` (interval-graph greedy column placement for overlapping events, returning `{ columnIndex, columnCount }` per id — index and cluster count, not a width, so the consumer owns the measurement), and `weekStartForLocale(locale)` (via native `Intl.Locale` week info, falling back to Monday). This is the portable core the Vue `TCalendarMonthGrid` / `TCalendarTimeGrid` will compose.
