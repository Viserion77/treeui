# @treeui/vue

## 0.5.0

### Minor Changes

- Add `TDateTimePicker` with a custom TreeUI-styled date and time surface, plus public exports, Storybook docs, showcase coverage, and component tests.

## 0.4.0

### Minor Changes

- Ship the app-ready surface from Milestone 1 and Milestone 2, including the new application primitives
  and layout helpers such as `TStat`, `TMultiSelect`, `TNumberInput`, `TSelectableList`, `TTreeView`,
  `TSteps` / `TStepper`, `TToggleGroup`, `TContainer`, `TGrid`, `TStack`, `TSidebar`, `TNavMenu`,
  and `TNavbar` / `TAppBar`.

  Refresh the docs with shipped roadmap status, explicit alias and naming conventions, docs-first pattern recipes,
  and updated release guidance.

## 0.3.0

### Minor Changes

- Add new app-ready Vue components including `TCombobox`, `TConfirmDialog`, `TEmptyState`, `TTimeline`, and `TFileUpload`.

  Expand the package surface with typed exports, stories, tests, and contract/docs coverage for the new components, including drag-and-drop and `Ctrl+V` paste support in `TFileUpload`.

## 0.2.1

### Patch Changes

- Fix `TreeToastProvider` so it renders the default slot while still teleporting toast notifications to `body`.

  Improve package DX by adding a CommonJS export path and JavaScript source maps to the Vue build output.

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
