<script setup lang="ts">
import { addDays, startOfWeek, weekStartForLocale } from '@treeui/utils';
import { computed } from 'vue';
import TCalendarMonthGrid from './TCalendarMonthGrid.vue';
import TCalendarTimeGrid from './TCalendarTimeGrid.vue';
import { workweekDays, type TCalendarItem, type TCalendarLabels, type TCalendarView } from './calendar';

/**
 * Full-screen calendar: the four views behind one `view` prop.
 *
 * A thin wrapper on purpose — month is `TCalendarMonthGrid`, the other three
 * are `TCalendarTimeGrid` with a different set of day columns. What this adds
 * is the window arithmetic, so "what does `workweek` mean" is answered once.
 */
const props = withDefaults(
  defineProps<{
    view?: TCalendarView;
    /** Any date inside the window to show. */
    anchor: Date;
    items?: TCalendarItem[];
    /**
     * 0 = Sunday. Omitted, it comes from the locale via CLDR — pass it
     * explicitly when the product has a rule of its own.
     */
    weekStartsOn?: number;
    locale?: string;
    today?: Date;
    hourHeight?: number;
    scrollTo?: number;
    labels?: TCalendarLabels;
  }>(),
  {
    view: 'month',
    items: () => [],
    weekStartsOn: undefined,
    locale: 'en',
    today: undefined,
    hourHeight: 48,
    scrollTo: 7,
    labels: () => ({}),
  },
);

const emit = defineEmits<{
  'select-day': [date: Date];
  'select-slot': [date: Date, minutes: number];
  'select-allday': [date: Date];
  'select-event': [id: string];
}>();

defineSlots<{
  event?: (props: { item: TCalendarItem; date: Date }) => unknown;
  'all-day-item'?: (props: { item: TCalendarItem; date: Date }) => unknown;
  'day-cell'?: (props: { date: Date; items: TCalendarItem[]; outside: boolean }) => unknown;
}>();

// Resolved at render time, never at module scope: a week start frozen at import
// freezes the language of the first page load (the ADR both sides share).
const resolvedWeekStart = computed(
  () => props.weekStartsOn ?? weekStartForLocale(props.locale, 0),
);

/** Day columns for the time-grid views. Month has its own matrix. */
const days = computed<Date[]>(() => {
  if (props.view === 'day') return [props.anchor];

  const weekStart = startOfWeek(props.anchor, resolvedWeekStart.value);
  const week = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return props.view === 'workweek' ? workweekDays(week) : week;
});
</script>

<template>
  <div class="t-calendar">
    <TCalendarMonthGrid
      v-if="view === 'month'"
      :anchor="anchor"
      :items="items"
      :week-starts-on="resolvedWeekStart"
      :locale="locale"
      :today="today"
      :labels="labels"
      @select-day="emit('select-day', $event)"
      @select-event="emit('select-event', $event)"
    >
      <template
        v-if="$slots.event"
        #event="slotProps"
      >
        <slot
          name="event"
          v-bind="slotProps"
        />
      </template>
      <template
        v-if="$slots['day-cell']"
        #day-cell="slotProps"
      >
        <slot
          name="day-cell"
          v-bind="slotProps"
        />
      </template>
    </TCalendarMonthGrid>

    <TCalendarTimeGrid
      v-else
      :days="days"
      :items="items"
      :hour-height="hourHeight"
      :scroll-to="scrollTo"
      :locale="locale"
      :today="today"
      :labels="labels"
      @select-slot="(date, minutes) => emit('select-slot', date, minutes)"
      @select-allday="emit('select-allday', $event)"
      @select-event="emit('select-event', $event)"
    >
      <template
        v-if="$slots.event"
        #event="slotProps"
      >
        <slot
          name="event"
          v-bind="slotProps"
        />
      </template>
      <template
        v-if="$slots['all-day-item']"
        #all-day-item="slotProps"
      >
        <slot
          name="all-day-item"
          v-bind="slotProps"
        />
      </template>
    </TCalendarTimeGrid>
  </div>
</template>
