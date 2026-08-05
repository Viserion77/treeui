<script setup lang="ts">
import { createId } from '@treeui/utils';
import { computed, useAttrs } from 'vue';
import type { TSize } from '../types/contracts';

const _treeEmptyStateFrames = ['block', 'fill', 'inline', 'narrow'] as const;

export type TEmptyStateFrame = (typeof _treeEmptyStateFrames)[number];

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
    /** Type and inner spacing of the message. Does not change the frame. */
    size?: TSize;
    title?: string;
    description?: string;
    /**
     * Geometry of the FRAME, which is a separate question from the size of the
     * message inside it: the same empty state fills a board column, a side
     * panel and a page. `fill` makes it take the height of its container and
     * centre the message in it — the difference between "this column is empty"
     * and "this page is empty". `inline` shrinks the frame to its content.
     * `narrow` caps the frame at a readable width and centres it, so a dashed
     * box in a wide panel stops reading as an enormous void — the library
     * already capped the inner content, but not the box around it.
     */
    frame?: TEmptyStateFrame;
  }>(),
  {
    as: 'section',
    size: 'md',
    title: '',
    description: '',
    frame: 'block',
  },
);

const attrs = useAttrs();
const emptyStateId = createId('t-empty-state');
const titleId = `${emptyStateId}-title`;
const descriptionId = `${emptyStateId}-description`;

const hasTitle = computed(() => Boolean(props.title || slots.title));
const hasDescription = computed(() => Boolean(props.description || slots.description));

const classes = computed(() => [
  't-empty-state',
  `t-empty-state--${props.size}`,
  props.frame !== 'block' ? `t-empty-state--frame-${props.frame}` : null,
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
      class="t-empty-state__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </div>

    <div class="t-empty-state__content">
      <h2
        v-if="hasTitle"
        :id="titleId"
        class="t-empty-state__title"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </h2>

      <p
        v-if="hasDescription"
        :id="descriptionId"
        class="t-empty-state__description"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </p>

      <div
        v-if="$slots.default"
        class="t-empty-state__body"
      >
        <slot />
      </div>

      <div
        v-if="$slots.actions"
        class="t-empty-state__actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </component>
</template>
