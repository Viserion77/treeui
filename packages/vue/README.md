# @treeui/vue

Vue 3 component library with 100+ accessible, themeable components built on design tokens.

## Install

```bash
pnpm add @treeui/vue
# or
npm install @treeui/vue
```

Install `@treeui/tokens` only when you need direct access to the token package or want to use the theme CSS outside the Vue component layer.

## Setup

```ts
import { createApp } from 'vue'
import { TreeUIPlugin } from '@treeui/vue'
import '@treeui/vue/style.css'

const app = createApp(App)
app.use(TreeUIPlugin)
app.mount('#app')
```

If your app uses toasts, mount `TToastProvider` once near the root before calling `useToast()`.

Or import components individually:

```ts
import { TButton, TInput, TModal } from '@treeui/vue'
import '@treeui/vue/style.css'
```

## Consumer checklist

- Install `@treeui/vue`
- Import `@treeui/vue/style.css` once
- Use `app.use(TreeUIPlugin)` or named imports
- Mount `TToastProvider` once near the app root if you use `useToast()`
- Use `TFormField` as the wrapper for labels, hints, and errors

## Components

100+ components across a handful of families, all sharing the same design
tokens, the `sm | md | lg` size scale, and the same action variants:

- **Forms & data entry** — text and selection inputs, date and time pickers, file upload, a markdown editor.
- **Layout & app shell** — containers, grids, stacks, sidebar and navigation shell, accordions, cards, tabs.
- **Data display & data-viz** — badges, tags, avatars, timelines, stats, and a lightweight, dependency-free chart set.
- **Overlays** — modals, drawers, dropdowns, popovers, tooltips, context menus, toasts.
- **Navigation** — breadcrumbs, pagination, steps, tree views, selectable lists.
- **Feedback** — alerts, progress, spinners, skeletons, empty states.

A hand-kept name-by-name list here would drift from what the package actually
ships — the generated **Foundation/Components** index in the published [Vue
Storybook](https://viserion77.github.io/treeui/vue/) is built from the same
catalog the library exports, so it cannot fall behind. For tooling and coding
agents, `docs/ai/CONTRACTS.yaml` → `primary_exports` is the machine-readable
list.

### Table composition

`TTable` stays focused on structured listing. Filters, toolbars, bulk actions, and pagination are intended to be composed around it, with `TPagination` used separately when needed.

Use `#cell-<key>` and `#header-<key>` slots when a column needs derived content or custom markup.

## Theming

TreeUI uses CSS custom properties (`--tree-*`) for all styling. Light theme is applied by default.

### Dark mode

Dark mode activates automatically via `prefers-color-scheme: dark`. To control it explicitly:

```html
<!-- Force dark -->
<html data-tree-theme="dark">

<!-- Force light -->
<html data-tree-theme="light">
```

### Programmatic control

```ts
// Toggle theme
document.documentElement.setAttribute('data-tree-theme', 'dark')
```

## Conventions

- All public exports use the `T` prefix.
- `TNavbar` / `TAppBar` and `TSteps` / `TStepper` are alias pairs for the same implementations.
- Page-level assemblies that are mostly layout stay documented as recipes until they need a dedicated semantic API.
- Overlays such as `TModal`, `TDrawer`, and `TPopover` support controlled open state; `TModal` works with `v-model:open`.
- `TSelect` accepts `string` or `number` values.
- `TBreadcrumbItem` accepts `href` for anchors and `to` for vue-router projects.
- `TBadge` keeps visual variants and can add semantic meaning with `tone`.
- `TStat` includes a `loading` state for built-in placeholders.

## Semantic aliases in docs

Some docs use familiar product terms as aliases for existing TreeUI patterns. These are documentation aliases only, not extra exports.

- `Snackbar` / `Notification` -> `TToast`
- `Banner` -> `TAlert`
- `Collapsible` / `Details` -> `TAccordion` with `type="single"` and `collapsible`
- `App bar` -> `TNavbar` / `TAppBar`
- `Stepper` -> `TSteps` / `TStepper`

## Docs-first patterns

Some repeated app UI intentionally stays documented as composition guidance instead of becoming extra exports:

- Stat groups: `TGrid` + `TStat`
- Section headers: heading + `TStack` + optional `TBadge` or `TButton`
- Subpanels: `TCard`, especially `variant="soft"`
- Stacked cards: `TCard` slots + `TTag` / `TBadge` / actions
- Eyebrow text: typography recipe using existing tokens
- Form stacks: `TStack` + `TGrid` + `TFormField`
- Rankings: `TTable` or `TSelectableList`
- Action panels: `TAlert` + `TCard` + `TButton`
- Color fields: `TFormField` + native `input[type="color"]`
- Tag inputs: `TFormField` + `TInput` + removable `TTag`
- Router-backed tabs: `TTabs` + app route state
- Charts: `TChart` / `TSparkline` / `TDonutChart` (native, no chart library) — frame them in `TCard` + `TStack` when a titled surface is wanted

## TypeScript

Full TypeScript support with exported types:

```ts
import type { TSize, TVariant } from '@treeui/vue'
```

## Documentation

See the full component docs and interactive playground at the [Vue Storybook](https://viserion77.github.io/treeui/vue/).

## License

MIT
