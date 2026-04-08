# TreeUI Agent Guide

Use this file when an agent is helping with TreeUI itself or when a consumer app asks which TreeUI component to use.

## Preferred Context Load Order

1. `docs/ai/INDEX.md`
2. `docs/ai/CONTRACTS.yaml`
3. `docs/ai/SELECTION.yaml` for component choice
4. `docs/ai/SETUP.yaml` for install and provider wiring
5. Relevant files in `docs/ai/COMPONENTS/`
6. `docs/ai/RECIPES.yaml` for multi-component composition
7. `docs/ai/TOKENS.yaml` only when styling matters

Stop loading as soon as you have enough context.

## TreeUI Rules

- Prefer `T<Name>` exports in all new code.
- Treat `Tree<Name>` aliases as compatibility-only.
- Keep API changes in sync with `docs/ai`.
- For component choice, prefer the smallest component that satisfies the interaction and accessibility requirement.
- Prefer docs-first composition over inventing new public components.

## Consumer-App Setup Rules

- Import `@treeui/vue/style.css` once.
- Use `app.use(TreeUIPlugin)` for global registration or named imports for local registration.
- Mount `TToastProvider` once near the app root before relying on `useToast()`.
- Use `TFormField` as a wrapper around controls rather than as an input itself.
- Use `YYYY-MM-DD` for `TDatePicker` values and `YYYY-MM-DDTHH:mm` for `TDateTimePicker` values.

## Local MCP

If the local TreeUI MCP server is available, prefer it for:

- searching components
- retrieving setup guidance
- recommending between alternatives
- reading the normalized catalog

In this repository, Claude Code can load the server through `.mcp.json`. Other tools can use the published `@treeui/mcp` package or run the local package directly.
