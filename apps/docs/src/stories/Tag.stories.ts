import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TSection, TTag } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Data Display/Tag',
  component: TTag,
  parameters: {
    docs: { description: { component: practiceNote('TTag') } },
  },
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    size: 'md',
    removable: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'soft'] },
    tone: {
      control: 'select',
      options: [undefined, 'neutral', 'brand', 'accent', 'success', 'warning', 'danger', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    removable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTag },
    setup: () => ({ args }),
    template: `<TTag v-bind="args">Label</TTag>`,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TTag variant="solid">Solid</TTag>
        <TTag variant="outline">Outline</TTag>
        <TTag variant="soft">Soft</TTag>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
        <TTag size="sm">Small</TTag>
        <TTag size="md">Medium</TTag>
        <TTag size="lg">Large</TTag>
      </div>
    `,
  }),
};

export const Removable: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TTag removable variant="solid">Solid</TTag>
        <TTag removable variant="outline">Outline</TTag>
        <TTag removable variant="soft">Soft</TTag>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TTag disabled>Disabled</TTag>
        <TTag disabled removable>Disabled removable</TTag>
      </div>
    `,
  }),
};

export const Tones: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The tone axis is orthogonal to `variant` and closed — never a free colour, the same policy TLinkTile states. Omitted, the tag keeps its pre-tone look (brand `solid`, neutral `outline` and `soft`), so `tone` is purely additive.',
      },
    },
  },
  render: () => ({
    components: { TTag },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <TTag variant="soft" tone="neutral">Neutral</TTag>
          <TTag variant="soft" tone="brand">Brand</TTag>
          <TTag variant="soft" tone="accent">Accent</TTag>
          <TTag variant="soft" tone="success">Success</TTag>
          <TTag variant="soft" tone="warning">Warning</TTag>
          <TTag variant="soft" tone="danger">Danger</TTag>
          <TTag variant="soft" tone="info">Info</TTag>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <TTag variant="solid" tone="neutral">Neutral</TTag>
          <TTag variant="solid" tone="brand">Brand</TTag>
          <TTag variant="solid" tone="accent">Accent</TTag>
          <TTag variant="solid" tone="success">Success</TTag>
          <TTag variant="solid" tone="warning">Warning</TTag>
          <TTag variant="solid" tone="danger">Danger</TTag>
          <TTag variant="solid" tone="info">Info</TTag>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <TTag variant="outline" tone="neutral">Neutral</TTag>
          <TTag variant="outline" tone="brand">Brand</TTag>
          <TTag variant="outline" tone="accent">Accent</TTag>
          <TTag variant="outline" tone="success">Success</TTag>
          <TTag variant="outline" tone="warning">Warning</TTag>
          <TTag variant="outline" tone="danger">Danger</TTag>
          <TTag variant="outline" tone="info">Info</TTag>
        </div>
      </div>
    `,
  }),
};

export const AccentFollowsTheSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`tone="accent"` reads the accent in scope rather than a fixed colour, so the same tag follows a surface that declares one. Left alone, it is the secondary brand accent the tokens ship.',
      },
    },
  },
  render: () => ({
    components: { TSection, TTag },
    template: `
      <div>
        <TSection rhythm="tight" container="none">
          <TTag tone="accent">default accent</TTag>
        </TSection>
        <TSection rhythm="tight" container="none" accent="success">
          <TTag tone="accent">inside accent="success"</TTag>
        </TSection>
        <TSection rhythm="tight" container="none" accent="warning">
          <TTag tone="accent">inside accent="warning"</TTag>
        </TSection>
      </div>
    `,
  }),
};
