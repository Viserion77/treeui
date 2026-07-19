---
"@treeui/vue": patch
---

Fix focus restoration in `TPopover` when a custom `trigger` slot is used, and stop
the published type declarations from pointing outside the tarball.

- `TPopover` bound its `triggerRef` to the built-in fallback `<button>`, which does
  not render once a consumer supplies a `trigger` slot. With a custom trigger the
  ref was `null`, so closing with Escape restored focus nowhere and focus fell back
  to `<body>` (WCAG 2.4.3). The ref now lives on the `t-popover__anchor` wrapper and
  resolves the real trigger via `focusFirst()` — the same approach `TDropdown`
  already used.
- The `trigger` slot of `TPopover` and `TDropdown` now also receives the id of the
  panel it controls (`contentId` / `menuId`). Custom triggers previously had no way
  to wire a correct `aria-controls`; on `TDropdown` it was impossible, since the
  generated menu id was never exposed. `TDropdown` also gains an optional `id` prop,
  matching `TPopover`.
- `vite-plugin-dts` inlined the monorepo `@treeui/*` tsconfig path aliases into the
  emitted declarations, so `TIconName` was re-exported from `../../../icons/src`, a
  path absent from the published package. Under `skipLibCheck` that silently degraded
  the type to `any` and `<TIcon name="does-not-exist" />` type-checked. These are real
  dependencies and now stay bare specifiers.
