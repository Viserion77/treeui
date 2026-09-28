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

**Six new icons open a subject the catalog had no way to draw.** `briefcase`, `car`, `graduation-cap`, `landmark`, `shirt` and `utensils` land in a new `everyday` category — everyday-life subjects, as opposed to the payment mechanics `commerce` already covered. Before them, any expense- or subject-categorisation UI had to fall back to `price-tag`: transport, food, education, apparel and civic all resolved to the same picture.

`trending-up` is now an alias of `trend-up`. It is the spelling a Lucide-shaped codebase reaches for first, and reaching for it used to produce an unknown-icon warning.

**Two names were removed: `toggle-left` and `toggle-right`.** They drew a switch, and TreeUI ships `TSwitch` — a real one, with keyboard operation, `role="switch"`, focus-visible treatment and a 44×44 target. A picture of a switch has none of that, and shipping it invites `<TIcon name="toggle-right" />` where `<TSwitch>` was meant. The rule now lives in `DECISIONS.md` → "What Is Not an Icon": if the thing depicted is a control the library already builds, the catalog does not draw it. `check`, `circle-check` and `square-check` are unaffected — a tick is a statement about state, not a box the user clicks.

**The `product` category is gone, and its sixteen icons are filed by what they draw.** Whether `market` reads as a product mark or as a shop front is decided by where it is rendered, so a `product` category recorded an application's decision as library metadata — and made those sixteen unfindable by anyone searching for what they actually show. `market` is now under commerce, `storage` under data, `assistant` under ai, `trail` under navigation, and so on. They keep their shared rounded-square container, which is a drawing treatment rather than a namespace; the helper that applies it is `FRAMED_GLYPH_NAMES`.

**One of those sixteen still carried a name that described an application rather than a drawing, and is now `campaign`.** It draws a megaphone with a sparkle inside the shared rounded square, so it is filed by what it shows like the rest of them. For a consumer this is one name added and one name removed, with no alias between them: an alias would keep a name that says nothing about the drawing in the catalog forever, which is the reason for the rename. Code that still asks for the old name now gets the usual unknown-icon warning and should ask for `campaign` instead. The frame and the sparkle stay, so `campaign` remains distinct from the unframed `megaphone`.

**The catalog is browsable.** `treeIconFamilies`, `treeIconCategories`, `treeIconCategoryOrder`, `treeIconCategoryLabels`, `treeIconAliases`, `treeIconCategory(name)` and `treeIconFamily(name)` are new exports from `@treeui/icons` and `@treeui/vue`: the catalog's own structure, two levels deep. Sixteen subjects, each split into families — `signal` with its four strengths, `chevron` with its four directions.

Three rules make that structure worth shipping rather than deriving. A family lists its variants **by meaning**, so a scale reads `off`, `low`, `medium`, `high` rather than the alphabetical `high`, `low`, `medium`, `off`. An icon with no relatives is a family of one named after itself, so every group renders the same way. And only canonical names appear: `close` and `x` are one drawing under two names, listed once, with `treeIconAliases` giving the synonyms — enough for a picker to match "close" in a search without showing the same picture twice. `categories.test.ts` holds all three, so a new icon cannot ship without a family and a family cannot drift out of order.

Storybook's icon gallery is rebuilt on top of it: grouped by subject and family, searchable by name or synonym, with a second row of family chips inside a chosen category and a drawer that shows the family siblings and hands you the line of code.

The rules ship as tooling: `pnpm --filter @treeui/icons branchline` reports on any icon, and `branchline.test.ts` gates the build. It replaces a test that compared serialised geometry — which measured byte uniqueness, something hash-generated geometry satisfies perfectly while drawing nothing, and which in the other direction forbade true synonyms from sharing one glyph.
