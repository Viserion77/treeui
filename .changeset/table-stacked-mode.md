---
'@treeui/vue': minor
---

`TTable` gains `stackBelow`: under a container width the grid becomes one block per row, so nothing disappears behind a horizontal scroll on a phone.

Until now the only answer on a narrow screen was the wrapper's horizontal scroll, with no affordance saying there was more to the right — measured on a three-column ledger at 390px, the wrapper overflowed by 68px and the rightmost column, half the information on screen, was simply cut off. The middle column was squeezed to ~110px and its text broke over four or five lines, so row heights ran from 60 to 133px.

`stackBelow="sm"` turns each row into a block: the column marked `stack="title"` is the heading, the rest sit under it, and every value carries its column's `label`, because the header row is gone. Columns take `stack?: 'title' | 'field' | 'hidden'`, defaulting to `field`. At most one title — the first column claiming it wins, since two headings in one block is not a block and honouring the last would make the result depend on column order.

**Measured on the container, not the viewport.** A table can sit in a narrow panel on a wide screen, and that is the case a media query cannot see. In one 1440px page, a 372px wrapper stacks while a 742px wrapper beside it stays a table, both with zero overflow. A breakpoint name rather than a free length, because a container query cannot read a custom property in its condition: the alternative is a `ResizeObserver` per table, and the literals in the stylesheet are held equal to `treeTokens.breakpoint` by the same test that already guards `TShow`/`THide`.

**The accessibility half was the real work.** `display: block` drops the implicit table semantics in several screen readers, so `role` is now declared on the table, both rowgroups, every row, every column header and every cell. Each is the element's own implicit role, so nothing changes above the breakpoint. Verified in the accessibility tree: a stacked cell reads as `cell "Saldo real R$ 1.284,30"` — the value carrying its column.

`rowState`, `rowHref`/`rowTo` and `rowActivatable` keep working in a block, and the stretched link covers the whole block rather than just its heading. That needed care: outside stacked mode every cell after the first is raised above the link overlay so a button in the actions column stays clickable, but stacked those cells are plain text under the title and raising them punched a hole in the link. Inside the container query only cells that actually contain something focusable are raised — and never the first, which holds the overlay: positioning it makes it the overlay's containing block, and `inset: 0` then covers that cell alone, which is the bug the existing comment in the stylesheet warns about.

A table without `stackBelow` is untouched, including the containment: `container-type` is set only on a wrapper that asked for it, rather than imposing `contain: layout inline-size style` on every table in the library.
