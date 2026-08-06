<script lang="ts">
// A normal <script> block, because a generic `<script setup>` does not re-export
// the types declared inside it — and `TToggleGroupOption`,
// `TToggleGroupSelectionMode` and `TToggleGroupVariant` are public API.
export interface TToggleGroupOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

const _treeToggleGroupSelectionModes = ['single', 'multiple'] as const;
const _treeToggleGroupVariants = ['outline', 'soft', 'solid'] as const;

export type TToggleGroupSelectionMode = (typeof _treeToggleGroupSelectionModes)[number];
export type TToggleGroupVariant = (typeof _treeToggleGroupVariants)[number];

/** What `v-model` binds, given the option type and the selection mode. */
export type TToggleGroupModel<
  T extends string,
  M extends TToggleGroupSelectionMode,
> = M extends 'multiple' ? T[] : T;
</script>

<script setup lang="ts" generic="T extends string = string, M extends 'single' | 'multiple' = 'single'">
import { createId, getNextEnabledIndex, isActivationKey } from '@treeui/utils';
import { computed, nextTick, ref, useAttrs, watch, type ComponentPublicInstance } from 'vue';
import type { TSize } from '../types/contracts';
import { useFormFieldGroup, type TModelModifiers } from './form-field';

defineOptions({
  inheritAttrs: false,
});

/**
 * Generic over the option value AND the selection mode, so the model type is
 * the one the call site actually has: `single` binds a `T`, `multiple` binds a
 * `T[]`. Before this the model was `string | string[]` in and
 * `string | string[] | undefined` out, so a `ref<'grid' | 'list'>` could not be
 * bound at all under a consumer's `strictTemplates` — the same defect as
 * TTabs/TInput (TREEUX-011, group 3), and `undefined` was never actually
 * emitted.
 */
const props = withDefaults(
  defineProps<{
    modelValue?: TToggleGroupModel<T, M>;
    /**
     * `NoInfer` so the MODEL drives `T`, not the options. Without it a group
     * whose options happen to list one value narrows `T` to that value, and a
     * `ref<'grid' | 'list'>` stops binding the moment one option is filtered
     * out. Options are then checked against the model's type, which is the
     * direction that catches a real mistake: offering a value the model cannot
     * hold.
     */
    options?: TToggleGroupOption<NoInfer<T>>[];
    /**
     * No prop default on purpose: a `withDefaults` value cannot be proven
     * assignable to the type parameter it would fill in. The default lives in
     * `selectionMode` below, which is what the component reads.
     */
    selectionMode?: M;
    size?: TSize;
    variant?: TToggleGroupVariant;
    disabled?: boolean;
  } & TModelModifiers>(),
  {
    modelValue: undefined,
    options: () => [],
    selectionMode: undefined,
    size: 'md',
    variant: 'outline',
    disabled: false,
    modelModifiers: () => ({}),
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: TToggleGroupModel<T, M>];
}>();

defineSlots<{
  option?: (props: { option: TToggleGroupOption<T>; selected: boolean }) => unknown;
}>();

/** The runtime default. `single` is what the component has always assumed. */
const selectionMode = computed<TToggleGroupSelectionMode>(
  () => props.selectionMode ?? 'single',
);

const attrs = useAttrs();
const baseId = createId('t-toggle-group');
const buttonRefs = ref<Map<string, HTMLButtonElement>>(new Map());

/**
 * Both modes flattened to the same shape — one array of option values — so
 * everything below (selection, focus order, keyboard) is written once. Annotated
 * `T[]` rather than inferred: the model is a conditional type, so the ternary
 * infers a union of array and non-array that nothing downstream can index.
 */
const normalizedValues = computed<T[]>(() => {
  if (selectionMode.value === 'multiple') {
    return Array.isArray(props.modelValue) ? (props.modelValue as T[]) : [];
  }

  return typeof props.modelValue === 'string' && props.modelValue
    ? [props.modelValue as T]
    : [];
});

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
  't-toggle-group',
  `t-toggle-group--${props.size}`,
  `t-toggle-group--${props.variant}`,
  `t-toggle-group--${selectionMode.value}`,
  {
    'is-disabled': props.disabled,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

// Like TRadioGroup: no single labellable element, so the TFormField id stays
// unclaimed and the group names itself with the label's id (TREEUX-012).
const { labelledBy, describedBy } = useFormFieldGroup(attrs);

const rootAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    'aria-labelledby': _labelledBy,
    'aria-describedby': _describedBy,
    ...rest
  } = attrs;
  return rest;
});

const isSelected = (value: string) => normalizedValues.value.includes(value as T);

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

  if (selectionMode.value === 'multiple') {
    const nextValues = isSelected(value)
      ? normalizedValues.value.filter((item) => item !== value)
      : [...normalizedValues.value, value];

    // The runtime check above IS the discriminant, but TS cannot narrow a
    // conditional type through it: inside the branch `M` is still the unresolved
    // parameter. The two casts are the only place this component asserts
    // anything, and `normalizedValues` guarantees the shape.
    emit('update:modelValue', nextValues as TToggleGroupModel<T, M>);
    return;
  }

  emit('update:modelValue', value as TToggleGroupModel<T, M>);
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

      if (selectionMode.value === 'single') {
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

      if (selectionMode.value === 'single') {
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

      if (selectionMode.value === 'single') {
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
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
  >
    <button
      v-for="(option, index) in options"
      :id="`${baseId}-${option.value}`"
      :ref="(element) => setButtonRef(element, option.value)"
      :key="option.value"
      type="button"
      class="t-toggle-group__item"
      :class="{
        'is-selected': isSelected(option.value),
        'is-disabled': disabled || option.disabled,
      }"
      :role="selectionMode === 'single' ? 'radio' : undefined"
      :aria-checked="selectionMode === 'single' ? isSelected(option.value) : undefined"
      :aria-pressed="selectionMode === 'multiple' ? isSelected(option.value) : undefined"
      :tabindex="option.disabled || disabled ? -1 : getTabIndex(index)"
      :disabled="disabled || option.disabled"
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
