import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TCard, TIcon, TIconTile, TStack, TText } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Data Display/IconTile',
  component: TIconTile,
  parameters: {
    docs: { description: { component: practiceNote('TIconTile') } },
  },
  tags: ['autodocs'],
  args: { name: 'fingerprint', tone: 'brand', size: 'md' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['brand', 'neutral', 'success', 'warning', 'danger', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
} satisfies Meta<typeof TIconTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => ({
    components: { TIconTile, TStack },
    setup: () => ({
      tones: ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const,
    }),
    template: `
      <TStack direction="horizontal" gap="var(--tree-space-3)">
        <TIconTile v-for="t in tones" :key="t" name="shield-check" :tone="t" />
      </TStack>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TIconTile, TStack },
    template: `
      <TStack direction="horizontal" gap="var(--tree-space-3)" align="center">
        <TIconTile name="users-round" size="sm" />
        <TIconTile name="users-round" size="md" />
        <TIconTile name="users-round" size="lg" />
      </TStack>
    `,
  }),
};

export const WhyNotABareIcon: Story = {
  name: 'Why not a bare TIcon',
  parameters: {
    docs: {
      description: {
        story:
          'A bare `TIcon` inherits the text colour, carries a flat 2px stroke and has no ground behind it. On a feature card at phone size that reads as a grey scratch rather than a glyph — the report that produced this component came with a photo of three such icons on a dark Android screen and the words "you cannot tell what it is". The tile gives the glyph a ground and an ink that is measured against it: `icon-tile-contrast.test.ts` holds every tone to 3:1 in both themes, which is the WCAG 1.4.11 floor for a non-text component. Left of each pair is the bare icon, right is the tile.',
      },
    },
  },
  render: () => ({
    components: { TIcon, TIconTile, TStack },
    setup: () => ({ names: ['fingerprint', 'users-round', 'network-nodes'] }),
    template: `
      <TStack direction="horizontal" gap="var(--tree-space-6)" align="center">
        <TStack v-for="n in names" :key="n" direction="horizontal" gap="var(--tree-space-3)" align="center">
          <TIcon :name="n" :size="26" />
          <TIconTile :name="n" />
        </TStack>
      </TStack>
    `,
  }),
};

export const InAFeatureCard: Story = {
  name: 'In a feature card',
  render: () => ({
    components: { TCard, TIconTile, TStack, TText },
    setup: () => ({
      features: [
        { icon: 'fingerprint', tone: 'brand', title: 'Passwordless', body: 'Sign in with the device the person already trusts.' },
        { icon: 'users-round', tone: 'success', title: 'Shared spaces', body: 'A workspace per team, with its own members and roles.' },
        { icon: 'network-nodes', tone: 'info', title: 'Connected', body: 'Every integration reports into the same activity feed.' },
      ],
    }),
    template: `
      <div style="display: grid; gap: var(--tree-space-4); grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));">
        <TCard v-for="f in features" :key="f.title">
          <TStack gap="var(--tree-space-3)">
            <TIconTile :name="f.icon" :tone="f.tone" size="lg" />
            <TText as="h3" size="lg" weight="semibold">{{ f.title }}</TText>
            <TText tone="muted" size="sm">{{ f.body }}</TText>
          </TStack>
        </TCard>
      </div>
    `,
  }),
};
