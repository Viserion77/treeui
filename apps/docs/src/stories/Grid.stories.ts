import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TCard, TGrid, TStat } from '@treeui/vue';

const meta = {
  title: 'Components/Layout/Grid',
  component: TGrid,
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
