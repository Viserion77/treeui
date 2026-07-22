import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBrandLockup } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Navigation/BrandLockup',
  component: TBrandLockup,
  parameters: {
    docs: { description: { component: practiceNote('TBrandLockup') } },
  },
  tags: ['autodocs'],
  args: {
    title: 'Orchard',
    subtitle: 'Tasks',
    size: 'md',
    collapsed: false,
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof TBrandLockup>;

export default meta;

type Story = StoryObj<typeof meta>;

// A non-square placeholder wordmark (~1.5:1), the case TAvatar would crop.
const LOGO = `<svg viewBox="0 0 48 32" role="img" aria-label="Orchard" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="32" rx="6" fill="var(--tree-color-brand-primary)"/>
  <text x="24" y="21" font-size="14" fill="white" text-anchor="middle" font-family="sans-serif">OR</text>
</svg>`;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TBrandLockup },
    setup: () => ({ args, LOGO }),
    template: `
      <TBrandLockup v-bind="args">
        <template #logo><span v-html="LOGO" style="display:inline-flex;height:100%"></span></template>
      </TBrandLockup>
    `,
  }),
};

export const Collapsed: Story = {
  args: { collapsed: true },
  render: Playground.render,
};

export const AsHomeLink: Story = {
  args: { href: '#home' },
  render: Playground.render,
};
