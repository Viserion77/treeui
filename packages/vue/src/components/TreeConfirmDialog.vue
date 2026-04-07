<script setup lang="ts">
import { computed, toRef, useAttrs } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize, TreeVariant } from '../types/contracts';
import TreeButton from './TreeButton.vue';
import TreeModal from './TreeModal.vue';

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
    size?: TreeSize;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: TreeVariant;
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
    confirmVariant: 'danger',
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
  'tree-confirm-dialog',
  {
    'tree-confirm-dialog--with-icon': Boolean(slots.icon),
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
  <TreeModal
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
          class="tree-confirm-dialog__icon"
          aria-hidden="true"
        >
          <slot name="icon" />
        </div>

        <div
          v-if="hasBodyContent"
          class="tree-confirm-dialog__body"
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
        <TreeButton
          variant="ghost"
          :disabled="cancelDisabled"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </TreeButton>
        <TreeButton
          :variant="confirmVariant"
          :loading="loading"
          :disabled="confirmDisabled"
          @click="handleConfirm"
        >
          {{ confirmLabel }}
        </TreeButton>
      </slot>
    </template>
  </TreeModal>
</template>
