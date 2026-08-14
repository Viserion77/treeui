<script setup lang="ts">
import { addDays, isSameDay, layoutDayColumns, placeInDay, startOfDay } from '@treeui/utils';
import { computed, onMounted, ref } from 'vue';
import {
  calendarFormatter,
  type TCalendarItem,
  type TCalendarLabels,
} from './calendar';

/**
 * Time grid: day columns, an hour ruler, an all-day band, and
 * overlapping events placed side by side.
 *
 * The overlap algorithm and the vertical placement live in `@treeui/utils`
 * (`layoutDayColumns`, `placeInDay`) — that maths is the core of the value and
 * is framework-agnostic, so a React time grid reuses it unchanged. What is here
 * is the box, the ruler, the states and the keyboard.
 */
const props = withDefaults(
  defineProps<{
    /** The day columns to render, in order. */
    days: Date[];
    items?: TCalendarItem[];
    /** Height of one hour, in px. Drives every vertical measurement. */
    hourHeight?: number;
    /** Shortest a block may render, in px, so a 3-minute event stays visible. */
    minEventHeight?: number;
    /** Hour the grid scrolls to on mount (7 = 07:00). */
    scrollTo?: number;
    locale?: string;
    today?: Date;
    /** Current time, for the "now" marker. Defaults to `today`/now. */
    now?: Date;
    labels?: TCalendarLabels;
  }>(),
  {
    items: () => [],
    hourHeight: 48,
    minEventHeight: 18,
    scrollTo: 7,
    locale: 'en',
    today: undefined,
    now: undefined,
    labels: () => ({}),
  },
);

const emit = defineEmits<{
  'select-slot': [date: Date, minutes: number];
  'select-allday': [date: Date];
  'select-event': [id: string];
}>();

defineSlots<{
  event?: (props: { item: TCalendarItem; date: Date }) => unknown;
  'all-day-item'?: (props: { item: TCalendarItem; date: Date }) => unknown;
}>();

const scrollRef = ref<HTMLElement | null>(null);
const hours = Array.from({ length: 24 }, (_, hour) => hour);

const currentTime = computed(() => props.now ?? props.today ?? new Date());

const hourLabel = (hour: number) =>
  calendarFormatter(props.locale, { hour: 'numeric' }).format(
    new Date(2024, 0, 1, hour),
  );

const dayHeaderLabel = (date: Date) =>
  calendarFormatter(props.locale, { weekday: 'short', day: 'numeric' }).format(date);

const timedItems = (date: Date) => {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = addDays(startOfDay(date), 1).getTime();
  return props.items.filter(
    (item) => !item.allDay && item.start.getTime() < dayEnd && item.end.getTime() > dayStart,
  );
};

const allDayItems = (date: Date) => {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = addDays(startOfDay(date), 1).getTime();
  return props.items.filter(
    (item) => item.allDay && item.start.getTime() < dayEnd && item.end.getTime() > dayStart,
  );
};

/** Geometry of every timed block in a column: vertical from `placeInDay`,
 *  horizontal from the overlap clusters. */
const blocks = (date: Date) => {
  const items = timedItems(date);
  const columns = layoutDayColumns(items);

  return items.map((item) => {
    const { top, height } = placeInDay(item, date, {
      hourHeight: props.hourHeight,
      minHeight: props.minEventHeight,
    });
    const placement = columns.get(item.id) ?? { columnIndex: 0, columnCount: 1 };
    const width = 100 / Math.max(1, placement.columnCount);

    return {
      item,
      style: {
        top: `${top}px`,
        height: `${height}px`,
        insetInlineStart: `${placement.columnIndex * width}%`,
        inlineSize: `${width}%`,
      },
    };
  });
};

/** Offset of the "now" line, in px from midnight. */
const nowOffset = computed(() => {
  const time = currentTime.value;
  return ((time.getHours() * 60 + time.getMinutes()) / 60) * props.hourHeight;
});

// The marker belongs ONLY to the column of the current day: drawn across every
// column it reads as a grid line and stops meaning "now".
const isCurrentDay = (date: Date) => isSameDay(date, currentTime.value);

const slotFromOffset = (date: Date, offsetY: number) => {
  const minutes = (offsetY / props.hourHeight) * 60;
  // Snap to 30 minutes: a calendar click is an intent, not a measurement.
  const snapped = Math.max(0, Math.min(23 * 60 + 30, Math.round(minutes / 30) * 30));
  const slotDate = new Date(startOfDay(date).getTime() + snapped * 60_000);
  return { slotDate, snapped };
};

const onColumnClick = (date: Date, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const { slotDate, snapped } = slotFromOffset(date, event.clientY - target.getBoundingClientRect().top);
  emit('select-slot', slotDate, snapped);
};

onMounted(() => {
  if (scrollRef.value) scrollRef.value.scrollTop = props.scrollTo * props.hourHeight;
});
</script>

<template>
  <div
    class="t-calendar-time"
    :style="{ '--tree-calendar-hour-height': `${hourHeight}px` }"
  >
    <div class="t-calendar-time__header">
      <span class="t-calendar-time__gutter" />
      <span
        v-for="date in days"
        :key="`h-${date.toISOString()}`"
        class="t-calendar-time__day-header"
        :class="{ 'is-today': isCurrentDay(date) }"
      >{{ dayHeaderLabel(date) }}</span>
    </div>

    <div class="t-calendar-time__all-day">
      <span class="t-calendar-time__gutter" />
      <div
        v-for="date in days"
        :key="`a-${date.toISOString()}`"
        class="t-calendar-time__all-day-cell"
        role="button"
        tabindex="0"
        :aria-label="labels.allDay?.(date)"
        @click="emit('select-allday', date)"
        @keydown.enter.prevent="emit('select-allday', date)"
      >
        <button
          v-for="item in allDayItems(date)"
          :key="item.id"
          type="button"
          class="t-calendar-time__all-day-item"
          @click.stop="emit('select-event', item.id)"
        >
          <slot
            name="all-day-item"
            :item="item"
            :date="date"
          />
        </button>
      </div>
    </div>

    <div
      ref="scrollRef"
      class="t-calendar-time__scroll"
    >
      <div class="t-calendar-time__body">
        <div class="t-calendar-time__ruler">
          <span
            v-for="hour in hours"
            :key="hour"
            class="t-calendar-time__hour"
          >{{ hourLabel(hour) }}</span>
        </div>

        <div
          v-for="date in days"
          :key="`c-${date.toISOString()}`"
          class="t-calendar-time__column"
          @click="onColumnClick(date, $event)"
        >
          <span
            v-for="hour in hours"
            :key="`l-${hour}`"
            class="t-calendar-time__line"
            aria-hidden="true"
          />

          <button
            v-for="block in blocks(date)"
            :key="block.item.id"
            type="button"
            class="t-calendar-time__event"
            :style="block.style"
            @click.stop="emit('select-event', block.item.id)"
          >
            <slot
              name="event"
              :item="block.item"
              :date="date"
            />
          </button>

          <span
            v-if="isCurrentDay(date)"
            class="t-calendar-time__now"
            :style="{ top: `${nowOffset}px` }"
            role="img"
            :aria-label="labels.now"
          />
        </div>
      </div>
    </div>
  </div>
</template>
