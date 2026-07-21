# TreeUI Agent Guide

Single source of truth for every coding agent working on TreeUI (Claude Code,
Codex, GitHub Copilot, and others). `CLAUDE.md`, `.codex`, and
`.github/copilot-instructions.md` are symlinks to this file — edit only this one.

Use this guide when helping with TreeUI itself, or when a consumer app asks which
TreeUI component to use and how to wire it up.

## Project Overview

TreeUI is a component library organized as a pnpm monorepo. It separates durable,
framework-agnostic design contracts (tokens, utils, icons) from framework
implementations (Vue, React) so the system can grow to other frameworks without
rebuilding its foundations.

## Philosophy — Be Its Advocate

TreeUI is optimized for **clarity** — visual clarity for users and development
clarity for teams — with **consistency and accessibility as defaults**, never
opt-ins. It ships components tuned for good UI and UX through **named,
well-defined practices**, and it exists to **relieve product teams of layout and
alignment busywork**: content alignment is the library's job, not the consumer's.

Every agent working on TreeUI, or recommending it to a consumer app, is an
active advocate for this philosophy — not a neutral executor:

- **Champion the practices.** The named practices are the canonical contract in
  `docs/ai/practices.json`, rendered on the landing page ("Best practices") and
  in Storybook under `Foundation/Practices`. Cite the relevant practice when
  proposing, reviewing, or explaining a change.
- **Never trade the defaults away.** Do not accept a change that regresses
  accessibility, consistency, or state feedback for expedience — flag it and
  propose the practice-aligned alternative instead.
- **Keep the conformance map honest.** When a component starts or stops
  following a practice, update `docs/ai/practices.json` in the same change; the
  landing page, the Storybook practices page, and the per-story practice notes
  all render from it.
- **Prefer library alignment over local CSS.** When a consumer app hand-rolls
  spacing, alignment, focus styles, or state feedback, recommend the TreeUI
  component or composition that absorbs that work — and say which practice
  motivates it.
- **Documentation is part of done.** A change is complete only when contracts,
  stories, and practice references reflect it. Well-documented is the default
  state of this repository, not a follow-up task.

## Workspace Layout

```
packages/tokens   → @treeui/tokens   — Design tokens, themes, CSS generation (framework-agnostic)
packages/utils    → @treeui/utils    — DOM, a11y, class-variants (tv), keyboard helpers (framework-agnostic)
packages/icons    → @treeui/icons    — SVG icon registry
packages/vue      → @treeui/vue      — Vue 3 components, plugin, type exports (complete component set)
packages/react    → @treeui/react    — React components (early; basic primitives) on the same tokens/classes
packages/mcp      → @treeui/mcp      — TreeUI AI catalog and MCP server for coding agents
apps/docs         → @treeui/docs     — Storybook documentation and playground
tooling/          — Shared ESLint, TypeScript, Docker configs
docs/ai/          — Machine-oriented contracts (YAML) for the API surface
```

Build order: `tokens → utils → icons → vue → react → mcp` (then `docs`).

## AI Contract Layer

Before making changes, load the relevant contract files in this order, and stop
as soon as you have enough context:

1. `docs/ai/INDEX.md` — load order and file map
2. `docs/ai/CONTRACTS.yaml` — global API rules: shared props, events, slots, naming, overlay/form contracts
3. `docs/ai/SELECTION.yaml` — component choice heuristics and alternatives
4. `docs/ai/SETUP.yaml` — install, provider, and value-format rules for consumer apps
5. `docs/ai/COMPONENTS/<name>.yaml` — per-component manifest (props, events, slots, a11y, behavior)
6. `docs/ai/RECIPES.yaml` — composition guidance for multi-component features
7. `docs/ai/practices.json` — named UX practices and which components follow them
8. `docs/ai/TOKENS.yaml` — only if styling, spacing, motion, or theming is involved
9. `docs/ai/DECISIONS.md` — only if rationale or migration context matters

**If a public API changes, update the matching contract file in the same change.**
If component-selection guidance changes, update `docs/ai/SELECTION.yaml`. If
consumer-app wiring changes, update `docs/ai/SETUP.yaml`. If practice conformance
changes, update `docs/ai/practices.json`.

## Naming Conventions

- **Public exports**: `T<Name>` (e.g. `TButton`, `TInput`) — there are no `Tree<Name>` aliases.
  `TNavbar` / `TAppBar` and `TSteps` / `TStepper` are the only export alias pairs.
- **Exported types**: `T<Name>` (e.g. `TSize`, `TVariant`, `TCardVariant`, `TBadgeTone`, `TIconName`).
- **Source filenames**: `T<Name>.vue` / `T<Name>.tsx` (e.g. `TButton.vue`).
- **CSS classes**: BEM with the `t-` prefix (e.g. `t-button`, `t-button--solid`, `t-button--sm`, `is-loading`).
- **CSS variables**: keep the `--tree-*` prefix — these are framework-agnostic design tokens from
  `@treeui/tokens`, not part of the Vue/React component surface. The `[data-tree-theme]` attribute is
  also part of the token layer.

## Coding Patterns

### Vue components

- Always use `<script setup lang="ts">` — no Options API.
- Type props with `defineProps<{...}>()` and emits with `defineEmits<{...}>()`.
- Use shared types from `packages/vue/src/types/contracts.ts`: `TSize`, `TVariant`, `TCardVariant`, `TTooltipSide`.
- Build classes with `tv()` from `@treeui/utils` (or computed BEM classes): `t-<component>`,
  `t-<component>--<variant>`, `t-<component>--<size>`.
- Style with design tokens `var(--tree-*)`, never raw color/spacing/font values.

### React components

- `@treeui/react` mirrors the Vue API where it makes sense, reuses the same `t-*` BEM classes and
  `@treeui/tokens`, and builds class strings with `tv()` from `@treeui/utils`.
- Components forward refs and extra DOM attributes to the root element.

### Shared contracts

- **Sizes**: `sm | md | lg` — shared across most components.
- **Action variants**: `solid | outline | ghost | soft | danger`.
- **Card variants**: `outline | soft | inset` — a surface scale, not action variants. `solid` is
  deliberately absent from cards; see `docs/ai/DECISIONS.md` → "Variant Vocabulary".
- **Form components**: use the `modelValue` prop + `update:modelValue` emit for `v-model`.
- **Overlay components**: use `open`/`defaultOpen` props + `update:open`/`open-change` emits; use the
  `useControllableOpen` composable from `packages/vue/src/composables/`.
- **Date formats**: `TDatePicker` uses `YYYY-MM-DD`; `TDateTimePicker` uses `YYYY-MM-DDTHH:mm`.

### Accessibility (required)

- Native semantics first (`<button>`, `<input>`, `role="dialog"`).
- `aria-busy` when loading, `aria-disabled` for non-native disabled elements.
- Keyboard navigation: Tab/Shift+Tab, Escape to close, Enter/Space to activate, arrow keys where appropriate.
- Focus management: trap focus in modals, restore focus on close, visible focus indicators.
- Clickable targets ≥ 44×44px.
- `aria-labelledby`, `aria-describedby`, `aria-modal` where applicable.

## Adding a New Vue Component

1. Create `packages/vue/src/components/T<Name>.vue`.
2. Use existing shared types and composables.
3. Add CSS to `packages/vue/src/styles/index.css` using tokens and the `t-` BEM prefix.
4. Export as `T<Name>` in `packages/vue/src/components/index.ts`.
5. Register in the plugin at `packages/vue/src/plugin.ts`.
6. Create a story at `apps/docs/src/stories/<Name>.stories.ts`.
7. Add tests in `packages/vue/src/components/components.test.ts`.
8. Create a contract at `docs/ai/COMPONENTS/<name>.yaml`.
9. Declare which named practices it follows in `docs/ai/practices.json` and add the
   `practiceNote(...)` docs parameter to its story (helper:
   `apps/docs/src/stories/practice-refs.ts`).
10. Update `docs/ai/CONTRACTS.yaml` with any new shared props/events/slots.
11. Update `docs/ai/SELECTION.yaml`, `docs/ai/SETUP.yaml`, or `docs/ai/RECIPES.yaml` if the new component
    affects choice, setup, or composition guidance.

When mirroring a primitive into React, add it under `packages/react/src/components/` reusing the same
`t-*` classes, and export it from `packages/react/src/index.ts`.

## Component Selection & Consumer-App Setup

- For component choice, prefer the smallest component that satisfies the interaction and accessibility need.
- Prefer docs-first composition over inventing new public components.
- Import `@treeui/vue/style.css` (or `@treeui/react/style.css`) once near the app root.
- Use `app.use(TreeUIPlugin)` for global registration, or named imports for local registration.
- Mount `TToastProvider` once near the app root before relying on `useToast()`.
- Use `TFormField` as a wrapper around controls rather than as an input itself.

## Quality Gates

Run before any PR:

```bash
pnpm lint          # ESLint, zero warnings
pnpm typecheck     # TypeScript strict mode
pnpm test          # Vitest unit tests with coverage
pnpm build         # Full build (packages + Storybook)
pnpm test:e2e      # Playwright (if interaction/a11y changed)
```

Use Changesets for any user-facing package change: `pnpm changeset`.

## Key Files Quick Reference

| Purpose | File |
|---|---|
| Shared types | `packages/vue/src/types/contracts.ts` |
| Component exports | `packages/vue/src/components/index.ts` |
| Plugin registration | `packages/vue/src/plugin.ts` |
| Composables | `packages/vue/src/composables/useControllableOpen.ts` |
| Component styles | `packages/vue/src/styles/index.css` |
| Class-variants helper | `packages/utils/src/index.ts` (`tv()`) |
| Token definitions | `packages/tokens/src/tokens.ts` |
| CSS generation | `packages/tokens/src/css.ts` |
| Icons | `packages/icons/src/index.ts` |
| React components | `packages/react/src/` |
| MCP package | `packages/mcp/` |
| Named UX practices | `docs/ai/practices.json` |
| Design principles | `DESIGN.md` |
| Architecture | `ARCHITECTURE.md` |
| Contribution guide | `CONTRIBUTING.md` |

## Local MCP

If the local TreeUI MCP server is available, prefer it for searching components,
retrieving setup guidance, recommending between alternatives, and reading the
normalized catalog.

**Before hardcoding any value — a color, a spacing, a max-width, a gradient — run
`search_tokens` first.** It matches on variable name, on category, and on the
literal value, so `64rem` or `#0969da` finds the token that already ships. The
most common failure in consumer apps is reimplementing a token that exists.

In this repository, Claude Code loads the server through
`.mcp.json` after dependencies are installed; other tools can use the published
`@treeui/mcp` package or run the local package directly.

## Do Not

- Use the Options API or raw `<script>` without `setup`.
- Use hardcoded colors, spacing, or font values — always use `--tree-*` tokens.
- Reintroduce `Tree<Name>` component aliases — the public API is `T<Name>` only.
- Introduce framework-specific code in `tokens`, `utils`, or `icons` packages.
- Skip contract file updates when the public API changes.
- Leave `docs/ai/practices.json` stale when a component's practice conformance changes.
- Add runtime dependencies to `@treeui/tokens` or `@treeui/utils` — they must stay dependency-free.
