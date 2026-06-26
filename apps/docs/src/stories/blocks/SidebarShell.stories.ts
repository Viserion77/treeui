import type { Meta, StoryObj } from '@storybook/vue3-vite';
import SidebarShell from '../../blocks/SidebarShell.vue';

const meta = {
  title: 'Patterns/Recipes/Sidebar application shell',
  component: SidebarShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SidebarShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
