<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, ref, useId } from 'vue';
import { accordionInjectionKey } from './accordion';

const props = withDefaults(
  defineProps<{
    value: string;
    disabled?: boolean;
    /**
     * Heading element that wraps the trigger. `false` renders no heading at
     * all — the right answer for a disclosure attached to one item of content
     * (a note under a chat bubble), where a heading per row would flood the
     * document outline: 20 rounds of a conversation became 20 headings for
     * someone navigating by heading, inside a surface with no sections.
     * The APG asks for a heading around a DOCUMENT accordion; a note is not
     * one, so `variant="quiet"` defaults to `false` here.
     */
    headingLevel?: 2 | 3 | 4 | 5 | 6 | false;
  }>(),
  {
    disabled: false,
    headingLevel: undefined,
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

// Unset follows the container: a document accordion keeps its <h3>, a quiet one
// drops the wrapper. An explicit value always wins, in both directions.
const headingTag = computed<string | false>(() => {
  if (props.headingLevel !== undefined) {
    return props.headingLevel === false ? false : `h${props.headingLevel}`;
  }
  return ctx.variant.value === 'quiet' ? false : 'h3';
});
const isDisabled = computed(() => props.disabled || ctx.disabled.value);

const itemClasses = computed(() => [
  't-accordion__item',
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
    <component
      :is="headingTag || 'div'"
      :class="headingTag ? 't-accordion__heading' : 't-accordion__heading-bare'"
    >
      <button
        :id="triggerId"
        ref="triggerRef"
        type="button"
        class="t-accordion__trigger"
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
          class="t-accordion__icon"
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
    </component>
    <div
      v-if="isOpen"
      :id="panelId"
      role="region"
      :aria-labelledby="triggerId"
      class="t-accordion__content"
    >
      <div class="t-accordion__panel">
        <slot />
      </div>
    </div>
  </div>
</template>
