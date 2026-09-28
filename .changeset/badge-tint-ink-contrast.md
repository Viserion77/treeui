---
'@treeui/vue': patch
'@treeui/react': patch
'@treeui/tokens': patch
---

**`TBadge`'s tinted variants had an illegible label, including with no props at all.**

`soft` and `danger` painted the label with the tone's full-strength colour on the tone's own tint. Measured against the surface, eight of the ten tone/theme pairs fell below the 4.5:1 that WCAG 1.4.3 asks of normal-size text:

| `soft` tone | light    | dark     |
| ----------- | -------- | -------- |
| neutral     | 4.56     | **4.49** |
| success     | **4.31** | **4.36** |
| warning     | **4.30** | **4.38** |
| danger      | **4.19** | **4.45** |
| info        | **4.26** | 5.33     |

`variant="soft" tone="neutral"` is what `<TBadge>` renders with nothing passed, and in the dark theme it measured 4.49:1 — one rounding step from passing, which is how it survived review.

Both variants now read the tone's `*-on-soft` colour. That token already existed and already carried this exact job: it is derived to clear AA on a tint and it deepens as the tint deepens, which is why `.t-button--soft` has always used it. Every pair now clears, worst case 4.54:1. **The label colour changes visibly on tinted badges** — it is a step darker in light mode and a step lighter in dark.

Nothing had caught it. `CONTRAST_PAIRS` in `contract.ts` checks the semantic colours against the three surfaces, and a component pairing two semantic colours of its own is not in that list. It was found by rendering: the new Compose and egui ports each measure the full variant × tone × theme matrix in their own suites, and both failed here independently before the web had a test that could. `packages/tokens/src/badge-contrast.test.ts` is that test now.

The mapping itself is no longer only CSS. `NATIVE_BADGE_TONES` in `@treeui/tokens` declares all twenty cells, `badge-tone-contract.test.ts` parses the shipped stylesheet and fails if the two disagree, and both ports generate their accessor from it instead of deriving it by hand a third time.

One thing that is NOT fixed, and is recorded rather than changed: `--tree-badge-solid-text` is `--tree-color-brand-contrast` for every tone, including the four status ones. It measures 5.19:1 to 8.13:1 today, so it passes — but it passes because the shipped status hues happen to be dark enough, not by construction. `TButton` does this properly, reading the per-theme `--tree-color-status-*-contrast`. A product re-theming the brand or seeding a lighter warning would break the badge and not the button.
