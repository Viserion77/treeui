import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PricingSection from '../../blocks/PricingSection.vue';

const meta = {
  title: 'Patterns/Recipes/Pricing comparison section',
  component: PricingSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PricingSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
