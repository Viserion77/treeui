<script setup lang="ts">
import { createId } from '@treeui/utils';
import { computed, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const slots = defineSlots<{
  icon?: () => unknown;
  title?: () => unknown;
  description?: () => unknown;
  default?: () => unknown;
  actions?: () => unknown;
}>();

const props = withDefaults(
  defineProps<{
    as?: string;
    size?: TreeSize;
    title?: string;
    description?: string;
  }>(),
  {
    as: 'section',
    size: 'md',
    title: '',
    description: '',
  },
);

const attrs = useAttrs();
const emptyStateId = createId('tree-empty-state');
const titleId = `${emptyStateId}-title`;
const descriptionId = `${emptyStateId}-description`;

const hasTitle = computed(() => Boolean(props.title || slots.title));
const hasDescription = computed(() => Boolean(props.description || slots.description));

const classes = computed(() => [
  'tree-empty-state',
  `tree-empty-state--${props.size}`,
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    :class="classes"
    :style="rootStyle"
    :aria-labelledby="hasTitle ? titleId : undefined"
    :aria-describedby="hasDescription ? descriptionId : undefined"
  >
    <div
      v-if="$slots.icon"
      class="tree-empty-state__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </div>

    <div class="tree-empty-state__content">
      <h2
        v-if="hasTitle"
        :id="titleId"
        class="tree-empty-state__title"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </h2>

      <p
        v-if="hasDescription"
        :id="descriptionId"
        class="tree-empty-state__description"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </p>

      <div
        v-if="$slots.default"
        class="tree-empty-state__body"
      >
        <slot />
      </div>

      <div
        v-if="$slots.actions"
        class="tree-empty-state__actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </component>
</template>
