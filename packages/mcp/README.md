# @treeui/mcp

TreeUI ships a local Model Context Protocol server so coding agents can:

- search the TreeUI component catalog
- retrieve setup guidance for consumers
- compare similar components such as `TSelect` vs `TCombobox`
- read normalized machine-oriented metadata generated from `docs/ai`

## What it serves

- a generated catalog built from `docs/ai/*.yaml`
- MCP resources for catalog, setup, selection, recipes, and per-component metadata
- MCP tools for search, recommendation, setup lookup, and recipe search

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
