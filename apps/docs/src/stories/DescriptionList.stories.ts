import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TDescriptionList, TDescriptionItem, TButton, TText, TIcon, TBadge } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Data Display/DescriptionList',
  component: TDescriptionList,
  parameters: {
    docs: { description: { component: practiceNote('TDescriptionList') } },
  },
  tags: ['autodocs'],
  args: { size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof TDescriptionList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TDescriptionList, TDescriptionItem, TButton, TText, TIcon, TBadge },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 32rem;">
        <TDescriptionList v-bind="args">
          <TDescriptionItem label="ARN">
            <TText family="mono" truncate>arn:aws:sqs:us-east-1:000000000000:orders</TText>
            <template #actions>
              <TButton icon-only label="Copy ARN" variant="ghost" size="sm">
                <template #icon><TIcon name="copy" /></template>
              </TButton>
            </template>
          </TDescriptionItem>
          <TDescriptionItem label="Region">us-east-1</TDescriptionItem>
          <TDescriptionItem label="Status"><TBadge tone="success">active</TBadge></TDescriptionItem>
          <TDescriptionItem label="Messages">1,284</TDescriptionItem>
        </TDescriptionList>
      </div>
    `,
  }),
};
