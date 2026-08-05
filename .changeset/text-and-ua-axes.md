---
"@treeui/tokens": minor
"@treeui/vue": minor
---

The axes both consumers were hand-rolling in local CSS, and two user-agent boxes
that leaked through `as` (TREEUX-005, 043–050).

**`TText`**

- **Status tones** — `danger | success | warning | info`, reading
  `--tree-color-status-*`. A sentence that IS the state (the error line under a
  field, the green "connected") is not a `TAlert` (a box with an icon and the
  weight of an announcement) and not a `TBadge`/`TTag` (a pill, when the datum is
  prose), so the only way to say "this failed" in text was local CSS: 60
  declarations across 42 files in one consumer.
- **`wrap`** (`anywhere | break-word`) — an id, ARN or API key is one long word
  with no break opportunity, and `truncate` is the wrong answer when the string
  IS what the reader came to copy. `anywhere` also sets `min-inline-size: 0`,
  without which a flex or grid child never breaks.
- **`size="subtitle"`** — a third responsive step under `title`, on a gentler
  slope (2.5vw against 4vw). Two steps sharing a slope render identically below
  the smaller one's cap, so a page with a hero and a section could not express
  two levels on a phone; a lower ceiling alone does not fix that.
- **`measure="headline"`** (~20ch) and **`balance`** (`text-wrap: balance`).

**Type scale** — `--tree-font-size-2xl` repeated `xl` verbatim (both
`1.375rem`), which made every `clamp(xl … 2xl)` a constant and left a hole
between 1.375 and 1.75rem. `2xl` is now `1.5rem`; `xl` is unchanged. A unit test
keeps the scale strictly increasing.

**User-agent boxes behind `as`**

- `as="ul"/"ol"/"menu"` on **`TStack`/`TGrid`/`TSplit`/`TContainer`** cancels the
  marker, indent and block margin — the most repeated rule in one consumer's
  repo, 43 resets across 37 files — and restores `role="list"`, which
  `list-style: none` removes in Safari.
- `as="button"` on **`TCard`** restores font, width and text alignment. Measured
  on the same card in a 900px parent: 134.75px / 13.33px / centre as a button
  against 900px / 16px / start as a div. Scoped to the element, so a card as
  `<a>` or `<div>` is untouched.

**Also**

- **`TTag density="compact"`** — keeps the type of its `size` step and derives
  the height from padding instead of the control step, for a static label beside
  a heading (40px → ~26px without shrinking the type).
- **`TAccordionItem headingLevel`** (`2–6 | false`) — the hardcoded `<h3>` put a
  heading in the document outline per disclosure; 20 rounds of a conversation
  became 20 headings. `variant="quiet"` now defaults to no heading wrapper.
- **`TEmptyState frame`** (`block | fill | inline`) — the geometry of the frame,
  a separate question from the size of the message inside it.
- **`TColorSwatch shape`/`block`** — a square, container-width plate for a brand
  manual, where the colour is the subject rather than a control.
- **`TLink family`/`size`** and **`TTextarea family`** — the same `sans | mono`
  vocabulary as `TText`, which retires the last local typography class.
- The `#icon` slot of **`TTag`/`TBadge`** now provides the component's scale, so
  a slotted `TIcon` with no `size` stops entering at the 20px default and lining
  up taller than the text beside it. An explicit `size` still wins.
- New **`skip-forward`** icon: transport, not navigation.
