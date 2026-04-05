import type { Meta, StoryObj } from '@storybook/vue3';
import { TBreadcrumb, TBreadcrumbItem } from '@treeui/vue';

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: TBreadcrumb,
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
        <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
        <TBreadcrumbItem href="/products">Products</TBreadcrumbItem>
        <TBreadcrumbItem href="/products/components">Components</TBreadcrumbItem>
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
