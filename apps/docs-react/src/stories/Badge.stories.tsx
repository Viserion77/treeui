import type { Meta, StoryObj } from '@storybook/react-vite';
import { TBadge } from '@treeui/react';

const meta = {
  title: 'Components/Badge',
  component: TBadge,
  tags: ['autodocs'],
  args: { children: 'Badge' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'soft', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['neutral', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof TBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Soft: Story = { args: { variant: 'soft' } };

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {(['neutral', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
        <TBadge key={tone} {...args} tone={tone}>
          {tone}
        </TBadge>
      ))}
    </div>
  ),
};
