# @treeui/react

React components for TreeUI, built on the same framework-agnostic `@treeui/tokens` and `t-*` BEM classes as `@treeui/vue`.

> Early package. The first release ships a small set of primitives — `TButton`, `TInput`, `TBadge`, and `TCard` — and grows from there.

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
| `TButton` | `variant`, `size`, `loading`, `icon`; forwards native button attributes |
| `TInput` | `size`, `invalid`, `prefix`, `suffix`; forwards native input attributes |
| `TBadge` | `variant`, `size`, `tone`, `icon` |
| `TCard` | `variant`, `size`, `header`, `footer` |

All components forward refs and extra DOM attributes to their root element.

## Conventions

- All public exports use the `T` prefix, matching `@treeui/vue`.
- Component class names use the `t-` BEM prefix; design-token CSS variables use `--tree-*`.
