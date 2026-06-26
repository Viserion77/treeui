---
"@treeui/utils": minor
---

Add `tv()`, a tiny class-variants helper. It maps a declarative variant config (`base` / `variants` / `defaultVariants` / `compoundVariants`) to a class string the way CVA does, but it only joins values — no Tailwind merge — so it fits TreeUI's BEM class convention. Exposes `ClassValue`, `TvConfig`, and `TvProps` types.
