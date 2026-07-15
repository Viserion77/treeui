import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TDonutChart } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Donut Chart',
  component: TDonutChart,
  tags: ['autodocs'],
  args: {
    size: 200,
    thickness: 26,
    gap: 2,
    rounded: false,
    showLegend: true,
    showPercent: true,
    centerLabel: 'Total',
    segments: [
      { label: 'Direct', value: 45 },
      { label: 'Referral', value: 30 },
      { label: 'Social', value: 15 },
      { label: 'Email', value: 10 },
    ],
  },
} satisfies Meta<typeof TDonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

export const Rounded: Story = {
  args: { rounded: true, thickness: 20 },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

export const Pie: Story = {
  args: { thickness: 0, showPercent: true },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

export const CustomCenter: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `
      <TDonutChart v-bind="args">
        <template #center="{ total }">
          <span style="font-size: 1.75rem; font-weight: 700;">{{ total }}%</span>
          <span style="font-size: 0.8125rem; color: var(--tree-color-text-muted);">coverage</span>
        </template>
      </TDonutChart>
    `,
  }),
};

export const Loading: Story = {
  args: { loading: true },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};
