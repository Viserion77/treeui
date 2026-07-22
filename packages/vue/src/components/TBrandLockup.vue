<script setup lang="ts">
import { computed, getCurrentInstance, type Component } from 'vue';
import type { TSize } from '../types/contracts';
import TText from './TText.vue';

const props = withDefaults(
  defineProps<{
    /** Product name. Truncates on overflow. */
    title?: string;
    /** Optional supporting line under the title. Truncates on overflow. */
    subtitle?: string;
    size?: TSize;
    /**
     * Collapse to the logo only, hiding the text — for a shell's collapsed rail.
     * When collapsed and used as a link, supply an accessible name on the logo
     * (e.g. `alt` on the `<img>`) since the visible text is gone.
     */
    collapsed?: boolean;
    /** Native href. Renders the lockup as an anchor. */
    href?: string;
    /** Route target. Renders as RouterLink when vue-router is available. */
    to?: string | Record<string, unknown>;
  }>(),
  {
    title: undefined,
    subtitle: undefined,
    size: 'md',
    collapsed: false,
    href: undefined,
    to: undefined,
  },
);

const instance = getCurrentInstance();

const routerLink = computed<Component | null>(() => {
  if (!props.to) return null;
  return (instance?.appContext.components.RouterLink as Component | undefined) ?? null;
});

const isLink = computed(() => Boolean(props.href || props.to));

const tag = computed<string | Component>(() => {
  if (props.to && routerLink.value) return routerLink.value;
  if (isLink.value) return 'a';
  return 'div';
});

const linkProps = computed(() => {
  if (props.to && routerLink.value) return { to: props.to };
  if (isLink.value) {
    return { href: props.href ?? (typeof props.to === 'string' ? props.to : undefined) };
  }
  return {};
});

const classes = computed(() => [
  't-brand-lockup',
  `t-brand-lockup--${props.size}`,
  { 'is-collapsed': props.collapsed },
]);

const showText = computed(() => !props.collapsed && Boolean(props.title || props.subtitle));
</script>

<template>
  <component
    :is="tag"
    v-bind="linkProps"
    :class="classes"
  >
    <span class="t-brand-lockup__logo">
      <slot name="logo" />
    </span>
    <span
      v-if="showText"
      class="t-brand-lockup__text"
    >
      <TText
        v-if="title"
        as="span"
        class="t-brand-lockup__title"
        weight="semibold"
        truncate
      >
        {{ title }}
      </TText>
      <TText
        v-if="subtitle"
        as="span"
        class="t-brand-lockup__subtitle"
        tone="muted"
        size="sm"
        truncate
      >
        {{ subtitle }}
      </TText>
    </span>
  </component>
</template>
