<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Whether an acceptable drag is over the target — bind `useDrop().isOver`. */
    active?: boolean;
    /**
     * `page` covers the viewport, above the app chrome; `region` fills the
     * nearest positioned ancestor, for a card-sized target.
     */
    scope?: 'page' | 'region';
    /**
     * Copy shown while the veil is up. Product's, so it is localizable.
     *
     * MUTUALLY EXCLUSIVE with the default slot: the slot REPLACES this label,
     * it does not sit beside it. Passing both renders only the slot, and the
     * label vanishes with no warning — use one or the other.
     */
    label?: string;
  }>(),
  {
    active: false,
    scope: 'page',
    label: undefined,
  },
);

const classes = computed(() => [
  't-drop-veil',
  `t-drop-veil--${props.scope}`,
  { 'is-active': props.active },
]);
</script>

<template>
  <!--
    `pointer-events: none` is not decoration: a veil that accepts the pointer
    swallows the very `drop` it exists to announce, and the drag ends nowhere.
    `aria-hidden` because it announces nothing a screen-reader user can act on —
    the drop target itself carries the accessible name.
  -->
  <transition name="t-fade">
    <div
      v-if="active"
      :class="classes"
      aria-hidden="true"
    >
      <span
        v-if="label || $slots.default"
        class="t-drop-veil__label"
      >
        <slot>{{ label }}</slot>
      </span>
    </div>
  </transition>
</template>
