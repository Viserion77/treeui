<script setup lang="ts">
// ChartSurface — recipe: chart-surface
// A TreeUI card "surface" that frames an external chart engine: heading, status badge,
// a range filter, and loading/empty states. The chart itself is a stand-in inline SVG;
// a real app drops its chart engine (e.g. Chart.js, ECharts, D3) into the marked slot.
import { computed, ref } from 'vue';
import { TBadge, TButton, TCard, TEmptyState, TSelect, TSkeleton, TStack } from '@treeui/vue';

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

const maxValue = computed(() => Math.max(1, ...data.value));

// Map the series to evenly spaced bars within a 280x120 viewBox.
const bars = computed(() => {
  const count = data.value.length;
  if (count === 0) return [];
  const gap = 6;
  const barWidth = (280 - gap * (count - 1)) / count;
  return data.value.map((value, index) => {
    const height = (value / maxValue.value) * 110;
    return {
      x: index * (barWidth + gap),
      y: 120 - height,
      width: barWidth,
      height,
    };
  });
});

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
      height="120px"
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

    <!--
      Chart surface. A real app drops its chart engine here (Chart.js, ECharts, D3, …).
      This inline SVG is a token-agnostic stand-in so the surface renders without a chart library.
    -->
    <svg
      v-else
      viewBox="0 0 280 120"
      width="100%"
      height="120"
      role="img"
      aria-label="Active users bar chart"
    >
      <rect
        v-for="(bar, index) in bars"
        :key="index"
        :x="bar.x"
        :y="bar.y"
        :width="bar.width"
        :height="bar.height"
        rx="2"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>

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
