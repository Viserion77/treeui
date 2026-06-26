import type { Meta, StoryObj } from '@storybook/vue3-vite';
import SearchableMultiChoice from '../../blocks/SearchableMultiChoice.vue';

const meta = {
  title: 'Patterns/Recipes/Searchable multi-choice field',
  component: SearchableMultiChoice,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SearchableMultiChoice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
