---
'@treeui/mcp': minor
---

Add a `search_tokens` tool and expose the design tokens in the catalog. The
catalog previously contained no token entries at all, so an agent connected to
the server could not see that a token existed and would hardcode its value
instead — the observed cause of consumer apps reimplementing
`--tree-gradient-brand` and the container max-widths by hand.

Matching works on variable name, category, and literal value, so `64rem` or
`#0969da` resolves to the token that already ships. Entries are generated from
`@treeui/tokens` using the same path-to-name logic as the stylesheet, so the
emitted `cssVar` is guaranteed to match what consumers actually load, and a test
fails if the two ever diverge.
