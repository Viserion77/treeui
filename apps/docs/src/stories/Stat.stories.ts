import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TCard, TStat, TStatGroup, TText } from '@treeui/vue';
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
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
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

export const CompactTwoPerRow: Story = {
  name: 'size="sm": two stats share a row on a phone',
  parameters: {
    docs: {
      description: {
        story:
          "The value's floor was 1.5rem at every size, so a formatted negative currency could not fit two-per-row at 390px and a grid of six indicators collapsed into one tall column. `size=\"sm\"` lowers the floor to 1.125rem and tightens the padding. The value still scales to its own card through the container query — not to the viewport — so each tile keeps sizing itself. The frame below is 390px wide.",
      },
    },
  },
  render: () => ({
    components: { TStat },
    setup: () => ({
      rows: [
        { label: 'Saldo', value: '−R$ 12.345,67', tone: 'danger' },
        { label: 'Receitas', value: 'R$ 48.900,00', tone: 'success' },
        { label: 'Despesas', value: '−R$ 36.554,33', tone: 'warning' },
        { label: 'Investido', value: 'R$ 120.000,00', tone: 'info' },
      ],
    }),
    template: `
      <div style="inline-size: 390px; border: 1px dashed var(--tree-color-border-default); padding: var(--tree-space-3);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--tree-space-3);">
          <TStat
            v-for="r in rows"
            :key="r.label"
            size="sm"
            :label="r.label"
            :value="r.value"
            :tone="r.tone"
          />
        </div>
      </div>
    `,
  }),
};

export const BandInsideACard: Story = {
  name: 'TStatGroup: a band of indicators sharing one surface',
  parameters: {
    // The band is about how it reflows, which a centred canvas cannot show:
    // `centered` shrinks `#storybook-root` to the content and the grid
    // collapses to one track regardless of the viewport.
    layout: 'padded',
    docs: {
      description: {
        story:
          'A stat has always drawn its own card, and inside a `TCard` that is a card within a card — doubled frame, summed padding, and eight of them read as eight objects rather than one row of figures. `TStatGroup` owns the surface and the hairline between cells; children inside it default to `variant="plain"`, so there is nothing to set on each one and nothing to forget on the ninth. The lines are drawn on each cell with pseudo-elements and the track is pulled back by a pixel, so the outer ones are clipped: a cell that reflows onto a new row keeps its top line and becomes the first of its row, with no line left hanging on the outside and none doubled between neighbours. `balance` is available but off by default here — a stat\'s value scales to its own cell, so a lone cell stretched across the last row prints a number visibly larger than its siblings, and size on a dashboard reads as importance. Pick a track count that divides the figures instead.',
      },
    },
  },
  render: () => ({
    components: { TCard, TStat, TStatGroup, TText },
    setup: () => ({
      kpis: [
        { label: 'Receita', value: 'R$ 48.900', trend: '12%', dir: 'up', tone: 'success' },
        { label: 'Despesas', value: 'R$ 36.554', trend: '4%', dir: 'down', tone: 'warning' },
        { label: 'Saldo', value: 'R$ 12.346', trend: '8%', dir: 'up', tone: 'brand' },
        { label: 'Investido', value: 'R$ 120.000', trend: '2%', dir: 'up', tone: 'info' },
        { label: 'Assinaturas', value: '1.284', trend: '19%', dir: 'up', tone: 'success' },
        { label: 'Cancelamentos', value: '37', trend: '5%', dir: 'down', tone: 'danger' },
        { label: 'Ticket médio', value: 'R$ 38,10', trend: '1%', dir: 'up', tone: 'neutral' },
        { label: 'Inadimplência', value: '2,4%', trend: '3%', dir: 'down', tone: 'warning' },
      ],
    }),
    template: `
      <TCard>
        <TText as="h2" size="lg" weight="semibold">Visão geral</TText>
        <TStatGroup label="Indicadores do mês" min-item-width="11rem">
          <TStat
            v-for="k in kpis"
            :key="k.label"
            size="sm"
            :label="k.label"
            :value="k.value"
            :trend="k.trend"
            :trend-direction="k.dir"
            :tone="k.tone"
          />
        </TStatGroup>
      </TCard>
    `,
  }),
};

export const MetaBelowTheValue: Story = {
  name: 'metaPlacement="bottom": label, figure, note',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'On the label\'s line a long note does not fit, wraps onto a line of its own ABOVE the value, and that one tile grows — the grid then stretches the whole row, so every sibling shows an empty band between its label and its value. `metaPlacement="bottom"` puts the note under the figure, which is the reading order of an indicator with a footnote and keeps the row one height. The DOM follows the visual order, so a screen reader announces label, value, note. Different from `emphasis="value"`, which promotes the figure and takes the label down with it.',
      },
    },
  },
  render: () => ({
    components: { TStat },
    setup: () => ({
      rows: [
        { label: 'Fatura fechada', value: 'R$ 400,00', meta: 'paga em 02/10' },
        { label: 'Saldo projetado', value: 'R$ 1.280,00', meta: 'na virada, após fatura e programado' },
        { label: 'Gasto a mais no mês', value: 'R$ 212,40', meta: 'outubro de 2026 · 3 compras' },
        { label: 'Reservado', value: 'R$ 900,00', meta: 'meta anual' },
      ],
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--tree-space-3);">
        <TStat
          v-for="r in rows"
          :key="r.label"
          meta-placement="bottom"
          :label="r.label"
          :value="r.value"
          :meta="r.meta"
        />
      </div>
    `,
  }),
};
