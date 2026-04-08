# @treeui/vue

Vue 3 component library with 40+ accessible, themeable components built on design tokens.

## Install

```bash
pnpm add @treeui/vue
# or
npm install @treeui/vue
```

## Setup

```ts
import { createApp } from 'vue'
import TreeUI from '@treeui/vue'
import '@treeui/vue/style.css'

const app = createApp(App)
app.use(TreeUI)
app.mount('#app')
```

Or import components individually:

```ts
import { TButton, TInput, TModal } from '@treeui/vue'
import '@treeui/vue/style.css'
```

## Components

### Form

`TInput` · `TTextarea` · `TCheckbox` · `TCombobox` · `TFileUpload` · `TRadio` · `TRadioGroup` · `TSelect` · `TMultiSelect` · `TNumberInput` · `TDatePicker` · `TDateTimePicker` · `TSwitch` · `TFormField` · `TToggleGroup` · `TMarkdownEditor`

### Layout

`TContainer` · `TGrid` · `TStack` · `TSidebar` · `TNavMenu` · `TNavbar` / `TAppBar` · `TAccordion` · `TAccordionItem` · `TCard` · `TDivider` · `TTable` · `TTabs` · `TTabList` · `TTab` · `TTabPanel` · `TBreadcrumb` · `TBreadcrumbItem` · `TSelectableList` · `TTreeView` · `TSteps` / `TStepper` · `TPricing` · `TPricingCard`

### Display

`TBadge` · `TAlert` · `TAvatar` · `TEmptyState` · `TTag` · `TTimeline` · `TSpinner` · `TProgress` · `TSkeleton` · `TStat`

### Overlay & Interaction

`TButton` · `TModal` · `TConfirmDialog` · `TDrawer` · `TDropdown` · `TPopover` · `TTooltip` · `TContextMenu` · `TPagination` · `TToast` · `TToastProvider`

### Table composition

`TTable` stays focused on structured listing. Filters, toolbars, bulk actions, and pagination are intended to be composed around it, with `TPagination` used separately when needed.

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

## Compatibility aliases

All components are also exported with the `Tree` prefix (e.g. `TreeButton`, `TreeInput`) for backwards compatibility.

## Conventions

- Primary docs and examples use the `T` prefix for public exports.
- `Tree<Name>` aliases remain available for migration and compatibility.
- `TNavbar` / `TAppBar` and `TSteps` / `TStepper` are alias pairs for the same implementations.
- Page-level assemblies that are mostly layout stay documented as recipes until they need a dedicated semantic API.

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

## TypeScript

Full TypeScript support with exported types:

```ts
import type { TreeSize, TreeVariant } from '@treeui/vue'
```

## Documentation

See the full component docs and interactive playground at the [Storybook site](https://viserion77.github.io/treeui/).

## License

MIT
