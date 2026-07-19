<script setup lang="ts">
import { computed, reactive } from 'vue';
import {
  TAlert,
  TBadge,
  TBreadcrumb,
  TBreadcrumbItem,
  TButton,
  TCard,
  TChart,
  TCheckbox,
  TConfirmDialog,
  TEmptyState,
  TFormField,
  TGrid,
  TIcon,
  TInput,
  TPageHeader,
  TRadio,
  TRadioGroup,
  TSelect,
  TSpacer,
  TSparkline,
  TSplit,
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
  type OrderStatus,
} from '../data';
import { useDashboardConfig } from '../composables/useDashboardConfig';

const emit = defineEmits<{
  navigate: [view: string];
}>();

const { config } = useDashboardConfig();
const toast = useToast();

// --- Sessions by channel chart ----------------------------------------------
// Reshape the raw data into TChart's series/labels model — one stacked bar
// series per channel.
const channelLabels = channelMonths.map((month) => month.month);
const channelSeries = channelNames.map((name, index) => ({
  name,
  data: channelMonths.map((month) => month.values[index]),
}));

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
          <TIcon
            name="plus"
            :size="16"
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
        <TSplit
          :ratio="1.6"
          min-width="26rem"
        >
          <TStack gap="var(--tree-space-5)">
            <TGrid
              v-if="config.widgets.stats"
              min-item-width="13rem"
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
              >
                <template #meta>
                  <TStack
                    direction="horizontal"
                    align="center"
                    gap="var(--tree-space-2)"
                  >
                    <TSparkline
                      type="area"
                      :data="stat.spark"
                      :show-last-point="true"
                      color="var(--tree-color-brand-primary)"
                    />
                    {{ stat.meta }}
                  </TStack>
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
              <TChart
                type="bar"
                stacked
                :series="channelSeries"
                :labels="channelLabels"
                :height="220"
                show-grid
                show-x-axis
                show-y-axis
                show-legend
                aria-label="Stacked bar chart of monthly sessions in thousands, split by channel. Totals grow from 98 thousand in January to 142 thousand in July."
              />
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

          <template #aside>
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
          </template>
        </TSplit>
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
