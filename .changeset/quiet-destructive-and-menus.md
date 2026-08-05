---
"@treeui/vue": minor
---

- **`TButton` gains `tone`** (`neutral | brand | accent | success | warning |
  danger | info`), orthogonal to `variant` and using the same closed vocabulary
  as `TTag`. This is what makes a quiet destructive action expressible:
  `variant="danger"` is a colour trapped in the shape scale, so it could only
  ever be a filled red button — two consumer screens independently wrote
  `variant="ghost" tone="danger"` with the prop dead, because it was the only
  phrase that described "destructive, but not the primary action of this row".
  On `solid` the tone fills; on `outline`/`ghost` it inks only the label and
  border. **`variant="danger"` is deprecated** in favour of
  `variant="solid" tone="danger"`: it still works and still renders identically,
  and dev builds warn.
- **`TTagInput` exposes its pending draft** — `v-model:draft` plus a `hasDraft`
  on the instance. `commitOnBlur` covers "typed, then clicked Save", but not
  when the draft is the only change: a click on a *disabled* Save fires no
  mousedown, the field never blurs, and the user is left with a greyed-out
  button and the value in front of them. It also gains `trim` (default `true`),
  so a value that is deliberately whitespace is typeable.
- **`TDropdown` slot `#trigger` receives `triggerProps`** — `v-bind` it and a
  custom trigger carries the ARIA the built-in one has (`aria-haspopup`,
  `aria-expanded`, `aria-controls`, `disabled`). It previously announced only
  "button": not that it opens a menu, nor whether the menu was open.
- **`TDropdown` reserves the icon gutter** for every item as soon as any item
  has an `icon`, so the labels of the icon-less ones stop sliding left and
  reading as two ragged columns.
