import type { Meta, StoryObj } from '@storybook/vue3';
import { TPricing, TPricingCard } from '@treeui/vue';

const starterFeatures = [
  { text: '5 projects', included: true },
  { text: '10 GB storage', included: true },
  { text: 'Community support', included: true },
  { text: 'Custom domain', included: false },
  { text: 'Analytics', included: false },
];

const proFeatures = [
  { text: 'Unlimited projects', included: true },
  { text: '100 GB storage', included: true },
  { text: 'Priority support', included: true },
  { text: 'Custom domain', included: true },
  { text: 'Analytics', included: true },
];

const enterpriseFeatures = [
  { text: 'Unlimited everything', included: true },
  { text: '1 TB storage', included: true },
  { text: 'Dedicated support', included: true },
  { text: 'Custom domain', included: true },
  { text: 'Advanced analytics', included: true },
];

const defaultPlans = [
  {
    title: 'Starter',
    description: 'For individuals and small projects',
    price: 0,
    currency: '$',
    period: '/month',
    features: starterFeatures,
    buttonText: 'Start free',
  },
  {
    title: 'Pro',
    description: 'Best for growing teams',
    price: 29,
    currency: '$',
    period: '/month',
    features: proFeatures,
    highlighted: true,
    badge: 'Most popular',
    buttonText: 'Get started',
  },
  {
    title: 'Enterprise',
    description: 'For large organizations',
    price: 99,
    currency: '$',
    period: '/month',
    features: enterpriseFeatures,
    buttonText: 'Contact sales',
  },
];

const meta = {
  title: 'Components/Data Display/Pricing',
  component: TPricing,
  tags: ['autodocs'],
  args: {
    plans: defaultPlans,
    size: 'md',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    columns: { control: 'number' },
  },
} satisfies Meta<typeof TPricing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TPricing },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 960px; padding-top: 1rem;">
        <TPricing v-bind="args" />
      </div>
    `,
  }),
};

export const TwoColumns: Story = {
  render: () => ({
    components: { TPricing },
    setup: () => ({
      plans: defaultPlans.slice(0, 2),
    }),
    template: `
      <div style="max-width: 700px; padding-top: 1rem;">
        <TPricing :plans="plans" :columns="2" />
      </div>
    `,
  }),
};

export const Small: Story = {
  render: () => ({
    components: { TPricing },
    setup: () => ({ plans: defaultPlans }),
    template: `
      <div style="max-width: 960px; padding-top: 1rem;">
        <TPricing :plans="plans" size="sm" />
      </div>
    `,
  }),
};

export const CustomSlot: Story = {
  render: () => ({
    components: { TPricing, TPricingCard },
    setup: () => ({ plans: defaultPlans }),
    template: `
      <div style="max-width: 960px; padding-top: 1rem;">
        <TPricing :plans="plans">
          <template #plan="{ plan, index }">
            <TPricingCard v-bind="plan" />
          </template>
        </TPricing>
      </div>
    `,
  }),
};
