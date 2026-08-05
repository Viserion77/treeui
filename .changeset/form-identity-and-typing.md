---
"@treeui/vue": minor
---

Labelling, identity and navigation in forms (TREEUX-007, 008, 009).

- **`TFormField` generates the control id** and provides it to the TreeUI
  control nested inside, so `<label for>` and the control cannot drift.
  Inventing and repeating the id by hand was a silent failure mode: forget one
  half and nothing warns — the label simply names nothing. `htmlFor` still wins,
  and the error/hint paragraphs now carry ids that reach the control through
  `aria-describedby`. The default slot receives `{ id, describedBy }` for a
  control that cannot inject the context. `invalid`/`disabled`/`required` are
  deliberately NOT propagated.
- **`TCheckbox label`** — it was the only control labelled by slot alone, so a
  consumer reaching for the prop got a checkbox with no accessible name at all.
- **`TDropdown` items take `icon` and `selected`** — a selected item becomes a
  `menuitemradio` with `aria-checked` instead of a slot that can paint the state
  but not say it.
- **`TButton to`** — renders a RouterLink wearing the button's skin, so a CTA
  that navigates keeps ctrl/middle-click, "open in new tab" and the status-bar
  URL, with the accessible role `link`. The alternatives were `<a><button>`
  (invalid markup, two tab stops) and `as="a" :href` (leaves the SPA). A
  disabled button stays a `<button>`, since there is no `disabled` on `<a>`.
- **`GlobalComponents` typing** — `@treeui/vue` now augments Vue's
  `GlobalComponents` with exactly what `TreeUIPlugin` registers, so `vue-tsc`
  fails on a prop that does not exist. Previously such a prop became an entry in
  `$attrs` and, on a component with `inheritAttrs: false`, landed on an inner
  element as an invalid HTML attribute and disappeared: one consumer audit found
  six of them across 19 call sites — a checkbox with no accessible name, a
  destructive button in the default colour, translated copy that never
  rendered — with no warning in dev, in build, or in `vue-tsc`.
