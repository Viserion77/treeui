<script setup lang="ts">
// PricingSection — a pricing comparison section built from TreeUI components.
// Implements recipe: pricing-section
// Renders a header (with TBadge + TButton billing toggle) above a TPricing grid of plans;
// the recommended plan uses `highlighted` and `badge`.
import { computed, ref } from 'vue';
import { TPricing, TBadge, TButton } from '@treeui/vue';
import type { PricingFeature } from '@treeui/vue';

interface Plan {
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

const billing = ref<'monthly' | 'yearly'>('monthly');
const selectedPlan = ref<string | null>(null);

const plans = computed<Plan[]>(() => {
  const yearly = billing.value === 'yearly';
  const period = yearly ? '/year' : '/month';
  return [
    {
      title: 'Starter',
      description: 'For individuals getting started.',
      price: yearly ? 90 : 9,
      period,
      buttonText: 'Choose Starter',
      features: [
        { text: 'Up to 3 projects' },
        { text: 'Community support' },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      title: 'Pro',
      description: 'For growing teams that need more.',
      price: yearly ? 290 : 29,
      period,
      highlighted: true,
      badge: 'Most popular',
      buttonText: 'Choose Pro',
      features: [
        { text: 'Unlimited projects' },
        { text: 'Advanced analytics' },
        { text: 'Priority support' },
        { text: 'Dedicated account manager', included: false },
      ],
    },
    {
      title: 'Enterprise',
      description: 'For organizations at scale.',
      price: 'Custom',
      currency: '',
      buttonText: 'Contact sales',
      features: [
        { text: 'Unlimited projects' },
        { text: 'Advanced analytics' },
        { text: 'Priority support' },
        { text: 'Dedicated account manager' },
      ],
    },
  ];
});

const onSelect = (plan: Plan) => {
  selectedPlan.value = plan.title;
};
</script>

<template>
  <section class="pricing-section">
    <header class="pricing-section__head">
      <TBadge
        variant="soft"
        tone="info"
      >
        Pricing
      </TBadge>
      <h2 class="pricing-section__title">
        Plans that scale with you
      </h2>
      <p class="pricing-section__subtitle">
        Pick the plan that fits your team. Switch or cancel anytime.
      </p>
      <div
        class="pricing-section__toggle"
        role="group"
        aria-label="Billing period"
      >
        <TButton
          :variant="billing === 'monthly' ? 'solid' : 'ghost'"
          size="sm"
          @click="billing = 'monthly'"
        >
          Monthly
        </TButton>
        <TButton
          :variant="billing === 'yearly' ? 'solid' : 'ghost'"
          size="sm"
          @click="billing = 'yearly'"
        >
          Yearly
        </TButton>
      </div>
    </header>

    <TPricing
      :plans="plans"
      size="md"
      @select="onSelect"
    />

    <p
      v-if="selectedPlan"
      class="pricing-section__status"
      role="status"
    >
      Selected plan: {{ selectedPlan }}
    </p>
  </section>
</template>

<style scoped>
.pricing-section__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--tree-space-2);
  text-align: center;
  margin-bottom: var(--tree-space-8);
}

.pricing-section__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.pricing-section__subtitle {
  margin: 0;
  max-width: 36rem;
  opacity: 0.7;
}

.pricing-section__toggle {
  display: inline-flex;
  gap: var(--tree-space-1);
  margin-top: var(--tree-space-3);
}

.pricing-section__status {
  margin-top: var(--tree-space-6);
  text-align: center;
}
</style>
