import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TTable } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const sampleColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { name: 'Alice', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { name: 'Bob', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  { name: 'Charlie', email: 'charlie@example.com', role: 'Viewer', status: 'Inactive' },
  { name: 'Diana', email: 'diana@example.com', role: 'Editor', status: 'Active' },
  { name: 'Eve', email: 'eve@example.com', role: 'Admin', status: 'Away' },
];

const meta = {
  title: 'Components/Data Display/Table',
  component: TTable,
  parameters: {
    docs: { description: { component: practiceNote('TTable') } },
  },
  tags: ['autodocs'],
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    size: 'md',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof TTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTable },
    setup: () => ({ args }),
    template: `<TTable v-bind="args" />`,
  }),
};

export const Sortable: Story = {
  render: () => ({
    components: { TTable },
    setup: () => ({ columns: sampleColumns, rows: sampleRows }),
    template: `<TTable :columns="columns" :rows="rows" />`,
  }),
};

export const Empty: Story = {
  render: () => ({
    components: { TTable },
    setup: () => ({ columns: sampleColumns }),
    template: `<TTable :columns="columns" :rows="[]" />`,
  }),
};

export const Small: Story = {
  render: () => ({
    components: { TTable },
    setup: () => ({ columns: sampleColumns, rows: sampleRows }),
    template: `<TTable :columns="columns" :rows="rows" size="sm" />`,
  }),
};

export const CustomCells: Story = {
  render: () => ({
    components: { TBadge, TTable },
    setup: () => ({
      columns: [
        { key: 'app', label: 'App' },
        { key: 'status', label: 'Status' },
      ],
      rows: [
        { name: 'TreeUI Docs', status: 'production' },
        { name: 'Playground', status: 'development' },
      ],
    }),
    template: `
      <TTable :columns="columns" :rows="rows">
        <template #cell-app="{ row }">
          <strong>{{ row.name }}</strong>
        </template>

        <template #cell-status="{ value }">
          <TBadge
            size="sm"
            variant="soft"
            :tone="value === 'production' ? 'success' : 'warning'"
          >
            {{ value }}
          </TBadge>
        </template>
      </TTable>
    `,
  }),
};

export const NamedTable: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTable },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 1rem;">
        <TTable v-bind="args" caption="Team members and their roles" />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          <code>caption</code> renders a visible name. For an invisible one pass
          <code>aria-label</code> — attribute inheritance is off, so it lands on the
          <code>&lt;table&gt;</code> rather than the scroll wrapper.
        </div>
        <TTable v-bind="args" aria-label="Team members and their roles" />
      </div>
    `,
  }),
};

export const MutedRows: Story = {
  render: () => ({
    components: { TTable, TBadge },
    setup: () => ({
      columns: [
        { key: 'name', label: 'Resource', sortable: true },
        { key: 'status', label: 'Status' },
      ],
      rows: [
        { id: 'q1', name: 'orders-queue', status: 'active', exists: true },
        { id: 'q2', name: 'legacy-queue', status: 'deleted', exists: false },
        { id: 'q3', name: 'events-queue', status: 'active', exists: true },
      ],
      rowState: (row: Record<string, unknown>) => (row.exists ? 'default' : 'muted'),
    }),
    template: `
      <TTable :columns="columns" :rows="rows" row-key="id" :row-state="rowState" caption="Queues">
        <template #cell-status="{ row }">
          <TBadge :tone="row.exists ? 'success' : 'neutral'">{{ row.status }}</TBadge>
        </template>
      </TTable>
    `,
  }),
};

const ledger = [
  { entry: 'Mercado — compra do mês', real: 'R$ 1.284,30', credit: 'R$ 412,00' },
  { entry: 'Assinatura de streaming renovada automaticamente', real: 'R$ 39,90', credit: 'R$ 0,00' },
  { entry: 'Transferência recebida', real: 'R$ 2.000,00', credit: 'R$ 0,00' },
  { entry: 'Fatura do cartão — parcela 3 de 10', real: 'R$ 418,77', credit: 'R$ 1.254,00' },
];

const ledgerColumns = [
  { key: 'entry', label: 'Lançamento', stack: 'title' as const },
  { key: 'real', label: 'Saldo real', align: 'right' as const, minWidth: '8rem' },
  { key: 'credit', label: 'Saldo do crédito', align: 'right' as const, minWidth: '8rem' },
];

export const StackedBelowABreakpoint: Story = {
  name: 'stackBelow: one block per row on a narrow container',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Below the given container width the grid becomes one block per row: the column marked `stack="title"` is the block\'s heading, and the rest sit under it with their column label, because the header row is gone. Above it the table is unchanged. Measured on the **wrapper**, not the viewport — a table can sit in a narrow panel on a wide screen, which is the case a media query cannot see. The two frames below are 390px and 760px wide in the same page, which is the whole point: the narrow one stacks and the wide one does not. `role` is declared on the table, rows and cells, because `display: block` drops the implicit table semantics and a block would otherwise be announced as a run of unrelated text.',
      },
    },
  },
  render: () => ({
    components: { TTable },
    setup: () => ({ ledger, ledgerColumns }),
    template: `
      <div style="display: grid; gap: var(--tree-space-6);">
        <div style="inline-size: 390px; border: 1px dashed var(--tree-color-border-default); padding: var(--tree-space-2);">
          <TTable
            :columns="ledgerColumns"
            :rows="ledger"
            stack-below="sm"
            aria-label="Lançamentos, contêiner estreito"
          />
        </div>
        <div style="inline-size: 760px; border: 1px dashed var(--tree-color-border-default); padding: var(--tree-space-2);">
          <TTable
            :columns="ledgerColumns"
            :rows="ledger"
            stack-below="sm"
            aria-label="Lançamentos, contêiner largo"
          />
        </div>
      </div>
    `,
  }),
};

export const StackedWithRowLinksAndState: Story = {
  name: 'stackBelow: row links and row state survive the block',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'A block is still a row: `rowState` keeps colouring it, `rowHref` keeps making the whole block the link target, and the accessible name still comes from `rowLabel` rather than from the concatenation of every cell. The stretched link is a pseudo-element on the first cell, which covers the block because the row is the positioning context either way.',
      },
    },
  },
  render: () => ({
    components: { TTable },
    setup: () => ({
      ledger,
      ledgerColumns,
      rowHref: (row: Record<string, unknown>) => `#/lancamento/${String(row.entry).slice(0, 8)}`,
      rowLabel: (row: Record<string, unknown>) => `Abrir ${String(row.entry)}`,
      rowState: (_row: Record<string, unknown>, index: number) => (index === 1 ? 'muted' : 'default'),
    }),
    template: `
      <div style="inline-size: 390px; border: 1px dashed var(--tree-color-border-default); padding: var(--tree-space-2);">
        <TTable
          :columns="ledgerColumns"
          :rows="ledger"
          :row-href="rowHref"
          :row-label="rowLabel"
          :row-state="rowState"
          stack-below="sm"
          aria-label="Lançamentos com link por linha"
        />
      </div>
    `,
  }),
};
