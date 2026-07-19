---
'@treeui/react': patch
'@treeui/vue': patch
---

Set a base `html { font-family: var(--tree-font-family-sans) }` in the component
stylesheets. The design font was previously applied only through a per-component
selector list, so unstyled prose, layout roots, and the overlays teleported to
`<body>` (modal, drawer, popover, dropdown) fell back to the browser default
serif. The rule is specificity (0,0,1), so any consumer rule still overrides it.
