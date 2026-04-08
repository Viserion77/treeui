<script setup lang="ts">
import { createId, getNextEnabledIndex, isActivationKey } from '@treeui/utils';
import { computed, nextTick, ref, useAttrs, watch, type ComponentPublicInstance } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

export interface TreeSelectableListItem {
  label: string;
  value: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    items?: TreeSelectableListItem[];
    size?: TreeSize;
    disabled?: boolean;
    emptyText?: string;
  }>(),
  {
    modelValue: undefined,
    defaultValue: '',
    items: () => [],
    size: 'md',
    disabled: false,
    emptyText: 'No items available.',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

defineSlots<{
  item?: (props: {
    item: TreeSelectableListItem;
    selected: boolean;
    focused: boolean;
  }) => unknown;
  empty?: () => unknown;
}>();

const attrs = useAttrs();
const baseId = createId('tree-selectable-list');
const itemRefs = ref<Map<string, HTMLButtonElement>>(new Map());
const internalValue = ref(props.defaultValue);

const selectedValue = computed(() => props.modelValue ?? internalValue.value);

const getInitialFocusedIndex = () => {
  const selectedIndex = props.items.findIndex((item) =>
    item.value === selectedValue.value && !item.disabled,
  );

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return props.items.findIndex((item) => !item.disabled);
};

const focusedIndex = ref(getInitialFocusedIndex());

const rootClasses = computed(() => [
  'tree-selectable-list',
  `tree-selectable-list--${props.size}`,
  {
    'is-disabled': props.disabled,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const isSelected = (value: string) => selectedValue.value === value;

const setItemRef = (element: Element | ComponentPublicInstance | null, value: string) => {
  const resolvedElement =
    element instanceof HTMLButtonElement
      ? element
      : element && '$el' in element && element.$el instanceof HTMLButtonElement
        ? element.$el
        : null;

  if (resolvedElement instanceof HTMLButtonElement) {
    itemRefs.value.set(value, resolvedElement);
  } else {
    itemRefs.value.delete(value);
  }
};

const focusItem = (index: number) => {
  const item = props.items[index];

  if (!item) {
    return;
  }

  focusedIndex.value = index;
  nextTick(() => itemRefs.value.get(item.value)?.focus());
};

const selectItem = (item: TreeSelectableListItem, focus = false) => {
  if (props.disabled || item.disabled) {
    return;
  }

  if (props.modelValue === undefined) {
    internalValue.value = item.value;
  }

  emit('update:modelValue', item.value);

  if (focus) {
    const index = props.items.findIndex((candidate) => candidate.value === item.value);

    if (index >= 0) {
      focusItem(index);
    }
  }
};

const onItemKeydown = (event: KeyboardEvent, index: number) => {
  if (props.disabled) {
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    const firstIndex = props.items.findIndex((item) => !item.disabled);

    if (firstIndex >= 0) {
      selectItem(props.items[firstIndex], true);
    }

    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    const lastIndex = [...props.items].reverse().findIndex((item) => !item.disabled);

    if (lastIndex >= 0) {
      const resolvedIndex = props.items.length - 1 - lastIndex;
      selectItem(props.items[resolvedIndex], true);
    }

    return;
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault();
    const nextIndex = getNextEnabledIndex(index, props.items, 1);

    if (nextIndex >= 0) {
      selectItem(props.items[nextIndex], true);
    }

    return;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault();
    const previousIndex = getNextEnabledIndex(index, props.items, -1);

    if (previousIndex >= 0) {
      selectItem(props.items[previousIndex], true);
    }

    return;
  }

  if (isActivationKey(event)) {
    event.preventDefault();
    selectItem(props.items[index], true);
  }
};

const getTabIndex = (index: number) => (focusedIndex.value === index ? 0 : -1);

watch(
  () => [props.items, props.modelValue] as const,
  () => {
    const nextIndex = getInitialFocusedIndex();
    focusedIndex.value = nextIndex >= 0 ? nextIndex : -1;
  },
  { deep: true },
);
</script>

<template>
  <div
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
    role="listbox"
    :aria-disabled="disabled || undefined"
  >
    <template v-if="items.length > 0">
      <button
        v-for="(item, index) in items"
        :id="`${baseId}-${item.value}`"
        :ref="(element) => setItemRef(element, item.value)"
        :key="item.value"
        type="button"
        class="tree-selectable-list__item"
        :class="{
          'is-selected': isSelected(item.value),
          'is-disabled': disabled || item.disabled,
        }"
        role="option"
        :aria-selected="isSelected(item.value)"
        :tabindex="disabled || item.disabled ? -1 : getTabIndex(index)"
        :disabled="disabled || item.disabled"
        @click="selectItem(item)"
        @keydown="onItemKeydown($event, index)"
        @focus="focusedIndex = index"
      >
        <slot
          name="item"
          :item="item"
          :selected="isSelected(item.value)"
          :focused="focusedIndex === index"
        >
          <span
            class="tree-selectable-list__indicator"
            aria-hidden="true"
          />

          <span class="tree-selectable-list__copy">
            <span class="tree-selectable-list__label">{{ item.label }}</span>
            <span
              v-if="item.description"
              class="tree-selectable-list__description"
            >
              {{ item.description }}
            </span>
          </span>

          <span
            v-if="item.meta"
            class="tree-selectable-list__meta"
          >
            {{ item.meta }}
          </span>
        </slot>
      </button>
    </template>

    <div
      v-else
      class="tree-selectable-list__empty"
    >
      <slot name="empty">
        {{ emptyText }}
      </slot>
    </div>
  </div>
</template>
