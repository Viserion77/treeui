<script setup lang="ts">
import { computed, toRef, useAttrs } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TActionTone, TSize, TVariant } from '../types/contracts';
import TButton from './TButton.vue';
import TModal from './TModal.vue';

defineOptions({
  inheritAttrs: false,
});

const slots = defineSlots<{
  trigger?: () => unknown;
  icon?: () => unknown;
  default?: () => unknown;
  actions?: (props: {
    confirm: () => void;
    cancel: () => void;
    loading: boolean;
  }) => unknown;
}>();

const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    size?: TSize;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /**
     * Shape of the confirm button. The default moved from `danger` to `solid`
     * when `danger` was deprecated: leaving it made every dialog in an app emit
     * the deprecation warning from INSIDE the library, which the consumer could
     * not silence without reimplementing the footer through the `actions` slot —
     * exactly the local reimplementation the contract rejects.
     */
    confirmVariant?: TVariant;
    /**
     * Colour of the confirm button, forwarded to its `tone`. Defaults to
     * `danger`, because confirming is overwhelmingly destructive here — so the
     * dialog looks the same as before while the deprecated value is gone.
     * "It composes through TButton" was wrong for this component: the dialog
     * owns the button, so there is no call site to compose from.
     */
    confirmTone?: TActionTone;
    confirmDisabled?: boolean;
    cancelDisabled?: boolean;
    loading?: boolean;
    closeOnEscape?: boolean;
    closeOnOverlay?: boolean;
    showCloseButton?: boolean;
    closeLabel?: string;
    closeOnConfirm?: boolean;
    closeOnCancel?: boolean;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    size: 'sm',
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmVariant: 'solid',
    confirmTone: 'danger',
    confirmDisabled: false,
    cancelDisabled: false,
    loading: false,
    closeOnEscape: true,
    closeOnOverlay: false,
    showCloseButton: false,
    closeLabel: 'Close dialog',
    closeOnConfirm: true,
    closeOnCancel: true,
  },
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

const attrs = useAttrs();

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const dialogClasses = computed(() => [
  't-confirm-dialog',
  {
    't-confirm-dialog--with-icon': Boolean(slots.icon),
  },
]);

const hasBodyContent = computed(() => Boolean(slots.default));

const closeDialog = () => {
  setValue(false);
};

const syncOpen = (value: boolean) => {
  setValue(value);
};

const handleCancel = () => {
  if (props.cancelDisabled) {
    return;
  }

  emit('cancel');

  if (props.closeOnCancel) {
    closeDialog();
  }
};

const handleConfirm = () => {
  if (props.confirmDisabled || props.loading) {
    return;
  }

  emit('confirm');

  if (props.closeOnConfirm) {
    closeDialog();
  }
};
</script>

<template>
  <TModal
    v-bind="attrs"
    :open="isOpen"
    :disabled="disabled"
    :size="size"
    :title="title"
    :description="description"
    :close-on-escape="closeOnEscape"
    :close-on-overlay="closeOnOverlay"
    :show-close-button="showCloseButton"
    :close-label="closeLabel"
    @update:open="syncOpen"
  >
    <template
      v-if="$slots.trigger"
      #trigger
    >
      <slot name="trigger" />
    </template>

    <template #content>
      <div :class="dialogClasses">
        <div
          v-if="$slots.icon"
          class="t-confirm-dialog__icon"
          aria-hidden="true"
        >
          <slot name="icon" />
        </div>

        <div
          v-if="hasBodyContent"
          class="t-confirm-dialog__body"
        >
          <slot />
        </div>
      </div>
    </template>

    <template #footer>
      <slot
        name="actions"
        :confirm="handleConfirm"
        :cancel="handleCancel"
        :loading="loading"
      >
        <TButton
          variant="ghost"
          :disabled="cancelDisabled"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </TButton>
        <TButton
          :variant="confirmVariant"
          :tone="confirmTone"
          :loading="loading"
          :disabled="confirmDisabled"
          @click="handleConfirm"
        >
          {{ confirmLabel }}
        </TButton>
      </slot>
    </template>
  </TModal>
</template>
