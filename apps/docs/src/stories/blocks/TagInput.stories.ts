import type { Meta, StoryObj } from '@storybook/vue3-vite';
import TagInput from '../../blocks/TagInput.vue';

const meta = {
  title: 'Patterns/Recipes/Tag input field',
  component: TagInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TagInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
