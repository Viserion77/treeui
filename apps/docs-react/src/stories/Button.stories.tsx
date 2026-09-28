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
    tone: {
      control: 'select',
      options: [undefined, 'neutral', 'brand', 'accent', 'success', 'warning', 'danger', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    block: { control: 'boolean' },
    align: { control: 'select', options: ['start', 'center', 'end'] },
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

/**
 * `tone` is a second axis, orthogonal to `variant`: the shape stays the shape
 * and the tone decides the colour. On `solid` it fills.
 */
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {(['neutral', 'brand', 'accent', 'success', 'warning', 'danger', 'info'] as const).map(
        (tone) => (
          <TButton key={tone} {...args} tone={tone}>
            {tone}
          </TButton>
        ),
      )}
    </div>
  ),
};

/**
 * A destructive action that is not the primary action of its row. On `ghost` and
 * `outline` the tone inks only the label and the border, so "Delete" reads as
 * destructive without outweighing the buttons beside it — which is the case
 * `variant="danger"` cannot express, since a filled red block is the only thing
 * it can be. `variant="danger"` is deprecated for that reason and warns in
 * development; `variant="solid" tone="danger"` is the filled spelling.
 */
export const QuietDestructive: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <TButton {...args} variant="ghost">
        Cancel
      </TButton>
      <TButton {...args} variant="ghost" tone="danger">
        Delete repository
      </TButton>
      <TButton {...args} variant="outline" tone="danger">
        Revoke access
      </TButton>
      <TButton {...args} variant="solid" tone="danger">
        Delete everything
      </TButton>
    </div>
  ),
};

/**
 * `block` stretches the button to its container; `align` then decides where the
 * content sits, which only means anything once the button is wider than its
 * content. `center` is the default and emits no class.
 */
export const BlockAndAlignment: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: '0.5rem', maxWidth: '20rem' }}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <TButton key={align} {...args} block align={align} variant="ghost">
          Align {align}
        </TButton>
      ))}
      <TButton {...args} block>
        Full-width primary action
      </TButton>
    </div>
  ),
};
