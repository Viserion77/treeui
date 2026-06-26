import type { Meta, StoryObj } from '@storybook/vue3-vite';
import RouterBackedTabs from '../../blocks/RouterBackedTabs.vue';

const meta = {
  title: 'Patterns/Recipes/Router-backed tabs',
  component: RouterBackedTabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RouterBackedTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
