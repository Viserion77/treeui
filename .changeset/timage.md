---
"@treeui/vue": minor
---

Add `TImage` — a content-image primitive (TREEUX-017).

Renders a native `<img>` with token-driven corners (`radius`: none/sm/md/lg/pill), `object-fit` (`fit`: cover/contain), optional `ratio` (CSS aspect-ratio), lazy loading by default, and a **required** `alt` so an unnamed content image can't ship by accident. Display only — it never fetches or transforms the source. Zoom/lightbox is deliberately not built in: compose `TImage` inside `TModal` (recipe `image-zoom`), keeping the trigger a product decision.
