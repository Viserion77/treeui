# @treeui/utils

Framework-agnostic interaction utilities for TreeUI: the `tv()` class-variants
helper that every TreeUI component uses to build its `t-*` BEM class strings,
plus shared DOM and date helpers (focus management, keyboard key checks,
calendar math) used across the Vue and React implementations. It has no
runtime dependency on either framework.

## Install

```bash
pnpm add @treeui/utils
# or
npm install @treeui/utils
```

## Usage

```ts
import { tv } from '@treeui/utils';

const button = tv({
  base: 't-button',
  variants: {
    variant: { solid: 't-button--solid', outline: 't-button--outline' },
    size: { sm: 't-button--sm', md: 't-button--md' },
  },
  defaultVariants: { variant: 'solid', size: 'md' },
});

button({ variant: 'outline', size: 'sm' }); // 't-button t-button--outline t-button--sm'
```

## Dependency-free, on purpose

`@treeui/utils` ships no runtime dependencies, the same rule `@treeui/tokens`
is held to: both sit underneath every framework package, so a dependency
here would become a transitive dependency of all of them.

## Learn more

- [Vue Storybook](https://viserion77.github.io/treeui/vue/) — components built with `tv()` and these helpers.
- [Repository](https://github.com/Viserion77/treeui)

## License

MIT
