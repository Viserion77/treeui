---
'@treeui/vue': minor
'@treeui/icons': minor
---

Add `TFlag` and `TLanguageSelect` for language and locale selection, plus a
`languages` icon in `@treeui/icons`.

- `TFlag` renders a country flag from an ISO 3166-1 alpha-2 code. Assets load from
  `https://flagcdn.com` by default; `baseUrl` repoints the component at a mirror, so
  self-hosting later is a configuration change rather than a breaking one. The path
  template is part of the public contract and is documented in `SETUP.yaml`.
- Flags use the CDN's fixed-height endpoints, which serve flat artwork at each flag's
  true proportions. The CDN does offer ratio-normalised endpoints, but it normalises
  only by switching to waving artwork, which reads as decoration beside flat UI icons.
  A shared height is what actually aligns a column of flags; the varying widths are
  absorbed by a fixed 3:2 box in CSS, so Nepal stays a pennant and Switzerland stays
  square without knocking the labels out of line.
- When the image cannot load — an unknown code, a strict `img-src` policy, an offline
  client — `TFlag` falls back to the uppercased country code instead of an empty box,
  and retries once the resolved source changes.
- `TLanguageSelect` reuses the listbox, keyboard and overlay behaviour of `TSelect`,
  adding a flag and an optional description per option. Options carry an optional
  `code`: flags are an imprecise proxy for languages (Spanish is not Spain, English is
  not the US), so a language with no defensible flag simply renders without one.
- Two variants. `field` is a form control and leads with the flag, since a form label
  already says what it is. `switcher` is a page-level control for a navbar, where
  nothing nearby explains it: a translate icon opens the row and the current flag
  closes it, so the control reads as "page language, now set to this" on its own.
  `iconOnly` drops the language name for a tight bar.
- Neither component ships locale data. The application owns its language list and all
  locale side effects; the control only emits the chosen value.

Follow-up worth doing separately: `TLanguageSelect` currently forks `TSelect`'s listbox
navigation rather than sharing it. Extracting a `useListboxNavigation` composable would
remove the duplication, but it rewrites `TSelect`'s internals and is better done as its
own change with its own regression run.
