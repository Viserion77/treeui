---
'@treeui/vue': minor
---

Tree-shakable build: the package is now emitted with `preserveModules` (one output file per source module, ESM + CJS) instead of a single monolithic bundle, and `sideEffects` covers only CSS. Consumer bundlers can now drop unused components — an app importing only `TButton` bundles ~4 kB of TreeUI code instead of ~150 kB. Entry points (`.`, `./style.css`) and the public API are unchanged.
