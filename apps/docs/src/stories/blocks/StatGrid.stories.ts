import type { Meta, StoryObj } from '@storybook/vue3-vite';
import StatGrid from '../../blocks/StatGrid.vue';

const meta = {
  title: 'Patterns/Recipes/Dashboard metric grid',
  component: StatGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof StatGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
