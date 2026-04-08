import type { Meta, StoryObj } from '@storybook/vue3';
import { TAppBar, TBadge, TButton, TNavbar } from '@treeui/vue';

const meta = {
  title: 'Components/Layout/Navbar',
  component: TNavbar,
  tags: ['autodocs'],
  args: {
    size: 'md',
    sticky: false,
    bordered: true,
    elevated: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TBadge, TButton, TNavbar },
    setup: () => ({ args }),
    template: `
      <TNavbar v-bind="args">
        <template #start>
          <strong>TreeUI</strong>
        </template>
        <template #center>
          <span style="color: var(--tree-color-text-muted);">Workspace shell</span>
        </template>
        <template #end>
          <TBadge size="sm">beta</TBadge>
          <TButton size="sm" variant="outline">Invite</TButton>
        </template>
      </TNavbar>
    `,
  }),
};

export const AppBarAlias: Story = {
  render: () => ({
    components: { TAppBar, TButton },
    template: `
      <TAppBar elevated>
        <template #start>
          <strong>Release center</strong>
        </template>
        <template #end>
          <TButton size="sm">Ship</TButton>
        </template>
      </TAppBar>
    `,
  }),
};

export const Sticky: Story = {
  render: () => ({
    components: { TNavbar },
    template: `
      <div style="height: 260px; overflow: auto; border: 1px solid var(--tree-color-border-default); border-radius: 1rem;">
        <TNavbar sticky>
          <template #start><strong>Sticky navbar</strong></template>
          <template #end><span style="color: var(--tree-color-text-muted);">Scroll me</span></template>
        </TNavbar>
        <div style="display: grid; gap: 0.75rem; padding: 1rem;">
          <div v-for="n in 12" :key="n" style="padding: 0.9rem 1rem; border-radius: 0.75rem; background: var(--tree-color-bg-subtle);">
            Content block {{ n }}
          </div>
        </div>
      </div>
    `,
  }),
};
