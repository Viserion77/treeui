import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TMenu, TMenuGroup, TMenuItem, TButton, TIcon, TText } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Overlay/Menu',
  component: TMenu,
  parameters: {
    docs: { description: { component: practiceNote('TMenu') } },
  },
  tags: ['autodocs'],
  args: { side: 'bottom', align: 'start', size: 'sm' },
} satisfies Meta<typeof TMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UserMenu: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TMenu, TMenuGroup, TMenuItem, TButton, TIcon, TText },
    setup: () => {
      const current = ref('acme');
      const spaces = [
        { id: 'acme', name: 'Acme Corp' },
        { id: 's7', name: 'S7 Tasks' },
      ];
      return { args, current, spaces };
    },
    template: `
      <TMenu v-bind="args" label="User menu">
        <template #trigger><TButton variant="outline">Account</TButton></template>
        <template #header>
          <TText weight="semibold">Jef</TText>
          <TText tone="muted" size="sm">jef@s7.dev</TText>
        </template>
        <TMenuGroup label="Workspace">
          <TMenuItem
            v-for="ws in spaces"
            :key="ws.id"
            :label="ws.name"
            :checked="ws.id === current"
            @select="current = ws.id"
          />
        </TMenuGroup>
        <TMenuGroup>
          <TMenuItem label="Settings" description="Preferences and members" to="#settings">
            <template #leading><TIcon name="settings" /></template>
          </TMenuItem>
          <TMenuItem label="Sign out" danger meta="⌘Q" @select="() => {}">
            <template #leading><TIcon name="log-out" /></template>
          </TMenuItem>
        </TMenuGroup>
      </TMenu>
    `,
  }),
};
