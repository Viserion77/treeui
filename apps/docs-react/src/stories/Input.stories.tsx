import type { Meta, StoryObj } from '@storybook/react-vite';
import { TInput } from '@treeui/react';

const meta = {
  title: 'Components/Input',
  component: TInput,
  tags: ['autodocs'],
  args: { placeholder: 'teammate@example.com' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'not-an-email' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'locked@example.com' } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: '0.75rem', width: 280 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <TInput key={size} {...args} size={size} placeholder={`size: ${size}`} />
      ))}
    </div>
  ),
};
