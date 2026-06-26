import type { Meta, StoryObj } from '@storybook/vue3-vite';
import HierarchyPicker from '../../blocks/HierarchyPicker.vue';

const meta = {
  title: 'Patterns/Recipes/Hierarchical selection',
  component: HierarchyPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof HierarchyPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
