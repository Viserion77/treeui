<script setup lang="ts">
import { TBadge, TButton, TCard, TGrid, TProgress, TStack, TStat, TTable, TTimeline } from '@treeui/vue';
import { activity, currency, goals, orders, stats, type OrderStatus } from '../data';
import { useDashboardConfig } from '../composables/useDashboardConfig';

const emit = defineEmits<{
  navigate: [view: string];
}>();

const { config } = useDashboardConfig();

const recentOrders = orders.slice(0, 5);

const orderColumns = [
  { key: 'id', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', align: 'right' as const },
];

const statusTone = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  failed: 'danger',
} as const;

const toneFor = (status: unknown) => statusTone[status as OrderStatus];
</script>

<template>
  <TStack gap="var(--tree-space-6)">
    <TGrid
      v-if="config.widgets.stats"
      min-item-width="14rem"
      gap="var(--tree-space-4)"
    >
      <TStat
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :trend="stat.trend"
        :trend-direction="stat.trendDirection"
        :tone="stat.tone"
        :meta="stat.meta"
      />
    </TGrid>

    <div class="columns">
      <TStack gap="var(--tree-space-6)">
        <TCard
          v-if="config.widgets.goals"
          :variant="config.cardVariant"
          :size="config.density"
          title="Quarterly goals"
        >
          <TStack gap="var(--tree-space-5)">
            <div
              v-for="goal in goals"
              :key="goal.label"
              class="goal"
            >
              <div class="goal__head">
                <span>{{ goal.label }}</span>
                <span class="goal__meta">{{ goal.value }}% · {{ goal.target }}</span>
              </div>
              <TProgress
                :value="goal.value"
                :label="goal.label"
                :size="config.density"
              />
            </div>
          </TStack>
        </TCard>

        <TCard
          v-if="config.widgets.orders"
          :variant="config.cardVariant"
          :size="config.density"
        >
          <template #header>
            <div class="card-head">
              <h2 class="card-title">
                Latest orders
              </h2>
              <TButton
                variant="ghost"
                size="sm"
                @click="emit('navigate', 'orders')"
              >
                View all
              </TButton>
            </div>
          </template>
          <TTable
            :columns="orderColumns"
            :rows="recentOrders"
            :size="config.density"
          >
            <template #cell-status="{ value }">
              <TBadge
                :tone="toneFor(value)"
                size="sm"
              >
                {{ value }}
              </TBadge>
            </template>
            <template #cell-amount="{ value }">
              {{ currency.format(Number(value)) }}
            </template>
          </TTable>
        </TCard>
      </TStack>

      <TCard
        v-if="config.widgets.activity"
        :variant="config.cardVariant"
        :size="config.density"
        title="Recent activity"
        class="activity"
      >
        <TTimeline
          aria-label="Recent activity"
          :items="activity"
          :size="config.density"
        />
      </TCard>
    </div>
  </TStack>
</template>

<style scoped>
.columns {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--tree-space-6);
  align-items: start;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-3);
}

.card-title {
  margin: 0;
  font-size: var(--tree-font-size-md);
  font-weight: var(--tree-font-weight-semibold, 600);
}

.goal__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--tree-space-3);
  margin-bottom: var(--tree-space-2);
  font-size: var(--tree-font-size-sm);
}

.goal__meta {
  color: var(--tree-color-text-muted);
}

@media (max-width: 960px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
