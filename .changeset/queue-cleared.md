---
"@treeui/utils": minor
"@treeui/vue": minor
---

Clears the entire accepted backlog from both consumer files in one release.

**Calendar (TREEUX-016 b/c/d)** — `TCalendarMonthGrid`, `TCalendarTimeGrid` and
the `TCalendar` wrapper with `view`. The month grid CONSUMES `getMonthMatrix`
and draws exactly the matrix it returns rather than recomputing the grid, which
is the contract that keeps a consumer's fetch window and the days on screen from
diverging silently. Vertical placement and the overlap algorithm stay in
`@treeui/utils`, so a React time grid reuses them. The "now" marker is drawn
only in the current day's column; every `Intl` call is memoised per locale at
render time, never at module scope.

**Media (TREEUX-019)** — `TAudioPlayer` (play/pause, duration, seek; `src` is
agnostic and waveform is deliberately out of scope) and `TVoiceRecorder` (the
record/recording/preview states, mm:ss timer, duration cap). The pulse is frozen
under `prefers-reduced-motion` by default: a recording indicator runs for as
long as someone is talking. Capture and upload stay with the product.

**File and drop (TREEUX-021, 022, 040)**

- `TFileUpload` gains `variant="trigger"` — the slot becomes the only control,
  with no dashed box, no `role="button"` wrapper and no second tab stop — and
  `rejectionLabels`, so the rejection copy is no longer English prose baked into
  the component.
- `useDrop({ accepts, scope })` plus `TDropVeil`: one mechanism for a page-wide
  and a region-wide target, with the depth counter, the `preventDefault`
  conditioned on the payload, and cleanup. `accepts` takes `DataTransfer` types,
  so a file drag (`'Files'`) and a card drag (a custom MIME type) are the same
  predicate rather than two APIs.
- The arithmetic is pure and framework-agnostic in `@treeui/utils`:
  `dragCarriesTypes`, `nextDragDepth`, `filesFromTransfer`, `payloadFromTransfer`.

**Canvas (TREEUX-039 a+b)** — `useDecorativeCanvas()` owns the lifecycle that
two ornaments had each discovered by measuring: no frame while reduced-motion,
coarse pointer, background tab or off-screen; backing store that follows the
element with a pixel-ratio ceiling; never steals a pointer event; clean unmount.
The field maths (`fieldGrid`, `waveAt`, `springStep`, `containPoint`,
`canvasBackingSize`) is in `@treeui/utils` and is deterministic, so a
pre-rendered decoration survives hydration unchanged.

**Layout and data (TREEUX-041, 003, 004, 002 phase 2)**

- `TPane` — fill the parent, scroll only the middle, anchor header and footer.
  The `min-block-size: 0` nobody gets right the first time now lives here.
- `TChart`/`TSparkline` gain `interpolation` (`linear | smooth | step`).
  Interpolating between buckets draws concurrency that never existed; `step`
  holds each value until the next sample. `smooth` still works.
- `TSpanLanes` — lanes on a shared time axis, with a `marker` slot because
  failure encoded by colour alone is unreadable at ΔE 4.4 under deuteranopia.
- `TTable` gains `rowHref`/`rowTo` (a real stretched link, so ctrl/middle-click
  and the URL survive), `rowActivatable` + `@row-activate` (a `role="button"`
  row, for an activation that is not navigation), and a `detail` slot rendered
  as a `<tr>` adjacent to its own row. The two activation modes are mutually
  exclusive and dev builds say so.
- `TKeyValueEditor` gains the write-only `mode="secret"`: the value never
  reaches the client, so the row is the key plus set/not-set with replace and
  clear, and `set-value` on an existing key deliberately does not emit
  `update:secrets` — replacing a value changes neither which keys exist nor
  whether they are set.

**Follow-ups from the 0.28 validation**

- `TEmptyState frame="narrow"` — a width cap for the FRAME. 28 of one consumer's
  37 wrappers were the same `max-width: 420px`; `fill`/`inline` answered a
  different question because the original evidence said "geometry".
- A soft `TTag` WITH a `tone` now draws that tone's ring. `--tree-tag-border` was
  computed and then discarded in the one variant a label badge uses. Changed now,
  with two consumers and both asking for it — a border on an existing look is not
  a change that can be made later.
