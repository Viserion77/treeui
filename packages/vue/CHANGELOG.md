# @treeui/vue

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

### Patch Changes

- 97716f8: Fix lint errors and warnings across components
  - Remove unused `useSlots` import in `TreeBreadcrumbItem`
  - Remove unused `onBeforeUnmount` import and `listType` variable in `TreeMarkdownEditor`
  - Fix unused expression in `TreePopover` (replace `||` with proper `if` statement)
  - Fix `vue/max-attributes-per-line` warnings in `TreeAccordionItem`, `TreeMarkdownEditor`, `TreePagination`, and `TreePopover`
  - Fix `vue/singleline-html-element-content-newline` warnings in `TreeFormField`
  - Suppress intentional `v-html` warning in `TreeMarkdownEditor` preview pane
  - Prefix unused `file` parameter in `MarkdownEditor` stories

- Updated dependencies
  - @treeui/tokens@0.2.0
