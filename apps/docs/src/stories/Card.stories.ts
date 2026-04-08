import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TCard } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Card',
  component: TCard,
  tags: ['autodocs'],
  args: {
    variant: 'outline',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'soft', 'solid', 'inset'],
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
