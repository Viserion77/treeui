---
'@treeui/vue': patch
'@treeui/react': patch
---

Fix four layout and token defects in the shipped stylesheets.

- `.t-nav-menu__icon` referenced `--tree-icon-size-md`, which does not exist —
  the token is `--tree-size-icon-md`. An icon with intrinsic dimensions was
  unaffected (the 20px default happens to equal `1.25rem`), but an icon with
  only a `viewBox` rendered at roughly 1264px.
- `.t-card__header` now wraps and `.t-card__title` can shrink, so a long title
  beside action buttons no longer overflows a narrow card. Wrapped actions
  align left, matching the existing `.t-page-header__bar` behavior.
- The app-shell body reset matched only two nesting depths, so the common
  `body > #app > .app > .t-app-shell` structure kept the 8px user-agent margin
  and produced a second scrollbar over a `100dvh` shell. The selector is now
  depth-agnostic.
- `TSelect`, `TDatePicker`, `TDateTimePicker`, `TMultiSelect` and `TInput` now
  set `min-inline-size: 0`, so they shrink inside a flex row instead of forcing
  it to overflow. Only their minimum changes; preferred width is untouched.
