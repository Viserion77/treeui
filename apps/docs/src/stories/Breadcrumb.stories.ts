import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBreadcrumb, TBreadcrumbItem, TPageHeader } from '@treeui/vue';

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: TBreadcrumb,
  subcomponents: { TBreadcrumbItem },
  tags: ['autodocs'],
  args: {
    separator: '/',
  },
} satisfies Meta<typeof TBreadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TBreadcrumb, TBreadcrumbItem },
    setup: () => ({ args }),
    template: `
      <TBreadcrumb v-bind="args">
        <TBreadcrumbItem to="/">Home</TBreadcrumbItem>
        <TBreadcrumbItem to="/products">Products</TBreadcrumbItem>
        <TBreadcrumbItem to="/products/components">Components</TBreadcrumbItem>
        <TBreadcrumbItem>Breadcrumb</TBreadcrumbItem>
      </TBreadcrumb>
    `,
  }),
};

export const CustomSeparator: Story = {
  render: () => ({
    components: { TBreadcrumb, TBreadcrumbItem },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <TBreadcrumb separator="›">
          <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
          <TBreadcrumbItem href="/docs">Docs</TBreadcrumbItem>
          <TBreadcrumbItem>Getting Started</TBreadcrumbItem>
        </TBreadcrumb>

        <TBreadcrumb separator="→">
          <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
          <TBreadcrumbItem href="/settings">Settings</TBreadcrumbItem>
          <TBreadcrumbItem>Profile</TBreadcrumbItem>
        </TBreadcrumb>

        <TBreadcrumb separator="|">
          <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
          <TBreadcrumbItem href="/blog">Blog</TBreadcrumbItem>
          <TBreadcrumbItem>Latest Post</TBreadcrumbItem>
        </TBreadcrumb>
      </div>
    `,
  }),
};

export const TwoItems: Story = {
  render: () => ({
    components: { TBreadcrumb, TBreadcrumbItem },
    template: `
      <TBreadcrumb>
        <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
        <TBreadcrumbItem>Dashboard</TBreadcrumbItem>
      </TBreadcrumb>
    `,
  }),
};

export const CurrentItem: Story = {
  render: () => ({
    components: { TBreadcrumb, TBreadcrumbItem },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--tree-space-6);">
        <div style="display: flex; flex-direction: column; gap: var(--tree-space-2);">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            Implicit — an item with no href and no to is rendered as the current page.
          </span>
          <TBreadcrumb>
            <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
            <TBreadcrumbItem href="/reports">Reports</TBreadcrumbItem>
            <TBreadcrumbItem>Quarterly</TBreadcrumbItem>
          </TBreadcrumb>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--tree-space-2);">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            Explicit — current forces the current-page state even when a link target is set.
          </span>
          <TBreadcrumb>
            <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
            <TBreadcrumbItem href="/reports">Reports</TBreadcrumbItem>
            <TBreadcrumbItem href="/reports/quarterly" current>Quarterly</TBreadcrumbItem>
          </TBreadcrumb>
        </div>
      </div>
    `,
  }),
};

export const ManyItems: Story = {
  render: () => ({
    components: { TBreadcrumb, TBreadcrumbItem },
    template: `
      <TBreadcrumb>
        <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
        <TBreadcrumbItem href="/org">Organization</TBreadcrumbItem>
        <TBreadcrumbItem href="/org/team">Team</TBreadcrumbItem>
        <TBreadcrumbItem href="/org/team/projects">Projects</TBreadcrumbItem>
        <TBreadcrumbItem href="/org/team/projects/treeui">TreeUI</TBreadcrumbItem>
        <TBreadcrumbItem>Settings</TBreadcrumbItem>
      </TBreadcrumb>
    `,
  }),
};

export const InPageHeader: Story = {
  render: () => ({
    components: { TBreadcrumb, TBreadcrumbItem, TPageHeader },
    template: `
      <TPageHeader title="Billing" subtitle="Manage plans, invoices and payment methods.">
        <template #breadcrumb>
          <TBreadcrumb separator="›">
            <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
            <TBreadcrumbItem href="/settings">Settings</TBreadcrumbItem>
            <TBreadcrumbItem current>Billing</TBreadcrumbItem>
          </TBreadcrumb>
        </template>
      </TPageHeader>
    `,
  }),
};
