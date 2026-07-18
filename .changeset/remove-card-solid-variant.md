---
"@treeui/vue": minor
"@treeui/react": minor
"@treeui/mcp": patch
---

**Breaking:** remove the `solid` variant from `TCard`. Card variants are now `outline | soft | inset`.

`TCard`'s `solid` variant swapped the text and background tokens (`background: var(--tree-color-text-primary)`) to produce an inverted surface. It is removed because it was inconsistent on three counts:

- **`solid` meant two different things.** On `TButton`, `TBadge` and `TTag`, `solid` means "filled with the brand color". On `TCard` it meant "inverted neutral" — so in dark themes a solid button stayed brand blue while a solid card turned light. Card variants are a surface scale (plain → tinted → recessed), a different axis from the action variants.
- **It coupled a surface role to a text token.** Any theme overriding `color.text.primary` silently changed the card's background, with no guarantee the result stayed legible.
- **Inverting the surface broke nested content,** which still read the normal tokens. The workaround — a `.t-card--solid > *` block re-scoping seven tokens — never covered every case (brand-tinted table-row hover dropped to ~1.1:1 contrast) and was never ported to `@treeui/react`, so the same prop rendered differently in each framework.

**Migration:** replace `<TCard variant="solid">` with `<TCard variant="soft">` or `<TCard variant="inset">`. For a high-emphasis card, use a brand-colored border rather than an inverted surface. If you rely on a genuinely inverted surface, it should be built on dedicated per-theme tokens rather than this swap — see `docs/ai/DECISIONS.md` → "Variant Vocabulary".

`@treeui/mcp` ships a regenerated AI catalog, so agents reading it no longer see `solid` offered as a card variant.

Also documented, with no code change: **TreeUI has no density axis** — spacing density is expressed through the existing `size` prop. The example dashboards label their `size` control "Density" as an application-level choice; see `docs/ai/DECISIONS.md` → "Density".
