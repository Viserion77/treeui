---
"@treeui/vue": minor
---

`TText` gains `size="title"` — a responsive section-heading step (clamp
xl→4xl, tight line-height and tracking) that stays below `size="display"` at
every viewport width, so a section heading never out-sizes the page's hero on a
narrow screen (TREEUX-024). Marketing surfaces drop their hand-written
`clamp()` section-title class.
