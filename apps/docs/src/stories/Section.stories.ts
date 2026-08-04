import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TSection, TTag, TText } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/Section',
  component: TSection,
  parameters: {
    docs: { description: { component: practiceNote('TSection') } },
  },
  tags: ['autodocs'],
  args: {
    as: 'section',
    rhythm: 'default',
    banded: false,
    container: 'lg',
    padded: true,
  },
  argTypes: {
    rhythm: { control: 'select', options: ['tight', 'default', 'loose'] },
    container: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full', 'none'] },
    accent: {
      control: 'select',
      options: [undefined, 'brand', 'neutral', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof TSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSection, TText },
    setup: () => ({ args }),
    template: `
      <TSection v-bind="args">
        <TText as="h2" size="title">Built for teams</TText>
        <TText measure="prose" tone="muted">
          The section owns the vertical rhythm and the band; the reading column is the
          TContainer it nests inside.
        </TText>
      </TSection>
    `,
  }),
};

export const Rhythm: Story = {
  render: () => ({
    components: { TSection, TText },
    template: `
      <div>
        <TSection rhythm="tight" banded><TText weight="semibold">rhythm="tight"</TText></TSection>
        <TSection rhythm="default"><TText weight="semibold">rhythm="default"</TText></TSection>
        <TSection rhythm="loose" banded><TText weight="semibold">rhythm="loose"</TText></TSection>
      </div>
    `,
  }),
};

export const BandedAlternation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The band is full-bleed because the section spans its parent and carries the background itself. No `100vw`, no negative margin — both overflow horizontally as soon as the platform paints a classic scrollbar.',
      },
    },
  },
  render: () => ({
    components: { TSection, TText },
    template: `
      <div>
        <TSection><TText as="h2" size="title">Plain</TText></TSection>
        <TSection banded><TText as="h2" size="title">Banded</TText></TSection>
        <TSection><TText as="h2" size="title">Plain</TText></TSection>
        <TSection banded><TText as="h2" size="title">Banded</TText></TSection>
      </div>
    `,
  }),
};

export const AccentAxis: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A section declares the accent once and its whole subtree inherits it through `--tree-color-accent-*`. Closed axis — a product picks a tone, never a hex. Here the same `TTag tone="accent"` follows each section.',
      },
    },
  },
  render: () => ({
    components: { TSection, TTag, TText },
    template: `
      <div>
        <TSection banded>
          <TText weight="semibold">no accent — the secondary brand accent</TText>
          <div style="margin-top: 0.75rem;"><TTag tone="accent" variant="soft">Tech house</TTag></div>
        </TSection>
        <TSection accent="success">
          <TText weight="semibold">accent="success"</TText>
          <div style="margin-top: 0.75rem;"><TTag tone="accent" variant="soft">Tech house</TTag></div>
        </TSection>
        <TSection banded accent="info">
          <TText weight="semibold">accent="info"</TText>
          <div style="margin-top: 0.75rem;"><TTag tone="accent" variant="soft">Tech house</TTag></div>
        </TSection>
      </div>
    `,
  }),
};

export const WithoutContainer: Story = {
  parameters: {
    docs: {
      description: {
        story: '`container="none"` drops the inner TContainer for a section that manages its own column.',
      },
    },
  },
  render: () => ({
    components: { TSection, TText },
    template: `
      <TSection container="none" banded>
        <div style="padding-inline: 1rem;">
          <TText weight="semibold">Edge-to-edge content</TText>
        </div>
      </TSection>
    `,
  }),
};
