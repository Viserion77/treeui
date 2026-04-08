<script setup lang="ts">
import {
  addDays,
  addMonths,
  createId,
  isActivationKey,
  isEscapeKey,
  isSameDay,
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
import TreeSpinner from './TreeSpinner.vue';

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

interface TimeOption {
  disabled: boolean;
  label: string;
  value: number;
}

const CalendarIcon = getTreeIcon('calendar');
const ChevronLeftIcon = getTreeIcon('chevron-left');
const ChevronRightIcon = getTreeIcon('chevron-right');

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const dateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    open?: boolean;
    defaultOpen?: boolean;
    size?: TreeSize;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    placeholder?: string;
    locale?: string;
    min?: string;
    max?: string;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    id?: string;
    step?: number;
  }>(),
  {
    modelValue: '',
    open: undefined,
    defaultOpen: false,
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Select date and time',
    locale: 'en-US',
    min: '',
    max: '',
    weekStartsOn: 0,
    id: undefined,
    step: 60,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:open': [value: boolean];
  'open-change': [value: boolean];
  change: [value: string];
  select: [value: string];
}>();

const attrs = useAttrs();

const cloneDate = (value: Date) => new Date(value.getTime());

const formatPart = (value: number) => `${value}`.padStart(2, '0');

const endOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const parseBoundaryValue = (
  value: string | null | undefined,
  boundary: 'exact' | 'start' | 'end' = 'exact',
) => {
  if (!value) {
    return null;
  }

  const dateOnlyMatch = value.match(dateOnlyPattern);
  if (dateOnlyMatch) {
    const [, yearToken, monthToken, dayToken] = dateOnlyMatch;
    const year = Number.parseInt(yearToken, 10);
    const month = Number.parseInt(monthToken, 10);
    const day = Number.parseInt(dayToken, 10);
    const hour = boundary === 'end' ? 23 : 0;
    const minute = boundary === 'end' ? 59 : 0;
    const second = boundary === 'end' ? 59 : 0;
    const millisecond = boundary === 'end' ? 999 : 0;
    const date = new Date(year, month - 1, day, hour, minute, second, millisecond);

    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const dateTimeMatch = value.match(dateTimePattern);
  if (!dateTimeMatch) {
    return null;
  }

  const [, yearToken, monthToken, dayToken, hourToken, minuteToken, secondToken] =
    dateTimeMatch;
  const year = Number.parseInt(yearToken, 10);
  const month = Number.parseInt(monthToken, 10);
  const day = Number.parseInt(dayToken, 10);
  const hour = Number.parseInt(hourToken, 10);
  const minute = Number.parseInt(minuteToken, 10);
  const second = secondToken ? Number.parseInt(secondToken, 10) : 0;
  const date = new Date(year, month - 1, day, hour, minute, second, 0);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
};

const toDateTimeValue = (date: Date) =>
  `${toDateValue(date)}T${formatPart(date.getHours())}:${formatPart(date.getMinutes())}`;

const setDatePart = (source: Date, targetDate: Date) =>
  new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    source.getHours(),
    source.getMinutes(),
    0,
    0,
  );

const setTimePart = (source: Date, hour: number, minute: number) =>
  new Date(
    source.getFullYear(),
    source.getMonth(),
    source.getDate(),
    hour,
    minute,
    0,
    0,
  );

const resolveMinuteStep = (step: number) => {
  if (!Number.isFinite(step) || step <= 0 || step % 60 !== 0) {
    return 1;
  }

  const minuteStep = step / 60;
  return minuteStep >= 60 ? 1 : minuteStep;
};

const today = startOfDay(new Date());
const selectedDateTime = computed(() => parseBoundaryValue(props.modelValue, 'exact'));
const minDateTime = computed(() => parseBoundaryValue(props.min, 'start'));
const maxDateTime = computed(() => parseBoundaryValue(props.max, 'end'));
const pickerId = props.id ?? createId('tree-date-time-picker');
const captionId = `${pickerId}-caption`;
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const dayRefs = new Map<string, HTMLButtonElement>();

const clampToRange = (value: Date) => {
  let nextValue = cloneDate(value);

  if (minDateTime.value && nextValue < minDateTime.value) {
    nextValue = cloneDate(minDateTime.value);
  }

  if (maxDateTime.value && nextValue > maxDateTime.value) {
    nextValue = cloneDate(maxDateTime.value);
  }

  return nextValue;
};

const createDefaultDraftDateTime = () => {
  const reference = new Date();
  const stepMilliseconds = Math.max(props.step, 60) * 1000;
  const rounded = new Date(Math.ceil(reference.getTime() / stepMilliseconds) * stepMilliseconds);

  rounded.setSeconds(0, 0);
  return clampToRange(rounded);
};

const initialDateTime = selectedDateTime.value ?? createDefaultDraftDateTime();
const draftDateTime = ref(initialDateTime);
const focusedDate = ref(startOfDay(initialDateTime));
const viewMonth = ref(startOfMonth(initialDateTime));

const triggerAttrs = computed(() => {
  const { class: _class, style: _style, name: _name, ...rest } = attrs;
  return rest;
});

const hiddenInputName = computed(() =>
  typeof attrs.name === 'string' ? attrs.name : undefined,
);

const rootClasses = computed(() => [
  'tree-date-picker',
  'tree-date-time-picker',
  `tree-date-picker--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
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
  if (!selectedDateTime.value) {
    return props.placeholder;
  }

  return new Intl.DateTimeFormat(props.locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(selectedDateTime.value);
});

const draftPreview = computed(() =>
  new Intl.DateTimeFormat(props.locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(draftDateTime.value),
);

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

const minuteStep = computed(() => resolveMinuteStep(props.step));

const minuteValues = computed(() => {
  const values = new Set<number>();

  for (let minute = 0; minute < 60; minute += minuteStep.value) {
    values.add(minute);
  }

  values.add(draftDateTime.value.getMinutes());

  return [...values].sort((left, right) => left - right);
});

const isDateDisabled = (date: Date) => {
  if (props.disabled) {
    return true;
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  if (minDateTime.value && dayEnd < minDateTime.value) {
    return true;
  }

  if (maxDateTime.value && dayStart > maxDateTime.value) {
    return true;
  }

  return false;
};

const isDateTimeDisabled = (value: Date) => {
  if (props.disabled) {
    return true;
  }

  if (minDateTime.value && value < minDateTime.value) {
    return true;
  }

  if (maxDateTime.value && value > maxDateTime.value) {
    return true;
  }

  return false;
};

const syncCalendarView = (date: Date) => {
  focusedDate.value = startOfDay(date);
  viewMonth.value = startOfMonth(date);
};

const syncDraftState = (dateTime: Date) => {
  const nextValue = clampToRange(dateTime);
  draftDateTime.value = nextValue;
  syncCalendarView(nextValue);
};

watch(
  selectedDateTime,
  (value) => {
    if (isOpen.value) {
      return;
    }

    syncDraftState(value ?? createDefaultDraftDateTime());
  },
  { immediate: true },
);

const draftDate = computed(() => startOfDay(draftDateTime.value));

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
        isSelected: isSameDay(date, draftDate.value),
        isToday: isSameDay(date, today),
        key,
      } satisfies CalendarCell;
    }),
  );
});

const canMovePrev = computed(() => {
  if (!minDateTime.value) {
    return true;
  }

  return startOfMonth(viewMonth.value) > startOfMonth(minDateTime.value);
});

const canMoveNext = computed(() => {
  if (!maxDateTime.value) {
    return true;
  }

  return startOfMonth(viewMonth.value) < startOfMonth(maxDateTime.value);
});

const isTimeOptionEnabled = (hour: number, minute: number) => {
  const candidate = setTimePart(draftDateTime.value, hour, minute);
  return !isDateTimeDisabled(candidate);
};

const hourOptions = computed<TimeOption[]>(() =>
  Array.from({ length: 24 }, (_, hour) => ({
    disabled: !minuteValues.value.some((minute) => isTimeOptionEnabled(hour, minute)),
    label: formatPart(hour),
    value: hour,
  })),
);

const minuteOptions = computed<TimeOption[]>(() =>
  minuteValues.value.map((minute) => ({
    disabled: !isTimeOptionEnabled(draftDateTime.value.getHours(), minute),
    label: formatPart(minute),
    value: minute,
  })),
);

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

  syncDraftState(selectedDateTime.value ?? createDefaultDraftDateTime());
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

  const candidate = clampToRange(setDatePart(draftDateTime.value, date));
  draftDateTime.value = candidate;
  syncCalendarView(candidate);
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

const updateHour = (event: Event) => {
  const nextHour = Number.parseInt((event.target as HTMLSelectElement).value, 10);
  const currentMinute = draftDateTime.value.getMinutes();

  if (Number.isNaN(nextHour)) {
    return;
  }

  const availableMinutes = minuteValues.value.filter((minute) =>
    isTimeOptionEnabled(nextHour, minute),
  );

  if (!availableMinutes.length) {
    return;
  }

  const nextMinute = availableMinutes.includes(currentMinute)
    ? currentMinute
    : availableMinutes[0];

  draftDateTime.value = setTimePart(draftDateTime.value, nextHour, nextMinute);
};

const updateMinute = (event: Event) => {
  const nextMinute = Number.parseInt((event.target as HTMLSelectElement).value, 10);
  const nextHour = draftDateTime.value.getHours();

  if (Number.isNaN(nextMinute) || !isTimeOptionEnabled(nextHour, nextMinute)) {
    return;
  }

  draftDateTime.value = setTimePart(draftDateTime.value, nextHour, nextMinute);
};

const commitDraft = () => {
  const value = toDateTimeValue(draftDateTime.value);

  emit('update:modelValue', value);
  emit('change', value);
  emit('select', value);
  closeCalendar(true);
};

const clearSelection = () => {
  emit('update:modelValue', '');
  emit('change', '');
  emit('select', '');
  closeCalendar(true);
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
      class="tree-date-picker__trigger tree-date-time-picker__trigger"
      :disabled="disabled"
      :aria-controls="isOpen ? pickerId : undefined"
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
        :data-placeholder="selectedDateTime ? undefined : true"
      >
        {{ triggerText }}
      </span>

      <span class="tree-date-picker__slot tree-date-picker__slot--suffix">
        <slot name="suffix">
          <TreeSpinner
            v-if="loading"
            size="sm"
            label="Loading"
          />
          <CalendarIcon
            v-else
            v-bind="treeIconDefaults"
          />
        </slot>
      </span>
    </button>

    <transition name="tree-fade">
      <div
        v-if="isOpen && !disabled"
        :id="pickerId"
        class="tree-date-picker__content tree-date-time-picker__content"
        role="dialog"
        aria-modal="false"
        :aria-labelledby="captionId"
      >
        <div class="tree-date-time-picker__calendar">
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
                  :tabindex="cell.isFocused ? 0 : -1"
                  :disabled="cell.disabled"
                  :aria-pressed="cell.isSelected"
                  @click="selectDate(cell.date)"
                  @keydown="onDayKeydown($event, cell.date)"
                >
                  {{ cell.dayLabel }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="tree-date-time-picker__summary">
          <p class="tree-date-time-picker__eyebrow">
            Selected slot
          </p>
          <p class="tree-date-time-picker__summary-value">
            {{ draftPreview }}
          </p>
        </div>

        <div class="tree-date-time-picker__time">
          <label class="tree-date-time-picker__time-field">
            <span class="tree-date-time-picker__time-label">Hour</span>
            <select
              class="tree-date-time-picker__select"
              :value="draftDateTime.getHours()"
              aria-label="Select hour"
              @change="updateHour"
            >
              <option
                v-for="option in hourOptions"
                :key="option.value"
                :value="option.value"
                :disabled="option.disabled"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="tree-date-time-picker__time-field">
            <span class="tree-date-time-picker__time-label">Minute</span>
            <select
              class="tree-date-time-picker__select"
              :value="draftDateTime.getMinutes()"
              aria-label="Select minute"
              @change="updateMinute"
            >
              <option
                v-for="option in minuteOptions"
                :key="option.value"
                :value="option.value"
                :disabled="option.disabled"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="tree-date-time-picker__footer">
          <button
            type="button"
            class="tree-button tree-button--ghost tree-button--sm"
            @click="clearSelection"
          >
            Clear
          </button>
          <button
            type="button"
            class="tree-button tree-button--solid tree-button--sm"
            @click="commitDraft"
          >
            Apply
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
