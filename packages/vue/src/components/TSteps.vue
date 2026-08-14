<script setup lang="ts">
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';
import { computed, ref, useAttrs, watch } from 'vue';
import type { TSize } from '../types/contracts';
import type { TModelModifiers } from './form-field';

defineOptions({
  inheritAttrs: false,
});

export interface TStepItem {
  label: string;
  value: string;
  description?: string;
  meta?: string;
  status?: TStepStatus;
  disabled?: boolean;
}

const _treeStepStatuses = ['complete', 'current', 'upcoming', 'error'] as const;
const _treeStepOrientations = ['horizontal', 'vertical'] as const;

export type TStepStatus = (typeof _treeStepStatuses)[number];
export type TStepOrientation = (typeof _treeStepOrientations)[number];

const CheckIcon = computed(() => getTreeIcon('check'));

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    items?: TStepItem[];
    size?: TSize;
    orientation?: TStepOrientation;
    /**
     * Whether a step can be picked. When false — the default — the sequence is
     * something to READ: it renders inert `<li>` boxes, emits no control into
     * the accessibility tree, and elects no step as current on its own. Set it
     * true for a wizard, where each step is a destination.
     */
    interactive?: boolean;
    /**
     * Fixed number of steps per row, horizontal only. Use it when the sequence
     * has a shape ("3 + 3"): a strip that only ever wraps by available width
     * leaves the last step alone on its own row.
     */
    columns?: number;
    /**
     * Width at which a step stops shrinking and the strip wraps instead.
     * Same axis as `TGrid`, same default reasoning: it is the item that decides
     * how many fit, never the consumer counting them.
     */
    minItemWidth?: string;
  } & TModelModifiers>(),
  {
    modelModifiers: () => ({}),
    modelValue: undefined,
    defaultValue: '',
    items: () => [],
    size: 'md',
    orientation: 'horizontal',
    interactive: false,
    columns: undefined,
    minItemWidth: '14rem',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

defineSlots<{
  item?: (props: {
    item: TStepItem;
    index: number;
    status: TStepStatus;
    current: boolean;
  }) => unknown;
}>();

const attrs = useAttrs();
// A wizard opens on its first step; a described sequence has no "you are here"
// until someone says so. Electing index 0 anyway is what made a marketing
// "how it works" section render the visitor's progress through a page.
const internalValue = ref(props.defaultValue || (props.interactive ? (props.items[0]?.value ?? '') : ''));

const activeValue = computed(() => props.modelValue ?? internalValue.value);

const currentIndex = computed(() => {
  const activeIndex = props.items.findIndex((item) => item.value === activeValue.value);
  if (activeIndex >= 0) {
    return activeIndex;
  }

  return props.interactive ? 0 : -1;
});

const rootClasses = computed(() => [
  't-steps',
  `t-steps--${props.size}`,
  `t-steps--${props.orientation}`,
  {
    'is-interactive': props.interactive,
    'has-columns': props.orientation === 'horizontal' && typeof props.columns === 'number' && props.columns > 0,
  },
  attrs.class,
]);

const rootStyle = computed(() => [
  props.orientation === 'horizontal'
    ? {
        '--tree-steps-min-item-width': props.minItemWidth,
        ...(typeof props.columns === 'number' && props.columns > 0
          ? { '--tree-steps-columns': String(props.columns) }
          : {}),
      }
    : null,
  attrs.style,
]);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const resolveStatus = (item: TStepItem, index: number): TStepStatus => {
  if (item.status) {
    return item.status;
  }

  if (index < currentIndex.value) {
    return 'complete';
  }

  if (index === currentIndex.value) {
    return 'current';
  }

  return 'upcoming';
};

const selectStep = (item: TStepItem) => {
  if (!props.interactive || item.disabled) {
    return;
  }

  if (props.modelValue === undefined) {
    internalValue.value = item.value;
  }

  emit('update:modelValue', item.value);
};

watch(
  () => props.items,
  (items) => {
    const hasCurrentItem = items.some((item) => item.value === activeValue.value);

    // Same rule as the initial value: only a wizard falls back to the first
    // step, or a static sequence would elect one the moment its items change.
    if (!hasCurrentItem && items[0] && props.modelValue === undefined && props.interactive) {
      internalValue.value = items[0].value;
    }
  },
  { deep: true },
);
</script>

<template>
  <ol
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <li
      v-for="(item, index) in items"
      :key="item.value"
      class="t-steps__item"
      :class="`is-${resolveStatus(item, index)}`"
    >
      <component
        :is="interactive ? 'button' : 'div'"
        :type="interactive ? 'button' : undefined"
        class="t-steps__box"
        :class="{
          't-steps__button': interactive,
          'is-current': resolveStatus(item, index) === 'current',
          'is-disabled': interactive && item.disabled,
        }"
        :disabled="interactive && item.disabled ? true : undefined"
        :aria-current="resolveStatus(item, index) === 'current' ? 'step' : undefined"
        @click="selectStep(item)"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
          :status="resolveStatus(item, index)"
          :current="resolveStatus(item, index) === 'current'"
        >
          <span
            class="t-steps__indicator"
            aria-hidden="true"
          >
            <CheckIcon
              v-if="resolveStatus(item, index) === 'complete'"
              v-bind="treeIconDefaults"
            />
            <span v-else-if="resolveStatus(item, index) === 'error'">!</span>
            <span v-else>{{ index + 1 }}</span>
          </span>

          <span class="t-steps__copy">
            <span class="t-steps__label">{{ item.label }}</span>
            <span
              v-if="item.description"
              class="t-steps__description"
            >
              {{ item.description }}
            </span>
          </span>

          <span
            v-if="item.meta"
            class="t-steps__meta"
          >
            {{ item.meta }}
          </span>
        </slot>
      </component>
    </li>
  </ol>
</template>
