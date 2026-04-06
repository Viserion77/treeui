<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /**
     * URL the breadcrumb item links to. Omit for the current/last item.
     */
    href?: string;
    /**
     * Marks this item as the current page. Automatically set if it's the last item without href.
     */
    current?: boolean;
  }>(),
  {
    href: undefined,
    current: false,
  },
);

const isCurrent = computed(() => props.current || !props.href);
</script>

<template>
  <li class="tree-breadcrumb__item">
    <a
      v-if="href && !isCurrent"
      :href="href"
      class="tree-breadcrumb__link"
    >
      <slot />
    </a>
    <span
      v-else
      class="tree-breadcrumb__current"
      aria-current="page"
    >
      <slot />
    </span>
  </li>
</template>
