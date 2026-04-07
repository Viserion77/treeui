# TreeUI — Copilot Instructions

## Project Overview

TreeUI is a Vue 3 component library organized as a pnpm monorepo. It separates durable design contracts (tokens, utils, icons) from framework-specific implementation (Vue components) so the system can grow to other frameworks without rebuilding its foundations.

## Workspace Layout

```
packages/tokens   → @treeui/tokens   — Design tokens, themes, CSS generation (framework-agnostic)
packages/utils    → @treeui/utils    — DOM, a11y, date, keyboard helpers (framework-agnostic)
packages/icons    → @treeui/icons    — SVG icon registry as Vue components
packages/vue      → @treeui/vue      — Vue 3 components, plugin, type exports
apps/docs         → @treeui/docs     — Storybook documentation and playground
tooling/          — Shared ESLint, TypeScript, Docker configs
docs/ai/          — Machine-oriented contracts (YAML) for API surface
```

Build order: `tokens → utils → icons → vue → docs`

## AI Contract Layer

Before making changes, load the relevant contract files in this order (stop when you have enough context):

1. `docs/ai/INDEX.md` — load order and file map
2. `docs/ai/CONTRACTS.yaml` — global API rules: shared props, events, slots, naming, overlay/form contracts
3. `docs/ai/COMPONENTS/<name>.yaml` — per-component manifest (props, events, slots, a11y, behavior)
4. `docs/ai/TOKENS.yaml` — only if styling, spacing, motion, or theming is involved
5. `docs/ai/DECISIONS.md` — only if rationale or migration context matters

**If a public API changes, update the matching contract file in the same changeset.**

## Naming Conventions

- **Public exports**: `T<Name>` (e.g. `TButton`, `TInput`) — primary direction
- **Compatibility aliases**: `Tree<Name>` (e.g. `TreeButton`) — still exported, do not remove
- **Source filenames**: `Tree<Name>.vue` (e.g. `TreeButton.vue`)
- **CSS classes**: BEM with `tree-` prefix (e.g. `tree-button`, `tree-button--solid`, `tree-button--sm`, `is-loading`)
- **CSS variables**: `--tree-*` (semantic tokens from `@treeui/tokens`)

## Coding Patterns

### Components

- Always use `<script setup lang="ts">` — no Options API
- Type props with `defineProps<{...}>()` and emits with `defineEmits<{...}>()`
- Use shared types from `packages/vue/src/types/contracts.ts`: `TreeSize`, `TreeVariant`, `TreeCardVariant`, `TreeTooltipSide`
- Style with design tokens `var(--tree-*)`, never raw color/spacing values
- Use computed classes following BEM: `tree-<component>`, `tree-<component>--<variant>`, `tree-<component>--<size>`

### Shared Contracts

- **Sizes**: `sm | md | lg` — shared across most components
- **Action variants**: `solid | outline | ghost | soft | danger`
- **Card variants**: `outline | soft | solid`
- **Form components**: use `modelValue` prop + `update:modelValue` emit for `v-model`
- **Overlay components**: use `open`/`defaultOpen` props + `update:open`/`open-change` emits; use the `useControllableOpen` composable from `packages/vue/src/composables/`

### Accessibility (required)

- Native semantics first (`<button>`, `<input>`, `role="dialog"`)
- `aria-busy` when loading, `aria-disabled` for non-native disabled elements
- Keyboard navigation: Tab/Shift+Tab, Escape to close, Enter/Space to activate, arrow keys where appropriate
- Focus management: trap focus in modals, restore focus on close, visible focus indicators
- Clickable targets ≥ 44×44px
- `aria-labelledby`, `aria-describedby`, `aria-modal` where applicable

## Adding a New Component

1. Create `packages/vue/src/components/Tree<Name>.vue`
2. Use existing shared types and composables
3. Add CSS to `packages/vue/src/styles/index.css` using tokens
4. Export as `T<Name>` + `Tree<Name>` alias in `packages/vue/src/components/index.ts`
5. Register in plugin at `packages/vue/src/plugin.ts`
6. Create story at `apps/docs/src/stories/<Name>.stories.ts`
7. Add tests in `packages/vue/src/components/components.test.ts`
8. Create contract at `docs/ai/COMPONENTS/<name>.yaml`
9. Update `docs/ai/CONTRACTS.yaml` with any new shared props/events/slots

## Quality Gates

Run before any PR:

```bash
pnpm lint          # ESLint, zero warnings
pnpm typecheck     # TypeScript strict mode
pnpm test          # Vitest unit tests with coverage
pnpm build         # Full build (packages + Storybook)
pnpm test:e2e      # Playwright (if interaction/a11y changed)
```

## Key Files Quick Reference

| Purpose | File |
|---|---|
| Shared types | `packages/vue/src/types/contracts.ts` |
| Component exports | `packages/vue/src/components/index.ts` |
| Plugin registration | `packages/vue/src/plugin.ts` |
| Composables | `packages/vue/src/composables/useControllableOpen.ts` |
| Component styles | `packages/vue/src/styles/index.css` |
| Token definitions | `packages/tokens/src/tokens.ts` |
| CSS generation | `packages/tokens/src/css.ts` |
| Utilities | `packages/utils/src/index.ts` |
| Icons | `packages/icons/src/index.ts` |
| Design principles | `DESIGN.md` |
| Architecture | `ARCHITECTURE.md` |
| Contribution guide | `CONTRIBUTING.md` |

## Do Not

- Use Options API or raw `<script>` without `setup`
- Use hardcoded colors, spacing, or font values — always use `--tree-*` tokens
- Remove `Tree<Name>` compatibility aliases
- Introduce framework-specific code in `tokens`, `utils`, or `icons` packages
- Skip contract file updates when public API changes
- Add dependencies to `@treeui/tokens` or `@treeui/utils` — they must stay dependency-free
