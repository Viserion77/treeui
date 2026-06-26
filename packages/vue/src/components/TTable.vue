<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TSize } from '../types/contracts';

export type TTableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
};

export type TTableSortDirection = 'asc' | 'desc' | 'none';

export type TTableSortState = {
  key: string;
  direction: TTableSortDirection;
};

const props = withDefaults(
  defineProps<{
    columns: TTableColumn[];
    rows: Record<string, unknown>[];
    size?: TSize;
    sortBy?: TTableSortState;
  }>(),
  {
    size: 'md',
    sortBy: undefined,
  },
);

const emit = defineEmits<{
  (e: 'sort', state: TTableSortState): void;
}>();

defineSlots<{
  [key: `cell-${string}`]: (props: { row: Record<string, unknown>; value: unknown }) => void;
  [key: `header-${string}`]: (props: { column: TTableColumn }) => void;
  empty: () => void;
}>();

const internalSort = ref<TTableSortState | undefined>(undefined);

const currentSort = computed(() => props.sortBy ?? internalSort.value);

const classes = computed(() => [
  't-table',
  `t-table--${props.size}`,
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

function handleSort(column: TTableColumn) {
  if (!column.sortable) return;

  const cur = currentSort.value;
  let direction: TTableSortDirection = 'asc';

  if (cur?.key === column.key) {
    if (cur.direction === 'asc') direction = 'desc';
    else if (cur.direction === 'desc') direction = 'none';
    else direction = 'asc';
  }

  const state: TTableSortState = { key: column.key, direction };
  internalSort.value = state;
  emit('sort', state);
}

function sortAriaSort(column: TTableColumn): 'none' | 'ascending' | 'descending' | undefined {
  if (!column.sortable) return undefined;
  const cur = currentSort.value;
  if (cur?.key !== column.key || cur.direction === 'none') return 'none';
  return cur.direction === 'asc' ? 'ascending' : 'descending';
}

function handleHeaderKeydown(event: KeyboardEvent, column: TTableColumn) {
  if (column.sortable && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    handleSort(column);
  }
}
</script>

<template>
  <div class="t-table-wrapper">
    <table
      :class="classes"
      role="grid"
    >
      <thead class="t-table__head">
        <tr class="t-table__row">
          <th
            v-for="column in columns"
            :key="column.key"
            class="t-table__header"
            :class="[
              column.sortable ? 't-table__header--sortable' : '',
              column.align ? `t-table__header--${column.align}` : '',
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
              <span class="t-table__header-content">
                {{ column.label }}
                <span
                  v-if="column.sortable"
                  class="t-table__sort-icon"
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
      <tbody class="t-table__body">
        <tr
          v-if="sortedRows.length === 0"
          class="t-table__row t-table__row--empty"
        >
          <td
            :colspan="columns.length"
            class="t-table__cell t-table__cell--empty"
          >
            <slot name="empty">
              No data available.
            </slot>
          </td>
        </tr>
        <tr
          v-for="(row, index) in sortedRows"
          :key="index"
          class="t-table__row"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="t-table__cell"
            :class="column.align ? `t-table__cell--${column.align}` : ''"
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
