import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ChartSurface from '../../blocks/ChartSurface.vue';

const meta = {
  title: 'Patterns/Recipes/Chart surface',
  component: ChartSurface,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChartSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
