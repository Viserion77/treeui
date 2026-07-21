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
