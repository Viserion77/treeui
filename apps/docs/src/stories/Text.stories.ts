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
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'display', 'title', 'overline'],
    },
    tone: { control: 'select', options: ['default', 'muted', 'inverse', 'brand'] },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
    measure: { control: 'select', options: [undefined, 'lead', 'prose'] },
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
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] }),
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <TText v-for="s in sizes" :key="s" :size="s">Aa — size {{ s }}</TText>
      </div>
    `,
  }),
};

export const MarketingTypography: Story = {
  render: () => ({
    components: { TText },
    template: `
      <div style="display: grid; gap: 1.5rem;">
        <div style="display: grid; gap: 0.5rem;">
          <TText size="overline" tone="brand">Foundation</TText>
          <TText as="h1" size="display">Ship clarity by default</TText>
          <TText as="p" measure="lead" tone="muted">
            A responsive hero step that scales with the viewport — no clamp() in the consumer.
          </TText>
        </div>
        <div style="display: grid; gap: 0.5rem;">
          <TText as="h2" size="title">A section heading</TText>
          <TText as="p" measure="prose">
            The title step clamps xl→4xl and stays below display at every width, so a section
            heading never out-sizes the hero on a narrow screen. Reading measure caps the line
            length in ch for legibility.
          </TText>
        </div>
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

export const StatusTones: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A sentence that IS the state — the error line under a field, the green "connected" beside a resource — is not a `TAlert` (a box with an icon and the weight of an announcement) and not a `TBadge`/`TTag` (a pill, when the datum is prose). Without these tones the only way to say "this failed" in text was local CSS. They read `--tree-color-status-*`, so they follow the theme.',
      },
    },
  },
  render: () => ({
    components: { TText },
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <TText size="sm" tone="danger">Could not reach the endpoint.</TText>
        <TText size="sm" tone="success">Connected.</TText>
        <TText size="sm" tone="warning">Credential expires in 3 days.</TText>
        <TText size="sm" tone="info">Replaying from the last checkpoint.</TText>
      </div>
    `,
  }),
};

export const BreakingMachineStrings: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An ARN, an API key or a hash is one long word with no break opportunity: it overflows its box. `truncate` is the wrong answer when the string IS the thing the reader came to copy — an ellipsis makes an id useless — so `wrap` breaks it instead.',
      },
    },
  },
  render: () => ({
    components: { TText },
    template: `
      <div style="display: grid; gap: 1rem; max-width: 260px;">
        <TText family="mono" size="sm" wrap="anywhere">
          arn:aws:secretsmanager:us-east-1:000000000000:secret:minha-secret-AbCdEf
        </TText>
        <TText family="mono" size="sm" truncate>
          arn:aws:secretsmanager:us-east-1:000000000000:secret:minha-secret-AbCdEf
        </TText>
      </div>
    `,
  }),
};

export const ResponsiveSteps: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three responsive steps that stay ordered at every width. Two steps sharing a slope collapse into each other below the smaller one\'s cap — they separate only where the screen is already wide — so `subtitle` climbs slower (2.5vw) rather than merely capping lower. Resize the preview.',
      },
    },
  },
  render: () => ({
    components: { TText },
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <TText as="h1" size="display" measure="headline" balance>Ship the interface</TText>
        <TText as="h2" size="title">A section heading</TText>
        <TText as="h3" size="subtitle">The heading under it</TText>
      </div>
    `,
  }),
};
