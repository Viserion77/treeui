<script setup lang="ts">
import { computed, getCurrentInstance, ref, useAttrs, watchEffect, type Component } from 'vue';
import type { TIconName } from '@treeui/icons';
import { createId } from '@treeui/utils';
import type { TBreakpoint, TSize } from '../types/contracts';
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
  /**
   * Preferred width. Under `table-layout: auto` — which is what this table
   * uses, so columns size to their content — the CSS `width` on a cell is a
   * SUGGESTION: the algorithm is free to go under it when the row is tight,
   * and it does.
   */
  width?: string;
  /**
   * What this column becomes in stacked mode. `title` makes it the block's
   * heading and drops its caption — there is at most one, and the first
   * column declaring it wins. `hidden` drops the column from the block
   * entirely, for something that only makes sense beside its neighbours.
   * `field` (the default) shows the column's `label` above the value, because
   * the header row is gone and the value would otherwise be unlabelled.
   */
  stack?: 'title' | 'field' | 'hidden';
  /**
   * A width the column may not go below. Unlike `width` this is a real floor:
   * it is applied to a box inside the header rather than to the cell, so the
   * auto layout has to honour it and the table overflows into the wrapper's
   * scroll instead of squeezing the column to nothing. Use it for a column
   * whose content must stay readable (a timestamp, an id, an amount).
   */
  minWidth?: string;
};

export type TTableSortDirection = 'asc' | 'desc' | 'none';

export type TTableSortState = {
  key: string;
  direction: TTableSortDirection;
};

export type TTableRowState = 'default' | 'muted';

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
    /**
     * Stable identity per row. A key (or a function of the row) so rows keep
     * their identity across sorting — otherwise Vue keys by array index and
     * `rowState` styling follows the position, not the data.
     */
    rowKey?: string | ((row: Record<string, unknown>, index: number) => string | number);
    /**
     * Semantic per-row state. `muted` recesses a row (e.g. a resource that no
     * longer exists). It is applied by data, not position, so it survives
     * sorting. Dimming is not an accessible signal on its own — pair it with a
     * status cell or visually hidden text conveying the same meaning.
     */
    rowState?: (row: Record<string, unknown>, index: number) => TTableRowState;
    /**
     * The row NAVIGATES: a real `href` per row. The anchor lives in the first
     * cell and is stretched over the whole row, so ctrl/middle-click, "open in
     * new tab" and the status-bar URL all work and the accessible role is
     * `link`. A `<tr>` cannot BE an `<a>` — its only permitted content is
     * `<td>`/`<th>`, and the parser moves anything else out of the table — so
     * the stretched link is the only shape that keeps the grid intact.
     * Mutually exclusive with `rowTo` and `@row-activate`.
     */
    rowHref?: (row: Record<string, unknown>, index: number) => string | undefined;
    /** Same as `rowHref`, resolved through the app's RouterLink. */
    rowTo?: (row: Record<string, unknown>, index: number) => string | undefined;
    /**
     * Accessible name for the row's activator, per row — used by BOTH modes.
     * Required with `rowHref`/`rowTo` and strongly advised with
     * `rowActivatable`: without it the name is the concatenation of every cell,
     * repeated for every row.
     */
    rowLabel?: (row: Record<string, unknown>, index: number) => string;
    /**
     * The row ACTIVATES something that is not a route — a modal, a selection.
     * Renders a real `<button>` in the first cell, stretched over the row, the
     * same shape `rowHref` uses. It is NOT `role="button"` on the `<tr>`: that
     * makes every cell presentational and destroys the grid semantics of the
     * whole table, so a row that is activatable AND contains a control had no
     * accessible shape at all. Use this only when there is no URL.
     */
    rowActivatable?: boolean;
    /**
     * Below this container width, the grid becomes one block per row: one
     * column is the block's heading and the rest appear under it, each value
     * carrying its column's label. Above it, the table is unchanged.
     *
     * Measured on the WRAPPER, not the viewport — a table can sit in a narrow
     * panel on a wide screen, and that is the case the viewport cannot see.
     *
     * A breakpoint name rather than a free length: a container query cannot
     * read a custom property in its condition, so an arbitrary value would
     * need a `ResizeObserver` per table, and a page with twenty tables would
     * pay for an axis the token scale already covers.
     */
    stackBelow?: TBreakpoint;
    /** Key of the row whose detail panel is open, matched against `rowKey`. */
    expandedRow?: string | number | null;
  }>(),
  {
    size: 'md',
    sortBy: undefined,
    caption: undefined,
    rowKey: undefined,
    rowState: undefined,
    rowHref: undefined,
    rowTo: undefined,
    rowLabel: undefined,
    rowActivatable: false,
    stackBelow: undefined,
    expandedRow: null,
  },
);

const emit = defineEmits<{
  (e: 'sort', state: TTableSortState): void;
  /** The row was activated without navigating — see `rowActivatable`. */
  (e: 'row-activate', row: Record<string, unknown>, index: number): void;
}>();

const tableId = createId('t-table');
const instance = getCurrentInstance();

const routerLink = computed<Component | null>(
  () => (instance?.appContext.components.RouterLink as Component | undefined) ?? null,
);

// The three modes are mutually exclusive on purpose. A screen left to invent
// its own row activation picks a contortion with NO correlation to whether the
// row actually navigates — so the API has to make the distinction, not offer
// two equivalent ways out.
const linksRows = computed(() => Boolean(props.rowHref || props.rowTo));

if (process.env.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (linksRows.value && props.rowActivatable) {
      console.warn(
        '[TTable] `rowHref`/`rowTo` and `rowActivatable` are mutually exclusive: a row either ' +
          'navigates (a link, with ctrl/middle-click and a URL) or it does not (a button).',
      );
    }
    if (linksRows.value && !props.rowLabel) {
      console.warn(
        '[TTable] `rowHref`/`rowTo` needs `rowLabel` — a row link with no accessible name is ' +
          'announced as the row text, repeated for every row.',
      );
    }
  });
}

const rowTarget = (row: Record<string, unknown>, index: number) =>
  props.rowTo?.(row, index) ?? props.rowHref?.(row, index);

const isExpanded = (row: Record<string, unknown>, index: number) =>
  props.expandedRow != null && resolveRowKey(row, index) === props.expandedRow;

const detailId = (row: Record<string, unknown>, index: number) =>
  `${tableId}-detail-${resolveRowKey(row, index)}`;

// The affordance follows the RESOLVED target, not the presence of the prop: a
// row whose `rowTo` returns undefined renders no link, and promising a pointer
// and a hover for a row that does not navigate is a lie the consumer then has
// to explain.
const rowIsLinked = (row: Record<string, unknown>, index: number) =>
  linksRows.value && Boolean(rowTarget(row, index));

defineSlots<{
  /** Detail panel for the expanded row, rendered as an adjacent `<tr>`. */
  detail?: (props: { row: Record<string, unknown>; index: number }) => void;
  /**
   * `detailId` and `expanded` are handed to the cell so the control that
   * actually toggles the detail can carry `aria-expanded`/`aria-controls`. The
   * library does not know which control that is, and putting them on the `<tr>`
   * announced every row as expandable and pointed `aria-controls` at something
   * the consumer could not reach.
   */
  [key: `cell-${string}`]: (props: {
    row: Record<string, unknown>;
    value: unknown;
    index: number;
    detailId: string;
    expanded: boolean;
  }) => void;
  [key: `header-${string}`]: (props: { column: TTableColumn }) => void;
  empty: () => void;
}>();

const internalSort = ref<TTableSortState | undefined>(undefined);

const currentSort = computed(() => props.sortBy ?? internalSort.value);

const classes = computed(() => [
  't-table',
  `t-table--${props.size}`,
]);

/* At most one title per block, and the first column that asks for it wins —
   two headings in one block is not a block, and silently honouring the last
   would make the answer depend on column order in a way nobody would guess. */
const stackTitleKey = computed(
  () => props.columns.find((column) => column.stack === 'title')?.key,
);

/** What a column becomes in stacked mode, with the title claim resolved. */
const stackRole = (column: TTableColumn): 'title' | 'field' | 'hidden' => {
  if (column.stack === 'hidden') return 'hidden';
  if (column.key === stackTitleKey.value) return 'title';
  return 'field';
};

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

function resolveRowKey(row: Record<string, unknown>, index: number): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index);
  if (typeof props.rowKey === 'string') {
    const value = row[props.rowKey];
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return index;
}

function rowStateClass(row: Record<string, unknown>, index: number): string | null {
  const state = props.rowState?.(row, index);
  return state && state !== 'default' ? `t-table__row--${state}` : null;
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
    :class="[stackBelow ? `t-table-wrapper--stack-below-${stackBelow}` : null, attrs.class]"
    :style="attrs.style"
  >
    <!--
      The roles are explicit because stacked mode changes `display`, and a
      `display: block` table loses its implicit table semantics in several
      screen readers: the rows stop being rows and the cells stop being cells.
      Each role here is the one the element already had, so nothing changes
      above the breakpoint; they exist to survive the switch.
    -->
    <table
      v-bind="tableAttrs"
      role="table"
      :class="classes"
    >
      <caption
        v-if="caption"
        class="t-table__caption"
      >
        {{ caption }}
      </caption>
      <thead
        role="rowgroup"
        class="t-table__head"
      >
        <tr
          role="row"
          class="t-table__row"
        >
          <th
            v-for="column in columns"
            :key="column.key"
            role="columnheader"
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
              <span
                class="t-table__header-content"
                :style="column.minWidth ? { minInlineSize: column.minWidth } : undefined"
              >
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
      <tbody
        role="rowgroup"
        class="t-table__body"
      >
        <tr
          v-if="sortedRows.length === 0"
          role="row"
          class="t-table__row t-table__row--empty"
        >
          <td
            role="cell"
            :colspan="columns.length"
            class="t-table__cell t-table__cell--empty"
          >
            <slot name="empty">
              No data available.
            </slot>
          </td>
        </tr>
        <template
          v-for="(row, index) in sortedRows"
          :key="resolveRowKey(row, index)"
        >
          <tr
            role="row"
            class="t-table__row"
            :class="[
              rowStateClass(row, index),
              {
                'is-linked': rowIsLinked(row, index),
                'is-activatable': rowActivatable && !linksRows,
                'is-expanded': isExpanded(row, index),
              },
            ]"
          >
            <td
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              role="cell"
              class="t-table__cell"
              :class="[
                column.align ? `t-table__cell--${column.align}` : '',
                stackBelow ? `t-table__cell--stack-${stackRole(column)}` : null,
              ]"
            >
              <!--
                The column's label, for stacked mode. Rendered always and shown
                only there: the header row is hidden in a block, so without
                this the value is unlabelled — and the header being gone from
                the accessibility tree too is what makes this the cell's own
                label rather than a duplicate of one.
              -->
              <span
                v-if="stackBelow && stackRole(column) === 'field'"
                class="t-table__stack-label"
              >{{ column.label }}</span>
              <!--
                The stretched link lives in the FIRST cell and covers the row
                through a pseudo-element. Any cell after it raises itself above
                that layer (see `.t-table__cell + .t-table__cell`), so a delete
                button in the actions column stays clickable — leaving that to
                the consumer would have every one of them rediscover it.
              -->
              <button
                v-if="columnIndex === 0 && rowActivatable && !linksRows"
                type="button"
                class="t-table__row-action"
                :aria-label="rowLabel?.(row, index)"
                @click="emit('row-activate', row, index)"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                  :index="index"
                  :detail-id="detailId(row, index)"
                  :expanded="isExpanded(row, index)"
                >
                  {{ row[column.key] ?? '' }}
                </slot>
              </button>
              <component
                :is="rowTo !== undefined && routerLink ? routerLink : 'a'"
                v-else-if="columnIndex === 0 && rowIsLinked(row, index)"
                class="t-table__row-link"
                v-bind="rowTo !== undefined && routerLink
                  ? { to: rowTarget(row, index) }
                  : { href: rowTarget(row, index) }"
                :aria-label="rowLabel?.(row, index)"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                  :index="index"
                  :detail-id="detailId(row, index)"
                  :expanded="isExpanded(row, index)"
                >
                  {{ row[column.key] ?? '' }}
                </slot>
              </component>
              <slot
                v-else
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
                :index="index"
                :detail-id="detailId(row, index)"
                :expanded="isExpanded(row, index)"
              >
                {{ row[column.key] ?? '' }}
              </slot>
            </td>
          </tr>

          <!--
            The detail is a `<tr>` ADJACENT to its own row, not a sibling of the
            whole table: stacking every expanded detail below the table breaks
            the visual relationship with the row that produced it.
          -->
          <tr
            v-if="$slots.detail && isExpanded(row, index)"
            :id="detailId(row, index)"
            class="t-table__row t-table__row--detail"
          >
            <td
              :colspan="columns.length"
              class="t-table__cell t-table__cell--detail"
            >
              <slot
                name="detail"
                :row="row"
                :index="index"
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
