<script setup lang="ts">
import { computed, getCurrentInstance, type Component } from 'vue';

const props = withDefaults(
  defineProps<{
    /**
     * URL the breadcrumb item links to. Omit for the current/last item.
     */
    href?: string;
    /**
     * Route target. When provided and vue-router is available, renders RouterLink.
     */
    to?: string | Record<string, unknown>;
    /**
     * Marks this item as the current page. Automatically set if it's the last item without href.
     */
    current?: boolean;
  }>(),
  {
    href: undefined,
    to: undefined,
    current: false,
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

const canRenderLink = computed(() => {
  if (props.href) return true;
  if (typeof props.to === 'string') return true;
  return Boolean(props.to && hasRouterLink.value);
});

const isCurrent = computed(() => props.current || !canRenderLink.value);

const tag = computed<string | Component>(() => {
  if (props.to && routerLinkComponent.value) {
    return routerLinkComponent.value;
  }

  return 'a';
});

const linkProps = computed(() => {
  if (props.to && hasRouterLink.value) {
    return { to: props.to };
  }

  return {
    href: props.href ?? (typeof props.to === 'string' ? props.to : undefined),
  };
});
</script>

<template>
  <li class="tree-breadcrumb__item">
    <component
      :is="tag"
      v-if="!isCurrent"
      v-bind="linkProps"
      class="tree-breadcrumb__link"
    >
      <slot />
    </component>
    <span
      v-else
      class="tree-breadcrumb__current"
      aria-current="page"
    >
      <slot />
    </span>
  </li>
</template>
