import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TText } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Text',
  component: TText,
  tags: ['autodocs'],
  args: {
    as: 'span',
    size: 'md',
    tone: 'default',
    weight: 'regular',
    truncate: false,
  },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] },
    tone: { control: 'select', options: ['default', 'muted', 'inverse', 'brand'] },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
    truncate: { control: 'boolean' },
  },
} satisfies Meta<typeof TText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TText },
    setup: () => ({ args }),
    template: `<TText v-bind="args">The quick brown fox jumps over the lazy dog</TText>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TText },
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] }),
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <TText v-for="s in sizes" :key="s" :size="s">Aa — size {{ s }}</TText>
      </div>
    `,
  }),
};

export const TonesAndWeights: Story = {
  render: () => ({
    components: { TText },
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <TText tone="default" weight="semibold">Default, semibold</TText>
        <TText tone="muted">Muted secondary text</TText>
        <TText tone="brand" weight="medium">Brand, medium</TText>
        <TText as="p" weight="bold" size="lg">A bold paragraph heading</TText>
      </div>
    `,
  }),
};

export const Truncated: Story = {
  render: () => ({
    components: { TText },
    template: `
      <div style="max-width: 14rem; border: 1px dashed var(--tree-color-border-default); padding: 0.5rem;">
        <TText truncate>This is a very long single line that will be clipped with an ellipsis</TText>
      </div>
    `,
  }),
};

export const PreserveWhitespace: Story = {
  render: () => ({
    components: { TText },
    setup: () => ({
      answer: 'Resumo do dia:\n\n- Tres feitos concluidos\n- Um bloqueio aberto\n\nSegue amanha.',
    }),
    template: `
      <div style="display: grid; gap: 1rem; max-width: 28rem;">
        <div style="border: 1px dashed var(--tree-color-border-default); padding: 0.5rem;">
          <TText as="p" preserve-whitespace>{{ answer }}</TText>
        </div>
        <div style="border: 1px dashed var(--tree-color-border-default); padding: 0.5rem;">
          <TText as="p">{{ answer }}</TText>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Above: line breaks preserved. Below: the same string collapsed into one paragraph.
        </div>
      </div>
    `,
  }),
};

export const MonospaceFamily: Story = {
  render: () => ({
    components: { TText },
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <TText family="mono">arn:aws:sqs:us-east-1:000000000000:orders</TText>
        <TText family="mono" size="sm" tone="muted">i-0a1b2c3d4e5f · 2026-07-21T14:03:11Z</TText>
        <TText>Body text stays in the sans family for comparison.</TText>
      </div>
    `,
  }),
};
