<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';

const props = withDefaults(
  defineProps<{
    /** Current active page (1-based) */
    modelValue?: number;
    /** Total number of pages */
    totalPages: number;
    /** Number of sibling pages shown around the current page */
    siblings?: number;
    /** Size variant */
    size?: TreeSize;
    /** Disable all controls */
    disabled?: boolean;
    /** Accessible label for the nav element */
    label?: string;
  }>(),
  {
    modelValue: 1,
    siblings: 1,
    size: 'md',
    disabled: false,
    label: 'Pagination',
  },
);

const emit = defineEmits<{
  'update:modelValue': [page: number];
}>();

defineSlots<{
  previous?: (props: Record<string, never>) => unknown;
  next?: (props: Record<string, never>) => unknown;
}>();

const currentPage = computed(() =>
  Math.min(Math.max(1, props.modelValue), props.totalPages),
);

const pages = computed(() => {
  const total = props.totalPages;
  const current = currentPage.value;
  const siblings = props.siblings;
  const items: (number | 'ellipsis')[] = [];

  const rangeStart = Math.max(2, current - siblings);
  const rangeEnd = Math.min(total - 1, current + siblings);

  // Always show page 1
  items.push(1);

  // Leading ellipsis
  if (rangeStart > 2) {
    items.push('ellipsis');
  }

  // Sibling pages
  for (let i = rangeStart; i <= rangeEnd; i++) {
    items.push(i);
  }

  // Trailing ellipsis
  if (rangeEnd < total - 1) {
    items.push('ellipsis');
  }

  // Always show last page (if more than 1 page)
  if (total > 1) {
    items.push(total);
  }

  return items;
});

const classes = computed(() => [
  'tree-pagination',
  `tree-pagination--${props.size}`,
  { 'is-disabled': props.disabled },
]);

function goToPage(page: number) {
  if (props.disabled) return;
  const clamped = Math.min(Math.max(1, page), props.totalPages);
  if (clamped !== currentPage.value) {
    emit('update:modelValue', clamped);
  }
}

function onKeydown(event: KeyboardEvent, page: number) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    goToPage(page);
  }
}
</script>

<template>
  <nav
    :class="classes"
    :aria-label="label"
  >
    <ul class="tree-pagination__list">
      <!-- Previous button -->
      <li class="tree-pagination__item">
        <button
          class="tree-pagination__button tree-pagination__button--prev"
          type="button"
          :disabled="disabled || currentPage <= 1"
          :aria-label="'Go to previous page'"
          @click="goToPage(currentPage - 1)"
        >
          <slot name="previous">
            <svg
              class="tree-pagination__icon"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </slot>
        </button>
      </li>

      <!-- Page items -->
      <li
        v-for="(page, index) in pages"
        :key="page === 'ellipsis' ? `ellipsis-${index}` : page"
        class="tree-pagination__item"
      >
        <span
          v-if="page === 'ellipsis'"
          class="tree-pagination__ellipsis"
          aria-hidden="true"
        >
          &hellip;
        </span>
        <button
          v-else
          class="tree-pagination__button"
          :class="{ 'is-active': page === currentPage }"
          type="button"
          :disabled="disabled"
          :aria-label="`Go to page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="goToPage(page)"
          @keydown="onKeydown($event, page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- Next button -->
      <li class="tree-pagination__item">
        <button
          class="tree-pagination__button tree-pagination__button--next"
          type="button"
          :disabled="disabled || currentPage >= totalPages"
          :aria-label="'Go to next page'"
          @click="goToPage(currentPage + 1)"
        >
          <slot name="next">
            <svg
              class="tree-pagination__icon"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </slot>
        </button>
      </li>
    </ul>
  </nav>
</template>
