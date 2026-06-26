import type { Meta, StoryObj } from '@storybook/vue3-vite';
import FormFieldInput from '../../blocks/FormFieldInput.vue';

const meta = {
  title: 'Patterns/Recipes/Field with text input',
  component: FormFieldInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FormFieldInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
