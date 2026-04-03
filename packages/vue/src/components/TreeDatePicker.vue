<script setup lang="ts">
import {
  addDays,
  addMonths,
  createId,
  isActivationKey,
  isEscapeKey,
  isSameDay,
  parseDateValue,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDateValue,
} from '@treeui/utils';
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';
import {
  type ComponentPublicInstance,
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  toRef,
  useAttrs,
  watch,
} from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

interface CalendarCell {
  date: Date;
  dayLabel: number;
  disabled: boolean;
  inMonth: boolean;
  isFocused: boolean;
  isSelected: boolean;
  isToday: boolean;
  key: string;
}

const CalendarIcon = getTreeIcon('calendar');
const ChevronLeftIcon = getTreeIcon('chevron-left');
const ChevronRightIcon = getTreeIcon('chevron-right');

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    open?: boolean;
    defaultOpen?: boolean;
    size?: TreeSize;
    disabled?: boolean;
    invalid?: boolean;
    placeholder?: string;
    locale?: string;
    min?: string;
    max?: string;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    id?: string;
  }>(),
  {
    modelValue: '',
    open: undefined,
    defaultOpen: false,
    size: 'md',
    disabled: false,
    invalid: false,
    placeholder: 'Select date',
    locale: 'en-US',
    min: '',
    max: '',
    weekStartsOn: 0,
    id: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
  select: [value: string];
}>();

const attrs = useAttrs();
const today = startOfDay(new Date());
const selectedDate = computed(() => parseDateValue(props.modelValue));
const minDate = computed(() => parseDateValue(props.min));
const maxDate = computed(() => parseDateValue(props.max));
const calendarId = props.id ?? createId('tree-date-picker');
const captionId = `${calendarId}-caption`;
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const dayRefs = new Map<string, HTMLButtonElement>();
const viewMonth = ref(startOfMonth(selectedDate.value ?? today));
const focusedDate = ref<Date>(selectedDate.value ?? today);

const triggerAttrs = computed(() => {
  const { class: _class, style: _style, name: _name, ...rest } = attrs;
  return rest;
});

const hiddenInputName = computed(() =>
  typeof attrs.name === 'string' ? attrs.name : undefined,
);

const rootClasses = computed(() => [
  'tree-date-picker',
  `tree-date-picker--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-open': isOpen.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

const triggerText = computed(() => {
  if (!selectedDate.value) {
    return props.placeholder;
  }

  return new Intl.DateTimeFormat(props.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate.value);
});

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(props.locale, {
    month: 'long',
    year: 'numeric',
  }).format(viewMonth.value),
);

const weekdayLabels = computed(() => {
  const formatter = new Intl.DateTimeFormat(props.locale, { weekday: 'short' });
  const weekBase = startOfWeek(new Date(2024, 0, 7), props.weekStartsOn);

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(weekBase, index)),
  );
});

const isDateDisabled = (date: Date) => {
  if (props.disabled) {
    return true;
  }

  if (minDate.value && date < minDate.value) {
    return true;
  }

  if (maxDate.value && date > maxDate.value) {
    return true;
  }

  return false;
};

const syncCalendarView = (date: Date) => {
  focusedDate.value = startOfDay(date);
  viewMonth.value = startOfMonth(date);
};

watch(
  selectedDate,
  (value) => {
    if (value) {
      syncCalendarView(value);
      return;
    }

    if (!isOpen.value) {
      syncCalendarView(today);
    }
  },
  { immediate: true },
);

const cells = computed(() => {
  const startDate = startOfWeek(startOfMonth(viewMonth.value), props.weekStartsOn);

  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(startDate, weekIndex * 7 + dayIndex);
      const key = toDateValue(date);

      return {
        date,
        dayLabel: date.getDate(),
        disabled: isDateDisabled(date),
        inMonth: date.getMonth() === viewMonth.value.getMonth(),
        isFocused: isSameDay(date, focusedDate.value),
        isSelected: isSameDay(date, selectedDate.value),
        isToday: isSameDay(date, today),
        key,
      } satisfies CalendarCell;
    }),
  );
});

const canMovePrev = computed(() => {
  if (!minDate.value) {
    return true;
  }

  return startOfMonth(viewMonth.value) > startOfMonth(minDate.value);
});

const canMoveNext = computed(() => {
  if (!maxDate.value) {
    return true;
  }

  return startOfMonth(viewMonth.value) < startOfMonth(maxDate.value);
});

const focusCurrentDay = () => {
  const key = toDateValue(focusedDate.value);
  nextTick(() => {
    dayRefs.get(key)?.focus();
  });
};

const setDayRef = (
  element: Element | ComponentPublicInstance | null,
  key: string,
) => {
  if (element instanceof HTMLButtonElement) {
    dayRefs.set(key, element);
    return;
  }

  dayRefs.delete(key);
};

const openCalendar = () => {
  if (props.disabled) {
    return;
  }

  syncCalendarView(selectedDate.value ?? focusedDate.value ?? today);
  setValue(true);
  focusCurrentDay();
};

const closeCalendar = (restoreFocus = false) => {
  setValue(false);

  if (restoreFocus) {
    nextTick(() => {
      triggerRef.value?.focus();
    });
  }
};

const toggleCalendar = () => {
  if (isOpen.value) {
    closeCalendar();
    return;
  }

  openCalendar();
};

const moveCalendar = (direction: 1 | -1) => {
  const nextMonth = addMonths(viewMonth.value, direction);
  syncCalendarView(nextMonth);
  focusCurrentDay();
};

const moveFocus = (nextDate: Date) => {
  if (isDateDisabled(nextDate)) {
    return;
  }

  syncCalendarView(nextDate);
  focusCurrentDay();
};

const selectDate = (date: Date) => {
  if (isDateDisabled(date)) {
    return;
  }

  const normalizedDate = startOfDay(date);
  const value = toDateValue(normalizedDate);

  syncCalendarView(normalizedDate);
  emit('update:modelValue', value);
  emit('select', value);
  closeCalendar(true);
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  if (isEscapeKey(event) && isOpen.value) {
    event.preventDefault();
    closeCalendar();
    return;
  }

  if (
    isActivationKey(event) ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowUp'
  ) {
    event.preventDefault();
    openCalendar();
  }
};

const onDayKeydown = (event: KeyboardEvent, date: Date) => {
  if (isEscapeKey(event)) {
    event.preventDefault();
    closeCalendar(true);
    return;
  }

  if (isActivationKey(event)) {
    event.preventDefault();
    selectDate(date);
    return;
  }

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      moveFocus(addDays(date, -1));
      break;
    case 'ArrowRight':
      event.preventDefault();
      moveFocus(addDays(date, 1));
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveFocus(addDays(date, -7));
      break;
    case 'ArrowDown':
      event.preventDefault();
      moveFocus(addDays(date, 7));
      break;
    case 'Home':
      event.preventDefault();
      moveFocus(startOfWeek(date, props.weekStartsOn));
      break;
    case 'End':
      event.preventDefault();
      moveFocus(addDays(startOfWeek(date, props.weekStartsOn), 6));
      break;
    case 'PageUp':
      event.preventDefault();
      moveFocus(addMonths(date, event.shiftKey ? -12 : -1));
      break;
    case 'PageDown':
      event.preventDefault();
      moveFocus(addMonths(date, event.shiftKey ? 12 : 1));
      break;
    default:
      break;
  }
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (rootRef.value?.contains(target)) {
    return;
  }

  closeCalendar();
};

watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown);
    return;
  }

  document.removeEventListener('pointerdown', onDocumentPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
});
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :style="rootStyle"
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <input
      v-if="hiddenInputName"
      type="hidden"
      :name="hiddenInputName"
      :value="modelValue"
    >
    <button
      ref="triggerRef"
      v-bind="triggerAttrs"
      type="button"
      class="tree-date-picker__trigger"
      :disabled="disabled"
      :aria-controls="isOpen ? calendarId : undefined"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-invalid="invalid || undefined"
      @click="toggleCalendar"
      @keydown="onTriggerKeydown"
    >
      <span
        v-if="$slots.prefix"
        class="tree-date-picker__slot tree-date-picker__slot--prefix"
      >
        <slot name="prefix" />
      </span>
      <span
        class="tree-date-picker__value"
        :data-placeholder="selectedDate ? undefined : true"
      >
        {{ triggerText }}
      </span>
      <span class="tree-date-picker__slot tree-date-picker__slot--suffix">
        <slot name="suffix">
          <CalendarIcon v-bind="treeIconDefaults" />
        </slot>
      </span>
    </button>

    <transition name="tree-fade">
      <div
        v-if="isOpen && !disabled"
        :id="calendarId"
        class="tree-date-picker__content"
        role="dialog"
        aria-modal="false"
        :aria-labelledby="captionId"
      >
        <div class="tree-date-picker__header">
          <button
            type="button"
            class="tree-date-picker__nav"
            :disabled="!canMovePrev"
            aria-label="Previous month"
            @click="moveCalendar(-1)"
          >
            <ChevronLeftIcon v-bind="treeIconDefaults" />
          </button>
          <p
            :id="captionId"
            class="tree-date-picker__month"
          >
            {{ monthLabel }}
          </p>
          <button
            type="button"
            class="tree-date-picker__nav"
            :disabled="!canMoveNext"
            aria-label="Next month"
            @click="moveCalendar(1)"
          >
            <ChevronRightIcon v-bind="treeIconDefaults" />
          </button>
        </div>

        <div
          class="tree-date-picker__weekdays"
          aria-hidden="true"
        >
          <span
            v-for="label in weekdayLabels"
            :key="label"
            class="tree-date-picker__weekday"
          >
            {{ label }}
          </span>
        </div>

        <div
          class="tree-date-picker__grid"
          role="grid"
          :aria-labelledby="captionId"
        >
          <div
            v-for="(week, weekIndex) in cells"
            :key="weekIndex"
            class="tree-date-picker__row"
            role="row"
          >
            <div
              v-for="cell in week"
              :key="cell.key"
              class="tree-date-picker__cell"
              role="gridcell"
              :aria-selected="cell.isSelected"
            >
              <button
                :ref="(element) => setDayRef(element, cell.key)"
                type="button"
                class="tree-date-picker__day"
                :class="{
                  'is-muted': !cell.inMonth,
                  'is-selected': cell.isSelected,
                  'is-today': cell.isToday,
                }"
                :data-date="cell.key"
                :disabled="cell.disabled"
                :tabindex="cell.isFocused ? 0 : -1"
                :aria-current="cell.isToday ? 'date' : undefined"
                :aria-label="cell.key"
                @click="selectDate(cell.date)"
                @keydown="onDayKeydown($event, cell.date)"
              >
                {{ cell.dayLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
