<script setup lang="ts">
import { computed } from 'vue';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';

export type TTagVariant = 'solid' | 'outline' | 'soft';

const _treeTagTones = [
  'neutral',
  'brand',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
] as const;

export type TTagTone = (typeof _treeTagTones)[number];

const props = withDefaults(
  defineProps<{
    variant?: TTagVariant;
    /**
     * Colour axis, orthogonal to `variant`. Closed set — never a free colour,
     * the same policy TLinkTile's `tone` states. `accent` reads the surface
     * accent (`--tree-color-accent-*`), which defaults to the secondary brand
     * accent and follows a `TSection`/`THero`/`TPageSurface` that declares one.
     * Omitted, the tag keeps the pre-tone look: brand `solid`, neutral
     * `outline` and `soft`.
     */
    tone?: TTagTone;
    size?: TSize;
    removable?: boolean;
    disabled?: boolean;
    /** Accessible name for the remove button. Localizable copy. */
    removeLabel?: string;
  }>(),
  {
    variant: 'soft',
    tone: undefined,
    size: 'md',
    removable: false,
    disabled: false,
    removeLabel: 'Remove',
  },
);

const emit = defineEmits<{
  (e: 'remove'): void;
}>();

const classes = computed(() => [
  't-tag',
  `t-tag--${props.variant}`,
  `t-tag--${props.size}`,
  props.tone ? `t-tag--tone-${props.tone}` : '',
  props.disabled ? 'is-disabled' : '',
]);

function handleRemove() {
  if (props.disabled) return;
  emit('remove');
}
</script>

<template>
  <span :class="classes">
    <span
      v-if="$slots.icon"
      class="t-tag__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="t-tag__label">
      <slot />
    </span>
    <button
      v-if="removable"
      type="button"
      class="t-tag__remove"
      :disabled="disabled"
      :aria-label="removeLabel"
      @click="handleRemove"
    >
      <TIcon
        name="x"
        :size="14"
      />
    </button>
  </span>
</template>
