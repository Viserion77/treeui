---
'@treeui/vue': minor
---

Fix two slots that were documented but non-functional.

**`TCard` `#header` no longer swallows `#actions`.** The title and actions
markup sat inside the `header` slot's fallback content, so filling `#header`
removed the action buttons with no error or warning. `t-card__actions` is now a
sibling of the slot, matching `TModal` and `TDrawer`.

_Upgrade note:_ if you worked around this by duplicating your buttons into
`#header`, they will now render twice — remove the duplicate.

**`TDropdown`'s `trigger` slot now works.** `triggerRef` was bound to the
built-in fallback button, which is inside the slot and therefore absent once you
fill it. A custom trigger could not open the menu at all, and focus was never
restored on close (WCAG 2.4.3). Handlers and the ref now live on the trigger
wrapper, so a custom trigger opens on click and Enter/ArrowDown, and focus
returns to it on Escape and after selecting an item.
