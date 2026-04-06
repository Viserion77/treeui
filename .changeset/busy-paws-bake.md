---
'@treeui/vue': patch
---

Fix lint errors and warnings across components

- Remove unused `useSlots` import in `TreeBreadcrumbItem`
- Remove unused `onBeforeUnmount` import and `listType` variable in `TreeMarkdownEditor`
- Fix unused expression in `TreePopover` (replace `||` with proper `if` statement)
- Fix `vue/max-attributes-per-line` warnings in `TreeAccordionItem`, `TreeMarkdownEditor`, `TreePagination`, and `TreePopover`
- Fix `vue/singleline-html-element-content-newline` warnings in `TreeFormField`
- Suppress intentional `v-html` warning in `TreeMarkdownEditor` preview pane
- Prefix unused `file` parameter in `MarkdownEditor` stories
