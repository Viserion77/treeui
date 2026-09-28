# @treeui/react

React components for TreeUI, built on the same framework-agnostic `@treeui/tokens` and `t-*` BEM classes as `@treeui/vue`.

> Early package. The package today ships a small set of primitives — `TButton`, `TInput`, `TBadge`, and `TCard` — and grows from there.

## Install

```bash
pnpm add @treeui/react react react-dom
```

## Usage

Import the stylesheet once near your app root, then use the components:

```tsx
import '@treeui/react/style.css';
import { TButton, TInput, TBadge, TCard } from '@treeui/react';

export function Example() {
  return (
    <TCard header={<strong>Invite</strong>}>
      <TInput placeholder="teammate@example.com" />
      <TButton variant="solid">
        Send invite <TBadge tone="success">new</TBadge>
      </TButton>
    </TCard>
  );
}
```

The stylesheet re-imports `@treeui/tokens/styles.css` and `@treeui/tokens/themes.css`, so design tokens and theming (including `[data-tree-theme]`) work the same way as in the Vue package.

## Components

| Component | Notes |
|---|---|
| `TButton` | `variant`, `tone`, `size`, `loading` (+ `loadingLabel`), `icon`, `iconOnly` (needs `aria-label`), `block`, `align`; forwards native button attributes |
| `TInput` | `size`, `invalid`, `prefix`, `suffix`; forwards native input attributes |
| `TBadge` | `variant`, `size`, `tone`, `icon` |
| `TCard` | `variant`, `size`, `header`, `footer` |

All components forward refs and extra DOM attributes to their root element.

## Conventions

- All public exports use the `T` prefix, matching `@treeui/vue`.
- Component class names use the `t-` BEM prefix; design-token CSS variables use `--tree-*`.

## Differences from `@treeui/vue`

Same stylesheet, same closed vocabularies (`@treeui/tokens`), so the class
strings match character for character — `TButton.test.tsx` asserts that against
the Vue component's own `tv()` config, and `style-parity.test.ts` asserts that
every rule `src/style.css` declares is byte-identical to the Vue original. That
file is a deliberate subset: a rule Vue has for a component or a variant React
does not ship is simply absent. What this package does not have yet:

### `TButton`

- **No `to` and no `as`.** It always renders a native `<button>`, so there is no
  RouterLink path and no `href`/`target`/`rel`/`download`. A React button that
  navigates is an `<a>` your router owns, wearing the `t-button` classes.
- **No `label` prop.** The accessible name for an `iconOnly` button comes from
  `aria-label` (or `aria-labelledby`), which is forwarded like any other DOM
  attribute. The dev-only warning checks for those two.
- **No `hideIconWhileLoading`.** The spinner always replaces the icon while
  loading; the Vue prop that keeps both visible has no counterpart here.
- **No `variant="brand"`.** The gradient CTA variant is Vue-only; `variant` is
  the shared `TVariant` vocabulary.
- **No `TSpinner` component.** The `loading` spinner is emitted inline as
  `t-spinner t-spinner--sm`, so the markup matches but the spinner is not
  separately importable.
