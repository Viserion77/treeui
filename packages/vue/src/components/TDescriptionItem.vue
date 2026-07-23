<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** The term. Rendered in `<dt>`; use the `label` slot for rich content. */
    label?: string;
  }>(),
  {
    label: undefined,
  },
);

void props;
</script>

<template>
  <div class="t-description-item">
    <dt class="t-description-item__label">
      <slot name="label">
        {{ label }}
      </slot>
    </dt>
    <dd class="t-description-item__value">
      <span class="t-description-item__value-content">
        <slot />
      </span>
      <span
        v-if="$slots.actions"
        class="t-description-item__actions"
      >
        <slot name="actions" />
      </span>
    </dd>
  </div>
</template>
