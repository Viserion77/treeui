import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TAppShell, TNavMenu, TSkipLink, TText } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Navigation/SkipLink',
  component: TSkipLink,
  parameters: {
    docs: {
      description: {
        component: [
          '"Skip to content" — the first focusable element of a page with navigation, and the one control that has to be hidden and visible at the same time.',
          '',
          '`.t-visually-hidden` is the wrong tool here: it hides an element forever, and a permanently invisible skip link is useless to exactly the person it exists for, the sighted keyboard user. So the link parks off-screen with a transform and rides back in on `:focus-visible`.',
          '',
          '**Press Tab inside a story below to reveal it.**',
          '',
          practiceNote('TSkipLink'),
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
  args: {
    href: '#story-content',
  },
} satisfies Meta<typeof TSkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSkipLink, TText },
    setup: () => ({ args }),
    template: `
      <div>
        <TSkipLink v-bind="args">Skip to content</TSkipLink>
        <nav style="display: flex; gap: 0.75rem; padding-block: 0.5rem;">
          <a href="#a">Product</a>
          <a href="#b">Docs</a>
          <a href="#c">Pricing</a>
        </nav>
        <main id="story-content">
          <TText>
            Tab into this story: the skip link appears first, and activating it moves focus here —
            with no stray outline, because the component marks its own target.
          </TText>
        </main>
      </div>
    `,
  }),
};

export const InsideTheAppShell: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The shell has the same hole and closes it with `skipLinkLabel`: pass the localized copy and TAppShell renders the link pointing at its own `<main>`, wiring the target for you. It is opt-in only because the label is user-facing copy, and the library ships none.',
      },
    },
  },
  render: () => ({
    components: { TAppShell, TNavMenu, TText },
    template: `
      <div style="block-size: 340px; overflow: hidden; border-radius: 0.75rem;">
        <TAppShell skip-link-label="Pular para o conteúdo">
          <template #header><strong>Dashboard</strong></template>
          <template #sidebar>
            <TNavMenu
              aria-label="Main"
              :items="[
                { label: 'Overview', value: 'overview' },
                { label: 'Reports', value: 'reports' },
              ]"
            />
          </template>
          <TText>Tab from the top of this frame: the skip link comes before the menu button.</TText>
        </TAppShell>
      </div>
    `,
  }),
};
