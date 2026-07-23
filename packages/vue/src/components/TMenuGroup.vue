<script setup lang="ts">
import { computed } from 'vue';
import { createId } from '@treeui/utils';

const props = withDefaults(
  defineProps<{
    /** Non-focusable group label, announced via aria-labelledby. */
    label?: string;
  }>(),
  {
    label: undefined,
  },
);

const labelId = createId('t-menu-group-label');
const hasLabel = computed(() => Boolean(props.label));
</script>

<template>
  <div
    class="t-menu-group"
    role="group"
    :aria-labelledby="hasLabel ? labelId : undefined"
  >
    <div
      v-if="hasLabel || $slots.label"
      :id="labelId"
      class="t-menu-group__label"
    >
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <slot />
  </div>
</template>
