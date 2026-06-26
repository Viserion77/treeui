# TreeUI AI Decisions

This file explains why the contracts look the way they do. Exact prop names, event names, value formats, and token values live in `CONTRACTS.yaml`, `TOKENS.yaml`, and `COMPONENTS/*.yaml`.

## Naming

- `T<Name>` is the public naming for all components, exported types, and BEM CSS classes (`.t-button`)
- The earlier `Tree<Name>` export aliases and `Tree*.vue` source filenames were removed in favor of a single `T`-prefixed surface
- Design-token CSS variables keep the `--tree-*` prefix because they belong to the framework-agnostic token layer, not the Vue component surface

## Portability Boundary

- Tokens, variants, sizes, accessibility expectations, and interaction patterns stay framework-agnostic
- Vue-specific concerns stay inside `@treeui/vue` so future framework packages do not inherit Vue vocabulary

## Shared Interaction Shape

- Form-like components share one value model so the API feels predictable across inputs
- Overlay components share one open-state model so controlled and uncontrolled behavior stay consistent
- The exact field names are centralized in `CONTRACTS.yaml` so they are not copied across prose docs

## Documentation Strategy

- Storybook is the human-facing explanation layer
- `docs/ai` is the compact contract layer for tooling and automation
- Root markdown files explain repository structure and contributor workflow
- When public behavior changes, the matching contract files should change in the same patch
