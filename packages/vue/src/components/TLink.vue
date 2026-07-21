<script setup lang="ts">
import { computed, getCurrentInstance, type Component } from 'vue';

export type TLinkVariant = 'default' | 'muted' | 'danger';
export type TLinkUnderline = 'always' | 'hover' | 'none';
export type TLinkWeight = 'regular' | 'medium' | 'semibold';

const props = withDefaults(
  defineProps<{
    to?: string | Record<string, unknown>;
    href?: string;
    external?: boolean;
    disabled?: boolean;
    variant?: TLinkVariant;
    /** When the underline shows. `always` (default), `hover`, or `none`. */
    underline?: TLinkUnderline;
    /** Text weight. Defaults to `medium`, matching the base link. */
    weight?: TLinkWeight;
  }>(),
  {
    to: undefined,
    href: undefined,
    external: false,
    disabled: false,
    variant: 'default',
    underline: 'always',
    weight: 'medium',
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
  't-link',
  `t-link--${props.variant}`,
  props.underline !== 'always' ? `t-link--underline-${props.underline}` : null,
  props.weight !== 'medium' ? `t-link--weight-${props.weight}` : null,
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
