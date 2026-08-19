---
'@treeui/icons': minor
'@treeui/vue': patch
---

Icons are now drawn to a named contract, **Branchline**, and the contract is enforced by rendering rather than by review.

**Modifier variants are legible again.** `mail-check`, `mail-plus` and `mail-warning` used to be the same picture: they were distinguished only by a ~1.2u mark inside a 6.7u corner badge, which at the default 20px render is roughly one pixel. The badge is gone. A modifier is now drawn inside bases that enclose space (`shield`, `file`, `folder`, `calendar`, `ticket`, `message-square`, `square`, `badge`, `search`) and in a cleared corner otherwise. Measured at 16px, `shield-check` and `shield-x` now differ by 15% of their ink, against 0.6% before — and `shield-*` reads as a shield again instead of as a broken ring.

**A modified icon is the same size as the icon it modifies.** The base is not scaled down to make room for the corner mark; it keeps its full size and is redrawn with that corner interrupted, so `globe` and `globe-check` are the same globe. A new rule, `checkCornerClearance`, holds 5.5u of empty canvas around every corner mark and fails the build when the base crowds it.

**Fourteen icons had geometry generated from a hash of their own name.** `network`, `network-nodes`, `workflow`, `hierarchy`, `git-branch`, `git-fork`, `route` and `timeline` were interchangeable arrangements of sticks and dots, plus six overlay uses in `brain-circuit`, `brain-lock`, `repeat-*`, `browser`, `page-snapshot` and `ai-studio`. All are now drawn to the convention each concept already has.

**Names that did not match their drawing.** `settings` was a sun and is now a gear. `circle-alert` held a warning triangle inside a circle — two alert metaphors stacked — and now holds an exclamation. `info` and `clock` both carried a broken ring with a dot floating outside it, which reads as a notification; both rings are closed. `users-round` drew two heads over one shared body inside a ring, which read as a face, and is now two avatars. `bot-users` was a bot with a plus, meaning "add a bot", and is now a bot with the person it serves. `support` was a spiral and is now a headset. `wrench-zap` drew its bolt inside the wrench outline, so it shared a silhouette with `wrench`. `file-pdf` spelled three letters in a 9u box that no size could resolve. `chevrons-up-down` closed into a diamond. `lock` no longer carries the keyhole that `lock-keyhole` is named for.

**Other redrawings:** `file-archive`, `folder-input`, `calendar-dot`, `list-rule`, `send-request`, `library-books`, `assistant`, `lightbulb-sparkles` and `code-api` were redrawn to clear the contract.

**Five names became aliases rather than separate drawings.** `microphone`, `house`, `paper-plane`, `alert-circle` and `check-circle` now share the geometry of `mic`, `home`, `send`, `circle-alert` and `circle-check`. Every name still resolves; nothing was removed from the catalog.

The rules ship as tooling: `pnpm --filter @treeui/icons branchline` reports on any icon, and `branchline.test.ts` gates the build. It replaces a test that compared serialised geometry — which measured byte uniqueness, something hash-generated geometry satisfies perfectly while drawing nothing, and which in the other direction forbade true synonyms from sharing one glyph.
