<script setup lang="ts">
// A flexible spacer that absorbs free space between siblings in a flex layout
// (e.g. a TStack). Use it to push items apart or pin a trailing item to the end
// without hand-writing `margin-*: auto` or `flex: 1`.
withDefaults(
  defineProps<{
    as?: string;
  }>(),
  {
    as: 'div',
  },
);
</script>

<template>
  <component
    :is="as"
    class="t-spacer"
    aria-hidden="true"
  />
</template>
