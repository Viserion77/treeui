---
'@treeui/icons': minor
'@treeui/vue': minor
---

Expand the built-in TreeUI icon catalog from 71 to 364 names. The catalog now
covers the consolidated P0/P1/P2 product vocabulary, application glyphs, file
families, status and action icons, and the documented migration aliases. Product
icons use concise unprefixed names, while company logos remain app-owned SVG
components rather than built-ins. Built-in keys now feed `TIconRegistry`
automatically so every shipped name remains available through `TIconName` in the
generated declarations.
