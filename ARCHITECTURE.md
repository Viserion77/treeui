# TreeUI Architecture

TreeUI separates durable design contracts from framework-specific implementation so the system can grow to other frameworks without rebuilding its foundations.

## Package Responsibilities

The full workspace map lives in [README.md](./README.md#workspace-layout). What matters for the boundary:

- `@treeui/tokens` and `@treeui/utils` are framework-agnostic and dependency-free
- `@treeui/tokens` is also where the token model is RENDERED for each target: `css.ts` writes custom
  properties, `kotlin.ts` and `rust.ts` write source for the two non-web ports. A renderer is not a
  framework dependency — it emits text and imports nothing
- `@treeui/icons` is the shared icon registry and defaults, but is Vue-coupled today — see `docs/ai/DECISIONS.md` → "Portability Boundary"
- `@treeui/vue` and `@treeui/react` are per-framework implementations of the same contracts, tokens, and `t-*` classes
- `packages/compose` and `packages/egui` are the Kotlin/Android and Rust/desktop ports. They have no
  CSS to share, so what they reproduce is the token model, the closed vocabularies, the interaction
  shape and the accessibility floor
- `@treeui/mcp` exposes those contracts to coding agents

## System Boundaries

The following stay framework-agnostic:

- Theme and token structure, including the resolved form the non-web ports consume
- The closed vocabularies — sizes, variants, tones, accents, field widths, placements — which live in
  `@treeui/tokens/vocabulary.ts` and are re-exported, never re-declared
- Naming conventions
- Accessibility guidance
- Interaction contracts, including which colour a state resolves to (`NATIVE_TONES`)
- Core utilities where possible

The following live in each framework package:

- Component rendering implementation
- Content projection: Vue slots, React children, Compose trailing lambdas, egui closures
- Event declarations: Vue `emits`, React callback props, Compose `onClick`, egui's returned `Response`
- Framework reactivity: Vue refs, React state, Compose `CompositionLocal`, egui's per-frame `Context`
- The CSS class layer (`t-*`). It is a web implementation detail, not a contract — Compose and egui
  reproduce the same decisions with no classes at all

## Canonical Contracts

The contract layer and its load order are defined in [docs/ai/INDEX.md](./docs/ai/INDEX.md).

If public behavior changes, update the matching contract file in the same change.

## Documentation Surface

- The landing page plus one Storybook per framework are the human-facing explanation layer and playground
- `docs/ai` is the compact contract layer for automation and tooling
- Root markdown files explain the repository structure and maintenance workflow
