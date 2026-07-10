<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  TAvatar,
  TButton,
  TCard,
  TDivider,
  TEmptyState,
  TGrid,
  TIcon,
  TInput,
  TStack,
  TTag,
  useToast,
} from '@treeui/vue';
import { currency, customers } from '../data';
import { useDashboardConfig } from '../composables/useDashboardConfig';

const { config } = useDashboardConfig();
const toast = useToast();

const search = ref('');

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) {
    return customers;
  }
  return customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.plan.toLowerCase().includes(term),
  );
});

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function message(name: string) {
  toast.add({ title: `Message sent to ${name}`, variant: 'success' });
}
</script>

<template>
  <TStack gap="var(--tree-space-5)">
    <TInput
      v-model="search"
      type="search"
      placeholder="Search customers…"
      aria-label="Search customers"
      :size="config.density"
      class="search"
    >
      <template #prefix>
        <TIcon name="search" />
      </template>
    </TInput>

    <TEmptyState
      v-if="filtered.length === 0"
      title="No customers found"
      description="Try searching by name, email, or plan."
    >
      <template #icon>
        <TIcon
          name="search"
          :size="28"
        />
      </template>
    </TEmptyState>

    <TGrid
      v-else
      min-item-width="17rem"
      gap="var(--tree-space-4)"
    >
      <TCard
        v-for="customer in filtered"
        :key="customer.id"
        :variant="config.cardVariant"
        :size="config.density"
      >
        <TStack gap="var(--tree-space-4)">
          <div class="person">
            <TAvatar
              :initials="initialsOf(customer.name)"
              :status="customer.status"
              :size="config.density"
              :alt="customer.name"
            />
            <div class="person__id">
              <span class="person__name">{{ customer.name }}</span>
              <span class="person__email">{{ customer.email }}</span>
            </div>
            <TTag
              size="sm"
              class="person__plan"
            >
              {{ customer.plan }}
            </TTag>
          </div>

          <TDivider />

          <div class="numbers">
            <div class="numbers__item">
              <span class="numbers__value">{{ customer.orders }}</span>
              <span class="numbers__label">orders</span>
            </div>
            <div class="numbers__item">
              <span class="numbers__value">{{ currency.format(customer.lifetimeValue) }}</span>
              <span class="numbers__label">lifetime value</span>
            </div>
            <TButton
              variant="ghost"
              size="sm"
              class="numbers__action"
              @click="message(customer.name)"
            >
              Message
            </TButton>
          </div>
        </TStack>
      </TCard>
    </TGrid>
  </TStack>
</template>

<style scoped>
.search {
  max-width: 24rem;
}

.person {
  display: flex;
  align-items: center;
  gap: var(--tree-space-3);
}

.person__id {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.person__name {
  font-weight: var(--tree-font-weight-medium);
}

.person__email {
  font-size: var(--tree-font-size-sm);
  color: var(--tree-color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.numbers {
  display: flex;
  align-items: center;
  gap: var(--tree-space-5);
}

.numbers__item {
  display: flex;
  flex-direction: column;
}

.numbers__value {
  font-weight: var(--tree-font-weight-semibold, 600);
}

.numbers__label {
  font-size: var(--tree-font-size-sm);
  color: var(--tree-color-text-muted);
}

.numbers__action {
  margin-left: auto;
}
</style>
