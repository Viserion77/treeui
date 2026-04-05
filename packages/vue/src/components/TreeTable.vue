<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TreeSize } from '../types/contracts';

export type TreeTableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
};

export type TreeTableSortDirection = 'asc' | 'desc' | 'none';

export type TreeTableSortState = {
  key: string;
  direction: TreeTableSortDirection;
};

const props = withDefaults(
  defineProps<{
    columns: TreeTableColumn[];
    rows: Record<string, unknown>[];
    size?: TreeSize;
    striped?: boolean;
    hoverable?: boolean;
    bordered?: boolean;
    sortBy?: TreeTableSortState;
  }>(),
  {
    size: 'md',
    striped: false,
    hoverable: false,
    bordered: false,
    sortBy: undefined,
  },
);

const emit = defineEmits<{
  (e: 'sort', state: TreeTableSortState): void;
}>();

defineSlots<{
  [key: `cell-${string}`]: (props: { row: Record<string, unknown>; value: unknown }) => void;
  [key: `header-${string}`]: (props: { column: TreeTableColumn }) => void;
  empty: () => void;
}>();

const internalSort = ref<TreeTableSortState | undefined>(undefined);

const currentSort = computed(() => props.sortBy ?? internalSort.value);

const classes = computed(() => [
  'tree-table',
  `tree-table--${props.size}`,
  props.striped ? 'tree-table--striped' : '',
  props.hoverable ? 'tree-table--hoverable' : '',
  props.bordered ? 'tree-table--bordered' : '',
]);

const sortedRows = computed(() => {
  const sort = currentSort.value;
  if (!sort || sort.direction === 'none') return props.rows;

  return [...props.rows].sort((a, b) => {
    const aVal = a[sort.key];
    const bVal = b[sort.key];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const cmp =
      typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));

    return sort.direction === 'desc' ? -cmp : cmp;
  });
});

function handleSort(column: TreeTableColumn) {
  if (!column.sortable) return;

  const cur = currentSort.value;
  let direction: TreeTableSortDirection = 'asc';

  if (cur?.key === column.key) {
    if (cur.direction === 'asc') direction = 'desc';
    else if (cur.direction === 'desc') direction = 'none';
    else direction = 'asc';
  }

  const state: TreeTableSortState = { key: column.key, direction };
  internalSort.value = state;
  emit('sort', state);
}

function sortAriaSort(column: TreeTableColumn): 'none' | 'ascending' | 'descending' | undefined {
  if (!column.sortable) return undefined;
  const cur = currentSort.value;
  if (cur?.key !== column.key || cur.direction === 'none') return 'none';
  return cur.direction === 'asc' ? 'ascending' : 'descending';
}

function handleHeaderKeydown(event: KeyboardEvent, column: TreeTableColumn) {
  if (column.sortable && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    handleSort(column);
  }
}
</script>

<template>
  <div class="tree-table-wrapper">
    <table
      :class="classes"
      role="grid"
    >
      <thead class="tree-table__head">
        <tr class="tree-table__row">
          <th
            v-for="column in columns"
            :key="column.key"
            class="tree-table__header"
            :class="[
              column.sortable ? 'tree-table__header--sortable' : '',
              column.align ? `tree-table__header--${column.align}` : '',
            ]"
            :style="column.width ? { width: column.width } : undefined"
            :aria-sort="sortAriaSort(column)"
            :tabindex="column.sortable ? 0 : undefined"
            scope="col"
            @click="handleSort(column)"
            @keydown="handleHeaderKeydown($event, column)"
          >
            <slot
              :name="`header-${column.key}`"
              :column="column"
            >
              <span class="tree-table__header-content">
                {{ column.label }}
                <span
                  v-if="column.sortable"
                  class="tree-table__sort-icon"
                  aria-hidden="true"
                >
                  <svg
                    v-if="currentSort?.key === column.key && currentSort.direction === 'asc'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                  <svg
                    v-else-if="currentSort?.key === column.key && currentSort.direction === 'desc'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="opacity: 0.4"
                  >
                    <path d="m7 15 5 5 5-5" />
                    <path d="m7 9 5-5 5 5" />
                  </svg>
                </span>
              </span>
            </slot>
          </th>
        </tr>
      </thead>
      <tbody class="tree-table__body">
        <tr
          v-if="sortedRows.length === 0"
          class="tree-table__row tree-table__row--empty"
        >
          <td
            :colspan="columns.length"
            class="tree-table__cell tree-table__cell--empty"
          >
            <slot name="empty">
              No data available.
            </slot>
          </td>
        </tr>
        <tr
          v-for="(row, index) in sortedRows"
          :key="index"
          class="tree-table__row"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="tree-table__cell"
            :class="column.align ? `tree-table__cell--${column.align}` : ''"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
            >
              {{ row[column.key] ?? '' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
