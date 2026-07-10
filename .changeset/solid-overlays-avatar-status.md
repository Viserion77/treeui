---
'@treeui/vue': patch
---

Visual fixes:

- `TAvatar`: the status dot is no longer clipped into a sliver by the avatar's circular mask (`overflow: hidden` moved off the root); its ring now matches the surface behind it (`--tree-color-bg-surface`).
- `TCard`: inside the `solid` variant, re-scoped background tokens are now mixed over the captured surface color instead of transparency, so floating layers (dropdown menus, select listboxes) are opaque and readable again.
