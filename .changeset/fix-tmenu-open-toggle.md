---
"@treeui/vue": patch
---

Fix `TMenu` never opening from its trigger.

`TMenu` bound the internal `TPopover` with `v-model:open="isOpen"`, but `isOpen` is the read-only `computed` returned by `useControllableOpen`. The generated `@update:open` handler assigned to that computed, which fails silently ("computed value is readonly"), so a trigger click never propagated the open state — the panel stayed closed (rendering was fine, only the toggle was dead; this also affected `v-model:open`). The binding now routes `TPopover`'s `update:open` through `setValue`, the proper setter (the same one `activate()` already uses to close). Regression tests cover opening on trigger click (uncontrolled) and the controlled `v-model:open` round-trip.
