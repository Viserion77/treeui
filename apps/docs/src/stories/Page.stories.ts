import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TButton, TCard, TPage, TPageHeader } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/Page',
  component: TPage,
  parameters: {
    docs: { description: { component: practiceNote('TPage') } },
  },
  tags: ['autodocs'],
  args: {
    as: 'div',
    width: 'lg',
    padded: true,
    gap: 'lg',
  },
  argTypes: {
    width: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, TCard, TPage, TPageHeader },
    setup: () => ({ args }),
    template: `
      <div style="background: var(--tree-color-bg-primary);">
        <TPage v-bind="args">
          <TPageHeader title="Overview" subtitle="A consistent page shell under the app shell.">
            <template #actions>
              <TButton variant="brand" size="sm">New report</TButton>
            </template>
          </TPageHeader>

          <TCard>
            <p style="margin: 0;">Content sections inherit the page's max-width and vertical rhythm.</p>
          </TCard>

          <TCard>
            <p style="margin: 0;">Swap <code>width</code> and <code>gap</code> to retune the column without touching each screen.</p>
          </TCard>
        </TPage>
      </div>
    `,
  }),
};
