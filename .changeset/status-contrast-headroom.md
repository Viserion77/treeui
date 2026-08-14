---
'@treeui/tokens': minor
---

Give the status hues headroom on the surface they actually land on.

The colour contract already holds every status hue at 4.5:1 on all three
surfaces, and every one of them passed — but three passed by hundredths, and one
by `0.0008`. A pass that thin is a coincidence, not a margin: two correct
implementations of WCAG 2.x disagree about it, and the answer depends on
rounding, so a product measuring the same token can reasonably report a failure.

The band that decides this is `bg-subtle`, because that is where a status line
usually falls — inside a card, under a field — and it is the one a hue
calibrated against the primary surface clears last. `success` and `warning` in
light, `success` and `warning` in dark, each moved one step; the shipped hue is
unchanged to the eye and now clears the floor with room.

`status.test.ts` pins the margin so it stays a margin. The floor stays where it
was, in the contract validator.
