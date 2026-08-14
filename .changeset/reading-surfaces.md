---
'@treeui/vue': minor
---

Axes for a page that is read rather than operated.

**`TSteps` has a static mode, and it is the default.** `interactive={false}`
already existed, but every step still rendered a `<button disabled>`: a
four-step "how it works" handed four dead controls to the accessibility tree,
washed out at 60% opacity, with the first step ringed as if the reader were
standing in it. Non-interactive now means inert boxes — no control, no disabled
wash, and no step elected current unless `modelValue`, `defaultValue` or an item
`status` says so. A wizard is unchanged: `interactive` still opens on the first
step and still emits `update:modelValue`. The box styles moved to
`.t-steps__box`, which the interactive element carries alongside
`.t-steps__button`, so existing selectors match exactly what they matched
before.

**`TSteps` takes `columns` and `minItemWidth`.** `flex: 1 1 14rem` was a
constant, so a strip could only wrap by available width and left the last step
alone on its own row. These are the axes `TGrid` already has, and they replace
the only workaround available: declaring the component twice inside
`TShow`/`THide`, which duplicates the copy in pre-rendered HTML.

**`TText` takes `align`.** `TStack align="center"` centres the box; this centres
the lines inside it. The two look identical while the box is narrow and diverge
the moment it spans the column, which is why a centred closing section reads
left-aligned on a phone. Logical values, and with a `measure` the capped block
centres too.

**`TStat` takes `emphasis`.** `label` stays the default — a dashboard reader is
scanning for what is measured. `value` leads with the figure for a marketing
band, and keeps a row of tiles on one baseline, since the labels no longer have
to be the same height. Visual order only: the DOM keeps label before value, so
the announcement is still "Requests served, 4.2M".

**`TGrid` takes `balance`.** `auto-fit` collapses a track only when it is empty
on every row, so five cards over four tracks leave three holes on the right, and
a hole reads as a card that failed to load. Balanced mode lays out as flex lines
so each line divides itself among the items it has: full rows are identical, the
remainder row is shared out. Ignored when `columns` is set.

**`TSparkline` takes `fluid`.** It fills the parent's width while keeping its
height, so a sparkline in a card that grows with the page no longer needs a full
`TChart` with axes, legend, tooltip and animation switched off. Strokes keep
their declared width — the path scales, the pen does not.

**`TListItem` keeps its leading slot on the first line.** Below 30rem the row
wraps so the meta can drop below it, but flex chooses line breaks from the
hypothetical main size, so a long content column moved down whole and stranded
the icon on the line above. The content is pinned to `flex-basis: 0` inside the
container query, so the break falls after it and the wrap does only the job it
was added for.
