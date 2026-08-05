---
"@treeui/vue": patch
---

Fix a regression from 0.28.0: `TFormField` emitted `<label for>`
unconditionally, but only some controls carry the id — so a field wrapping a
`TSelect`, `TRadioGroup` or `TToggleGroup` produced a label pointing at an id no
element on the page had. Before 0.28 the `for` was simply absent: the field was
unnamed, but the markup was coherent. This made it incoherent, which an audit
tool flags (TREEUX-012).

- `TSelect` now carries the id on its trigger button, so the label names it.
- `TRadioGroup` and `TToggleGroup` release the id and name themselves with
  `aria-labelledby` off the label's own id. `<label for>` may only point at a
  button, input, select, textarea, meter, output or progress — a
  `div[role="radiogroup"]` is none of them.
- The group declares itself rather than every adopter announcing itself: a
  child's `setup` runs after its parent has rendered, so the inverse would ship
  a server-rendered document with no `for` on any input, select or textarea.
