<script setup lang="ts">
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';
import { computed, ref, useAttrs, watch } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

export interface TreeStepItem {
  label: string;
  value: string;
  description?: string;
  meta?: string;
  status?: TreeStepStatus;
  disabled?: boolean;
}

const treeStepStatuses = ['complete', 'current', 'upcoming', 'error'] as const;
const treeStepOrientations = ['horizontal', 'vertical'] as const;

export type TreeStepStatus = (typeof treeStepStatuses)[number];
export type TreeStepOrientation = (typeof treeStepOrientations)[number];

const CheckIcon = getTreeIcon('check');

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    items?: TreeStepItem[];
    size?: TreeSize;
    orientation?: TreeStepOrientation;
    interactive?: boolean;
  }>(),
  {
    modelValue: undefined,
    defaultValue: '',
    items: () => [],
    size: 'md',
    orientation: 'horizontal',
    interactive: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

defineSlots<{
  item?: (props: {
    item: TreeStepItem;
    index: number;
    status: TreeStepStatus;
    current: boolean;
  }) => unknown;
}>();

const attrs = useAttrs();
const internalValue = ref(props.defaultValue || props.items[0]?.value || '');

const activeValue = computed(() => props.modelValue ?? internalValue.value);

const currentIndex = computed(() => {
  const activeIndex = props.items.findIndex((item) => item.value === activeValue.value);
  return activeIndex >= 0 ? activeIndex : 0;
});

const rootClasses = computed(() => [
  'tree-steps',
  `tree-steps--${props.size}`,
  `tree-steps--${props.orientation}`,
  {
    'is-interactive': props.interactive,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const resolveStatus = (item: TreeStepItem, index: number): TreeStepStatus => {
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

const selectStep = (item: TreeStepItem) => {
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

    if (!hasCurrentItem && items[0] && props.modelValue === undefined) {
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
      class="tree-steps__item"
      :class="`is-${resolveStatus(item, index)}`"
    >
      <button
        type="button"
        class="tree-steps__button"
        :class="{
          'is-current': resolveStatus(item, index) === 'current',
          'is-disabled': item.disabled,
        }"
        :disabled="!interactive || item.disabled"
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
            class="tree-steps__indicator"
            aria-hidden="true"
          >
            <CheckIcon
              v-if="resolveStatus(item, index) === 'complete'"
              v-bind="treeIconDefaults"
            />
            <span v-else-if="resolveStatus(item, index) === 'error'">!</span>
            <span v-else>{{ index + 1 }}</span>
          </span>

          <span class="tree-steps__copy">
            <span class="tree-steps__label">{{ item.label }}</span>
            <span
              v-if="item.description"
              class="tree-steps__description"
            >
              {{ item.description }}
            </span>
          </span>

          <span
            v-if="item.meta"
            class="tree-steps__meta"
          >
            {{ item.meta }}
          </span>
        </slot>
      </button>
    </li>
  </ol>
</template>
