<script setup lang="ts">
import { createId, getNextEnabledIndex, isActivationKey } from '@treeui/utils';
import { computed, nextTick, ref, useAttrs, watch, type ComponentPublicInstance } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

export interface TreeToggleGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
}

const treeToggleGroupSelectionModes = ['single', 'multiple'] as const;
const treeToggleGroupVariants = ['outline', 'soft', 'solid'] as const;

export type TreeToggleGroupSelectionMode = (typeof treeToggleGroupSelectionModes)[number];
export type TreeToggleGroupVariant = (typeof treeToggleGroupVariants)[number];

const props = withDefaults(
  defineProps<{
    modelValue?: string | string[];
    options?: TreeToggleGroupOption[];
    selectionMode?: TreeToggleGroupSelectionMode;
    size?: TreeSize;
    variant?: TreeToggleGroupVariant;
    disabled?: boolean;
  }>(),
  {
    modelValue: undefined,
    options: () => [],
    selectionMode: 'single',
    size: 'md',
    variant: 'outline',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
}>();

defineSlots<{
  option?: (props: { option: TreeToggleGroupOption; selected: boolean }) => unknown;
}>();

const attrs = useAttrs();
const baseId = createId('tree-toggle-group');
const buttonRefs = ref<Map<string, HTMLButtonElement>>(new Map());

const normalizedValues = computed(() =>
  props.selectionMode === 'multiple'
    ? Array.isArray(props.modelValue)
      ? props.modelValue
      : []
    : typeof props.modelValue === 'string' && props.modelValue
      ? [props.modelValue]
      : [],
);

const getInitialFocusedIndex = () => {
  const selectedIndex = props.options.findIndex((option) =>
    normalizedValues.value.includes(option.value) && !option.disabled,
  );

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return props.options.findIndex((option) => !option.disabled);
};

const focusedIndex = ref(getInitialFocusedIndex());

const rootClasses = computed(() => [
  'tree-toggle-group',
  `tree-toggle-group--${props.size}`,
  `tree-toggle-group--${props.variant}`,
  `tree-toggle-group--${props.selectionMode}`,
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

const isSelected = (value: string) => normalizedValues.value.includes(value);

const setButtonRef = (element: Element | ComponentPublicInstance | null, value: string) => {
  const resolvedElement =
    element instanceof HTMLButtonElement
      ? element
      : element && '$el' in element && element.$el instanceof HTMLButtonElement
        ? element.$el
        : null;

  if (resolvedElement instanceof HTMLButtonElement) {
    buttonRefs.value.set(value, resolvedElement);
  } else {
    buttonRefs.value.delete(value);
  }
};

const focusOption = (index: number) => {
  const option = props.options[index];

  if (!option) {
    return;
  }

  focusedIndex.value = index;
  nextTick(() => buttonRefs.value.get(option.value)?.focus());
};

const selectValue = (value: string) => {
  const option = props.options.find((item) => item.value === value);

  if (!option || option.disabled || props.disabled) {
    return;
  }

  if (props.selectionMode === 'multiple') {
    const nextValues = isSelected(value)
      ? normalizedValues.value.filter((item) => item !== value)
      : [...normalizedValues.value, value];

    emit('update:modelValue', nextValues);
    return;
  }

  emit('update:modelValue', value);
};

const onOptionKeydown = (event: KeyboardEvent, index: number) => {
  if (props.disabled) {
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    const firstIndex = props.options.findIndex((option) => !option.disabled);

    if (firstIndex >= 0) {
      focusOption(firstIndex);

      if (props.selectionMode === 'single') {
        selectValue(props.options[firstIndex].value);
      }
    }

    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    const lastIndex = [...props.options].reverse().findIndex((option) => !option.disabled);

    if (lastIndex >= 0) {
      const resolvedIndex = props.options.length - 1 - lastIndex;
      focusOption(resolvedIndex);

      if (props.selectionMode === 'single') {
        selectValue(props.options[resolvedIndex].value);
      }
    }

    return;
  }

  if (
    event.key === 'ArrowRight' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowUp'
  ) {
    event.preventDefault();
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = getNextEnabledIndex(index, props.options, direction as 1 | -1);

    if (nextIndex >= 0) {
      focusOption(nextIndex);

      if (props.selectionMode === 'single') {
        selectValue(props.options[nextIndex].value);
      }
    }

    return;
  }

  if (isActivationKey(event)) {
    event.preventDefault();
    selectValue(props.options[index].value);
  }
};

const getTabIndex = (index: number) => (focusedIndex.value === index ? 0 : -1);

watch(
  () => [props.modelValue, props.options] as const,
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
    :role="selectionMode === 'single' ? 'radiogroup' : 'group'"
  >
    <button
      v-for="(option, index) in options"
      :ref="(element) => setButtonRef(element, option.value)"
      :key="option.value"
      type="button"
      class="tree-toggle-group__item"
      :class="{
        'is-selected': isSelected(option.value),
        'is-disabled': disabled || option.disabled,
      }"
      :role="selectionMode === 'single' ? 'radio' : undefined"
      :aria-checked="selectionMode === 'single' ? isSelected(option.value) : undefined"
      :aria-pressed="selectionMode === 'multiple' ? isSelected(option.value) : undefined"
      :tabindex="option.disabled || disabled ? -1 : getTabIndex(index)"
      :disabled="disabled || option.disabled"
      :id="`${baseId}-${option.value}`"
      @click="selectValue(option.value)"
      @keydown="onOptionKeydown($event, index)"
      @focus="focusedIndex = index"
    >
      <slot
        name="option"
        :option="option"
        :selected="isSelected(option.value)"
      >
        {{ option.label }}
      </slot>
    </button>
  </div>
</template>
