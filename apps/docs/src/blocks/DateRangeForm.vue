<script setup lang="ts">
// DateRangeForm — a scheduling pair that captures a start and end date/time.
// Implements recipe: date-range-form
// Both values stay in YYYY-MM-DDTHH:mm format; the end picker's min follows the selected start.
import { computed, ref } from 'vue';
import { TGrid, TFormField, TDateTimePicker } from '@treeui/vue';

// Values are kept in the picker's native YYYY-MM-DDTHH:mm format.
const startAt = ref('2026-07-01T09:00');
const endAt = ref('2026-07-01T17:00');

// When a start is selected, the end cannot be earlier than it.
const endMin = computed(() => startAt.value);

// Surface a friendly validation message when the range is inverted.
const endError = computed(() =>
  startAt.value && endAt.value && endAt.value < startAt.value
    ? 'End must be after the start time.'
    : undefined,
);
</script>

<template>
  <TGrid
    :columns="2"
    min-item-width="16rem"
    gap="var(--tree-space-4)"
  >
    <TFormField
      label="Starts"
      html-for="schedule-start"
      hint="Pick the day and time the event begins."
    >
      <TDateTimePicker
        id="schedule-start"
        v-model="startAt"
        placeholder="Select start"
      />
    </TFormField>

    <TFormField
      label="Ends"
      html-for="schedule-end"
      hint="Must be on or after the start time."
      :error="endError"
    >
      <TDateTimePicker
        id="schedule-end"
        v-model="endAt"
        :min="endMin"
        :invalid="Boolean(endError)"
        placeholder="Select end"
      />
    </TFormField>
  </TGrid>
</template>
