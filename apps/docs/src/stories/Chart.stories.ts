import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TChart } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Chart',
  component: TChart,
  tags: ['autodocs'],
  args: {
    type: 'line',
    height: 260,
    smooth: false,
    stacked: false,
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showPoints: false,
    animated: true,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    series: [
      { name: 'Revenue', data: [12, 19, 15, 27, 24, 31, 38] },
      { name: 'Expenses', data: [8, 11, 9, 14, 13, 17, 19] },
    ],
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['line', 'area', 'bar'],
    },
  },
} satisfies Meta<typeof TChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

export const Line: Story = {
  args: { type: 'line', smooth: true, showPoints: true },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

export const Area: Story = {
  args: { type: 'area', smooth: true },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

export const Bar: Story = {
  args: { type: 'bar' },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

export const StackedBar: Story = {
  args: { type: 'bar', stacked: true },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

export const SingleSeries: Story = {
  args: {
    series: [{ name: 'Active users', data: [320, 480, 401, 590, 690, 810, 1020] }],
    type: 'area',
    smooth: true,
    valueFormat: (value: number) => value.toLocaleString('en-US'),
  },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

export const Loading: Story = {
  args: { loading: true },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

export const Empty: Story = {
  args: { series: [] },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};
