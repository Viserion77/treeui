import type { Meta, StoryObj } from '@storybook/vue3';
import { TPricing, TPricingCard } from '@treeui/vue';

const sampleFeatures = [
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

const cardMeta = {
  title: 'Components/Data Display/PricingCard',
  component: TPricingCard,
  tags: ['autodocs'],
  args: {
    title: 'Pro',
    description: 'Best for growing teams',
    price: 29,
    currency: '$',
    period: '/month',
    features: proFeatures,
    highlighted: false,
    badge: undefined,
    buttonText: 'Get started',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TPricingCard>;

export default cardMeta;

type Story = StoryObj<typeof cardMeta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TPricingCard },
    setup: () => ({ args }),
    template: `
      <div style="width: 320px;">
        <TPricingCard v-bind="args" />
      </div>
    `,
  }),
};

export const Highlighted: Story = {
  args: {
    highlighted: true,
    badge: 'Most popular',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TPricingCard },
    setup: () => ({ args }),
    template: `
      <div style="width: 320px; padding-top: 1rem;">
        <TPricingCard v-bind="args" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TPricingCard },
    setup: () => ({ proFeatures }),
    template: `
      <div style="display: flex; gap: 1.5rem; align-items: start;">
        <div style="width: 260px;">
          <TPricingCard title="Small" price="9" period="/mo" size="sm" button-text="Choose" :features="proFeatures" />
        </div>
        <div style="width: 300px;">
          <TPricingCard title="Medium" price="29" period="/mo" size="md" button-text="Choose" :features="proFeatures" />
        </div>
        <div style="width: 340px;">
          <TPricingCard title="Large" price="99" period="/mo" size="lg" button-text="Choose" :features="proFeatures" />
        </div>
      </div>
    `,
  }),
};

export const PricingGrid: Story = {
  render: () => ({
    components: { TPricing },
    setup: () => ({
      plans: [
        {
          title: 'Starter',
          description: 'For individuals and small projects',
          price: 0,
          currency: '$',
          period: '/month',
          features: sampleFeatures,
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
      ],
    }),
    template: `
      <div style="max-width: 960px; padding-top: 1rem;">
        <TPricing :plans="plans" />
      </div>
    `,
  }),
};
