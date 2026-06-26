import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ColorField from '../../blocks/ColorField.vue';

const meta = {
  title: 'Patterns/Recipes/Color field',
  component: ColorField,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ColorField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
