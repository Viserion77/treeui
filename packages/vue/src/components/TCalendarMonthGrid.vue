<script setup lang="ts">
import { addDays, getMonthMatrix, isSameDay, startOfDay } from '@treeui/utils';
import { computed } from 'vue';
import {
  calendarFormatter,
  weekdayNames,
  type TCalendarItem,
  type TCalendarLabels,
} from './calendar';

/**
 * Month grid.
 *
 * It CONSUMES `getMonthMatrix` and draws exactly the matrix that function
 * returns — it does not recompute the grid with a rule of its own. That is the
 * contract the consumer asked for and it matters: their fetch window is
 * `getMonthMatrix(...).flat()`, so a component with its own idea of which days
 * a month contains would show days nobody fetched, silently.
 */
const props = withDefaults(
  defineProps<{
    /** Any date inside the month to render. */
    anchor: Date;
    items?: TCalendarItem[];
    /** 0 = Sunday. Derive it from the locale with `weekStartForLocale`. */
    weekStartsOn?: number;
    /** Locale for the weekday and day-number labels, read at render time. */
    locale?: string;
    /** Overrides "today". Pass it to keep a screenshot test stable. */
    today?: Date;
    labels?: TCalendarLabels;
  }>(),
  {
    items: () => [],
    weekStartsOn: 0,
    locale: 'en',
    today: undefined,
    labels: () => ({}),
  },
);

const emit = defineEmits<{
  'select-day': [date: Date];
  'select-event': [id: string];
}>();

defineSlots<{
  /** Content of one event chip. */
  event?: (props: { item: TCalendarItem; date: Date }) => unknown;
  /** Extra content for a day cell, under the events. */
  'day-cell'?: (props: { date: Date; items: TCalendarItem[]; outside: boolean }) => unknown;
}>();

const weeks = computed(() => getMonthMatrix(props.anchor, props.weekStartsOn));

const headers = computed(() => weekdayNames(props.locale, props.weekStartsOn));

const dayNumber = (date: Date) =>
  calendarFormatter(props.locale, { day: 'numeric' }).format(date);

const currentDay = computed(() => startOfDay(props.today ?? new Date()));

const isOutside = (date: Date) => date.getMonth() !== props.anchor.getMonth();

const itemsForDay = (date: Date) => {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = addDays(startOfDay(date), 1).getTime();
  // Overlap, not "starts on": a multi-day event belongs to every day it covers.
  return props.items.filter(
    (item) => item.start.getTime() < dayEnd && item.end.getTime() > dayStart,
  );
};

const dayLabel = (date: Date) =>
  props.labels.day?.(date) ??
  calendarFormatter(props.locale, { dateStyle: 'full' }).format(date);
</script>

<template>
  <div class="t-calendar-month">
    <div
      class="t-calendar-month__header"
      aria-hidden="true"
    >
      <span
        v-for="name in headers"
        :key="name"
        class="t-calendar-month__weekday"
      >{{ name }}</span>
    </div>

    <div class="t-calendar-month__grid">
      <template
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
      >
        <div
          v-for="date in week"
          :key="date.toISOString()"
          class="t-calendar-month__cell"
          :class="{
            'is-outside': isOutside(date),
            'is-today': isSameDay(date, currentDay),
          }"
          role="button"
          tabindex="0"
          :aria-label="dayLabel(date)"
          @click="emit('select-day', date)"
          @keydown.enter.prevent="emit('select-day', date)"
          @keydown.space.prevent="emit('select-day', date)"
        >
          <span class="t-calendar-month__day-number">{{ dayNumber(date) }}</span>

          <div class="t-calendar-month__events">
            <button
              v-for="item in itemsForDay(date)"
              :key="item.id"
              type="button"
              class="t-calendar-month__event"
              @click.stop="emit('select-event', item.id)"
            >
              <slot
                name="event"
                :item="item"
                :date="date"
              />
            </button>
          </div>

          <slot
            name="day-cell"
            :date="date"
            :items="itemsForDay(date)"
            :outside="isOutside(date)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
