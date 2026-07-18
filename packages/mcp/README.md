# @treeui/mcp

TreeUI ships a local Model Context Protocol server so coding agents can:

- search the TreeUI component catalog
- retrieve setup guidance for consumers
- compare similar components such as `TSelect` vs `TCombobox`
- look up `--tree-*` design tokens before hardcoding a value
- read normalized machine-oriented metadata generated from `docs/ai`

## What it serves

- a generated catalog built from `docs/ai/*.yaml` and `@treeui/tokens`
- MCP resources for catalog, setup, selection, recipes, tokens, and per-component metadata
- MCP tools for search, recommendation, setup lookup, recipe search, and token search

## Token search

`search_tokens` matches a query against the CSS variable, the token
category/path, and the value the token actually ships, so a literal found in
consumer code resolves back to the token that already provides it:

```
search_tokens("space")               -> --tree-space-0 … --tree-space-16
search_tokens("status")              -> --tree-color-status-success | warning | error | info
search_tokens("#0969da")             -> --tree-color-brand-primary (light #0969da | dark #539bf5)
search_tokens("64rem")               -> --tree-breakpoint-lg (1024px)
search_tokens("--tree-gradient-brand") -> --tree-gradient-brand
```

Themed tokens report every theme value, and `rem`/`px` length queries are
matched in both units.

The token entries are derived from `treeTokens`/`treeThemes` in
`@treeui/tokens` using the same path-to-variable-name rule as
`packages/tokens/src/css.ts`, so they cannot drift from the shipped stylesheet.
`catalog.test.ts` enforces that by diffing the emitted variables and values
against `createFoundationCss()` and `createThemeCss()`.

## Local usage in this repository

```bash
pnpm --filter @treeui/mcp start
```

Claude Code can also pick it up automatically through the repository `.mcp.json`.

## Build

```bash
pnpm --filter @treeui/mcp build
```

That command regenerates:

- `docs/ai/treeui.catalog.json`
- `packages/mcp/src/generated/treeui.catalog.json`

## Tests

```bash
pnpm --filter @treeui/mcp test
```

The MCP integration test uses the SDK in-memory transport to validate the
protocol surface itself: tool listing, resource listing, tool calls, and
resource reads.

For release validation, also run a quick stdio smoke test against the compiled
CLI with `pnpm --filter @treeui/mcp build` followed by `node packages/mcp/dist/cli.js`.

## Published package usage

Once published, consumers can add it as a stdio MCP server, for example:

```bash
claude mcp add --transport stdio treeui -- npx -y @treeui/mcp
```

Exact commands differ by client, but the package is intended to be usable as a local stdio server across coding agents that support MCP.
