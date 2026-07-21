<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from 'vue';
import { createId, focusFirst, isEscapeKey } from '@treeui/utils';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TSize, TTooltipSide } from '../types/contracts';

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
  default(): unknown;
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

const closePopover = (restoreFocus = false) => {
  setValue(false);
  if (restoreFocus) {
    nextTick(() => {
      if (triggerRef.value) focusFirst(triggerRef.value);
    });
  }
};

const togglePopover = () => {
  if (isOpen.value) {
    closePopover();
  } else {
    openPopover();
  }
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  if (isEscapeKey(event) && isOpen.value) {
    event.preventDefault();
    closePopover();
  }
};

const onContentKeydown = (event: KeyboardEvent) => {
  if (isEscapeKey(event)) {
    event.preventDefault();
    closePopover(true);
  }
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (rootRef.value?.contains(target)) return;
  closePopover();
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
        <slot />
      </div>
    </transition>
  </div>
</template>
