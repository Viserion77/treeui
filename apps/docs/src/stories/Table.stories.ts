import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TTable } from '@treeui/vue';

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
