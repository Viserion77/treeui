import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TButton, THero, TTag, TText } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/Hero',
  component: THero,
  parameters: {
    docs: { description: { component: practiceNote('THero') } },
  },
  tags: ['autodocs'],
  args: {
    as: 'section',
    glow: true,
    container: 'lg',
    padded: true,
  },
  argTypes: {
    container: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full', 'none'] },
    accent: {
      control: 'select',
      options: [undefined, 'brand', 'neutral', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof THero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, THero, TText },
    setup: () => ({ args }),
    template: `
      <THero v-bind="args">
        <TText as="h1" size="display">Ship the interface, not the CSS</TText>
        <TText measure="lead" tone="muted" style="margin-block: 0.75rem 1.5rem;">
          One system for every product surface — alignment, states and accessibility included.
        </TText>
        <TButton variant="brand">Get started</TButton>
      </THero>
    `,
  }),
};

export const WithBackdrop: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The product supplies the art; the library guarantees the box. The backdrop is clipped to the band and is `pointer-events: none`, so the click on the CTA below reaches the button even though the decoration paints over that area.',
      },
    },
  },
  render: () => ({
    components: { TButton, THero, TText },
    template: `
      <THero accent="brand">
        <template #backdrop>
          <div style="position: absolute; inset: -20% -10%; background:
            repeating-linear-gradient(115deg, color-mix(in srgb, var(--tree-color-accent-primary) 18%, transparent) 0 2px, transparent 2px 22px);"></div>
        </template>
        <TText as="h1" size="display">Decoration never eats the click</TText>
        <TText measure="lead" tone="muted" style="margin-block: 0.75rem 1.5rem;">
          The backdrop covers this whole band and the button still works.
        </TText>
        <TButton variant="solid">Try clicking me</TButton>
      </THero>
    `,
  }),
};

export const AccentAndGlow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `glow` halo is the only part of a hero backdrop that is 100% tokens: a radial gradient derived from whatever accent is in scope.',
      },
    },
  },
  render: () => ({
    components: { THero, TTag, TText },
    template: `
      <div>
        <THero glow>
          <TTag tone="accent" variant="soft">default accent</TTag>
          <TText as="h1" size="title" style="margin-top: 0.75rem;">Secondary brand accent</TText>
        </THero>
        <THero glow accent="success">
          <TTag tone="accent" variant="soft">accent="success"</TTag>
          <TText as="h1" size="title" style="margin-top: 0.75rem;">The halo follows the axis</TText>
        </THero>
      </div>
    `,
  }),
};
