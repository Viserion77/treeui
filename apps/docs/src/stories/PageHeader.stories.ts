import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TPageHeader } from '@treeui/vue';

const meta = {
  title: 'Components/Layout/PageHeader',
  component: TPageHeader,
  tags: ['autodocs'],
  args: {
    title: 'Tasks',
    subtitle: 'Everything your team is working on this cycle.',
    level: 1,
    as: 'header',
  },
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
  },
} satisfies Meta<typeof TPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TPageHeader },
    setup: () => ({ args }),
    template: `
      <TPageHeader v-bind="args">
        <template #actions>
          <TButton variant="outline" size="sm">Export</TButton>
          <TButton variant="brand" size="sm">New task</TButton>
        </template>
      </TPageHeader>
    `,
  }),
};

export const WithBreadcrumb: Story = {
  render: () => ({
    components: { TBadge, TButton, TPageHeader },
    template: `
      <TPageHeader title="Billing" subtitle="Manage plans, invoices and payment methods.">
        <template #breadcrumb>
          <span style="font-size: 0.8125rem; color: var(--tree-color-text-muted);">Settings / Billing</span>
        </template>
        <template #title>
          Billing <TBadge tone="info">Pro</TBadge>
        </template>
        <template #actions>
          <TButton variant="brand" size="sm">Upgrade</TButton>
        </template>
      </TPageHeader>
    `,
  }),
};

export const TitleOnly: Story = {
  args: {
    subtitle: '',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TPageHeader },
    setup: () => ({ args }),
    template: `<TPageHeader v-bind="args" />`,
  }),
};
