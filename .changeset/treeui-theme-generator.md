---
"@treeui/tokens": minor
---

Add a theme generator. `createBrandTheme(name, primary)` derives a full brand ramp (hover, soft tint, readable contrast, focus ring) from a single primary color and emits a `[data-tree-theme="…"]` overlay; `createCustomThemeCss(name, overrides)` builds a full custom theme by deep-merging color overrides onto a base theme. Ships with framework-agnostic sRGB color helpers (`parseHex`, `mixColors`, `darken`, `lighten`, `relativeLuminance`, `contrastRatio`, `bestContrast`, `withAlpha`) and `deriveBrandRamp`.
