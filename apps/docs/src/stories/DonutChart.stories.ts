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

/** `size` sets the square canvas; scale `thickness` with it. `showLegend: false` drops the legend and the chart stands alone. */
export const Sizes: Story = {
  args: { showLegend: false, ariaLabel: 'Traffic sources by share of sessions' },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
        <TDonutChart v-bind="args" :size="120" :thickness="16" />
        <TDonutChart v-bind="args" :size="160" :thickness="22" />
        <TDonutChart v-bind="args" :size="220" :thickness="32" />
      </div>
    `,
  }),
};

/** `showPercent: false` keeps the legend but leaves out each slice's share. */
export const LegendWithoutPercent: Story = {
  args: { showPercent: false },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

/** A segment can override its palette slot with `color`; the legend swatch follows it. */
export const SegmentColors: Story = {
  args: {
    segments: [
      { label: 'Direct', value: 45, color: 'var(--tree-color-chart-5)' },
      { label: 'Referral', value: 30, color: 'var(--tree-color-chart-6)' },
      { label: 'Social', value: 15, color: 'var(--tree-color-chart-7)' },
      { label: 'Email', value: 10, color: 'var(--tree-color-chart-8)' },
    ],
    ariaLabel: 'Traffic sources by share of sessions',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

/** Non-positive values are dropped, so this renders as one slice: it fills the ring and the gap collapses. */
export const SingleSegment: Story = {
  args: {
    segments: [
      { label: 'Direct', value: 45 },
      { label: 'Referral', value: 0 },
    ],
    centerLabel: 'Single source',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

/** `valueFormat` drives both the legend values and the center readout. Without it, values at or above 1000 fall back to `toLocaleString`. */
export const CurrencyFormat: Story = {
  args: {
    segments: [
      { label: 'Subscriptions', value: 48200 },
      { label: 'Services', value: 21600 },
      { label: 'One-off', value: 12400 },
    ],
    centerLabel: 'Revenue',
    valueFormat: (value: number) => `$${(value / 1000).toFixed(1)}k`,
    ariaLabel: 'Revenue by product line this quarter',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

/**
 * `centerValue` replaces the auto total and `centerLabel` sits under it. Hovering a slice still wins:
 * it swaps in that slice's value and label. With no `valueFormat`, legend values at or above 1000 fall
 * back to `toLocaleString`.
 */
export const StaticCenterValue: Story = {
  args: {
    segments: [
      { label: 'Direct', value: 5520 },
      { label: 'Referral', value: 3680 },
      { label: 'Social', value: 1840 },
      { label: 'Email', value: 1360 },
    ],
    centerValue: '12.4k',
    centerLabel: 'Sessions',
    ariaLabel: 'Traffic sources by share of sessions',
  },
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

/** The `center` slot also receives `active` — the hovered segment, or `null`. Hover a slice or a legend row. */
export const HoverReadout: Story = {
  args: { ariaLabel: 'Traffic sources by share of sessions' },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `
      <TDonutChart v-bind="args">
        <template #center="{ total, active }">
          <span style="font-size: var(--tree-font-size-xl); font-weight: var(--tree-font-weight-semibold);">
            {{ active ? active.value + '%' : total }}
          </span>
          <span style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
            {{ active ? active.label : 'All sources' }}
          </span>
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

/** With no positive values the chart drops to the empty state and the legend is suppressed. */
export const Empty: Story = {
  args: { segments: [] },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `<TDonutChart v-bind="args" />`,
  }),
};

/** The `empty` slot replaces the default "No data" fallback. */
export const CustomEmpty: Story = {
  args: { segments: [] },
  render: (args: Record<string, unknown>) => ({
    components: { TDonutChart },
    setup: () => ({ args }),
    template: `
      <TDonutChart v-bind="args">
        <template #empty>
          <span style="text-align: center; font-size: var(--tree-font-size-sm);">
            No sessions yet.<br />
            Traffic shows up here once tracking is live.
          </span>
        </template>
      </TDonutChart>
    `,
  }),
};
