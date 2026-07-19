<script setup lang="ts">
import { createId, isActivationKey, isEscapeKey } from '@treeui/utils';
import { computed, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TFieldWidth, TSize } from '../types/contracts';
import TFlag from './TFlag.vue';
import TIcon from './TIcon.vue';
import TSpinner from './TSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

/**
 * `field` is a form control: it reads as the value of a labelled question, so the
 * flag leads and the trigger fills its container.
 *
 * `switcher` is a page-level control, typically in a navbar, where nothing nearby
 * says what it changes. The translate icon states the purpose up front and the
 * current flag closes the row, so the whole thing reads as "page language, now
 * set to this" without an external label.
 */
export type TLanguageSelectVariant = 'field' | 'switcher';

export interface TLanguageOption {
  label: string;
  /** Opaque application key — typically a BCP-47 tag. Never parsed or validated. */
  value: string;
  /** ISO 3166-1 alpha-2 code for the flag. Omit to render the option without one. */
  code?: string;
  /** Secondary line, e.g. the language's endonym. */
  description?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options?: TLanguageOption[];
    open?: boolean;
    defaultOpen?: boolean;
    size?: TSize;
    variant?: TLanguageSelectVariant;
    /** Hide the language name, leaving icon + flag. `switcher` only. */
    iconOnly?: boolean;
    /** Inline-size cap. Fluid (`full`) by default. */
    width?: TFieldWidth;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    placeholder?: string;
    /** Forwarded to every nested TFlag. Set once here to self-host flag assets. */
    flagBaseUrl?: string;
    emptyText?: string;
  }>(),
  {
    modelValue: '',
    options: () => [],
    open: undefined,
    defaultOpen: false,
    size: 'md',
    variant: 'field',
    iconOnly: false,
    width: 'full',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: '',
    flagBaseUrl: undefined,
    emptyText: 'No languages available.',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

defineSlots<{
  prefix?: () => unknown;
  option?: (props: { option: TLanguageOption; selected: boolean; focused: boolean }) => unknown;
  empty?: () => unknown;
}>();

const attrs = useAttrs();
const listboxId = createId('t-language-select');
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);
const optionRefs = ref<Map<string, HTMLElement>>(new Map());
const focusedIndex = ref(-1);
const dropUp = ref(false);

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

const isSwitcher = computed(() => props.variant === 'switcher');

const rootClasses = computed(() => [
  't-language-select',
  `t-language-select--${props.size}`,
  `t-language-select--${props.variant}`,
  // A switcher sizes to its content, so the field width scale does not apply.
  !isSwitcher.value && props.width !== 'full' ? `t-field-width--${props.width}` : null,
  {
    't-language-select--icon-only': isSwitcher.value && props.iconOnly,
    't-language-select--drop-up': dropUp.value,
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
    'is-open': isOpen.value,
  },
  attrs.class,
]);

// Nearest ancestor that can clip the listbox (scroll container or hidden overflow).
const findClippingAncestor = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};

// Flip the listbox above the trigger when its rendered position overflows the
// nearest clipping ancestor (e.g. a modal body) or the viewport, and there is
// more room above the trigger than below it. Measuring the rendered rect keeps
// the decision in sync with the CSS offset (--tree-space-2) automatically.
const updateDropDirection = () => {
  const trigger = triggerRef.value;
  const listbox = listboxRef.value;
  if (!trigger || !listbox) {
    dropUp.value = false;
    return;
  }
  const triggerRect = trigger.getBoundingClientRect();
  const listboxRect = listbox.getBoundingClientRect();
  const boundary = findClippingAncestor(trigger)?.getBoundingClientRect();
  const bottomLimit = Math.min(boundary?.bottom ?? Infinity, window.innerHeight);
  const topLimit = Math.max(boundary?.top ?? 0, 0);
  const spaceBelow = bottomLimit - triggerRect.bottom;
  const spaceAbove = triggerRect.top - topLimit;
  dropUp.value = listboxRect.bottom > bottomLimit && spaceAbove > spaceBelow;
};

const rootStyle = computed(() => attrs.style);

const selectedOption = computed(() =>
  props.options.find((o) => o.value === props.modelValue),
);

const selectedLabel = computed(() => selectedOption.value?.label ?? '');

// iconOnly leans on the flag to carry the current value. With no flag to show it
// would leave the trigger stating nothing at all, so the name comes back.
const showValue = computed(
  () => !(isSwitcher.value && props.iconOnly) || !selectedOption.value?.code,
);

const enabledOptions = computed(() =>
  props.options.filter((o) => !o.disabled),
);

// Runs for every open, however it was triggered. The listbox can also be opened
// through `open` / `defaultOpen` without going near openDropdown(), so this lives
// on the isOpen watcher rather than inside the click handler.
const onOpened = () => {
  const selectedIdx = props.options.findIndex((o) => o.value === props.modelValue);
  focusedIndex.value = selectedIdx >= 0 ? selectedIdx : 0;
  // Render downward first so the measurement always starts from the default position.
  dropUp.value = false;
  nextTick(() => {
    updateDropDirection();
    focusOption(focusedIndex.value);
  });
};

const openDropdown = () => {
  if (props.disabled) return;
  setValue(true);
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

const selectOption = (opt: TLanguageOption) => {
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

const setOptionRef = (el: Element | null, value: string) => {
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

const onOptionKeydown = (event: KeyboardEvent, opt: TLanguageOption, _index: number) => {
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

const hasSelection = computed(() => props.modelValue !== '');

// immediate, so a listbox that is already open on mount (`defaultOpen`, or a
// controlled `open` that starts true) still dismisses on outside click and still
// measures its drop direction.
watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown);
    onOpened();
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown);
  }
}, { immediate: true });

// Options can shrink underneath an open listbox. Leaving focusedIndex past the
// end would strand moveFocus(), which only ever walks outward from it.
watch(
  () => props.options.length,
  (length) => {
    if (isOpen.value && focusedIndex.value >= length) {
      focusedIndex.value = length - 1;
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
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <button
      ref="triggerRef"
      v-bind="triggerAttrs"
      type="button"
      class="t-language-select__trigger"
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
        class="t-language-select__slot t-language-select__slot--prefix"
      >
        <slot name="prefix" />
      </span>
      <!--
        The switcher leads with the translate icon so the control announces what
        it changes; the field leads with the flag, since a form label already
        does that job.
      -->
      <!-- Sized in CSS from the icon token scale, not TIcon's pixel `size` prop. -->
      <TIcon
        v-if="isSwitcher"
        name="languages"
        class="t-language-select__translate"
      />
      <TFlag
        v-else-if="selectedOption?.code"
        :code="selectedOption.code"
        :base-url="flagBaseUrl"
        :size="size"
      />
      <span
        v-if="showValue"
        class="t-language-select__value"
        :data-placeholder="!hasSelection ? true : undefined"
      >
        {{ selectedLabel || placeholder }}
      </span>
      <TFlag
        v-if="isSwitcher && selectedOption?.code"
        :code="selectedOption.code"
        :base-url="flagBaseUrl"
        :size="size"
      />
      <TSpinner
        v-if="loading"
        size="sm"
        label="Loading"
      />
      <svg
        v-else
        class="t-language-select__chevron"
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
    <transition name="t-fade">
      <ul
        v-if="isOpen && !disabled"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        class="t-language-select__listbox"
        :aria-label="typeof triggerAttrs['aria-label'] === 'string' ? triggerAttrs['aria-label'] : undefined"
      >
        <li
          v-if="options.length === 0"
          class="t-language-select__empty"
          role="presentation"
        >
          <slot name="empty">
            {{ emptyText }}
          </slot>
        </li>
        <li
          v-for="(opt, index) in options"
          :key="opt.value"
          :ref="(el) => setOptionRef(el as Element | null, opt.value)"
          role="option"
          class="t-language-select__option"
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
          <slot
            name="option"
            :option="opt"
            :selected="opt.value === modelValue"
            :focused="index === focusedIndex"
          >
            <TFlag
              v-if="opt.code"
              :code="opt.code"
              :base-url="flagBaseUrl"
              :size="size"
            />
            <span class="t-language-select__option-text">
              <span class="t-language-select__option-label">{{ opt.label }}</span>
              <span
                v-if="opt.description"
                class="t-language-select__description"
              >
                {{ opt.description }}
              </span>
            </span>
          </slot>
          <svg
            v-if="opt.value === modelValue"
            class="t-language-select__check"
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
