import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TList, TListItem, TButton, TText, TIcon } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Data Display/List',
  component: TList,
  parameters: {
    docs: { description: { component: practiceNote('TList') } },
  },
  tags: ['autodocs'],
  args: { size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof TList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TList, TListItem, TButton, TText, TIcon },
    setup: () => ({
      args,
      rows: [
        { id: 1, title: 'Deploy web-shell', when: '2h ago', icon: 'rocket' },
        { id: 2, title: 'Rotate credentials', when: 'yesterday', icon: 'key' },
        { id: 3, title: 'Review PR #482', when: '3 days ago', icon: 'git-pull-request' },
      ],
    }),
    template: `
      <div style="max-width: 34rem; border: 1px solid var(--tree-color-border-default); border-radius: var(--tree-radius-lg);">
        <TList v-bind="args">
          <TListItem v-for="row in rows" :key="row.id">
            <template #leading><TIcon :name="row.icon" /></template>
            <TText weight="medium" truncate>{{ row.title }}</TText>
            <template #meta><TText tone="muted" size="sm">{{ row.when }}</TText></template>
            <template #actions>
              <TButton icon-only label="Remove" variant="ghost" size="sm">
                <template #icon><TIcon name="x" /></template>
              </TButton>
            </template>
          </TListItem>
        </TList>
      </div>
    `,
  }),
};
