<script setup lang="ts">
import { createId, focusFirst, isActivationKey, isEscapeKey } from '@treeui/utils';
import { resolveTreeIcon, treeIconDefaults, type TIconInput } from '@treeui/icons';
import { computed, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

export interface TDropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
  /**
   * Leading icon — a registered name or a component, same `TIconInput` the rest
   * of the library uses. Rendered `aria-hidden`, since the label names the item.
   */
  icon?: TIconInput;
  /**
   * The item currently in effect (the active locale in a language menu, the
   * active sort). Emits the right ARIA for the menu's semantics — `aria-checked`
   * on a `menuitemradio` — instead of leaving the state to a slot with no
   * semantics at all, which is what the `#item` slot forced.
   */
  selected?: boolean;
}

export type TDropdownAlign = 'start' | 'end';

const props = withDefaults(
  defineProps<{
    items?: TDropdownItem[];
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    size?: TSize;
    label?: string;
    align?: TDropdownAlign;
    id?: string;
  }>(),
  {
    items: () => [],
    open: undefined,
    defaultOpen: false,
    disabled: false,
    size: 'md',
    label: '',
    align: 'start',
    id: undefined,
  },
);

const emit = defineEmits<{
  select: [value: string];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

defineSlots<{
  /**
   * `triggerProps` is the headless half of this slot: `v-bind` it onto your own
   * control and it carries the ARIA the built-in trigger has
   * (`aria-haspopup`, `aria-expanded`, `aria-controls`) plus `disabled`.
   * Without it a custom trigger announced only "button" — it did not say it
   * opens a menu, nor whether the menu was open — and the fix at the call site
   * was three attributes replicated per consumer.
   */
  trigger(props: {
    isOpen: boolean;
    menuId: string;
    triggerProps: {
      'aria-haspopup': 'menu';
      'aria-expanded': boolean;
      'aria-controls': string | undefined;
      disabled: boolean | undefined;
    };
  }): unknown;
  item(props: { item: TDropdownItem; index: number }): unknown;
}>();

const attrs = useAttrs();
const menuId = props.id ?? createId('t-dropdown');
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const itemRefs = ref<Map<string, HTMLElement>>(new Map());
const focusedIndex = ref(-1);

const triggerAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

/** The same ARIA the built-in trigger carries, for a slotted one to v-bind. */
const triggerProps = computed(() => ({
  'aria-haspopup': 'menu' as const,
  'aria-expanded': isOpen.value,
  'aria-controls': isOpen.value ? menuId : undefined,
  disabled: props.disabled || undefined,
}));

/** Reserve the icon gutter as soon as ANY item has an icon, so labels line up. */
const hasItemIcons = computed(() => props.items.some((item) => Boolean(item.icon)));

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const rootClasses = computed(() => [
  't-dropdown',
  `t-dropdown--${props.size}`,
  {
    't-dropdown--align-end': props.align === 'end',
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
    nextTick(() => {
      if (triggerRef.value) focusFirst(triggerRef.value);
    });
  }
};

const toggleMenu = () => {
  if (props.disabled) return;
  if (isOpen.value) {
    closeMenu();
  } else {
    openMenu();
  }
};

const selectItem = (item: TDropdownItem) => {
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

const onItemKeydown = (event: KeyboardEvent, item: TDropdownItem) => {
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
    <span
      ref="triggerRef"
      class="t-dropdown__trigger-wrapper"
      @click="toggleMenu"
      @keydown="onTriggerKeydown"
    >
      <slot
        name="trigger"
        :is-open="isOpen"
        :menu-id="menuId"
        :trigger-props="triggerProps"
      >
        <button
          v-bind="triggerAttrs"
          type="button"
          class="t-dropdown__trigger"
          :disabled="disabled"
          :aria-controls="isOpen ? menuId : undefined"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
        >
          <span class="t-dropdown__label">{{ label }}</span>
          <svg
            class="t-dropdown__chevron"
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
    <transition name="t-fade">
      <ul
        v-if="isOpen && !disabled"
        :id="menuId"
        role="menu"
        class="t-dropdown__menu"
        :class="{ 'has-icons': hasItemIcons }"
        :aria-label="label || undefined"
      >
        <li
          v-for="(item, index) in items"
          :key="item.value"
          :ref="(el) => setItemRef(el as Element | null, item.value)"
          :role="item.selected === undefined ? 'menuitem' : 'menuitemradio'"
          class="t-dropdown__item"
          :class="{
            'is-disabled': item.disabled,
            'is-focused': index === focusedIndex,
            'is-selected': item.selected,
          }"
          :aria-disabled="item.disabled || undefined"
          :aria-checked="item.selected === undefined ? undefined : item.selected"
          :tabindex="item.disabled ? -1 : 0"
          @click="selectItem(item)"
          @keydown="onItemKeydown($event, item)"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
          >
            <span
              v-if="hasItemIcons"
              class="t-dropdown__item-icon"
              aria-hidden="true"
            >
              <component
                :is="resolveTreeIcon(item.icon)"
                v-if="item.icon"
                v-bind="treeIconDefaults"
              />
            </span>
            <span class="t-dropdown__item-label">{{ item.label }}</span>
          </slot>
        </li>
      </ul>
    </transition>
  </div>
</template>
