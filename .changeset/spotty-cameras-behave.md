---
'@treeui/mcp': minor
'@treeui/landing': patch
---

Add the named TreeUI practices as a first-class contract. `docs/ai/practices.json` is the canonical source for the philosophy statement and the six named UX practices with per-component conformance. The MCP catalog now carries a top-level `practices` section, per-component `practices` ids, a `treeui://practices` resource, and practice ids in component summaries. The landing page gains a "Best practices" menu section linking each practice to the components that follow it, and Storybook gains a `Foundation/Practices` page plus per-story practice notes rendered from the same data.
