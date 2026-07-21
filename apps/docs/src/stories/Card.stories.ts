import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TCard, treeCardVariants, treeSizes } from '@treeui/vue';
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
