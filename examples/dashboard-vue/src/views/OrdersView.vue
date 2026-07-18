<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  TBadge,
  TButton,
  TCard,
  TConfirmDialog,
  TDropdown,
  TEmptyState,
  TFormField,
  TIcon,
  TInput,
  TModal,
  TPagination,
  TSelect,
  TStack,
  TStackItem,
  TTable,
  TText,
  useToast,
} from '@treeui/vue';
import { currency, orders as seedOrders, type Order, type OrderStatus } from '../data';
import { useDashboardConfig } from '../composables/useDashboardConfig';

const { config } = useDashboardConfig();
const toast = useToast();

const orders = ref<Order[]>([...seedOrders]);

const search = ref('');
const statusFilter = ref<string | number>('all');
const page = ref(1);
const pageSize = 8;

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Failed', value: 'failed' },
];

const statusTone = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  failed: 'danger',
} as const;

const toneFor = (status: unknown) => statusTone[status as OrderStatus];

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  return orders.value.filter((order) => {
    const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value;
    const matchesTerm =
      !term ||
      order.customer.toLowerCase().includes(term) ||
      order.product.toLowerCase().includes(term) ||
      order.id.toLowerCase().includes(term);
    return matchesStatus && matchesTerm;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const pageRows = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);

watch([search, statusFilter], () => {
  page.value = 1;
});

const orderColumns = [
  { key: 'id', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'product', label: 'Product' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', align: 'right' as const },
  { key: 'actions', label: '', width: '4rem', align: 'right' as const },
];

const rowActions = [
  { label: 'Copy order id', value: 'copy' },
  { label: 'Mark as paid', value: 'paid' },
  { label: 'Delete order', value: 'delete' },
];

const pendingDelete = ref<Order | null>(null);

function onRowAction(order: Order, action: string) {
  if (action === 'delete') {
    pendingDelete.value = order;
    return;
  }
  if (action === 'paid') {
    order.status = 'paid';
    toast.add({ title: `${order.id} marked as paid`, variant: 'success' });
    return;
  }
  void navigator.clipboard?.writeText(order.id);
  toast.add({ title: `${order.id} copied to clipboard`, variant: 'info' });
}

const deleteOpen = computed({
  get: () => pendingDelete.value !== null,
  set: (value: boolean) => {
    if (!value) {
      pendingDelete.value = null;
    }
  },
});

function confirmDelete() {
  const target = pendingDelete.value;
  if (!target) {
    return;
  }
  orders.value = orders.value.filter((order) => order.id !== target.id);
  toast.add({
    title: `${target.id} deleted`,
    description: `${target.customer} — ${currency.format(target.amount)}`,
    variant: 'danger',
  });
}

function clearFilters() {
  search.value = '';
  statusFilter.value = 'all';
}

const newOrderOpen = ref(false);
const newOrder = reactive({
  customer: '',
  product: 'Seed plan',
  amount: '29',
});

const productOptions = [
  { label: 'Seed plan — $29', value: 'Seed plan' },
  { label: 'Sapling plan — $99', value: 'Sapling plan' },
  { label: 'Evergreen plan — $289', value: 'Evergreen plan' },
  { label: 'Design add-on — $49', value: 'Design add-on' },
  { label: 'Analytics add-on — $79', value: 'Analytics add-on' },
];

const productPrices: Record<string, number> = {
  'Seed plan': 29,
  'Sapling plan': 99,
  'Evergreen plan': 289,
  'Design add-on': 49,
  'Analytics add-on': 79,
};

function createOrder() {
  if (!newOrder.customer.trim()) {
    return;
  }
  const nextNumber =
    Math.max(...orders.value.map((order) => Number(order.id.replace('#', '')))) + 1;
  orders.value = [
    {
      id: `#${nextNumber}`,
      customer: newOrder.customer.trim(),
      product: newOrder.product,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      amount: productPrices[newOrder.product] ?? Number(newOrder.amount),
    },
    ...orders.value,
  ];
  newOrderOpen.value = false;
  newOrder.customer = '';
  toast.add({ title: `Order #${nextNumber} created`, variant: 'success' });
}
</script>

<template>
  <TCard
    :variant="config.cardVariant"
    :size="config.density"
  >
    <template #header>
      <TStack
        direction="horizontal"
        align="center"
        wrap
        gap="var(--tree-space-3)"
      >
        <TStackItem
          grow
          basis="0"
          min-width="14rem"
        >
          <TInput
            v-model="search"
            type="search"
            placeholder="Search orders…"
            aria-label="Search orders"
            :size="config.density"
          >
            <template #prefix>
              <TIcon name="search" />
            </template>
          </TInput>
        </TStackItem>
        <TSelect
          v-model="statusFilter"
          aria-label="Filter by status"
          :options="statusOptions"
          :size="config.density"
        />
        <TModal
          v-model:open="newOrderOpen"
          title="New order"
          description="Create a manual order for an existing customer."
        >
          <template #trigger>
            <TButton :size="config.density">
              New order
            </TButton>
          </template>
          <TStack gap="var(--tree-space-4)">
            <TFormField
              label="Customer"
              required
              :size="config.density"
            >
              <TInput
                v-model="newOrder.customer"
                placeholder="Full name"
                :size="config.density"
              />
            </TFormField>
            <TFormField
              label="Product"
              :size="config.density"
            >
              <TSelect
                v-model="newOrder.product"
                :options="productOptions"
                :size="config.density"
              />
            </TFormField>
          </TStack>
          <template #footer>
            <TStack
              direction="horizontal"
              justify="flex-end"
              gap="var(--tree-space-3)"
            >
              <TButton
                variant="ghost"
                :size="config.density"
                @click="newOrderOpen = false"
              >
                Cancel
              </TButton>
              <TButton
                :size="config.density"
                :disabled="!newOrder.customer.trim()"
                @click="createOrder"
              >
                Create order
              </TButton>
            </TStack>
          </template>
        </TModal>
      </TStack>
    </template>

    <TEmptyState
      v-if="filtered.length === 0"
      title="No matching orders"
      description="Try a different search term or clear the status filter."
    >
      <template #icon>
        <TIcon
          name="search"
          :size="28"
        />
      </template>
      <template #actions>
        <TButton
          variant="outline"
          size="sm"
          @click="clearFilters"
        >
          Clear filters
        </TButton>
      </template>
    </TEmptyState>

    <template v-else>
      <TStack gap="var(--tree-space-4)">
        <TTable
          :columns="orderColumns"
          :rows="pageRows"
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
          <template #cell-actions="{ row }">
            <TDropdown
              :items="rowActions"
              size="sm"
              align="end"
              label="⋯"
              :aria-label="`Actions for ${row.id}`"
              @select="onRowAction(row as Order, $event)"
            />
          </template>
        </TTable>

        <TStack
          direction="horizontal"
          align="center"
          justify="space-between"
          wrap
          gap="var(--tree-space-3)"
        >
          <TText
            tone="muted"
            size="sm"
          >
            {{ filtered.length }} orders
          </TText>
          <TPagination
            v-model="page"
            :total-pages="totalPages"
            :size="config.density"
          />
        </TStack>
      </TStack>
    </template>
  </TCard>

  <TConfirmDialog
    v-model:open="deleteOpen"
    title="Delete order"
    :description="`${pendingDelete?.id} for ${pendingDelete?.customer} will be permanently removed.`"
    confirm-label="Delete"
    @confirm="confirmDelete"
  />
</template>
