<script setup lang="ts">
import { computed, getCurrentInstance, type Component } from 'vue';
import type { TSize } from '../types/contracts';
import TText from './TText.vue';

const _treeLinkTileTones = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const;
export type TLinkTileTone = (typeof _treeLinkTileTones)[number];

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    /** Accent applied to the leading region. Closed axis — never a free colour. */
    tone?: TLinkTileTone;
    size?: TSize;
    /** Marks this tile as the current destination. Emits `aria-current="page"`. */
    current?: boolean;
    href?: string;
    to?: string | Record<string, unknown>;
  }>(),
  {
    title: undefined,
    description: undefined,
    tone: 'neutral',
    size: 'md',
    current: false,
    href: undefined,
    to: undefined,
  },
);

const instance = getCurrentInstance();

const routerLink = computed<Component | null>(() => {
  if (!props.to) return null;
  return (instance?.appContext.components.RouterLink as Component | undefined) ?? null;
});

const tag = computed<string | Component>(() => {
  if (props.to && routerLink.value) return routerLink.value;
  return 'a';
});

const linkProps = computed(() => {
  if (props.to && routerLink.value) return { to: props.to };
  return { href: props.href ?? (typeof props.to === 'string' ? props.to : undefined) };
});

const classes = computed(() => [
  't-link-tile',
  `t-link-tile--${props.size}`,
  `t-link-tile--${props.tone}`,
  { 'is-current': props.current },
]);
</script>

<template>
  <component
    :is="tag"
    v-bind="linkProps"
    :class="classes"
    :aria-current="current ? 'page' : undefined"
  >
    <span
      v-if="$slots.leading"
      class="t-link-tile__leading"
      aria-hidden="true"
    >
      <slot name="leading" />
    </span>
    <span class="t-link-tile__body">
      <TText
        v-if="title"
        as="span"
        class="t-link-tile__title"
        weight="semibold"
      >
        {{ title }}
      </TText>
      <TText
        v-if="description"
        as="span"
        class="t-link-tile__description"
        tone="muted"
        size="sm"
      >
        {{ description }}
      </TText>
      <slot />
    </span>
  </component>
</template>
