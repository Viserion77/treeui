---
"@treeui/utils": minor
---

Calendar math fixes from real adoption (TREEUX-016 etapa a):

- `placeInDay` no longer lets `minHeight` push a block past the day's end. A
  short event near midnight (e.g. 3 minutes at 23:55) was floored to the minimum
  and spilled below the column; the floored height now shrinks so `top + height`
  stays within the day.
- `weekStartForLocale` takes an optional `fallback` argument (default `1`,
  Monday) used only when the engine can't report week info. The library no
  longer silently hard-wires Monday — a Sunday-first product passes `0` so an
  unknown tag or old runtime never flips its source locale to Monday.
