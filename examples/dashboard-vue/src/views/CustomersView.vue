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
  TSpacer,
  TStack,
  TTag,
  TText,
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
      style="max-width: 24rem"
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
          <TStack
            direction="horizontal"
            align="center"
            gap="var(--tree-space-3)"
          >
            <TAvatar
              :initials="initialsOf(customer.name)"
              :status="customer.status"
              :size="config.density"
              :alt="customer.name"
            />
            <TStack
              grow
              gap="0"
            >
              <TText weight="medium">
                {{ customer.name }}
              </TText>
              <TText
                tone="muted"
                size="sm"
                truncate
              >
                {{ customer.email }}
              </TText>
            </TStack>
            <TTag size="sm">
              {{ customer.plan }}
            </TTag>
          </TStack>

          <TDivider />

          <TStack
            direction="horizontal"
            align="center"
            gap="var(--tree-space-5)"
          >
            <TStack gap="0">
              <TText weight="semibold">
                {{ customer.orders }}
              </TText>
              <TText
                tone="muted"
                size="sm"
              >
                orders
              </TText>
            </TStack>
            <TStack gap="0">
              <TText weight="semibold">
                {{ currency.format(customer.lifetimeValue) }}
              </TText>
              <TText
                tone="muted"
                size="sm"
              >
                lifetime value
              </TText>
            </TStack>
            <TSpacer />
            <TButton
              variant="ghost"
              size="sm"
              @click="message(customer.name)"
            >
              Message
            </TButton>
          </TStack>
        </TStack>
      </TCard>
    </TGrid>
  </TStack>
</template>
