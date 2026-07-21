<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import type { TIconName } from '@treeui/icons';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';

// The scroll container is the root element, but the accessible name and any
// aria-*/id belong on the <table> itself, so attrs are split rather than
// inherited onto the wrapper.
defineOptions({
  inheritAttrs: false,
});

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
    /**
     * Visible `<caption>` naming the table. For a name without visible text,
     * pass `aria-label` / `aria-labelledby` instead — both land on the `<table>`.
     */
    caption?: string;
  }>(),
  {
    size: 'md',
    sortBy: undefined,
    caption: undefined,
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

function isSortedBy(column: TTableColumn): boolean {
  const cur = currentSort.value;
  return cur?.key === column.key && cur.direction !== 'none';
}

function sortIconName(column: TTableColumn): TIconName {
  const cur = currentSort.value;
  if (!isSortedBy(column)) return 'chevrons-up-down';
  return cur?.direction === 'asc' ? 'chevron-up' : 'chevron-down';
}

const attrs = useAttrs();

// class/style stay on the scroll wrapper (the root); everything else —
// aria-label, aria-labelledby, id, data-* — is forwarded to the <table>.
const tableAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    class="t-table-wrapper"
    :class="attrs.class"
    :style="attrs.style"
  >
    <table
      v-bind="tableAttrs"
      :class="classes"
    >
      <caption
        v-if="caption"
        class="t-table__caption"
      >
        {{ caption }}
      </caption>
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
                  :class="{ 'is-inactive': !isSortedBy(column) }"
                  aria-hidden="true"
                >
                  <TIcon
                    :name="sortIconName(column)"
                    :size="14"
                  />
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
