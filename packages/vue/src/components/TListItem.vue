<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: string;
  }>(),
  {
    as: 'li',
  },
);

void props;
</script>

<template>
  <component
    :is="as"
    class="t-list-item"
  >
    <span
      v-if="$slots.leading"
      class="t-list-item__leading"
    >
      <slot name="leading" />
    </span>
    <div class="t-list-item__content">
      <slot />
    </div>
    <div
      v-if="$slots.meta"
      class="t-list-item__meta"
    >
      <slot name="meta" />
    </div>
    <div
      v-if="$slots.actions"
      class="t-list-item__actions"
    >
      <slot name="actions" />
    </div>
  </component>
</template>
