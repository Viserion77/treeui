---
"@treeui/tokens": minor
"@treeui/vue": minor
"@treeui/mcp": minor
---

feat: TPage + TPageHeader, a brand button variant, and deterministic TNavMenu active state

Addresses base-component gaps surfaced in a cross-product UI/UX review.

- **`TPageHeader`** — canonical page title block: heading (`level` 1–6), optional
  subtitle, a right-aligned `actions` area, plus `breadcrumb` and default slots. Fixes
  title hierarchy and "title + actions" alignment drifting per screen.
- **`TPage`** — semantic page region under the app shell. Composes `TContainer` for a
  centered max-width column (`width`) and adds page-level block padding (`padded`) and
  vertical rhythm between sections (`gap`). Standardizes content width and breathing room.
- **`TButton` `brand` variant** — a high-emphasis gradient CTA driven by a new
  `--tree-gradient-brand` token (`@treeui/tokens`). The token references the theme brand
  vars so it follows light/dark automatically; override it to match a product's marketing
  gradient. `brand` is button-only, layered on top of the shared action variants.
- **`TNavMenu` deterministic active state** — router-link items no longer inherit Vue
  Router's inclusive `router-link-active` class, which could mark several items active at
  once (e.g. a parent and its nested route). The menu now owns a single highlight: controlled
  menus (`modelValue`) neutralize the router's classes, and uncontrolled menus let the current
  route drive selection with **exact matching by default**. New `exact` prop (menu-level) and
  `TNavMenuItem.exact` (per-item) opt back into inclusive matching for section roots.

`@treeui/mcp`: catalog regenerated for the new component surface.
