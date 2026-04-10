<script setup lang="ts">
import { computed, getCurrentInstance, type Component } from 'vue';

export type TreeLinkVariant = 'default' | 'muted' | 'danger';

const props = withDefaults(
  defineProps<{
    to?: string | Record<string, unknown>;
    href?: string;
    external?: boolean;
    disabled?: boolean;
    variant?: TreeLinkVariant;
  }>(),
  {
    to: undefined,
    href: undefined,
    external: false,
    disabled: false,
    variant: 'default',
  },
);

const instance = getCurrentInstance();

const routerLinkComponent = computed<Component | null>(() => {
  if (!props.to) return null;

  return (instance?.appContext.components.RouterLink as Component | undefined) ?? null;
});

const hasRouterLink = computed(() => {
  return Boolean(routerLinkComponent.value);
});

const tag = computed<string | Component>(() => {
  if (props.disabled) return 'span';
  if (props.to && routerLinkComponent.value) return routerLinkComponent.value;
  return 'a';
});

const linkProps = computed(() => {
  if (props.disabled) return {};
  if (props.to && hasRouterLink.value) return { to: props.to };
  const href = props.href ?? (typeof props.to === 'string' ? props.to : undefined);
  return {
    href,
    ...(props.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
  };
});

const classes = computed(() => [
  'tree-link',
  `tree-link--${props.variant}`,
  {
    'is-disabled': props.disabled,
  },
]);
</script>

<template>
  <component
    :is="tag"
    v-bind="linkProps"
    :class="classes"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
  >
    <slot />
  </component>
</template>
