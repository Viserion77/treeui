import type { Meta, StoryObj } from '@storybook/vue3-vite';
import DateRangeForm from '../../blocks/DateRangeForm.vue';

const meta = {
  title: 'Patterns/Recipes/Scheduling pair',
  component: DateRangeForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DateRangeForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
