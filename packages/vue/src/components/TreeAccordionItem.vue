<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, ref, useId } from 'vue';
import { accordionInjectionKey } from './accordion';

const props = withDefaults(
  defineProps<{
    value: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const injected = inject(accordionInjectionKey);

if (!injected) {
  throw new Error('[TreeUI] TAccordionItem must be used inside a TAccordion.');
}

const ctx = injected;

const triggerId = useId();
const panelId = useId();
const triggerRef = ref<HTMLButtonElement | null>(null);

const isOpen = computed(() => ctx.isItemOpen(props.value));
const isDisabled = computed(() => props.disabled || ctx.disabled);

const itemClasses = computed(() => [
  'tree-accordion__item',
  {
    'is-open': isOpen.value,
    'is-disabled': isDisabled.value,
  },
]);

function handleToggle() {
  if (isDisabled.value) return;
  ctx.toggleItem(props.value);
}

function handleKeydown(event: KeyboardEvent) {
  if (isDisabled.value) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      ctx.focusNext(props.value);
      break;
    case 'ArrowUp':
      event.preventDefault();
      ctx.focusPrev(props.value);
      break;
    case 'Home':
      event.preventDefault();
      ctx.focusFirst();
      break;
    case 'End':
      event.preventDefault();
      ctx.focusLast();
      break;
  }
}

onMounted(() => {
  if (triggerRef.value) {
    ctx.registerTrigger(props.value, triggerRef.value);
  }
});

onBeforeUnmount(() => {
  ctx.unregisterTrigger(props.value);
});
</script>

<template>
  <div :class="itemClasses">
    <h3 class="tree-accordion__heading">
      <button
        :id="triggerId"
        ref="triggerRef"
        type="button"
        class="tree-accordion__trigger"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
        :disabled="isDisabled || undefined"
        @click="handleToggle"
        @keydown="handleKeydown"
      >
        <slot
          name="trigger"
          :open="isOpen"
        >
          {{ value }}
        </slot>
        <svg
          class="tree-accordion__icon"
          :class="{ 'is-open': isOpen }"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </h3>
    <div
      v-if="isOpen"
      :id="panelId"
      role="region"
      :aria-labelledby="triggerId"
      class="tree-accordion__content"
    >
      <div class="tree-accordion__panel">
        <slot />
      </div>
    </div>
  </div>
</template>
