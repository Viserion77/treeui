<script setup lang="ts">
import { getTreeIcon } from '@treeui/icons';
import { createId, getNextEnabledIndex, isEscapeKey } from '@treeui/utils';
import { computed, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';
import TreeSpinner from './TreeSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

export interface TreeMultiSelectOption {
  label: string;
  value: string;
  description?: string;
  keywords?: string[];
  disabled?: boolean;
}

const ChevronDownIcon = getTreeIcon('chevron-down');
const CheckIcon = getTreeIcon('check');
const XIcon = getTreeIcon('x');

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    options?: TreeMultiSelectOption[];
    open?: boolean;
    defaultOpen?: boolean;
    size?: TreeSize;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    placeholder?: string;
    emptyText?: string;
    maxVisibleTags?: number;
  }>(),
  {
    modelValue: () => [],
    options: () => [],
    open: undefined,
    defaultOpen: false,
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: '',
    emptyText: 'No results found.',
    maxVisibleTags: 2,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
  'input-change': [value: string];
}>();

defineSlots<{
  prefix?: () => unknown;
  tag?: (props: { option: TreeMultiSelectOption; remove: () => void }) => unknown;
  option?: (props: {
    option: TreeMultiSelectOption;
    selected: boolean;
    active: boolean;
  }) => unknown;
  empty?: (props: { query: string }) => unknown;
}>();

const attrs = useAttrs();
const listboxId = createId('tree-multi-select');
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const query = ref('');
const activeIndex = ref(-1);

const inputAttrs = computed(() => {
  const { class: _class, style: _style, autocomplete, ...rest } = attrs;
  return {
    autocomplete: typeof autocomplete === 'string' ? autocomplete : 'off',
    ...rest,
  };
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
  'tree-multi-select',
  `tree-multi-select--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
    'is-open': isOpen.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const normalize = (value: string) => value.trim().toLowerCase();

const filteredOptions = computed(() => {
  const normalizedQuery = normalize(query.value);

  if (!normalizedQuery) {
    return props.options;
  }

  return props.options.filter((option) => {
    const fields = [option.label, option.description ?? '', ...(option.keywords ?? [])];
    return fields.some((field) => field.toLowerCase().includes(normalizedQuery));
  });
});

const selectedOptions = computed(() =>
  props.options.filter((option) => props.modelValue.includes(option.value)),
);

const visibleTags = computed(() => selectedOptions.value.slice(0, props.maxVisibleTags));
const hiddenTagCount = computed(() =>
  Math.max(selectedOptions.value.length - visibleTags.value.length, 0),
);

const enabledFilteredOptions = computed(() => filteredOptions.value.filter((option) => !option.disabled));

const activeOption = computed(() =>
  activeIndex.value >= 0 ? filteredOptions.value[activeIndex.value] : undefined,
);

const activeDescendant = computed(() =>
  isOpen.value && activeOption.value
    ? `${listboxId}-option-${activeOption.value.value}`
    : undefined,
);

const inputPlaceholder = computed(() =>
  props.modelValue.length === 0 && !query.value ? props.placeholder : '',
);

const isSelected = (value: string) => props.modelValue.includes(value);

const setInitialActiveIndex = (fallback: 'first' | 'last' = 'first') => {
  const selectedIndex = filteredOptions.value.findIndex(
    (option) => isSelected(option.value) && !option.disabled,
  );

  if (selectedIndex >= 0) {
    activeIndex.value = selectedIndex;
    return;
  }

  if (enabledFilteredOptions.value.length === 0) {
    activeIndex.value = -1;
    return;
  }

  const targetOption =
    fallback === 'last'
      ? enabledFilteredOptions.value[enabledFilteredOptions.value.length - 1]
      : enabledFilteredOptions.value[0];

  activeIndex.value = filteredOptions.value.findIndex(
    (option) => option.value === targetOption.value,
  );
};

const openListbox = (fallback: 'first' | 'last' = 'first') => {
  if (props.disabled) {
    return;
  }

  setValue(true);
  setInitialActiveIndex(fallback);
};

const closeListbox = () => {
  setValue(false);
  activeIndex.value = -1;
};

const focusInput = () => {
  nextTick(() => inputRef.value?.focus());
};

const updateValues = (nextValues: string[]) => {
  emit('update:modelValue', nextValues);
};

const toggleOption = (option: TreeMultiSelectOption) => {
  if (props.disabled || option.disabled) {
    return;
  }

  const nextValues = isSelected(option.value)
    ? props.modelValue.filter((value) => value !== option.value)
    : [...props.modelValue, option.value];

  updateValues(nextValues);
  query.value = '';
  setInitialActiveIndex('first');
  focusInput();
};

const removeValue = (value: string) => {
  if (props.disabled) {
    return;
  }

  updateValues(props.modelValue.filter((item) => item !== value));
  focusInput();
};

const moveActive = (direction: 1 | -1) => {
  if (filteredOptions.value.length === 0) {
    activeIndex.value = -1;
    return;
  }

  const nextIndex = getNextEnabledIndex(activeIndex.value, filteredOptions.value, direction);
  activeIndex.value = nextIndex;
};

const onInput = (event: Event) => {
  query.value = (event.target as HTMLInputElement).value;
  emit('input-change', query.value);

  if (!props.disabled && !isOpen.value) {
    openListbox('first');
    return;
  }

  setInitialActiveIndex('first');
};

const onInputFocus = () => {
  openListbox('first');
};

const onInputKeydown = (event: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  if (event.key === 'Tab') {
    closeListbox();
    return;
  }

  if (isEscapeKey(event)) {
    event.preventDefault();
    closeListbox();
    return;
  }

  if (event.key === 'Backspace' && !query.value && props.modelValue.length > 0) {
    event.preventDefault();
    removeValue(props.modelValue[props.modelValue.length - 1]);
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (!isOpen.value) {
      openListbox('first');
      return;
    }

    moveActive(1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (!isOpen.value) {
      openListbox('last');
      return;
    }

    moveActive(-1);
    return;
  }

  if (event.key === 'Home' && isOpen.value) {
    event.preventDefault();
    setInitialActiveIndex('first');
    return;
  }

  if (event.key === 'End' && isOpen.value) {
    event.preventDefault();
    setInitialActiveIndex('last');
    return;
  }

  if (event.key === 'Enter' && activeOption.value) {
    event.preventDefault();
    toggleOption(activeOption.value);
  }
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) {
    return;
  }

  const target = event.target;

  if (!(target instanceof Node)) {
    return;
  }

  if (rootRef.value?.contains(target)) {
    return;
  }

  closeListbox();
};

watch(
  isOpen,
  (value) => {
    if (value) {
      document.addEventListener('pointerdown', onDocumentPointerDown);
    } else {
      document.removeEventListener('pointerdown', onDocumentPointerDown);
    }
  },
);

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
});
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :style="rootStyle"
  >
    <div
      class="tree-multi-select__control"
      @click="focusInput"
    >
      <span
        v-if="$slots.prefix"
        class="tree-multi-select__slot"
      >
        <slot name="prefix" />
      </span>

      <div class="tree-multi-select__values">
        <span
          v-for="option in visibleTags"
          :key="option.value"
          class="tree-multi-select__tag"
        >
          <slot
            name="tag"
            :option="option"
            :remove="() => removeValue(option.value)"
          >
            <span class="tree-multi-select__tag-label">{{ option.label }}</span>
            <button
              type="button"
              class="tree-multi-select__tag-remove"
              :disabled="disabled"
              aria-label="Remove selection"
              @mousedown.prevent
              @click.stop="removeValue(option.value)"
            >
              <XIcon :size="12" />
            </button>
          </slot>
        </span>

        <span
          v-if="hiddenTagCount > 0"
          class="tree-multi-select__overflow"
        >
          +{{ hiddenTagCount }}
        </span>

        <input
          ref="inputRef"
          v-bind="inputAttrs"
          :value="query"
          type="text"
          class="tree-multi-select__input"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="isOpen"
          :aria-controls="isOpen ? listboxId : undefined"
          :aria-activedescendant="activeDescendant"
          :aria-invalid="invalid || undefined"
          :aria-busy="loading || undefined"
          :disabled="disabled"
          :placeholder="inputPlaceholder"
          @focus="onInputFocus"
          @input="onInput"
          @keydown="onInputKeydown"
        >
      </div>

      <TreeSpinner
        v-if="loading"
        class="tree-multi-select__indicator"
        size="sm"
      />
      <ChevronDownIcon
        v-else
        class="tree-multi-select__indicator"
        :size="16"
      />
    </div>

    <Transition name="tree-fade">
      <ul
        v-if="isOpen"
        :id="listboxId"
        class="tree-multi-select__listbox"
        role="listbox"
        aria-multiselectable="true"
      >
        <li
          v-if="filteredOptions.length === 0"
          class="tree-multi-select__empty"
        >
          <slot
            name="empty"
            :query="query"
          >
            {{ emptyText }}
          </slot>
        </li>

        <template v-else>
          <li
            v-for="(option, index) in filteredOptions"
            :key="option.value"
          >
            <button
              type="button"
              class="tree-multi-select__option"
              :class="{
                'is-active': index === activeIndex,
                'is-selected': isSelected(option.value),
                'is-disabled': option.disabled,
              }"
              role="option"
              :id="`${listboxId}-option-${option.value}`"
              :aria-selected="isSelected(option.value)"
              :aria-disabled="option.disabled || undefined"
              :disabled="option.disabled"
              @mousedown.prevent
              @click="toggleOption(option)"
            >
              <slot
                name="option"
                :option="option"
                :selected="isSelected(option.value)"
                :active="index === activeIndex"
              >
                <span class="tree-multi-select__option-copy">
                  <span class="tree-multi-select__option-label">{{ option.label }}</span>
                  <span
                    v-if="option.description"
                    class="tree-multi-select__option-description"
                  >
                    {{ option.description }}
                  </span>
                </span>

                <span
                  class="tree-multi-select__check"
                  aria-hidden="true"
                >
                  <CheckIcon
                    v-if="isSelected(option.value)"
                    :size="16"
                  />
                </span>
              </slot>
            </button>
          </li>
        </template>
      </ul>
    </Transition>
  </div>
</template>
