<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { createId, focusFirst, isEscapeKey } from '@treeui/utils';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TSize, TTooltipSide } from '../types/contracts';

export interface TPopoverCloseOptions {
  /**
   * Force focus back to the trigger (`true`) or suppress it (`false`). Omit for
   * the default: restore only if focus is inside the panel at close time.
   */
  restoreFocus?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    side?: TTooltipSide;
    align?: 'start' | 'center' | 'end';
    /** Panel density. Scales the content padding by the shared size tokens. */
    size?: TSize;
    id?: string;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    side: 'bottom',
    align: 'center',
    size: 'md',
    id: undefined,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

defineSlots<{
  trigger(props: { isOpen: boolean; contentId: string }): unknown;
  default(props: { close: (options?: TPopoverCloseOptions) => void }): unknown;
}>();

const attrs = useAttrs();
const contentId = props.id ?? createId('t-popover');
const rootRef = ref<HTMLElement | null>(null);
// Bound to the anchor wrapper, not the fallback button: the fallback does not
// render when a consumer supplies a `trigger` slot, so a ref on it would be
// null exactly when focus restoration matters most. focusFirst() resolves the
// real trigger either way. Mirrors TDropdown's trigger-wrapper ref.
const triggerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

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
  't-popover',
  {
    'is-open': isOpen.value,
    'is-disabled': props.disabled,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const contentClasses = computed(() => [
  't-popover__content',
  `t-popover__content--${props.side}`,
  `t-popover__content--align-${props.align}`,
  `t-popover__content--${props.size}`,
]);

const openPopover = () => {
  if (props.disabled) return;
  setValue(true);
  nextTick(() => {
    if (contentRef.value) {
      if (!focusFirst(contentRef.value)) {
        contentRef.value.focus();
      }
    }
  });
};

const focusIsInsidePanel = () => {
  const active = typeof document === 'undefined' ? null : document.activeElement;
  return Boolean(contentRef.value && active && contentRef.value.contains(active));
};

const restoreTriggerFocus = () => {
  nextTick(() => {
    if (triggerRef.value) focusFirst(triggerRef.value);
  });
};

// Restore decision for the pending close, captured before the panel unmounts.
// `null` means "not set by a programmatic close" — the isOpen watcher then
// applies the default heuristic, which also covers an external v-model change.
let pendingRestore: boolean | null = null;

// All programmatic closes route through here so the restore decision is made
// while focus is still where the caller left it. `'auto'` = restore only if
// focus is currently inside the panel.
const requestClose = (restore: boolean | 'auto') => {
  if (!isOpen.value) return;
  pendingRestore = restore === 'auto' ? focusIsInsidePanel() : restore;
  setValue(false);
};

/**
 * Close the popover. Without options, focus returns to the trigger only if it is
 * inside the panel at close time; pass `restoreFocus` to force or suppress it.
 * Exposed via template ref and to the default slot.
 */
const close = (options?: TPopoverCloseOptions) =>
  requestClose(options?.restoreFocus ?? 'auto');

const togglePopover = () => {
  if (isOpen.value) {
    requestClose('auto');
  } else {
    openPopover();
  }
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  // Escape always restores focus to the trigger.
  if (isEscapeKey(event) && isOpen.value) {
    event.preventDefault();
    requestClose(true);
  }
};

const onContentKeydown = (event: KeyboardEvent) => {
  if (isEscapeKey(event)) {
    event.preventDefault();
    requestClose(true);
  }
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (rootRef.value?.contains(target)) return;
  // The user is interacting elsewhere — never pull focus back to the trigger.
  requestClose(false);
};

watch(isOpen, (value, previous) => {
  if (value) {
    pendingRestore = null;
    document.addEventListener('pointerdown', onDocumentPointerDown);
    return;
  }

  document.removeEventListener('pointerdown', onDocumentPointerDown);
  if (!previous) return;

  // Covers programmatic closes (pendingRestore set by requestClose) and an
  // external v-model true→false (pendingRestore null → default heuristic).
  const shouldRestore = pendingRestore ?? focusIsInsidePanel();
  pendingRestore = null;
  if (shouldRestore) restoreTriggerFocus();
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
});

defineExpose({ close });
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :style="rootStyle"
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <div
      ref="triggerRef"
      class="t-popover__anchor"
      @click="togglePopover"
      @keydown="onTriggerKeydown"
    >
      <slot
        name="trigger"
        :is-open="isOpen"
        :content-id="contentId"
      >
        <button
          type="button"
          class="t-popover__trigger"
          :disabled="disabled"
          :aria-expanded="isOpen"
          :aria-controls="isOpen ? contentId : undefined"
          aria-haspopup="dialog"
          v-bind="triggerAttrs"
        />
      </slot>
    </div>
    <transition name="t-popover-fade">
      <div
        v-if="isOpen && !disabled"
        :id="contentId"
        ref="contentRef"
        role="dialog"
        :class="contentClasses"
        :data-state="isOpen ? 'open' : 'closed'"
        tabindex="-1"
        @keydown="onContentKeydown"
      >
        <slot :close="close" />
      </div>
    </transition>
  </div>
</template>
