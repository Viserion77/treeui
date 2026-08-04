---
"@treeui/vue": minor
---

Two chat-composer fixes (TREEUX-020, TREEUX-023):

- **`TTextarea` gains `maxRows`** — a ceiling for `autoGrow`, in lines. Without
  it the field grows forever and a composer eventually pushes the conversation
  off screen; at the cap it starts scrolling internally instead, with the
  component's border and focus ring standing still. The cap is measured from the
  field's resolved line-height plus its vertical padding and border, so it
  follows `size` and the theme. `autoGrow` now also sizes on mount and works
  uncontrolled.
- **`TAccordion` gains `variant="quiet"` and `rail`** — the weight of a note
  attached to one item rather than of a document section: the trigger sizes to
  its content instead of spanning the reading column, the item rule disappears,
  and the panel shrinks and can indent behind a vertical rule. Styling only —
  the keyboard model, `aria-expanded`/`aria-controls` and the 44×44 hit target
  are unchanged. It looks small; it is not small to hit.
