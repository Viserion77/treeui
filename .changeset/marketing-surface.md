---
"@treeui/tokens": minor
"@treeui/vue": minor
---

Closes the marketing surface — the batch of primitives a public site and 13
product landing pages were each re-solving in local CSS (TREEUX-027, 030–034,
036, 038).

**New components**

- **`TSection`** (TREEUX-030) — page section with responsive vertical rhythm
  (`rhythm="tight|default|loose"`) and an optional full-bleed band
  (`banded`), with the reading column delegated to a nested `TContainer`.
  The band is full-bleed because the section spans its parent and carries the
  background itself: no `100vw`, no negative margin, so it cannot overflow once
  the platform paints a classic scrollbar.
- **`THero`** (TREEUX-031) — the one section with a layer behind the copy. The
  library owns the box (stacking context, the clip that keeps an oversized
  decoration inside the band, hero-scale padding) and guarantees the `#backdrop`
  layer is `pointer-events: none`, so a click on the CTA never dies in the
  ornament. `glow` draws the one part of a hero backdrop that is 100% tokens.
- **`TPageSurface`** (TREEUX-032) — the page-level surface for screens with no
  app shell. Zeroes the user-agent body margin (previously only handled for
  `body:has(.t-app-shell)`) and, with `overlay`, takes the viewport and becomes
  the scroll host with contained scroll chaining, so a landing rendered over a
  mounted SPA stops dragging the screen behind it.
- **`TShow` / `THide`** (TREEUX-033) — breakpoint visibility in pure CSS
  (`at`/`below`, combinable into a band). Both branches render, so a
  pre-rendered page keeps every link; a `matchMedia` composable cannot, because
  there is no `window` while the HTML is written. It is also something a
  consumer cannot write: `@media (min-width: var(--tree-breakpoint-lg))` is
  invalid, so the pixel gets hardcoded per app. A unit test fails the build if
  the stylesheet literals drift from `--tree-breakpoint-*`.
- **`TSkipLink`** (TREEUX-036) — the one control that must be hidden and visible
  at the same time. It parks off-screen and returns on `:focus-visible`, and it
  prepares its own target (`tabindex="-1"` plus the ring suppression), which
  retires the loose `#content:focus { outline: none }` from consumer
  stylesheets. `TAppShell` gains `skipLinkLabel` to close the same hole for
  authenticated screens — opt-in only because the label is product copy.

**Accent axis and elevation (TREEUX-034 / TREEUX-027)**

- `@treeui/tokens` gains a **secondary brand accent** with a measured light/dark
  pair (`--tree-color-accent-primary` / `-hover` / `-soft` / `-contrast`), AA on
  every background and on its own soft tint. `accent.test.ts` holds that bar.
- `TSection`/`THero`/`TPageSurface` take **`accent`** — a closed axis
  (`brand | neutral | success | warning | danger | info`) declared once and
  inherited by the whole subtree. Never a free colour, the same policy
  `TLinkTile`'s `tone` states.
- `TTag` gains the matching **`tone`** axis
  (`neutral | brand | accent | success | warning | danger | info`), orthogonal to
  `variant`. `tone="accent"` reads the accent in scope, so a badge follows its
  surface. Omitted, the tag renders exactly as before.
- New shadow steps `--tree-shadow-lg` / `--tree-shadow-xl`, plus
  `--tree-shadow-accent` — the elevation tinted by the accent in scope, which is
  the rule 12 landing pages had written by hand.

**Existing components**

- **`TColorSwatch`** gains `readonly` (TREEUX-038): colour as evidence rather
  than as a choice — inert `role="img"` chips with a `border-strong` outline, so
  a chip that IS a background colour stays visible in its own theme.
- **`TTag`** gains `removeLabel`, so the remove button's accessible name can be
  localized instead of being hardcoded English. `TTagInput` forwards it to every
  chip.
