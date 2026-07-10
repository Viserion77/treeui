---
'@treeui/vue': minor
---

Component polish surfaced while building the example dashboards:

- `TCard`: the `solid` variant now re-scopes the core color tokens for nested content, so titles, tables, timelines, and dividers stay legible on the inverted surface in both light and dark themes.
- `TDropdown`: new `align` prop (`start` | `end`) aligns the menu to the trigger's end edge for triggers near the right side of clipping containers (e.g. table action columns); the menu also grows to fit its items instead of wrapping or truncating labels.
- `TSelect`: the listbox flips above the trigger when there is not enough space below it (e.g. near the bottom of a modal or the viewport).
- `TSidebar`: custom header and footer content is centered while collapsed so it lines up with the nav icon column.
- `TFormField`: slightly larger label-to-control gap so control focus rings no longer overlap the label.
