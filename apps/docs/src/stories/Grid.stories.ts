import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TCard, TGrid, TStat } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/Grid',
  component: TGrid,
  parameters: {
    docs: { description: { component: practiceNote('TGrid') } },
  },
  tags: ['autodocs'],
  args: {
    columns: undefined,
    minItemWidth: '16rem',
    gap: 'var(--tree-space-4)',
    dense: false,
  },
} satisfies Meta<typeof TGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TCard, TGrid, TStat },
    setup: () => ({ args }),
    template: `
      <TGrid v-bind="args">
        <TStat label="MRR" value="$48.2k" trend="12%" tone="success" trend-direction="up" />
        <TStat label="Activation" value="68%" trend="4.1%" tone="info" trend-direction="up" />
        <TStat label="Open incidents" value="7" trend="2 urgent" tone="warning" trend-direction="neutral" />
        <TCard>
          <template #header>Notes</template>
          <p style="margin: 0;">TGrid works for stat groups, forms and card collections without introducing a page framework.</p>
        </TCard>
      </TGrid>
    `,
  }),
};

export const FixedColumns: Story = {
  render: () => ({
    components: { TCard, TGrid },
    template: `
      <TGrid :columns="3" gap="var(--tree-space-3)">
        <TCard><strong>Overview</strong></TCard>
        <TCard><strong>Goals</strong></TCard>
        <TCard><strong>Timeline</strong></TCard>
      </TGrid>
    `,
  }),
};

export const FormLayout: Story = {
  render: () => ({
    components: { TGrid },
    template: `
      <TGrid min-item-width="14rem" gap="var(--tree-space-3)">
        <label style="display: grid; gap: 0.35rem;">
          <span>Name</span>
          <input style="min-height: 2.75rem; border-radius: 0.75rem; border: 1px solid var(--tree-color-border-default); padding-inline: 0.75rem;" />
        </label>
        <label style="display: grid; gap: 0.35rem;">
          <span>Email</span>
          <input style="min-height: 2.75rem; border-radius: 0.75rem; border: 1px solid var(--tree-color-border-default); padding-inline: 0.75rem;" />
        </label>
        <label style="display: grid; gap: 0.35rem;">
          <span>Company</span>
          <input style="min-height: 2.75rem; border-radius: 0.75rem; border: 1px solid var(--tree-color-border-default); padding-inline: 0.75rem;" />
        </label>
      </TGrid>
    `,
  }),
};

export const BalancedLastRow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Five cards over four tracks leave three holes on the right, and a hole reads as a card that failed to load. `auto-fit` cannot help: it collapses a track only when that track is empty on every row. With `balance` the layout lays out as flex lines, and a line divides itself among the items it actually has — full rows are identical to the grid, only the remainder is shared out. The alternative it replaces is calibrating `min-item-width` until the track count divides the item count, which ties the copy to the geometry.',
      },
    },
  },
  render: () => ({
    components: { TGrid, TCard },
    setup: () => ({ items: ['Ingest', 'Normalise', 'Enrich', 'Score', 'Route'] }),
    template: `
      <TGrid balance min-item-width="14rem">
        <TCard v-for="item in items" :key="item" variant="outline">{{ item }}</TCard>
      </TGrid>
    `,
  }),
};
