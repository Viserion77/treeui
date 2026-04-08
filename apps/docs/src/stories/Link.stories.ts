import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TLink } from '@treeui/vue';

const meta = {
  title: 'Components/Navigation/Link',
  component: TLink,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    disabled: false,
    external: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'danger'],
    },
  },
} satisfies Meta<typeof TLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TLink },
    setup: () => ({ args }),
    template: `
      <p style="font-size: var(--tree-font-size-md); color: var(--tree-color-text-primary); font-family: var(--tree-font-family-sans);">
        Read the <TLink v-bind="args" href="#">documentation</TLink> for more details.
      </p>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TLink },
    template: `
      <div style="display: grid; gap: 1rem; font-family: var(--tree-font-family-sans); font-size: var(--tree-font-size-md); color: var(--tree-color-text-primary);">
        <p style="margin: 0;">Default: <TLink href="#">View project</TLink></p>
        <p style="margin: 0;">Muted: <TLink href="#" variant="muted">View project</TLink></p>
        <p style="margin: 0;">Danger: <TLink href="#" variant="danger">Delete account</TLink></p>
        <p style="margin: 0;">Disabled: <TLink href="#" disabled>Unavailable</TLink></p>
      </div>
    `,
  }),
};

export const ExternalLink: Story = {
  render: () => ({
    components: { TLink },
    template: `
      <p style="font-size: var(--tree-font-size-md); color: var(--tree-color-text-primary); font-family: var(--tree-font-family-sans);">
        Visit <TLink href="https://github.com" external>GitHub</TLink> to learn more.
      </p>
    `,
  }),
};
