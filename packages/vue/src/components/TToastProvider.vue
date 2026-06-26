<script setup lang="ts">
import { computed } from 'vue';
import { useToast, type ToastPosition } from '../composables/useToast';
import TToast from './TToast.vue';

const props = withDefaults(
  defineProps<{
    position?: ToastPosition;
    max?: number;
  }>(),
  {
    position: 'bottom-right',
    max: 5,
  },
);

const { toasts, remove } = useToast();

const visibleToasts = computed(() =>
  toasts.value.slice(-props.max),
);

const classes = computed(() => [
  't-toast-provider',
  `t-toast-provider--${props.position}`,
]);

function handleClose(id: string) {
  remove(id);
}
</script>

<template>
  <slot />

  <Teleport to="body">
    <div
      :class="classes"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      <TransitionGroup name="t-toast">
        <TToast
          v-for="toast in visibleToasts"
          :key="toast.id"
          :toast="toast"
          @close="handleClose"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>
