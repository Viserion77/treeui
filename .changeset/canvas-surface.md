---
'@treeui/vue': minor
---

`TCanvasSurface` and `useCanvasSurface` — the surface a diagram is drawn on.

The library had the decorative half of this: `useDecorativeCanvas`, an animation
loop that has to be talked out of running, gated by visibility, reduced motion
and pointer coarseness, and holding `pointer-events: none` so a click reaches
the button behind it. Every one of those decisions is right for an ornament and
wrong for a drawing that carries information.

A data-driven canvas fails three ways under that contract. It is never given a
box, so dropped into a layout primitive it measures 0×0 and paints nothing —
a blank box rather than a wrong one, which is why it goes unnoticed. It has no
way to be repainted, so the loop that saves a decoration's battery freezes a
diagram after one frame: a refetch, a locale switch or a theme flip never
arrives. And it must not take the pointer, when a node is exactly a thing to
click and hover.

`useCanvasSurface` is the sibling composable: it sizes the backing store from
the element at the device ratio, repaints on `requestRedraw()` coalesced to one
frame, and converts an event into the same CSS pixel space the draw callback
paints in, so hit-testing stops being arithmetic every consumer rewrites.
`TCanvasSurface` wraps it into a component that owns the box (`height`), carries
the affordance a stylesheet cannot know about (`cursor`, bound to whatever the
hit-test just decided), repaints on `redrawKey`, and takes the accessible form
of the drawing in its default slot — markup inside the `<canvas>` element, which
the browser exposes and never paints.

Where the nodes go is not part of this. A dependency graph, a state machine and
a floor plan disagree about layout, and that disagreement belongs to the
product: the library owns the surface and its lifecycle.
