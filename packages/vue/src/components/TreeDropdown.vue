<script setup lang="ts">
import { createId, isActivationKey, isEscapeKey } from '@treeui/utils';
import { computed, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

export interface TreeDropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    items?: TreeDropdownItem[];
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    size?: TreeSize;
    label?: string;
  }>(),
  {
    items: () => [],
    open: undefined,
    defaultOpen: false,
    disabled: false,
    size: 'md',
    label: '',
  },
);

const emit = defineEmits<{
  select: [value: string];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

defineSlots<{
  trigger(props: { isOpen: boolean }): unknown;
  item(props: { item: TreeDropdownItem; index: number }): unknown;
}>();

const attrs = useAttrs();
const menuId = createId('tree-dropdown');
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const itemRefs = ref<Map<string, HTMLElement>>(new Map());
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
  'tree-dropdown',
  `tree-dropdown--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-open': isOpen.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const enabledItems = computed(() => props.items.filter((i) => !i.disabled));

const openMenu = () => {
  if (props.disabled) return;
  focusedIndex.value = enabledItems.value.length > 0
    ? props.items.indexOf(enabledItems.value[0])
    : 0;
  setValue(true);
  nextTick(() => focusItem(focusedIndex.value));
};

const closeMenu = (restoreFocus = false) => {
  setValue(false);
  focusedIndex.value = -1;
  if (restoreFocus) {
    nextTick(() => triggerRef.value?.focus());
  }
};

const toggleMenu = () => {
  if (isOpen.value) {
    closeMenu();
  } else {
    openMenu();
  }
};

const selectItem = (item: TreeDropdownItem) => {
  if (item.disabled) return;
  emit('select', item.value);
  closeMenu(true);
};

const focusItem = (index: number) => {
  const item = props.items[index];
  if (!item) return;
  const el = itemRefs.value.get(item.value);
  el?.focus();
};

const setItemRef = (el: Element | null, value: string) => {
  if (el instanceof HTMLElement) {
    itemRefs.value.set(value, el);
  } else {
    itemRefs.value.delete(value);
  }
};

const moveFocus = (direction: 1 | -1) => {
  let nextIndex = focusedIndex.value + direction;
  while (nextIndex >= 0 && nextIndex < props.items.length) {
    if (!props.items[nextIndex].disabled) {
      focusedIndex.value = nextIndex;
      focusItem(nextIndex);
      return;
    }
    nextIndex += direction;
  }
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  if (isEscapeKey(event) && isOpen.value) {
    event.preventDefault();
    closeMenu();
    return;
  }

  if (isActivationKey(event) || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    openMenu();
  }
};

const onItemKeydown = (event: KeyboardEvent, item: TreeDropdownItem) => {
  if (isEscapeKey(event)) {
    event.preventDefault();
    closeMenu(true);
    return;
  }

  if (isActivationKey(event)) {
    event.preventDefault();
    selectItem(item);
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
      focusedIndex.value = enabledItems.value.length > 0
        ? props.items.indexOf(enabledItems.value[0])
        : 0;
      focusItem(focusedIndex.value);
      break;
    case 'End':
      event.preventDefault();
      focusedIndex.value = enabledItems.value.length > 0
        ? props.items.indexOf(enabledItems.value[enabledItems.value.length - 1])
        : props.items.length - 1;
      focusItem(focusedIndex.value);
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
  closeMenu();
};

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
    <span class="tree-dropdown__trigger-wrapper">
      <slot
        name="trigger"
        :is-open="isOpen"
      >
        <button
          ref="triggerRef"
          v-bind="triggerAttrs"
          type="button"
          class="tree-dropdown__trigger"
          :disabled="disabled"
          :aria-controls="isOpen ? menuId : undefined"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
          @click="toggleMenu"
          @keydown="onTriggerKeydown"
        >
          <span class="tree-dropdown__label">{{ label }}</span>
          <svg
            class="tree-dropdown__chevron"
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
      </slot>
    </span>
    <transition name="tree-fade">
      <ul
        v-if="isOpen && !disabled"
        :id="menuId"
        role="menu"
        class="tree-dropdown__menu"
        :aria-label="label || undefined"
      >
        <li
          v-for="(item, index) in items"
          :key="item.value"
          :ref="(el) => setItemRef(el as Element | null, item.value)"
          role="menuitem"
          class="tree-dropdown__item"
          :class="{
            'is-disabled': item.disabled,
            'is-focused': index === focusedIndex,
          }"
          :aria-disabled="item.disabled || undefined"
          :tabindex="item.disabled ? -1 : 0"
          @click="selectItem(item)"
          @keydown="onItemKeydown($event, item)"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
          >
            {{ item.label }}
          </slot>
        </li>
      </ul>
    </transition>
  </div>
</template>
