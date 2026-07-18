---
'@treeui/vue': minor
---

Export 11 public types that were defined but unreachable from the package entry
point — importing any of them failed with TS2614/TS2724:

`TTableColumn`, `TTableSortState`, `TTableSortDirection`, `TAlertVariant`,
`TAvatarStatus`, `TComboboxOption`, `TContextMenuItem`, `TTagVariant`,
`TPricingPlan`, `TAccordionType`, `TTabsActivationMode`.

The last three were declared without the `T` prefix required by the naming
convention. They had never been exported, so they are published under the
prefixed name only — no alias is needed.

Adds a test that fails when a new type is declared without being exported or
without the prefix, so the barrel cannot drift again.
