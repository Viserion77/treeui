<script setup lang="ts">
// DataListing — recipe "data-listing": a structured TTable with client-side paging.
// TTable handles the listing; TPagination + local refs (page/pageSize) drive the visible slice.
import { computed, ref } from 'vue';
import { TTable, TPagination, TStack } from '@treeui/vue';

interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'refunded';
  // Index signature so the rows array satisfies TTable's `Record<string, unknown>[]` prop.
  [key: string]: unknown;
}

const columns = [
  { key: 'id', label: 'Order', width: '6rem' },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'total', label: 'Total', sortable: true, align: 'right' as const },
];

const orders: Order[] = [
  { id: '#1001', customer: 'Ada Lovelace', total: 128.4, status: 'paid' },
  { id: '#1002', customer: 'Alan Turing', total: 64.0, status: 'pending' },
  { id: '#1003', customer: 'Grace Hopper', total: 312.9, status: 'paid' },
  { id: '#1004', customer: 'Edsger Dijkstra', total: 19.99, status: 'refunded' },
  { id: '#1005', customer: 'Katherine Johnson', total: 540.0, status: 'paid' },
  { id: '#1006', customer: 'Linus Torvalds', total: 88.5, status: 'pending' },
  { id: '#1007', customer: 'Margaret Hamilton', total: 256.75, status: 'paid' },
  { id: '#1008', customer: 'Donald Knuth', total: 42.0, status: 'pending' },
  { id: '#1009', customer: 'Barbara Liskov', total: 199.0, status: 'paid' },
  { id: '#1010', customer: 'Tim Berners-Lee', total: 73.2, status: 'refunded' },
  { id: '#1011', customer: 'Dennis Ritchie', total: 145.6, status: 'paid' },
  { id: '#1012', customer: 'Ken Thompson', total: 30.0, status: 'pending' },
];

const page = ref(1);
const pageSize = ref(5);

const totalPages = computed(() => Math.max(1, Math.ceil(orders.length / pageSize.value)));

const visibleRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return orders.slice(start, start + pageSize.value);
});

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
</script>

<template>
  <TStack gap="var(--tree-space-4)">
    <TTable
      :columns="columns"
      :rows="visibleRows"
    >
      <!-- Derived/rich content: format the numeric total as currency. -->
      <template #cell-total="{ value }">
        {{ currency.format(Number(value)) }}
      </template>
    </TTable>

    <TStack
      direction="horizontal"
      justify="flex-end"
    >
      <TPagination
        v-model="page"
        :total-pages="totalPages"
      />
    </TStack>
  </TStack>
</template>
