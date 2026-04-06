# @treeui/tokens

## 0.2.0

### Minor Changes

- ### @treeui/vue
  - **fix:** Generate TypeScript declaration files (`index.d.ts`) in build output via `vite-plugin-dts`
  - **fix:** Remove `:root` global overrides for `background`, `color`, and `font-family` that broke consumer apps
  - **feat:** Add `sideEffects` field to `package.json` to enable proper tree-shaking
  - **docs:** Add README with install instructions, component list, and theming docs

  ### @treeui/tokens
  - **feat:** Auto dark theme via `@media (prefers-color-scheme: dark)` fallback in `themes.css`
    - Applies dark tokens automatically when OS is in dark mode
    - Explicit `data-tree-theme="light"` still forces light theme
