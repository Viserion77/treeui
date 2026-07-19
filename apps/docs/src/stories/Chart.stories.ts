import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TChart } from '@treeui/vue';
import type { TChartActivePayload } from '@treeui/vue';

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

/** Chrome stripped down to the marks: no grid, axes, legend, tooltip, or entry animation. */
export const Minimal: Story = {
  args: {
    smooth: true,
    height: 120,
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    showTooltip: false,
    showLegend: false,
    animated: false,
    ariaLabel: 'Revenue and expenses trend, January to July',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

/** `minY` / `maxY` pin the domain and `yTicks` sets the tick density, instead of auto-scaling to the data. */
export const FixedScale: Story = {
  args: {
    showPoints: true,
    minY: 0,
    maxY: 50,
    yTicks: 6,
    ariaLabel: 'Revenue and expenses on a fixed 0 to 50 scale',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

/** A series can override its palette slot with `color`; the legend swatch follows it. */
export const SeriesColors: Story = {
  args: {
    type: 'bar',
    series: [
      { name: 'Revenue', data: [12, 19, 15, 27, 24, 31, 38], color: 'var(--tree-color-chart-5)' },
      { name: 'Expenses', data: [8, 11, 9, 14, 13, 17, 19], color: 'var(--tree-color-chart-8)' },
    ],
    ariaLabel: 'Revenue and expenses by month',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

/** `valueFormat` drives both the y-axis ticks and the tooltip. `showLegend` forces the legend on for a single series. */
export const CurrencyFormat: Story = {
  args: {
    type: 'area',
    smooth: true,
    showLegend: true,
    series: [{ name: 'MRR', data: [12400, 15200, 14100, 18900, 21500, 24800, 29300] }],
    valueFormat: (value: number) => `$${(value / 1000).toFixed(1)}k`,
    ariaLabel: 'Monthly recurring revenue in US dollars, January to July',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `<div style="max-width: 640px;"><TChart v-bind="args" /></div>`,
  }),
};

/** Grouped bars render negative values below the baseline; stacked mode clamps them to 0. */
export const NegativeValues: Story = {
  args: {
    type: 'bar',
    height: 200,
    series: [
      { name: 'Net cash flow', data: [12, -8, 15, -4, 22, 9, -3] },
      { name: 'Forecast', data: [10, -5, 12, -2, 18, 11, -1] },
    ],
  },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 640px; display: grid; gap: 1.5rem;">
        <div>
          <p style="margin: 0 0 0.5rem; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            Grouped — negatives render below the baseline.
          </p>
          <TChart
            v-bind="args"
            :stacked="false"
            aria-label="Net cash flow and forecast by month, grouped bars"
          />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            Stacked — negatives are clamped to 0.
          </p>
          <TChart
            v-bind="args"
            :stacked="true"
            aria-label="Net cash flow and forecast by month, stacked bars"
          />
        </div>
      </div>
    `,
  }),
};

/** The `legend` slot receives the resolved `series` array with each item's name and color. */
export const CustomLegend: Story = {
  args: { ariaLabel: 'Revenue and expenses by month' },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 640px;">
        <TChart v-bind="args">
          <template #legend="{ series }">
            <span
              v-for="item in series"
              :key="item.name"
              style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);"
            >
              <span
                :style="{ width: '1.5rem', height: '0.25rem', borderRadius: '999px', background: item.color }"
                aria-hidden="true"
              />
              {{ item.name }}
            </span>
          </template>
        </TChart>
      </div>
    `,
  }),
};

/** The `tooltip` slot receives the active `index`, `label`, and `values`. Hover the plot to see it. */
export const CustomTooltip: Story = {
  args: { type: 'bar', ariaLabel: 'Revenue and expenses by month' },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 640px;">
        <TChart v-bind="args">
          <template #tooltip="{ label, values }">
            <p style="margin: 0 0 0.25rem; font-size: var(--tree-font-size-sm); font-weight: var(--tree-font-weight-semibold);">
              {{ label }}
            </p>
            <p
              v-for="item in values"
              :key="item.name"
              style="margin: 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);"
            >
              {{ item.name }} — <strong :style="{ color: item.color }">{{ item.value }}k</strong>
            </p>
          </template>
        </TChart>
      </div>
    `,
  }),
};

/** The `empty` slot replaces the default "No data to display" fallback. */
export const CustomEmpty: Story = {
  args: { series: [], ariaLabel: 'Revenue and expenses by month' },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 640px;">
        <TChart v-bind="args">
          <template #empty>
            <span style="text-align: center;">
              No results for this period.<br />
              Try widening the date range.
            </span>
          </template>
        </TChart>
      </div>
    `,
  }),
};

/** `point-click` emits the hovered category: its index, label, and every series value. */
export const PointClick: Story = {
  args: { type: 'bar', ariaLabel: 'Revenue and expenses by month' },
  render: (args: Record<string, unknown>) => ({
    components: { TChart },
    setup: () => {
      const lastPoint = ref('Click a category to read its values.');
      const onPointClick = (payload: TChartActivePayload) => {
        const values = payload.values.map((item) => `${item.name} ${item.value}`).join(' · ');
        lastPoint.value = `#${payload.index} ${payload.label} — ${values}`;
      };
      return { args, lastPoint, onPointClick };
    },
    template: `
      <div style="max-width: 640px; display: grid; gap: 0.75rem;">
        <TChart
          v-bind="args"
          @point-click="onPointClick"
        />
        <p style="margin: 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          {{ lastPoint }}
        </p>
      </div>
    `,
  }),
};
