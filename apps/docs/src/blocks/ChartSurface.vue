<script setup lang="ts">
// ChartSurface — recipe: chart-surface
// A TreeUI card "surface" that frames the native TChart: heading, status badge,
// a range filter, and loading/empty states. No external charting library — the
// plot is TreeUI's own TChart. Reach for an external engine only for chart types
// TreeUI does not cover yet (scatter, heatmap, …).
import { computed, ref } from 'vue';
import {
  TBadge,
  TButton,
  TCard,
  TChart,
  TEmptyState,
  TSelect,
  TSkeleton,
  TStack,
} from '@treeui/vue';

type RangeKey = '7d' | '30d' | '90d';

const rangeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
];

// Minimal sample series keyed by the selected range.
const series: Record<RangeKey, number[]> = {
  '7d': [12, 18, 9, 22, 30, 24, 28],
  '30d': [8, 14, 11, 19, 25, 21, 27, 33, 29, 35],
  '90d': [],
};

// TSelect emits `string | number`, so the bound ref is widened to `string`.
const range = ref<string>('7d');
const loading = ref(false);

const data = computed(() => series[range.value as RangeKey] ?? []);
const isEmpty = computed(() => !loading.value && data.value.length === 0);

const labels = computed(() => data.value.map((_, index) => `D${index + 1}`));
const chartSeries = computed(() => [{ name: 'Active users', data: data.value }]);

function reload() {
  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
  }, 900);
}
</script>

<template>
  <TCard
    variant="outline"
    style="max-width: 30rem"
  >
    <template #header>
      <TStack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="var(--tree-space-3)"
        style="width: 100%"
      >
        <TStack
          direction="horizontal"
          align="center"
          gap="var(--tree-space-2)"
        >
          <strong>Weekly active users</strong>
          <TBadge
            variant="soft"
            tone="success"
            size="sm"
          >
            Live
          </TBadge>
        </TStack>
        <TSelect
          v-model="range"
          aria-label="Date range"
          size="sm"
          :options="rangeOptions"
          style="width: 11rem"
        />
      </TStack>
    </template>

    <!-- Loading state -->
    <TSkeleton
      v-if="loading"
      width="100%"
      height="160px"
    />

    <!-- Empty state -->
    <TEmptyState
      v-else-if="isEmpty"
      size="sm"
      title="No data for this range"
      description="Pick a shorter range or reload to fetch fresh metrics."
    >
      <template #actions>
        <TButton
          size="sm"
          variant="outline"
          @click="reload"
        >
          Reload
        </TButton>
      </template>
    </TEmptyState>

    <!-- Native TreeUI chart — no external charting library. -->
    <TChart
      v-else
      type="area"
      smooth
      :series="chartSeries"
      :labels="labels"
      :height="160"
      aria-label="Active users over the selected range"
    />

    <template #footer>
      <TStack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="var(--tree-space-3)"
        style="width: 100%"
      >
        <small>Updated just now</small>
        <TButton
          size="sm"
          variant="ghost"
          :loading="loading"
          @click="reload"
        >
          Refresh
        </TButton>
      </TStack>
    </template>
  </TCard>
</template>
