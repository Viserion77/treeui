---
'@treeui/vue': patch
---

Fixes a regression in 0.32.0: an anchored panel opened from inside a `TModal` rendered **behind** the dialog, and nothing in it could be clicked.

0.32.0 moved `TPopover`, `TMenu`, `TSelect` and `TDatePicker` panels into a `<Teleport to="body">` so an ancestor's `overflow` could not clip them. Leaving the ancestor's clip also left its **stacking context**: a panel positioned `absolute` inside a modal was painted above the dialog for free, but as a sibling of the modal on `body` it stacks by its own `z-index` — and `--tree-z-dropdown` (1000) sits below `--tree-z-modal` (1300). Measured at 320, 390 and 1440: **0 of 42 days** in a `TDatePicker` inside a `TModal` were reachable by `elementFromPoint`, and a real click hit the dialog behind the panel. In 0.31 the panel overflowed the surface by 18px but was clickable, so this was strictly a regression.

`useAnchoredLayer` now walks the trigger's ancestors, takes the highest `z-index` among the positioned ones, and places the panel one above it. Reading the trigger's ancestors rather than having each layer announce a level: the trigger is still inside the layer, so the answer is already in the DOM, and `TDrawer` — or any layer added later — is covered without either side knowing about the other. The panel's own stylesheet value is a floor, so a trigger inside a card with `z-index: 1` cannot pull a 1000 panel down to 2, and outside any layer the stylesheet keeps deciding.

Verified in a browser, which is the only place it is visible: 3/3 options and 42/42 days reachable at 320×640, 390×844 and 1440×900, with the modal surface still free of overflow, and an unchanged panel outside a modal. The unit test covers the decision rather than the geometry — jsdom has no layout — and it fails against the previous behaviour.
