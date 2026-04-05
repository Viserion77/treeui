<script setup lang="ts">
import { createId, isActivationKey, isEscapeKey } from '@treeui/utils';
import { computed, nextTick, onBeforeUnmount, ref, toRef, watch } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';

export interface TreeContextMenuItem {
  label: string;
  value: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    items?: TreeContextMenuItem[];
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    size?: TreeSize;
  }>(),
  {
    items: () => [],
    open: undefined,
    defaultOpen: false,
    disabled: false,
    size: 'md',
  },
);

const emit = defineEmits<{
  select: [value: string];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

defineSlots<{
  default(): unknown;
  item(props: { item: TreeContextMenuItem; index: number }): unknown;
}>();

const menuId = createId('tree-context-menu');
const rootRef = ref<HTMLElement | null>(null);
const itemRefs = ref<Map<string, HTMLElement>>(new Map());
const focusedIndex = ref(-1);
const menuPosition = ref({ x: 0, y: 0 });

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const rootClasses = computed(() => [
  'tree-context-menu',
  `tree-context-menu--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-open': isOpen.value,
  },
]);

const enabledItems = computed(() => props.items.filter((i) => !i.disabled));

const openMenu = (x: number, y: number) => {
  if (props.disabled) return;
  menuPosition.value = { x, y };
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
    nextTick(() => rootRef.value?.focus());
  }
};

const selectItem = (item: TreeContextMenuItem) => {
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

const onContextMenu = (event: MouseEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  openMenu(event.clientX, event.clientY);
};

const onItemKeydown = (event: KeyboardEvent, item: TreeContextMenuItem) => {
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
  const menuEl = document.getElementById(menuId);
  if (menuEl?.contains(target)) return;
  closeMenu();
};

const onDocumentContextMenu = (event: MouseEvent) => {
  if (!isOpen.value) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (rootRef.value?.contains(target)) return;
  closeMenu();
};

watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown);
    document.addEventListener('contextmenu', onDocumentContextMenu);
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown);
    document.removeEventListener('contextmenu', onDocumentContextMenu);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
  document.removeEventListener('contextmenu', onDocumentContextMenu);
});
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :data-state="isOpen ? 'open' : 'closed'"
    @contextmenu="onContextMenu"
  >
    <slot />
    <Teleport to="body">
      <transition name="tree-fade">
        <ul
          v-if="isOpen && !disabled"
          :id="menuId"
          role="menu"
          class="tree-context-menu__menu"
          :class="`tree-context-menu--${size}`"
          :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }"
          aria-label="Context menu"
        >
          <li
            v-for="(item, index) in items"
            :key="item.value"
            :ref="(el) => setItemRef(el as Element | null, item.value)"
            role="menuitem"
            class="tree-context-menu__item"
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
    </Teleport>
  </div>
</template>
