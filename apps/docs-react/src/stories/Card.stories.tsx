import type { Meta, StoryObj } from '@storybook/react-vite';
import { TBadge, TButton, TCard } from '@treeui/react';
import type { TCardVariant } from '@treeui/react';

const meta = {
  title: 'Components/Card',
  component: TCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      // `satisfies` ties the control to the contract, so a retired variant
      // left behind here fails typecheck instead of shipping to autodocs.
      options: ['outline', 'soft', 'inset'] satisfies TCardVariant[],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof TCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    style: { width: 280 },
    children: 'A card is the smallest surface for grouping related content.',
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    style: { width: 300 },
    header: <strong>Invite teammate</strong>,
    children: 'Send an invite and we will email a setup link.',
    footer: (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <TButton variant="ghost" size="sm">
          Cancel
        </TButton>
        <TButton variant="solid" size="sm">
          Send <TBadge tone="success">new</TBadge>
        </TButton>
      </div>
    ),
  },
};
