<script setup lang="ts">
import { createId, isEscapeKey } from '@treeui/utils';
import { computed, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';
import TreeSpinner from './TreeSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

export interface TreeComboboxOption {
  label: string;
  value: string;
  description?: string;
  keywords?: string[];
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options?: TreeComboboxOption[];
    open?: boolean;
    defaultOpen?: boolean;
    size?: TreeSize;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    placeholder?: string;
    emptyText?: string;
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
    emptyText: 'No results found.',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
  'input-change': [value: string];
}>();

defineSlots<{
  prefix?: () => unknown;
  option?: (props: {
    option: TreeComboboxOption;
    selected: boolean;
    active: boolean;
  }) => unknown;
  empty?: (props: { query: string }) => unknown;
}>();

const attrs = useAttrs();
const listboxId = createId('tree-combobox');
const rootRef = ref<HTMLElement | null>(null);
const activeIndex = ref(-1);
const query = ref('');

const normalize = (value: string) => value.trim().toLowerCase();
const getOptionId = (value: string) => `${listboxId}-option-${value}`;

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
);

const selectedLabel = computed(() => selectedOption.value?.label ?? '');

const inputAttrs = computed(() => {
  const { class: _class, style: _style, autocomplete, ...rest } = attrs;
  return {
    autocomplete: typeof autocomplete === 'string' ? autocomplete : 'off',
    ...rest,
  };
});

const listboxLabel = computed(() =>
  typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : undefined,
);

const listboxLabelledby = computed(() =>
  typeof attrs['aria-labelledby'] === 'string' ? attrs['aria-labelledby'] : undefined,
);

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const rootClasses = computed(() => [
  'tree-combobox',
  `tree-combobox--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
    'is-open': isOpen.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const filteredOptions = computed(() => {
  const normalizedQuery = normalize(query.value);

  if (!normalizedQuery) {
    return props.options;
  }

  return props.options.filter((option) => {
    const fields = [
      option.label,
      option.description ?? '',
      ...(option.keywords ?? []),
    ];

    return fields.some((field) => field.toLowerCase().includes(normalizedQuery));
  });
});

const enabledFilteredIndexes = computed(() =>
  filteredOptions.value.reduce<number[]>((indexes, option, index) => {
    if (!option.disabled) {
      indexes.push(index);
    }

    return indexes;
  }, []),
);

const activeOption = computed(() =>
  activeIndex.value >= 0 ? filteredOptions.value[activeIndex.value] : undefined,
);

const activeDescendant = computed(() =>
  isOpen.value && activeOption.value ? getOptionId(activeOption.value.value) : undefined,
);

const syncQueryFromSelection = () => {
  query.value = selectedLabel.value;
};

const setInitialActiveIndex = (fallback: 'first' | 'last' = 'first') => {
  const selectedIndex = filteredOptions.value.findIndex((option) =>
    option.value === props.modelValue && !option.disabled,
  );

  if (selectedIndex >= 0) {
    activeIndex.value = selectedIndex;
    return;
  }

  if (enabledFilteredIndexes.value.length === 0) {
    activeIndex.value = -1;
    return;
  }

  activeIndex.value =
    fallback === 'last'
      ? enabledFilteredIndexes.value[enabledFilteredIndexes.value.length - 1]
      : enabledFilteredIndexes.value[0];
};

const moveActive = (direction: 1 | -1) => {
  if (enabledFilteredIndexes.value.length === 0) {
    activeIndex.value = -1;
    return;
  }

  const currentEnabledIndex = enabledFilteredIndexes.value.indexOf(activeIndex.value);

  if (currentEnabledIndex === -1) {
    activeIndex.value =
      direction === 1
        ? enabledFilteredIndexes.value[0]
        : enabledFilteredIndexes.value[enabledFilteredIndexes.value.length - 1];
    return;
  }

  const nextEnabledIndex = currentEnabledIndex + direction;

  if (nextEnabledIndex < 0 || nextEnabledIndex >= enabledFilteredIndexes.value.length) {
    return;
  }

  activeIndex.value = enabledFilteredIndexes.value[nextEnabledIndex];
};

const openListbox = (fallback: 'first' | 'last' = 'first') => {
  if (props.disabled) {
    return;
  }

  setValue(true);
  setInitialActiveIndex(fallback);
};

const commitPendingClear = () => {
  if (query.value.trim() !== '' || !props.modelValue) {
    return false;
  }

  emit('update:modelValue', '');
  return true;
};

const closeListbox = (restoreSelection = false) => {
  setValue(false);
  activeIndex.value = -1;

  if (!restoreSelection) {
    return;
  }

  if (commitPendingClear()) {
    return;
  }

  if (selectedLabel.value && query.value !== selectedLabel.value) {
    query.value = selectedLabel.value;
  }
};

const selectOption = (option: TreeComboboxOption) => {
  if (option.disabled) {
    return;
  }

  query.value = option.label;
  emit('update:modelValue', option.value);
  closeListbox(false);
};

const onInput = (event: Event) => {
  query.value = (event.target as HTMLInputElement).value;
  emit('input-change', query.value);

  if (props.disabled) {
    return;
  }

  if (!isOpen.value) {
    openListbox('first');
    return;
  }

  setInitialActiveIndex('first');
};

const onInputFocus = () => {
  openListbox('first');
};

const onInputClick = () => {
  if (!isOpen.value) {
    openListbox('first');
  }
};

const onInputKeydown = (event: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  if (isEscapeKey(event)) {
    if (isOpen.value) {
      event.preventDefault();
      closeListbox(true);
    }

    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();

      if (!isOpen.value) {
        openListbox('first');
      } else {
        moveActive(1);
      }
      break;
    case 'ArrowUp':
      event.preventDefault();

      if (!isOpen.value) {
        openListbox('last');
      } else {
        moveActive(-1);
      }
      break;
    case 'Enter':
      if (isOpen.value && activeOption.value && !activeOption.value.disabled) {
        event.preventDefault();
        selectOption(activeOption.value);
      }
      break;
    case 'Home':
      if (!isOpen.value) return;
      event.preventDefault();
      setInitialActiveIndex('first');
      break;
    case 'End':
      if (!isOpen.value) return;
      event.preventDefault();
      setInitialActiveIndex('last');
      break;
    case 'Tab':
      closeListbox(true);
      break;
    default:
      break;
  }
};

const onOptionPointerEnter = (index: number) => {
  const option = filteredOptions.value[index];

  if (option && !option.disabled) {
    activeIndex.value = index;
  }
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (rootRef.value?.contains(target)) return;
  closeListbox(true);
};

watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown);
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown);
  }
});

watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) {
      syncQueryFromSelection();
    }
  },
  { immediate: true },
);

watch(
  () => props.options,
  () => {
    if (!isOpen.value) {
      syncQueryFromSelection();
      return;
    }

    setInitialActiveIndex('first');
  },
  { deep: true },
);

watch(filteredOptions, () => {
  if (!isOpen.value) {
    return;
  }

  if (filteredOptions.value.length === 0) {
    activeIndex.value = -1;
    return;
  }

  const current = filteredOptions.value[activeIndex.value];

  if (!current || current.disabled) {
    setInitialActiveIndex('first');
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
    <div class="tree-combobox__control">
      <span
        v-if="$slots.prefix"
        class="tree-combobox__slot tree-combobox__slot--prefix"
      >
        <slot name="prefix" />
      </span>
      <input
        v-bind="inputAttrs"
        class="tree-combobox__input"
        role="combobox"
        type="text"
        :value="query"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-controls="isOpen ? listboxId : undefined"
        :aria-expanded="isOpen"
        :aria-activedescendant="activeDescendant"
        :aria-invalid="invalid || undefined"
        :aria-busy="loading || undefined"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        @input="onInput"
        @focus="onInputFocus"
        @click="onInputClick"
        @keydown="onInputKeydown"
      >
      <TreeSpinner
        v-if="loading"
        size="sm"
        label="Loading"
      />
      <svg
        v-else
        class="tree-combobox__indicator"
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
    </div>

    <transition name="tree-fade">
      <ul
        v-if="isOpen && !disabled"
        :id="listboxId"
        role="listbox"
        class="tree-combobox__listbox"
        :aria-label="listboxLabel"
        :aria-labelledby="listboxLabelledby"
      >
        <li
          v-if="filteredOptions.length === 0"
          class="tree-combobox__empty"
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
            :id="getOptionId(option.value)"
            :key="option.value"
            role="option"
            class="tree-combobox__option"
            :class="{
              'is-active': index === activeIndex,
              'is-disabled': option.disabled,
              'is-selected': option.value === modelValue,
            }"
            :aria-selected="option.value === modelValue"
            :aria-disabled="option.disabled || undefined"
            @mouseenter="onOptionPointerEnter(index)"
            @click="selectOption(option)"
          >
            <slot
              name="option"
              :option="option"
              :selected="option.value === modelValue"
              :active="index === activeIndex"
            >
              <span class="tree-combobox__option-copy">
                <span class="tree-combobox__option-label">{{ option.label }}</span>
                <span
                  v-if="option.description"
                  class="tree-combobox__option-description"
                >
                  {{ option.description }}
                </span>
              </span>
              <svg
                v-if="option.value === modelValue"
                class="tree-combobox__check"
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
            </slot>
          </li>
        </template>
      </ul>
    </transition>
  </div>
</template>
