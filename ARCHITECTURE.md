# TreeUI Architecture

TreeUI separates durable design contracts from framework-specific implementation so the system can grow beyond Vue without rebuilding its foundations.

## Package Responsibilities

- `@treeui/tokens`: canonical token source, theme values, and generated CSS outputs
- `@treeui/utils`: shared DOM and accessibility helpers that can stay framework-agnostic
- `@treeui/icons`: shared icon registry and defaults
- `@treeui/vue`: Vue components, exports, and plugin integration
- `@treeui/docs`: Storybook docs and playground

## System Boundaries

The following stay framework-agnostic:

- Theme and token structure
- Naming conventions, variants, and sizes
- Accessibility guidance
- Interaction contracts
- Core utilities where possible

The following stay Vue-specific:

- Component rendering implementation
- Slots and `v-model`
- `emits` declarations
- Vue refs and reactivity

## Canonical Contracts

- `docs/ai/CONTRACTS.yaml`: global public API rules and shared component conventions
- `docs/ai/TOKENS.yaml`: framework-agnostic visual contract and theme data
- `docs/ai/COMPONENTS/*.yaml`: component-level public API manifests

If public behavior changes, update the matching contract file in the same change.

## Documentation Surface

- Storybook is the human-facing explanation layer and playground
- `docs/ai` is the compact contract layer for automation and tooling
- Root markdown files explain the repository structure and maintenance workflow
