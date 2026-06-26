<script setup lang="ts">
import { createId } from '@treeui/utils';
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';
import { computed } from 'vue';
import type { ToastItem } from '../composables/useToast';

const XIcon = getTreeIcon('x');

const iconMap = {
  info: getTreeIcon('info'),
  success: getTreeIcon('check'),
  warning: getTreeIcon('alert-circle'),
  danger: getTreeIcon('alert-circle'),
} as const;

const props = withDefaults(
  defineProps<{
    toast: ToastItem;
  }>(),
  {},
);

const emit = defineEmits<{
  close: [id: string];
}>();

const toastId = createId('t-toast-item');
const titleId = `${toastId}-title`;
const descriptionId = `${toastId}-description`;

const classes = computed(() => [
  't-toast',
  `t-toast--${props.toast.variant}`,
]);

const StatusIcon = computed(() => iconMap[props.toast.variant]);

function handleClose() {
  emit('close', props.toast.id);
}
</script>

<template>
  <div
    :class="classes"
    role="status"
    :aria-labelledby="titleId"
    :aria-describedby="toast.description ? descriptionId : undefined"
  >
    <span
      class="t-toast__icon"
      aria-hidden="true"
    >
      <StatusIcon
        v-bind="treeIconDefaults"
        :size="18"
      />
    </span>
    <div class="t-toast__content">
      <p
        :id="titleId"
        class="t-toast__title"
      >
        {{ toast.title }}
      </p>
      <p
        v-if="toast.description"
        :id="descriptionId"
        class="t-toast__description"
      >
        {{ toast.description }}
      </p>
    </div>
    <button
      v-if="toast.closable"
      type="button"
      class="t-toast__close"
      aria-label="Dismiss notification"
      @click="handleClose"
    >
      <XIcon
        v-bind="treeIconDefaults"
        :size="16"
      />
    </button>
  </div>
</template>
