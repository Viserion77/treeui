# @treeui/tokens

Framework-agnostic design tokens and themes for TreeUI: the `--tree-*` CSS
custom properties, the closed vocabularies shared across every TreeUI
implementation (`sm | md | lg` sizes, action variants, tones, breakpoints,
and more), and the colour contract that defines what a semantic token is and
how it must satisfy contrast. It has no runtime dependency on Vue, React, or
any other framework — Web, Android (Compose), and Desktop (egui) all render
from this same model.

## Install

```bash
pnpm add @treeui/tokens
# or
npm install @treeui/tokens
```

## Usage

```ts
import { treeTokens, createFoundationCss } from '@treeui/tokens';

treeTokens.space[4]; // '1rem'

// Theme-independent custom properties (space, radius, typography, …) as a stylesheet string
const css = createFoundationCss();
```

Themed values — the ones that change between light and dark — come from
`treeThemes` and `createThemeCss()`. Most consumers never call these
directly: `@treeui/vue` and `@treeui/react` already import `@treeui/tokens`
and ship the generated CSS at `@treeui/vue/style.css`. Install this package
on its own only when you need direct access to the token values or want the
theme CSS outside the component layer.

## Dependency-free, on purpose

`@treeui/tokens` ships no runtime dependencies. Tokens are the layer every
framework and every port renders from, so a dependency here would become a
transitive dependency of all of them. The sibling `treeui-tokens` crate
(Rust) is held to the same rule and checked in CI with `cargo tree`.

## Learn more

- `docs/ai/TOKENS.yaml` — the full colour contract, token layers, and theme values.
- [Vue Storybook](https://viserion77.github.io/treeui/vue/) — tokens rendered against real components.
- [Repository](https://github.com/Viserion77/treeui)

## License

MIT
