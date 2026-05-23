import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TIcon } from '@treeui/vue';

const iconNames = [
  'alert-circle',
  'calendar',
  'check',
  'chevron-left',
  'chevron-down',
  'chevron-right',
  'info',
  'loader-circle',
  'search',
  'x',
] as const;

const meta = {
  title: 'Components/Data Display/Icon',
  component: TIcon,
  tags: ['autodocs'],
  args: {
    name: 'info',
    size: 24,
  },
  argTypes: {
    name: {
      control: 'select',
      options: iconNames,
    },
    size: { control: { type: 'number', min: 12, max: 64, step: 2 } },
    strokeWidth: { control: { type: 'number', min: 1, max: 4, step: 0.5 } },
    label: { control: 'text' },
  },
} satisfies Meta<typeof TIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => ({
    components: { TIcon },
    setup: () => ({ iconNames }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 1rem;">
        <div
          v-for="name in iconNames"
          :key="name"
          style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--tree-color-border-default); border-radius: var(--tree-radius-md);"
        >
          <TIcon :name="name" :size="28" />
          <small style="font-size: 0.75rem; color: var(--tree-color-text-secondary);">{{ name }}</small>
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TIcon },
    template: `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <TIcon name="check" :size="16" />
        <TIcon name="check" :size="24" />
        <TIcon name="check" :size="32" />
        <TIcon name="check" :size="48" />
      </div>
    `,
  }),
};

export const WithAccessibleLabel: Story = {
  args: {
    name: 'alert-circle',
    label: 'Warning',
    size: 32,
  },
};
