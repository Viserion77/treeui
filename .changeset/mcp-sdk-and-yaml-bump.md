---
'@treeui/mcp': patch
---

`@treeui/mcp` picks up `@modelcontextprotocol/sdk` `^1.30.1` (from `^1.17.4`) and `yaml` `^2.9.1` (from `^2.9.0`).

Both are runtime dependencies of the published package, so the bump only reaches a consumer through a release. Without this, the repository and the registry disagree while claiming the same version: `main` declares `^1.30.1` and the published `0.8.0` declares `^1.17.4`, so `npm i @treeui/mcp` installs the old SDK range.

The thirteen-minor SDK jump was verified against the real server rather than only through the unit suite: `initialize` completes on protocol `2024-11-05` and `tools/list` returns all six tools (`search_components`, `recommend_components`, `get_component`, `get_setup_guide`, `search_recipes`, `search_tokens`). No API the server uses changed shape.
