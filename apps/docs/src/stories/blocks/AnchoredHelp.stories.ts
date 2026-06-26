import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AnchoredHelp from '../../blocks/AnchoredHelp.vue';

const meta = {
  title: 'Patterns/Recipes/Anchored help affordance',
  component: AnchoredHelp,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AnchoredHelp>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
