<script setup lang="ts">
import { computed } from 'vue';
import { useToast, type ToastPosition } from '../composables/useToast';
import TToast from './TToast.vue';

const props = withDefaults(
  defineProps<{
    position?: ToastPosition;
    max?: number;
    /**
     * Instance default for the dismiss button's accessible name. A single
     * toast can still override it with `closeLabel` in its own options.
     */
    closeLabel?: string;
  }>(),
  {
    position: 'bottom-right',
    max: 5,
    closeLabel: 'Dismiss notification',
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
          :close-label="closeLabel"
          @close="handleClose"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>
