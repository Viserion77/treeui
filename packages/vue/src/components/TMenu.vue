<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, toRef, watch } from 'vue';
import { getNextEnabledIndex } from '@treeui/utils';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TSize, TTooltipSide } from '../types/contracts';
import TPopover from './TPopover.vue';
import { treeMenuInjectionKey, type TMenuItemHandle } from './menu-context';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    side?: TTooltipSide;
    align?: 'start' | 'center' | 'end';
    size?: TSize;
    /** Accessible name for the `role="menu"` element. */
    label?: string;
    /** Close the menu when an item is chosen. */
    closeOnSelect?: boolean;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    side: 'bottom',
    align: 'start',
    size: 'md',
    label: undefined,
    closeOnSelect: true,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

defineSlots<{
  trigger(props: { isOpen: boolean; contentId: string }): unknown;
  /** Panel header, rendered outside the `role="menu"` element. */
  header(): unknown;
  default(): unknown;
}>();

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const items = ref<TMenuItemHandle[]>([]);
const activeId = ref<string | null>(null);

const registerItem = (handle: TMenuItemHandle) => {
  items.value.push(handle);
};

const unregisterItem = (id: string) => {
  items.value = items.value.filter((item) => item.id !== id);
  if (activeId.value === id) activeId.value = null;
};

const setActive = (id: string) => {
  activeId.value = id;
};

// Items in document order — robust against registration order across groups.
const orderedItems = () =>
  [...items.value]
    .filter((item) => item.getElement())
    .sort((a, b) => {
      const ea = a.getElement();
      const eb = b.getElement();
      if (!ea || !eb) return 0;
      return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

const focusItem = (handle: TMenuItemHandle | undefined) => {
  if (!handle) return;
  activeId.value = handle.id;
  handle.getElement()?.focus();
};

const focusEdge = (edge: 'first' | 'last') => {
  const enabled = orderedItems().filter((item) => !item.isDisabled());
  focusItem(edge === 'first' ? enabled[0] : enabled[enabled.length - 1]);
};

// Give the first enabled item the roving tabindex without moving focus — for a
// menu that is already open on mount (defaultOpen), so keyboard entry works
// without stealing focus on load.
const activateFirst = () => {
  const first = orderedItems().find((item) => !item.isDisabled());
  if (first) activeId.value = first.id;
};

const move = (direction: 1 | -1) => {
  const list = orderedItems();
  if (!list.length) return;
  const current = list.findIndex((item) => item.id === activeId.value);
  const start = current < 0 ? (direction === 1 ? -1 : 0) : current;
  const next = getNextEnabledIndex(
    start,
    list.map((item) => ({ disabled: item.isDisabled() })),
    direction,
    true,
  );
  focusItem(list[next]);
};

// Escape is intentionally not handled here: it bubbles to the popover content,
// which closes and restores focus to the trigger (TREEUX-015).
const onKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      move(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      move(-1);
      break;
    case 'Home':
      event.preventDefault();
      focusEdge('first');
      break;
    case 'End':
      event.preventDefault();
      focusEdge('last');
      break;
    default:
      break;
  }
};

// Closing via the controllable open state routes through the popover's own
// close heuristic (focus is on the chosen item → returns to the trigger).
const activate = () => {
  if (props.closeOnSelect) setValue(false);
};

watch(isOpen, (value) => {
  if (value) {
    nextTick(() => focusEdge('first'));
  } else {
    activeId.value = null;
  }
});

onMounted(() => {
  if (isOpen.value) nextTick(activateFirst);
});

provide(treeMenuInjectionKey, {
  registerItem,
  unregisterItem,
  activeId,
  setActive,
  onKeydown,
  activate,
});

const menuAriaLabel = computed(() => props.label);
</script>

<template>
  <TPopover
    :open="isOpen"
    :disabled="disabled"
    :side="side"
    :align="align"
    :size="size"
    @update:open="setValue"
  >
    <template #trigger="slotProps">
      <slot
        name="trigger"
        v-bind="slotProps"
      />
    </template>
    <template #default>
      <div
        v-if="$slots.header"
        class="t-menu__header"
      >
        <slot name="header" />
      </div>
      <div
        class="t-menu"
        role="menu"
        :aria-label="menuAriaLabel"
        @keydown="onKeydown"
      >
        <slot />
      </div>
    </template>
  </TPopover>
</template>
