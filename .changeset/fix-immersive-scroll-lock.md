---
"@treeui/vue": patch
---

Fix `TAppShell` stranding the page scroll lock when `immersive` hides an open mobile drawer.

Entering immersive removes the drawer from the DOM without changing `sidebarOpen`, so the `sidebarOpen` watcher never fired: `document.body.style.overflow` stayed `hidden` and focus was left on an unmounted surface, leaving the page unscrollable with no visible way to recover. Immersive now releases the lock and restores focus on the way in, and re-arms the drawer on the way out — mirroring how the responsive-mode watcher already behaved. Regression covered by a test.

Also updates the practice conformance map (`docs/ai/practices.json`) for the 0.19.0 contract work: `TButton` now claims `accessible-by-default` (it is the canonical 44×44 target and the required-accessible-name path for `iconOnly`), and `TTable` claims `state-clarity` (designed empty state). Two rules were sharpened to match what the code now commits to — loading states replace the resting glyph rather than stacking beside it, and no composite-widget role is claimed without its full keyboard model.

Adds a `brand-lockup` recipe to `RECIPES.yaml` documenting the `header-start` composition for a logo + product name that tracks sidebar collapse, so consumers stop hand-rolling brand CSS.
