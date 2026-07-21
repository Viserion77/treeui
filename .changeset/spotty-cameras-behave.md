---
'@treeui/mcp': minor
'@treeui/landing': minor
---

Add the named TreeUI practices as a first-class contract and refresh the landing page around them. `docs/ai/practices.json` is the canonical source for the philosophy statement and the six named UX practices, each with rules, an icon, and per-component conformance. The MCP catalog now carries a top-level `practices` section, per-component `practices` ids, a `treeui://practices` resource, and practice ids in component summaries. Storybook gains a `Foundation/Practices` page plus per-story practice notes rendered from the same data. The landing page gains a "Best practices" section linking each practice to the components that follow it, i18n (English, Portuguese, Spanish) via `TLanguageSelect`, a persistent light/dark toggle via `useTheme`, hero CTAs, and an install snippet with copy feedback.
