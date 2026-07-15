import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TSparkline, TStat } from '@treeui/vue';

const sample = [12, 18, 9, 22, 30, 24, 28, 26, 33, 38];

const meta = {
  title: 'Components/Data Display/Sparkline',
  component: TSparkline,
  tags: ['autodocs'],
  args: {
    data: sample,
    type: 'line',
    width: 120,
    height: 32,
    smooth: false,
    strokeWidth: 2,
    showLastPoint: false,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['line', 'area', 'bar'],
    },
    color: { control: 'color' },
  },
} satisfies Meta<typeof TSparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSparkline },
    setup: () => ({ args }),
    template: `<TSparkline v-bind="args" />`,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TSparkline },
    setup: () => ({ sample }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <TSparkline :data="sample" type="line" show-last-point />
        <TSparkline :data="sample" type="line" smooth show-last-point />
        <TSparkline :data="sample" type="area" smooth />
        <TSparkline :data="sample" type="bar" color="var(--tree-color-chart-2)" />
      </div>
    `,
  }),
};

export const InlineWithStat: Story = {
  name: 'Inline with TStat',
  render: () => ({
    components: { TSparkline, TStat },
    setup: () => ({ sample }),
    template: `
      <div style="width: 320px;">
        <TStat label="Weekly signups" value="1,284" trend="12.4%" tone="success" trend-direction="up">
          <template #meta>
            <TSparkline :data="sample" type="area" smooth :width="96" :height="24" color="var(--tree-color-status-success)" />
          </template>
        </TStat>
      </div>
    `,
  }),
};

export const InlineText: Story = {
  render: () => ({
    components: { TSparkline },
    setup: () => ({ sample }),
    template: `
      <p style="font-size: 0.9375rem; color: var(--tree-color-text-primary);">
        API latency is trending down
        <TSparkline :data="[38, 33, 26, 28, 24, 30, 22, 18, 20, 14]" :width="72" :height="18" color="var(--tree-color-chart-6)" />
        over the last 10 days.
      </p>
    `,
  }),
};
