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

`TInput` · `TTextarea` · `TCheckbox` · `TRadio` · `TRadioGroup` · `TSelect` · `TDatePicker` · `TSwitch` · `TFormField` · `TMarkdownEditor`

### Layout

`TAccordion` · `TAccordionItem` · `TCard` · `TDivider` · `TTable` · `TTabs` · `TTabList` · `TTab` · `TTabPanel` · `TBreadcrumb` · `TBreadcrumbItem` · `TPricing` · `TPricingCard`

### Display

`TBadge` · `TAlert` · `TAvatar` · `TTag` · `TSpinner` · `TProgress` · `TSkeleton`

### Overlay & Interaction

`TButton` · `TModal` · `TDrawer` · `TDropdown` · `TPopover` · `TTooltip` · `TContextMenu` · `TPagination` · `TToast` · `TToastProvider`

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

## Semantic aliases in docs

Some docs use familiar product terms as aliases for existing TreeUI patterns. These are documentation aliases only, not extra exports.

- `Snackbar` / `Notification` -> `TToast`
- `Banner` -> `TAlert`
- `Collapsible` / `Details` -> `TAccordion` with `type="single"` and `collapsible`

## TypeScript

Full TypeScript support with exported types:

```ts
import type { TreeSize, TreeVariant } from '@treeui/vue'
```

## Documentation

See the full component docs and interactive playground at the [Storybook site](https://viserion77.github.io/treeui/).

## License

MIT
