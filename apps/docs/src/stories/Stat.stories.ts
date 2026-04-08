import type { Meta, StoryObj } from '@storybook/vue3';
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
