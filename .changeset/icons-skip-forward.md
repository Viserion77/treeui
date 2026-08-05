---
"@treeui/icons": minor
---

Ship the `skip-forward` icon (TREEUX-042) — transport, not navigation: the pair
of `play`/`pause`, for "end this phase now".

It was added to the source in the 0.28 cycle but **no changeset ever named
`@treeui/icons`**, so the package was never versioned and the icon never
published: `@treeui/vue@0.28.0` still resolved `@treeui/icons@0.18.0`, where it
does not exist. The consumer found it by looking in the installed registry
rather than trusting the release note, which is the only way that class of
mistake gets caught.
