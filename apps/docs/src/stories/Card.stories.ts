import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TCard, TCodeBlock, TText, treeCardVariants, treeSizes } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Data Display/Card',
  component: TCard,
  parameters: {
    docs: { description: { component: practiceNote('TCard') } },
  },
  tags: ['autodocs'],
  args: {
    variant: 'outline',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'select',
      // Sourced from the contract so the control cannot drift from the type.
      options: [...treeCardVariants],
    },
    size: {
      control: 'select',
      // Sourced from the contract so the control cannot drift from the type.
      options: [...treeSizes],
    },
  },
} satisfies Meta<typeof TCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TBadge, TButton, TCard },
    setup: () => ({ args }),
    template: `
      <div style="width: 360px;">
        <TCard v-bind="args">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <strong>TreeUI release plan</strong>
              <TBadge size="sm">Ready</TBadge>
            </div>
          </template>

          <p style="margin: 0;">
            Ship a compact, accessible component library foundation for Vue 3.
          </p>

          <template #footer>
            <div style="display: flex; justify-content: flex-end;">
              <TButton size="sm" variant="outline">Review</TButton>
            </div>
          </template>
        </TCard>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TCard },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 360px;">
        <TCard variant="outline" title="Outline">
          <p style="margin: 0;">Default surface — bordered card on the page background.</p>
        </TCard>
        <TCard variant="soft" title="Soft">
          <p style="margin: 0;">Subtle filled surface for secondary or grouped content.</p>
        </TCard>
        <TCard variant="inset" title="Inset">
          <p style="margin: 0;">Recessed surface, meant to sit inside another card.</p>
        </TCard>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TCard },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 360px;">
        <TCard size="sm" title="Small">
          <p style="margin: 0;">Compact padding for dense layouts.</p>
        </TCard>
        <TCard size="md" title="Medium">
          <p style="margin: 0;">Default padding.</p>
        </TCard>
        <TCard size="lg" title="Large">
          <p style="margin: 0;">Roomy padding for hero or standalone cards.</p>
        </TCard>
      </div>
    `,
  }),
};

export const TitleWithActions: Story = {
  render: () => ({
    components: { TButton, TCard },
    template: `
      <div style="width: 360px;">
        <TCard title="Pool Semanal">
          <template #actions>
            <TButton size="sm" variant="danger">Fechar</TButton>
          </template>
          <p style="margin: 0;">
            Card with title prop and actions slot — no manual header markup needed.
          </p>
        </TCard>
      </div>
    `,
  }),
};

export const InsetVariant: Story = {
  render: () => ({
    components: { TCard },
    template: `
      <div style="width: 400px;">
        <TCard title="Parent Card">
          <p style="margin: 0;">Outer card with a nested inset sub-section.</p>
          <TCard variant="inset" size="sm">
            <p style="margin: 0;">This is an inset sub-section inside another card.</p>
          </TCard>
          <TCard variant="inset" size="sm">
            <p style="margin: 0;">Another inset sub-section for grouped content.</p>
          </TCard>
        </TCard>
      </div>
    `,
  }),
};

export const HeaderSlotWithActions: Story = {
  render: () => ({
    components: { TBadge, TButton, TCard },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 360px;">
        <TCard>
          <template #header>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <strong>Custom header</strong>
              <TBadge size="sm" tone="info">Beta</TBadge>
            </div>
          </template>
          <template #actions>
            <TButton size="sm" variant="ghost">Edit</TButton>
          </template>
          <p style="margin: 0;">
            The header slot replaces the title fallback and still sits next to the actions slot.
          </p>
        </TCard>

        <TCard>
          <template #actions>
            <TButton size="sm" variant="ghost">Edit</TButton>
          </template>
          <p style="margin: 0;">
            Actions alone also render the header, with no title and no header slot.
          </p>
        </TCard>
      </div>
    `,
  }),
};

export const TitleWithFooter: Story = {
  render: () => ({
    components: { TButton, TCard },
    template: `
      <div style="width: 360px;">
        <TCard title="Invite teammates">
          <p style="margin: 0;">
            Card combining the title prop with a footer slot.
          </p>
          <template #footer>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
              <TButton size="sm" variant="ghost">Cancel</TButton>
              <TButton size="sm" variant="solid">Send invites</TButton>
            </div>
          </template>
        </TCard>
      </div>
    `,
  }),
};

export const PolymorphicRoot: Story = {
  render: () => ({
    components: { TCard },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 360px;">
        <TCard title="Default root">
          <p style="margin: 0;">Renders as &lt;section&gt;.</p>
        </TCard>
        <TCard as="article" title="Article root">
          <p style="margin: 0;">
            <code>as="article"</code> renders a self-contained &lt;article&gt; instead.
          </p>
        </TCard>
        <TCard as="aside" title="Aside root">
          <p style="margin: 0;">
            <code>as="aside"</code> for complementary side content.
          </p>
        </TCard>
      </div>
    `,
  }),
};

export const InteractiveLink: Story = {
  render: () => ({
    components: { TCard, TText },
    template: `
      <TCard as="a" href="#lambda" interactive variant="outline" style="max-width: 22rem;">
        <TText weight="semibold">orders-processor</TText>
        <TText tone="muted" size="sm">Lambda · us-east-1 · 128 MB</TText>
      </TCard>
    `,
  }),
};

export const SurfaceContainment: Story = {
  name: 'An unbreakable descendant cannot inflate the card',
  parameters: {
    docs: {
      description: {
        story:
          "The card and its body declare `grid-template-columns: minmax(0, 1fr)`. An implicit `auto` track takes its minimum from the min-content of its items, so one descendant that cannot break — a code block, a table, a machine string — used to widen the whole card and lay every sibling out at that width: the title never truncated, a table's wrapper never scrolled, and the actions were painted past the border or over the next card. Both cards below sit in a 22rem frame; the unbreakable URL now scrolls or wraps inside the card rather than moving it.",
      },
    },
  },
  render: () => ({
    components: { TBadge, TButton, TCard, TCodeBlock, TText },
    setup: () => ({
      url: 'http://localhost:3085/public/v1/mesh/sync/01a0e0d4-8f80-719b-8e11-88256b0401aa',
    }),
    template: `
      <div style="display: grid; gap: 1rem; inline-size: 22rem;">
        <TCard title="Paired device">
          <template #actions>
            <TButton size="sm" variant="ghost">Revoke</TButton>
            <TButton size="sm" variant="solid" tone="danger">Remove</TButton>
          </template>
          <TCodeBlock :code="url" wrap label="Device endpoint" />
          <TText tone="muted" size="sm">The actions stay inside the border, and wrap when they must.</TText>
        </TCard>

        <TCard title="relatorio_financeiro_consolidado_2026Q3_APROVADA_v12.pdf">
          <template #actions><TBadge tone="success">Ready</TBadge></template>
          <TText tone="muted" size="sm">A title without spaces wraps rather than setting the card's width.</TText>
        </TCard>
      </div>
    `,
  }),
};
