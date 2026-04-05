<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /**
     * Character or string used to visually separate breadcrumb items.
     */
    separator?: string;
  }>(),
  {
    separator: '/',
  },
);
</script>

<template>
  <nav
    aria-label="Breadcrumb"
    class="tree-breadcrumb"
  >
    <ol
      class="tree-breadcrumb__list"
      :style="{ '--tree-breadcrumb-separator': `'${props.separator}'` }"
    >
      <slot />
    </ol>
  </nav>
</template>
