import type { Meta, StoryObj } from '@storybook/vue3-vite';
import DataListing from '../../blocks/DataListing.vue';

const meta = {
  title: 'Patterns/Recipes/Data table with paging',
  component: DataListing,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataListing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
