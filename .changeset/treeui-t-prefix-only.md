---
"@treeui/vue": minor
"@treeui/icons": minor
"@treeui/mcp": minor
---

**Breaking:** adopt a single `T`-prefixed public surface and drop the `Tree<Name>` compatibility layer.

- The `Tree<Name>` component aliases and their global plugin registrations are removed; use `T<Name>` exports only (the `TNavbar` / `TAppBar` and `TSteps` / `TStepper` pairs remain).
- Exported types are renamed: `TreeSize` → `TSize`, `TreeVariant` → `TVariant`, `TreeBadgeTone` → `TBadgeTone`, `TreeIconName` → `TIconName`, and so on.
- Source SFCs are renamed `T<Name>.vue`, and component BEM classes are renamed `tree-*` → `t-*` (for example `tree-button` → `t-button`).
- Design-token CSS variables keep the `--tree-*` prefix and the `[data-tree-theme]` attribute is unchanged, so theming is not affected.

Migrate by replacing any `Tree<Name>` imports/usages with `T<Name>`, updating the renamed type names, and renaming `tree-*` class selectors to `t-*` in custom CSS.
