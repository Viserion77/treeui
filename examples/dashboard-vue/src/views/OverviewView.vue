<script setup lang="ts">
import { computed, reactive } from 'vue';
import {
  TAlert,
  TBadge,
  TBreadcrumb,
  TBreadcrumbItem,
  TButton,
  TCard,
  TCheckbox,
  TConfirmDialog,
  TEmptyState,
  TFormField,
  TGrid,
  TInput,
  TPageHeader,
  TRadio,
  TRadioGroup,
  TSelect,
  TSpacer,
  TStack,
  TStat,
  TSwitch,
  TText,
  TTab,
  TTabList,
  TTabPanel,
  TTable,
  TTabs,
  TTimeline,
  useToast,
} from '@treeui/vue';
import type { TSelectOption } from '@treeui/vue';
import {
  activity,
  channelMonths,
  channelNames,
  currency,
  orders,
  stats,
  type ChannelMonth,
  type OrderStatus,
} from '../data';
import { useDashboardConfig } from '../composables/useDashboardConfig';
import { IconPlus } from '../icons';

const emit = defineEmits<{
  navigate: [view: string];
}>();

const { config } = useDashboardConfig();
const toast = useToast();

// --- KPI sparklines ---------------------------------------------------------
const SPARK_W = 96;
const SPARK_H = 32;
const SPARK_PAD = 3;

function makeSpark(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = SPARK_PAD + (index * (SPARK_W - SPARK_PAD * 2)) / (values.length - 1);
    const y = SPARK_H - SPARK_PAD - ((value - min) / range) * (SPARK_H - SPARK_PAD * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M${line.replaceAll(' ', ' L')} L${SPARK_W - SPARK_PAD},${SPARK_H - SPARK_PAD} L${SPARK_PAD},${SPARK_H - SPARK_PAD} Z`;
  return { line, area, end: points[points.length - 1] };
}

const sparks = stats.map((stat) => makeSpark(stat.spark));

// --- Sessions by channel chart ----------------------------------------------
const CHART_MAX = 160;
const chartTicks = [0, 40, 80, 120, 160];

const monthTotal = (month: ChannelMonth) => month.values.reduce((sum, value) => sum + value, 0);

// --- Latest orders ------------------------------------------------------------
const recentOrders = orders.slice(0, 5);

const orderColumns = [
  { key: 'id', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount', align: 'right' as const },
];

const statusTone = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  failed: 'danger',
} as const;

const toneFor = (status: unknown) => statusTone[status as OrderStatus];

// --- New customer form --------------------------------------------------------
const planOptions: TSelectOption[] = [
  { label: 'Seed', value: 'seed' },
  { label: 'Sapling', value: 'sapling' },
  { label: 'Evergreen', value: 'evergreen' },
];

const form = reactive({
  name: 'Marina',
  email: 'marina@company',
  plan: 'sapling' as string | number,
  updates: true,
  notifications: true,
  billing: 'monthly',
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailError = computed(() =>
  form.email && !EMAIL_PATTERN.test(form.email) ? 'Enter a valid email address.' : '',
);

function saveDraft() {
  toast.add({ title: 'Draft saved', variant: 'info' });
}

function createCustomer() {
  if (emailError.value) {
    toast.add({
      title: 'Check the form',
      description: 'Fix the highlighted fields before saving.',
      variant: 'danger',
    });
    return;
  }
  toast.add({
    title: `Customer ${form.name || 'created'}`,
    description: 'The new customer was added to your workspace.',
    variant: 'success',
  });
}

// --- Page actions --------------------------------------------------------------
function exportReport() {
  toast.add({ title: 'Export started', description: 'We will email you the CSV.', variant: 'info' });
}

function newOrder() {
  toast.add({ title: 'Order #1043 created', variant: 'success' });
}

function deleteReport() {
  toast.add({ title: 'Report deleted', variant: 'info' });
}

function dismissAlert() {
  toast.add({ title: 'Alert dismissed', variant: 'info' });
}
</script>

<template>
  <TStack gap="var(--tree-space-5)">
    <TPageHeader subtitle="Track sales, orders, and customers of your store.">
      <template #breadcrumb>
        <TBreadcrumb>
          <TBreadcrumbItem href="#">
            Orchard
          </TBreadcrumbItem>
          <TBreadcrumbItem current>
            Overview
          </TBreadcrumbItem>
        </TBreadcrumb>
      </template>
      <template #actions>
        <TButton
          variant="ghost"
          :size="config.density"
          @click="exportReport"
        >
          Export
        </TButton>
        <TButton
          variant="outline"
          :size="config.density"
        >
          Filter
        </TButton>
        <TButton
          :size="config.density"
          @click="newOrder"
        >
          <IconPlus
            width="16"
            height="16"
          />
          New order
        </TButton>
      </template>
    </TPageHeader>

    <TTabs
      default-value="summary"
      :size="config.density"
    >
      <TTabList>
        <TTab value="summary">
          Summary
        </TTab>
        <TTab value="sales">
          Sales
        </TTab>
        <TTab value="inventory">
          Inventory
        </TTab>
        <TTab
          value="integrations"
          disabled
        >
          Integrations
        </TTab>
      </TTabList>

      <TTabPanel value="summary">
        <div class="columns">
          <TStack gap="var(--tree-space-5)">
            <TGrid
              v-if="config.widgets.stats"
              min-item-width="13rem"
              gap="var(--tree-space-4)"
            >
              <TStat
                v-for="(stat, index) in stats"
                :key="stat.label"
                :label="stat.label"
                :value="stat.value"
                :trend="stat.trend"
                :trend-direction="stat.trendDirection"
                :tone="stat.tone"
              >
                <template #meta>
                  <span class="kpi-meta">
                    <svg
                      class="kpi-spark"
                      :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`"
                      :width="SPARK_W"
                      :height="SPARK_H"
                      aria-hidden="true"
                    >
                      <path
                        class="kpi-spark__area"
                        :d="sparks[index].area"
                      />
                      <polyline
                        class="kpi-spark__line"
                        :points="sparks[index].line"
                      />
                      <circle
                        class="kpi-spark__dot"
                        :cx="sparks[index].end.x"
                        :cy="sparks[index].end.y"
                        r="2.5"
                      />
                    </svg>
                    {{ stat.meta }}
                  </span>
                </template>
              </TStat>
            </TGrid>

            <TCard
              v-if="config.widgets.channels"
              :variant="config.cardVariant"
              :size="config.density"
            >
              <template #header>
                <TStack
                  direction="horizontal"
                  align="center"
                  gap="var(--tree-space-3)"
                >
                  <TText
                    as="h2"
                    size="md"
                    weight="semibold"
                  >
                    Sessions by channel
                    <TText
                      as="span"
                      tone="muted"
                      weight="regular"
                    >
                      · k/month
                    </TText>
                  </TText>
                  <TSpacer />
                  <TBadge
                    variant="outline"
                    size="sm"
                  >
                    last 7 months
                  </TBadge>
                </TStack>
              </template>
              <div
                class="channels"
                role="img"
                aria-label="Stacked bar chart of monthly sessions in thousands, split by channel. Totals grow from 98 thousand in January to 142 thousand in July."
              >
                <div class="channels__plot">
                  <div
                    v-for="tick in chartTicks"
                    :key="tick"
                    class="channels__gridline"
                    :style="{ bottom: `${(tick / CHART_MAX) * 100}%` }"
                  >
                    <span class="channels__tick">{{ tick }}</span>
                  </div>
                  <div class="channels__cols">
                    <div
                      v-for="month in channelMonths"
                      :key="month.month"
                      class="channels__col"
                    >
                      <span class="channels__total">{{ monthTotal(month) }}</span>
                      <div
                        class="channels__stack"
                        :style="{ height: `${(monthTotal(month) / CHART_MAX) * 100}%` }"
                      >
                        <div
                          v-for="(value, index) in month.values"
                          :key="channelNames[index]"
                          class="channels__seg"
                          :style="{ flexGrow: value, background: `var(--example-chart-${index + 1})` }"
                          :title="`${channelNames[index]}: ${value}k sessions`"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="channels__months">
                  <span
                    v-for="month in channelMonths"
                    :key="month.month"
                  >{{ month.month }}</span>
                </div>
                <ul class="channels__legend">
                  <li
                    v-for="(name, index) in channelNames"
                    :key="name"
                  >
                    <i :style="{ background: `var(--example-chart-${index + 1})` }" />
                    {{ name }}
                  </li>
                </ul>
              </div>
            </TCard>

            <TCard
              v-if="config.widgets.orders"
              :variant="config.cardVariant"
              :size="config.density"
            >
              <template #header>
                <TStack
                  direction="horizontal"
                  align="center"
                  gap="var(--tree-space-3)"
                >
                  <TText
                    as="h2"
                    size="md"
                    weight="semibold"
                  >
                    Latest orders
                  </TText>
                  <TSpacer />
                  <TButton
                    variant="soft"
                    size="sm"
                    @click="emit('navigate', 'orders')"
                  >
                    View all
                  </TButton>
                </TStack>
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

          <TStack gap="var(--tree-space-5)">
            <TCard
              v-if="config.widgets.customer"
              :variant="config.cardVariant"
              :size="config.density"
              title="New customer"
            >
              <TStack gap="var(--tree-space-4)">
                <TFormField
                  label="Name"
                  hint="Shown on invoices and receipts."
                >
                  <TInput
                    v-model="form.name"
                    :size="config.density"
                    placeholder="Full name"
                    aria-label="Name"
                  />
                </TFormField>

                <TFormField
                  label="Email"
                  :error="emailError"
                >
                  <TInput
                    v-model="form.email"
                    type="email"
                    :size="config.density"
                    :invalid="Boolean(emailError)"
                    placeholder="name@company.com"
                    aria-label="Email"
                  />
                </TFormField>

                <TFormField label="Plan">
                  <TSelect
                    v-model="form.plan"
                    aria-label="Plan"
                    :size="config.density"
                    :options="planOptions"
                  />
                </TFormField>

                <TCheckbox
                  v-model="form.updates"
                  size="sm"
                >
                  Email me product updates
                </TCheckbox>

                <TSwitch
                  v-model="form.notifications"
                  size="sm"
                >
                  Enable notifications
                </TSwitch>

                <TRadioGroup
                  v-model="form.billing"
                  name="billing"
                  size="sm"
                  aria-label="Billing period"
                >
                  <TRadio value="monthly">
                    Monthly billing
                  </TRadio>
                  <TRadio value="yearly">
                    Yearly billing
                  </TRadio>
                </TRadioGroup>
              </TStack>

              <template #footer>
                <TStack
                  direction="horizontal"
                  justify="flex-end"
                  gap="var(--tree-space-2)"
                >
                  <TButton
                    variant="soft"
                    size="sm"
                    @click="saveDraft"
                  >
                    Save draft
                  </TButton>
                  <TButton
                    size="sm"
                    @click="createCustomer"
                  >
                    Create customer
                  </TButton>
                </TStack>
              </template>
            </TCard>

            <TCard
              v-if="config.widgets.alerts"
              :variant="config.cardVariant"
              :size="config.density"
              title="Alerts"
            >
              <TStack gap="var(--tree-space-3)">
                <TAlert
                  variant="success"
                  size="sm"
                >
                  Backup finished at 02:00.
                </TAlert>
                <TAlert
                  variant="info"
                  size="sm"
                >
                  Version 2.4 is available.
                </TAlert>
                <TAlert
                  variant="warning"
                  size="sm"
                >
                  Plan usage reached 80%.
                </TAlert>
                <TAlert
                  variant="danger"
                  size="sm"
                  dismissible
                  @dismiss="dismissAlert"
                >
                  Inventory sync failed.
                </TAlert>
              </TStack>
            </TCard>

            <TCard
              :variant="config.cardVariant"
              :size="config.density"
              title="Danger zone"
            >
              <TStack gap="var(--tree-space-3)">
                <TText
                  as="p"
                  tone="muted"
                  size="sm"
                >
                  Deleting the quarterly report removes it for every teammate.
                </TText>
                <TConfirmDialog
                  title="Delete report?"
                  description="This action cannot be undone."
                  confirm-label="Delete"
                  cancel-label="Cancel"
                  @confirm="deleteReport"
                >
                  <template #trigger>
                    <TButton
                      variant="danger"
                      size="sm"
                    >
                      Delete report
                    </TButton>
                  </template>
                </TConfirmDialog>
              </TStack>
            </TCard>

            <TCard
              v-if="config.widgets.activity"
              :variant="config.cardVariant"
              :size="config.density"
              title="Recent activity"
            >
              <TTimeline
                aria-label="Recent activity"
                :items="activity"
                :size="config.density"
              />
            </TCard>
          </TStack>
        </div>
      </TTabPanel>

      <TTabPanel value="sales">
        <TEmptyState
          title="Sales analytics land here"
          description="Connect a data source or explore the summary tab while we crunch the numbers."
        />
      </TTabPanel>

      <TTabPanel value="inventory">
        <TEmptyState
          title="No inventory tracked yet"
          description="Import your catalog to start tracking stock levels."
        />
      </TTabPanel>
    </TTabs>
  </TStack>
</template>

<style>
/* Calibrated data-viz accents for the sessions chart. Same hue per channel in
   both themes; each set passes CVD separation and 3:1 contrast on its surface. */
.channels {
  --example-chart-1: #0969da;
  --example-chart-2: #1a7f37;
  --example-chart-3: #8250df;
  --example-chart-4: #bc4c00;
  --example-chart-5: #bf3989;
}

[data-tree-theme='dark'] .channels {
  --example-chart-1: #4c8fe6;
  --example-chart-2: #54a857;
  --example-chart-3: #986ee2;
  --example-chart-4: #b78a26;
  --example-chart-5: #e0625a;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-tree-theme='light']) .channels {
    --example-chart-1: #4c8fe6;
    --example-chart-2: #54a857;
    --example-chart-3: #986ee2;
    --example-chart-4: #b78a26;
    --example-chart-5: #e0625a;
  }
}
</style>

<style scoped>
/* Asymmetric main + aside dashboard layout that collapses to one column.
   GAP: no `TSplit`/two-column-with-aside layout primitive in the library yet. */
.columns {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--tree-space-5);
  align-items: start;
  margin-top: var(--tree-space-5);
}

.kpi-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--tree-space-2);
}

.kpi-spark {
  flex-shrink: 1;
  min-width: 0;
}

.kpi-spark__area {
  fill: var(--tree-color-brand-primary);
  opacity: 0.14;
}

.kpi-spark__line {
  fill: none;
  stroke: var(--tree-color-brand-primary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.kpi-spark__dot {
  fill: var(--tree-color-brand-primary);
}

.channels {
  display: grid;
  gap: var(--tree-space-3);
}

.channels__plot {
  position: relative;
  height: 13rem;
  padding-left: var(--tree-space-8);
}

.channels__gridline {
  position: absolute;
  left: var(--tree-space-8);
  right: 0;
  border-top: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  opacity: 0.6;
}

.channels__tick {
  position: absolute;
  right: calc(100% + var(--tree-space-2));
  transform: translateY(-50%);
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.channels__cols {
  position: absolute;
  inset: 0 0 0 var(--tree-space-8);
  display: flex;
  justify-content: space-around;
}

.channels__col {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: var(--tree-space-1);
  width: 2.5rem;
}

.channels__total {
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.channels__stack {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  width: 100%;
}

.channels__seg {
  flex-basis: 0;
  border-radius: 2px;
  min-height: 2px;
}

.channels__seg:last-child {
  border-radius: 4px 4px 2px 2px;
}

.channels__months {
  display: flex;
  justify-content: space-around;
  padding-left: var(--tree-space-8);
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
}

.channels__months span {
  width: 2.5rem;
  text-align: center;
}

.channels__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tree-space-1) var(--tree-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
}

.channels__legend li {
  display: inline-flex;
  align-items: center;
  gap: var(--tree-space-1);
}

.channels__legend i {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

@media (max-width: 960px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
