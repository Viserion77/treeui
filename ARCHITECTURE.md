# TreeUI Architecture

TreeUI separates durable design contracts from framework-specific implementation so the system can grow to other frameworks without rebuilding its foundations.

## Package Responsibilities

The full workspace map lives in [README.md](./README.md#workspace-layout). What matters for the boundary:

- `@treeui/tokens` and `@treeui/utils` are framework-agnostic and dependency-free
- `@treeui/icons` is the shared icon registry and defaults, but is Vue-coupled today — see `docs/ai/DECISIONS.md` → "Portability Boundary"
- `@treeui/vue` and `@treeui/react` are per-framework implementations of the same contracts, tokens, and `t-*` classes
- `@treeui/mcp` exposes those contracts to coding agents

## System Boundaries

The following stay framework-agnostic:

- Theme and token structure
- Naming conventions, variants, and sizes
- Accessibility guidance
- Interaction contracts
- Core utilities where possible

The following live in each framework package:

- Component rendering implementation
- Content projection: Vue slots, React children
- Event declarations: Vue `emits`, React callback props
- Framework reactivity: Vue refs, React state

## Canonical Contracts

The contract layer and its load order are defined in [docs/ai/INDEX.md](./docs/ai/INDEX.md).

If public behavior changes, update the matching contract file in the same change.

## Documentation Surface

- The landing page plus one Storybook per framework are the human-facing explanation layer and playground
- `docs/ai` is the compact contract layer for automation and tooling
- Root markdown files explain the repository structure and maintenance workflow
