<script setup lang="ts">
import {
  createId,
  focusFirst,
  focusLast,
  getFocusableElements,
  isEscapeKey,
} from '@treeui/utils';
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  toRef,
  useAttrs,
  watch,
} from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const CloseIcon = getTreeIcon('x');

const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    size?: TreeSize;
    title?: string;
    description?: string;
    closeOnEscape?: boolean;
    closeOnOverlay?: boolean;
    showCloseButton?: boolean;
    closeLabel?: string;
    id?: string;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    size: 'md',
    title: '',
    description: '',
    closeOnEscape: true,
    closeOnOverlay: true,
    showCloseButton: true,
    closeLabel: 'Close modal',
    id: undefined,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

const attrs = useAttrs();
const modalId = props.id ?? createId('tree-modal');
const titleId = `${modalId}-title`;
const descriptionId = `${modalId}-description`;
const rootRef = ref<HTMLElement | null>(null);
const surfaceRef = ref<HTMLElement | null>(null);
const previousFocusedElement = ref<HTMLElement | null>(null);
const hasHeaderContent = computed(() => Boolean(props.title || slots.header));

const slots = defineSlots<{
  default?: () => unknown;
  trigger?: () => unknown;
  header?: () => unknown;
  content?: () => unknown;
  footer?: () => unknown;
}>();

const rootClasses = computed(() => ['tree-modal', attrs.class]);
const rootStyle = computed(() => attrs.style);
const triggerAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const surfaceClasses = computed(() => [
  'tree-modal__surface',
  `tree-modal__surface--${props.size}`,
]);

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const labelledBy = computed(() => (hasHeaderContent.value ? titleId : undefined));
const describedBy = computed(() => (props.description ? descriptionId : undefined));

let openOverlayCount = 0;
let previousBodyOverflow = '';

const lockBodyScroll = () => {
  if (typeof document === 'undefined') {
    return;
  }

  if (openOverlayCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  openOverlayCount += 1;
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined' || openOverlayCount === 0) {
    return;
  }

  openOverlayCount -= 1;

  if (openOverlayCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
};

const focusSurface = () => {
  nextTick(() => {
    if (!surfaceRef.value) {
      return;
    }

    const focused = focusFirst(surfaceRef.value);
    if (!focused) {
      surfaceRef.value.focus();
    }
  });
};

const openModal = () => {
  if (props.disabled) {
    return;
  }

  previousFocusedElement.value = document.activeElement as HTMLElement | null;
  setValue(true);
};

const closeModal = () => {
  setValue(false);
};

const onTriggerClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (event.defaultPrevented) {
    return;
  }

  openModal();
};

const onOverlayClick = () => {
  if (!props.closeOnOverlay) {
    return;
  }

  closeModal();
};

const onSurfaceClick = (event: MouseEvent) => {
  event.stopPropagation();
};

const onKeydown = (event: KeyboardEvent) => {
  if (isEscapeKey(event) && props.closeOnEscape) {
    event.preventDefault();
    closeModal();
    return;
  }

  if (event.key !== 'Tab' || !surfaceRef.value) {
    return;
  }

  const focusable = getFocusableElements(surfaceRef.value);

  if (!focusable.length) {
    event.preventDefault();
    surfaceRef.value.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement as HTMLElement | null;

  if (event.shiftKey && activeElement === first) {
    event.preventDefault();
    focusLast(surfaceRef.value);
  }

  if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    focusFirst(surfaceRef.value);
  }
};

watch(isOpen, (value, previousValue) => {
  if (value) {
    lockBodyScroll();
    focusSurface();
    return;
  }

  if (previousValue) {
    unlockBodyScroll();
    nextTick(() => {
      previousFocusedElement.value?.focus();
    });
  }
});

onBeforeUnmount(() => {
  if (isOpen.value) {
    unlockBodyScroll();
  }
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
      v-if="$slots.trigger"
      class="tree-modal__trigger"
      v-bind="triggerAttrs"
      :aria-disabled="disabled || undefined"
      @click="onTriggerClick"
    >
      <slot name="trigger" />
    </span>

    <Teleport to="body">
      <transition name="tree-modal-fade">
        <div
          v-if="isOpen"
          class="tree-modal__portal"
          :data-state="isOpen ? 'open' : 'closed'"
        >
          <div
            class="tree-modal__backdrop"
            aria-hidden="true"
            @click="onOverlayClick"
          />
          <div class="tree-modal__positioner">
            <div
              :id="modalId"
              ref="surfaceRef"
              :class="surfaceClasses"
              role="dialog"
              aria-modal="true"
              :aria-labelledby="labelledBy"
              :aria-describedby="describedBy"
              tabindex="-1"
              @click="onSurfaceClick"
              @keydown="onKeydown"
            >
              <div
                v-if="hasHeaderContent || showCloseButton"
                class="tree-modal__topbar"
              >
                <div
                  v-if="hasHeaderContent"
                  :id="titleId"
                  class="tree-modal__header"
                >
                  <slot name="header">
                    <h2 class="tree-modal__title">
                      {{ title }}
                    </h2>
                  </slot>
                </div>
                <button
                  v-if="showCloseButton"
                  type="button"
                  class="tree-modal__close"
                  :aria-label="closeLabel"
                  @click="closeModal"
                >
                  <CloseIcon v-bind="treeIconDefaults" />
                </button>
              </div>

              <p
                v-if="description"
                :id="descriptionId"
                class="tree-modal__description"
              >
                {{ description }}
              </p>

              <div class="tree-modal__body">
                <slot name="content">
                  <slot />
                </slot>
              </div>

              <div
                v-if="$slots.footer"
                class="tree-modal__footer"
              >
                <slot name="footer" />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>
