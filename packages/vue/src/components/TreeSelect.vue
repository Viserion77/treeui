<script setup lang="ts">
import { createId, isActivationKey, isEscapeKey } from '@treeui/utils';
import { computed, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';
import TreeSpinner from './TreeSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

export interface TreeSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: TreeSelectOption[];
    open?: boolean;
    defaultOpen?: boolean;
    size?: TreeSize;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    options: () => [],
    open: undefined,
    defaultOpen: false,
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

const attrs = useAttrs();
const listboxId = createId('tree-select');
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const optionRefs = ref<Map<string | number, HTMLElement>>(new Map());
const focusedIndex = ref(-1);

const triggerAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const rootClasses = computed(() => [
  'tree-select',
  `tree-select--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
    'is-open': isOpen.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue);
  return opt?.label ?? '';
});

const enabledOptions = computed(() =>
  props.options.filter((o) => !o.disabled),
);

const openDropdown = () => {
  if (props.disabled) return;
  const selectedIdx = props.options.findIndex((o) => o.value === props.modelValue);
  focusedIndex.value = selectedIdx >= 0 ? selectedIdx : 0;
  setValue(true);
  nextTick(() => focusOption(focusedIndex.value));
};

const closeDropdown = (restoreFocus = false) => {
  setValue(false);
  focusedIndex.value = -1;
  if (restoreFocus) {
    nextTick(() => triggerRef.value?.focus());
  }
};

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const selectOption = (opt: TreeSelectOption) => {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  closeDropdown(true);
};

const focusOption = (index: number) => {
  const opt = props.options[index];
  if (!opt) return;
  const el = optionRefs.value.get(opt.value);
  el?.focus();
};

const setOptionRef = (el: Element | null, value: string | number) => {
  if (el instanceof HTMLElement) {
    optionRefs.value.set(value, el);
  } else {
    optionRefs.value.delete(value);
  }
};

const moveFocus = (direction: 1 | -1) => {
  let nextIndex = focusedIndex.value + direction;
  while (nextIndex >= 0 && nextIndex < props.options.length) {
    if (!props.options[nextIndex].disabled) {
      focusedIndex.value = nextIndex;
      focusOption(nextIndex);
      return;
    }
    nextIndex += direction;
  }
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  if (isEscapeKey(event) && isOpen.value) {
    event.preventDefault();
    closeDropdown();
    return;
  }

  if (isActivationKey(event) || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    openDropdown();
  }
};

const onOptionKeydown = (event: KeyboardEvent, opt: TreeSelectOption, _index: number) => {
  if (isEscapeKey(event)) {
    event.preventDefault();
    closeDropdown(true);
    return;
  }

  if (isActivationKey(event)) {
    event.preventDefault();
    selectOption(opt);
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveFocus(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveFocus(-1);
      break;
    case 'Home':
      event.preventDefault();
      focusedIndex.value = enabledOptions.value.length > 0
        ? props.options.indexOf(enabledOptions.value[0])
        : 0;
      focusOption(focusedIndex.value);
      break;
    case 'End':
      event.preventDefault();
      focusedIndex.value = enabledOptions.value.length > 0
        ? props.options.indexOf(enabledOptions.value[enabledOptions.value.length - 1])
        : props.options.length - 1;
      focusOption(focusedIndex.value);
      break;
    default:
      break;
  }
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (rootRef.value?.contains(target)) return;
  closeDropdown();
};

const hasSelection = computed(() =>
  props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined,
);

watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown);
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
});
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :style="rootStyle"
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <button
      ref="triggerRef"
      v-bind="triggerAttrs"
      type="button"
      class="tree-select__trigger"
      :disabled="disabled"
      :aria-controls="isOpen ? listboxId : undefined"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-invalid="invalid || undefined"
      :aria-busy="loading || undefined"
      @click="toggleDropdown"
      @keydown="onTriggerKeydown"
    >
      <span
        v-if="$slots.prefix"
        class="tree-select__slot tree-select__slot--prefix"
      >
        <slot name="prefix" />
      </span>
      <span
        class="tree-select__value"
        :data-placeholder="!hasSelection ? true : undefined"
      >
        {{ selectedLabel || placeholder }}
      </span>
      <TreeSpinner
        v-if="loading"
        size="sm"
        label="Loading"
      />
      <svg
        v-else
        class="tree-select__chevron"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="4 6 8 10 12 6" />
      </svg>
    </button>
    <transition name="tree-fade">
      <ul
        v-if="isOpen && !disabled"
        :id="listboxId"
        role="listbox"
        class="tree-select__listbox"
        :aria-label="typeof triggerAttrs['aria-label'] === 'string' ? triggerAttrs['aria-label'] : undefined"
      >
        <li
          v-for="(opt, index) in options"
          :key="opt.value"
          :ref="(el) => setOptionRef(el as Element | null, opt.value)"
          role="option"
          class="tree-select__option"
          :class="{
            'is-selected': opt.value === modelValue,
            'is-disabled': opt.disabled,
            'is-focused': index === focusedIndex,
          }"
          :aria-selected="opt.value === modelValue"
          :aria-disabled="opt.disabled || undefined"
          :tabindex="opt.disabled ? -1 : 0"
          @click="selectOption(opt)"
          @keydown="onOptionKeydown($event, opt, index)"
        >
          {{ opt.label }}
          <svg
            v-if="opt.value === modelValue"
            class="tree-select__check"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
        </li>
      </ul>
    </transition>
  </div>
</template>
