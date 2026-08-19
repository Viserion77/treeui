---
'@treeui/icons': minor
'@treeui/vue': patch
---

Icons are now drawn to a named contract, **Branchline**, and the contract is enforced by rendering rather than by review.

**Modifier variants are legible again.** `mail-check`, `mail-plus` and `mail-warning` used to be the same picture: they were distinguished only by a ~1.2u mark inside a 6.7u corner badge, which at the default 20px render is roughly one pixel. The badge is gone. A modifier is now drawn inside bases that enclose space (`shield`, `file`, `folder`, `calendar`, `ticket`, `message-square`) and in a cleared corner otherwise, with the base redrawn at 75% so the two never share a stroke. Measured at 16px, `shield-check` and `shield-x` now differ by 15% of their ink, against 0.6% before — and `shield-*` reads as a shield again instead of as a broken ring.

**Fourteen icons had geometry generated from a hash of their own name.** `network`, `network-nodes`, `workflow`, `hierarchy`, `git-branch`, `git-fork`, `route` and `timeline` were interchangeable arrangements of sticks and dots, plus six overlay uses in `brain-circuit`, `brain-lock`, `repeat-*`, `browser`, `page-snapshot` and `ai-studio`. All are now drawn to the convention each concept already has.

**Other redrawings:** `settings` was a sun and is now a gear; `lock` no longer carries the keyhole that `lock-keyhole` is named for; `file-archive`, `folder-input`, `calendar-dot`, `list-rule`, `send-request`, `library-books`, `assistant` and `lightbulb-sparkles` were redrawn to clear the contract.

**Five names became aliases rather than separate drawings.** `microphone`, `house`, `paper-plane`, `alert-circle` and `check-circle` now share the geometry of `mic`, `home`, `send`, `circle-alert` and `circle-check`. Every name still resolves; nothing was removed from the catalog.

The rules ship as tooling: `pnpm --filter @treeui/icons branchline` reports on any icon, and `branchline.test.ts` gates the build. It replaces a test that compared serialised geometry — which measured byte uniqueness, something hash-generated geometry satisfies perfectly while drawing nothing, and which in the other direction forbade true synonyms from sharing one glyph.
