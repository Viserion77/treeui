import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TStat } from '@treeui/vue';
import { CheckIcon, InfoIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Data Display/Stat',
  component: TStat,
  tags: ['autodocs'],
  args: {
    label: 'Monthly recurring revenue',
    value: '$48.2k',
    trend: '12.4%',
    meta: 'vs last month',
    tone: 'success',
    trendDirection: 'up',
    loading: false,
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'success', 'warning', 'danger', 'info'],
    },
    trendDirection: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
    },
  },
} satisfies Meta<typeof TStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckIcon, TStat },
    setup: () => ({ args, iconProps }),
    template: `
      <div style="width: 360px;">
        <TStat v-bind="args">
          <template #icon>
            <CheckIcon v-bind="iconProps" />
          </template>
        </TStat>
      </div>
    `,
  }),
};

export const DashboardGrid: Story = {
  render: () => ({
    components: { CheckIcon, InfoIcon, TStat },
    setup: () => ({ iconProps }),
    template: `
      <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        <TStat label="Active users" value="18,420" trend="8.1%" tone="success" trend-direction="up">
          <template #icon>
            <CheckIcon v-bind="iconProps" />
          </template>
        </TStat>

        <TStat label="Open incidents" value="7" trend="2 new" tone="warning" trend-direction="neutral">
          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>
        </TStat>

        <TStat label="Churn risk" value="4.2%" trend="0.8%" tone="danger" trend-direction="down" meta="target < 3%">
          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>
        </TStat>
      </div>
    `,
  }),
};

export const CustomContent: Story = {
  render: () => ({
    components: { TStat },
    template: `
      <div style="width: 360px;">
        <TStat tone="info">
          <template #label>Rollout coverage</template>
          <template #value>72%</template>
          <template #meta>beta cohort</template>
          <template #trend>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
              <span aria-hidden="true">•</span>
              <span>3 of 4 environments healthy</span>
            </span>
          </template>
        </TStat>
      </div>
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    components: { TStat },
    template: `
      <div style="width: 360px;">
        <TStat loading label="Monthly recurring revenue" />
      </div>
    `,
  }),
};

export const FigureLeads: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'On a dashboard the label leads: the reader is scanning for what is measured. On a marketing band the figure IS the argument, and `emphasis="value"` puts it first. It also keeps a row of figures on one baseline, because the labels above them no longer have to be the same height — which is what makes a band of four tiles look ragged. Visual order only: the DOM keeps label before value, so a screen reader still announces "Requests served, 4.2M".',
      },
    },
  },
  render: () => ({
    components: { TStat },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1rem;">
        <TStat emphasis="value" value="4.2M" label="Requests served" meta="last 30 days" />
        <TStat emphasis="value" value="99.98%" label="Uptime" meta="rolling quarter" />
        <TStat emphasis="value" value="120ms" label="Median response" meta="p50, all regions" />
        <TStat emphasis="value" value="24" label="Regions" meta="and counting" />
      </div>
    `,
  }),
};
