<script setup lang="ts">
// StatGrid — a responsive dashboard metric grid.
// Implements recipe: stat-grid (composes TGrid + TStat).
import { ref } from 'vue';
import { TGrid, TStat } from '@treeui/vue';

interface Metric {
  label: string;
  value: string;
  trend: string;
  meta: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  trendDirection: 'up' | 'down' | 'neutral';
}

const metrics = ref<Metric[]>([
  {
    label: 'Monthly recurring revenue',
    value: '$48.2k',
    trend: '12.4% vs last month',
    meta: 'Jun 2026',
    tone: 'success',
    trendDirection: 'up',
  },
  {
    label: 'Active users',
    value: '18,420',
    trend: '4.1% vs last month',
    meta: 'Last 30 days',
    tone: 'info',
    trendDirection: 'up',
  },
  {
    label: 'Churn rate',
    value: '2.3%',
    trend: '0.6% vs last month',
    meta: 'Last 30 days',
    tone: 'warning',
    trendDirection: 'down',
  },
  {
    label: 'Open tickets',
    value: '37',
    trend: 'No change',
    meta: 'Support queue',
    tone: 'neutral',
    trendDirection: 'neutral',
  },
]);
</script>

<template>
  <TGrid
    min-item-width="14rem"
    gap="var(--tree-space-4)"
  >
    <TStat
      v-for="metric in metrics"
      :key="metric.label"
      :label="metric.label"
      :value="metric.value"
      :trend="metric.trend"
      :meta="metric.meta"
      :tone="metric.tone"
      :trend-direction="metric.trendDirection"
    />
  </TGrid>
</template>
