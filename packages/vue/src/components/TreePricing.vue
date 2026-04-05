<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';
import TreePricingCard from './TreePricingCard.vue';
import type { PricingFeature } from './TreePricingCard.vue';

export interface PricingPlan {
  title: string;
  description?: string;
  price: string | number;
  currency?: string;
  period?: string;
  features?: PricingFeature[];
  highlighted?: boolean;
  badge?: string;
  buttonText?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    plans: PricingPlan[];
    size?: TreeSize;
    columns?: number;
  }>(),
  {
    size: 'md',
    columns: undefined,
  },
);

const emit = defineEmits<{
  select: [plan: PricingPlan, index: number];
}>();

const gridStyle = computed(() => {
  if (props.columns) {
    return { gridTemplateColumns: `repeat(${props.columns}, 1fr)` };
  }
  return { gridTemplateColumns: `repeat(${props.plans.length}, 1fr)` };
});
</script>

<template>
  <div
    class="tree-pricing"
    :style="gridStyle"
    role="list"
  >
    <div
      v-for="(plan, index) in plans"
      :key="index"
      role="listitem"
    >
      <slot
        name="plan"
        :plan="plan"
        :index="index"
      >
        <TreePricingCard
          v-bind="plan"
          :size="size"
          @select="emit('select', plan, index)"
        />
      </slot>
    </div>
  </div>
</template>
