import type { Meta, StoryObj } from '@storybook/react-vite';
import { TButton } from '@treeui/react';

const meta = {
  title: 'Components/Button',
  component: TButton,
  tags: ['autodocs'],
  args: { children: 'Invite teammate' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'soft', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = { args: { variant: 'solid' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Loading: Story = { args: { loading: true } };

/**
 * `iconOnly` drops the visible label and renders a square control matching the
 * size token, so the button needs an explicit `aria-label` for its name.
 */
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    'aria-label': 'Add teammate',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    ),
  },
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {(['solid', 'outline', 'ghost', 'soft', 'danger'] as const).map((variant) => (
        <TButton key={variant} {...args} variant={variant}>
          {variant}
        </TButton>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <TButton key={size} {...args} size={size}>
          {size}
        </TButton>
      ))}
    </div>
  ),
};
