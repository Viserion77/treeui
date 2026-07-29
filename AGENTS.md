# TreeUI Agent Guide

Single source of truth for every coding agent working on TreeUI (Claude Code,
Codex, GitHub Copilot, and others). `CLAUDE.md`, `.codex`, and
`.github/copilot-instructions.md` are symlinks to this file — edit only this one.

Use this guide when helping with TreeUI itself, or when a consumer app asks which
TreeUI component to use and how to wire it up.

## Project Overview

TreeUI is a component library organized as a pnpm monorepo. It separates durable,
framework-agnostic design contracts (tokens, utils) from framework
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

The authoritative workspace map is in [README.md](./README.md#workspace-layout) —
eleven packages, including `apps/docs-react`, `apps/landing`, and the two
`examples/*` dashboards that `pnpm typecheck` and CI both build. Maturity differs:
`@treeui/vue` is the complete component set, `@treeui/react` is early (basic
primitives on the same tokens and `t-*` classes).

Build order: `tokens → utils → icons → vue → react → mcp` (then `apps/*` and `examples/*`).

## AI Contract Layer

Load [`docs/ai/INDEX.md`](./docs/ai/INDEX.md) first — it owns the canonical load
order and file map for the contract layer (contracts, selection, setup,
per-component manifests, recipes, practices, tokens, standards, validation,
decisions). Stop reading as soon as you have enough context.

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

Mirroring a primitive into React follows the same checklist, with these substitutions:
component in `packages/react/src/components/`, CSS in `packages/react/src/style.css`,
export from `packages/react/src/index.ts`, story in `apps/docs-react/src/stories/`,
test alongside the component. Note any deliberate API divergence from Vue in
`packages/react/README.md`.

## Component Selection & Consumer-App Setup

- For component choice, prefer the smallest component that satisfies the interaction and accessibility need.
- Prefer docs-first composition over inventing new public components.
- Import `@treeui/vue/style.css` (or `@treeui/react/style.css`) once near the app root.
- Use `app.use(TreeUIPlugin)` for global registration, or named imports for local registration.
- Mount `TToastProvider` once near the app root before relying on `useToast()`.
- Use `TFormField` as a wrapper around controls rather than as an input itself.

## Quality Gates

Run before any PR — [CONTRIBUTING.md](./CONTRIBUTING.md#before-opening-a-pull-request)
owns this list and its Docker equivalents:

```bash
pnpm lint          # ESLint, zero warnings
pnpm typecheck     # TypeScript strict mode across every workspace package
pnpm test          # Vitest unit tests with coverage
pnpm build:site    # what CI builds: packages + landing + both Storybooks + examples
pnpm test:e2e      # Playwright; optional locally, required in CI
```

`pnpm build` is the fast inner loop (packages + Vue Storybook only) and does not
cover the landing page, the React Storybook, or the examples.

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
| Contract layer index | `docs/ai/INDEX.md` |
| Design principles | `DESIGN.md` |
| Architecture | `ARCHITECTURE.md` |
| Contribution guide | `CONTRIBUTING.md` |
| Release and CI flow | `RELEASING.md` |

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
- Introduce framework-specific code in `tokens` or `utils`. (`icons` is Vue-coupled
  today — see `docs/ai/DECISIONS.md` → "Portability Boundary".)
- Skip contract file updates when the public API changes.
- Leave `docs/ai/practices.json` stale when a component's practice conformance changes.
- Add runtime dependencies to `@treeui/tokens` or `@treeui/utils` — they must stay dependency-free.
