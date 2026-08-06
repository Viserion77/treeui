---
'@treeui/vue': minor
'@treeui/mcp': minor
---

Row activation, a colour axis for the confirm dialog, and a template surface a
consumer can actually type.

**`TTable` — six edges found by adopting row activation in production**

- The click target was the FIRST CELL, not the row. Every cell was positioned, so
  the first one became the overlay's containing block and `inset: 0` covered that
  cell alone — the whole row showed pointer and hover while only the first cell
  navigated. Only cells after the first are positioned now.
- `is-linked` followed the presence of `rowHref`/`rowTo`, not the resolved target,
  so a row whose `rowTo` returned `undefined` rendered no link and still promised
  one with a pointer and a hover.
- `rowActivatable` renders a real `<button>` in the first cell instead of
  `role="button"` on the `<tr>`. `role="button"` made every cell presentational
  and destroyed the table's grid semantics, so a row that was activatable AND
  contained a control had no accessible shape at all. As a side effect a control
  in another cell is now a sibling, so it no longer fires `row-activate` — the
  `@click.stop` consumers were writing can go.
- `rowHref`/`rowTo` and `rowActivatable` are mutually exclusive, and dev builds
  say so.
- `rowLabel` applies in both modes. It was link-only, so an activatable row's
  accessible name was every cell concatenated, with no way to pass a translation.
- `aria-expanded`/`aria-controls` are off the `<tr>`: they announced every row as
  expandable and pointed at an id the consumer could not reach. Cell slots receive
  `detailId` and `expanded`, so the control that actually toggles carries them.

**`TConfirmDialog`**

- New `confirmTone` (default `danger`), forwarded to the confirm button's `tone`.
  "It composes through TButton" does not hold here: the dialog owns its footer, so
  there is no call site to compose from.
- `confirmVariant` now defaults to `solid` rather than the deprecated `danger`,
  which was making every dialog emit the deprecation warning from inside the
  library with no action available to the consumer. Appearance is unchanged.
- `tone` works in `variant="soft"`. The stylesheet had `outline` and `ghost` only,
  so a destructive soft button accepted the prop and did nothing.

**Typing (`strictTemplates`)**

- `TInput` and `TTabs` are generic over their model type, so `ref<number>` and
  `ref<'a' | 'b'>` bind without a cast and get their own type back from
  `update:modelValue` instead of a widened union.
- Element attributes are declared props bound to the native element rather than
  left to `$attrs`: `min`/`max`/`step`/`minlength`/`maxlength`/`pattern`/
  `inputmode`/`autocomplete`/`name`/`required`/`readonly` on `TInput`, the text
  subset on `TTextarea`, and `href`/`target`/`rel`/`download` on `TButton`
  (rendered only when `as="a"`). Fallthrough works at runtime and is invisible to
  the type checker, so a numeric input or a link button was untypeable.
- `TToggleGroup` is generic over its option type and its selection mode, so
  `single` binds a `T` and `multiple` binds a `T[]`. It was `string | string[]`
  in and `string | string[] | undefined` out — no literal-union ref could bind
  it, and `undefined` was never emitted. Found by the gate below, not by a
  consumer.
- `TMenu` declared its `header` slot required while the template guards it with
  `v-if`, which told the type checker the guard was dead code.
- The repo's `vue-tsc` moved to 3.x. It was 2.x while consumers were on 3.x, and
  three rounds of a reported model-typing error could not be reproduced here for
  exactly that reason. `pnpm typecheck:strict-templates` now runs the same major
  consumers do.

**`TChart` / `TSpanLanes`**

- `TChart` gains `seriesLabel` for the accessible table's series column, which was
  a hardcoded English `Series` with no slot — the one string in the component that
  could not go through a product's catalogue.
- `TSpanLanes` gains `maxRows` and `overflowLabel`. Capping in the consumer with
  `.slice()` hides data without saying so, so the cap is the library's and it
  always renders a footer declaring how many lanes it left out.
